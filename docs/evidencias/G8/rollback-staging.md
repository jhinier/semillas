# Evidencia de rollback en staging

Estado: **plantilla preparada; simulacro pendiente de ejecutar en staging**.

Este registro debe completarse únicamente con un entorno de staging. Nunca se
debe probar el simulacro sobre producción. El procedimiento operativo está en
[`docs/operacion/rollback.md`](../../operacion/rollback.md).

## Registro previo

| Campo | Valor |
|---|---|
| Fecha UTC | pendiente |
| Responsable | pendiente |
| Entorno | staging |
| Worker version ID actual | pendiente |
| Worker version ID anterior | pendiente |
| SHA del frontend actual | pendiente |
| SHA del frontend anterior | pendiente |
| Migración aplicada | pendiente |
| Backup verificado | pendiente |
| RTO objetivo | pendiente |

## Simulacro

- [ ] Registrar versiones y backup antes del cambio.
- [ ] Introducir un fallo controlado y no destructivo.
- [ ] Ejecutar rollback del Worker con Wrangler.
- [ ] Redeployar el artifact frontend anterior aprobado.
- [ ] Validar migración/restore solo en un proyecto remoto limpio si aplica.
- [ ] Ejecutar smoke read-only y comprobar health, OpenAPI, PWA y headers.
- [ ] Medir tiempo total, errores y decisión de recuperación.

## Resultado

| Campo | Valor |
|---|---|
| Inicio UTC | pendiente |
| Fin UTC | pendiente |
| Tiempo total | pendiente |
| Smoke posterior | pendiente |
| ¿Cumple RTO? | pendiente |
| Incidencias | pendiente |
| Revisor | pendiente |

No se deben incluir tokens, URLs privadas, nombres reales de usuarios ni
credenciales en este documento.
