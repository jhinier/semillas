import { readFileSync } from "node:fs";
import { documentosCanonicos } from "./check-doc-links";

export type ErrorVigencia = { archivo: string; mensaje: string };

export function validarVigencia(root: string, archivos = documentosCanonicos): ErrorVigencia[] {
  const errores: ErrorVigencia[] = [];
  for (const archivo of archivos) {
    const contenido = readFileSync(`${root}/${archivo}`, "utf8");
    if (!/\*\*Owner:\*\*\s+[^·\n]+/.test(contenido)) errores.push({ archivo, mensaje: "Falta Owner" });
    if (!/\*\*Revisión:\*\*\s+\d{4}-\d{2}-\d{2}/.test(contenido)) errores.push({ archivo, mensaje: "Falta fecha de revisión" });
    if (/\b(?:TODO|TBD)\b/.test(contenido)) errores.push({ archivo, mensaje: "Contiene placeholder TODO/TBD" });
  }
  return errores;
}

if (import.meta.main) {
  const errores = validarVigencia(process.cwd());
  if (errores.length > 0) {
    for (const error of errores) console.error(`${error.archivo}: ${error.mensaje}`);
    process.exit(1);
  }
  console.log(`Vigencia documental válida: ${documentosCanonicos.length} documentos`);
}
