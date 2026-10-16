# Despliegue

**Owner:** M9 · **Revisión:** 2026-07-13

El Worker Hono se despliega con Wrangler y la PWA con Cloudflare Pages o
Workers Assets. Staging y producción usan secretos y proyectos Supabase
separados.

```bash
bun run build
bun run deploy:backend:staging
bun run deploy:frontend:staging
bun run smoke:staging
```

La PWA se publica como un directorio estatico de Cloudflare Pages mediante
`wrangler pages deploy`; no se genera APK ni se levanta Supabase local. Para
produccion se usan `deploy:backend:production`, `deploy:frontend:production` y
`smoke:production` despues de la aprobacion del entorno correspondiente.

Antes de producción: backup verificado, migraciones compatibles, smoke de
health/OpenAPI/PWA y aprobación manual. Nunca se imprimen valores de secretos.
Para revertir el Worker se usa el version ID anterior de Wrangler; la base de
datos se recupera en un proyecto limpio, no con migraciones destructivas.
