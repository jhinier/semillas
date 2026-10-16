# Semillas

Semillas es una plataforma educativa cristiana para que niños, preadolescentes y adolescentes aprendan el evangelio de forma ludica, segura y progresiva.

El producto combina una PWA responsive, contenido organizado con metodologia CRECER, actividades interactivas, progreso, gamificacion, soporte offline y un CMS para administradores.

## Objetivo

Crear una experiencia de aprendizaje instalable en celular y escritorio que permita:

- Explorar sendas biblicas: Padre, Hijo y Espiritu Santo.
- Recorrer temas con los seis momentos CRECER: Conectar, Relatar, Ensenar, Comprobar, Experimentar y Recompensar.
- Resolver actividades como quizzes, flashcards y completar versiculos.
- Registrar progreso, XP, insignias y rachas.
- Descargar contenido para usarlo sin internet.
- Sincronizar eventos de progreso cuando la conexion vuelva.
- Administrar contenido desde un CMS con publicacion revisada por humanos.

## Stack

### Frontend

- Bun
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- TanStack Query
- Dexie para IndexedDB
- React Hook Form
- Zod
- shadcn/ui
- Lucide React
- vite-plugin-pwa

### Backend

- Bun
- Hono
- TypeScript
- Cloudflare Workers
- Wrangler
- Zod
- Supabase JS
- OpenAPI con `@hono/zod-openapi`

### Infraestructura

- Cloudflare Pages para la PWA.
- Cloudflare Workers para la API.
- Supabase Postgres para datos principales.
- Supabase Auth para autenticacion.
- Supabase Storage para media privada.
- GitHub Actions para CI.

## Arquitectura

```text
React PWA
   |
   v
IndexedDB offline-first (Dexie)
   |
   v
Hono API en Cloudflare Workers
   |
   v
Supabase: Postgres, Auth y Storage
```

El frontend debe leer y escribir primero en IndexedDB para los flujos offline. La API centraliza reglas de negocio, validacion, autorizacion, progreso, gamificacion, publicacion de contenido y sincronizacion idempotente.

## Estructura Del Repositorio

```text
semillas/
|- frontend/              # React PWA: landing, juego, CMS y modo offline
|- backend/               # API Hono para Cloudflare Workers
|- docs/                  # Documentacion tecnica del proyecto
|- supabase/              # Migraciones de Supabase
|- tests/                 # Pruebas auxiliares del repo
|- scripts/               # Scripts de desarrollo
|- semilla_base.sql       # SQL base para schema, policies y datos iniciales
|- package.json           # Workspaces y scripts raiz
`- bun.lock               # Lockfile de Bun
```

## Requisitos

- Bun 1.3 o superior.
- Cuenta de Supabase.
- Cuenta de Cloudflare.
- Wrangler autenticado para deploys de Workers.

No usar `npm`, `pnpm` ni `yarn` en este repositorio.

## Instalacion

```bash
bun install
```

Configura las variables de entorno desde los ejemplos:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.dev.vars
```

Variables principales:

| Variable | Ubicacion | Descripcion |
|---|---|---|
| `VITE_API_URL` | `frontend/.env.local` | URL publica de la API. Debe apuntar a `https://api-semillas.andresalexander14.workers.dev`. |
| `APP_ENV` | `backend/.dev.vars` | Ambiente de ejecucion. |
| `CORS_ORIGIN` | `backend/.dev.vars` | Origen permitido para CORS. Normalmente `https://semillas.pages.dev`. |
| `SUPABASE_URL` | `backend/.dev.vars` | URL del proyecto Supabase. |
| `SUPABASE_ANON_KEY` | `backend/.dev.vars` | Clave publica de Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | `backend/.dev.vars` | Clave secreta de servidor. No commitear. |
| `SUPABASE_PROJECT_REF` | `backend/.dev.vars` | Referencia del proyecto Supabase. |

### Drizzle con Hyperdrive en desarrollo local

Si la API usa Drizzle, el flujo correcto en local es:

1. En Supabase, copiar la cadena de conexión de Postgres desde `Settings -> Database -> Connection string`.
2. En Cloudflare, crear o reutilizar Hyperdrive con:

```bash
cd backend
bunx wrangler hyperdrive create semillas-db --connection-string "postgresql://postgres:..."
```

3. Copiar el id de Hyperdrive y dejarlo en `backend/wrangler.toml` como binding `HYPERDRIVE`.
4. Definir en `backend/.dev.vars` la variable:

```env
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgresql://.../postgres?sslmode=require
```

5. Reiniciar `bun run dev` para que `scripts/dev.ts` cargue `.dev.vars` y se lo pase a `wrangler dev`.

6. Verificar que el arranque muestre `env.HYPERDRIVE (...) Hyperdrive Config local`.

Si aparece `proxy request failed` o `EHOSTUNREACH`, revisar que la conexión local de Hyperdrive sea accesible desde tu máquina y lleve `sslmode=require`.

### CSP y conexion al backend

- La CSP del frontend se define en `frontend/public/_headers`.
- En `connect-src` se agrego `https://api-semillas.andresalexander14.workers.dev` para permitir llamadas al Worker de API.
- El resto de la CSP se mantuvo igual; solo cambio la lista de origenes permitidos para conexiones.
- Despues de editar ese archivo hay que volver a desplegar el frontend para que Cloudflare Pages publique el nuevo header.

## Desarrollo

Levantar frontend y backend al mismo tiempo:

```bash
bun run dev
```

Levantar cada parte por separado:

```bash
bun run dev:frontend
bun run dev:backend
```

Puertos por defecto:

| Servicio | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8787` |

## Comandos Principales

```bash
bun run dev              # Desarrollo local full-stack
bun run build            # Build frontend + typecheck backend
bun run check            # Lint/test/e2e backend + build completo
bun run dev:frontend     # Solo PWA
bun run dev:backend      # Solo API Worker
bun run build:frontend   # Build de la PWA
bun run build:backend    # Typecheck del backend
bun run deploy:backend   # Deploy del Worker
```

Comandos utiles por workspace:

```bash
bun run --cwd frontend typecheck
bun run --cwd frontend build
bun run --cwd backend test
bun run --cwd backend test:e2e
bun run --cwd backend typecheck
```

## Base De Datos Y Storage

El proyecto usa Supabase como infraestructura de datos. El archivo `semilla_base.sql` contiene la base del schema, policies y configuracion relacionada con media.

Para aplicar cambios en una base vinculada:

```bash
bunx supabase db query --linked --file semilla_base.sql
```

Para regenerar tipos desde Supabase:

```bash
SUPABASE_PROJECT_REF=xxxx bun run --cwd backend gen:types
```

## API

La API esta implementada con Hono para Cloudflare Workers y responde en formato consistente:

```json
{ "exito": true, "datos": {} }
```

```json
{ "exito": false, "error": "Mensaje", "codigo": "CODIGO" }
```

Endpoints destacados:

- `GET /health`
- `POST /autenticacion/invitado`
- `GET /perfil`
- `GET /sendas`
- `GET /temas`
- `GET /temas/:tema_id/pasos`
- `GET /temas/:tema_id/actividades`
- `POST /actividades/:actividad_id/responder`
- `POST /progreso/eventos`
- `GET /gamificacion/mi`
- `POST /administracion/temas`
- `POST /administracion/temas/:tema_id/publicar`
- `POST /media/subir`

Ver la referencia completa en [`docs/backend-api.md`](docs/backend-api.md).

## Offline-First

La PWA debe seguir este flujo base:

1. Descargar un tema y sus recursos.
2. Guardar contenido y progreso local en IndexedDB.
3. Registrar acciones del usuario como eventos pendientes.
4. Reintentar sincronizacion al recuperar conexion.
5. Procesar eventos en backend de forma idempotente.
6. Actualizar el estado local con los datos del servidor.

Los eventos de progreso usan `evento_id_cliente` para evitar duplicar XP, insignias, rachas o avance.

## Seguridad

## Documentación canónica

- [Instalación](docs/instalacion.md)
- [Arquitectura](docs/arquitectura.md)
- [API](docs/api.md) · [OpenAPI y backend](docs/backend-api.md)
- [Base de datos](docs/base-datos.md) · [Offline y sincronización](docs/offline-sync.md)
- [Seguridad](docs/seguridad.md) · [Pruebas](docs/pruebas.md) · [Despliegue](docs/despliegue.md)
- [Manual de usuario](docs/manual-usuario.md) · [Manual de administrador](docs/manual-administrador.md) · [CMS](docs/cms.md)
- [Operación y backup/restore](docs/operacion/README.md)
- [Estado y vigencia documental](docs/estado-docs.md)

Semillas esta disenado para menores, por lo que la seguridad es parte del nucleo del producto.

Reglas principales:

- No guardar edad exacta; solo franja etaria.
- No exponer nombres reales; usar apodos.
- No incluir chat libre ni tracking comercial.
- Validar entradas con Zod en backend.
- Proteger rutas administrativas por rol.
- Usar Storage privado y URLs firmadas para media sensible.
- Mantener secretos fuera de Git.
- Usar RLS en Supabase como segunda capa, no como unica autorizacion.

La guia de media y Storage esta en [`docs/media-storage.md`](docs/media-storage.md).

## CI Y Deploy

GitHub Actions ejecuta en PRs y pushes a `main` o `develop`:

- Instalacion con Bun.
- Typecheck de backend.
- Build de backend.
- Typecheck de frontend.
- Build de frontend.
- Tests de backend.

Deploy recomendado:

| Componente | Destino |
|---|---|
| Frontend | Cloudflare Pages |
| Backend | Cloudflare Workers |
| Datos | Supabase Postgres |
| Archivos | Supabase Storage |

Los secretos de produccion deben configurarse en Cloudflare Workers, no en archivos versionados.

## Documentacion

- [`docs/estado-docs.md`](docs/estado-docs.md): índice canónico y vigencia documental.
- [`docs/arquitectura.md`](docs/arquitectura.md): vista general de capas, flujos y modulos del sistema.
- [`docs/api.md`](docs/api.md): referencia canónica de la API y sus endpoints.
- [`docs/backend-api.md`](docs/backend-api.md): endpoints, auth, roles, variables y comandos de API.
- [`docs/base-datos.md`](docs/base-datos.md): modelo, integridad, RLS y Storage.
- [`docs/offline-sync.md`](docs/offline-sync.md): Dexie, outbox, push/pull y recuperación.
- [`docs/seguridad.md`](docs/seguridad.md): secretos, permisos y seguridad de menores.
- [`docs/pruebas.md`](docs/pruebas.md): comandos y criterios de calidad.
- [`docs/instalacion.md`](docs/instalacion.md): instalación local reproducible.
- [`docs/despliegue.md`](docs/despliegue.md): despliegue y rollback.
- [`docs/manual-usuario.md`](docs/manual-usuario.md) · [`docs/manual-administrador.md`](docs/manual-administrador.md) · [`docs/cms.md`](docs/cms.md): manuales funcionales.
- [`docs/operacion/README.md`](docs/operacion/README.md): runbooks de operación.
- [`docs/media-storage.md`](docs/media-storage.md): flujo de media privada con Supabase Storage.
- [`docs/documento_guia_RF_RNF_proyecto_semillas.md`](docs/documento_guia_RF_RNF_proyecto_semillas.md): guia funcional y no funcional del proyecto.
- [`docs/estado-proyecto/README.md`](docs/estado-proyecto/README.md): indice del estado actual, tareas y brechas del proyecto.
- [`backend/README.md`](backend/README.md): notas especificas de la API.
- [`frontend/README.md`](frontend/README.md): notas especificas del frontend.

## Contribucion

Antes de abrir un PR:

```bash
bun run check
```

Buenas practicas esperadas:

- Mantener TypeScript estricto.
- Evitar `any` salvo justificacion clara.
- Validar formularios y endpoints con Zod.
- Mantener componentes y modulos pequenos.
- No duplicar estilos base de UI.
- No acceder a IndexedDB directamente desde pantallas grandes.
- No mezclar reglas de negocio complejas dentro del JSX.
- Agregar o actualizar pruebas cuando cambie comportamiento.
- Documentar decisiones relevantes en `docs/`.

## Estado Del Proyecto

Semillas esta en desarrollo activo. El foco actual es consolidar la PWA, la API Hono en Cloudflare Workers, el CMS, el flujo offline-first, la gamificacion y la integracion segura con Supabase.

Para ver el estado detallado por areas y las brechas pendientes, revisa [`docs/estado-proyecto/README.md`](docs/estado-proyecto/README.md).
