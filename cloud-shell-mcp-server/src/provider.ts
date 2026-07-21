import { randomUUID } from "node:crypto";
import type { Response } from "express";
import type { AuthorizationParams, OAuthServerProvider } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import type { OAuthClientInformationFull, OAuthTokens } from "@modelcontextprotocol/sdk/shared/auth.js";
import { InvalidGrantError, InvalidTokenError } from "@modelcontextprotocol/sdk/server/auth/errors.js";
import type { Store } from "./store.js";
import { buildGoogleAuthUrl } from "./google.js";

const CLIENTS = "oauth_clients";
const PENDING = "oauth_pending";
const GRANTS = "oauth_grants";
const TOKENS = "oauth_tokens";

const PENDING_TTL_MS = 10 * 60 * 1000;
const GRANT_TTL_MS = 5 * 60 * 1000;
// Our own access tokens never really expire (the Google refresh token behind
// them is the thing that matters); we just report a rolling 1h window so the
// SDK's bearer-auth middleware, which requires an expiresAt, is satisfied.
const ACCESS_TOKEN_WINDOW_SECONDS = 60 * 60;

export interface PendingAuthorization {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state?: string;
  resource?: string;
  createdAt: number;
}

export interface AuthorizationGrant {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  googleRefreshToken: string;
  googleEmail: string;
  createdAt: number;
}

interface IssuedToken {
  clientId: string;
  googleRefreshToken: string;
  googleEmail: string;
}

/**
 * OAuth authorization server for this MCP server, backed by Google as the
 * identity provider. It handles dynamic client registration and the
 * authorization-code/PKCE dance for whatever MCP client connects (e.g.
 * claude.ai), while brokering the actual sign-in through Google so that the
 * resulting session is tied to a real Google Cloud Platform OAuth token.
 */
export class CloudShellOAuthProvider implements OAuthServerProvider {
  constructor(private store: Store) {}

  get clientsStore(): OAuthRegisteredClientsStore {
    return {
      getClient: (clientId: string) => this.store.get<OAuthClientInformationFull>(CLIENTS, clientId),
      registerClient: async (client) => {
        const clientId = randomUUID();
        const full: OAuthClientInformationFull = {
          ...client,
          client_id: clientId,
          client_id_issued_at: Math.floor(Date.now() / 1000)
        };
        await this.store.set(CLIENTS, clientId, full);
        return full;
      }
    };
  }

  async authorize(client: OAuthClientInformationFull, params: AuthorizationParams, res: Response): Promise<void> {
    const pendingId = randomUUID();
    const pending: PendingAuthorization = {
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      state: params.state,
      resource: params.resource?.href,
      createdAt: Date.now()
    };
    await this.store.set(PENDING, pendingId, pending);
    res.redirect(buildGoogleAuthUrl(pendingId));
  }

  async challengeForAuthorizationCode(_client: OAuthClientInformationFull, authorizationCode: string): Promise<string> {
    const grant = await this.loadGrant(authorizationCode);
    return grant.codeChallenge;
  }

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
    _codeVerifier?: string,
    redirectUri?: string
  ): Promise<OAuthTokens> {
    const grant = await this.loadGrant(authorizationCode);
    if (grant.clientId !== client.client_id) {
      throw new InvalidGrantError("Authorization code was issued to a different client");
    }
    if (redirectUri && redirectUri !== grant.redirectUri) {
      throw new InvalidGrantError("redirect_uri does not match the one used to start this authorization");
    }
    await this.store.delete(GRANTS, authorizationCode);

    const accessToken = `cst_${randomUUID()}${randomUUID()}`.replace(/-/g, "");
    const issued: IssuedToken = {
      clientId: client.client_id,
      googleRefreshToken: grant.googleRefreshToken,
      googleEmail: grant.googleEmail
    };
    await this.store.set(TOKENS, accessToken, issued);

    return {
      access_token: accessToken,
      token_type: "bearer",
      refresh_token: accessToken,
      expires_in: ACCESS_TOKEN_WINDOW_SECONDS
    };
  }

  async exchangeRefreshToken(client: OAuthClientInformationFull, refreshToken: string): Promise<OAuthTokens> {
    const issued = await this.store.get<IssuedToken>(TOKENS, refreshToken);
    if (!issued) {
      throw new InvalidGrantError("Unknown or revoked refresh token");
    }
    if (issued.clientId !== client.client_id) {
      throw new InvalidGrantError("Refresh token was issued to a different client");
    }
    // Our "refresh token" and "access token" are the same opaque value - the
    // real, expiring secret is the Google refresh token behind it, which we
    // exchange for a fresh Google access token on every tool call anyway.
    return {
      access_token: refreshToken,
      token_type: "bearer",
      refresh_token: refreshToken,
      expires_in: ACCESS_TOKEN_WINDOW_SECONDS
    };
  }

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const issued = await this.store.get<IssuedToken>(TOKENS, token);
    if (!issued) {
      throw new InvalidTokenError("Invalid or revoked access token");
    }
    return {
      token,
      clientId: issued.clientId,
      scopes: ["cloud-platform"],
      expiresAt: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_WINDOW_SECONDS,
      extra: {
        googleRefreshToken: issued.googleRefreshToken,
        googleEmail: issued.googleEmail
      }
    };
  }

  async revokeToken(_client: OAuthClientInformationFull, request: { token: string }): Promise<void> {
    await this.store.delete(TOKENS, request.token);
  }

  // --- Helpers used by the /oauth/google/callback route in index.ts ---

  async loadPending(pendingId: string): Promise<PendingAuthorization> {
    const pending = await this.store.get<PendingAuthorization>(PENDING, pendingId);
    if (!pending || Date.now() - pending.createdAt > PENDING_TTL_MS) {
      throw new Error("Authorization request expired or not found - please retry connecting from claude.ai");
    }
    return pending;
  }

  async consumePending(pendingId: string): Promise<void> {
    await this.store.delete(PENDING, pendingId);
  }

  async createGrant(pending: PendingAuthorization, googleRefreshToken: string, googleEmail: string): Promise<string> {
    const code = randomUUID();
    const grant: AuthorizationGrant = {
      clientId: pending.clientId,
      redirectUri: pending.redirectUri,
      codeChallenge: pending.codeChallenge,
      googleRefreshToken,
      googleEmail,
      createdAt: Date.now()
    };
    await this.store.set(GRANTS, code, grant);
    return code;
  }

  private async loadGrant(code: string): Promise<AuthorizationGrant> {
    const grant = await this.store.get<AuthorizationGrant>(GRANTS, code);
    if (!grant || Date.now() - grant.createdAt > GRANT_TTL_MS) {
      throw new InvalidGrantError("Unknown or expired authorization code");
    }
    return grant;
  }
}
