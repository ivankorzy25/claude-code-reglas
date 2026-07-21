# cloud-shell-mcp-server

Servidor MCP remoto que conecta **claude.ai** con tu **Google Cloud Shell**
(`shell.cloud.google.com`). Una vez conectado, Claude puede:

- `cloud_shell_status` — ver el estado de tu entorno de Cloud Shell (sin arrancarlo).
- `cloud_shell_start` — arrancarlo si está suspendido y esperar a que esté listo.
- `cloud_shell_exec` — ejecutar cualquier comando de shell dentro de tu VM de
  Cloud Shell por SSH (gcloud, kubectl, git, docker, terraform, etc. ya vienen
  instalados y `gcloud`/`kubectl` ya están autenticados con tu cuenta de Google).

## Cómo funciona

`shell.cloud.google.com` en sí es solo la interfaz web; no tiene una API para
controlar esa sesión de navegador. Este servidor usa en cambio la **Cloud
Shell REST API** oficial de Google (`cloudshell.googleapis.com`) para arrancar
tu entorno y añadir una clave SSH efímera, y luego se conecta por SSH para
correr comandos — es el mismo mecanismo que usa `gcloud cloud-shell ssh`.

Como claude.ai necesita un servidor **remoto** (no uno local tipo stdio), este
proyecto implementa:

1. Un servidor MCP (Streamable HTTP) con las 3 tools de arriba.
2. Un servidor de autorización OAuth 2.1 + PKCE (usando los helpers de
   `@modelcontextprotocol/sdk`) que hace de intermediario: claude.ai se
   autentica contra este servidor, y este servidor delega el login real en
   **Google** (pidiendo el scope `https://www.googleapis.com/auth/cloud-platform`).
   El token de Google resultante es lo que se usa para hablar con la Cloud
   Shell API — no hay credenciales propias que gestionar aparte de tu login
   de Google.
3. Firestore como almacenamiento (clientes registrados, códigos de
   autorización, tokens) para que el estado sobreviva a reinicios/escalado de
   Cloud Run.

Está pensado para **uso personal, single-user**: cualquiera que complete el
login de Google en `/oauth/google/callback` obtiene acceso total a tu Google
Cloud (scope `cloud-platform`), así que hay una variable `ALLOWED_GOOGLE_ACCOUNT`
para restringirlo a tu cuenta.

## 1. Crear el proyecto de GCP y habilitar las APIs

```bash
gcloud auth login
gcloud projects create TU_PROJECT_ID --name="Cloud Shell MCP"
gcloud config set project TU_PROJECT_ID

# Asegurate de tener billing habilitado en el proyecto (Cloud Run y Firestore lo requieren)
gcloud services enable \
  cloudshell.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com

gcloud firestore databases create --location=us-central1
```

## 2. Primer deploy (para obtener la URL de Cloud Run)

La URL de Cloud Run hace falta para configurar el cliente OAuth de Google, así
que primero desplegamos con variables de entorno provisorias solo para que
Cloud Run nos asigne la URL definitiva:

```bash
cd cloud-shell-mcp-server
gcloud run deploy cloud-shell-mcp-server \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BASE_URL=https://placeholder,GOOGLE_CLIENT_ID=placeholder,GOOGLE_CLIENT_SECRET=placeholder
```

Anotá la URL que te devuelve (algo como
`https://cloud-shell-mcp-server-xxxxxxxxxx-uc.a.run.app`). No cambia en
deploys futuros del mismo servicio.

> `--allow-unauthenticated` es necesario porque la autenticación la maneja
> este propio servidor (OAuth), no Cloud Run/IAM.

## 3. Pantalla de consentimiento OAuth y credenciales

En [Google Cloud Console → APIs & Services → OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent):

1. Tipo de usuario: **External**.
2. Completá los campos obligatorios (nombre de la app, email de soporte, etc).
3. Scopes: agregá `.../auth/cloud-platform`.
4. **Importante:** una vez creada, pasala a **"In production"** (no la dejes
   en "Testing"). Si queda en "Testing", Google revoca el refresh token a los
   7 días y el conector se corta solo cada semana. En producción sin
   verificar vas a ver el cartel de "Google no verificó esta app" al hacer
   login — es esperado, hacé clic en "Avanzado" → "Ir a (nombre de la app)
   (no seguro)"; es tu propia app, así que es seguro.

Después, en [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials):

1. **Create Credentials → OAuth client ID → Web application**.
2. **Authorized redirect URIs**: agregá
   `https://TU-URL-DE-CLOUD-RUN/oauth/google/callback` (con la URL real del paso 2).
3. Guardá el **Client ID** y **Client secret**.

## 4. Permisos de Firestore para Cloud Run

```bash
PROJECT_NUMBER=$(gcloud projects describe TU_PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding TU_PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"
```

## 5. Deploy final con las variables reales

```bash
gcloud run deploy cloud-shell-mcp-server \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars BASE_URL=https://TU-URL-DE-CLOUD-RUN,GOOGLE_CLIENT_ID=TU_CLIENT_ID,GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET,ALLOWED_GOOGLE_ACCOUNT=tu-email@gmail.com
```

`ALLOWED_GOOGLE_ACCOUNT` es opcional pero muy recomendado: si alguien más
llega a probar el link de conexión, se le rechaza con 403 en vez de darle
acceso a tu Google Cloud.

## 6. Conectar en claude.ai

En claude.ai → **Settings → Connectors → Add custom connector**, pegá:

```
https://TU-URL-DE-CLOUD-RUN/mcp
```

Al conectar, claude.ai te va a redirigir a la pantalla de login de Google —
iniciá sesión con la cuenta que tiene acceso a Cloud Shell/tu proyecto de GCP
y aceptá los permisos. Después de eso el conector queda activo y las tools
`cloud_shell_status`, `cloud_shell_start` y `cloud_shell_exec` están
disponibles en la conversación.

## Desarrollo local

```bash
npm install
MEMORY_STORE=1 \
BASE_URL=http://localhost:8080 \
GOOGLE_CLIENT_ID=... \
GOOGLE_CLIENT_SECRET=... \
MCP_DANGEROUSLY_ALLOW_INSECURE_ISSUER_URL=true \
npm run dev
```

`MEMORY_STORE=1` reemplaza Firestore por un Map en memoria (se pierde al
reiniciar, no sirve para producción con múltiples instancias). Para probar el
login de Google en local necesitás agregar
`http://localhost:8080/oauth/google/callback` como redirect URI autorizado en
el client OAuth (Google permite `http://localhost` para desarrollo).

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `BASE_URL` | sí | URL pública del servidor, sin `/` final |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | sí | Credenciales del OAuth client de Google (paso 3) |
| `ALLOWED_GOOGLE_ACCOUNT` | recomendada | Restringe el login a un único email |
| `PORT` | no (default 8080) | Puerto HTTP |
| `MEMORY_STORE` | no | `1` para usar almacenamiento en memoria en vez de Firestore (solo desarrollo) |

## Limitaciones conocidas

- El scope `cloud-platform` es amplio: da acceso a (casi) todo tu Google
  Cloud, no solo a Cloud Shell. Es la única forma de operar Cloud Shell por
  API, pero tenelo en cuenta.
- `cloud_shell_exec` ejecuta lo que Claude le pida sin confirmación adicional
  de tu parte a nivel del servidor — la barrera de seguridad es la propia
  conversación con Claude, igual que con cualquier otra tool que ejecuta
  comandos.
- Cada instancia de Cloud Run genera su propio par de claves SSH efímero la
  primera vez que necesita conectarse (se guarda en `/tmp`, no persiste entre
  reinicios del contenedor); esto es normal y no requiere limpieza manual.
