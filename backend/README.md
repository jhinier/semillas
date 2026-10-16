# Semillas API

API Hono de Semillas para Cloudflare Workers.

## Proposito

Esta carpeta contiene la API que centraliza:

- autenticacion
- perfiles
- catalogos
- sendas, temas y actividades
- progreso y sincronizacion offline
- gamificacion
- clubes
- CMS y administracion
- media

## Stack

- Bun
- Hono
- TypeScript
- Cloudflare Workers
- Wrangler
- Zod
- Supabase JS

## Comandos

```bash
bun install
bun run dev
bun run build
bun run lint
bun run test
bun run test:e2e
bun run deploy
```

## Desarrollo local

La API corre por defecto en `http://localhost:8787` con `wrangler dev`.

Variables principales de entorno:

- `APP_ENV`
- `CORS_ORIGIN` normalmente es `https://semillas.pages.dev`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`

### Frontend y CORS

El frontend apunta al Worker con `VITE_API_URL=https://api-semillas.andresalexander14.workers.dev`.
El backend puede mantener `CORS_ORIGIN=https://semillas.pages.dev` para permitir peticiones desde la PWA publicada.

### Drizzle con Hyperdrive en local

Si el backend usa Drizzle, el flujo correcto en desarrollo es:

1. Tener `[[hyperdrive]]` en `backend/wrangler.toml` con el binding `HYPERDRIVE`.
2. Definir `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` en `backend/.dev.vars`.
3. Reiniciar `bun run dev` para que `scripts/dev.ts` cargue `.dev.vars` y lo pase a `wrangler dev`.
4. Confirmar en consola que Wrangler muestra `env.HYPERDRIVE (...) Hyperdrive Config local`.
5. Probar `GET /catalogo/grupos-etarios` y `PATCH /perfil/actualizar`.

Si ves `proxy request failed` o `EHOSTUNREACH`, revisa la URL local de Postgres usada por Hyperdrive. Debe ser accesible desde tu máquina y llevar `sslmode=require`.

#### Comandos para replicarlo

```bash
cd backend
bunx wrangler hyperdrive create semillas-db --connection-string "postgresql://postgres:..."
wrangler hyperdrive list
bun run dev
```

#### En Cloudflare

1. Crear o reutilizar el Hyperdrive.
2. Copiar el id y dejarlo en `backend/wrangler.toml`.
3. Confirmar que el binding se llame `HYPERDRIVE`.

#### En Supabase

1. Ir a `Settings -> Database -> Connection string`.
2. Copiar la URL de Postgres que sí sea accesible desde tu red.
3. Usar `sslmode=require`.

## Estructura

```text
backend/src/
├─ app.ts
├─ index.ts
├─ config/
├─ db/
├─ modules/
├─ openapi/
└─ shared/
```

## Rutas clave

- `GET /health`
- `POST /autenticacion/invitado`
- `GET /perfil`
- `GET /catalogo/grupos-etarios`
- `GET /sendas`
- `GET /temas`
- `GET /temas/:tema_id/pasos`
- `GET /temas/:tema_id/actividades`
- `POST /actividades/:actividad_id/responder`
- `POST /progreso/eventos`
- `GET /sync/pull`
- `POST /sync/push`
- `GET /administracion/resumen`
- `POST /administracion/temas`
- `POST /administracion/temas/:tema_id/publicar`
- `POST /media/subir`

## Estado actual

El backend ya tiene una base funcional amplia, pero el trabajo pendiente mas importante es:

- reactivar la seguridad real en admin y media
- cerrar la sincronizacion offline end-to-end
- alinear la documentacion con el contrato real de la API

Revisa tambien:

- `../README.md`
- `../docs/estado-proyecto/README.md`
- `../docs/backend-api.md`
