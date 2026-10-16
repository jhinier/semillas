# Baseline de cobertura

Ejecutado el 13 de julio de 2026 con:

```bash
bun run test:coverage
```

Resultado reproducible:

| Paquete | Funciones | Líneas |
|---|---:|---:|
| Backend | 73.44% | 76.05% |
| Frontend | 56.21% | 67.82% |

La suite tuvo 621 tests frontend y 222 tests backend sin fallos. Estos valores
son baseline actualizado, no cumplen todavía el objetivo final de cobertura
global ≥80%.
Las principales áreas pendientes son E2E de sincronización, APIs de perfil y
progreso, media-cache y rutas visuales administrativas.
