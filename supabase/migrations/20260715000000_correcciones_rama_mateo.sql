-- =============================================================================
-- SEMILLAS · Script de Actualización de Base de Datos (Rama_Mateo)
-- =============================================================================
-- AVISO IMPORTANTE: Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- únicamente después de revisarlo y autorizar los cambios.
-- Es 100% idempotente (usa ON CONFLICT DO UPDATE / DO NOTHING).
--
-- Qué corrige y alinea con tus 12 puntos y con la Guía de Requisitos v1.1 (ESPOCH):
-- 1. Punto 6 y RF-15 (Insignias por hito y por tema): Actualiza descripciones,
--    criterios y bonos de XP de las insignias existentes y asegura las insignias
--    de las 3 Sendas («El Amor de Dios», «Parábolas de Jesús», «Frutos del Espíritu»).
-- 2. Sección 9.2 y RF-10 (Colores de las 3 Sendas Trinitarias y Versión TLA):
--    Alinea los colores oficiales de cada Senda (Padre #3D8BD4, Hijo #E9A23B,
--    Espíritu Santo #17A398), la versión bíblica TLA y los versículos clave.
-- 3. Punto 12, RF-08, RF-09, RF-10 y RF-11 (Las 3 Sendas adaptadas a cada una
--    de las 3 Franjas de Edad con los 6 pasos de la Metodología CRECER):
--    Cada franja de edad (Semillas 5–8, Exploradores 9–12, Embajadores 13–17)
--    cuenta con las 3 Sendas (Senda del Padre, Senda del Hijo, Senda del Espíritu
--    Santo), cada una con sus 6 momentos CRECER (Conectar, Relatar, Enseñar,
--    Comprobar, Experimentar, Recompensar), citas en formato Libro cap:vers TLA,
--    preguntas de reflexión y actividades lúdicas (Quiz, Flashcards y Completar
--    el versículo) para cumplir el 100% de cada Senda.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 0. COLORES OFICIALES DE LAS 3 SENDAS TRINITARIAS (SECCIÓN 9.2 DE LA GUÍA)
-- =============================================================================
UPDATE public.senda SET color_hex = '#3D8BD4' WHERE codigo = 'padre';
UPDATE public.senda SET color_hex = '#E9A23B' WHERE codigo = 'hijo';
UPDATE public.senda SET color_hex = '#17A398' WHERE codigo = 'espiritu';

-- =============================================================================
-- 1. ACTUALIZACIÓN DE INSIGNIAS POR HITO Y POR TEMA/SENDA (PUNTO 6 Y RF-15)
-- =============================================================================
INSERT INTO public.logro (codigo, nombre, descripcion, codigo_criterio, valor_criterio, bono_xp)
VALUES
  ('tema-amor-de-dios', 'El Amor de Dios', 'Se otorga al completar los 6 pasos CRECER y las actividades de la Senda del Padre («El Amor de Dios»).', 'temas_completados', 1, 30),
  ('tema-parabolas-jesus', 'Discípulo del Maestro', 'Se otorga al completar los 6 pasos CRECER de la Senda del Hijo («Jesús enseña con parábolas»).', 'temas_completados', 2, 35),
  ('tema-frutos-espiritu', 'Corazón con Fruto', 'Se otorga al completar los 6 pasos CRECER de la Senda del Espíritu Santo («Los frutos del Espíritu»).', 'temas_completados', 3, 40)
ON CONFLICT (codigo) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  codigo_criterio = EXCLUDED.codigo_criterio,
  valor_criterio = EXCLUDED.valor_criterio,
  bono_xp = GREATEST(public.logro.bono_xp, EXCLUDED.bono_xp);

UPDATE public.logro
SET
  descripcion = 'Se otorga al completar los 6 pasos CRECER y las actividades de la Senda del Padre («El Amor de Dios»).',
  codigo_criterio = 'temas_completados',
  valor_criterio = COALESCE(NULLIF(valor_criterio, 0), 1),
  bono_xp = CASE WHEN bono_xp <= 0 THEN 25 ELSE bono_xp END
WHERE LOWER(codigo) = 'tema-amor-de-dios' OR LOWER(nombre) LIKE '%amor de dios%';

UPDATE public.logro
SET
  descripcion = 'Se gana al finalizar con éxito tu primera Senda completa con los 6 pasos CRECER (1 tema completado).',
  codigo_criterio = 'temas_completados',
  valor_criterio = 1,
  bono_xp = CASE WHEN bono_xp <= 0 THEN 20 ELSE bono_xp END
WHERE LOWER(codigo) IN ('primera_leccion', 'insignia_1', 'insignia-1')
   OR LOWER(nombre) IN ('insignia 1', 'primer paso');

UPDATE public.logro
SET
  descripcion = 'Se gana por tu constancia al avanzar y completar 2 Sendas bíblicas con la metodología CRECER.',
  codigo_criterio = 'temas_completados',
  valor_criterio = 2,
  bono_xp = CASE WHEN bono_xp <= 0 THEN 30 ELSE bono_xp END
WHERE LOWER(codigo) IN ('insignia_2', 'insignia-2')
   OR LOWER(nombre) = 'insignia 2';

UPDATE public.logro
SET
  descripcion = 'Se otorga por resolver correctamente al menos 3 actividades prácticas en el paso Comprobar de tus Sendas.',
  codigo_criterio = 'actividades_completadas',
  valor_criterio = 3,
  bono_xp = CASE WHEN bono_xp <= 0 THEN 30 ELSE bono_xp END
WHERE LOWER(codigo) IN ('insignia_3', 'insignia-3')
   OR LOWER(nombre) = 'insignia 3';

UPDATE public.logro
SET
  bono_xp = CASE WHEN bono_xp <= 0 THEN 25 ELSE bono_xp END,
  valor_criterio = COALESCE(NULLIF(valor_criterio, 0), 1)
WHERE activo = true;


-- =============================================================================
-- 2. METODOLOGÍA CRECER COMPLETA EN LAS 3 SENDAS PARA LAS 3 FRANJAS DE EDAD
-- =============================================================================
DO $$
DECLARE
  f_sem uuid;
  f_exp uuid;
  f_emb uuid;
  s_padre uuid;
  s_hijo uuid;
  s_espiritu uuid;
  v_tla uuid;
  v_libro_juan smallint;
  v_libro_lucas smallint;
  v_libro_galatas smallint;
  c_con uuid;
  c_rel uuid;
  c_ens uuid;
  c_com uuid;
  c_exp uuid;
  c_rec uuid;
  v_tipo_quiz uuid;
  v_tipo_memoria uuid;
  v_tipo_completar uuid;
  r_tema RECORD;
  v_paso_con uuid;
  v_paso_rel uuid;
  v_paso_ens uuid;
  v_paso_com uuid;
  v_paso_exp uuid;
  v_paso_rec uuid;
  v_act_id uuid;
BEGIN
  -- Catálogos de Franjas de Edad (Sección 3.1: Semillas 5-8, Exploradores 9-12, Embajadores 13-17)
  SELECT id INTO f_sem FROM public.grupo_edad WHERE codigo = 'semillas' LIMIT 1;
  SELECT id INTO f_exp FROM public.grupo_edad WHERE codigo = 'exploradores' LIMIT 1;
  SELECT id INTO f_emb FROM public.grupo_edad WHERE codigo = 'embajadores' LIMIT 1;

  -- Catálogos de las 3 Sendas Trinitarias (Sección 3.2)
  SELECT id INTO s_padre FROM public.senda WHERE codigo = 'padre' LIMIT 1;
  SELECT id INTO s_hijo FROM public.senda WHERE codigo = 'hijo' LIMIT 1;
  SELECT id INTO s_espiritu FROM public.senda WHERE codigo = 'espiritu' LIMIT 1;

  -- Versión Bíblica TLA (RF-10) y libros bíblicos
  SELECT id INTO v_tla FROM public.version_biblica WHERE codigo = 'TLA' LIMIT 1;
  SELECT id INTO v_libro_juan FROM public.libro_biblico WHERE nombre = 'Juan' LIMIT 1;
  SELECT id INTO v_libro_lucas FROM public.libro_biblico WHERE nombre = 'Lucas' LIMIT 1;
  SELECT id INTO v_libro_galatas FROM public.libro_biblico WHERE nombre = 'Gálatas' LIMIT 1;

  -- Catálogos de los 6 pasos de la Metodología CRECER (Sección 3)
  SELECT id INTO c_con FROM public.tipo_paso_crecer WHERE codigo = 'conectar' LIMIT 1;
  SELECT id INTO c_rel FROM public.tipo_paso_crecer WHERE codigo = 'relatar' LIMIT 1;
  SELECT id INTO c_ens FROM public.tipo_paso_crecer WHERE codigo = 'ensenar' LIMIT 1;
  SELECT id INTO c_com FROM public.tipo_paso_crecer WHERE codigo = 'comprobar' LIMIT 1;
  SELECT id INTO c_exp FROM public.tipo_paso_crecer WHERE codigo = 'experimentar' LIMIT 1;
  SELECT id INTO c_rec FROM public.tipo_paso_crecer WHERE codigo = 'recompensar' LIMIT 1;

  -- Catálogos de Tipos de Actividad (RF-11: quiz, flashcards y completar el versículo)
  SELECT id INTO v_tipo_quiz FROM public.tipo_actividad WHERE codigo = 'cuestionario' LIMIT 1;
  SELECT id INTO v_tipo_memoria FROM public.tipo_actividad WHERE codigo = 'tarjetas_memoria' LIMIT 1;
  SELECT id INTO v_tipo_completar FROM public.tipo_actividad WHERE codigo = 'completar_versiculo' LIMIT 1;

  -- ===========================================================================
  -- 2.1 SENDA DEL PADRE (Tema: «El Amor de Dios» / temas de la Senda del Padre)
  -- ===========================================================================
  FOR r_tema IN
    SELECT id FROM public.tema
    WHERE senda_id = s_padre
       OR slug = 'el-amor-de-dios'
       OR id IN ('20000000-0000-0000-0000-000000000001', '47a2e22f-86da-466f-92ff-1847d85de609')
  LOOP
    IF v_tla IS NOT NULL THEN
      UPDATE public.tema SET version_biblica_id = COALESCE(version_biblica_id, v_tla) WHERE id = r_tema.id;
    END IF;

    INSERT INTO public.tema_grupo_edad (tema_id, grupo_edad_id)
    SELECT r_tema.id, id FROM public.grupo_edad
    ON CONFLICT DO NOTHING;

    IF v_libro_juan IS NOT NULL THEN
      INSERT INTO public.referencia_biblica (tema_id, libro_id, capitulo, versiculo_inicio, versiculo_fin, principal)
      SELECT r_tema.id, v_libro_juan, 3, 16, 16, true
      WHERE NOT EXISTS (SELECT 1 FROM public.referencia_biblica WHERE tema_id = r_tema.id);

      INSERT INTO public.versiculo_clave (tema_id, texto, libro_id, capitulo, versiculo)
      VALUES (r_tema.id, 'Dios amó tanto a la gente de este mundo, que me entregó a mí, que soy su único Hijo, para que todo el que crea en mí no muera, sino que tenga vida eterna. (Juan 3:16 TLA)', v_libro_juan, 3, 16)
      ON CONFLICT (tema_id) DO UPDATE SET texto = EXCLUDED.texto;
    END IF;

    INSERT INTO public.paso_tema (tema_id, tipo_paso_id, orden, obligatorio) VALUES
      (r_tema.id, c_con, 1, true),
      (r_tema.id, c_rel, 2, true),
      (r_tema.id, c_ens, 3, true),
      (r_tema.id, c_com, 4, true),
      (r_tema.id, c_exp, 5, true),
      (r_tema.id, c_rec, 6, true)
    ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING;

    SELECT id INTO v_paso_con FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_con LIMIT 1;
    SELECT id INTO v_paso_rel FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_rel LIMIT 1;
    SELECT id INTO v_paso_ens FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_ens LIMIT 1;
    SELECT id INTO v_paso_com FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_com LIMIT 1;
    SELECT id INTO v_paso_exp FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_exp LIMIT 1;
    SELECT id INTO v_paso_rec FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_rec LIMIT 1;

    -- PASO 1 (CONECTAR) · Senda del Padre por Franja de Edad
    IF v_paso_con IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_con, f_sem,
          'El abrazo gigante de Dios Padre (Semillas · 5 a 8 años)',
          'Senda del Padre · Semillas (5-8 años) · Imagina el abrazo más grande del mundo: así te ama y te cuida Dios Padre cada día.',
          E'¿Sabías que Dios Padre te conoce por tu nombre y te ama muchísimo? No importa lo que pase, su amor es como un abrazo gigante que nunca termina.\n\nEn esta Senda del Padre recorremos la metodología CRECER para descubrir tres verdades hermosas para tu edad:\n• Dios Padre es nuestro Creador amoroso: Él hizo el cielo, las estrellas, los animales y te formó a ti con mucho cariño (Génesis 1:1 TLA).\n• Dios Padre nos cuida siempre: así como unos papás buenos abrazan y protegen a sus hijos, nuestro Padre celestial escucha tus oraciones y te acompaña día y noche (Salmos 23:1 TLA).\n• Su amor nunca se acaba: eres un hijo muy especial de Dios Padre y Él siempre cumple sus promesas (Juan 3:16 TLA).'
        ),
        (
          v_paso_con, f_exp,
          '¿Cómo es el amor de Dios Padre? (Exploradores · 9 a 12 años)',
          'Senda del Padre · Exploradores (9-12 años) · Descubre cómo el amor incondicional de Dios Padre da inicio a nuestro recorrido CRECER.',
          E'Todos hablamos del amor, pero en la Biblia aprendemos que el amor verdadero no es solo una emoción pasajera: es una decisión fiel y constante. Dios Padre nos amó primero sin que tuviéramos que ganárnoslo.\n\nEn esta Senda del Padre exploramos tres pilares fundamentales para tu edad:\n• El Padre como Creador y Fuente de vida: todo lo bueno que existe nace de su sabiduría y bondad paternal (Santiago 1:17 TLA).\n• Un amor sin condiciones: mientras el mundo suele amar por conveniencia, Dios Padre nos ama con fidelidad eterna y nos perdona cuando nos acercamos a Él (1 Juan 4:9-10 TLA).\n• Nuestra identidad como hijos: conocer al Padre cambia la forma en que confiamos en Él y tratamos a nuestro prójimo (1 Juan 3:1 TLA).'
        ),
        (
          v_paso_con, f_emb,
          'Paternidad divina e identidad firme (Embajadores · 13 a 17 años)',
          'Senda del Padre · Embajadores (13-17 años) · Reflexiona sobre cómo el amor eterno de Dios Padre transforma tu identidad y propósito.',
          E'En un mundo donde la aceptación suele ser condicional y depender de logros o apariencias, la Palabra de Dios nos revela un amor radicalmente diferente: el amor eterno e inmutable de Dios Padre.\n\nEn este primer paso de la Senda del Padre profundizamos en tres dimensiones clave para Embajadores:\n• El amor que toma la iniciativa: Dios Padre no esperó a que fuéramos perfectos para amarnos; su gracia soberana nos alcanzó primero (1 Juan 4:10 TLA).\n• Identidad de hijos amados: cuando comprendemos quién es nuestro Padre celestial (1 Juan 3:1 TLA), dejamos de depender de la presión social o de etiquetas pasajeras.\n• Seguridad y propósito eterno: ninguna circunstancia presente ni futura puede separarnos del amor del Padre (Romanos 8:38-39 TLA).'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 2 (RELATAR) · Senda del Padre por Franja de Edad
    IF v_paso_rel IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_rel, f_sem,
          'La historia del amor de Dios Padre (Juan 3:16 TLA)',
          'Escucha con atención cómo Dios Padre nos muestra su amor desde la creación (Juan 3:16 TLA).',
          'La Biblia dice en Juan 3:16 TLA: «Dios amó tanto a la gente de este mundo, que me entregó a mí, que soy su único Hijo». Desde el principio, Dios Padre nos ha demostrado su amor: nos creó, nos cuidó como un Pastor fiel y nunca nos dejó solos. La historia más hermosa de toda la Biblia es que Dios Padre nos ama y siempre nos amará.'
        ),
        (
          v_paso_rel, f_exp,
          'Dios Padre es amor (1 Juan 4:8-10 TLA)',
          'Lee y escucha 1 Juan 4:8-10 TLA: ¿por qué dice la Biblia que Dios ES amor?',
          'El apóstol Juan escribió algo extraordinario en 1 Juan 4:8-10 TLA: «Dios es amor». No dice solo que Dios tiene amor, sino que el amor es Su esencia. El amor de Dios Padre consiste en que Él nos amó primero y envió a Su Hijo para darnos vida.'
        ),
        (
          v_paso_rel, f_emb,
          'Nada nos separa del amor del Padre (Romanos 8:38-39 TLA)',
          'Analiza Romanos 8:38-39 TLA. ¿Qué significa para tu vida que nada pueda separarte del amor de Dios?',
          'Pablo declara en Romanos 8:38-39 TLA que ni la muerte, ni la vida, ni ángeles, ni principados, ni lo presente, ni lo por venir podrá separarnos del amor de Dios. Frente a la incertidumbre y las pruebas, el amor del Padre permanece como un fundamento inquebrantable.'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 3 (ENSEÑAR) · Senda del Padre por Franja de Edad
    IF v_paso_ens IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_ens, f_sem,
          'Dios Padre siempre te ama (1 Juan 4:8 TLA)',
          'Versículo clave para memorizar: «Dios es amor» (1 Juan 4:8 TLA).',
          'Así como el sol sale cada mañana, el amor de Dios Padre está contigo cada día. No tienes que tener miedo: Él te escucha cuando oras y te cuida en todo momento porque eres su hijo amado.'
        ),
        (
          v_paso_ens, f_exp,
          'El amor de Dios Padre es incondicional (Juan 3:16 TLA)',
          'Memoriza Juan 3:16 TLA y 1 Juan 4:10 TLA como verdad central de la Senda del Padre.',
          'El amor humano a veces pone condiciones, pero Dios Padre nos ama incondicionalmente. Su amor no se compra con méritos: se recibe con fe y gratitud, transformando nuestra manera de vivir.'
        ),
        (
          v_paso_ens, f_emb,
          'El amor como esencia del Padre (1 Juan 3:1 TLA)',
          'Memoriza Romanos 8:38-39 TLA y 1 Juan 3:1 TLA.',
          'Todo lo que Dios Padre hace —Su justicia, Su misericordia, Su gracia y Su dirección— brota de Su amor perfecto. Comprender esto nos permite acercarnos a Él no con temor servil, sino con la confianza de hijos adoptados por gracia (Romanos 8:15 TLA).'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 4 (COMPROBAR) · Actividades Senda del Padre (RF-11: Quiz, Flashcards y Completar versículo)
    IF v_paso_com IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_com, f_sem, 'Comprobemos lo aprendido en la Senda del Padre', 'Completa las actividades para habilitar el botón Continuar.', 'Demuestra con alegría lo que aprendiste sobre el amor y el cuidado de Dios Padre.'),
        (v_paso_com, f_exp, 'Comprobación · Senda del Padre', 'Resuelve todas las actividades de este paso para continuar.', 'Pon a prueba lo aprendido en la Senda del Padre.'),
        (v_paso_com, f_emb, 'Comprobación doctrinal · Senda del Padre', 'Completa las actividades para avanzar al paso Experimentar.', 'Verifica tu comprensión bíblica sobre la paternidad y el amor de Dios.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;

      UPDATE public.actividad SET paso_id = v_paso_com WHERE tema_id = r_tema.id AND paso_id IS NULL;

      IF v_tipo_completar IS NOT NULL THEN
        INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
        VALUES
          (r_tema.id, v_paso_com, f_sem, v_tipo_completar, 'Completar el versículo · Juan 3:16 TLA', 'Selecciona las palabras correctas para completar el versículo clave.', '¡Muy bien! Memorizaste Juan 3:16 TLA.', 3, 15, 'facil', '{"versiculo_con_huecos":"Porque Dios [amó] tanto al [mundo] que dio a su Hijo único (Juan 3:16 TLA)","distractores":["olvidó","templo"]}'::jsonb),
          (r_tema.id, v_paso_com, f_exp, v_tipo_completar, 'Completar el versículo · 1 Juan 4:10 TLA', 'Completa el versículo clave de la Senda del Padre.', '¡Excelente! Guardaste 1 Juan 4:10 TLA en tu corazón.', 3, 15, 'normal', '{"versiculo_con_huecos":"En esto consiste el [amor]: no en que nosotros hayamos amado a Dios, sino en que él nos [amó] primero (1 Juan 4:10 TLA)","distractores":["orgullo","juzgó"]}'::jsonb),
          (r_tema.id, v_paso_com, f_emb, v_tipo_completar, 'Completar el versículo · Romanos 8:39 TLA', 'Completa la declaración de Romanos 8:39 TLA.', '¡Correcto! Nada nos separa del amor del Padre.', 3, 20, 'dificil', '{"versiculo_con_huecos":"Ninguna cosa creada podrá [separarnos] del [amor] de Dios en Cristo Jesús (Romanos 8:39 TLA)","distractores":["alejarnos","poder"]}'::jsonb)
        ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
      END IF;
    END IF;

    -- PASO 5 (EXPERIMENTAR) · Contenido y Preguntas de Reflexión Senda del Padre
    IF v_paso_exp IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_exp, f_sem, 'Viviendo como hijos amados del Padre', 'Reflexiona y comparte el amor de Dios Padre en tu casa.', 'Cuando sabemos que Dios Padre nos cuida y nos ama tanto, queremos agradecerle y compartir su cariño con nuestra familia.'),
        (v_paso_exp, f_exp, 'Compartiendo el amor del Padre esta semana', 'Escribe cómo pondrás en práctica lo aprendido en la Senda del Padre.', 'Como hijos de Dios Padre, estamos llamados a reflejar Su bondad, perdón y cuidado hacia quienes nos rodean.'),
        (v_paso_exp, f_emb, 'Viviendo como Embajadores del Padre', 'Reflexiona con honestidad y escribe tu compromiso personal.', 'Si el amor del Padre define quiénes somos, nuestra vida debe reflejar seguridad interior, compasión e integridad.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;

      INSERT INTO public.pregunta_reflexion (paso_id, grupo_edad_id, pregunta, orden)
      VALUES
        (v_paso_exp, f_sem, '¿Cómo te hace sentir saber que Dios Padre te cuida y te ama siempre?', 1),
        (v_paso_exp, f_exp, 'Esta semana, ¿con qué acción concreta puedes mostrar el amor y la bondad de Dios Padre a alguien que lo necesita?', 1),
        (v_paso_exp, f_emb, 'Si el amor de Dios Padre es incondicional e inquebrantable, ¿cómo debería impactar eso en tu identidad y en cómo tratas a los demás?', 1)
      ON CONFLICT (paso_id, grupo_edad_id, orden) DO UPDATE SET
        pregunta = EXCLUDED.pregunta;
    END IF;

    -- PASO 6 (RECOMPENSAR) · Cierre de la Senda del Padre
    IF v_paso_rec IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_rec, f_sem, '¡Senda del Padre completada!', '¡Recibe tu recompensa por cumplir los 6 pasos CRECER!', '¡Lo hiciste muy bien! Has completado los 6 pasos CRECER de la Senda del Padre para Semillas. Recuerda siempre que eres un hijo muy amado de Dios Padre.'),
        (v_paso_rec, f_exp, '¡Excelente! Completaste la Senda del Padre', 'Cumpliste los 6 pasos CRECER de la Senda del Padre.', 'Excelente trabajo, Explorador. Has completado la metodología CRECER en la Senda del Padre y aprendido que Su amor es eterno e incondicional.'),
        (v_paso_rec, f_emb, '¡Senda del Padre cumplida con éxito!', 'Completaste los 6 pasos CRECER de la Senda del Padre.', '¡Bien hecho, Embajador! Has culminado la metodología CRECER en la Senda del Padre. Que Romanos 8:38-39 TLA sea siempre un ancla para tu identidad y tu fe.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;
  END LOOP;


  -- ===========================================================================
  -- 2.2 SENDA DEL HIJO (Tema: «Jesús enseña con parábolas» / temas de la Senda del Hijo)
  -- ===========================================================================
  FOR r_tema IN
    SELECT id FROM public.tema
    WHERE senda_id = s_hijo
       OR slug IN ('jesus-ensena-con-parabolas', 'parabolas-de-jesus')
       OR LOWER(titulo) LIKE '%parábola%'
       OR LOWER(titulo) LIKE '%parabola%'
  LOOP
    IF v_tla IS NOT NULL THEN
      UPDATE public.tema SET version_biblica_id = COALESCE(version_biblica_id, v_tla) WHERE id = r_tema.id;
    END IF;

    INSERT INTO public.tema_grupo_edad (tema_id, grupo_edad_id)
    SELECT r_tema.id, id FROM public.grupo_edad
    ON CONFLICT DO NOTHING;

    IF v_libro_lucas IS NOT NULL THEN
      INSERT INTO public.referencia_biblica (tema_id, libro_id, capitulo, versiculo_inicio, versiculo_fin, principal)
      SELECT r_tema.id, v_libro_lucas, 10, 27, 37, true
      WHERE NOT EXISTS (SELECT 1 FROM public.referencia_biblica WHERE tema_id = r_tema.id);

      INSERT INTO public.versiculo_clave (tema_id, texto, libro_id, capitulo, versiculo)
      VALUES (r_tema.id, 'Ama a tu Dios con todo lo que piensas y con todo lo que eres, y ama a tu prójimo como a ti mismo. Ve y haz tú lo mismo. (Lucas 10:27, 37 TLA)', v_libro_lucas, 10, 27)
      ON CONFLICT (tema_id) DO UPDATE SET texto = EXCLUDED.texto;
    END IF;

    INSERT INTO public.paso_tema (tema_id, tipo_paso_id, orden, obligatorio) VALUES
      (r_tema.id, c_con, 1, true),
      (r_tema.id, c_rel, 2, true),
      (r_tema.id, c_ens, 3, true),
      (r_tema.id, c_com, 4, true),
      (r_tema.id, c_exp, 5, true),
      (r_tema.id, c_rec, 6, true)
    ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING;

    SELECT id INTO v_paso_con FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_con LIMIT 1;
    SELECT id INTO v_paso_rel FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_rel LIMIT 1;
    SELECT id INTO v_paso_ens FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_ens LIMIT 1;
    SELECT id INTO v_paso_com FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_com LIMIT 1;
    SELECT id INTO v_paso_exp FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_exp LIMIT 1;
    SELECT id INTO v_paso_rec FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_rec LIMIT 1;

    -- PASO 1 (CONECTAR) · Senda del Hijo por Franja de Edad
    IF v_paso_con IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_con, f_sem,
          'Las historias maravillosas de Jesús (Semillas · 5 a 8 años)',
          'Senda del Hijo · Semillas (5-8 años) · Descubre cómo Jesús, nuestro Salvador y Amigo, nos enseña con hermosas parábolas.',
          E'Cuando Jesús caminaba por la tierra, los niños y las familias se acercaban con alegría para escucharlo porque Él enseñaba con historias especiales llamadas parábolas.\n\nEn esta Senda del Hijo recorremos los 6 pasos CRECER para aprender:\n• Qué es una parábola: es una historia sencilla sobre semillas, ovejas o amigos que nos enseña cómo es el Reino de Dios.\n• El ejemplo del Buen Samaritano (Lucas 10:33 TLA): Jesús nos enseña a ayudar y cuidar con cariño a quien está herido o triste.\n• La buena semilla en el corazón (Mateo 13:23 TLA): cuando escuchamos a Jesús y obedecemos Su Palabra, nuestro corazón da frutos de amor.'
        ),
        (
          v_paso_con, f_exp,
          'Secretos del Reino en las parábolas de Jesús (Exploradores · 9 a 12 años)',
          'Senda del Hijo · Exploradores (9-12 años) · Explora por qué Jesús enseñaba con parábolas y qué significan para tu vida.',
          E'¿Por qué el Hijo de Dios eligió enseñar con historias sobre sembradores, ovejas perdidas y viajeros en el camino? Porque Jesús quería que la verdad del Reino de Dios tocara nuestro corazón y transformara nuestras decisiones diarias.\n\nEn esta Senda del Hijo exploramos tres grandes enseñanzas para tu edad:\n• La Parábola del Sembrador (Mateo 13:23 TLA): cómo preparar nuestra mente y corazón para ser «buena tierra» que retiene la Palabra.\n• La Parábola del Buen Samaritano (Lucas 10:27-37 TLA): demostrar el amor al prójimo con acciones concretas de compasión.\n• La Parábola del Hijo Pródigo (Lucas 15:20 TLA): conocer la gracia de Jesús que perdona, restaura y celebra a quien regresa a Dios.'
        ),
        (
          v_paso_con, f_emb,
          'La cosmovisión del Reino en las parábolas de Jesús (Embajadores · 13 a 17 años)',
          'Senda del Hijo · Embajadores (13-17 años) · Analiza cómo las parábolas de Jesucristo desafían nuestra forma de pensar, amar y servir.',
          E'Las parábolas de Jesús no eran simples fábulas morales; eran relatos profundos que confrontaban la indiferencia y el orgullo de su tiempo para revelar la gracia redentora y la ética del Reino de Dios.\n\nEn este recorrido CRECER de la Senda del Hijo profundizamos en tres ejes para Embajadores:\n• Discernimiento espiritual (Mateo 13:11-23 TLA): por qué un corazón humilde y receptivo comprende los misterios del Reino y produce fruto perseverante.\n• Compasión que derriba prejuicios (Lucas 10:25-37 TLA): el Buen Samaritano redefine quién es nuestro prójimo por encima de barreras sociales.\n• Gracia frente a legalismo (Lucas 15:11-32 TLA): el llamado de Cristo a vivir desde la reconciliación y el liderazgo de servicio.'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 2 (RELATAR) · Senda del Hijo por Franja de Edad
    IF v_paso_rel IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_rel, f_sem,
          'El Sembrador y el Buen Samaritano (Lucas 8:8 TLA y Lucas 10:33 TLA)',
          'Escucha las historias que contó Jesús sobre la semilla buena y el viajero bondadoso.',
          'Un día Jesús contó que un sembrador lanzó semillas en el campo: las semillas que cayeron en tierra buena crecieron fuertes y dieron mucho fruto (Lucas 8:8 TLA). También contó la historia del Buen Samaritano, quien se detuvo a curar y ayudar a un hombre herido en el camino (Lucas 10:30-35 TLA). Así nos enseña Jesús a escuchar a Dios y a ayudar a todos.'
        ),
        (
          v_paso_rel, f_exp,
          'Historias que transforman el corazón (Mateo 13:23 TLA y Lucas 10:27 TLA)',
          'Lee y escucha cómo Jesús explicó la parábola del Sembrador y la del Buen Samaritano.',
          'En Mateo 13:3-23 TLA, Jesús explica que la semilla es la Palabra del Reino y los cuatro terrenos representan cómo responde cada corazón: solo la buena tierra oye, entiende y da fruto. Y en Lucas 10:25-37 TLA, ante la pregunta «¿Quién es mi prójimo?», Jesús muestra que el verdadero amor se demuestra teniendo misericordia activa hacia quien sufre.'
        ),
        (
          v_paso_rel, f_emb,
          'El Reino que confronta y restaura (Mateo 13 TLA, Lucas 10 TLA y Lucas 15 TLA)',
          'Estudia y escucha el contexto bíblico de las parábolas centrales de Jesucristo.',
          'A través de Mateo 13 TLA, Lucas 10 TLA y Lucas 15 TLA, Jesús revela un Reino que crece frente a las presiones del mundo (el Sembrador), que rompe la indiferencia religiosa con misericordia práctica (el Buen Samaritano) y que recibe con gracia al pecador arrepentido (el Hijo Pródigo). En cada relato, Jesús mismo encarna el amor redentor que enseña.'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 3 (ENSEÑAR) · Senda del Hijo por Franja de Edad
    IF v_paso_ens IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_ens, f_sem,
          'Escuchar a Jesús y hacer el bien (Lucas 10:27 TLA)',
          'Versículo clave para memorizar: «Ama a tu prójimo como a ti mismo» (Lucas 10:27 TLA).',
          'Al terminar la parábola del Buen Samaritano, Jesús dijo en Lucas 10:37 TLA: «Ve, y haz tú lo mismo». Cuando escuchamos las palabras de Jesús y ayudamos con amor a los demás, vivimos como verdaderos amigos suyos.'
        ),
        (
          v_paso_ens, f_exp,
          'Oidores y hacedores de la enseñanza de Jesús (Mateo 13:23 TLA)',
          'Memoriza Lucas 8:15 TLA y Lucas 10:27 TLA en tu recorrido por la Senda del Hijo.',
          'Entender una parábola de Jesús significa llevarla a la práctica. Jesús enseña que quien oye Su Palabra y la pone por obra es como un hombre prudente que edificó su casa sobre la roca (Mateo 7:24 TLA).'
        ),
        (
          v_paso_ens, f_emb,
          'Cristo, el centro vivo de las parábolas (Lucas 10:27-37 TLA)',
          'Medita: seguir a Jesús implica adoptar Su compasión, Su verdad y Su servicio.',
          'Jesús no solo predicó acerca del Reino; Él inauguró el Reino con Su vida, cruz y resurrección. Vivir la Senda del Hijo es permitir que Sus palabras gobiernen nuestra mente y nos impulsen a amar no solo de palabra, sino de hecho y en verdad (1 Juan 3:18 TLA).'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 4 (COMPROBAR) · Contenido y Actividades por Franja de Edad en Senda del Hijo (Quiz, Flashcards y Completar versículo)
    IF v_paso_com IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_com, f_sem, 'Comprobemos lo aprendido en la Senda del Hijo', 'Completa las actividades sobre las parábolas de Jesús para continuar.', 'Demuestra cuánto aprendiste de las historias que contó Jesús.'),
        (v_paso_com, f_exp, 'Comprobación · Senda del Hijo', 'Resuelve las actividades de comprobación para desbloquear el siguiente paso.', 'Pon a prueba tu comprensión sobre las parábolas de Jesús.'),
        (v_paso_com, f_emb, 'Comprobación bíblica · Senda del Hijo', 'Completa las actividades para avanzar al paso Experimentar.', 'Verifica tu dominio del mensaje teológico y práctico de las parábolas de Cristo.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;

      UPDATE public.actividad SET paso_id = v_paso_com WHERE tema_id = r_tema.id AND paso_id IS NULL;

      -- 1) Actividad Quiz Semillas (Senda del Hijo)
      v_act_id := NULL;
      INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
      VALUES (r_tema.id, v_paso_com, f_sem, v_tipo_quiz, 'Quiz · Las parábolas de Jesús', '¿Qué nos enseñó Jesús en la parábola del Buen Samaritano (Lucas 10 TLA)?', '¡Muy bien! Jesús nos enseñó a ayudar con amor y compasión a quien lo necesita.', 1, 15, 'facil', '{"kind":"single_choice"}')
      ON CONFLICT (tema_id, grupo_edad_id, orden) DO UPDATE SET
        paso_id = EXCLUDED.paso_id,
        tipo_actividad_id = EXCLUDED.tipo_actividad_id,
        titulo = EXCLUDED.titulo,
        consigna = EXCLUDED.consigna,
        retroalimentacion = EXCLUDED.retroalimentacion,
        configuracion = EXCLUDED.configuracion
      RETURNING id INTO v_act_id;

      IF v_act_id IS NOT NULL THEN
        INSERT INTO public.opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
          (v_act_id, 'A', 'A ayudar y cuidar con amor a nuestro prójimo', true, 1, '¡Correcto! Así seguimos el ejemplo de Jesús.'),
          (v_act_id, 'B', 'A pasar de largo sin ayudar a nadie', false, 2, 'Jesús nos enseña a ser compasivos como el Buen Samaritano.'),
          (v_act_id, 'C', 'A ayudar solamente a quienes nos dan juguetes', false, 3, 'Jesús nos invita a amar a todos sin interés.')
        ON CONFLICT (actividad_id, orden) DO UPDATE SET
          etiqueta = EXCLUDED.etiqueta,
          texto = EXCLUDED.texto,
          correcta = EXCLUDED.correcta,
          retroalimentacion = EXCLUDED.retroalimentacion;
      END IF;

      -- 1) Actividad Quiz Exploradores (Senda del Hijo)
      v_act_id := NULL;
      INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
      VALUES (r_tema.id, v_paso_com, f_exp, v_tipo_quiz, 'Quiz · El Sembrador y el Reino', 'En la parábola del Sembrador (Mateo 13:23 TLA), ¿qué representa la «buena tierra»?', '¡Exacto! Representa a quienes escuchan la Palabra de Dios, la entienden y dan fruto.', 1, 15, 'normal', '{"kind":"single_choice"}')
      ON CONFLICT (tema_id, grupo_edad_id, orden) DO UPDATE SET
        paso_id = EXCLUDED.paso_id,
        tipo_actividad_id = EXCLUDED.tipo_actividad_id,
        titulo = EXCLUDED.titulo,
        consigna = EXCLUDED.consigna,
        retroalimentacion = EXCLUDED.retroalimentacion,
        configuracion = EXCLUDED.configuracion
      RETURNING id INTO v_act_id;

      IF v_act_id IS NOT NULL THEN
        INSERT INTO public.opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
          (v_act_id, 'A', 'El corazón que escucha la Palabra de Dios, la comprende y da fruto', true, 1, '¡Muy bien! Ese es el corazón de un verdadero discípulo de Jesús.'),
          (v_act_id, 'B', 'Las personas que olvidan enseguida lo que aprendieron', false, 2, 'Eso representa la semilla que cayó junto al camino.'),
          (v_act_id, 'C', 'Las preocupaciones que ahogan la enseñanza', false, 3, 'Eso representa la semilla que cayó entre espinos.')
        ON CONFLICT (actividad_id, orden) DO UPDATE SET
          etiqueta = EXCLUDED.etiqueta,
          texto = EXCLUDED.texto,
          correcta = EXCLUDED.correcta,
          retroalimentacion = EXCLUDED.retroalimentacion;
      END IF;

      -- 1) Actividad Quiz Embajadores (Senda del Hijo)
      v_act_id := NULL;
      INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
      VALUES (r_tema.id, v_paso_com, f_emb, v_tipo_quiz, 'Quiz · Ética del Reino en las Parábolas', '¿Cuál es el propósito central de Jesús al enseñar mediante las parábolas del Reino (Mateo 13, Lucas 10 y 15 TLA)?', 'Las parábolas revelan la gracia redentora de Dios y nos llaman a una fe que se demuestra en compasión, perdón y fruto.', 1, 20, 'dificil', '{"kind":"single_choice"}')
      ON CONFLICT (tema_id, grupo_edad_id, orden) DO UPDATE SET
        paso_id = EXCLUDED.paso_id,
        tipo_actividad_id = EXCLUDED.tipo_actividad_id,
        titulo = EXCLUDED.titulo,
        consigna = EXCLUDED.consigna,
        retroalimentacion = EXCLUDED.retroalimentacion,
        configuracion = EXCLUDED.configuracion
      RETURNING id INTO v_act_id;

      IF v_act_id IS NOT NULL THEN
        INSERT INTO public.opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
          (v_act_id, 'A', 'Transformar el corazón para vivir la gracia, la misericordia y la obediencia del Reino', true, 1, '¡Correcto! Las parábolas confrontan la indiferencia y nos llaman a vivir como Cristo.'),
          (v_act_id, 'B', 'Cumplir apariencias externas sin amar al prójimo', false, 2, 'Jesús confrontó precisamente la religiosidad sin compasión.'),
          (v_act_id, 'C', 'Esconder nuestros dones sin servir a la comunidad', false, 3, 'Jesús nos llama a poner nuestros talentos al servicio del Reino.')
        ON CONFLICT (actividad_id, orden) DO UPDATE SET
          etiqueta = EXCLUDED.etiqueta,
          texto = EXCLUDED.texto,
          correcta = EXCLUDED.correcta,
          retroalimentacion = EXCLUDED.retroalimentacion;
      END IF;

      -- 2) Flashcards y 3) Completar versículo para Senda del Hijo (RF-11)
      IF v_tipo_memoria IS NOT NULL THEN
        INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
        VALUES
          (r_tema.id, v_paso_com, f_sem, v_tipo_memoria, 'Flashcards · Parábolas de Jesús', 'Encuentra los pares de las parábolas que enseñó Jesús.', '¡Excelente! Recordaste las historias de Jesús.', 2, 15, 'facil', '{"pares":[{"id":1,"izquierda":"El Sembrador","derecha":"La semilla en buena tierra (Mateo 13 TLA)"},{"id":2,"izquierda":"El Buen Samaritano","derecha":"Ayudar con compasión al herido (Lucas 10 TLA)"},{"id":3,"izquierda":"La Oveja Perdida","derecha":"Jesús nos busca con amor (Lucas 15 TLA)"},{"id":4,"izquierda":"El Hijo Pródigo","derecha":"El abrazo de perdón (Lucas 15 TLA)"}]}'::jsonb),
          (r_tema.id, v_paso_com, f_exp, v_tipo_memoria, 'Flashcards · Enseñanzas del Reino', 'Une cada parábola de Jesús con su significado espiritual.', '¡Muy bien! Conoces el significado de las parábolas.', 2, 15, 'normal', '{"pares":[{"id":1,"izquierda":"Buena tierra (Mateo 13:23 TLA)","derecha":"Oír la Palabra, entenderla y dar fruto"},{"id":2,"izquierda":"Buen Samaritano (Lucas 10:33 TLA)","derecha":"Misericordia práctica con el prójimo"},{"id":3,"izquierda":"Hijo Pródigo (Lucas 15:20 TLA)","derecha":"Gracia que perdona y restaura"},{"id":4,"izquierda":"Roca firme (Mateo 7:24 TLA)","derecha":"Obedecer las palabras de Jesús"}]}'::jsonb),
          (r_tema.id, v_paso_com, f_emb, v_tipo_memoria, 'Flashcards · Parábolas y Discipulado', 'Relaciona cada parábola con su desafío para nuestra vida.', '¡Excelente dominio de las parábolas de Cristo!', 2, 20, 'dificil', '{"pares":[{"id":1,"izquierda":"Mateo 13:23 TLA","derecha":"Perseverancia y fruto frente a las distracciones"},{"id":2,"izquierda":"Lucas 10:27-37 TLA","derecha":"Compasión que supera todo prejuicio"},{"id":3,"izquierda":"Lucas 15:11-32 TLA","derecha":"Reconciliación frente al orgullo y legalismo"},{"id":4,"izquierda":"Mateo 25:14-30 TLA","derecha":"Mayordomía fiel de los dones para el Reino"}]}'::jsonb)
        ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
      END IF;

      IF v_tipo_completar IS NOT NULL THEN
        INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
        VALUES
          (r_tema.id, v_paso_com, f_sem, v_tipo_completar, 'Completar el versículo · Lucas 10:27 TLA', 'Completa el versículo que nos enseñó Jesús.', '¡Muy bien! Memorizaste Lucas 10:27 TLA.', 3, 15, 'facil', '{"versiculo_con_huecos":"Ama a tu [Dios] con todo lo que eres y ama a tu [prójimo] como a ti mismo (Lucas 10:27 TLA)","distractores":["enemigo","tesoro"]}'::jsonb),
          (r_tema.id, v_paso_com, f_exp, v_tipo_completar, 'Completar el versículo · Mateo 13:23 TLA', 'Completa la explicación de Jesús sobre la buena tierra.', '¡Excelente! Guardaste Mateo 13:23 TLA en tu corazón.', 3, 15, 'normal', '{"versiculo_con_huecos":"Las semillas en buena [tierra] son los que escuchan el [mensaje], lo entienden y dan fruto (Mateo 13:23 TLA)","distractores":["piedra","camino"]}'::jsonb),
          (r_tema.id, v_paso_com, f_emb, v_tipo_completar, 'Completar el versículo · Lucas 10:27, 37 TLA', 'Completa el mandato de Jesús en la parábola del Buen Samaritano.', '¡Correcto! Así vivimos el llamado de Jesús.', 3, 20, 'dificil', '{"versiculo_con_huecos":"Ama a tu [prójimo] como a ti mismo; ve y haz tú lo [mismo] con misericordia (Lucas 10:27, 37 TLA)","distractores":["orgullo","contrario"]}'::jsonb)
        ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
      END IF;
    END IF;

    -- PASO 5 (EXPERIMENTAR) · Contenido y Preguntas de Reflexión Senda del Hijo
    IF v_paso_exp IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_exp, f_sem, 'Siguiendo los pasos de Jesús hoy', 'Piensa cómo puedes imitar a Jesús y al Buen Samaritano.', 'Jesús quiere que llevemos Sus enseñanzas a la práctica compartiendo, ayudando y tratando con cariño a todos.'),
        (v_paso_exp, f_exp, 'Practicando las parábolas en nuestra vida diaria', 'Responde la pregunta de reflexión para tu franja de Exploradores.', 'Las parábolas de Jesús nos retan a tener un corazón receptivo y a actuar con empatía en casa y en la escuela.'),
        (v_paso_exp, f_emb, 'Liderazgo y compasión al estilo de Jesús', 'Reflexiona sobre cómo aplicar las parábolas de Cristo en tu entorno.', 'Como Embajador de Cristo, estás llamado a encarnar la misericordia, el perdón y la fidelidad del Reino.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;

      INSERT INTO public.pregunta_reflexion (paso_id, grupo_edad_id, pregunta, orden)
      VALUES
        (v_paso_exp, f_sem, '¿A quién puedes ayudar hoy con cariño como lo enseñó Jesús en la parábola del Buen Samaritano?', 1),
        (v_paso_exp, f_exp, '¿Qué puedes hacer esta semana para que tu corazón sea «buena tierra» y para actuar como el Buen Samaritano con tus compañeros?', 1),
        (v_paso_exp, f_emb, '¿Qué prejuicio, distracción o comodidad te desafía Jesús a dejar atrás hoy a través de sus parábolas para servir mejor a tu prójimo?', 1)
      ON CONFLICT (paso_id, grupo_edad_id, orden) DO UPDATE SET
        pregunta = EXCLUDED.pregunta;
    END IF;

    -- PASO 6 (RECOMPENSAR) · Cierre de la Senda del Hijo
    IF v_paso_rec IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_rec, f_sem, '¡Senda del Hijo completada!', '¡Felicidades por terminar los 6 pasos CRECER de la Senda del Hijo!', '¡Excelente trabajo! Completaste la metodología CRECER en la Senda del Hijo para Semillas. Sigue escuchando y viviendo las enseñanzas de Jesús cada día.'),
        (v_paso_rec, f_exp, '¡Excelente! Completaste la Senda del Hijo', 'Has cumplido los 6 pasos CRECER de la Senda del Hijo.', '¡Gran trabajo, Explorador! Completaste la metodología CRECER en la Senda del Hijo. Que tu corazón sea siempre buena tierra para la Palabra de Jesús.'),
        (v_paso_rec, f_emb, '¡Senda del Hijo cumplida con éxito!', 'Completaste los 6 pasos CRECER de la Senda del Hijo.', '¡Excelente, Embajador! Has culminado los 6 pasos CRECER de la Senda del Hijo. Que las enseñanzas y el ejemplo de Cristo guíen tu liderazgo y servicio.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;
  END LOOP;


  -- ===========================================================================
  -- 2.3 SENDA DEL ESPÍRITU SANTO (Tema: «Los frutos del Espíritu» / temas de la Senda del Espíritu Santo)
  -- ===========================================================================
  FOR r_tema IN
    SELECT id FROM public.tema
    WHERE senda_id = s_espiritu
       OR slug IN ('los-frutos-del-espiritu', 'frutos-del-espiritu')
       OR LOWER(titulo) LIKE '%fruto%'
       OR LOWER(titulo) LIKE '%espíritu%'
       OR LOWER(titulo) LIKE '%espiritu%'
  LOOP
    IF v_tla IS NOT NULL THEN
      UPDATE public.tema SET version_biblica_id = COALESCE(version_biblica_id, v_tla) WHERE id = r_tema.id;
    END IF;

    INSERT INTO public.tema_grupo_edad (tema_id, grupo_edad_id)
    SELECT r_tema.id, id FROM public.grupo_edad
    ON CONFLICT DO NOTHING;

    IF v_libro_galatas IS NOT NULL THEN
      INSERT INTO public.referencia_biblica (tema_id, libro_id, capitulo, versiculo_inicio, versiculo_fin, principal)
      SELECT r_tema.id, v_libro_galatas, 5, 22, 23, true
      WHERE NOT EXISTS (SELECT 1 FROM public.referencia_biblica WHERE tema_id = r_tema.id);

      INSERT INTO public.versiculo_clave (tema_id, texto, libro_id, capitulo, versiculo)
      VALUES (r_tema.id, 'En cambio, el Espíritu de Dios nos hace amar a los demás, estar siempre alegres y vivir en paz con todos; nos hace ser pacientes y amables, y tratar bien a los demás; tener confianza en Dios, ser humildes, y saber dominar nuestros malos deseos. (Gálatas 5:22-23 TLA)', v_libro_galatas, 5, 22)
      ON CONFLICT (tema_id) DO UPDATE SET texto = EXCLUDED.texto;
    END IF;

    INSERT INTO public.paso_tema (tema_id, tipo_paso_id, orden, obligatorio) VALUES
      (r_tema.id, c_con, 1, true),
      (r_tema.id, c_rel, 2, true),
      (r_tema.id, c_ens, 3, true),
      (r_tema.id, c_com, 4, true),
      (r_tema.id, c_exp, 5, true),
      (r_tema.id, c_rec, 6, true)
    ON CONFLICT (tema_id, tipo_paso_id) DO NOTHING;

    SELECT id INTO v_paso_con FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_con LIMIT 1;
    SELECT id INTO v_paso_rel FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_rel LIMIT 1;
    SELECT id INTO v_paso_ens FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_ens LIMIT 1;
    SELECT id INTO v_paso_com FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_com LIMIT 1;
    SELECT id INTO v_paso_exp FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_exp LIMIT 1;
    SELECT id INTO v_paso_rec FROM public.paso_tema WHERE tema_id = r_tema.id AND tipo_paso_id = c_rec LIMIT 1;

    -- PASO 1 (CONECTAR) · Senda del Espíritu Santo por Franja de Edad
    IF v_paso_con IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_con, f_sem,
          'Un árbol lleno de frutos hermosos (Semillas · 5 a 8 años)',
          'Senda del Espíritu Santo · Semillas (5-8 años) · Descubre los frutos dulces que el Espíritu Santo hace crecer en nuestro corazón.',
          E'Imagina un árbol grande y verde lleno de frutas deliciosas. En la Biblia aprendemos que cuando el Espíritu Santo vive en nuestro corazón, hace crecer frutos hermosos en nuestra vida para que compartamos alegría y paz con todos.\n\nEn esta Senda del Espíritu Santo recorremos los 6 pasos CRECER para conocer:\n• Quién es el Espíritu Santo: es nuestro Consolador y Ayudador amoroso que está siempre con nosotros (Juan 14:26 TLA).\n• Cuáles son Sus frutos (Gálatas 5:22-23 TLA): amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre y templanza.\n• Cómo mostrar esos frutos: siendo niños amables, alegres, pacientes y llenos de paz en casa y con nuestros amigos.'
        ),
        (
          v_paso_con, f_exp,
          '¿Cómo transforma el Espíritu Santo nuestro carácter? (Exploradores · 9 a 12 años)',
          'Senda del Espíritu Santo · Exploradores (9-12 años) · Explora cómo los 9 frutos del Espíritu crecen cuando caminamos con Dios.',
          E'Un árbol se conoce por su fruto. De la misma manera, cuando caminamos guiados por el Espíritu Santo, nuestra vida empieza a reflejar un carácter distinto: lleno de paz en medio de las dificultades, paciente con los demás y firme para hacer el bien.\n\nEn esta Senda del Espíritu Santo exploramos tres dimensiones clave de Gálatas 5:22-23 TLA:\n• Frutos en nuestro interior: amor, gozo y paz que nacen de nuestra comunión diaria con Dios.\n• Frutos hacia nuestro prójimo: paciencia, benignidad (amabilidad) y bondad en el trato con nuestros compañeros y familia.\n• Frutos de carácter firme: fe (fidelidad), mansedumbre y templanza (dominio propio) para gobernar nuestras reacciones.'
        ),
        (
          v_paso_con, f_emb,
          'Carácter transformado por el Espíritu Santo (Embajadores · 13 a 17 años)',
          'Senda del Espíritu Santo · Embajadores (13-17 años) · Reflexiona sobre cómo el Espíritu Santo forma el carácter de Cristo en nuestra vida.',
          E'En una cultura que suele exaltar la reacción impulsiva y la búsqueda de aprobación inmediata, Gálatas 5 nos presenta una transformación profunda: la obra del Espíritu Santo que renueva nuestra mente, nuestras emociones y nuestra voluntad desde la raíz.\n\nEn este recorrido CRECER de la Senda del Espíritu Santo profundizamos en tres pilares para Embajadores:\n• Libertad con propósito (Gálatas 5:13-16 TLA): vivir en el Espíritu nos libera del egoísmo para servir a los demás por amor.\n• Madurez integral (Gálatas 5:22-23 TLA): amor, gozo, paz, paciencia, benignidad, bondad, fidelidad, mansedumbre y dominio propio como evidencia de una fe viva.\n• Valentía y dominio propio (2 Timoteo 1:7 TLA): el Espíritu nos capacita para liderar con integridad y paz en nuestra comunidad.'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 2 (RELATAR) · Senda del Espíritu Santo por Franja de Edad
    IF v_paso_rel IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_rel, f_sem,
          'Los nueve frutos del Espíritu (Gálatas 5:22-23 TLA)',
          'Escucha cuáles son los frutos que el Espíritu Santo siembra en tu corazón (Gálatas 5:22-23 TLA).',
          'El apóstol Pablo escribió en Gálatas 5:22-23 TLA: «El Espíritu de Dios nos hace amar a los demás, estar siempre alegres y vivir en paz con todos; nos hace ser pacientes y amables, y tratar bien a los demás». Cada vez que eliges amar, compartir con alegría y esperar tu turno con calma, el Espíritu Santo hace brillar Sus frutos en ti.'
        ),
        (
          v_paso_rel, f_exp,
          'El fruto del Espíritu en Gálatas 5:22-25 TLA',
          'Lee y escucha Gálatas 5:22-25 TLA: un solo fruto con nueve cualidades.',
          'En su carta a los Gálatas (Gálatas 5:22-25 TLA), Pablo enseña que el fruto del Espíritu se manifiesta en nueve virtudes que crecen juntas: amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre y templanza. No nacen del orgullo humano, sino de permanecer unidos a Dios y andar por el Espíritu.'
        ),
        (
          v_paso_rel, f_emb,
          'Andar por el Espíritu (Gálatas 5:16-25 TLA)',
          'Analiza y escucha Gálatas 5:16-25 TLA dentro de la Senda del Espíritu Santo.',
          'Pablo contrasta las obras del egoísmo humano (enemistades, pleitos, celos, iras, divisiones) con el fruto del Espíritu Santo (Gálatas 5:19-23 TLA). La verdadera madurez espiritual consiste en crucificar el egoísmo y permitir que el Espíritu Santo dirija cada área de nuestro carácter (Gálatas 5:25 TLA).'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 3 (ENSEÑAR) · Senda del Espíritu Santo por Franja de Edad
    IF v_paso_ens IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (
          v_paso_ens, f_sem,
          'El Espíritu Santo nos ayuda cada día (Gálatas 5:22 TLA)',
          'Versículo clave para memorizar: «El fruto del Espíritu es amor, gozo y paz» (Gálatas 5:22 TLA).',
          'No tenemos que hacerlo solos: cuando oramos y le pedimos ayuda al Espíritu Santo, Él quita el miedo y nos da paciencia, alegría y bondad para tratar bien a todos.'
        ),
        (
          v_paso_ens, f_exp,
          'Guiados por el Espíritu en nuestras decisiones (Gálatas 5:22-23 TLA)',
          'Memoriza los 9 frutos del Espíritu en Gálatas 5:22-23 TLA.',
          'Andar en el Espíritu (Gálatas 5:25 TLA) significa dejar que Él guíe nuestros pensamientos, palabras y reacciones. Donde antes había impaciencia o enojo, el Espíritu Santo produce paz, mansedumbre y dominio propio.'
        ),
        (
          v_paso_ens, f_emb,
          'Santificación y dominio propio (Gálatas 5:22-23 TLA y 2 Timoteo 1:7 TLA)',
          'Medita en Gálatas 5:22-23 TLA y 2 Timoteo 1:7 TLA.',
          'En la enseñanza bíblica, la mansedumbre no es debilidad, sino fortaleza bajo control; y la templanza (dominio propio) es la capacidad dada por el Espíritu Santo para gobernar nuestros pensamientos, palabras y hábitos para la gloria de Dios.'
        )
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;

    -- PASO 4 (COMPROBAR) · Contenido y Actividades por Franja de Edad en Senda del Espíritu Santo (Quiz, Flashcards y Completar versículo)
    IF v_paso_com IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_com, f_sem, 'Comprobemos lo aprendido en la Senda del Espíritu Santo', 'Completa las actividades sobre los frutos del Espíritu para continuar.', 'Demuestra cuánto aprendiste sobre los frutos del Espíritu Santo.'),
        (v_paso_com, f_exp, 'Comprobación · Senda del Espíritu Santo', 'Resuelve las actividades de comprobación sobre Gálatas 5:22-23 TLA.', 'Pon a prueba tu memoria y comprensión bíblica en la Senda del Espíritu Santo.'),
        (v_paso_com, f_emb, 'Comprobación bíblica · Senda del Espíritu Santo', 'Completa las actividades para avanzar al paso Experimentar.', 'Verifica tu comprensión sobre la vida en el Espíritu y Sus frutos.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;

      UPDATE public.actividad SET paso_id = v_paso_com WHERE tema_id = r_tema.id AND paso_id IS NULL;

      -- 1) Actividad Quiz Semillas (Senda del Espíritu Santo)
      v_act_id := NULL;
      INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
      VALUES (r_tema.id, v_paso_com, f_sem, v_tipo_quiz, 'Quiz · Los frutos del Espíritu', 'Según Gálatas 5:22 TLA, ¿cuáles son frutos que el Espíritu Santo hace crecer en nuestro corazón?', '¡Excelente! El Espíritu Santo llena nuestro corazón de amor, gozo, paz, paciencia y bondad.', 1, 15, 'facil', '{"kind":"single_choice"}')
      ON CONFLICT (tema_id, grupo_edad_id, orden) DO UPDATE SET
        paso_id = EXCLUDED.paso_id,
        tipo_actividad_id = EXCLUDED.tipo_actividad_id,
        titulo = EXCLUDED.titulo,
        consigna = EXCLUDED.consigna,
        retroalimentacion = EXCLUDED.retroalimentacion,
        configuracion = EXCLUDED.configuracion
      RETURNING id INTO v_act_id;

      IF v_act_id IS NOT NULL THEN
        INSERT INTO public.opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
          (v_act_id, 'A', 'Amor, gozo, paz, paciencia y bondad', true, 1, '¡Muy bien! Esos son los frutos hermosos del Espíritu Santo.'),
          (v_act_id, 'B', 'Enojo, peleas y egoísmo', false, 2, 'Esas no son actitudes del Espíritu Santo.'),
          (v_act_id, 'C', 'Miedo y tristeza todo el tiempo', false, 3, 'El Espíritu Santo nos da paz y alegría.')
        ON CONFLICT (actividad_id, orden) DO UPDATE SET
          etiqueta = EXCLUDED.etiqueta,
          texto = EXCLUDED.texto,
          correcta = EXCLUDED.correcta,
          retroalimentacion = EXCLUDED.retroalimentacion;
      END IF;

      -- 1) Actividad Quiz Exploradores (Senda del Espíritu Santo)
      v_act_id := NULL;
      INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
      VALUES (r_tema.id, v_paso_com, f_exp, v_tipo_quiz, 'Quiz · Gálatas 5:22-23 TLA', 'Según Gálatas 5:22-23 TLA, ¿cuántas cualidades forman el fruto del Espíritu Santo y cuál nos ayuda a gobernarnos a nosotros mismos?', 'Son 9 cualidades en Gálatas 5:22-23 TLA, y la templanza (dominio propio) nos ayuda a controlar nuestras reacciones.', 1, 15, 'normal', '{"kind":"single_choice"}')
      ON CONFLICT (tema_id, grupo_edad_id, orden) DO UPDATE SET
        paso_id = EXCLUDED.paso_id,
        tipo_actividad_id = EXCLUDED.tipo_actividad_id,
        titulo = EXCLUDED.titulo,
        consigna = EXCLUDED.consigna,
        retroalimentacion = EXCLUDED.retroalimentacion,
        configuracion = EXCLUDED.configuracion
      RETURNING id INTO v_act_id;

      IF v_act_id IS NOT NULL THEN
        INSERT INTO public.opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
          (v_act_id, 'A', '9 cualidades, incluyendo la mansedumbre y la templanza (dominio propio)', true, 1, '¡Exacto! El Espíritu Santo forma esas 9 virtudes en nosotros.'),
          (v_act_id, 'B', 'Solo 2 cualidades que dependen de nuestra propia fuerza', false, 2, 'En Gálatas 5:22-23 se mencionan 9 virtudes producidas por el Espíritu.'),
          (v_act_id, 'C', 'Ninguna que tenga que ver con la paciencia', false, 3, 'La paciencia es uno de los frutos centrales del Espíritu.')
        ON CONFLICT (actividad_id, orden) DO UPDATE SET
          etiqueta = EXCLUDED.etiqueta,
          texto = EXCLUDED.texto,
          correcta = EXCLUDED.correcta,
          retroalimentacion = EXCLUDED.retroalimentacion;
      END IF;

      -- 1) Actividad Quiz Embajadores (Senda del Espíritu Santo)
      v_act_id := NULL;
      INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
      VALUES (r_tema.id, v_paso_com, f_emb, v_tipo_quiz, 'Quiz · Vida en el Espíritu', 'Según Gálatas 5:16-25 TLA y 2 Timoteo 1:7 TLA, ¿qué significa «andar en el Espíritu»?', 'Significa vivir bajo la dirección diaria del Espíritu Santo, manifestando amor, poder y dominio propio frente al egoísmo.', 1, 20, 'dificil', '{"kind":"single_choice"}')
      ON CONFLICT (tema_id, grupo_edad_id, orden) DO UPDATE SET
        paso_id = EXCLUDED.paso_id,
        tipo_actividad_id = EXCLUDED.tipo_actividad_id,
        titulo = EXCLUDED.titulo,
        consigna = EXCLUDED.consigna,
        retroalimentacion = EXCLUDED.retroalimentacion,
        configuracion = EXCLUDED.configuracion
      RETURNING id INTO v_act_id;

      IF v_act_id IS NOT NULL THEN
        INSERT INTO public.opcion_actividad (actividad_id, etiqueta, texto, correcta, orden, retroalimentacion) VALUES
          (v_act_id, 'A', 'Permitir que el Espíritu gobierne nuestro carácter, decisiones y relaciones con amor y dominio propio', true, 1, '¡Correcto! Quienes viven por el Espíritu también andan guiados por Él.'),
          (v_act_id, 'B', 'Dejarse llevar por cada impulso de ira o rivalidad', false, 2, 'Pablo enseña que el Espíritu vence precisamente esos impulsos.'),
          (v_act_id, 'C', 'Vivir con espíritu de cobardía ante las presiones del entorno', false, 3, '2 Timoteo 1:7 afirma que Dios nos dio espíritu de poder, amor y dominio propio.')
        ON CONFLICT (actividad_id, orden) DO UPDATE SET
          etiqueta = EXCLUDED.etiqueta,
          texto = EXCLUDED.texto,
          correcta = EXCLUDED.correcta,
          retroalimentacion = EXCLUDED.retroalimentacion;
      END IF;

      -- 2) Flashcards y 3) Completar versículo para Senda del Espíritu Santo (RF-11)
      IF v_tipo_memoria IS NOT NULL THEN
        INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
        VALUES
          (r_tema.id, v_paso_com, f_sem, v_tipo_memoria, 'Flashcards · Los Frutos del Espíritu', 'Encuentra los pares de los frutos del Espíritu Santo.', '¡Excelente! Conoces los frutos del Espíritu Santo.', 2, 15, 'facil', '{"pares":[{"id":1,"izquierda":"Amor y Gozo","derecha":"Cariño y alegría en el corazón (Gálatas 5:22 TLA)"},{"id":2,"izquierda":"Paz y Paciencia","derecha":"Calma y saber esperar sin enojarse"},{"id":3,"izquierda":"Benignidad y Bondad","derecha":"Ser amables y hacer el bien a todos"},{"id":4,"izquierda":"Mansedumbre y Templanza","derecha":"Humildad y dominio propio"}]}'::jsonb),
          (r_tema.id, v_paso_com, f_exp, v_tipo_memoria, 'Flashcards · Gálatas 5:22-23 TLA', 'Une cada grupo de frutos del Espíritu con su aplicación.', '¡Muy bien! Así crece el fruto del Espíritu en ti.', 2, 15, 'normal', '{"pares":[{"id":1,"izquierda":"Amor, Gozo y Paz","derecha":"Frutos que nacen de nuestra comunión con Dios"},{"id":2,"izquierda":"Paciencia, Benignidad y Bondad","derecha":"Frutos en el trato hacia nuestro prójimo"},{"id":3,"izquierda":"Fe y Mansedumbre","derecha":"Fidelidad y fortaleza bajo control"},{"id":4,"izquierda":"Templanza (Gálatas 5:23 TLA)","derecha":"Dominio propio sobre nuestras reacciones"}]}'::jsonb),
          (r_tema.id, v_paso_com, f_emb, v_tipo_memoria, 'Flashcards · Carácter en el Espíritu', 'Relaciona cada verdad bíblica del Espíritu Santo con su fruto.', '¡Excelente dominio de Gálatas 5 y 2 Timoteo 1:7!', 2, 20, 'dificil', '{"pares":[{"id":1,"izquierda":"Gálatas 5:16 TLA","derecha":"Andar en el Espíritu vence el egoísmo"},{"id":2,"izquierda":"Gálatas 5:22-23 TLA","derecha":"Nueve virtudes de un carácter maduro en Cristo"},{"id":3,"izquierda":"Gálatas 5:25 TLA","derecha":"Si vivimos por el Espíritu, sigamos su guía"},{"id":4,"izquierda":"2 Timoteo 1:7 TLA","derecha":"Espíritu de poder, amor y dominio propio"}]}'::jsonb)
        ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
      END IF;

      IF v_tipo_completar IS NOT NULL THEN
        INSERT INTO public.actividad (tema_id, paso_id, grupo_edad_id, tipo_actividad_id, titulo, consigna, retroalimentacion, orden, xp_recompensa, dificultad, configuracion)
        VALUES
          (r_tema.id, v_paso_com, f_sem, v_tipo_completar, 'Completar el versículo · Gálatas 5:22 TLA', 'Completa las palabras del versículo sobre los frutos del Espíritu.', '¡Muy bien! Memorizaste Gálatas 5:22 TLA.', 3, 15, 'facil', '{"versiculo_con_huecos":"El Espíritu de Dios nos hace [amar] a los demás, estar alegres y vivir en [paz] (Gálatas 5:22 TLA)","distractores":["pelear","enojo"]}'::jsonb),
          (r_tema.id, v_paso_com, f_exp, v_tipo_completar, 'Completar el versículo · Gálatas 5:22-23 TLA', 'Completa el versículo de los frutos del Espíritu Santo.', '¡Excelente! Guardaste Gálatas 5:22-23 TLA en tu corazón.', 3, 15, 'normal', '{"versiculo_con_huecos":"El fruto del [Espíritu] es amor, gozo, [paz], paciencia, benignidad y bondad (Gálatas 5:22 TLA)","distractores":["mundo","orgullo"]}'::jsonb),
          (r_tema.id, v_paso_com, f_emb, v_tipo_completar, 'Completar el versículo · 2 Timoteo 1:7 TLA', 'Completa la promesa de 2 Timoteo 1:7 TLA en la Senda del Espíritu Santo.', '¡Correcto! Dios nos dio espíritu de poder, amor y dominio propio.', 3, 20, 'dificil', '{"versiculo_con_huecos":"Dios no nos dio espíritu de timidez, sino de [poder], de amor y de [dominio] propio (2 Timoteo 1:7 TLA)","distractores":["temor","orgullo"]}'::jsonb)
        ON CONFLICT (tema_id, grupo_edad_id, orden) DO NOTHING;
      END IF;
    END IF;

    -- PASO 5 (EXPERIMENTAR) · Contenido y Preguntas de Reflexión Senda del Espíritu Santo
    IF v_paso_exp IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_exp, f_sem, 'Compartiendo los frutos del Espíritu en casa', 'Elige qué fruto del Espíritu vas a practicar hoy.', 'Nuestras palabras y acciones son la forma en que los demás pueden ver el amor, la alegría y la paz del Espíritu Santo en nosotros.'),
        (v_paso_exp, f_exp, 'Cultivando los frutos del Espíritu esta semana', 'Reflexiona y escribe tu reto práctico de la semana.', 'Cada situación difícil en el colegio o en casa es una oportunidad para que el Espíritu Santo muestre Su fruto a través de ti.'),
        (v_paso_exp, f_emb, 'Evidenciando el fruto del Espíritu en tu entorno', 'Escribe tu reflexión personal para cerrar el paso de aplicación.', 'Un Embajador de Cristo demuestra madurez espiritual cuando sus reacciones en momentos de tensión reflejan el fruto del Espíritu Santo.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;

      INSERT INTO public.pregunta_reflexion (paso_id, grupo_edad_id, pregunta, orden)
      VALUES
        (v_paso_exp, f_sem, '¿Cuál de los frutos del Espíritu Santo (amor, alegría, paz, paciencia o bondad) quieres compartir hoy con tu familia?', 1),
        (v_paso_exp, f_exp, '¿Cuál de los nueve frutos del Espíritu (como paciencia, paz o dominio propio) necesitas pedirle más a Dios esta semana y cómo lo pondrás en práctica?', 1),
        (v_paso_exp, f_emb, '¿En qué área concreta de tu vida diaria (familia, estudios, redes sociales o amistades) necesitas que el Espíritu Santo fortalezca hoy tu paz, mansedumbre o dominio propio?', 1)
      ON CONFLICT (paso_id, grupo_edad_id, orden) DO UPDATE SET
        pregunta = EXCLUDED.pregunta;
    END IF;

    -- PASO 6 (RECOMPENSAR) · Cierre de la Senda del Espíritu Santo
    IF v_paso_rec IS NOT NULL THEN
      INSERT INTO public.contenido_paso_tema (paso_id, grupo_edad_id, titulo, instruccion_corta, cuerpo)
      VALUES
        (v_paso_rec, f_sem, '¡Senda del Espíritu Santo completada!', '¡Felicidades por completar los 6 pasos CRECER de la Senda del Espíritu Santo!', '¡Maravilloso trabajo! Completaste la metodología CRECER de la Senda del Espíritu Santo para Semillas. Sigue dando frutos de amor, alegría y paz todos los días.'),
        (v_paso_rec, f_exp, '¡Excelente! Completaste la Senda del Espíritu Santo', 'Has cumplido los 6 pasos CRECER de la Senda del Espíritu Santo.', '¡Felicidades, Explorador! Completaste los 6 pasos CRECER de la Senda del Espíritu Santo. Sigue caminando guiado por el Espíritu cada día.'),
        (v_paso_rec, f_emb, '¡Senda del Espíritu Santo cumplida con éxito!', 'Completaste los 6 pasos CRECER de la Senda del Espíritu Santo.', '¡Excelente trabajo, Embajador! Has culminado los 6 pasos CRECER de la Senda del Espíritu Santo. Que tu vida refleje siempre el amor, la paz y el dominio propio del Espíritu.')
      ON CONFLICT (paso_id, grupo_edad_id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        instruccion_corta = EXCLUDED.instruccion_corta,
        cuerpo = EXCLUDED.cuerpo;
    END IF;
  END LOOP;
END $$;


-- =============================================================================
-- 3. ASEGURAR PARES EN TARJETAS DE MEMORIA (FLASHCARDS) EN PASO 4 «COMPROBAR»
-- =============================================================================
UPDATE public.actividad a
SET configuracion = jsonb_set(
  COALESCE(a.configuracion, '{}'::jsonb),
  '{pares}',
  '[
    {"id": 1, "izquierda": "Amor y Gozo", "derecha": "Frutos del Espíritu en el corazón (Gálatas 5:22 TLA)"},
    {"id": 2, "izquierda": "Paz y Paciencia", "derecha": "Esperar y confiar con calma en Dios"},
    {"id": 3, "izquierda": "Benignidad y Bondad", "derecha": "Tratar con amabilidad y hacer el bien al prójimo"},
    {"id": 4, "izquierda": "Mansedumbre y Templanza", "derecha": "Humildad y dominio propio guiados por el Espíritu"}
  ]'::jsonb
)
FROM public.tipo_actividad ta
WHERE a.tipo_actividad_id = ta.id
  AND ta.codigo = 'tarjetas_memoria'
  AND (a.configuracion->'pares' IS NULL OR jsonb_array_length(a.configuracion->'pares') = 0);

COMMIT;
