# Estado del Proyecto Semillas

Este directorio resume qué está hecho, qué está parcial y qué falta para acercar el proyecto al 100%.

## Resumen Ejecutivo

- Base funcional sólida en frontend y backend.
- Documentación existente, pero dispersa y con partes desactualizadas.
- Offline-first, seguridad de administración y consistencia documental siguen como brechas principales.

## Archivos

- `docs/estado-proyecto/tareas.md` - lista priorizada de tareas con estado.
- `docs/estado-proyecto/estado-por-area.md` - resumen por áreas del sistema.
- `docs/estado-proyecto/riesgos-y-brechas.md` - inconsistencias y riesgos detectados.

## Criterio de cierre

El proyecto se puede considerar cercano al 100% cuando:

1. La API y el frontend están alineados en contratos, roles y rutas.
2. El flujo offline usa IndexedDB/Dexie con outbox real y sincronización idempotente completa.
3. Las rutas administrativas y de media tienen seguridad activa y validada.
4. La documentación canónica reemplaza o marca como legacy los docs desactualizados.
5. Hay pruebas y comandos de verificación claros para backend y frontend.
