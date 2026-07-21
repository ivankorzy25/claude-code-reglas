import axios from "axios";
import { decodeJwt } from "jose";
import {
  BASE_URL,
  GOOGLE_CALLBACK_PATH,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_SCOPES
} from "./constants.js";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export function googleRedirectUri(): string {
  return `${BASE_URL}${GOOGLE_CALLBACK_PATH}`;
}

/** Builds the URL we redirect the user's browser to for the Google consent screen. */
export function buildGoogleAuthUrl(state: string): string {
  const url = new URL(GOOGLE_AUTH_ENDPOINT);
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", googleRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_OAUTH_SCOPES.join(" "));
  url.searchParams.set("access_type", "offline");
  // Force the consent screen every time so Google always hands back a
  // refresh_token, even if this account authorized the app before.
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/** Exchanges the one-time code Google sent to our callback for tokens. */
export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  const response = await axios.post<GoogleTokenResponse>(
    GOOGLE_TOKEN_ENDPOINT,
    new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code"
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return response.data;
}

/** Exchanges a stored Google refresh token for a fresh short-lived access token. */
export async function refreshGoogleAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: number }> {
  const response = await axios.post<GoogleTokenResponse>(
    GOOGLE_TOKEN_ENDPOINT,
    new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token"
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return {
    accessToken: response.data.access_token,
    expiresAt: Date.now() + response.data.expires_in * 1000
  };
}

/**
 * Reads the `email` claim out of a Google ID token.
 *
 * We do not re-verify the JWT signature: the token arrived directly from
 * Google's token endpoint over TLS in exchangeGoogleCode(), so there is no
 * party in between who could have forged it.
 */
export function emailFromGoogleIdToken(idToken: string): string | undefined {
  const claims = decodeJwt(idToken);
  return typeof claims.email === "string" ? claims.email : undefined;
}
