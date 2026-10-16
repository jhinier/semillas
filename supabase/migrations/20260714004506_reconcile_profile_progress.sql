-- Repara proyectos creados con un esquema anterior a las migraciones actuales.
-- Todas las operaciones son idempotentes para poder ejecutarse con seguridad una vez.

ALTER TABLE public.perfil
  ADD COLUMN IF NOT EXISTS clave_avatar text;

CREATE TABLE IF NOT EXISTS public.progreso_tema_usuario (
  usuario_id uuid NOT NULL REFERENCES public.usuario_app(id) ON DELETE CASCADE,
  tema_id uuid NOT NULL REFERENCES public.tema(id) ON DELETE CASCADE,
  estado text NOT NULL DEFAULT 'no_iniciado',
  porcentaje numeric(5,2) NOT NULL DEFAULT 0,
  ultimo_paso_id uuid REFERENCES public.paso_tema(id),
  iniciado_en timestamptz,
  completado_en timestamptz,
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, tema_id)
);

ALTER TABLE public.progreso_tema_usuario
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'no_iniciado',
  ADD COLUMN IF NOT EXISTS porcentaje numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ultimo_paso_id uuid REFERENCES public.paso_tema(id),
  ADD COLUMN IF NOT EXISTS iniciado_en timestamptz,
  ADD COLUMN IF NOT EXISTS completado_en timestamptz,
  ADD COLUMN IF NOT EXISTS actualizado_en timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS uq_progreso_tema_usuario_usuario_tema
  ON public.progreso_tema_usuario (usuario_id, tema_id);

CREATE TABLE IF NOT EXISTS public.progreso_actividad_usuario (
  usuario_id uuid NOT NULL REFERENCES public.usuario_app(id) ON DELETE CASCADE,
  actividad_id uuid NOT NULL REFERENCES public.actividad(id) ON DELETE CASCADE,
  intentos integer NOT NULL DEFAULT 0,
  mejor_puntaje numeric(5,2) NOT NULL DEFAULT 0,
  completado boolean NOT NULL DEFAULT false,
  completado_en timestamptz,
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, actividad_id)
);

ALTER TABLE public.progreso_actividad_usuario
  ADD COLUMN IF NOT EXISTS intentos integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mejor_puntaje numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completado_en timestamptz,
  ADD COLUMN IF NOT EXISTS actualizado_en timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS uq_progreso_actividad_usuario_usuario_actividad
  ON public.progreso_actividad_usuario (usuario_id, actividad_id);
