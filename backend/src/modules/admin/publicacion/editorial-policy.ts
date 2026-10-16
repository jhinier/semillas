export type EstadoEditorial = "borrador" | "revision" | "aprobado" | "publicado" | "archivado";

const transicionesPermitidas: Record<EstadoEditorial, readonly EstadoEditorial[]> = {
  borrador: ["revision"],
  revision: ["aprobado", "borrador"],
  aprobado: ["publicado", "borrador"],
  publicado: ["archivado"],
  archivado: [],
};

export function validarTransicionEditorial(actual: EstadoEditorial, siguiente: EstadoEditorial): void {
  if (!transicionesPermitidas[actual].includes(siguiente)) {
    throw new Error(`Transición editorial no permitida: ${actual} -> ${siguiente}`);
  }
}

export function puedePublicar(estado: EstadoEditorial, revisionAprobada: boolean): boolean {
  return estado === "aprobado" && revisionAprobada;
}
