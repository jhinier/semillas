import type { CodigoCriterioLogro } from "../../admin-logros.api";

export type CriterioLogroDescripcion = {
  codigo: CodigoCriterioLogro;
  etiqueta: string;
  descripcionCorta: string;
  unidad: string;
};

export const CRITERIOS_LOGRO: CriterioLogroDescripcion[] = [
  {
    codigo: "temas_completados",
    etiqueta: "Temas completados",
    descripcionCorta: "Cuenta los temas que el usuario finalizó.",
    unidad: "temas",
  },
  {
    codigo: "actividades_completadas",
    etiqueta: "Actividades completadas",
    descripcionCorta: "Cuenta las actividades respondidas correctamente.",
    unidad: "actividades",
  },
  {
    codigo: "dias_racha",
    etiqueta: "Días de racha",
    descripcionCorta: "Días consecutivos con al menos una actividad correcta.",
    unidad: "días",
  },
];

export function obtenerCriterio(codigo: CodigoCriterioLogro): CriterioLogroDescripcion {
  const encontrado = CRITERIOS_LOGRO.find((item) => item.codigo === codigo);
  if (!encontrado) {
    throw new Error(`Criterio de logro no soportado: ${codigo}`);
  }
  return encontrado;
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
