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
  const themeId = '47a2e22f-86da-466f-92ff-1847d85de609'; // El tema que ya tiene el quiz

  const { data: pasos } = await supabase.from('paso_tema').select('*').eq('tema_id', themeId);
  console.log('Pasos del tema origen:', pasos);

  if (pasos && pasos.length > 0) {
    for (const paso of pasos) {
      const { data: actividades } = await supabase.from('actividad').select('*').eq('paso_id', paso.id);
      console.log(`Actividades del paso ${paso.id}:`, actividades);

      if (actividades && actividades.length > 0) {
        for (const act of actividades) {
          const { data: opciones } = await supabase.from('opcion_actividad').select('*').eq('actividad_id', act.id);
          console.log(`Opciones de actividad ${act.id}:`, opciones);
        }
      }
    }
  }
}

run();
