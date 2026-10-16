export type FilaEventoSincronizacion = {
  id: string;
  usuarioId: string;
  idEventoCliente: string;
  tipoEvento: string;
  temaId: string | null;
  pasoId: string | null;
  actividadId: string | null;
  correcta: boolean | null;
  puntaje: number | null;
  xpOtorgada: number;
  datos: unknown;
  ocurridoEnCliente: Date;
  dispositivoId: string | null;
  recibidoEnServidor: Date;
};

export type FilaProgresoTemaSincronizacion = {
  usuarioId: string;
  temaId: string;
  estado: string;
  porcentaje: number;
  iniciadoEn: Date | null;
  completadoEn: Date | null;
  ultimoPasoId: string | null;
  actualizadoEn: Date;
};

export type FilaProgresoActividadSincronizacion = {
  usuarioId: string;
  actividadId: string;
  intentos: number;
  mejorPuntaje: number;
  completado: boolean;
  completadoEn: Date | null;
  actualizadoEn: Date;
};

export function serializarEventoSincronizacion(fila: FilaEventoSincronizacion) {
  return {
    id: fila.id,
    usuario_id: fila.usuarioId,
    id_evento_cliente: fila.idEventoCliente,
    tipo_evento: fila.tipoEvento,
    tema_id: fila.temaId,
    paso_id: fila.pasoId,
    actividad_id: fila.actividadId,
    correcta: fila.correcta,
    puntaje: fila.puntaje,
    xp_otorgada: fila.xpOtorgada,
    datos: fila.datos,
    ocurrido_en_cliente: fila.ocurridoEnCliente.toISOString(),
    dispositivo_id: fila.dispositivoId,
    recibido_en_servidor: fila.recibidoEnServidor.toISOString()
  };
}

export function serializarProgresoTemaSincronizacion(fila: FilaProgresoTemaSincronizacion) {
  return {
    usuario_id: fila.usuarioId,
    tema_id: fila.temaId,
    estado: fila.estado,
    porcentaje: fila.porcentaje,
    iniciado_en: fila.iniciadoEn ? fila.iniciadoEn.toISOString() : null,
    completado_en: fila.completadoEn ? fila.completadoEn.toISOString() : null,
    ultimo_paso_id: fila.ultimoPasoId,
    actualizado_en: fila.actualizadoEn.toISOString()
  };
}

export function serializarProgresoActividadSincronizacion(fila: FilaProgresoActividadSincronizacion) {
  return {
    usuario_id: fila.usuarioId,
    actividad_id: fila.actividadId,
    intentos: fila.intentos,
    mejor_puntaje: fila.mejorPuntaje,
    completado: fila.completado,
    completado_en: fila.completadoEn ? fila.completadoEn.toISOString() : null,
    actualizado_en: fila.actualizadoEn.toISOString()
  };
}
