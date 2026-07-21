import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import axios from "axios";
import { Client } from "ssh2";
import { CLOUD_SHELL_START_TIMEOUT_MS, SSH_EXEC_TIMEOUT_MS } from "./constants.js";

const API_BASE = "https://cloudshell.googleapis.com/v1";
const ENVIRONMENT_NAME = "users/me/environments/default";

export type CloudShellState = "STATE_UNSPECIFIED" | "SUSPENDED" | "PENDING" | "RUNNING" | "DELETING";

export interface CloudShellEnvironment {
  name: string;
  id: string;
  dockerImage: string;
  state: CloudShellState;
  sshHost?: string;
  sshPort?: number;
  sshUsername?: string;
  webHost?: string;
  publicKeys?: string[];
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEnvironment(accessToken: string): Promise<CloudShellEnvironment> {
  const { data } = await axios.get<CloudShellEnvironment>(`${API_BASE}/${ENVIRONMENT_NAME}`, {
    headers: authHeaders(accessToken)
  });
  return data;
}

async function startEnvironment(accessToken: string): Promise<void> {
  await axios.post(`${API_BASE}/${ENVIRONMENT_NAME}:start`, {}, { headers: authHeaders(accessToken) });
}

async function addPublicKey(accessToken: string, key: string): Promise<void> {
  await axios.post(`${API_BASE}/${ENVIRONMENT_NAME}:addPublicKey`, { key }, { headers: authHeaders(accessToken) });
}

/** Starts the environment if needed and waits until it is reachable over SSH. */
export async function ensureRunningEnvironment(accessToken: string): Promise<CloudShellEnvironment> {
  let env = await getEnvironment(accessToken);
  if (env.state === "RUNNING" && env.sshHost) {
    return env;
  }
  if (env.state === "SUSPENDED" || env.state === "STATE_UNSPECIFIED") {
    await startEnvironment(accessToken);
  }

  const deadline = Date.now() + CLOUD_SHELL_START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(3000);
    env = await getEnvironment(accessToken);
    if (env.state === "RUNNING" && env.sshHost) {
      return env;
    }
  }
  throw new Error(`Cloud Shell environment did not reach RUNNING state in time (last state: ${env.state}).`);
}

const KEY_DIR = path.join(os.tmpdir(), "cloud-shell-mcp-ssh");
const PRIVATE_KEY_PATH = path.join(KEY_DIR, "id_ed25519");
const PUBLIC_KEY_PATH = `${PRIVATE_KEY_PATH}.pub`;

/**
 * Generates (once per container instance) the ephemeral SSH keypair used to
 * connect to Cloud Shell. The public half is registered with the environment
 * before every command via addPublicKey; the private half never leaves this
 * process.
 */
function ensureKeyPair(): { privateKey: string; publicKey: string } {
  if (!existsSync(PUBLIC_KEY_PATH)) {
    mkdirSync(KEY_DIR, { recursive: true });
    execFileSync("ssh-keygen", ["-t", "ed25519", "-f", PRIVATE_KEY_PATH, "-N", "", "-C", "cloud-shell-mcp-server"]);
  }
  return {
    privateKey: readFileSync(PRIVATE_KEY_PATH, "utf8"),
    publicKey: readFileSync(PUBLIC_KEY_PATH, "utf8").trim()
  };
}

function sshExec(
  host: string,
  port: number,
  username: string,
  privateKey: string,
  command: string,
  timeoutMs: number
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      conn.end();
      reject(new Error(`SSH command timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    conn
      .on("ready", () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            clearTimeout(timer);
            settled = true;
            conn.end();
            reject(err);
            return;
          }
          stream
            .on("close", (code: number | null) => {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              conn.end();
              resolve({ stdout, stderr, exitCode: code ?? 0 });
            })
            .on("data", (data: Buffer) => {
              stdout += data.toString("utf8");
            })
            .stderr.on("data", (data: Buffer) => {
              stderr += data.toString("utf8");
            });
        });
      })
      .on("error", (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      })
      .connect({ host, port, username, privateKey, readyTimeout: 20000 });
  });
}

/**
 * Runs a shell command inside the caller's Cloud Shell VM. Starts the
 * environment if it is suspended and waits for it to come up.
 */
export async function runCloudShellCommand(
  accessToken: string,
  command: string,
  timeoutMs: number = SSH_EXEC_TIMEOUT_MS
): Promise<CommandResult> {
  const env = await ensureRunningEnvironment(accessToken);
  if (!env.sshHost || !env.sshPort || !env.sshUsername) {
    throw new Error("Cloud Shell environment is RUNNING but did not return SSH connection details.");
  }

  const { privateKey, publicKey } = ensureKeyPair();
  try {
    await addPublicKey(accessToken, publicKey);
  } catch {
    // Most likely the key is already registered from a previous call on this
    // instance - a real auth problem will surface as a connection failure below.
  }

  const attempts = 5;
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await sshExec(env.sshHost, env.sshPort, env.sshUsername, privateKey, command, timeoutMs);
    } catch (error) {
      lastError = error;
      await sleep(2000 * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
