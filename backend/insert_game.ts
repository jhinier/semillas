import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno antes de ejecutar este script."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const themeId = 'd94347af-a8e5-4b59-aa3c-5c97840a990b';
  const tipoPasoComprobarId = 'c2b51e33-b8f2-4154-bac2-c2dd5b62f4c6'; // Comprobar
  const tipoActividadFlashcardsId = 'a26528fd-620e-40b2-9f66-c6b87d4f1034'; // Flashcards
  const grupoEdadId = '4afa01e2-96c1-4055-b88a-adc4f0303165'; // Usando uno existente
  const crypto = globalThis.crypto;

  console.log('Insertando paso_tema...');
  const pasoId = crypto.randomUUID();
  const { error: pasoError } = await supabase.from('paso_tema').insert({
    id: pasoId,
    tema_id: themeId,
    tipo_paso_id: tipoPasoComprobarId,
    orden: 4,
    obligatorio: true,
  });
  if (pasoError) {
    console.error('Error insertando paso:', pasoError);
    return;
  }

  console.log('Insertando contenido_paso_tema...');
  const { error: contenidoError } = await supabase.from('contenido_paso_tema').insert({
    paso_id: pasoId,
    grupo_edad_id: grupoEdadId,
    titulo: 'Repaso de Héroes de la Fe',
    cuerpo: 'Pon a prueba tu memoria recordando a los grandes héroes de la fe.',
  });
  if (contenidoError) console.error('Error contenido:', contenidoError);

  console.log('Insertando actividad (Flashcards)...');
  const actividadId = crypto.randomUUID();
  const { error: actError } = await supabase.from('actividad').insert({
    id: actividadId,
    tema_id: themeId,
    paso_id: pasoId,
    grupo_edad_id: grupoEdadId,
    tipo_actividad_id: tipoActividadFlashcardsId,
    titulo: 'Memoriza los Héroes',
    consigna: 'Lee el nombre del héroe y piensa por qué es recordado. Luego voltea la tarjeta.',
    orden: 1,
    xp_recompensa: 20,
    obligatorio: true,
    dificultad: 'normal',
    configuracion: { kind: 'flashcards' },
  });
  if (actError) {
    console.error('Error insertando actividad:', actError);
    return;
  }

  console.log('Insertando opciones (las tarjetas)...');
  const opciones = [
    {
      actividad_id: actividadId,
      texto: 'Noé', // Frente
      retroalimentacion: 'Construyó el arca por fe y salvó a su familia.', // Reverso
      correcta: true,
      orden: 1,
    },
    {
      actividad_id: actividadId,
      texto: 'Abraham',
      retroalimentacion: 'Dejó su tierra por fe y es conocido como el padre de la fe.',
      correcta: true,
      orden: 2,
    },
    {
      actividad_id: actividadId,
      texto: 'Moisés',
      retroalimentacion: 'Rechazó los tesoros de Egipto para liberar al pueblo de Dios.',
      correcta: true,
      orden: 3,
    },
    {
      actividad_id: actividadId,
      texto: 'David',
      retroalimentacion: 'Venció al gigante Goliat confiando en el nombre de Dios.',
      correcta: true,
      orden: 4,
    }
  ];

  const { error: opError } = await supabase.from('opcion_actividad').insert(opciones);
  if (opError) {
    console.error('Error insertando opciones:', opError);
  } else {
    console.log('¡Juego de Flashcards insertado correctamente en el tema', themeId, '!');
  }
}

run();
