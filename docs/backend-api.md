# Semillas API — Documentación Técnica

**Owner:** M7 · **Revisión:** 2026-07-13

## Stack

```
Hono (Cloudflare Workers) → Supabase PostgreSQL
```

- **Runtime**: Cloudflare Workers (Wrangler)
- **Framework**: Hono v4
- **Cliente DB**: Supabase JS (`supabase-js`)
- **Validación**: Zod + `@hono/zod-validator`
- **Auth**: Supabase Auth + modo invitado (`X-Guest-User-Id`)
- **Tipos**: TypeScript generados desde Supabase (`database.types.ts`)

---

## Arquitectura

```
Frontend React PWA
       ↓  HTTP JSON
Hono API (Cloudflare Workers)
       ↓  Supabase JS
Supabase PostgreSQL
```

### Middleware stack

1. `logger()` — logs HTTP requests
2. `cors()` — CORS configurado desde `CORS_ORIGIN`
3. `db` — inyecta `createSupabaseAdmin(env)` en cada request
4. `authMiddleware` — autenticación opcional (Bearer token o X-Guest-User-Id)
5. `requireRole(...)` — protección por rol
6. `errorHandler` — captura `HttpError` y responde JSON consistente

### Formato de respuesta

```json
{
  "exito": true,
  "datos": { }
}
```

```json
{
  "exito": false,
  "error": "Tema no encontrado",
  "codigo": "NO_ENCONTRADO"
}
```

---

## Endpoints

### Health

```
GET  /                     → { exito, nombre, version }
GET  /health               → { exito, estado, entorno }
```

### Catálogo

```
GET  /catalogo/grupos-etarios   → Franjas: Semillas (5-8), Exploradores (9-12), Embajadores (13-17)
GET  /catalogo/tipos-actividad  → Tipos: quiz, flashcards, completar, etc.
GET  /catalogo/pasos-crecer     → Pasos CRECER con colores
GET  /catalogo/versiones-biblicas → Versiones bíblicas (TLA, RVR, NVI)
```

### Autenticación

```
POST /autenticacion/invitado            → Crea usuario invitado + perfil
  Cuerpo: { apodo, grupo_edad_id?, url_avatar? }
  Respuesta: { usuario, perfil, autenticacion: { nombre_cabecera, valor_cabecera } }
```

### Perfil

```
GET  /perfil                → Perfil del usuario autenticado
PATCH /perfil/actualizar    → Actualizar perfil
  Cabeceras: X-Guest-User-Id | Authorization: Bearer <token>
```

### Sendas

```
GET  /sendas                → Sendas activas (Padre, Hijo, Espíritu Santo)
```

### Temas

```
GET  /temas                  → Temas publicados (usa vista v_temas_publicos)
GET  /temas?senda_id=ID      → Temas filtrados por senda
GET  /temas/:tema_id         → Detalle con senda, portada, versiculo_clave, referencia_biblica
GET  /temas/:tema_id/pasos   → Pasos CRECER del tema
GET  /temas/:tema_id/pasos?grupo_edad_id=ID   → Pasos filtrados por franja
GET  /temas/:tema_id/actividades  → Actividades del tema
GET  /temas/:tema_id/actividades?grupo_edad_id=ID  → Actividades filtradas
```

### Actividades

```
GET  /actividades/:actividad_id        → Detalle de actividad con opciones
POST /actividades/:actividad_id/responder  → Responder actividad (autenticado)
  Cabeceras: X-Guest-User-Id
  Cuerpo: { evento_id_cliente, opcion_id_seleccionada?, texto_respuesta?, ocurrido_en_cliente?, dispositivo_id? }
  Respuesta: { resultado: { correcta, xp_otorgada } }
```

### Progreso

```
GET  /progreso/mi            → Progreso del usuario (temas + actividades)
POST /progreso/eventos       → Enviar evento de progreso
  Cuerpo: { evento_id_cliente, tipo_evento, tema_id?, paso_id?, actividad_id?, correcta?, puntaje?, xp_otorgada?, datos_payload?, ocurrido_en_cliente?, dispositivo_id? }
  - Idempotente: si evento_id_cliente ya existe, devuelve { duplicado: true }
```

### Administración / CMS (requiere rol admin)

```
GET  /administracion/resumen                 → Estadísticas: temas, usuarios, actividades
POST /administracion/temas                   → Crear tema en borrador
POST /administracion/temas/:tema_id/pasos    → Agregar paso CRECER con contenido por franja
POST /administracion/actividades             → Crear actividad con opciones (quiz)
POST /administracion/temas/:tema_id/publicar → Publicar tema (borrador → publicado)
```

### Gamificación

```
GET  /gamificacion/mi        → Nivel, XP total y logros del usuario
```

---

## Autenticación

### Modo invitado (desarrollo/testing)

```
POST /autenticacion/invitado  →  X-Guest-User-Id: <uuid>

GET /perfil
X-Guest-User-Id: <uuid>
```

### Modo Bearer (producción con Supabase Auth)

```
Authorization: Bearer <supabase_access_token>
```

El middleware `authMiddleware`:
1. Si hay `X-Guest-User-Id`, autentica como invitado
2. Si hay `Authorization: Bearer`, obtiene user de Supabase Auth
3. Si el usuario no existe localmente, lo crea automáticamente (auto-registro)

---

## Roles

| Rol     | Descripción              |
|---------|--------------------------|
| admin   | Administrador del CMS    |
| user    | Usuario registrado       |
| guest   | Usuario invitado         |
| parent  | Padre/madre de familia   |

Uso: `requireRole("admin")`, `requireRole("admin", "user")`, etc.

---

## Seed Data

El archivo `src/db/seed.sql` crea un tema de demostración:

- **Tema**: "El Buen Pastor" (Senda del Hijo, Juan 10:11-15)
- **Contenido para**: Semillas, Exploradores y Embajadores
- **6 pasos CRECER** con contenido por franja
- **3 quizzes** (uno por franja) con opciones correctas/incorrectas
- **Preguntas de reflexión** por franja
- **Logro/insignia** al completar el tema

Ejecutar:
```bash
bunx supabase db query --linked --file src/db/seed.sql
```

---

## TypeScript Types

```bash
# Generar tipos desde Supabase
SUPABASE_PROJECT_REF=xxxx bun run gen:types
```

Los tipos generados están en `src/db/database.types.ts`.

Los alias de tablas están en `src/db/schema.ts`:

```ts
export const table = {
  appUser: "app_user",
  path: "path",
  theme: "theme",
  activity: "activity",
  // ...
} as const;
```

---

## Variables de Entorno

| Variable                    | Descripción                          |
|-----------------------------|--------------------------------------|
| `APP_ENV`                   | `local` o `production`               |
| `CORS_ORIGIN`               | Origen permitido para CORS           |
| `SUPABASE_URL`              | URL del proyecto Supabase            |
| `SUPABASE_PUBLISHABLE_KEY`  | Anon key (pública)                   |
| `SUPABASE_SERVER_KEY`       | Clave de servicio (secreta)           |
| `SUPABASE_PROJECT_REF`      | Referencia del proyecto              |

### Frontend y CSP

- El frontend publica su CSP en `frontend/public/_headers`.
- En `connect-src` debe estar permitido `https://api-semillas.andresalexander14.workers.dev`.
- `VITE_API_URL` en el frontend debe apuntar al mismo Worker.
- `CORS_ORIGIN` en el backend puede permanecer en `https://semillas.pages.dev`.

### Drizzle en desarrollo local

Para ejecutar Drizzle con `wrangler dev`:

1. Configura `[[hyperdrive]]` en `backend/wrangler.toml` con el binding `HYPERDRIVE`.
2. Define `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` en `backend/.dev.vars`.
3. Reinicia `bun run dev` para que `scripts/dev.ts` propague las variables locales a Wrangler.
4. Verifica que el arranque muestre `env.HYPERDRIVE (...) Hyperdrive Config local`.

Si aparece `proxy request failed` o `EHOSTUNREACH`, la conexión local no es accesible desde tu máquina. Usa una cadena de conexión Postgres válida y con `sslmode=require`.

#### Comandos para replicarlo

```bash
cd backend
bunx wrangler hyperdrive create semillas-db --connection-string "postgresql://postgres:..."
wrangler hyperdrive list
bun run dev
```

#### Qué hacer en Cloudflare

1. Crear o reutilizar un Hyperdrive.
2. Copiar su id y dejarlo en `backend/wrangler.toml`.
3. Confirmar que el binding se llame exactamente `HYPERDRIVE`.

#### Qué hacer en Supabase

1. Ir a `Settings -> Database -> Connection string`.
2. Copiar la cadena de Postgres que pueda usarse desde tu máquina.
3. Asegurar `sslmode=require`.

Desarrollo: `.dev.vars`
Producción: `bunx wrangler secret put <NAME>`

---

## Comandos Útiles

```bash
bun run dev           # Iniciar servidor local (Wrangler)
bun run typecheck     # Verificar tipos TypeScript
bun run deploy        # Desplegar a Cloudflare Workers
bun run gen:types     # Regenerar database.types.ts

# Seed
bunx supabase db query --linked --file src/db/seed.sql
```
