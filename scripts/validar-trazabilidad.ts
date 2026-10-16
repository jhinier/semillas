import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type EstadoTrazabilidad = "revalidar" | "brecha" | "cumple" | "desviacion";

export type RequisitoTrazabilidad = {
  id: string;
  estado: EstadoTrazabilidad;
  gate: string;
  pruebas?: string[];
  evidencias?: string[];
  archivos?: string[];
};

export type ErrorTrazabilidad = {
  codigo: string;
  id?: string;
  mensaje: string;
};

const estados = new Set<EstadoTrazabilidad>(["revalidar", "brecha", "cumple", "desviacion"]);
const idsEsperados = new Set([
  "RF-B1", "RF-B2",
  ...Array.from({ length: 27 }, (_, indice) => `RF-${String(indice + 1).padStart(2, "0")}`),
  ...Array.from({ length: 9 }, (_, indice) => `RNF-${String(indice + 1).padStart(2, "0")}`),
  ...Array.from({ length: 10 }, (_, indice) => `RS-${String(indice + 1).padStart(2, "0")}`),
  ...Array.from({ length: 10 }, (_, indice) => `ENT-${String(indice + 1).padStart(2, "0")}`),
  "DESV-01",
]);

export function validarTrazabilidad(requisitos: RequisitoTrazabilidad[], validarMatrizCompleta = false): ErrorTrazabilidad[] {
  const errores: ErrorTrazabilidad[] = [];
  const ids = new Set<string>();

  for (const requisito of requisitos) {
    if (ids.has(requisito.id)) {
      errores.push({ codigo: "ID_DUPLICADO", id: requisito.id, mensaje: `ID duplicado: ${requisito.id}` });
    }
    ids.add(requisito.id);

    if (!requisito.gate?.trim()) {
      errores.push({ codigo: "GATE_REQUERIDO", id: requisito.id, mensaje: `${requisito.id} no tiene gate` });
    }
    if (!estados.has(requisito.estado)) {
      errores.push({ codigo: "ESTADO_INVALIDO", id: requisito.id, mensaje: `Estado inválido en ${requisito.id}` });
    }

    if (requisito.estado === "cumple") {
      if (!requisito.pruebas?.length || !requisito.evidencias?.length) {
        errores.push({
          codigo: "EVIDENCIA_REQUERIDA",
          id: requisito.id,
          mensaje: `${requisito.id} está en cumple sin pruebas y evidencias`,
        });
      }
      for (const ruta of [...(requisito.pruebas ?? []), ...(requisito.evidencias ?? []), ...(requisito.archivos ?? [])]) {
        if (!existsSync(resolve(process.cwd(), ruta))) {
          errores.push({ codigo: "RUTA_INEXISTENTE", id: requisito.id, mensaje: `Ruta inexistente para ${requisito.id}: ${ruta}` });
        }
      }
    }
  }
  if (validarMatrizCompleta) {
    for (const id of idsEsperados) {
      if (!ids.has(id)) errores.push({ codigo: "ID_AUSENTE", id, mensaje: `Falta el requisito ${id}` });
    }
  }
  return errores;
}

export function cargarRequisitos(): RequisitoTrazabilidad[] {
  const ruta = resolve(process.cwd(), "docs/trazabilidad/requisitos.json");
  return JSON.parse(readFileSync(ruta, "utf8")) as RequisitoTrazabilidad[];
}

if (import.meta.main) {
  const errores = validarTrazabilidad(cargarRequisitos(), true);
  if (errores.length > 0) {
    for (const error of errores) console.error(`[${error.codigo}] ${error.mensaje}`);
    process.exit(1);
  }
  const requisitos = cargarRequisitos();
  const resumen = requisitos.reduce<Record<string, number>>((acc, requisito) => {
    acc[requisito.estado] = (acc[requisito.estado] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Trazabilidad válida: ${requisitos.length} requisitos`, resumen);
}
