import type { CodigoCriterioLogro } from "../../admin-logros.api";

export type CriterioLogroDescripcion = {
  codigo: CodigoCriterioLogro;
  etiqueta: string;
  descripcionCorta: string;
  unidad: string;
  unidadSingular: string;
};

export const CRITERIOS_LOGRO: CriterioLogroDescripcion[] = [
  {
    codigo: "temas_completados",
    etiqueta: "Temas completados",
    descripcionCorta: "Cuenta los temas bíblicos que el niño termina por completo.",
    unidad: "temas",
    unidadSingular: "tema",
  },
  {
    codigo: "actividades_completadas",
    etiqueta: "Actividades completadas",
    descripcionCorta: "Cuenta los juegos o preguntas respondidos correctamente.",
    unidad: "actividades",
    unidadSingular: "actividad",
  },
  {
    codigo: "dias_racha",
    etiqueta: "Días de racha",
    descripcionCorta: "Días seguidos en los que el estudiante practica al menos una vez.",
    unidad: "días",
    unidadSingular: "día",
  },
];

export function obtenerCriterio(codigo: CodigoCriterioLogro): CriterioLogroDescripcion {
  const encontrado = CRITERIOS_LOGRO.find((item) => item.codigo === codigo);
  if (!encontrado) {
    throw new Error(`Criterio de logro no soportado: ${codigo}`);
  }
  return encontrado;
}

export function formatearMetaCriterio(codigo: CodigoCriterioLogro, valor: number): string {
  const criterio = CRITERIOS_LOGRO.find((item) => item.codigo === codigo) ?? CRITERIOS_LOGRO[0]!;
  const cantidad = Number.isFinite(valor) ? Math.max(1, Math.round(valor)) : 1;
  return `${cantidad} ${cantidad === 1 ? criterio.unidadSingular : criterio.unidad}`;
}

export function describirReglaLogro(codigo: CodigoCriterioLogro, valor: number): string {
  const cantidad = Number.isFinite(valor) ? Math.max(1, Math.round(valor)) : 1;
  if (codigo === "actividades_completadas") {
    return cantidad === 1
      ? "Al completar 1 actividad correcta"
      : `Al completar ${cantidad} actividades correctas`;
  }
  if (codigo === "dias_racha") {
    return cantidad === 1
      ? "Al practicar 1 día seguido"
      : `Al mantener ${cantidad} días seguidos de racha`;
  }
  return cantidad === 1
    ? "Al completar 1 tema bíblico"
    : `Al completar ${cantidad} temas bíblicos`;
}

export function generarCodigoLogroDesdeNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 50)
    .replace(/-+$/gu, "");
}

export function formatearFechaCorta(fechaIso: string | null | undefined): string {
  if (!fechaIso) return "Sin fecha";
  try {
    return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(fechaIso));
  } catch {
    return fechaIso;
  }
}

export function validarCodigoLogro(codigo: string): string | null {
  const normalizado = codigo.trim().toLowerCase();
  if (normalizado.length < 3) return "El código debe tener al menos 3 caracteres.";
  if (normalizado.length > 50) return "El código no puede superar los 50 caracteres.";
  if (!/^[a-z0-9_-]+$/u.test(normalizado)) {
    return "Solo minúsculas, números, guion o guion bajo.";
  }
  return null;
}

export function textoErrorDesconocido(error: unknown): string {
  return error instanceof Error ? error.message : "No fue posible completar la acción.";
}
