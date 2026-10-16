-- Recompensas idempotentes por retos cooperativos de clubes.
CREATE TABLE IF NOT EXISTS recompensa_reto_club_usuario (
  reto_id uuid NOT NULL REFERENCES reto_club(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  xp_otorgada int NOT NULL DEFAULT 0,
  reclamado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (reto_id, usuario_id),
  CHECK (xp_otorgada >= 0)
);

CREATE INDEX IF NOT EXISTS ix_recompensa_reto_club_usuario_usuario
  ON recompensa_reto_club_usuario(usuario_id, reclamado_en DESC);
