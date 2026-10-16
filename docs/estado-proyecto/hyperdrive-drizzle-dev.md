# Hyperdrive y Drizzle en `wrangler dev`

## Resumen
El backend estaba fallando al actualizar `/perfil/actualizar` en desarrollo local porque Drizzle no estaba recibiendo una conexión Postgres válida desde `wrangler dev`.

La solución fue conectar el Worker a la base mediante **Hyperdrive** y pasar una conexión local válida en `backend/.dev.vars`.

## Síntoma
- `PATCH /perfil/actualizar` devolvía `500`.
- El log mostraba errores como `DrizzleQueryError` y `proxy request failed, cannot connect to the specified address`.
- `wrangler dev` pedía una conexión local para emular Hyperdrive.

## Causa raíz
1. El Worker local estaba intentando usar una conexión Postgres que no estaba disponible para el runtime.
2. `SUPABASE_DATABASE_URL` por sí sola no resolvía el acceso de Drizzle en este flujo.
3. `wrangler dev` necesita un binding `HYPERDRIVE` y una `localConnectionString` para conectar correctamente en desarrollo.

## Lo que se hizo
### Configuración de Cloudflare
- Se agregó el binding Hyperdrive en `backend/wrangler.toml`.
- Se usó el id de Hyperdrive: `297d244456374dc3a12cef0c4ddb7795`.
- Se configuró una conexión local para Hyperdrive en `backend/.dev.vars` con la variable:
  - `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`

## Cómo replicarlo
### En Supabase
1. Ir a `Settings -> Database -> Connection string`.
2. Copiar la conexión de Postgres compatible con TLS.
3. Usar una URL accesible desde tu máquina y con `sslmode=require`.

### En Cloudflare
1. Crear el Hyperdrive o reutilizar uno existente.
2. Ver el id con `wrangler hyperdrive list` o `wrangler hyperdrive get <ID>`.
3. Confirmar que `backend/wrangler.toml` tenga:
   ```toml
   [[hyperdrive]]
   binding = "HYPERDRIVE"
   id = "297d244456374dc3a12cef0c4ddb7795"
   ```

### Comandos
```bash
cd backend
bunx wrangler hyperdrive create semillas-db --connection-string "postgresql://postgres:..."
wrangler hyperdrive list
bun run dev
```

### Variables locales
```env
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgresql://.../postgres?sslmode=require
```

### Arranque local
- Se ajustó `scripts/dev.ts` para cargar `backend/.dev.vars` y pasar esas variables al proceso de `wrangler dev`.
- Esto fue necesario porque el launcher no siempre propagaba la variable local de Hyperdrive como se esperaba.

### Runtime del backend
- `backend/src/app.ts` quedó inyectando `drizzle` solo cuando existe `HYPERDRIVE`.
- `backend/src/db/client.ts` sigue creando el cliente Drizzle desde `HYPERDRIVE`.
- `backend/src/modules/users/usuario.repository.ts` volvió a usar Drizzle como camino principal.

## Validación
Se verificó que `bun run dev` arranca con:
- `Found a non-empty CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE variable for binding`
- `env.HYPERDRIVE (...) Hyperdrive Config local`
- `Ready on http://localhost:8787`

Y que el Worker ya expone el binding correcto para desarrollo local.

## Archivos tocados
- `backend/wrangler.toml`
- `backend/.dev.vars`
- `backend/src/app.ts`
- `backend/src/db/client.ts`
- `backend/src/modules/users/usuario.repository.ts`
- `scripts/dev.ts`

## Nota operativa
Si vuelve a aparecer un error de conexión como `EHOSTUNREACH` o `proxy request failed`, revisar que la `localConnectionString` apunte a una URL de Postgres accesible desde tu máquina y que tenga `sslmode=require`.
