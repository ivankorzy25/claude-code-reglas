#!/usr/bin/env bash
# Despliega el MCP de Firebase (control total) en Cloud Run, protegido con un
# token secreto, y deja lista la URL para agregarla como Custom Connector en
# claude.ai.
#
# Uso:
#   ./deploy.sh                  -> detecta el proyecto activo de gcloud y pide confirmacion
#   ./deploy.sh MI_PROJECT_ID    -> usa ese proyecto sin preguntar
#   REGION=southamerica-east1 ./deploy.sh   -> cambia la region (default: us-central1)
#
# Si corres esto en Google Cloud Shell (https://shell.cloud.google.com) ya
# tenes gcloud instalado y logueado con tu cuenta de Google, no hace falta
# instalar nada mas.
set -euo pipefail

REGION="${REGION:-us-central1}"
SERVICE_NAME="mcp-firebase-fullaccess"
SA_NAME="mcp-firebase-fullaccess-sa"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "No se encontro 'gcloud'. Lo mas facil: corre este script desde https://shell.cloud.google.com" >&2
  exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
  echo "==> Necesito que inicies sesion con tu cuenta de Google..."
  gcloud auth login
fi

DETECTED_PROJECT="$(gcloud config get-value project 2>/dev/null || true)"
if [ -n "${1:-}" ]; then
  GCP_PROJECT_ID="$1"
elif [ -n "$DETECTED_PROJECT" ]; then
  read -rp "==> Voy a usar el proyecto '${DETECTED_PROJECT}' (Enter para confirmar, o escribi otro Project ID): " INPUT_PROJECT
  GCP_PROJECT_ID="${INPUT_PROJECT:-$DETECTED_PROJECT}"
else
  read -rp "==> Project ID de tu proyecto de Firebase (lo ves en console.firebase.google.com > Configuracion): " GCP_PROJECT_ID
fi

if [ -z "${GCP_PROJECT_ID:-}" ]; then
  echo "No diste ningun Project ID. Corre: ./deploy.sh TU_PROJECT_ID" >&2
  exit 1
fi

SA_EMAIL="${SA_NAME}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="$(mktemp -d)/sa-key.json"

echo "==> Usando proyecto: ${GCP_PROJECT_ID}"
gcloud config set project "${GCP_PROJECT_ID}" >/dev/null

echo "==> Habilitando APIs necesarias..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com >/dev/null

echo "==> Creando (o reutilizando) service account con control total sobre Firebase..."
gcloud iam service-accounts create "${SA_NAME}" \
  --display-name="MCP Firebase - control total (claude.ai)" 2>/dev/null || true

# roles/editor: lectura/escritura sobre Firestore, Realtime Database, Storage,
#   Functions, Remote Config, etc.
# roles/firebase.admin: permisos especificos de Firebase (Remote Config,
#   Crashlytics, App Hosting, gestion del proyecto Firebase).
# roles/firebaseauth.admin: gestion completa de usuarios de Firebase Auth.
for role in roles/editor roles/firebase.admin roles/firebaseauth.admin; do
  gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${role}" \
    --condition=None >/dev/null
done

echo "==> Generando clave de la service account (temporal, se borra al final)..."
gcloud iam service-accounts keys create "${KEY_FILE}" \
  --iam-account="${SA_EMAIL}" >/dev/null

echo "==> Generando token secreto para autenticar el conector..."
MCP_AUTH_TOKEN="$(openssl rand -hex 32)"

echo "==> Guardando secretos en Secret Manager..."
if ! gcloud secrets describe mcp-firebase-auth-token >/dev/null 2>&1; then
  printf '%s' "${MCP_AUTH_TOKEN}" | gcloud secrets create mcp-firebase-auth-token --data-file=- >/dev/null
else
  printf '%s' "${MCP_AUTH_TOKEN}" | gcloud secrets versions add mcp-firebase-auth-token --data-file=- >/dev/null
fi

if ! gcloud secrets describe mcp-firebase-sa-json >/dev/null 2>&1; then
  gcloud secrets create mcp-firebase-sa-json --data-file="${KEY_FILE}" >/dev/null
else
  gcloud secrets versions add mcp-firebase-sa-json --data-file="${KEY_FILE}" >/dev/null
fi

rm -f "${KEY_FILE}"

echo "==> Desplegando en Cloud Run (esto compila la imagen con Cloud Build)..."
gcloud run deploy "${SERVICE_NAME}" \
  --source "$(dirname "$0")" \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port=8080 \
  --min-instances=0 \
  --max-instances=2 \
  --memory=512Mi \
  --timeout=3600 \
  --set-env-vars "FIREBASE_PROJECT_ID=${GCP_PROJECT_ID}" \
  --set-secrets "MCP_AUTH_TOKEN=mcp-firebase-auth-token:latest,FIREBASE_SERVICE_ACCOUNT_JSON=mcp-firebase-sa-json:latest"

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" --region "${REGION}" --format='value(status.url)')"

cat <<EOF

==============================================================
Listo. Guarda estos datos, los vas a necesitar en claude.ai:

  URL del conector:        ${SERVICE_URL}/sse
  Header Authorization:    Bearer ${MCP_AUTH_TOKEN}

El token NO vuelve a mostrarse. Si lo perdes, corre este script
de nuevo (regenera el secreto y actualiza el servicio).
==============================================================
EOF
