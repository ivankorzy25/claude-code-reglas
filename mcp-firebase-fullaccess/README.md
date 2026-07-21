# MCP de Firebase (control total) para claude.ai

Este proyecto expone el **servidor MCP oficial de Firebase** (el que trae
`firebase-tools`, mantenido por Google) como un **conector remoto** que podés
agregar en claude.ai (la web), con acceso de lectura, escritura y borrado
sobre tu proyecto de Firebase: Firestore, Realtime Database, Authentication,
Storage, Remote Config, Cloud Functions (logs), Crashlytics, Data Connect,
App Hosting, Cloud Messaging.

## ⚠️ Antes de arrancar, entendé el riesgo

- El token que vas a generar equivale a una **contraseña maestra** de tu
  proyecto de Firebase: quien lo tenga puede leer, modificar y **borrar**
  datos reales (usuarios, documentos de Firestore, archivos de Storage,
  etc.) a través de Claude.
- No compartas la URL del servicio ni el token. No los pegues en chats,
  issues públicos ni los subas a un repo.
- Si el token se filtra, corré `deploy.sh` de nuevo para rotarlo (o borrá el
  servicio de Cloud Run) inmediatamente.
- Recomendado: usar esto contra un proyecto de **desarrollo/staging**
  primero, no directo contra producción, hasta que confíes en el flujo.
- Todo lo que Claude haga vía este conector queda registrado en los
  [Cloud Audit Logs](https://console.cloud.google.com/logs) de tu proyecto
  de GCP (a nombre de la service account), así que podés auditar la
  actividad.

## Por qué hace falta desplegar un servidor (y no alcanza con local)

`claude.ai` (el navegador) solo puede conectarse a **conectores remotos**
(un servidor MCP accesible por HTTPS). El servidor MCP oficial de Firebase
corre por defecto en modo local (`stdio`), pensado para Claude Desktop /
Claude Code / Cursor en tu máquina. Este proyecto lo levanta en modo `sse`
(el modo HTTP que soporta) dentro de un contenedor en **Cloud Run**, y le
agrega delante un proxy con autenticación por token, porque el servidor de
Firebase por sí solo no tiene ningún control de acceso — confía en quien
sea que llame al puerto.

```
claude.ai  ──HTTPS + Authorization: Bearer <token>──▶  Cloud Run
                                                          │
                                                          ├─ proxy (server.js)
                                                          │  valida el token
                                                          │
                                                          └─ firebase mcp --mode sse
                                                             (firebase-tools, con la
                                                             service account de tu
                                                             proyecto)
                                                                   │
                                                                   ▼
                                                       Firestore / Auth / Storage /
                                                       Remote Config / etc.
```

## Requisitos previos

1. Tu proyecto en <https://console.firebase.google.com> (anotá el **Project
   ID**, no el nombre visible — está en ⚙️ Configuración del proyecto).
2. Facturación habilitada en el proyecto de Google Cloud asociado (Cloud Run
   tiene capa gratuita amplia; para uso personal normalmente no vas a pagar
   nada, pero GCP lo exige para habilitar Cloud Run).
3. [`gcloud` CLI](https://cloud.google.com/sdk/docs/install) instalado y
   logueado con tu cuenta de Google (la misma con acceso a Firebase):
   ```bash
   gcloud auth login
   ```
4. Tener `openssl` disponible (viene por defecto en Mac/Linux; en Windows
   usá WSL o Git Bash).

## Paso 1: Correr el despliegue (la forma más fácil: Google Cloud Shell)

No hace falta instalar nada en tu compu. Cloud Shell ya viene con `gcloud`
instalado y logueado con tu cuenta de Google.

1. Abrí <https://shell.cloud.google.com> (con la misma cuenta de Google que
   usás en Firebase).
2. Pegá este bloque y presioná Enter:

   ```bash
   git clone https://github.com/ivankorzy25/claude-code-reglas.git && \
   cd claude-code-reglas/mcp-firebase-fullaccess && \
   ./deploy.sh
   ```
3. El script te va a mostrar el Project ID que detectó y te pide Enter para
   confirmar (o podés escribir otro). Después no tenés que tocar nada más:
   crea todo solo y al final te muestra la URL y el token que necesitás para
   el Paso 3.

¿Preferís tu propia terminal en vez de Cloud Shell? Instalá el [`gcloud`
CLI](https://cloud.google.com/sdk/docs/install), logueate con
`gcloud auth login`, cloná este repo y corré `./deploy.sh` igual (opcionalmente
`./deploy.sh TU_PROJECT_ID` para saltear la confirmación).

El script:

1. Crea una **service account** dedicada (`mcp-firebase-fullaccess-sa`) con
   los roles `roles/editor`, `roles/firebase.admin` y
   `roles/firebaseauth.admin` sobre tu proyecto (esto es lo que le da
   "control total").
2. Genera un **token aleatorio** de 256 bits para proteger el endpoint.
3. Guarda la clave de la service account y el token en **Secret Manager**
   (nunca quedan en texto plano en tu disco ni en el repo).
4. Construye la imagen con Cloud Build y despliega el servicio en Cloud Run.
5. Al final imprime la **URL** y el **token** que necesitás para el próximo
   paso. Guardalos ahora — el token no se vuelve a mostrar.

## Paso 2: Probar que el servidor responde

```bash
# Sin token: tiene que devolver 401
curl -i https://TU-SERVICIO.run.app/sse

# Con token: tiene que devolver 200 y quedarse abierto (es un stream SSE)
curl -i -N -H "Authorization: Bearer TU_TOKEN" https://TU-SERVICIO.run.app/sse
```

## Paso 3: Agregar el conector en claude.ai

1. Andá a **claude.ai → Configuración (Settings) → Connectors → Add custom
   connector**.
2. **Name**: `Firebase (control total)` (o el nombre que quieras).
3. **URL**: `https://TU-SERVICIO.run.app/sse`
4. Si el diálogo muestra una sección de **"Request headers" / cabeceras
   personalizadas** (autenticación por API key/bearer token), agregá:
   - Header: `Authorization`
   - Valor: `Bearer TU_TOKEN`
5. Guardá y activá el conector.

> **Si tu cuenta no muestra la opción de "Request headers"** (todavía es
> una función en despliegue gradual de Anthropic): el diálogo estándar de
> Custom Connector solo soporta OAuth, no un token fijo. Avisame y agrego a
> este mismo proyecto un pequeño servidor de autorización OAuth 2.1 (con
> login por contraseña) delante del proxy, que es la alternativa cuando esa
> función no está habilitada en tu cuenta.

## Paso 4: Probarlo

En una conversación nueva de claude.ai, activá el conector "Firebase" y
probá algo como:

> Listá las colecciones de Firestore de mi proyecto.

o

> Mostrame los últimos usuarios registrados en Firebase Authentication.

## Rotar o revocar el acceso

- **Rotar el token**: volvé a correr `./deploy.sh` (genera un token nuevo y
  redeploya). Actualizá el header en claude.ai con el token nuevo.
- **Cortar el acceso completamente**:
  ```bash
  gcloud run services delete mcp-firebase-fullaccess --region us-central1
  gcloud iam service-accounts delete \
    mcp-firebase-fullaccess-sa@TU_PROJECT_ID.iam.gserviceaccount.com
  ```

## Limitaciones conocidas

- El transporte `sse` que usa `firebase-tools` es el modo "legacy" de MCP
  (Anthropic ya soporta el más nuevo "Streamable HTTP" y viene deprecando
  SSE de a poco). Mientras Google no agregue Streamable HTTP al comando
  `firebase mcp`, esto seguirá funcionando, pero puede necesitar un ajuste
  el día que claude.ai deje de aceptar SSE.
- El token es único y compartido: no hay múltiples usuarios/permisos, es
  todo o nada. Para un caso de un solo dueño de cuenta (vos) está bien.
- El set de herramientas es el que expone Google en `firebase-tools`
  (Firestore, Auth, Storage, Realtime Database, Remote Config, Crashlytics,
  Data Connect, App Hosting, Messaging, y logs de Functions). Desplegar
  código nuevo de Cloud Functions o Hosting sigue haciéndose con el flujo
  normal (`firebase deploy`), no a través de este MCP.

## Estructura de este proyecto

```
mcp-firebase-fullaccess/
├── Dockerfile        # imagen: node:20-slim + firebase-tools + el proxy
├── server.js         # proxy con autenticación por token delante de "firebase mcp"
├── package.json
├── deploy.sh          # crea la service account, secretos y despliega en Cloud Run
└── README.md          # esta guía
```
