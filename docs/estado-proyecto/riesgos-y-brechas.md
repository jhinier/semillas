# Riesgos y Brechas

## Riesgos Altos

- Seguridad deshabilitada temporalmente en admin y media.
- Offline-first incompleto: sin Dexie/outbox confirmado, el modo sin internet no está cerrado.
- Documentación desalineada con el stack real, lo que puede inducir trabajo incorrecto.

## Inconsistencias Detectadas

- `docs/documento_guia_RF_RNF_proyecto_semillas.md` menciona NestJS, Prisma y Flutter, pero el repo usa Bun, React, Vite y Hono.
- `docs/backend-api.md` y el backend no coinciden del todo en roles y algunas rutas.
- `docs/media-storage.md` asume controles que en código están temporalmente apagados.
- Los README de `backend/` y `frontend/` no describen bien Semillas.

## Brechas Operativas

- Falta una guía única de instalación y despliegue.
- Falta una guía de pruebas y calidad por área.
- Falta un índice de documentación con estado de vigencia.

## Recomendacion

Primero cerrar seguridad, offline y contratos; después limpiar y consolidar documentación.
