-- ============================================================
-- SEMILLAS · Seed demo de 4 temas para /app/temas
-- ============================================================
-- Este script siembra los 4 temas que estaban hardcodeados en la UI,
-- cada uno con su portada (recurso_multimedia) referenciada al bucket
-- privado "media". Antes de ejecutar, sube las imágenes:
--
--   Tema1.png → media/imagen/portadas/la-creacion-del-mundo.png
--   Tema2.png → media/imagen/portadas/parabolas-de-jesus.png
--   Tema3.png → media/imagen/portadas/frutos-del-espiritu.png
--   Tema4.png → media/imagen/portadas/grandes-heroes-de-la-fe.png
--
-- El script es idempotente: usa slugs únicos y ON CONFLICT.

DO $$
DECLARE
  v_senda_padre uuid;
  v_senda_hijo uuid;
  v_senda_espiritu uuid;
  v_biblia uuid;
  v_recurso_creacion uuid;
  v_recurso_parabolas uuid;
  v_recurso_frutos uuid;
  v_recurso_heroes uuid;
  v_tema_creacion uuid;
  v_tema_parabolas uuid;
  v_tema_frutos uuid;
  v_tema_heroes uuid;
BEGIN
  SELECT id INTO v_senda_padre FROM senda WHERE codigo = 'padre';
  SELECT id INTO v_senda_hijo FROM senda WHERE codigo = 'hijo';
  SELECT id INTO v_senda_espiritu FROM senda WHERE codigo = 'espiritu';

  SELECT id INTO v_biblia FROM version_biblica WHERE codigo = 'RVR1960' LIMIT 1;
  IF v_biblia IS NULL THEN
    SELECT id INTO v_biblia FROM version_biblica ORDER BY codigo LIMIT 1;
  END IF;

  -- 1) Recursos multimedia (portadas)
  -- La url_publica se llena en una columna placeholder porque las portadas
  -- se sirven mediante GET /temas/:id/portada (URL firmada de 300 s).
  INSERT INTO recurso_multimedia (tipo, bucket_almacenamiento, clave_almacenamiento, url_publica, titulo, texto_alternativo, activo, tipo_mime)
  VALUES ('imagen', 'media', 'imagen/portadas/la-creacion-del-mundo.png',
          'privada://media/imagen/portadas/la-creacion-del-mundo.png',
          'Portada La creación del mundo', 'Ilustración de la creación del mundo', true, 'image/png')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_recurso_creacion;
  IF v_recurso_creacion IS NULL THEN
    SELECT id INTO v_recurso_creacion FROM recurso_multimedia WHERE clave_almacenamiento = 'imagen/portadas/la-creacion-del-mundo.png';
  END IF;

  INSERT INTO recurso_multimedia (tipo, bucket_almacenamiento, clave_almacenamiento, url_publica, titulo, texto_alternativo, activo, tipo_mime)
  VALUES ('imagen', 'media', 'imagen/portadas/parabolas-de-jesus.png',
          'privada://media/imagen/portadas/parabolas-de-jesus.png',
          'Portada Parábolas de Jesús', 'Ilustración de las parábolas de Jesús', true, 'image/png')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_recurso_parabolas;
  IF v_recurso_parabolas IS NULL THEN
    SELECT id INTO v_recurso_parabolas FROM recurso_multimedia WHERE clave_almacenamiento = 'imagen/portadas/parabolas-de-jesus.png';
  END IF;

  INSERT INTO recurso_multimedia (tipo, bucket_almacenamiento, clave_almacenamiento, url_publica, titulo, texto_alternativo, activo, tipo_mime)
  VALUES ('imagen', 'media', 'imagen/portadas/frutos-del-espiritu.png',
          'privada://media/imagen/portadas/frutos-del-espiritu.png',
          'Portada Frutos del Espíritu', 'Ilustración de los frutos del Espíritu Santo', true, 'image/png')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_recurso_frutos;
  IF v_recurso_frutos IS NULL THEN
    SELECT id INTO v_recurso_frutos FROM recurso_multimedia WHERE clave_almacenamiento = 'imagen/portadas/frutos-del-espiritu.png';
  END IF;

  INSERT INTO recurso_multimedia (tipo, bucket_almacenamiento, clave_almacenamiento, url_publica, titulo, texto_alternativo, activo, tipo_mime)
  VALUES ('imagen', 'media', 'imagen/portadas/grandes-heroes-de-la-fe.png',
          'privada://media/imagen/portadas/grandes-heroes-de-la-fe.png',
          'Portada Grandes héroes de la fe', 'Ilustración de grandes héroes de la fe', true, 'image/png')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_recurso_heroes;
  IF v_recurso_heroes IS NULL THEN
    SELECT id INTO v_recurso_heroes FROM recurso_multimedia WHERE clave_almacenamiento = 'imagen/portadas/grandes-heroes-de-la-fe.png';
  END IF;

  -- 2) Temas publicados
  INSERT INTO tema (
    id, senda_id, titulo, slug, objetivo, resumen,
    portada_recurso_id, version_biblica_id,
    estado, xp_recompensa, minutos_estimados, version_contenido,
    publicado_en
  ) VALUES (
    gen_random_uuid(), v_senda_padre, 'La creación del mundo', 'la-creacion-del-mundo',
    'Aprende paso a paso cómo Dios creó todo lo que nos rodea en siete días.',
    'Dios creo el mundo en 7 dias',
    v_recurso_creacion, v_biblia,
    'publicado', 100, 10, 1, now()
  )
  ON CONFLICT (slug) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    objetivo = EXCLUDED.objetivo,
    resumen = EXCLUDED.resumen,
    portada_recurso_id = EXCLUDED.portada_recurso_id,
    version_biblica_id = EXCLUDED.version_biblica_id,
    estado = 'publicado',
    xp_recompensa = EXCLUDED.xp_recompensa,
    minutos_estimados = EXCLUDED.minutos_estimados,
    publicado_en = now(),
    version_contenido = tema.version_contenido + 1
  RETURNING id INTO v_tema_creacion;

  INSERT INTO tema (
    id, senda_id, titulo, slug, objetivo, resumen,
    portada_recurso_id, version_biblica_id,
    estado, xp_recompensa, minutos_estimados, version_contenido,
    publicado_en
  ) VALUES (
    gen_random_uuid(), v_senda_hijo, 'Parábolas de Jesús', 'parabolas-de-jesus',
    'Descubre las increíbles historias que Jesús contaba para enseñar grandes verdades.',
    'Las parabolas de Jesus',
    v_recurso_parabolas, v_biblia,
    'publicado', 120, 12, 1, now()
  )
  ON CONFLICT (slug) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    objetivo = EXCLUDED.objetivo,
    resumen = EXCLUDED.resumen,
    portada_recurso_id = EXCLUDED.portada_recurso_id,
    version_biblica_id = EXCLUDED.version_biblica_id,
    estado = 'publicado',
    xp_recompensa = EXCLUDED.xp_recompensa,
    minutos_estimados = EXCLUDED.minutos_estimados,
    publicado_en = now(),
    version_contenido = tema.version_contenido + 1
  RETURNING id INTO v_tema_parabolas;

  INSERT INTO tema (
    id, senda_id, titulo, slug, objetivo, resumen,
    portada_recurso_id, version_biblica_id,
    estado, xp_recompensa, minutos_estimados, version_contenido,
    publicado_en
  ) VALUES (
    gen_random_uuid(), v_senda_espiritu, 'Frutos del Espíritu', 'frutos-del-espiritu',
    'Conoce cómo el Espíritu Santo produce amor, gozo y paz en nuestro corazón.',
    'Los frutos del Espiritu Santo',
    v_recurso_frutos, v_biblia,
    'publicado', 80, 8, 1, now()
  )
  ON CONFLICT (slug) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    objetivo = EXCLUDED.objetivo,
    resumen = EXCLUDED.resumen,
    portada_recurso_id = EXCLUDED.portada_recurso_id,
    version_biblica_id = EXCLUDED.version_biblica_id,
    estado = 'publicado',
    xp_recompensa = EXCLUDED.xp_recompensa,
    minutos_estimados = EXCLUDED.minutos_estimados,
    publicado_en = now(),
    version_contenido = tema.version_contenido + 1
  RETURNING id INTO v_tema_frutos;

  INSERT INTO tema (
    id, senda_id, titulo, slug, objetivo, resumen,
    portada_recurso_id, version_biblica_id,
    estado, xp_recompensa, minutos_estimados, version_contenido,
    publicado_en
  ) VALUES (
    gen_random_uuid(), v_senda_padre, 'Grandes héroes de la fe', 'grandes-heroes-de-la-fe',
    'Aprende sobre David, Moisés y otros que confiaron plenamente en Dios.',
    'David, Moises y heroes de la fe',
    v_recurso_heroes, v_biblia,
    'publicado', 150, 15, 1, now()
  )
  ON CONFLICT (slug) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    objetivo = EXCLUDED.objetivo,
    resumen = EXCLUDED.resumen,
    portada_recurso_id = EXCLUDED.portada_recurso_id,
    version_biblica_id = EXCLUDED.version_biblica_id,
    estado = 'publicado',
    xp_recompensa = EXCLUDED.xp_recompensa,
    minutos_estimados = EXCLUDED.minutos_estimados,
    publicado_en = now(),
    version_contenido = tema.version_contenido + 1
  RETURNING id INTO v_tema_heroes;

  RAISE NOTICE 'Seed demo listo. Temas: % % % %',
    v_tema_creacion, v_tema_parabolas, v_tema_frutos, v_tema_heroes;
END $$;