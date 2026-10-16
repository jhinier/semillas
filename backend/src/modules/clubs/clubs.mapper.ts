type FilaClub = {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigoInvitacion: string;
  creadoPor: string;
  activo: boolean;
  creadoEn: Date;
};

export function serializarClub(fila: FilaClub) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    codigo_invitacion: fila.codigoInvitacion,
    creado_por: fila.creadoPor,
    activo: fila.activo,
    creado_en: fila.creadoEn.toISOString(),
  };
}

export function serializarClubPublico(fila: FilaClub) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    creado_por: fila.creadoPor,
    activo: fila.activo,
    creado_en: fila.creadoEn.toISOString(),
  };
}

export function serializarMiembroClub(fila: Record<string, unknown>) {
  const unido = fila.unido_en ?? fila.unidoEn;
  return {
    miembro_token: String(fila.token_publico ?? fila.tokenPublico ?? ""),
    es_actual: Boolean(fila.es_actual ?? false),
    rol_miembro: String(fila.rol_miembro ?? fila.rolMiembro ?? "miembro"),
    unido_en: unido instanceof Date ? unido.toISOString() : String(unido ?? ""),
    apodo: String(fila.apodo ?? "Semillero"),
    clave_avatar: fila.clave_avatar ? String(fila.clave_avatar) : null,
    url_avatar: fila.url_avatar ? String(fila.url_avatar) : null,
    xp_total: Number(fila.xp_total ?? 0),
    xp_semana: Number(fila.xp_semana ?? 0),
    actividades_semana: Number(fila.actividades_semana ?? 0),
  };
}

export function serializarRankingClub(fila: Record<string, unknown>) {
  return {
    ...serializarMiembroClub(fila),
    numero_ranking: Number(fila.numero_ranking ?? 0),
  };
}

export function serializarRetoClub(fila: {
  id: string;
  clubId: string | null;
  nombre: string;
  descripcion: string | null;
  codigoMetrica: string;
  valorObjetivo: number;
  xpReto: number;
  fechaInicio: Date;
  fechaFin: Date;
  creadoPor: string | null;
  creadoEn: Date;
  progresoActual?: number;
  miAporte?: number;
  porcentaje?: number;
  completado?: boolean;
  recompensaReclamada?: boolean;
}) {
  return {
    id: fila.id,
    club_id: fila.clubId,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    codigo_metrica: fila.codigoMetrica,
    valor_objetivo: fila.valorObjetivo,
    xp_reto: fila.xpReto,
    fecha_inicio: fila.fechaInicio.toISOString(),
    fecha_fin: fila.fechaFin.toISOString(),
    creado_por: fila.creadoPor,
    creado_en: fila.creadoEn.toISOString(),
    progreso_actual: fila.progresoActual ?? 0,
    mi_aporte: fila.miAporte ?? 0,
    porcentaje: fila.porcentaje ?? 0,
    completado: fila.completado ?? false,
    recompensa_reclamada: fila.recompensaReclamada ?? false,
  };
}
