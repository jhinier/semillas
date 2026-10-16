import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const devVarsContent = fs.readFileSync(path.resolve(__dirname, "../backend/.dev.vars"), "utf-8");
const vars: Record<string, string> = {};
for (const line of devVarsContent.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    vars[match[1].trim()] = match[2].trim();
  }
}

const supabase = createClient(vars.SUPABASE_URL, vars.SUPABASE_ANON_KEY);
const temaId = "fc54e07e-6ed2-4541-909d-041cfc679b81";

async function test() {
  console.log("Testing tema query...");
  try {
    const { data, error } = await supabase
      .from("tema")
      .select("*, path:senda_id(id, codigo, nombre, color_hex), created_by:creado_por(id, nombre_visible), portada_recurso:portada_recurso_id(id, url_publica, texto_alternativo, titulo), grupos_edad:tema_grupo_edad(grupo_edad:grupo_edad_id(id, codigo, nombre))")
      .eq("id", temaId)
      .single();
    if (error) throw error;
    console.log("Tema query success:", !!data);
  } catch (err) {
    console.error("Tema query failed:", err);
  }

  console.log("Testing pasos query...");
  try {
    // Note: The frontend/backend repository does:
    // supabase.from("paso_tema").select("id, tipo_paso_id, orden, tipo_paso:tipo_paso_id(...)")
    // Let's check listing steps for a theme
    const { data, error } = await supabase
      .from("paso_tema")
      .select("id, tipo_paso_id, orden, tipo_paso:tipo_paso_id(id, codigo, nombre)")
      .eq("tema_id", temaId);
    if (error) throw error;
    console.log("Pasos query success, count:", data.length);
  } catch (err) {
    console.error("Pasos query failed:", err);
  }

  console.log("Testing calcularCompletitudTema...");
  try {
    const [temaResult, gruposResult, pasosResult, actividadesResult, versiculoResult] = await Promise.all([
      supabase.from("tema").select("id, titulo, slug, objetivo, resumen, portada_recurso_id, version_biblica_id, senda_id, xp_recompensa, minutos_estimados").eq("id", temaId).single(),
      supabase.from("tema_grupo_edad").select("grupo_edad_id, grupo_edad:grupo_edad_id(codigo)").eq("tema_id", temaId),
      supabase.from("paso_tema").select("id, tipo_paso_id, orden, tipo_paso:tipo_paso_id(codigo), contenidos:contenido_paso_tema(id, grupo_edad_id, titulo, cuerpo, recurso_audio_id)").eq("tema_id", temaId),
      supabase.from("actividad").select("id, paso_id, grupo_edad_id, titulo, consigna, configuracion, tipo_actividad:tipo_actividad_id(codigo,requiere_opciones), opciones:opcion_actividad(correcta)").eq("tema_id", temaId),
      supabase.from("versiculo_clave").select("texto, libro_id, capitulo, versiculo").eq("tema_id", temaId).maybeSingle()
    ]);
    if (temaResult.error) throw temaResult.error;
    if (gruposResult.error) throw gruposResult.error;
    if (pasosResult.error) throw pasosResult.error;
    if (actividadesResult.error) throw actividadesResult.error;
    if (versiculoResult.error) throw versiculoResult.error;
    console.log("calcularCompletitudTema parts fetched successfully!");
  } catch (err) {
    console.error("calcularCompletitudTema failed:", err);
  }
}

test().catch(console.error);
