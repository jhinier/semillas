# Revisión ciega por tercero

Estado: plantilla preparada; falta una ejecución por una persona sin contexto
previo del repositorio.

## Criterio de independencia

El revisor debe recibir únicamente el repositorio, `docs/instalacion.md`,
`docs/manual-usuario.md`, `docs/manual-administrador.md` y las credenciales
temporales entregadas por el responsable de staging. No debe recibir una
explicación oral del flujo.

## Protocolo

1. Clonar el repositorio y seguir `docs/instalacion.md` usando Bun.
2. Confirmar que el entorno local apunta a Supabase remoto y no usa Docker.
3. Ejecutar `bun run check`, `bun run docs:check`, `bun run pwa:check` y
   `bun run performance:bundle`.
4. Ejecutar `bun run smoke:staging` con variables del Environment, sin revelar
   secretos.
5. Seguir el manual de usuario: invitado, onboarding, tema, actividad y PWA.
6. Seguir el manual de administrador: revisión, publicación y archivado de un
   contenido sintético.
7. Verificar backup y manifest con `BACKUP_DIR=... bun run restore:verify` sin
   restaurar sobre producción.
8. Registrar tiempos, pasos ambiguos, errores y correcciones.

## Registro de ejecución

| Campo | Valor |
|---|---|
| Revisor | pendiente |
| Fecha UTC | pendiente |
| Commit/artefacto | pendiente |
| Tiempo de instalación | pendiente |
| Tiempo de pruebas | pendiente |
| Resultado | pendiente |
| Incidencias | pendiente |

La ejecución debe adjuntar logs sanitizados y no incluir tokens, URLs privadas
ni datos personales.
