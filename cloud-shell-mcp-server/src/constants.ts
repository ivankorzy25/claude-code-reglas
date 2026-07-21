function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Public URL this server is reachable at, e.g. https://cloud-shell-mcp-xxxx.a.run.app
// (no trailing slash).
export const BASE_URL = requireEnv("BASE_URL").replace(/\/$/, "");

export const GOOGLE_CLIENT_ID = requireEnv("GOOGLE_CLIENT_ID");
export const GOOGLE_CLIENT_SECRET = requireEnv("GOOGLE_CLIENT_SECRET");

// Optional: restrict logins to a single Google account (recommended for a
// personal connector that grants Cloud Platform access).
export const ALLOWED_GOOGLE_ACCOUNT = process.env.ALLOWED_GOOGLE_ACCOUNT?.toLowerCase();

export const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/cloud-platform"
];

export const GOOGLE_CALLBACK_PATH = "/oauth/google/callback";
export const MCP_PATH = "/mcp";

export const PORT = parseInt(process.env.PORT || "8080", 10);

// Use an in-memory store instead of Firestore (local development only - state
// is lost on restart and won't work across multiple instances).
export const USE_MEMORY_STORE = process.env.MEMORY_STORE === "1";

export const CHARACTER_LIMIT = 20000;

// How long a command is allowed to run over SSH before we give up.
export const SSH_EXEC_TIMEOUT_MS = 2 * 60 * 1000;
export const CLOUD_SHELL_START_TIMEOUT_MS = 100 * 1000;
