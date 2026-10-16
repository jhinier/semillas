# Pruebas y calidad

**Owner:** M9 · **Revisión:** 2026-07-13

Comandos base:

```bash
bun run test
bun run test:e2e
bun run --cwd backend typecheck
bun run --cwd frontend typecheck
bun run build
bun run test:seguridad
bun run test:trazabilidad
```

Las pruebas unitarias cubren casos de uso, middleware, schemas y contratos. Las
pruebas E2E deben usar datos sintéticos y no credenciales personales. Un cambio
de requisito debe actualizar código, prueba y `docs/trazabilidad/requisitos.json`.
