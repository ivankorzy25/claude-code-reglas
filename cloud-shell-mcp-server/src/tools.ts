import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import type { ServerNotification, ServerRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { refreshGoogleAccessToken } from "./google.js";
import { ensureRunningEnvironment, getEnvironment, runCloudShellCommand } from "./cloudShell.js";
import { CHARACTER_LIMIT, SSH_EXEC_TIMEOUT_MS } from "./constants.js";

type ToolExtra = RequestHandlerExtra<ServerRequest, ServerNotification>;

function truncate(text: string): { text: string; truncated: boolean } {
  if (text.length <= CHARACTER_LIMIT) {
    return { text, truncated: false };
  }
  return { text: `${text.slice(0, CHARACTER_LIMIT)}\n...[truncated]`, truncated: true };
}

/**
 * Every MCP tool call carries the caller's Google refresh token in
 * extra.authInfo.extra (attached by CloudShellOAuthProvider.verifyAccessToken
 * via the bearer-auth middleware in index.ts). We exchange it for a
 * short-lived Google access token on every call rather than caching one,
 * since Cloud Shell tool calls are infrequent and this avoids any stale-token
 * edge cases.
 */
async function googleAccessTokenFor(extra: ToolExtra): Promise<string> {
  const refreshToken = extra.authInfo?.extra?.googleRefreshToken;
  if (typeof refreshToken !== "string") {
    throw new Error("Not authenticated with Google - reconnect this connector from claude.ai.");
  }
  const { accessToken } = await refreshGoogleAccessToken(refreshToken);
  return accessToken;
}

function errorText(error: unknown): string {
  return `Error: ${error instanceof Error ? error.message : String(error)}`;
}

export function buildMcpServer(): McpServer {
  const server = new McpServer({ name: "cloud-shell-mcp-server", version: "1.0.0" });

  server.registerTool(
    "cloud_shell_status",
    {
      title: "Cloud Shell Status",
      description: `Get the current status of the user's Google Cloud Shell environment (users/me/environments/default), without starting it.

Returns:
  - state: one of SUSPENDED, PENDING, RUNNING, DELETING, STATE_UNSPECIFIED
  - dockerImage: the image the environment runs
  - sshHost / sshPort / sshUsername: SSH connection details, only present while RUNNING

Use when: checking whether the environment is up before deciding whether to start it or run a command.`,
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async (_args: Record<string, never>, extra: ToolExtra) => {
      try {
        const accessToken = await googleAccessTokenFor(extra);
        const env = await getEnvironment(accessToken);
        return {
          content: [{ type: "text", text: JSON.stringify(env, null, 2) }],
          structuredContent: env as unknown as Record<string, unknown>
        };
      } catch (error) {
        return { content: [{ type: "text", text: errorText(error) }], isError: true };
      }
    }
  );

  server.registerTool(
    "cloud_shell_start",
    {
      title: "Start Cloud Shell",
      description: `Starts the user's Google Cloud Shell environment if it is suspended, and waits (up to ~100s) until it is RUNNING and reachable over SSH. If it is already running, returns immediately.

Returns the same Environment fields as cloud_shell_status once RUNNING.

Use when: you are about to run a command with cloud_shell_exec and want to make sure the environment is ready first (cloud_shell_exec also starts it automatically, so calling this first is optional).`,
      inputSchema: {},
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true }
    },
    async (_args: Record<string, never>, extra: ToolExtra) => {
      try {
        const accessToken = await googleAccessTokenFor(extra);
        const env = await ensureRunningEnvironment(accessToken);
        return {
          content: [{ type: "text", text: JSON.stringify(env, null, 2) }],
          structuredContent: env as unknown as Record<string, unknown>
        };
      } catch (error) {
        return { content: [{ type: "text", text: errorText(error) }], isError: true };
      }
    }
  );

  const ExecInputSchema = {
    command: z
      .string()
      .min(1, "command must not be empty")
      .describe("Shell command to run inside the Cloud Shell VM, e.g. \"gcloud projects list\" or \"kubectl get pods\". Runs non-interactively via `bash -lc`."),
    timeout_seconds: z
      .number()
      .int()
      .min(1)
      .max(570)
      .default(Math.floor(SSH_EXEC_TIMEOUT_MS / 1000))
      .describe("Maximum time to wait for the command to finish, in seconds (default 120, max 570).")
  };

  server.registerTool(
    "cloud_shell_exec",
    {
      title: "Run Command in Cloud Shell",
      description: `Runs a shell command inside the user's Google Cloud Shell VM over SSH and returns its stdout, stderr, and exit code.

The Cloud Shell VM has gcloud, kubectl, git, docker, terraform, python, node, and the rest of the standard Cloud Shell image pre-installed, and gcloud/kubectl are already authenticated as the signed-in Google user - no separate login is needed.

Starts the environment automatically if it is suspended (this can take up to ~1 minute the first time).

Args:
  - command (string): the shell command to run, e.g. "gcloud config get-value project"
  - timeout_seconds (number, default 120, max 570): how long to wait for the command to finish

Returns JSON: { "exitCode": number, "stdout": string, "stderr": string }

Error Handling:
  - Returns "Error: ..." text if the environment fails to start, the SSH connection fails after retries, or the command exceeds timeout_seconds.

Examples:
  - Use when: "What GCP project am I in?" -> command="gcloud config get-value project"
  - Use when: "List my GKE clusters" -> command="gcloud container clusters list"
  - Don't use when: you just need to know if the environment is running (use cloud_shell_status instead).`,
      inputSchema: ExecInputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true }
    },
    async ({ command, timeout_seconds }: { command: string; timeout_seconds: number }, extra: ToolExtra) => {
      try {
        const accessToken = await googleAccessTokenFor(extra);
        const result = await runCloudShellCommand(accessToken, command, timeout_seconds * 1000);
        const stdout = truncate(result.stdout);
        const stderr = truncate(result.stderr);
        const output = { exitCode: result.exitCode, stdout: stdout.text, stderr: stderr.text };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output
        };
      } catch (error) {
        return { content: [{ type: "text", text: errorText(error) }], isError: true };
      }
    }
  );

  return server;
}
