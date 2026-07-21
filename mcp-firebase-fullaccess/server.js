"use strict";

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { spawn } = require("child_process");
const crypto = require("crypto");
const net = require("net");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 8080;
const INTERNAL_PORT = 8081;
const AUTH_TOKEN = process.env.MCP_AUTH_TOKEN;
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

// Todas las categorias de herramientas que expone el servidor MCP oficial de
// Firebase (firebase-tools). Se listan explicitamente para no depender de la
// auto-deteccion (que requiere un firebase.json completo) y asi garantizar
// "control total" sobre el proyecto.
const FEATURES = [
  "core",
  "firestore",
  "storage",
  "dataconnect",
  "auth",
  "messaging",
  "functions",
  "remoteconfig",
  "crashlytics",
  "apptesting",
  "apphosting",
  "database",
  "developerknowledge",
].join(",");

function fail(message) {
  console.error(`[mcp-firebase-fullaccess] ${message}`);
  process.exit(1);
}

if (!AUTH_TOKEN) fail("Falta la variable de entorno MCP_AUTH_TOKEN.");
if (!PROJECT_ID) fail("Falta la variable de entorno FIREBASE_PROJECT_ID.");
if (!SERVICE_ACCOUNT_JSON) fail("Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT_JSON.");

const workDir = "/app/fbproject";
fs.mkdirSync(workDir, { recursive: true });
fs.writeFileSync(path.join(workDir, "firebase.json"), "{}\n");
fs.writeFileSync(
  path.join(workDir, ".firebaserc"),
  JSON.stringify({ projects: { default: PROJECT_ID } }, null, 2)
);

const serviceAccountPath = "/app/sa.json";
fs.writeFileSync(serviceAccountPath, SERVICE_ACCOUNT_JSON, { mode: 0o600 });

const childEnv = {
  ...process.env,
  GOOGLE_APPLICATION_CREDENTIALS: serviceAccountPath,
};

console.log(`[mcp-firebase-fullaccess] arrancando "firebase mcp" para el proyecto ${PROJECT_ID}...`);

const child = spawn(
  "firebase",
  ["mcp", "--dir", workDir, "--only", FEATURES, "--mode", "sse", "--port", String(INTERNAL_PORT)],
  { env: childEnv, stdio: "inherit" }
);

child.on("exit", (code, signal) => {
  console.error(`[mcp-firebase-fullaccess] "firebase mcp" termino (code=${code}, signal=${signal}). Cerrando proxy.`);
  process.exit(code || 1);
});

function waitForPort(port, host, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    (function attempt() {
      const socket = net.connect(port, host);
      socket.once("connect", () => {
        socket.end();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() > deadline) {
          reject(new Error(`Timeout esperando a que "firebase mcp" escuche en ${host}:${port}`));
        } else {
          setTimeout(attempt, 300);
        }
      });
    })();
  });
}

function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function main() {
  await waitForPort(INTERNAL_PORT, "127.0.0.1", 60_000);
  console.log(`[mcp-firebase-fullaccess] "firebase mcp" listo en :${INTERNAL_PORT}`);

  const app = express();
  app.disable("x-powered-by");

  // Endpoint de salud, sin autenticacion, solo para verificar que el
  // contenedor esta arriba (no expone ninguna capacidad de Firebase).
  app.get("/healthz", (_req, res) => res.status(200).send("ok"));

  const expectedHeader = `Bearer ${AUTH_TOKEN}`;
  app.use((req, res, next) => {
    const header = req.headers["authorization"] || "";
    if (!timingSafeEqualStr(header, expectedHeader)) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    next();
  });

  app.use(
    createProxyMiddleware({
      target: `http://127.0.0.1:${INTERNAL_PORT}`,
      changeOrigin: true,
      ws: false,
      logLevel: "warn",
    })
  );

  app.listen(PORT, () => {
    console.log(`[mcp-firebase-fullaccess] proxy autenticado escuchando en :${PORT}`);
  });
}

main().catch((err) => {
  fail(err.stack || String(err));
});

function shutdown() {
  child.kill("SIGTERM");
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
