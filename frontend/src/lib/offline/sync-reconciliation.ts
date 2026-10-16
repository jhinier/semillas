export type RespuestaConfirmacionSync = {
  procesados_ids: string[];
  omitidos_ids: string[];
  errores: Array<{ evento_id_cliente: string; error: string }>;
};

export type ResultadoReconciliacionSync = {
  confirmados: string[];
  fallidos: Array<{ localId: string; error: string }>;
};

/**
 * Trata procesados y omitidos como confirmaciones: un omitido normalmente es
 * un reintento de un evento que el servidor ya recibió (ACK perdido).
 */
export function reconciliarConfirmacionesSync(
  localIds: readonly string[],
  respuesta: RespuestaConfirmacionSync,
): ResultadoReconciliacionSync {
  const confirmados = new Set([...respuesta.procesados_ids, ...respuesta.omitidos_ids]);
  const errores = new Map(respuesta.errores.map((item) => [item.evento_id_cliente, item.error]));
  const resultado: ResultadoReconciliacionSync = { confirmados: [], fallidos: [] };

  for (const localId of localIds) {
    if (confirmados.has(localId)) {
      resultado.confirmados.push(localId);
      continue;
    }
    resultado.fallidos.push({
      localId,
      error: errores.get(localId) ?? "El servidor no confirmó el evento",
    });
  }

  return resultado;
}
