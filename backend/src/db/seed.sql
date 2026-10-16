-- ============================================================
-- SEMILLAS · Datos de prueba
-- Tema: "El Buen Pastor" — Senda del Hijo, Juan 10:11-15
-- ============================================================

DO $$
DECLARE
  v_admin    uuid;
  v_senda    uuid;
  v_bv       uuid;
  v_libro    int;
  v_tema     uuid;
  v_cover    uuid;
  f_sem uuid; f_exp uuid; f_emb uuid;
  c_con uuid; c_rel uuid; c_ens uuid; c_com uuid; c_exp uuid; c_rec uuid;
BEGIN
  SELECT id INTO v_senda FROM path WHERE code = 'hijo';
  SELECT id INTO f_sem FROM age_group WHERE code = 'semillas';
  SELECT id INTO f_exp FROM age_group WHERE code = 'exploradores';
  SELECT id INTO f_emb FROM age_group WHERE code = 'embajadores';
  SELECT id INTO c_con FROM crecer_step_type WHERE code = 'conectar';
  SELECT id INTO c_rel FROM crecer_step_type WHERE code = 'relatar';
  SELECT id INTO c_ens FROM crecer_step_type WHERE code = 'ensenar';
  SELECT id INTO c_com FROM crecer_step_type WHERE code = 'comprobar';
  SELECT id INTO c_exp FROM crecer_step_type WHERE code = 'experimentar';
  SELECT id INTO c_rec FROM crecer_step_type WHERE code = 'recompensar';
  SELECT id INTO v_bv FROM bible_version WHERE code = 'TLA';
  SELECT id INTO v_libro FROM bible_book WHERE name = 'Juan' LIMIT 1;

  INSERT INTO app_user (role, provider, external_id, email, display_name)
  VALUES ('admin', 'email', 'seed-admin', 'admin@semillas.local', 'Administrador Demo')
  ON CONFLICT (provider, external_id) WHERE provider = 'email'
  DO UPDATE SET role = 'admin'
  RETURNING id INTO v_admin;

  INSERT INTO media_asset (kind, public_url, alt_text, title)
  VALUES ('image', 'https://placehold.co/800x500/png?text=El+Buen+Pastor', 'Jesús como Buen Pastor', 'Portada El Buen Pastor')
  RETURNING id INTO v_cover;

  INSERT INTO theme (path_id, title, slug, objective, summary, cover_media_id,
    bible_version_id, status, xp_reward, estimated_minutes, created_by, published_by, published_at)
  VALUES (v_senda, 'El Buen Pastor', 'el-buen-pastor',
    'Comprender que Jesús es el Buen Pastor que nos ama, nos cuida y da su vida por nosotros.',
    'Una lección sobre el amor sacrificial de Jesús basada en Juan 10:11-15.',
    v_cover, v_bv, 'published', 40, 8, v_admin, v_admin, now())
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title, objective = EXCLUDED.objective,
    summary = EXCLUDED.summary, status = 'published', published_at = now()
  RETURNING id INTO v_tema;

  INSERT INTO theme_age_group (theme_id, age_group_id) VALUES
    (v_tema, f_sem), (v_tema, f_exp), (v_tema, f_emb)
  ON CONFLICT DO NOTHING;

  INSERT INTO bible_reference (theme_id, book_id, chapter, verse_start, verse_end, is_main)
  VALUES (v_tema, v_libro, 10, 11, 15, true);

  INSERT INTO key_verse (theme_id, text, book_id, chapter, verse)
  VALUES (v_tema, 'Yo soy el buen pastor; el buen pastor su vida da por las ovejas.', v_libro, 10, 11)
  ON CONFLICT (theme_id) DO NOTHING;

  -- Pasos CRECER (uno por uno para evitar ambigüedad)
  INSERT INTO theme_step (theme_id, step_type_id, sort_order, is_required)
  VALUES (v_tema, c_con, 1, true) ON CONFLICT (theme_id, step_type_id) DO NOTHING;
  INSERT INTO theme_step (theme_id, step_type_id, sort_order, is_required)
  VALUES (v_tema, c_rel, 2, true) ON CONFLICT (theme_id, step_type_id) DO NOTHING;
  INSERT INTO theme_step (theme_id, step_type_id, sort_order, is_required)
  VALUES (v_tema, c_ens, 3, true) ON CONFLICT (theme_id, step_type_id) DO NOTHING;
  INSERT INTO theme_step (theme_id, step_type_id, sort_order, is_required)
  VALUES (v_tema, c_com, 4, true) ON CONFLICT (theme_id, step_type_id) DO NOTHING;
  INSERT INTO theme_step (theme_id, step_type_id, sort_order, is_required)
  VALUES (v_tema, c_exp, 5, true) ON CONFLICT (theme_id, step_type_id) DO NOTHING;
  INSERT INTO theme_step (theme_id, step_type_id, sort_order, is_required)
  VALUES (v_tema, c_rec, 6, true) ON CONFLICT (theme_id, step_type_id) DO NOTHING;

  -- Contenido de pasos
  INSERT INTO theme_step_content (step_id, age_group_id, title, body, short_instruction)
  SELECT ts.id, ag.id, cont.title, cont.body, cont.short_instruction
  FROM (VALUES
    ('conectar', 'Conectar', '¿Sabías que hay alguien que te cuida siempre, de día y de noche? Hoy vamos a conocer al Buen Pastor, que ama muchísimo a sus ovejitas.', 'Observa la imagen y piensa en quién te cuida.'),
    ('conectar', 'Conectar', 'Un pastor de verdad camina delante de sus ovejas y las protege de todo peligro. En la Biblia, Jesús se comparó con un pastor. ¿Por qué crees que lo hizo?', 'Conversa con tu grupo sobre lo que sabes de los pastores.'),
    ('conectar', 'Conectar', 'En tiempos de la Biblia, un pastor podía arriesgar su vida por el rebaño. Jesús tomó esa imagen para revelar quién es Él y lo que estaba dispuesto a hacer por ti.', 'Reflexiona: ¿qué significa que Jesús se llame a sí mismo "el Buen Pastor"?')
  ) AS cont(step_code, title, body, short_instruction)
  CROSS JOIN (VALUES ('semillas'), ('exploradores'), ('embajadores')) AS ag_codes(code)
  JOIN age_group ag ON ag.code = ag_codes.code
  JOIN theme_step ts ON ts.theme_id = v_tema
  JOIN crecer_step_type cst ON cst.id = ts.step_type_id AND cst.code = cont.step_code
  ON CONFLICT (step_id, age_group_id) DO NOTHING;

  -- RELATAR
  INSERT INTO theme_step_content (step_id, age_group_id, title, body, short_instruction)
  SELECT ts.id, ag.id, cont.title, cont.body, cont.short_instruction
  FROM (VALUES
    ('relatar', 'Relatar (Juan 10:11-15)', 'Jesús dijo que Él es el Buen Pastor. Un buen pastor conoce a cada ovejita, la llama por su nombre y la lleva a lugares seguros con agua y pasto.', 'Lee con atención esta historia de la Biblia.'),
    ('relatar', 'Relatar (Juan 10:11-15)', 'Jesús contó que hay dos actitudes: la del asalariado que huye y la del buen pastor que defiende. Jesús dijo: "Yo soy el buen pastor".', 'Lee Juan 10:11-15 y comparte lo que más te llamó la atención.'),
    ('relatar', 'Relatar (Juan 10:11-15)', 'En Juan 10, Jesús contrasta al asalariado con el Buen Pastor que entrega su vida. Apunta directamente a la cruz.', 'Analiza el pasaje: ¿qué diferencia a Jesús del asalariado?')
  ) AS cont(step_code, title, body, short_instruction)
  CROSS JOIN (VALUES ('semillas'), ('exploradores'), ('embajadores')) AS ag_codes(code)
  JOIN age_group ag ON ag.code = ag_codes.code
  JOIN theme_step ts ON ts.theme_id = v_tema
  JOIN crecer_step_type cst ON cst.id = ts.step_type_id AND cst.code = cont.step_code
  ON CONFLICT (step_id, age_group_id) DO NOTHING;

  -- ENSEÑAR
  INSERT INTO theme_step_content (step_id, age_group_id, title, body, short_instruction)
  SELECT ts.id, ag.id, cont.title, cont.body, cont.short_instruction
  FROM (VALUES
    ('ensenar', 'Enseñar', 'Jesús es como un pastor bueno que nunca te deja solo. Él te ama y te cuida.', 'Recuerda esta verdad durante el día.'),
    ('ensenar', 'Enseñar', 'Jesús es el Buen Pastor: te conoce por tu nombre, te busca cuando te alejas y te protege.', 'Repite en voz alta la verdad central.'),
    ('ensenar', 'Enseñar', 'Jesús, el Buen Pastor, dio su vida por sus ovejas. Esa entrega es el corazón del evangelio.', 'Medita en Juan 10:11.')
  ) AS cont(step_code, title, body, short_instruction)
  CROSS JOIN (VALUES ('semillas'), ('exploradores'), ('embajadores')) AS ag_codes(code)
  JOIN age_group ag ON ag.code = ag_codes.code
  JOIN theme_step ts ON ts.theme_id = v_tema
  JOIN crecer_step_type cst ON cst.id = ts.step_type_id AND cst.code = cont.step_code
  ON CONFLICT (step_id, age_group_id) DO NOTHING;

  -- RECOMPENSAR
  INSERT INTO theme_step_content (step_id, age_group_id, title, body, short_instruction)
  SELECT ts.id, ag.id, cont.title, cont.body, cont.short_instruction
  FROM (VALUES
    ('recompensar', '¡Buen trabajo!', '¡Muy bien! Jesús, el Buen Pastor, te acompaña siempre. ¡Ganaste tu recompensa!', 'Recibe tu insignia.'),
    ('recompensar', '¡Excelente!', 'Excelente trabajo. Recuerda: el Buen Pastor te conoce y nunca te suelta.', 'Sigue creciendo en la Palabra.'),
    ('recompensar', '¡Bien hecho!', 'Bien hecho! Has recorrido el tema del Buen Pastor. Que su entrega marque tu semana.', 'Comparte lo aprendido.')
  ) AS cont(step_code, title, body, short_instruction)
  CROSS JOIN (VALUES ('semillas'), ('exploradores'), ('embajadores')) AS ag_codes(code)
  JOIN age_group ag ON ag.code = ag_codes.code
  JOIN theme_step ts ON ts.theme_id = v_tema
  JOIN crecer_step_type cst ON cst.id = ts.step_type_id AND cst.code = cont.step_code
  ON CONFLICT (step_id, age_group_id) DO NOTHING;

  -- Quiz: Semillas
  INSERT INTO activity (theme_id, step_id, age_group_id, activity_type_id, title, prompt, feedback, sort_order, xp_reward, difficulty, config)
  SELECT v_tema, ts.id, f_sem, aty.id, 'Quiz: El Buen Pastor', '¿Qué hace el Buen Pastor por sus ovejas?', 'El Buen Pastor cuida a sus ovejas y da su vida por ellas.', 1, 10, 'easy', '{"kind":"single_choice"}'::jsonb
  FROM theme_step ts JOIN crecer_step_type cst ON cst.id = ts.step_type_id AND cst.code = 'comprobar'
  CROSS JOIN activity_type aty WHERE aty.code = 'quiz' AND ts.theme_id = v_tema
  ON CONFLICT (theme_id, age_group_id, sort_order) DO NOTHING;

  INSERT INTO activity_option (activity_id, label, text, is_correct, sort_order, feedback)
  SELECT a.id, v.label, v.text, v.is_correct, v.sort_order, v.feedback
  FROM activity a
  CROSS JOIN (VALUES
    ('A', 'Las cuida y da su vida por ellas', true, 1, '¡Muy bien! El Buen Pastor nos cuida siempre.'),
    ('B', 'Las deja solas', false, 2, 'No, el Buen Pastor nunca nos abandona.'),
    ('C', 'Las asusta', false, 3, 'No, el Buen Pastor nos da paz y seguridad.')
  ) AS v(label, text, is_correct, sort_order, feedback)
  WHERE a.theme_id = v_tema AND a.age_group_id = f_sem AND a.sort_order = 1
  ON CONFLICT (activity_id, sort_order) DO NOTHING;

  -- Quiz: Exploradores
  INSERT INTO activity (theme_id, step_id, age_group_id, activity_type_id, title, prompt, feedback, sort_order, xp_reward, difficulty, config)
  SELECT v_tema, ts.id, f_exp, aty.id, 'Quiz: El Buen Pastor', '¿Con qué se comparó Jesús en Juan 10?', 'Jesús se comparó con un buen pastor que ama y defiende a sus ovejas.', 1, 15, 'normal', '{"kind":"single_choice"}'::jsonb
  FROM theme_step ts JOIN crecer_step_type cst ON cst.id = ts.step_type_id AND cst.code = 'comprobar'
  CROSS JOIN activity_type aty WHERE aty.code = 'quiz' AND ts.theme_id = v_tema
  ON CONFLICT (theme_id, age_group_id, sort_order) DO NOTHING;

  INSERT INTO activity_option (activity_id, label, text, is_correct, sort_order, feedback)
  SELECT a.id, v.label, v.text, v.is_correct, v.sort_order, v.feedback
  FROM activity a
  CROSS JOIN (VALUES
    ('A', 'Con un buen pastor', true, 1, '¡Correcto! Jesús es el Buen Pastor.'),
    ('B', 'Con un rey lejano', false, 2, 'No exactamente. Jesús usó la imagen de un pastor.'),
    ('C', 'Con un juez severo', false, 3, 'No. Jesús vino a salvar, no a juzgar.')
  ) AS v(label, text, is_correct, sort_order, feedback)
  WHERE a.theme_id = v_tema AND a.age_group_id = f_exp AND a.sort_order = 1
  ON CONFLICT (activity_id, sort_order) DO NOTHING;

  -- Quiz: Embajadores
  INSERT INTO activity (theme_id, step_id, age_group_id, activity_type_id, title, prompt, feedback, sort_order, xp_reward, difficulty, config)
  SELECT v_tema, ts.id, f_emb, aty.id, 'Quiz: El Buen Pastor', '¿Qué demuestra que Jesús es el Buen Pastor?', 'A diferencia del asalariado, el Buen Pastor entrega su vida por las ovejas.', 1, 20, 'hard', '{"kind":"single_choice"}'::jsonb
  FROM theme_step ts JOIN crecer_step_type cst ON cst.id = ts.step_type_id AND cst.code = 'comprobar'
  CROSS JOIN activity_type aty WHERE aty.code = 'quiz' AND ts.theme_id = v_tema
  ON CONFLICT (theme_id, age_group_id, sort_order) DO NOTHING;

  INSERT INTO activity_option (activity_id, label, text, is_correct, sort_order, feedback)
  SELECT a.id, v.label, v.text, v.is_correct, v.sort_order, v.feedback
  FROM activity a
  CROSS JOIN (VALUES
    ('A', 'Dio su vida por las ovejas', true, 1, 'Exacto. Esa es la mayor muestra de su amor.'),
    ('B', 'Huyó cuando llegó el peligro', false, 2, 'Al contrario, el asalariado huye, pero Jesús se quedó.'),
    ('C', 'Ignoró a las ovejas', false, 3, 'No, Él conoce a cada una de sus ovejas.')
  ) AS v(label, text, is_correct, sort_order, feedback)
  WHERE a.theme_id = v_tema AND a.age_group_id = f_emb AND a.sort_order = 1
  ON CONFLICT (activity_id, sort_order) DO NOTHING;

  -- Reflexión
  INSERT INTO reflection_question (step_id, age_group_id, question, sort_order)
  SELECT ts.id, ag.id, q.question, q.sort_order
  FROM (VALUES
    ('semillas', '¿Quién te cuida como el Buen Pastor cuida a sus ovejas?', 1),
    ('exploradores', 'Cuando tengas miedo esta semana, ¿cómo puedes recordar que Jesús te cuida?', 1),
    ('embajadores', 'Si Jesús dio su vida por ti, ¿qué respuesta despierta eso en tu manera de vivir?', 1)
  ) AS q(ag_code, question, sort_order)
  JOIN age_group ag ON ag.code = q.ag_code
  JOIN theme_step ts ON ts.theme_id = v_tema
  JOIN crecer_step_type cst ON cst.id = ts.step_type_id AND cst.code = 'experimentar'
  ON CONFLICT DO NOTHING;

  -- Insignia
  INSERT INTO achievement (code, name, description, criterion_code, criterion_value, xp_bonus)
  VALUES ('tema-buen-pastor', 'El Buen Pastor', 'Completaste el tema El Buen Pastor', 'theme_completed', 1, 20)
  ON CONFLICT (code) DO NOTHING;

  RAISE NOTICE 'Seed completado. Tema "El Buen Pastor" creado con ID: %', v_tema;
END $$;
