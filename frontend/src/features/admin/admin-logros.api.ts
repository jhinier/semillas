import { peticion } from "../../shared/api/api";

export type CodigoCriterioLogro =
  | "temas_completados"
  | "actividades_completadas"
  | "dias_racha";

export type FiltrosLogrosAdmin = {
  q?: string;
  estado: "activo" | "archivado" | "todos";
  criterio?: CodigoCriterioLogro;
  limit: number;
  offset: number;
};

export type LogroAdminResumen = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  url_icono: string | null;
  bono_xp: number;
  codigo_criterio: CodigoCriterioLogro;
  valor_criterio: number;
  activo: boolean;
  creado_en: string;
  otorgados: number;
};

export type ListadoLogrosAdmin = {
  logros: LogroAdminResumen[];
  meta: { total: number; limit: number; offset: number };
};

export type CrearLogroAdminSolicitud = {
  codigo: string;
  nombre: string;
  descripcion?: string;
  url_icono?: string;
  bono_xp?: number;
  codigo_criterio: CodigoCriterioLogro;
  valor_criterio: number;
};

export type ActualizarLogroAdminSolicitud = {
  nombre?: string;
  descripcion?: string | null;
  url_icono?: string | null;
  bono_xp?: number;
  codigo_criterio?: CodigoCriterioLogro;
  valor_criterio?: number;
};

export type LogroAdminCatalogoItem = {
  id: string;
  codigo: string;
  nombre: string;
};

export function listarLogrosAdmin(filtros: FiltrosLogrosAdmin) {
  const parametros = new URLSearchParams({
    estado: filtros.estado,
    limit: String(filtros.limit),
    offset: String(filtros.offset),
  });
  if (filtros.q) parametros.set("q", filtros.q);
  if (filtros.criterio) parametros.set("criterio", filtros.criterio);
  return peticion<ListadoLogrosAdmin>(`/administracion/logros?${parametros}`);
}

export function obtenerCatalogoLogrosAdmin() {
  return peticion<LogroAdminCatalogoItem[]>("/administracion/logros/catalogo");
}

export function obtenerLogroAdmin(idLogro: string) {
  return peticion<LogroAdminResumen>(`/administracion/logros/${idLogro}`);
}

export function crearLogroAdmin(datos: CrearLogroAdminSolicitud) {
  return peticion<LogroAdminResumen>("/administracion/logros", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarLogroAdmin(idLogro: string, datos: ActualizarLogroAdminSolicitud) {
  return peticion<LogroAdminResumen>(`/administracion/logros/${idLogro}`, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function archivarLogroAdmin(idLogro: string) {
  return peticion<{ archived: true }>(`/administracion/logros/${idLogro}/archivar`, {
    metodo: "POST",
  });
}

export function reactivarLogroAdmin(idLogro: string) {
  return peticion<{ reactivated: true }>(`/administracion/logros/${idLogro}/reactivar`, {
    metodo: "POST",
  });
}