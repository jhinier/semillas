import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read and parse .dev.vars manually
const devVarsContent = fs.readFileSync(path.resolve(__dirname, "../backend/.dev.vars"), "utf-8");
const vars: Record<string, string> = {};
for (const line of devVarsContent.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    vars[match[1].trim()] = match[2].trim();
  }
}

const supabase = createClient(
  vars.SUPABASE_URL,
  vars.SUPABASE_ANON_KEY
);

async function test() {
  console.log("Supabase URL:", vars.SUPABASE_URL);
  
  // Test simple query first
  const { data: simpleData, error: simpleError } = await supabase
    .from("tema")
    .select("id, titulo")
    .limit(1);
    
  if (simpleError) {
    console.error("Simple query error:", simpleError);
    return;
  }
  console.log("Simple query success, themes found:", simpleData.length);

  // Test full query from admin.repository.ts
  const filtros = { limit: 12, offset: 0 };
  
  const { data, error, count } = await supabase
    .from("tema")
    .select("*, path:senda_id(id, codigo, nombre, color_hex), created_by:creado_por(id, nombre_visible), portada_recurso:portada_recurso_id(id, url_publica, texto_alternativo, titulo), grupos_edad:tema_grupo_edad(grupo_edad:grupo_edad_id(id, codigo, nombre))", { count: "exact" })
    .order("actualizado_en", { ascending: false })
    .range(filtros.offset, filtros.offset + filtros.limit - 1);

  if (error) {
    console.error("Listar paginados query error:", error);
  } else {
    console.log("Listar paginados success, retrieved:", data.length, "Total:", count);
  }
}

test().catch(console.error);
