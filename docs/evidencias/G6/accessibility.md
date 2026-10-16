# G6 — Evidencia de accesibilidad pública

Fecha: 2026-07-13.

Comando:

```bash
bun run test:accessibility:e2e
```

Resultado: 4 pruebas exitosas con `@axe-core/playwright`, sobre `/`,
`/login`, `/recuperar-contrasena` y `/verificar-correo`, sin violaciones de
impacto `critical` o `serious`.

Las rutas protegidas (home, CRECER, perfil y CMS) requieren una identidad de
staging controlada y permanecen pendientes de aceptación externa.
