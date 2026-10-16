import { peticion } from "../../shared/api/api";
import type { GrupoEdad } from "../../shared/api/api";

export function obtenerGruposEdad() {
  return peticion<GrupoEdad[]>("/catalogo/grupos-etarios", {
    autenticar: false,
  });
}

export function obtenerVersionesBiblicas() {
  return peticion<
    Array<{ id: string; codigo: string; nombre: string; dominio_publico: boolean }>
  >("/catalogo/versiones-biblicas", { autenticar: false });
}

export function obtenerPasosCrecer() {
  return peticion<
    Array<{
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      orden: number;
      color_hex: string | null;
    }>
  >("/catalogo/pasos-crecer", { autenticar: false });
}

export function obtenerTiposActividad() {
  return peticion<
    Array<{
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      es_juego: boolean;
    }>
  >("/catalogo/tipos-actividad", { autenticar: false });
}
