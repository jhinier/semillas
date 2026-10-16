-- ============================================================
-- SEMILLAS · Seed demo de Actividades (Juegos) para los 4 temas
-- ============================================================

DO $$
DECLARE
  v_edad_semillas uuid;
  v_tema_creacion uuid;
  v_tema_parabolas uuid;
  v_tema_frutos uuid;
  v_tema_heroes uuid;
  
  v_tipo_quiz uuid;
  v_tipo_vf uuid;
  v_tipo_sopa uuid;
  v_tipo_memoria uuid;
BEGIN
  -- 1) Obtener IDs necesarios
  SELECT id INTO v_edad_semillas FROM grupo_edad WHERE codigo = 'semillas';
  
  SELECT id INTO v_tema_creacion FROM tema WHERE slug = 'la-creacion-del-mundo';
  SELECT id INTO v_tema_parabolas FROM tema WHERE slug = 'parabolas-de-jesus';
  SELECT id INTO v_tema_frutos FROM tema WHERE slug = 'frutos-del-espiritu';
  SELECT id INTO v_tema_heroes FROM tema WHERE slug = 'grandes-heroes-de-la-fe';
  
  SELECT id INTO v_tipo_quiz FROM tipo_actividad WHERE codigo = 'cuestionario';
  SELECT id INTO v_tipo_vf FROM tipo_actividad WHERE codigo = 'verdadero_falso';
  SELECT id INTO v_tipo_sopa FROM tipo_actividad WHERE codigo = 'sopa_letras';
  SELECT id INTO v_tipo_memoria FROM tipo_actividad WHERE codigo = 'tarjetas_memoria';

  -- 2) Insertar Actividad 1: Quiz para "La creación del mundo"
  IF v_tema_creacion IS NOT NULL THEN
    INSERT INTO actividad (
      tema_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, configuracion
    ) VALUES (
      v_tema_creacion, v_edad_semillas, v_tipo_quiz, 
      '¿Qué creó Dios?', 
      'Responde correctamente las preguntas sobre los días de la creación.',
      '¡Excelente! Dios hizo todo perfecto.',
      1,
      '{
        "preguntas": [
          {
            "pregunta": "¿Qué creó Dios en el primer día?",
            "opciones": ["La luz", "Los animales", "El sol"],
            "respuesta_correcta": 0
          },
          {
            "pregunta": "¿En qué día descansó Dios?",
            "opciones": ["Día 5", "Día 6", "Día 7"],
            "respuesta_correcta": 2
          }
        ]
      }'::jsonb
    ) ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
  END IF;

  -- 3) Insertar Actividad 2: Verdadero/Falso para "Parábolas de Jesús"
  IF v_tema_parabolas IS NOT NULL THEN
    INSERT INTO actividad (
      tema_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, configuracion
    ) VALUES (
      v_tema_parabolas, v_edad_semillas, v_tipo_vf, 
      'Verdades de las Parábolas', 
      'Lee la frase y decide si es verdadera o falsa.',
      '¡Muy bien! Las parábolas nos enseñan mucho.',
      1,
      '{
        "afirmaciones": [
          {
            "texto": "El buen samaritano ayudó al hombre herido.",
            "es_verdadero": true
          },
          {
            "texto": "El hijo pródigo nunca regresó a casa.",
            "es_verdadero": false
          }
        ]
      }'::jsonb
    ) ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
  END IF;

  -- 4) Insertar Actividad 3: Tarjetas de memoria para "Frutos del Espíritu"
  IF v_tema_frutos IS NOT NULL THEN
    INSERT INTO actividad (
      tema_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, configuracion
    ) VALUES (
      v_tema_frutos, v_edad_semillas, v_tipo_memoria, 
      'Memoria de los Frutos', 
      'Encuentra los pares de los frutos del Espíritu.',
      '¡Genial! Recuerda mostrar estos frutos cada día.',
      1,
      '{
        "pares": [
          {"id": 1, "texto": "Amor"},
          {"id": 2, "texto": "Gozo"},
          {"id": 3, "texto": "Paz"},
          {"id": 4, "texto": "Paciencia"}
        ]
      }'::jsonb
    ) ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
  END IF;

  -- 5) Insertar Actividad 4: Sopa de letras para "Grandes héroes de la fe"
  IF v_tema_heroes IS NOT NULL THEN
    INSERT INTO actividad (
      tema_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, configuracion
    ) VALUES (
      v_tema_heroes, v_edad_semillas, v_tipo_sopa, 
      'Buscando a los Héroes', 
      'Encuentra los nombres de los héroes de la fe en la sopa de letras.',
      '¡Increíble! Tú también puedes ser un héroe de la fe.',
      1,
      '{
        "palabras": ["DAVID", "MOISES", "NOE", "RUT"],
        "filas": 8,
        "columnas": 8
      }'::jsonb
    ) ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
  END IF;

  RAISE NOTICE 'Actividades demo insertadas correctamente.';
END $$;
