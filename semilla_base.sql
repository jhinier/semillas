-- ============================================================
--  SEMILLAS · Base de datos adaptada MVP + escalable
--  Stack sugerido: React PWA + Hono API + PostgreSQL (Supabase/Neon)
--  Versión: 2.0 adaptada
--  Fecha: 2026-07-05
--
--  Cómo levantar:
--    createdb semillas
--    psql -d semillas -f semillas_bd_espanol_mvp.sql
--
--  En Supabase:
--    SQL Editor -> pegar/ejecutar este archivo completo.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
--  0. TIPOS ENUMERADOS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE estado_publicacion AS ENUM ('borrador', 'revision', 'aprobado', 'publicado', 'archivado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rol_usuario AS ENUM ('administrador', 'usuario', 'invitado', 'padre');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE proveedor_autenticacion AS ENUM ('google', 'facebook', 'invitado', 'correo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_recurso_multimedia AS ENUM ('imagen', 'audio', 'video', 'documento', 'icono');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE estado_revision_contenido AS ENUM ('borrador', 'enviado', 'cambios_solicitados', 'aprobado', 'publicado', 'rechazado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_evento_progreso AS ENUM (
    'tema_iniciado',
    'tema_completado',
    'bloque_iniciado',
    'bloque_completado',
    'actividad_iniciada',
    'actividad_respondida',
    'actividad_completada',
    'recompensa_reclamada',
    'tema_descargado',
    'marcador_sincronizacion'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
--  1. CATÁLOGOS BASE
-- ============================================================

CREATE TABLE IF NOT EXISTS grupo_edad (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo        text NOT NULL UNIQUE,
  nombre        text NOT NULL,
  edad_minima   int NOT NULL,
  edad_maxima   int NOT NULL,
  descripcion   text,
  imagen_url    text,
  orden         int NOT NULL UNIQUE,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  CHECK (edad_minima >= 0),
  CHECK (edad_maxima >= edad_minima)
);

CREATE TABLE IF NOT EXISTS testamento_biblico (
  id          smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo        text NOT NULL UNIQUE,
  nombre        text NOT NULL
);

CREATE TABLE IF NOT EXISTS libro_biblico (
  id            smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  testamento_id  smallint NOT NULL REFERENCES testamento_biblico(id),
  nombre          text NOT NULL UNIQUE,
  orden    smallint NOT NULL UNIQUE,
  CHECK (orden BETWEEN 1 AND 66)
);

CREATE TABLE IF NOT EXISTS version_biblica (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo               text NOT NULL UNIQUE,
  nombre               text NOT NULL,
  dominio_publico   boolean NOT NULL DEFAULT false,
  creado_en         timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tipo_paso_crecer (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          text NOT NULL UNIQUE,
  nombre          text NOT NULL,
  descripcion   text,
  orden    int NOT NULL UNIQUE,
  color_hex     text,
  CHECK (color_hex IS NULL OR color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE IF NOT EXISTS tipo_actividad (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          text NOT NULL UNIQUE,
  nombre          text NOT NULL,
  descripcion   text,
  es_juego       boolean NOT NULL DEFAULT true,
  activo     boolean NOT NULL DEFAULT true,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS regla_nivel (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_nivel    int NOT NULL UNIQUE,
  nombre        text NOT NULL,
  xp_minima      int NOT NULL UNIQUE,
  color_insignia text DEFAULT '#6D35E8',
  CHECK (numero_nivel > 0),
  CHECK (xp_minima >= 0),
  CHECK (color_insignia IS NULL OR color_insignia ~ '^#[0-9A-Fa-f]{6}$')
);

-- ============================================================
--  2. USUARIOS, PERFILES Y ADULTOS/TUTORES
-- ============================================================

CREATE TABLE IF NOT EXISTS usuario_app (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rol           rol_usuario NOT NULL DEFAULT 'usuario',
  proveedor       proveedor_autenticacion NOT NULL,
  id_externo    text,
  token_invitado_hash text,
  correo          text,
  nombre_visible   text NOT NULL,
  activo      boolean NOT NULL DEFAULT true,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  actualizado_en     timestamptz NOT NULL DEFAULT now(),
  ultimo_login_en  timestamptz,
  CONSTRAINT ux_usuario_app_proveedor_id_externo UNIQUE (proveedor, id_externo),
  CONSTRAINT ck_id_externo_para_no_invitado CHECK (
    proveedor = 'invitado' OR id_externo IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS ix_usuario_app_correo ON usuario_app(correo);
CREATE INDEX IF NOT EXISTS ix_usuario_app_rol ON usuario_app(rol);

CREATE TABLE IF NOT EXISTS perfil (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id          uuid NOT NULL UNIQUE REFERENCES usuario_app(id) ON DELETE CASCADE,
  apodo         text NOT NULL,
  grupo_edad_id     uuid REFERENCES grupo_edad(id),
  url_avatar       text,
  clave_avatar       text,
  prefiere_audio  boolean NOT NULL DEFAULT true,
  tamano_texto_preferido text NOT NULL DEFAULT 'mediano',
  creado_en       timestamptz NOT NULL DEFAULT now(),
  actualizado_en       timestamptz NOT NULL DEFAULT now(),
  CHECK (tamano_texto_preferido IN ('pequeno', 'mediano', 'grande'))
);

-- Vinculación padre/tutor <-> menor. Útil para las pantallas de padres.
CREATE TABLE IF NOT EXISTS vinculo_tutor_menor (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id    uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  menor_id       uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  relacion   text NOT NULL DEFAULT 'tutor',
  estado         text NOT NULL DEFAULT 'pendiente',
  codigo_invitacion    text UNIQUE,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  aceptado_en    timestamptz,
  CHECK (estado IN ('pendiente', 'aceptado', 'revocado')),
  CHECK (tutor_id <> menor_id),
  UNIQUE (tutor_id, menor_id)
);

-- ============================================================
--  3. MULTIMEDIA / RECURSOS
-- ============================================================

CREATE TABLE IF NOT EXISTS recurso_multimedia (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo           tipo_recurso_multimedia NOT NULL,
  bucket_almacenamiento text,
  clave_almacenamiento    text,
  url_publica     text NOT NULL,
  texto_alternativo       text,
  titulo          text,
  tipo_mime      text,
  tamano_bytes     bigint,
  duracion_seg   int,
  ancho_px       int,
  alto_px      int,
  activo        boolean NOT NULL DEFAULT true,
  creado_por     uuid REFERENCES usuario_app(id),
  creado_en     timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (tamano_bytes IS NULL OR tamano_bytes >= 0),
  CHECK (duracion_seg IS NULL OR duracion_seg >= 0)
);

CREATE INDEX IF NOT EXISTS ix_recurso_multimedia_tipo ON recurso_multimedia(tipo);

CREATE TABLE IF NOT EXISTS senda (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          text NOT NULL UNIQUE,
  nombre          text NOT NULL,
  descripcion   text,
  color_hex     text NOT NULL,
  nombre_icono     text,
  imagen_recurso_id uuid REFERENCES recurso_multimedia(id) ON DELETE SET NULL,
  orden    int NOT NULL UNIQUE,
  activo     boolean NOT NULL DEFAULT true,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

-- ============================================================
--  4. CONTENIDO: TEMAS, VERSIONES POR EDAD Y CRECER
-- ============================================================

CREATE TABLE IF NOT EXISTS tema (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senda_id             uuid NOT NULL REFERENCES senda(id),
  titulo               text NOT NULL,
  slug                text NOT NULL UNIQUE,
  objetivo           text NOT NULL,
  resumen             text,
  portada_recurso_id      uuid REFERENCES recurso_multimedia(id),
  version_biblica_id    uuid REFERENCES version_biblica(id),
  estado              estado_publicacion NOT NULL DEFAULT 'borrador',
  xp_recompensa           int NOT NULL DEFAULT 0,
  minutos_estimados   int NOT NULL DEFAULT 5,
  version_contenido     int NOT NULL DEFAULT 1,
  creado_por          uuid REFERENCES usuario_app(id),
  revisado_por         uuid REFERENCES usuario_app(id),
  publicado_por        uuid REFERENCES usuario_app(id),
  creado_en          timestamptz NOT NULL DEFAULT now(),
  actualizado_en          timestamptz NOT NULL DEFAULT now(),
  revisado_en         timestamptz,
  publicado_en        timestamptz,
  CHECK (xp_recompensa >= 0),
  CHECK (minutos_estimados > 0)
);

CREATE INDEX IF NOT EXISTS ix_tema_senda_estado ON tema(senda_id, estado);
CREATE INDEX IF NOT EXISTS ix_tema_slug ON tema(slug);

CREATE TABLE IF NOT EXISTS tema_grupo_edad (
  tema_id       uuid NOT NULL REFERENCES tema(id) ON DELETE CASCADE,
  grupo_edad_id   uuid NOT NULL REFERENCES grupo_edad(id),
  PRIMARY KEY (tema_id, grupo_edad_id)
);

CREATE TABLE IF NOT EXISTS referencia_biblica (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id        uuid NOT NULL REFERENCES tema(id) ON DELETE CASCADE,
  libro_id         smallint NOT NULL REFERENCES libro_biblico(id),
  capitulo         int NOT NULL,
  versiculo_inicio     int NOT NULL,
  versiculo_fin       int NOT NULL,
  principal         boolean NOT NULL DEFAULT true,
  CHECK (capitulo > 0),
  CHECK (versiculo_inicio > 0),
  CHECK (versiculo_fin >= versiculo_inicio)
);

CREATE TABLE IF NOT EXISTS versiculo_clave (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id        uuid NOT NULL UNIQUE REFERENCES tema(id) ON DELETE CASCADE,
  texto            text NOT NULL,
  libro_id         smallint NOT NULL REFERENCES libro_biblico(id),
  capitulo         int NOT NULL,
  versiculo           int NOT NULL,
  CHECK (capitulo > 0),
  CHECK (versiculo > 0)
);

CREATE TABLE IF NOT EXISTS paso_tema (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id            uuid NOT NULL REFERENCES tema(id) ON DELETE CASCADE,
  tipo_paso_id        uuid NOT NULL REFERENCES tipo_paso_crecer(id),
  orden          int NOT NULL,
  obligatorio         boolean NOT NULL DEFAULT true,
  creado_en          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tema_id, tipo_paso_id),
  UNIQUE (tema_id, orden)
);

CREATE TABLE IF NOT EXISTS contenido_paso_tema (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paso_id           uuid NOT NULL REFERENCES paso_tema(id) ON DELETE CASCADE,
  grupo_edad_id      uuid NOT NULL REFERENCES grupo_edad(id),
  titulo             text NOT NULL,
  cuerpo              text NOT NULL,
  instruccion_corta text,
  recurso_id          uuid REFERENCES recurso_multimedia(id),
  recurso_audio_id    uuid REFERENCES recurso_multimedia(id),
  datos_extra             jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (paso_id, grupo_edad_id)
);

CREATE INDEX IF NOT EXISTS ix_contenido_paso_tema_datos_extra_gin ON contenido_paso_tema USING gin(datos_extra);

CREATE TABLE IF NOT EXISTS pregunta_reflexion (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paso_id        uuid NOT NULL REFERENCES paso_tema(id) ON DELETE CASCADE,
  grupo_edad_id   uuid NOT NULL REFERENCES grupo_edad(id),
  pregunta       text NOT NULL,
  orden     int NOT NULL,
  UNIQUE (paso_id, grupo_edad_id, orden)
);

-- ============================================================
--  5. ACTIVIDADES Y JUEGOS
--
--  Diseño híbrido:
--  - actividad mantiene lo común en 3FN.
--  - configuracion JSONB permite muchos tipos de juegos sin migrar cada vez.
--  Esto acelera el MVP y deja el CMS flexible.
-- ============================================================

CREATE TABLE IF NOT EXISTS actividad (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id            uuid NOT NULL REFERENCES tema(id) ON DELETE CASCADE,
  paso_id             uuid REFERENCES paso_tema(id) ON DELETE CASCADE,
  grupo_edad_id        uuid NOT NULL REFERENCES grupo_edad(id),
  tipo_actividad_id    uuid NOT NULL REFERENCES tipo_actividad(id),
  titulo               text NOT NULL,
  consigna              text NOT NULL,
  retroalimentacion            text,
  orden          int NOT NULL,
  xp_recompensa           int NOT NULL DEFAULT 10,
  limite_tiempo_seg      int,
  dificultad          text NOT NULL DEFAULT 'normal',
  configuracion              jsonb NOT NULL DEFAULT '{}'::jsonb,
  obligatorio         boolean NOT NULL DEFAULT true,
  creado_en          timestamptz NOT NULL DEFAULT now(),
  actualizado_en          timestamptz NOT NULL DEFAULT now(),
  CHECK (xp_recompensa >= 0),
  CHECK (limite_tiempo_seg IS NULL OR limite_tiempo_seg > 0),
  CHECK (dificultad IN ('facil', 'normal', 'dificil')),
  UNIQUE (tema_id, grupo_edad_id, orden)
);

CREATE INDEX IF NOT EXISTS ix_actividad_tema_edad ON actividad(tema_id, grupo_edad_id);
CREATE INDEX IF NOT EXISTS ix_actividad_tipo ON actividad(tipo_actividad_id);
CREATE INDEX IF NOT EXISTS ix_actividad_configuracion_gin ON actividad USING gin(configuracion);

-- Para respuestas configuradas de forma más normalizada cuando haga falta.
-- No reemplaza configuracion JSONB; se usa especialmente para cuestionario/completar.
CREATE TABLE IF NOT EXISTS opcion_actividad (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id     uuid NOT NULL REFERENCES actividad(id) ON DELETE CASCADE,
  etiqueta          text,
  texto           text NOT NULL,
  correcta     boolean NOT NULL DEFAULT false,
  orden     int NOT NULL,
  retroalimentacion       text,
  UNIQUE (actividad_id, orden)
);

-- ============================================================
--  6. PROGRESO, SINCRONIZACIÓN SIN CONEXIÓN Y GAMIFICACIÓN
-- ============================================================

-- Evento de solo agregado e idempotente. El cliente genera id_evento_cliente.
-- Sirve para sincronizar progreso sin conexión sin duplicar XP.
CREATE TABLE IF NOT EXISTS evento_progreso (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id             uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  id_evento_cliente     uuid NOT NULL,
  tipo_evento          tipo_evento_progreso NOT NULL,
  tema_id            uuid REFERENCES tema(id),
  paso_id             uuid REFERENCES paso_tema(id),
  actividad_id         uuid REFERENCES actividad(id),
  correcta          boolean,
  puntaje               numeric(5,2),
  xp_otorgada          int NOT NULL DEFAULT 0,
  datos             jsonb NOT NULL DEFAULT '{}'::jsonb,
  ocurrido_en_cliente  timestamptz NOT NULL,
  recibido_en_servidor  timestamptz NOT NULL DEFAULT now(),
  dispositivo_id           text,
  CHECK (xp_otorgada >= 0),
  UNIQUE (usuario_id, id_evento_cliente)
);

CREATE INDEX IF NOT EXISTS ix_evento_progreso_usuario_tiempo ON evento_progreso(usuario_id, recibido_en_servidor DESC);
CREATE INDEX IF NOT EXISTS ix_evento_progreso_tema ON evento_progreso(tema_id);
CREATE INDEX IF NOT EXISTS ix_evento_progreso_actividad ON evento_progreso(actividad_id);
CREATE INDEX IF NOT EXISTS ix_evento_progreso_tipo ON evento_progreso(tipo_evento);
CREATE INDEX IF NOT EXISTS ix_evento_progreso_datos_gin ON evento_progreso USING gin(datos);

-- Una actividad solo puede otorgar XP una vez por usuario. Los reintentos siguen
-- registrándose, pero no pueden inflar el total de experiencia.
WITH recompensas_repetidas AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY usuario_id, actividad_id
           ORDER BY recibido_en_servidor, id
         ) AS numero
  FROM evento_progreso
  WHERE actividad_id IS NOT NULL AND xp_otorgada > 0
)
UPDATE evento_progreso evento
SET xp_otorgada = 0
FROM recompensas_repetidas repetida
WHERE evento.id = repetida.id AND repetida.numero > 1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evento_progreso_recompensa_actividad
  ON evento_progreso(usuario_id, actividad_id)
  WHERE actividad_id IS NOT NULL AND xp_otorgada > 0;

-- Resumen práctico para acelerar pantallas. La fuente de verdad sigue siendo evento_progreso.
CREATE TABLE IF NOT EXISTS progreso_tema_usuario (
  usuario_id             uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  tema_id            uuid NOT NULL REFERENCES tema(id) ON DELETE CASCADE,
  estado              text NOT NULL DEFAULT 'no_iniciado',
  porcentaje             numeric(5,2) NOT NULL DEFAULT 0,
  ultimo_paso_id        uuid REFERENCES paso_tema(id),
  iniciado_en          timestamptz,
  completado_en        timestamptz,
  actualizado_en          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, tema_id),
  CHECK (estado IN ('no_iniciado', 'en_progreso', 'completado')),
  CHECK (porcentaje >= 0 AND porcentaje <= 100)
);

CREATE TABLE IF NOT EXISTS progreso_actividad_usuario (
  usuario_id             uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  actividad_id         uuid NOT NULL REFERENCES actividad(id) ON DELETE CASCADE,
  intentos            int NOT NULL DEFAULT 0,
  mejor_puntaje          numeric(5,2) NOT NULL DEFAULT 0,
  completado        boolean NOT NULL DEFAULT false,
  completado_en        timestamptz,
  actualizado_en          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, actividad_id),
  CHECK (intentos >= 0),
  CHECK (mejor_puntaje >= 0 AND mejor_puntaje <= 100)
);

CREATE TABLE IF NOT EXISTS logro (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo           text NOT NULL UNIQUE,
  nombre           text NOT NULL,
  descripcion    text,
  url_icono       text,
  codigo_criterio text NOT NULL,
  valor_criterio int,
  bono_xp       int NOT NULL DEFAULT 0,
  activo      boolean NOT NULL DEFAULT true,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  CHECK (bono_xp >= 0)
);

CREATE TABLE IF NOT EXISTS logro_usuario (
  usuario_id          uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  logro_id   uuid NOT NULL REFERENCES logro(id),
  ganado_en        timestamptz NOT NULL DEFAULT now(),
  reclamado_en     timestamptz,
  PRIMARY KEY (usuario_id, logro_id)
);

-- Descargas sin conexión. El contenido real vive en IndexedDB; aquí se registra estado/sync.
CREATE TABLE IF NOT EXISTS paquete_sin_conexion (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id         uuid NOT NULL REFERENCES tema(id) ON DELETE CASCADE,
  version_contenido  int NOT NULL,
  manifiesto         jsonb NOT NULL DEFAULT '{}'::jsonb,
  tamano_bytes       bigint NOT NULL DEFAULT 0,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tema_id, version_contenido),
  CHECK (tamano_bytes >= 0)
);

CREATE TABLE IF NOT EXISTS descarga_sin_conexion_usuario (
  usuario_id          uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  paquete_id       uuid NOT NULL REFERENCES paquete_sin_conexion(id) ON DELETE CASCADE,
  descargado_en    timestamptz NOT NULL DEFAULT now(),
  ultimo_abierto_en   timestamptz,
  PRIMARY KEY (usuario_id, paquete_id)
);

-- ============================================================
--  7. CLUBES, RETOS Y SOCIAL LIGERO
-- ============================================================

CREATE TABLE IF NOT EXISTS club (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           text NOT NULL,
  descripcion    text,
  codigo_invitacion    text NOT NULL UNIQUE,
  creado_por     uuid NOT NULL REFERENCES usuario_app(id),
  activo      boolean NOT NULL DEFAULT true,
  creado_en     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS miembro_club (
  club_id       uuid NOT NULL REFERENCES club(id) ON DELETE CASCADE,
  usuario_id       uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  rol_miembro   text NOT NULL DEFAULT 'miembro',
  unido_en     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (club_id, usuario_id),
  CHECK (rol_miembro IN ('propietario', 'lider', 'miembro'))
);

CREATE TABLE IF NOT EXISTS reto_club (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id         uuid REFERENCES club(id) ON DELETE CASCADE,
  nombre            text NOT NULL,
  descripcion     text,
  codigo_metrica     text NOT NULL,
  valor_objetivo    int NOT NULL,
  fecha_inicio       date NOT NULL,
  fecha_fin         date NOT NULL,
  xp_reto       int NOT NULL DEFAULT 0,
  creado_por      uuid REFERENCES usuario_app(id),
  creado_en      timestamptz NOT NULL DEFAULT now(),
  CHECK (valor_objetivo > 0),
  CHECK (xp_reto >= 0),
  CHECK (fecha_fin >= fecha_inicio)
);

CREATE TABLE IF NOT EXISTS tarjeta_compartida (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id       uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  tema_id      uuid REFERENCES tema(id),
  logro_id uuid REFERENCES logro(id),
  url_imagen     text NOT NULL,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

-- Recompensas idempotentes por retos cooperativos de clubes.
CREATE TABLE IF NOT EXISTS recompensa_reto_club_usuario (
  reto_id        uuid NOT NULL REFERENCES reto_club(id) ON DELETE CASCADE,
  usuario_id     uuid NOT NULL REFERENCES usuario_app(id) ON DELETE CASCADE,
  xp_otorgada    int  NOT NULL DEFAULT 0,
  reclamado_en   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (reto_id, usuario_id),
  CHECK (xp_otorgada >= 0)
);

CREATE INDEX IF NOT EXISTS ix_recompensa_reto_club_usuario_usuario
  ON recompensa_reto_club_usuario(usuario_id, reclamado_en DESC);

-- ============================================================
--  8. CMS, REVISIÓN, AUDITORÍA Y REPORTES
-- ============================================================

CREATE TABLE IF NOT EXISTS revision_contenido (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id         uuid NOT NULL REFERENCES tema(id) ON DELETE CASCADE,
  estado           estado_revision_contenido NOT NULL DEFAULT 'enviado',
  enviado_por     uuid REFERENCES usuario_app(id),
  revisado_por      uuid REFERENCES usuario_app(id),
  notas            text,
  notas_envio      text,
  notas_revision   text,
  creado_en       timestamptz NOT NULL DEFAULT now(),
  revisado_en      timestamptz
);

CREATE TABLE IF NOT EXISTS registro_auditoria (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_usuario_id   uuid REFERENCES usuario_app(id),
  accion          text NOT NULL,
  tipo_entidad     text NOT NULL,
  entidad_id       uuid,
  datos_antes     jsonb,
  datos_despues      jsonb,
  direccion_ip      inet,
  agente_usuario      text,
  creado_en      timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION sincronizar_notas_revision_contenido()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.notas_revision IS NOT NULL THEN
    NEW.notas := NEW.notas_revision;
  ELSIF NEW.notas_envio IS NOT NULL THEN
    NEW.notas := NEW.notas_envio;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sincronizar_notas_revision_contenido_trigger ON revision_contenido;
CREATE TRIGGER sincronizar_notas_revision_contenido_trigger
BEFORE INSERT OR UPDATE OF notas, notas_envio, notas_revision ON revision_contenido
FOR EACH ROW EXECUTE FUNCTION sincronizar_notas_revision_contenido();

CREATE INDEX IF NOT EXISTS ix_auditoria_entidad ON registro_auditoria(tipo_entidad, entidad_id);
CREATE INDEX IF NOT EXISTS ix_auditoria_actor_tiempo ON registro_auditoria(actor_usuario_id, creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_revision_contenido_estado_creado_en ON revision_contenido(estado, creado_en DESC);

CREATE TABLE IF NOT EXISTS configuracion_plataforma (
  clave text PRIMARY KEY,
  categoria text NOT NULL,
  valor jsonb NOT NULL,
  descripcion text,
  actualizado_por uuid REFERENCES usuario_app(id) ON DELETE SET NULL,
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

INSERT INTO configuracion_plataforma (clave, categoria, valor, descripcion)
VALUES
  ('administracion.nombre_plataforma', 'administracion', to_jsonb('Semillas'::text), 'Nombre administrativo de la plataforma.'),
  ('administracion.correo_soporte', 'administracion', 'null'::jsonb, 'Correo de soporte de la plataforma.'),
  ('administracion.zona_horaria', 'administracion', to_jsonb('America/Guayaquil'::text), 'Zona horaria de referencia.'),
  ('administracion.notas_obligatorias_cambios', 'administracion', 'true'::jsonb, 'Exige notas al solicitar cambios.'),
  ('administracion.notas_obligatorias_rechazo', 'administracion', 'true'::jsonb, 'Exige motivo al rechazar contenido.')
ON CONFLICT (clave) DO NOTHING;

-- ============================================================
--  9. VISTAS ÚTILES PARA API / REPORTES
-- ============================================================

CREATE OR REPLACE VIEW v_xp_usuario AS
SELECT
  u.id AS usuario_id,
  COALESCE(SUM(pe.xp_otorgada), 0)::int AS xp_total
FROM usuario_app u
LEFT JOIN evento_progreso pe ON pe.usuario_id = u.id
GROUP BY u.id;

CREATE OR REPLACE VIEW v_nivel_usuario AS
SELECT
  ux.usuario_id,
  ux.xp_total,
  (
    SELECT lr.numero_nivel
    FROM regla_nivel lr
    WHERE lr.xp_minima <= ux.xp_total
    ORDER BY lr.xp_minima DESC
    LIMIT 1
  ) AS numero_nivel,
  (
    SELECT lr.nombre
    FROM regla_nivel lr
    WHERE lr.xp_minima <= ux.xp_total
    ORDER BY lr.xp_minima DESC
    LIMIT 1
  ) AS nombre_nivel
FROM v_xp_usuario ux;

CREATE OR REPLACE VIEW v_admin_revisiones
WITH (security_invoker = true)
AS
SELECT
  revision.id,
  revision.tema_id,
  revision.estado,
  revision.notas_envio,
  revision.notas_revision,
  revision.creado_en,
  revision.revisado_en,
  tema.titulo,
  senda.nombre AS senda,
  enviado.nombre_visible AS enviado_por,
  revisado.nombre_visible AS revisado_por
FROM revision_contenido AS revision
JOIN tema ON tema.id = revision.tema_id
JOIN senda ON senda.id = tema.senda_id
LEFT JOIN usuario_app AS enviado ON enviado.id = revision.enviado_por
LEFT JOIN usuario_app AS revisado ON revisado.id = revision.revisado_por;

CREATE OR REPLACE VIEW v_ranking_club AS
SELECT
  cm.club_id,
  cm.usuario_id,
  p.apodo,
  ux.xp_total,
  RANK() OVER (PARTITION BY cm.club_id ORDER BY ux.xp_total DESC) AS numero_ranking
FROM miembro_club cm
JOIN perfil p ON p.usuario_id = cm.usuario_id
JOIN v_xp_usuario ux ON ux.usuario_id = cm.usuario_id;

CREATE OR REPLACE VIEW v_temas_publicos AS
SELECT
  t.id,
  t.slug,
  t.titulo,
  t.objetivo,
  t.resumen,
  t.senda_id,
  p.codigo AS senda_codigo,
  p.nombre AS senda_nombre,
  p.color_hex AS senda_color_hex,
  t.portada_recurso_id,
  t.estado,
  t.xp_recompensa,
  t.minutos_estimados,
  t.version_contenido,
  t.publicado_en
FROM tema t
JOIN senda p ON p.id = t.senda_id
WHERE t.estado = 'publicado';

-- ============================================================
-- 10. DATOS INICIALES DE SEMILLAS
-- ============================================================

INSERT INTO grupo_edad (codigo, nombre, edad_minima, edad_maxima, descripcion, imagen_url, orden) VALUES
  ('semillas', 'Semillas', 5, 8, 'Descubre a Dios con historias y actividades sencillas.', NULL, 1),
  ('exploradores', 'Exploradores', 9, 12, 'Aprende más de Dios y entiende su Palabra.', NULL, 2),
  ('embajadores', 'Embajadores', 13, 17, 'Profundiza tu fe y vive con propósito.', NULL, 3)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO senda (codigo, nombre, descripcion, color_hex, nombre_icono, orden) VALUES
  ('padre', 'Senda del Padre', 'Dios es nuestro Padre amoroso.', '#3D8BD4', 'crown', 1),
  ('hijo', 'Senda del Hijo', 'Jesús es nuestro Salvador y amigo.', '#6D35E8', 'heart', 2),
  ('espiritu', 'Senda del Espíritu Santo', 'El Espíritu Santo nos guía y fortalece.', '#F97316', 'flame', 3)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO testamento_biblico (codigo, nombre) VALUES
  ('AT', 'Antiguo Testamento'),
  ('NT', 'Nuevo Testamento')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO libro_biblico (testamento_id, nombre, orden)
SELECT bt.id, v.nombre, v.orden
FROM (VALUES
  ('AT','Génesis',1),('AT','Éxodo',2),('AT','Levítico',3),('AT','Números',4),
  ('AT','Deuteronomio',5),('AT','Josué',6),('AT','Jueces',7),('AT','Rut',8),
  ('AT','1 Samuel',9),('AT','2 Samuel',10),('AT','1 Reyes',11),('AT','2 Reyes',12),
  ('AT','1 Crónicas',13),('AT','2 Crónicas',14),('AT','Esdras',15),('AT','Nehemías',16),
  ('AT','Ester',17),('AT','Job',18),('AT','Salmos',19),('AT','Proverbios',20),
  ('AT','Eclesiastés',21),('AT','Cantares',22),('AT','Isaías',23),('AT','Jeremías',24),
  ('AT','Lamentaciones',25),('AT','Ezequiel',26),('AT','Daniel',27),('AT','Oseas',28),
  ('AT','Joel',29),('AT','Amós',30),('AT','Abdías',31),('AT','Jonás',32),
  ('AT','Miqueas',33),('AT','Nahúm',34),('AT','Habacuc',35),('AT','Sofonías',36),
  ('AT','Hageo',37),('AT','Zacarías',38),('AT','Malaquías',39),
  ('NT','Mateo',40),('NT','Marcos',41),('NT','Lucas',42),('NT','Juan',43),
  ('NT','Hechos',44),('NT','Romanos',45),('NT','1 Corintios',46),('NT','2 Corintios',47),
  ('NT','Gálatas',48),('NT','Efesios',49),('NT','Filipenses',50),('NT','Colosenses',51),
  ('NT','1 Tesalonicenses',52),('NT','2 Tesalonicenses',53),('NT','1 Timoteo',54),
  ('NT','2 Timoteo',55),('NT','Tito',56),('NT','Filemón',57),('NT','Hebreos',58),
  ('NT','Santiago',59),('NT','1 Pedro',60),('NT','2 Pedro',61),('NT','1 Juan',62),
  ('NT','2 Juan',63),('NT','3 Juan',64),('NT','Judas',65),('NT','Apocalipsis',66)
) AS v(codigo_testamento, nombre, orden)
JOIN testamento_biblico bt ON bt.codigo = v.codigo_testamento
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO version_biblica (codigo, nombre, dominio_publico) VALUES
  ('TLA', 'Traducción en Lenguaje Actual', false),
  ('RVR1960', 'Reina-Valera 1960', false),
  ('RVR1909', 'Reina-Valera 1909', true),
  ('NVI', 'Nueva Versión Internacional', false)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tipo_paso_crecer (codigo, nombre, descripcion, orden, color_hex) VALUES
  ('conectar', 'Conectar', 'Enganche inicial del tema.', 1, '#22A447'),
  ('relatar', 'Relatar', 'Historia bíblica y contexto.', 2, '#2F80ED'),
  ('ensenar', 'Enseñar', 'Verdad central y versículo clave.', 3, '#6D35E8'),
  ('comprobar', 'Comprobar', 'Actividad lúdica para comprobar aprendizaje.', 4, '#F97316'),
  ('experimentar', 'Experimentar', 'Aplicación práctica a la vida.', 5, '#06B6D4'),
  ('recompensar', 'Recompensar', 'Cierre, XP e insignia.', 6, '#FFC83D')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tipo_actividad (codigo, nombre, descripcion, es_juego) VALUES
  ('cuestionario', 'Quiz', 'Preguntas de opción múltiple.', true),
  ('tarjetas_memoria', 'Flashcards', 'Tarjetas de memorización.', true),
  ('completar_versiculo', 'Completar versículo', 'Completar palabras faltantes.', true),
  ('relacionar_pares', 'Relacionar conceptos', 'Unir concepto con definición.', true),
  ('verdadero_falso', 'Verdadero o falso', 'Responder afirmaciones.', true),
  ('sopa_letras', 'Sopa de letras bíblica', 'Buscar palabras ocultas.', true),
  ('arrastrar_soltar', 'Arrastrar y soltar', 'Ordenar o ubicar elementos.', true),
  ('rompecabezas', 'Rompecabezas', 'Armar imagen o secuencia.', true),
  ('aventura_decisiones', 'Aventura por decisiones', 'Elegir caminos de historia.', true),
  ('actividad_audio', 'Actividad con audio', 'Escuchar y responder.', true),
  ('actividad_video', 'Actividad con video', 'Ver y responder.', true),
  ('manualidad', 'Manualidad', 'Actividad práctica guiada.', false),
  ('cancion', 'Canción', 'Letra, audio y movimiento.', false)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO regla_nivel (numero_nivel, nombre, xp_minima, color_insignia) VALUES
  (1, 'Brote', 0, '#22A447'),
  (2, 'Raíz', 100, '#22A447'),
  (3, 'Tallo', 250, '#6D35E8'),
  (4, 'Rama', 500, '#6D35E8'),
  (5, 'Árbol', 1000, '#FFC83D'),
  (6, 'Cosecha', 2000, '#FFC83D'),
  (7, 'Explorador', 3000, '#2F80ED')
ON CONFLICT (numero_nivel) DO NOTHING;

INSERT INTO logro (codigo, nombre, descripcion, codigo_criterio, valor_criterio, bono_xp) VALUES
  ('primera_leccion', 'Primer paso', 'Completaste tu primera lección.', 'temas_completados', 1, 20),
  ('racha_siete_dias', 'Semilla constante', 'Mantén 7 días de racha.', 'dias_racha', 7, 50),
  ('explorador_palabra', 'Explorador de la Palabra', 'Completa 10 actividades.', 'actividades_completadas', 10, 50)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- 11. SEGURIDAD: ACCESO EXCLUSIVO DESDE EL BACKEND
-- ============================================================
-- La API Hono usa service_role. El navegador no debe consultar tablas
-- directamente con las claves anon/authenticated.
DO $$
DECLARE
  tabla record;
BEGIN
  FOR tabla IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tabla.tablename);
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
    REVOKE ALL ON v_admin_revisiones FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
    REVOKE ALL ON v_admin_revisiones FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT USAGE ON SCHEMA public TO service_role;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
    GRANT SELECT ON v_admin_revisiones TO service_role;
  END IF;
END $$;

-- ============================================================
-- 12. NOTAS DE IMPLEMENTACIÓN
-- ============================================================
-- 1) Hono debe ser el único que escriba en la base en producción.
-- 2) El frontend PWA guarda en IndexedDB y sincroniza con /sync/push y /sync/pull.
-- 3) id_evento_cliente evita duplicados si se reintenta la sincronización.
-- 4) Para demo rápida, actividad.configuracion permite crear juegos sin migrar BD.
-- 5) En una fase futura pueden migrar cada tipo de juego a tablas propias.
-- ============================================================
