-- Una finalización autoritativa de tema solo puede producir una recompensa por usuario.
create unique index if not exists uq_evento_progreso_recompensa_tema
  on public.evento_progreso (usuario_id, tema_id)
  where tipo_evento = 'tema_completado' and tema_id is not null and xp_otorgada > 0;

-- Las recompensas derivadas de insignias y retos quedan protegidas por su clave de origen.
create unique index if not exists uq_evento_progreso_recompensa_logro
  on public.evento_progreso (usuario_id, ((datos ->> 'logro_id')))
  where tipo_evento = 'recompensa_reclamada' and (datos ->> 'logro_id') is not null;

create unique index if not exists uq_evento_progreso_recompensa_reto
  on public.evento_progreso (usuario_id, ((datos ->> 'reto_club_id')))
  where tipo_evento = 'recompensa_reclamada' and (datos ->> 'reto_club_id') is not null;
