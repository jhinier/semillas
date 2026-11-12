import { peticion } from "../../shared/api/api";
import type { Paso, Tema } from "../../shared/api/api";

export type VersiculoClaveSolicitud = {
  libro_id: number;
  capitulo: number;
  versiculo: number;
  versiculo_fin?: number;
  texto: string;
  parte_historia?: string;
};

export type CrearTemaSolicitud = {
  senda_id: string;
  titulo: string;
  slug: string;
  objetivo: string;
  resumen: string;
  version_biblica_id: string;
  minutos_estimados: number;
  xp_recompensa: number;
  grupo_edad_ids: string[];
  portada_recurso_id?: string | null;
  versiculo_clave?: VersiculoClaveSolicitud | null;
};

export type ActualizarTemaSolicitud = {
  senda_id?: string;
  titulo?: string;
  slug?: string;
  objetivo?: string;
  resumen?: string;
  minutos_estimados?: number;
  xp_recompensa?: number;
  version_biblica_id?: string;
  grupo_edad_ids?: string[];
  portada_recurso_id?: string | null;
  versiculo_clave?: VersiculoClaveSolicitud | null;
};

export type GuardarParlanteSolicitud = {
  tipo_paso_id: string;
  grupo_edad_id: string;
  titulo: string;
  cuerpo: string;
  instruccion_corta?: string;
  recurso_id?: string | null;
  recurso_audio_id?: string | null;
  datos_extra?: Record<string, unknown>;
  preguntas?: Array<{ pregunta: string; orden: number }>;
};

export type CrearActividadSolicitud = {
  tema_id: string;
  paso_id?: string | null;
  grupo_edad_id: string;
  tipo_actividad_id: string;
  titulo: string;
  consigna: string;
  retroalimentacion?: string;
  orden: number;
  xp_recompensa: number;
  limite_tiempo_seg?: number | null;
  dificultad: "facil" | "normal" | "dificil";
  obligatorio: boolean;
  configuracion?: Record<string, unknown>;
  opciones: Array<{
    etiqueta: string;
    texto: string;
    correcta: boolean;
    orden: number;
    retroalimentacion?: string;
  }>;
};

export async function obtenerTemasAdmin(params?: { status?: string }): Promise<Tema[]> {
  const busqueda = new URLSearchParams();
  if (params?.status) busqueda.set("status", params.status);
  const query = busqueda.toString();
  const res = await peticion<Tema[] | { temas?: Tema[] }>(`/administracion/temas${query ? `?${query}` : ""}`);
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && Array.isArray(res.temas)) return res.temas;
  return [];
}

export async function obtenerTemaAdmin(idTema: string): Promise<Tema> {
  const res = await peticion<Tema | { tema?: Tema }>(`/administracion/temas/${idTema}`);
  const raw = res && typeof res === "object" && "tema" in res && res.tema ? res.tema : (res as Tema);
  if (!raw || typeof raw !== "object") return raw;
  return {
    ...raw,
    grupos_edad: Array.isArray(raw.grupos_edad) ? raw.grupos_edad : [],
  };
}

export async function obtenerPasosAdmin(idTema: string): Promise<Paso[]> {
  const res = await peticion<Paso[] | { pasos?: Paso[] }>(`/administracion/temas/${idTema}/pasos`);
  const lista = Array.isArray(res)
    ? res
    : Array.isArray((res as { pasos?: Paso[] } | null)?.pasos)
      ? (res as { pasos: Paso[] }).pasos
      : [];
  return lista.map((paso) => ({
    ...paso,
    contenidos: Array.isArray(paso?.contenidos) ? paso.contenidos : [],
    preguntas: Array.isArray(paso?.preguntas) ? paso.preguntas : [],
  }));
}

export function crearTema(datos: CrearTemaSolicitud) {
  return peticion<Tema>("/administracion/temas", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarTema(
  idTema: string,
  datos: ActualizarTemaSolicitud
) {
  return peticion<Tema>(`/administracion/temas/${idTema}`, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function guardarParlante(
  idTema: string,
  datos: GuardarParlanteSolicitud
) {
  return peticion(`/administracion/temas/${idTema}/pasos`, {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function publicarTema(idTema: string) {
  return peticion<Tema>(`/administracion/temas/${idTema}/publicar`, {
    metodo: "POST",
  });
}

export function despublicarTema(idTema: string) {
  return peticion<Tema>(`/administracion/temas/${idTema}/borrador`, {
    metodo: "POST",
  });
}

export function archivarTema(idTema: string) {
  return peticion<Tema>(`/administracion/temas/${idTema}/archivar`, {
    metodo: "POST",
  });
}

export function duplicarTema(idTema: string) {
  return peticion<Tema>(`/administracion/temas/${idTema}/duplicar`, {
    metodo: "POST",
  });
}

export function crearActividad(datos: CrearActividadSolicitud) {
  return peticion("/administracion/actividades", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarActividad(
  idActividad: string,
  datos: Partial<CrearActividadSolicitud>
) {
  return peticion(`/administracion/actividades/${idActividad}`, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function eliminarActividad(idActividad: string) {
  return peticion(`/administracion/actividades/${idActividad}`, {
    metodo: "DELETE",
  });
}

export type EstadoUsuarioAdmin = "activo" | "pendiente" | "bloqueado";
export type RolUsuarioAdmin = "administrador" | "usuario" | "invitado" | "padre";

export type UsuarioAdmin = {
  id: string;
  nombre_visible: string;
  correo: string | null;
  activo: boolean;
  estado: EstadoUsuarioAdmin;
  rol: RolUsuarioAdmin;
  proveedor: "google" | "facebook" | "invitado" | "correo";
  creado_en: string;
  actualizado_en: string;
  ultimo_login_en: string | null;
  perfil: {
    id: string;
    apodo: string;
    avatar_url: string | null;
    clave_avatar: string | null;
    grupo_edad_id: string | null;
    prefiere_audio: boolean;
    tamano_texto_preferido: string;
  } | null;
  grupo_edad: {
    id: string;
    codigo: string;
    nombre: string;
    edad_minima: number;
    edad_maxima: number;
  } | null;
  clubes: Array<{
    id: string;
    nombre: string;
    rol_miembro: string;
    unido_en: string;
  }>;
  vinculos_familiares: number;
  progreso: {
    xp_total: number;
    eventos: number;
  };
};

export type UsuarioAdminDetalle = UsuarioAdmin & {
  vinculos: Array<{
    id: string;
    tipo: "tutor" | "menor";
    relacion: string;
    estado: string;
    aceptado_en: string | null;
    usuario: {
      id: string;
      nombre_visible: string;
      correo: string | null;
    };
  }>;
  estadisticas: {
    temas_total: number;
    temas_completados: number;
    actividades_total: number;
    actividades_completadas: number;
    intentos: number;
    xp_total: number;
  };
  actividad_reciente: Array<{
    id: string;
    tipo: string;
    tema_id: string | null;
    actividad_id: string | null;
    puntaje: number | null;
    correcta: boolean | null;
    xp_otorgada: number;
    ocurrido_en: string;
  }>;
  auditoria: Array<{
    id: string;
    accion: string;
    datos_antes: unknown;
    datos_despues: unknown;
    actor_usuario_id: string | null;
    creado_en: string;
  }>;
};

export type CatalogosUsuariosAdmin = {
  grupos_edad: Array<{
    id: string;
    codigo: string;
    nombre: string;
    edad_minima: number;
    edad_maxima: number;
  }>;
  clubes: Array<{ id: string; nombre: string; activo: boolean }>;
  tutores: Array<{ id: string; nombre_visible: string; correo: string | null }>;
};

export type ListadoUsuariosAdmin = {
  usuarios: UsuarioAdmin[];
  total: number;
  resumen: {
    total: number;
    activos: number;
    pendientes: number;
    bloqueados: number;
    administradores: number;
    padres: number;
  };
  catalogos: CatalogosUsuariosAdmin;
};

export type ObtenerUsuariosAdminParams = {
  q?: string;
  rol?: string;
  estado?: string;
  grupo_edad_id?: string;
  club_id?: string;
  limit?: number;
  offset?: number;
};

function normalizarUsuarioAdmin(
  u: Partial<UsuarioAdmin> & { apodo?: string; ultimo_acceso?: string }
): UsuarioAdmin {
  const activo = u.activo ?? true;
  return {
    id: u.id ?? "",
    nombre_visible: u.nombre_visible || u.apodo || u.correo || "Usuario",
    correo: u.correo ?? null,
    activo,
    estado: u.estado ?? (activo ? "activo" : "bloqueado"),
    rol: u.rol ?? "usuario",
    proveedor: u.proveedor ?? "correo",
    creado_en: u.creado_en ?? new Date().toISOString(),
    actualizado_en: u.actualizado_en ?? u.creado_en ?? new Date().toISOString(),
    ultimo_login_en: u.ultimo_login_en ?? u.ultimo_acceso ?? null,
    perfil: u.perfil ?? null,
    grupo_edad: u.grupo_edad ?? null,
    clubes: Array.isArray(u.clubes) ? u.clubes : [],
    vinculos_familiares: typeof u.vinculos_familiares === "number" ? u.vinculos_familiares : 0,
    progreso: {
      xp_total: typeof u.progreso?.xp_total === "number" ? u.progreso.xp_total : 0,
      eventos: typeof u.progreso?.eventos === "number" ? u.progreso.eventos : 0,
    },
  };
}

export async function obtenerUsuariosAdmin(params: ObtenerUsuariosAdminParams = {}): Promise<ListadoUsuariosAdmin> {
  const busqueda = new URLSearchParams();
  if (params.q) busqueda.set("q", params.q);
  if (params.rol) busqueda.set("rol", params.rol);
  if (params.estado) busqueda.set("estado", params.estado);
  if (params.grupo_edad_id) busqueda.set("grupo_edad_id", params.grupo_edad_id);
  if (params.club_id) busqueda.set("club_id", params.club_id);
  busqueda.set("limit", String(params.limit ?? 20));
  busqueda.set("offset", String(params.offset ?? 0));
  const res = await peticion<Partial<ListadoUsuariosAdmin>>(`/administracion/usuarios?${busqueda.toString()}`);
  const rawUsers = Array.isArray(res?.usuarios) ? res.usuarios : [];
  const usuarios = rawUsers.map((u) => normalizarUsuarioAdmin(u));
  const total = typeof res?.total === "number" ? res.total : usuarios.length;
  return {
    usuarios,
    total,
    resumen: {
      total: res?.resumen?.total ?? total,
      activos: res?.resumen?.activos ?? usuarios.filter((u) => u.estado === "activo").length,
      pendientes: res?.resumen?.pendientes ?? usuarios.filter((u) => u.estado === "pendiente").length,
      bloqueados: res?.resumen?.bloqueados ?? usuarios.filter((u) => u.estado === "bloqueado").length,
      administradores: res?.resumen?.administradores ?? usuarios.filter((u) => u.rol === "administrador").length,
      padres: res?.resumen?.padres ?? usuarios.filter((u) => u.rol === "padre").length,
    },
    catalogos: {
      grupos_edad: Array.isArray(res?.catalogos?.grupos_edad) ? res.catalogos.grupos_edad : [],
      clubes: Array.isArray(res?.catalogos?.clubes) ? res.catalogos.clubes : [],
      tutores: Array.isArray(res?.catalogos?.tutores) ? res.catalogos.tutores : [],
    },
  };
}

export async function obtenerUsuarioAdmin(usuarioId: string): Promise<UsuarioAdminDetalle> {
  const res = await peticion<Partial<UsuarioAdminDetalle> | { usuario?: Partial<UsuarioAdminDetalle> }>(
    `/administracion/usuarios/${usuarioId}`
  );
  const raw =
    res && typeof res === "object" && "usuario" in res && res.usuario
      ? res.usuario
      : (res as Partial<UsuarioAdminDetalle>);
  const base = normalizarUsuarioAdmin(raw ?? { id: usuarioId });
  return {
    ...base,
    vinculos: Array.isArray(raw?.vinculos) ? raw.vinculos : [],
    estadisticas: {
      temas_total: raw?.estadisticas?.temas_total ?? 0,
      temas_completados: raw?.estadisticas?.temas_completados ?? 0,
      actividades_total: raw?.estadisticas?.actividades_total ?? 0,
      actividades_completadas: raw?.estadisticas?.actividades_completadas ?? 0,
      intentos: raw?.estadisticas?.intentos ?? 0,
      xp_total: raw?.estadisticas?.xp_total ?? base.progreso.xp_total,
    },
    actividad_reciente: Array.isArray(raw?.actividad_reciente) ? raw.actividad_reciente : [],
    auditoria: Array.isArray(raw?.auditoria) ? raw.auditoria : [],
  };
}

export type ActualizarUsuarioAdminSolicitud = {
  rol?: RolUsuarioAdmin;
  nombre_visible?: string;
  activo?: boolean;
  apodo?: string;
  grupo_edad_id?: string | null;
  avatar_url?: string | null;
  prefiere_audio?: boolean;
  tamano_texto_preferido?: "pequeno" | "mediano" | "grande";
  club_ids?: string[];
};

export function actualizarUsuarioAdmin(usuarioId: string, datos: ActualizarUsuarioAdminSolicitud) {
  return peticion<UsuarioAdminDetalle>(`/administracion/usuarios/${usuarioId}`, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function desactivarUsuarioAdmin(usuarioId: string) {
  return peticion<{ desactivado: boolean }>(`/administracion/usuarios/${usuarioId}`, {
    metodo: "DELETE",
  });
}

export type InvitarUsuarioAdminSolicitud = {
  correo: string;
  nombre_visible: string;
  rol: Exclude<RolUsuarioAdmin, "invitado">;
  apodo?: string;
  grupo_edad_id?: string | null;
  club_id?: string | null;
  redirect_to?: string;
};

export function invitarUsuarioAdmin(datos: InvitarUsuarioAdminSolicitud) {
  return peticion<UsuarioAdminDetalle>("/administracion/usuarios/invitar", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export type CrearMenorAdminSolicitud = {
  nombre_visible: string;
  apodo: string;
  grupo_edad_id: string;
  tutor_id?: string | null;
  relacion?: string;
  club_id?: string | null;
  prefiere_audio?: boolean;
  tamano_texto_preferido?: "pequeno" | "mediano" | "grande";
};

export function crearMenorAdmin(datos: CrearMenorAdminSolicitud) {
  return peticion<{
    usuario: UsuarioAdminDetalle;
    credencial_temporal: { usuario_id: string; token: string };
  }>("/administracion/usuarios/menores", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function accionMasivaUsuariosAdmin(
  usuarioIds: string[],
  accion: "activar" | "desactivar"
) {
  return peticion<{ actualizados: number }>("/administracion/usuarios/acciones", {
    metodo: "POST",
    cuerpo: { usuario_ids: usuarioIds, accion },
  });
}

export type AjustesAdmin = {
  id: string;
  nombre_plataforma: string;
  correo_soporte: string | null;
  zona_horaria: string;
  notas_obligatorias_cambios: boolean;
  notas_obligatorias_rechazo: boolean;
  creado_en: string;
  actualizado_en: string;
};

export type ActualizarAjustesAdminSolicitud = Partial<Pick<AjustesAdmin, "nombre_plataforma" | "correo_soporte" | "zona_horaria" | "notas_obligatorias_cambios" | "notas_obligatorias_rechazo">>;

function normalizarRespuestaAjustes(res: Partial<AjustesAdmin> | { ajustes?: Partial<AjustesAdmin> }): AjustesAdmin {
  const raw =
    res && typeof res === "object" && "ajustes" in res && res.ajustes
      ? res.ajustes
      : (res as Partial<AjustesAdmin>);
  return {
    id: raw?.id ?? "ajustes-1",
    nombre_plataforma: raw?.nombre_plataforma || "Semillas",
    correo_soporte: raw?.correo_soporte ?? null,
    zona_horaria: raw?.zona_horaria || "America/Guayaquil",
    notas_obligatorias_cambios: Boolean(raw?.notas_obligatorias_cambios ?? false),
    notas_obligatorias_rechazo: Boolean(raw?.notas_obligatorias_rechazo ?? true),
    creado_en: raw?.creado_en ?? new Date().toISOString(),
    actualizado_en: raw?.actualizado_en ?? new Date().toISOString(),
  };
}

export async function obtenerAjustesAdmin(): Promise<AjustesAdmin> {
  const res = await peticion<Partial<AjustesAdmin> | { ajustes?: Partial<AjustesAdmin> }>("/administracion/ajustes");
  return normalizarRespuestaAjustes(res);
}

export async function guardarAjustesAdmin(datos: ActualizarAjustesAdminSolicitud): Promise<AjustesAdmin> {
  const res = await peticion<Partial<AjustesAdmin> | { ajustes?: Partial<AjustesAdmin> }>("/administracion/ajustes-plataforma", {
    metodo: "PATCH",
    cuerpo: datos,
  });
  return normalizarRespuestaAjustes({ ...datos, ...(res as object) });
}

export type ActividadAdmin = {
  id: string;
  tema_id: string;
  paso_id: string | null;
  grupo_edad_id: string;
  tipo_actividad_id: string;
  titulo: string;
  consigna: string;
  retroalimentacion: string | null;
  orden: number;
  xp_recompensa: number;
  limite_tiempo_seg: number | null;
  dificultad: string;
  obligatorio: boolean;
  configuracion: Record<string, unknown>;
  opciones: Array<{
    id: string;
    actividad_id: string;
    etiqueta: string | null;
    texto: string;
    correcta: boolean;
    orden: number;
    retroalimentacion: string | null;
  }>;
  estado: string;
  creado_en: string | null;
  actualizado_en: string | null;
  tipo_actividad: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
  tema: {
    id: string;
    titulo: string;
    slug: string;
    estado: string;
    senda?: {
      id: string;
      codigo: string;
      nombre: string;
      color_hex: string;
    };
  } | null;
  grupo_edad: {
    id: string;
    codigo: string;
    nombre: string;
  } | null;
};

export type ObtenerActividadesAdminParams = {
  tema_id?: string;
  tipo_actividad_id?: string;
  grupo_edad_id?: string;
  estado?: string;
  limit?: number;
  offset?: number;
};

export async function obtenerActividadAdmin(idActividad: string): Promise<ActividadAdmin> {
  const res = await peticion<ActividadAdmin | { actividad?: ActividadAdmin }>(`/administracion/actividades/${idActividad}`);
  const raw = res && typeof res === "object" && "actividad" in res && res.actividad ? res.actividad : (res as ActividadAdmin);
  if (!raw || typeof raw !== "object") return raw;
  return {
    ...raw,
    opciones: Array.isArray(raw.opciones) ? raw.opciones : [],
    configuracion: raw.configuracion && typeof raw.configuracion === "object" ? raw.configuracion : {},
  };
}

export async function obtenerActividadesAdmin(params?: ObtenerActividadesAdminParams): Promise<{ actividades: ActividadAdmin[]; total: number }> {
  const busqueda = new URLSearchParams();
  if (params?.tema_id) busqueda.set("tema_id", params.tema_id);
  if (params?.tipo_actividad_id) busqueda.set("tipo_actividad_id", params.tipo_actividad_id);
  if (params?.grupo_edad_id) busqueda.set("grupo_edad_id", params.grupo_edad_id);
  if (params?.estado) busqueda.set("estado", params.estado);
  if (params?.limit) busqueda.set("limit", String(params.limit));
  if (params?.offset) busqueda.set("offset", String(params.offset));
  const query = busqueda.toString();
  const res = await peticion<{ actividades?: ActividadAdmin[]; total?: number } | ActividadAdmin[]>(`/administracion/actividades${query ? `?${query}` : ""}`);
  const rawList = Array.isArray(res)
    ? res
    : Array.isArray(res?.actividades)
      ? res.actividades
      : [];
  const actividades = rawList.map((act) => ({
    ...act,
    opciones: Array.isArray(act?.opciones) ? act.opciones : [],
    configuracion: act?.configuracion && typeof act.configuracion === "object" ? act.configuracion : {},
  }));
  const total = !Array.isArray(res) && typeof res?.total === "number" ? res.total : actividades.length;
  return { actividades, total };
}


export type CompletitudTema = {
  porcentaje: number;
  listo_para_revision: boolean;
  criterios: Array<{ codigo: string; etiqueta: string; completo: boolean; detalle?: string }>;
  estadisticas: {
    grupos_edad: number;
    pasos_creados: number;
    contenidos_creados: number;
    contenidos_esperados: number;
    actividades: number;
  };
};

export type TemaListadoAdmin = Tema & { completitud: CompletitudTema };

export type ListadoTemasAdmin = {
  temas: TemaListadoAdmin[];
  total: number;
  limit: number;
  offset: number;
};

export type ResumenAdminDetallado = {
  metricas: {
    temas: number;
    publicados: number;
    usuarios_activos: number;
    actividades: number;
    clubes_activos: number;
    pendientes_revision: number;
  };
  estados: Record<string, number>;
  temas_recientes: Array<{ id: string; titulo: string; estado: string; actualizado_en: string | null; senda: string; autor: string }>;
  revisiones: Array<{ id: string; tema_id: string; titulo: string; senda: string; estado: string; notas: string | null; creado_en: string; enviado_por: string }>;
  actividad_reciente: Array<{ id: string; accion: string; tipo_entidad: string; entidad_id: string | null; creado_en: string; actor: string }>;
  publicaciones_semana: Array<{ fecha: string; etiqueta: string; total: number }>;
};

export type EstudioTemaAdmin = {
  tema: Tema;
  pasos: Paso[];
  actividades: ActividadAdmin[];
  completitud: CompletitudTema;
  revisiones: Array<{ id: string; estado: string; notas: string | null; creado_en: string; revisado_en: string | null }>;
};

export function obtenerResumenAdminDetallado() {
  return peticion<ResumenAdminDetallado>("/administracion/resumen/detallado");
}

export async function obtenerTemasAdminPaginados(params: {
  q?: string;
  estado?: string;
  senda_id?: string;
  grupo_edad_id?: string;
  limit?: number;
  offset?: number;
}): Promise<ListadoTemasAdmin> {
  const busqueda = new URLSearchParams();
  if (params.q) busqueda.set("q", params.q);
  if (params.estado && params.estado !== "todos") busqueda.set("estado", params.estado);
  if (params.senda_id) busqueda.set("senda_id", params.senda_id);
  if (params.grupo_edad_id) busqueda.set("grupo_edad_id", params.grupo_edad_id);
  busqueda.set("limit", String(params.limit ?? 20));
  busqueda.set("offset", String(params.offset ?? 0));
  const res = await peticion<Partial<ListadoTemasAdmin> | TemaListadoAdmin[]>(`/administracion/temas-listado?${busqueda.toString()}`);
  const temas = Array.isArray(res)
    ? res
    : Array.isArray(res?.temas)
      ? res.temas
      : [];
  return {
    temas,
    total: !Array.isArray(res) && typeof res?.total === "number" ? res.total : temas.length,
    limit: !Array.isArray(res) && typeof res?.limit === "number" ? res.limit : (params.limit ?? 20),
    offset: !Array.isArray(res) && typeof res?.offset === "number" ? res.offset : (params.offset ?? 0),
  };
}

export async function obtenerEstudioTemaAdmin(idTema: string): Promise<EstudioTemaAdmin> {
  const res = await peticion<Partial<EstudioTemaAdmin>>(`/administracion/temas/${idTema}/estudio`);
  const rawTema = (res?.tema ?? (res as unknown as Tema)) || ({} as Tema);
  const tema: Tema = {
    ...rawTema,
    grupos_edad: Array.isArray(rawTema.grupos_edad) ? rawTema.grupos_edad : [],
  };
  const pasos: Paso[] = (Array.isArray(res?.pasos) ? res.pasos : []).map((paso) => ({
    ...paso,
    contenidos: Array.isArray(paso?.contenidos) ? paso.contenidos : [],
    preguntas: Array.isArray(paso?.preguntas) ? paso.preguntas : [],
  }));
  const actividades: ActividadAdmin[] = (Array.isArray(res?.actividades) ? res.actividades : []).map((act) => ({
    ...act,
    opciones: Array.isArray(act?.opciones) ? act.opciones : [],
    configuracion: act?.configuracion && typeof act.configuracion === "object" ? act.configuracion : {},
  }));
  const rawComp = res?.completitud ?? (rawTema as TemaListadoAdmin)?.completitud;
  const gruposCount = tema.grupos_edad?.length ?? 0;
  const completitud: CompletitudTema = {
    porcentaje: typeof rawComp?.porcentaje === "number" ? rawComp.porcentaje : 0,
    listo_para_revision: Boolean(rawComp?.listo_para_revision),
    criterios: Array.isArray(rawComp?.criterios) ? rawComp.criterios : [],
    estadisticas: {
      grupos_edad: rawComp?.estadisticas?.grupos_edad ?? gruposCount,
      pasos_creados: rawComp?.estadisticas?.pasos_creados ?? pasos.length,
      contenidos_creados: rawComp?.estadisticas?.contenidos_creados ?? 0,
      contenidos_esperados: rawComp?.estadisticas?.contenidos_esperados ?? (gruposCount * 6),
      actividades: rawComp?.estadisticas?.actividades ?? actividades.length,
    },
  };
  const revisiones = Array.isArray(res?.revisiones) ? res.revisiones : [];
  return { tema, pasos, actividades, completitud, revisiones };
}

export function enviarTemaRevision(idTema: string, notas?: string) {
  return peticion(`/administracion/temas/${idTema}/enviar-revision`, {
    metodo: "POST",
    cuerpo: { notas },
  });
}

export function resolverRevisionTema(idTema: string, estado: "aprobado" | "cambios_solicitados" | "rechazado", notas?: string) {
  return peticion(`/administracion/temas/${idTema}/resolver-revision`, {
    metodo: "POST",
    cuerpo: { estado, notas },
  });
}

export type RevisionAdmin = {
  id: string;
  tema_id: string;
  estado: string;
  notas_envio: string | null;
  notas_revision: string | null;
  creado_en: string;
  revisado_en: string | null;
  titulo: string | null;
  senda: string | null;
  enviado_por: string | null;
  revisado_por: string | null;
};

export type DetalleRevisionAdmin = {
  revision: RevisionAdmin;
  historial: RevisionAdmin[];
  resumen_contenido: {
    pasos: number;
    actividades: number;
    grupos_edad: number;
  };
};

export type ListadoRevisionesAdmin = {
  revisiones: RevisionAdmin[];
  total: number;
  limit: number;
  offset: number;
};

export type ResolverRevisionSolicitud = {
  estado: "aprobado" | "cambios_solicitados" | "rechazado";
  notas?: string;
};

export type ObtenerRevisionesAdminParams = {
  q?: string;
  estado?: "todos" | "borrador" | "enviado" | "cambios_solicitados" | "aprobado" | "rechazado" | "publicado";
  limit?: number;
  offset?: number;
};

export function obtenerRevisionesAdmin(params: ObtenerRevisionesAdminParams = {}) {
  const busqueda = new URLSearchParams();
  if (params.q) busqueda.set("q", params.q);
  if (params.estado) busqueda.set("estado", params.estado);
  busqueda.set("limit", String(params.limit ?? 20));
  busqueda.set("offset", String(params.offset ?? 0));
  return peticion<ListadoRevisionesAdmin>(`/administracion/revisiones?${busqueda.toString()}`);
}

export function obtenerRevisionAdmin(idRevision: string) {
  return peticion<DetalleRevisionAdmin>(`/administracion/revisiones/${idRevision}`);
}

export function resolverRevisionAdmin(idRevision: string, datos: ResolverRevisionSolicitud) {
  return peticion<RevisionAdmin>(`/administracion/revisiones/${idRevision}/resolver`, {
    metodo: "POST",
    cuerpo: datos,
  });
}

export type ReportesAdmin = {
  rango: { desde: string; hasta: string };
  metricas: {
    usuarios_activos: number;
    usuarios_nuevos: number;
    temas_completados: number;
    actividades_completadas: number;
    xp_otorgada: number;
    precision_respuestas: number;
    clubes_activos: number;
    temas_publicados: number;
  };
  actividad_diaria: Array<{ fecha: string; eventos: number; usuarios: number; xp: number }>;
  temas_destacados: Array<{
    id: string;
    titulo: string;
    eventos: number;
    completados: number;
    usuarios: number;
  }>;
  distribucion_roles: Record<string, number>;
  revision_editorial: {
    por_estado: Record<string, number>;
    tiempo_promedio_horas: number;
    total: number;
  };
  muestra_limitada: boolean;
};

export function obtenerReportesAdmin(params: { desde: string; hasta: string }) {
  const busqueda = new URLSearchParams(params);
  return peticion<ReportesAdmin>(`/administracion/reportes?${busqueda.toString()}`);
}

export type CrearUsuarioAdminSolicitud = {
  correo: string;
  password: string;
  nombre_visible: string;
  apodo?: string;
  rol: "administrador" | "usuario" | "padre";
  grupo_edad_id?: string | null;
  avatar_url?: string | null;
  prefiere_audio: boolean;
  tamano_texto_preferido: "pequeno" | "mediano" | "grande";
  confirmar_correo: boolean;
};

export function crearUsuarioAdmin(datos: CrearUsuarioAdminSolicitud) {
  return peticion<{ id: string }>("/administracion/usuarios/cuenta", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function duplicarActividad(idActividad: string) {
  return peticion<ActividadAdmin>(`/administracion/actividades/${idActividad}/duplicar`, { metodo: "POST" });
}

export function reordenarActividades(idTema: string, actividadIds: string[]) {
  return peticion<{ actividades: ActividadAdmin[] }>(`/administracion/temas/${idTema}/actividades/reordenar`, {
    metodo: "POST",
    cuerpo: { actividad_ids: actividadIds },
  });
}

export type SendaAdmin = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  color_hex: string;
  nombre_icono: string | null;
  imagen_recurso_id: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

export type CrearSendaSolicitud = {
  codigo: string;
  nombre: string;
  descripcion?: string;
  color_hex: string;
  nombre_icono?: string;
  imagen_recurso_id: string | null;
  orden: number;
  activo?: boolean;
};

export function obtenerSendasAdmin() {
  return peticion<SendaAdmin[]>("/administracion/sendas");
}

export function obtenerSendaAdmin(id: string) {
  return peticion<SendaAdmin>(`/administracion/sendas/${id}`);
}

export function crearSendaAdmin(datos: CrearSendaSolicitud) {
  return peticion<SendaAdmin>("/administracion/sendas", {
    metodo: "POST",
    cuerpo: datos,
  });
}

export type ActualizarSendaSolicitud = Partial<CrearSendaSolicitud>;

export function actualizarSendaAdmin(id: string, datos: ActualizarSendaSolicitud) {
  return peticion<SendaAdmin>(`/administracion/sendas/${id}`, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}
