CREATE TABLE IF NOT EXISTS reporte_club (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES club(id) ON DELETE CASCADE,
  reportado_por uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  reportado_usuario_id uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  categoria text NOT NULL CHECK (categoria IN ('contenido_inapropiado', 'acoso', 'datos_personales', 'otro')),
  detalle varchar(500),
  estado text NOT NULL DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_revision', 'resuelto', 'descartado')),
  resuelto_por uuid REFERENCES usuario_app(id) ON DELETE SET NULL,
  nota_resolucion varchar(500),
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_reporte_club_estado ON reporte_club(estado, creado_en DESC);
CREATE INDEX IF NOT EXISTS ix_reporte_club_reportante ON reporte_club(reportado_por, creado_en DESC);
CREATE INDEX IF NOT EXISTS ix_reporte_club_reportado ON reporte_club(reportado_usuario_id, creado_en DESC);
ALTER TABLE reporte_club ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE reporte_club FROM anon, authenticated;
