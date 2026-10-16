export type FilaProgresoTema = {
  usuario_id: string;
  tema_id: string;
  estado: string;
  porcentaje: number;
  iniciado_en: string | null;
  completado_en: string | null;
  ultimo_paso_id: string | null;
  actualizado_en: string;
};

export type FilaProgresoActividad = {
  usuario_id: string;
  actividad_id: string;
  intentos: number;
  mejor_puntaje: number;
  completado: boolean;
  completado_en: string | null;
  actualizado_en: string;
};

export type FilaNivelUsuario = {
  usuario_id: string;
  xp_total: number;
  numero_nivel: number;
  nombre_nivel: string;
};

export function serializarProgresoTema(fila: FilaProgresoTema) {
  return {
    usuario_id: fila.usuario_id,
    tema_id: fila.tema_id,
    estado: fila.estado,
    porcentaje: fila.porcentaje,
    iniciado_en: fila.iniciado_en,
    completado_en: fila.completado_en,
    ultimo_paso_id: fila.ultimo_paso_id,
    actualizado_en: fila.actualizado_en
  };
}

export function serializarProgresoActividad(fila: FilaProgresoActividad) {
  return {
    usuario_id: fila.usuario_id,
    actividad_id: fila.actividad_id,
    intentos: fila.intentos,
    mejor_puntaje: fila.mejor_puntaje,
    completado: fila.completado,
    completado_en: fila.completado_en,
    actualizado_en: fila.actualizado_en
  };
}

export function serializarNivelUsuario(fila: FilaNivelUsuario) {
  return {
    usuario_id: fila.usuario_id,
    xp_total: fila.xp_total,
    numero_nivel: fila.numero_nivel,
    nombre_nivel: fila.nombre_nivel
  };
}
