import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

export type ErrorDoc = { archivo: string; enlace: string; mensaje: string };

export const documentosCanonicos = [
  "docs/estado-docs.md", "docs/arquitectura.md", "docs/api.md", "docs/backend-api.md",
  "docs/base-datos.md", "docs/offline-sync.md", "docs/seguridad.md", "docs/pruebas.md",
  "docs/despliegue.md", "docs/instalacion.md", "docs/manual-usuario.md",
  "docs/manual-administrador.md", "docs/cms.md",
];

export function validarEnlacesMarkdown(root: string, archivos = documentosCanonicos): ErrorDoc[] {
  const errores: ErrorDoc[] = [];
  const patron = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const archivo of archivos) {
    const ruta = resolve(root, archivo);
    if (!existsSync(ruta)) {
      errores.push({ archivo, enlace: archivo, mensaje: "Documento canónico inexistente" });
      continue;
    }
    const contenido = readFileSync(ruta, "utf8");
    let coincidencia: RegExpExecArray | null;
    while ((coincidencia = patron.exec(contenido))) {
      const enlace = coincidencia[1].trim();
      if (!enlace || enlace.startsWith("#") || /^[a-z]+:\/\//i.test(enlace)) continue;
      const destino = resolve(dirname(ruta), enlace.split("#")[0]);
      if (!existsSync(destino)) errores.push({ archivo, enlace, mensaje: `Enlace inexistente: ${enlace}` });
    }
  }
  return errores;
}

if (import.meta.main) {
  const errores = validarEnlacesMarkdown(process.cwd());
  if (errores.length) {
    for (const error of errores) console.error(`${error.archivo}: ${error.mensaje}`);
    process.exit(1);
  }
  console.log(`Documentación válida: ${documentosCanonicos.length} documentos canónicos`);
}
