import { peticion } from "../../shared/api/api";

export type FiltrosClubesAdmin = {
  q?: string;
  estado: "activo" | "archivado" | "todos";
  orden?: "recientes" | "nombre" | "miembros";
  limit: number;
  offset: number;
};

export type ClubAdminResumen = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  miembros: number;
  retos_abiertos: number;
  lider: { usuario_id: string; apodo: string } | null;
};

export type ListadoClubesAdmin = {
  clubes: ClubAdminResumen[];
  meta: { total: number; limit: number; offset: number };
};

export type DetalleClubAdmin = {
  club: ClubAdminDetalle;
  miembros: MiembroClubAdmin[];
  retos: RetoClubAdmin[];
};

export type ClubAdminDetalle = {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigo_invitacion: string;
  activo: boolean;
  creado_en: string;
};

export type MiembroClubAdmin = {
  usuario_id: string;
  apodo: string;
  rol_miembro: string | null;
  unido_en: string | null;
  url_avatar: string | null;
  xp_total: number;
  xp_semana: number;
  actividades_semana: number;
};

export type RetoClubAdmin = {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigo_metrica: "xp_grupal" | "actividades_completadas" | "temas_completados";
  valor_objetivo: number;
  xp_reto: number;
  fecha_inicio: string;
  fecha_fin: string;
};

export type ReporteClubAdmin = {
  id: string;
  club_id: string;
  reportado_por: string;
  reportado_usuario_id: string;
  categoria: "contenido_inapropiado" | "acoso" | "datos_personales" | "otro";
  detalle: string | null;
  estado: "abierto" | "en_revision" | "resuelto" | "descartado";
  resuelto_por: string | null;
  nota_resolucion: string | null;
  creado_en: string;
  actualizado_en: string;
};

export type CrearClubAdminSolicitud = {
  nombre: string;
  descripcion?: string;
  lider_usuario_id: string;
};

export type ActualizarClubAdminSolicitud = {
  nombre?: string;
  descripcion?: string | null;
};

export type CrearRetoClubAdminSolicitud = {
  nombre: string;
  descripcion?: string;
  codigo_metrica: "xp_grupal" | "actividades_completadas" | "temas_completados";
  valor_objetivo: number;
  xp_reto?: number;
  fecha_inicio: string;
  fecha_fin: string;
};

export type UsuarioSeleccionClubAdmin = {
  id: string;
  nombre_visible: string | null;
  correo: string | null;
  activo: boolean | null;
  rol: string;
  perfil: {
    apodo: string | null;
    url_avatar?: string | null;
    avatar_url?: string | null;
  } | null;
};

export function listarClubesAdmin(filtros: FiltrosClubesAdmin) {
  const parametros = new URLSearchParams({
    estado: filtros.estado,
    limit: String(filtros.limit),
    offset: String(filtros.offset),
  });
  if (filtros.q) parametros.set("q", filtros.q);
  if (filtros.orden) parametros.set("orden", filtros.orden);
  const ruta = `/administracion/clubes?${parametros}`;
  return peticion<ListadoClubesAdmin>(ruta);
}

export function obtenerClubAdmin(idClub: string) {
  return peticion<DetalleClubAdmin>(`/administracion/clubes/${idClub}`);
}

export function crearClubAdmin(datos: CrearClubAdminSolicitud) {
  return peticion<ClubAdminDetalle & { lider: { usuario_id: string; apodo: string } }>("/administracion/clubes", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarClubAdmin(idClub: string, datos: ActualizarClubAdminSolicitud) {
  return peticion<ClubAdminDetalle>(`/administracion/clubes/${idClub}`, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function agregarMiembroClubAdmin(idClub: string, usuarioId: string) {
  return peticion<{ added: true; usuario_id: string }>(`/administracion/clubes/${idClub}/miembros`, {
    metodo: "POST",
    cuerpo: { usuario_id: usuarioId },
  });
}

export function regenerarCodigoClubAdmin(idClub: string) {
  return peticion<{ codigo_invitacion: string }>(`/administracion/clubes/${idClub}/regenerar-codigo`, {
    metodo: "POST",
  });
}

export function buscarUsuariosClubAdmin(q = "") {
  const parametros = new URLSearchParams({ limit: "30", offset: "0" });
  if (q.trim()) parametros.set("q", q.trim());
  return peticion<{ usuarios: UsuarioSeleccionClubAdmin[]; total: number }>(`/administracion/usuarios?${parametros}`);
}

export function archivarClubAdmin(idClub: string) {
  return peticion<{ archived: true }>(`/administracion/clubes/${idClub}/archivar`, { metodo: "POST" });
}

export function reactivarClubAdmin(idClub: string) {
  return peticion<{ reactivated: true }>(`/administracion/clubes/${idClub}/reactivar`, { metodo: "POST" });
}

export function expulsarMiembroClubAdmin(idClub: string, usuarioId: string) {
  return peticion<{ removed: true }>(`/administracion/clubes/${idClub}/miembros/${usuarioId}`, { metodo: "DELETE" });
}

export function transferirLiderazgoClubAdmin(idClub: string, usuarioId: string) {
  return peticion<{ transferred: true; usuario_id: string }>(`/administracion/clubes/${idClub}/transferir-liderazgo`, {
    metodo: "POST",
    cuerpo: { usuario_id: usuarioId },
  });
}

export function crearRetoClubAdmin(idClub: string, datos: CrearRetoClubAdminSolicitud) {
  return peticion<{ id: string }>(`/administracion/clubes/${idClub}/retos`, {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function cerrarRetoClubAdmin(idClub: string, retoId: string, motivo: string) {
  return peticion<{ closed: true }>(`/administracion/clubes/${idClub}/retos/${retoId}/cerrar`, {
    metodo: "POST",
    cuerpo: { motivo },
  });
}

export function listarReportesClubAdmin(estado?: ReporteClubAdmin["estado"]) {
  const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";
  return peticion<ReporteClubAdmin[]>(`/administracion/reportes-clubes${query}`);
}

export function resolverReporteClubAdmin(idReporte: string, datos: { estado: "en_revision" | "resuelto" | "descartado"; nota?: string }) {
  return peticion<ReporteClubAdmin>(`/administracion/reportes-clubes/${encodeURIComponent(idReporte)}`, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}
