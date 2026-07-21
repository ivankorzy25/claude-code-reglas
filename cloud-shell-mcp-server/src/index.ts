#!/usr/bin/env node
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getOAuthProtectedResourceMetadataUrl, mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { ALLOWED_GOOGLE_ACCOUNT, BASE_URL, GOOGLE_CALLBACK_PATH, MCP_PATH, PORT } from "./constants.js";
import { createStore } from "./store.js";
import { CloudShellOAuthProvider } from "./provider.js";
import { emailFromGoogleIdToken, exchangeGoogleCode } from "./google.js";
import { buildMcpServer } from "./tools.js";

const store = createStore();
const provider = new CloudShellOAuthProvider(store);

const app = express();
app.set("trust proxy", true);

// Standard MCP authorization-server endpoints: /authorize, /token, /register,
// /.well-known/oauth-authorization-server, /.well-known/oauth-protected-resource/mcp
app.use(
  mcpAuthRouter({
    provider,
    issuerUrl: new URL(BASE_URL),
    baseUrl: new URL(BASE_URL),
    resourceServerUrl: new URL(`${BASE_URL}${MCP_PATH}`),
    resourceName: "Google Cloud Shell",
    scopesSupported: ["cloud-platform"]
  })
);

// Where Google redirects back to after the user signs in and grants consent.
app.get(GOOGLE_CALLBACK_PATH, async (req, res) => {
  const { code, state, error } = req.query;

  if (typeof error === "string") {
    res.status(400).send(`Google sign-in failed: ${error}`);
    return;
  }
  if (typeof code !== "string" || typeof state !== "string") {
    res.status(400).send("Missing code or state parameter.");
    return;
  }

  try {
    const pending = await provider.loadPending(state);
    const tokens = await exchangeGoogleCode(code);

    if (!tokens.refresh_token) {
      throw new Error(
        "Google did not return a refresh token. Remove this app from https://myaccount.google.com/permissions and try connecting again."
      );
    }

    const email = tokens.id_token ? emailFromGoogleIdToken(tokens.id_token) : undefined;
    if (ALLOWED_GOOGLE_ACCOUNT && email?.toLowerCase() !== ALLOWED_GOOGLE_ACCOUNT) {
      res.status(403).send(`This connector is restricted to ${ALLOWED_GOOGLE_ACCOUNT}.`);
      return;
    }

    const mcpCode = await provider.createGrant(pending, tokens.refresh_token, email ?? "unknown");
    await provider.consumePending(state);

    const redirectUrl = new URL(pending.redirectUri);
    redirectUrl.searchParams.set("code", mcpCode);
    if (pending.state) {
      redirectUrl.searchParams.set("state", pending.state);
    }
    res.redirect(redirectUrl.toString());
  } catch (err) {
    res.status(400).send(`Authorization failed: ${err instanceof Error ? err.message : String(err)}`);
  }
});

const resourceMetadataUrl = getOAuthProtectedResourceMetadataUrl(new URL(`${BASE_URL}${MCP_PATH}`));

app.post(
  MCP_PATH,
  express.json(),
  requireBearerAuth({ verifier: provider, resourceMetadataUrl }),
  async (req, res) => {
    // Stateless mode: a fresh server + transport per request, so concurrent
    // requests (and requests across Cloud Run instances) never collide.
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }
);

app.get("/", (_req, res) => {
  res.type("text/plain").send("cloud-shell-mcp-server is running.");
});

app.listen(PORT, () => {
  console.log(`cloud-shell-mcp-server listening on :${PORT}`);
  console.log(`BASE_URL=${BASE_URL}`);
});
