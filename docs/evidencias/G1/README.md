# Evidencia del Gate G1

## Alcance ejecutado

- Se retiró la conexión PostgreSQL con credenciales de `backend/wrangler.toml`.
- `backend/.env.example` contiene únicamente placeholders.
- El middleware de rate limiting devuelve `429`, `RATE_LIMIT_EXCEEDED` y
  `Retry-After`, y usa el binding de Cloudflare cuando está disponible.
- Los errores desconocidos responden con un mensaje seguro y el log solo incluye
  `requestId` y el tipo de error.
- Los scripts operativos también exigen `SUPABASE_DATABASE_URL`; no existe una
  conexión PostgreSQL por defecto versionada.
- La prueba `backend/src/openapi/paridad-rutas.test.ts` compara las operaciones
  registradas por Hono contra OpenAPI, verifica las rutas canónicas y evita el
  regreso de aliases legacy; también cubre el endpoint de reclamo de logros.

## Verificación reproducible

```bash
bun run test:seguridad
bun test backend/src/shared/middleware/rate-limit.middleware.test.ts
bun test backend/src/shared/middleware/error-handler.test.ts
bun test backend/src/openapi/paridad-rutas.test.ts
bun run --cwd backend typecheck
bun run db:lint
```

`bun run db:lint` se ejecutó contra el proyecto Supabase remoto enlazado el
13-07-2026 y reportó `No schema errors found`. No se inició Docker ni
Supabase local. Los tests pgTAP requieren `pg_prove`/contenedor en la CLI; la
conectividad directa del host PostgreSQL remoto no está disponible desde este
entorno, por lo que esa parte permanece como evidencia externa pendiente.

La rotación efectiva de la credencial que estuvo versionada y la validación RLS
contra un proyecto Supabase remoto de desarrollo siguen siendo acciones
operativas pendientes; no se usa una instancia local ni Docker.
