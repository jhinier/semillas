# Base de datos y Storage

**Owner:** M7 · **Revisión:** 2026-07-13

PostgreSQL en Supabase es la fuente persistente. Las migraciones están en
`supabase/migrations/` y deben ejecutarse en orden con `bun run db:migrate`.

## Dominios principales

- Identidad: `usuario_app`, `perfil`, `vinculo_tutor_menor`.
- Contenido: `senda`, `tema`, `paso_tema`, `contenido_paso_tema`, `actividad`.
- Progreso: `progreso_tema_usuario`, `progreso_actividad_usuario`,
  `evento_progreso`, `racha_usuario`.
- Social: `club`, `miembro_club`, `reto_club`, `recompensa_reto_club_usuario`, `reporte_club`.
- Gobierno: `revision_contenido`, `registro_auditoria`,
  `configuracion_plataforma`.

El backend usa `service_role` y el navegador no accede a tablas privadas. RLS,
permisos y pruebas SQL están en `supabase/tests/`.

## Integridad

Los eventos se identifican por usuario y `evento_id_cliente`; el backend calcula
XP y puntaje. Las claves foráneas y restricciones de unicidad impiden duplicar
recompensas y relaciones. `miembro_club.token_publico` es el identificador
opaco que se entrega a clientes para acciones sociales. `reporte_club` limita categorías y estados mediante
checks, conserva el actor de resolución y audita creación/resolución dentro de
una transacción del backend.

La publicación usa `publicar_tema_con_auditoria`, una función PostgreSQL que
actualiza la versión e inserta el registro anterior/nuevo en la misma
transacción.
