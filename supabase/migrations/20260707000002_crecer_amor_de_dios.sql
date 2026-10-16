-- ============================================================
-- SEMILLAS · Fases CRECER para tema "El Amor de Dios"
-- Tema ID: 47a2e22f-86da-466f-92ff-1847d85de609
-- Senda: Padre
-- ============================================================
-- Este script agrega las 6 fases CRECER (conectar, relatar,
-- enseñar, comprobar, experimentar, recompensar) con contenido
-- para las 3 franjas de edad (semillas, exploradores, embajadores).
--
-- Es idempotente: usa ON CONFLICT DO NOTHING.
-- ============================================================

DO $$
DECLARE
  v_tema_id     uuid := '47a2e22f-86da-466f-92ff-1847d85de609';
  f_sem uuid; f_exp uuid; f_emb uuid;
  c_con uuid; c_rel uuid; c_ens uuid; c_com uuid; c_exp uuid; c_rec uuid;
  v_libro int;
  v_paso_con uuid;
  v_paso_rel uuid;
  v_paso_ens uuid;
  v_paso_com uuid;
  v_paso_exp uuid;
  v_paso_rec uuid;
  v_act_id uuid;
  v_tipo_quiz uuid;
BEGIN

  -- ============================================================
  -- 1. Obtener IDs de catálogos
  -- ============================================================
  SELECT id INTO f_sem FROM grupo_edad WHERE codigo = 'semillas';
  SELECT id INTO f_exp FROM grupo_edad WHERE codigo = 'exploradores';
  SELECT id INTO f_emb FROM grupo_edad WHERE codigo = 'embajadores';

  SELECT id INTO c_con FROM tipo_paso_crecer WHERE codigo = 'conectar';
  SELECT id INTO c_rel FROM tipo_paso_crecer WHERE codigo = 'relatar';
  SELECT id INTO c_ens FROM tipo_paso_crecer WHERE codigo = 'ensenar';
  SELECT id INTO c_com FROM tipo_paso_crecer WHERE codigo = 'comprobar';
  SELECT id INTO c_exp FROM tipo_paso_crecer WHERE codigo = 'experimentar';
  SELECT id INTO c_rec FROM tipo_paso_crecer WHERE codigo = 'recompensar';

  SELECT id INTO v_tipo_quiz FROM tipo_actividad WHERE codigo = 'cuestionario' LIMIT 1;

  SELECT id INTO v_libro FROM libro_biblico WHERE nombre = 'Juan' LIMIT 1;

  -- ============================================================
  -- 2. Crear pasos CRECER (idempotente)
  -- ============================================================
  INSERT INTO paso_tema (tema_id, tipo_paso_id, orden, obligatorio)
  VALUES (v_tema_id, c_con, 1, true)
  ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING
  RETURNING id INTO v_paso_con;

  INSERT INTO paso_tema (tema_id, tipo_paso_id, orden, obligatorio)
  VALUES (v_tema_id, c_rel, 2, true)
  ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING
  RETURNING id INTO v_paso_rel;

  INSERT INTO paso_tema (tema_id, tipo_paso_id, orden, obligatorio)
  VALUES (v_tema_id, c_ens, 3, true)
  ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING
  RETURNING id INTO v_paso_ens;

  INSERT INTO paso_tema (tema_id, tipo_paso_id, orden, obligatorio)
  VALUES (v_tema_id, c_com, 4, true)
  ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING
  RETURNING id INTO v_paso_com;

  INSERT INTO paso_tema (tema_id, tipo_paso_id, orden, obligatorio)
  VALUES (v_tema_id, c_exp, 5, true)
  ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING
  RETURNING id INTO v_paso_exp;

  INSERT INTO paso_tema (tema_id, tipo_paso_id, orden, obligatorio)
  VALUES (v_tema_id, c_rec, 6, true)
  ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING
  RETURNING id INTO v_paso_rec;

  -- Si ya existían, obtenemos sus IDs
  IF v_paso_con IS NULL THEN
    SELECT id INTO v_paso_con FROM paso_tema WHERE tema_id = v_tema_id AND tipo_paso_id = c_con;
  END IF;
  IF v_paso_rel IS NULL THEN
    SELECT id INTO v_paso_rel FROM paso_tema WHERE tema_id = v_tema_id AND tipo_paso_id = c_rel;
  END IF;
  IF v_paso_ens IS NULL THEN
    SELECT id INTO v_paso_ens FROM paso_tema WHERE tema_id = v_tema_id AND tipo_paso_id = c_ens;
  END IF;
  IF v_paso_com IS NULL THEN
    SELECT id INTO v_paso_com FROM paso_tema WHERE tema_id = v_tema_id AND tipo_paso_id = c_com;
  END IF;
  IF v_paso_exp IS NULL THEN
    SELECT id INTO v_paso_exp FROM paso_tema WHERE tema_id = v_tema_id AND tipo_paso_id = c_exp;
  END IF;
  IF v_paso_rec IS NULL THEN
    SELECT id INTO v_paso_rec FROM paso_tema WHERE tema_id = v_tema_id AND tipo_paso_id = c_rec;
  END IF;

  -- ============================================================
  -- 3. CONECTAR
  -- ============================================================
  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_con, f_sem,
     'Dios te ama',
     '¿Sabías que Dios te ama muchísimo? No importa lo que hagas, Él siempre te quiere. Su amor es como un abrazo gigante que nunca termina. Así como tus papás te cuidan, Dios te cuida aún más porque Él te creó y eres especial para Él.',
     'Imagina el abrazo más grande del mundo. ¡Así es el amor de Dios!')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_con, f_exp,
     '¿Qué es el amor?',
     'Todos hablamos del amor, pero ¿sabemos realmente lo que significa? En la Biblia aprendemos que el amor no es solo un sentimiento, es una decisión. Dios nos ama primero y su amor es perfecto, sin condiciones. No tenemos que ganárnoslo. Hoy vamos a descubrir cómo es el amor de Dios y cómo cambia nuestra vida.',
     'Conversa con tu grupo: ¿cómo describes el amor de Dios?')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_con, f_emb,
     'Un amor que transforma',
     'En un mundo donde el amor suele ser condicional, la Biblia nos presenta un amor radicalmente diferente. El amor de Dios no se basa en nuestro desempeño ni en nuestras cualidades. Es un amor que toma la iniciativa, que persevera y que transforma. Antes de seguir, pregúntate: ¿mi concepto de amor está alineado con lo que Dios dice que es el amor?',
     'Reflexiona: ¿qué ideas del mundo sobre el amor contrastan con el amor de Dios?')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  -- ============================================================
  -- 4. RELATAR (Juan 3:16, 1 Juan 4:8-10, Romanos 8:38-39)
  -- ============================================================
  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_rel, f_sem,
     'La historia del amor de Dios',
     'La Biblia dice: "Porque Dios amó tanto al mundo, que dio a su Hijo único" (Juan 3:16). Dios nos ama tanto que envió a Jesús para estar con nosotros. Desde el principio, Dios nos ha demostrado su amor: nos creó, nos cuidó y nunca nos dejó solos. La historia más linda de toda la Biblia es que Dios nos ama y siempre nos amará.',
     'Escucha con atención: esta es la historia más hermosa de todas.')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_rel, f_exp,
     'Dios es amor (1 Juan 4:8-10)',
     'El apóstol Juan escribió algo increíble: "Dios es amor". No dice que Dios tiene amor, sino que Dios ES amor. Eso significa que todo lo que Dios hace es por amor. En 1 Juan 4:9-10 nos explica que el amor de Dios no se trata de que nosotros lo amáramos primero, sino de que Él nos amó y envió a Jesús. El amor de Dios es el origen de todo.',
     'Lee 1 Juan 4:8-10 y comenta: ¿qué significa que "Dios es amor"?')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_rel, f_emb,
     'Nada nos separa de su amor (Romanos 8:38-39)',
     'Pablo escribe en Romanos 8:38-39 una declaración poderosa: ni la muerte, ni la vida, ni ángeles, ni demonios, ni el presente, ni el futuro, ni ninguna fuerza creada podrá separarnos del amor de Dios en Cristo Jesús. En un mundo de relaciones rotas y amor condicional, Dios nos ofrece un amor inquebrantable. Este pasaje nos invita a confiar en que el amor de Dios es más fuerte que cualquier circunstancia.',
     'Analiza Romanos 8:38-39. ¿Qué significa para ti que nada te separe del amor de Dios?')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  -- Referencia bíblica si no existe
  INSERT INTO referencia_biblica (tema_id, libro_id, capitulo, versiculo_inicio, versiculo_fin, principal)
  SELECT v_tema_id, v_libro, 3, 16, 16, true
  WHERE NOT EXISTS (SELECT 1 FROM referencia_biblica WHERE tema_id = v_tema_id AND libro_id = v_libro AND capitulo = 3 AND versiculo_inicio = 16)
  ON CONFLICT DO NOTHING;

  -- Versículo clave si no existe
  INSERT INTO versiculo_clave (tema_id, texto, libro_id, capitulo, versiculo)
  SELECT v_tema_id, 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, sino que tenga vida eterna.', v_libro, 3, 16
  WHERE NOT EXISTS (SELECT 1 FROM versiculo_clave WHERE tema_id = v_tema_id)
  ON CONFLICT (tema_id) DO NOTHING;

  -- ============================================================
  -- 5. ENSEÑAR
  -- ============================================================
  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_ens, f_sem,
     'Dios siempre te ama',
     'Dios te ama siempre, sin importar nada. Así como el sol sale cada mañana, el amor de Dios está contigo cada día. No tienes que hacer cosas especiales para que Dios te ame. Él ya te ama porque tú eres su hijo amado. Juan 3:16 nos recuerda que Dios nos dio el mejor regalo: a Jesús.',
     'Repite conmigo: "Dios me ama siempre".')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_ens, f_exp,
     'El amor de Dios es incondicional',
     'El amor de Dios no es como el amor humano. Nosotros a veces amamos con condiciones, pero Dios nos ama incondicionalmente. No importa lo que hayas hecho, Dios te sigue amando y espera con los brazos abiertos. Su amor no se gana con buenas obras, se recibe con fe. Este amor incondicional es la base de nuestra relación con Él.',
     'Memoriza Juan 3:16. Es el versículo más importante de la Biblia.')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_ens, f_emb,
     'El amor como esencia de Dios',
     'El amor no es un atributo más de Dios; es su esencia. Todo lo que Dios hace brota de su amor. Su justicia, su misericordia, su gracia, su corrección —todo está teñido de su amor perfecto. Comprender esto transforma cómo vemos a Dios: no como un juez distante, sino como un Padre que nos ama y busca lo mejor para nosotros. El amor de Dios nos invita a responder con amor.',
     'Medita: ¿cómo cambia tu relación con Dios al saber que su amor es su esencia?')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  -- ============================================================
  -- 6. COMPROBAR (Quiz)
  -- ============================================================

  -- Semillas
  v_act_id := NULL;
  INSERT INTO actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
  VALUES (v_tema_id, v_paso_com, f_sem, v_tipo_quiz, 'El amor de Dios', '¿Qué nos dio Dios porque nos ama?', '¡Muy bien! Dios nos dio a Jesús porque nos ama muchísimo.', 1, 10, 'facil', '{"kind":"single_choice"}')
  ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING
  RETURNING id INTO v_act_id;

  IF v_act_id IS NOT NULL THEN
    INSERT INTO opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
      (v_act_id, 'A', 'A su Hijo Jesús', true, 1, '¡Correcto! Jesús es el mejor regalo de Dios.'),
      (v_act_id, 'B', 'Juguetes', false, 2, 'No exactamente. Dios nos dio algo mucho más valioso.'),
      (v_act_id, 'C', 'Dinero', false, 3, 'No. Dios nos dio a su Hijo, no cosas materiales.');
  END IF;

  -- Exploradores
  v_act_id := NULL;
  INSERT INTO actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
  VALUES (v_tema_id, v_paso_com, f_exp, v_tipo_quiz, 'El amor de Dios', 'Según 1 Juan 4:8, ¿qué es Dios?', '"Dios es amor". No solo tiene amor, Él es amor en esencia.', 1, 15, 'normal', '{"kind":"single_choice"}')
  ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING
  RETURNING id INTO v_act_id;

  IF v_act_id IS NOT NULL THEN
    INSERT INTO opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
      (v_act_id, 'A', 'Amor', true, 1, '¡Exacto! Dios es amor, esa es su esencia.'),
      (v_act_id, 'B', 'Poder', false, 2, 'Dios es poderoso, pero Juan dice que Dios es amor.'),
      (v_act_id, 'C', 'Luz', false, 3, 'Dios también es luz, pero en 1 Juan 4:8 se nos dice que Dios es amor.');
  END IF;

  -- Embajadores
  v_act_id := NULL;
  INSERT INTO actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
  VALUES (v_tema_id, v_paso_com, f_emb, v_tipo_quiz, 'El amor de Dios', 'Según Romanos 8:38-39, ¿qué puede separarnos del amor de Dios?', 'Pablo afirma que absolutamente nada puede separarnos del amor de Dios en Cristo.', 1, 20, 'dificil', '{"kind":"single_choice"}')
  ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING
  RETURNING id INTO v_act_id;

  IF v_act_id IS NOT NULL THEN
    INSERT INTO opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
      (v_act_id, 'A', 'Nada', true, 1, 'Correcto. Nada en toda la creación puede separarnos del amor de Dios.'),
      (v_act_id, 'B', 'Nuestros pecados', false, 2, 'El pecado no nos separa del amor de Dios; Jesús ya pagó por él.'),
      (v_act_id, 'C', 'La muerte', false, 3, 'Ni siquiera la muerte puede separarnos del amor de Dios.');
  END IF;

  -- ============================================================
  -- 7. EXPERIMENTAR (Reflexión)
  -- ============================================================
  INSERT INTO pregunta_reflexion (paso_id, grupo_edad_id, pregunta, orden)
  VALUES
    (v_paso_exp, f_sem, '¿Cómo te hace sentir saber que Dios te ama siempre?', 1)
  ON CONFLICT (paso_id, grupo_edad_id, orden) DO NOTHING;

  INSERT INTO pregunta_reflexion (paso_id, grupo_edad_id, pregunta, orden)
  VALUES
    (v_paso_exp, f_exp, 'Esta semana, ¿cómo puedes mostrar el amor de Dios a alguien que lo necesita?', 1)
  ON CONFLICT (paso_id, grupo_edad_id, orden) DO NOTHING;

  INSERT INTO pregunta_reflexion (paso_id, grupo_edad_id, pregunta, orden)
  VALUES
    (v_paso_exp, f_emb, 'Si el amor de Dios es incondicional e inquebrantable, ¿cómo debería impactar eso en tu identidad y en cómo tratas a los demás?', 1)
  ON CONFLICT (paso_id, grupo_edad_id, orden) DO NOTHING;

  -- ============================================================
  -- 8. RECOMPENSAR
  -- ============================================================
  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_rec, f_sem,
     '¡Buen trabajo!',
     '¡Lo hiciste muy bien! Has aprendido que Dios te ama con un amor increíble. Recuerda siempre: Dios te ama muchísimo, pase lo que pase. ¡Eres especial para Él!',
     '¡Recibe tu recompensa!')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_rec, f_exp,
     '¡Excelente!',
     'Excelente trabajo. Has explorado el amor de Dios y descubriste que es incondicional, eterno y transformador. Lleva esta verdad en tu corazón esta semana y compártela con alguien más.',
     'Sigue creciendo en el amor de Dios.')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  INSERT INTO contenido_paso_tema (paso_id, grupo_edad_id, titulo, cuerpo, instruccion_corta)
  VALUES
    (v_paso_rec, f_emb,
     '¡Bien hecho!',
     'Bien hecho. Has recorrido el tema del amor de Dios. Que Romanos 8:38-39 sea un ancla para tu fe: nada te separará del amor de Dios. Vive esta semana con la confianza de que eres profundamente amado.',
     'Comparte lo que aprendiste con alguien esta semana.')
  ON CONFLICT (paso_id, grupo_edad_id) DO NOTHING;

  -- ============================================================
  -- 9. Insignia (idempotente)
  -- ============================================================
  INSERT INTO logro (codigo, nombre, descripcion, codigo_criterio, valor_criterio, bono_xp)
  VALUES ('tema-amor-de-dios', 'El Amor de Dios', 'Completaste el tema El Amor de Dios', 'temas_completados', 1, 30)
  ON CONFLICT (codigo) DO NOTHING;

  -- ============================================================
  -- 10. Asignar grupos de edad al tema si no están
  -- ============================================================
  INSERT INTO tema_grupo_edad (tema_id, grupo_edad_id)
  SELECT v_tema_id, id FROM grupo_edad
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Fases CRECER agregadas al tema "El Amor de Dios"';
END $$;
