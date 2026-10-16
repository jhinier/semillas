export const FRANJAS = ["semillas", "exploradores", "embajadores"] as const;
export const MOMENTOS = ["conectar", "relatar", "ensenar", "comprobar", "experimentar", "recompensar"] as const;

export type FranjaCrecer = (typeof FRANJAS)[number];
export type MomentoCrecer = (typeof MOMENTOS)[number];
export type CeldaCrecer = {
  grupoEdadId: string;
  codigoFranja: FranjaCrecer;
  codigoMomento: MomentoCrecer;
  completa: boolean;
};

export type ErrorMatrizCrecer = { codigo: string; grupoEdadId: string; mensaje: string };

export type CeldaMatriz = {
  grupoEdadId: string;
  codigoMomento: MomentoCrecer;
  completa: boolean;
  orden?: number | null;
};

export type ResultadoMatriz = {
  valida: boolean;
  celdas: Array<CeldaMatriz & { errores: string[] }>;
};

/** Valida la matriz exacta 1..6 para cada franja seleccionada. */
export function evaluarMatrizCrecer(gruposEdadIds: string[], celdas: CeldaMatriz[]): ResultadoMatriz {
  const resultado: ResultadoMatriz = { valida: true, celdas: [] };
  for (const grupoEdadId of gruposEdadIds) {
    const delGrupo = celdas.filter((celda) => celda.grupoEdadId === grupoEdadId);
    for (const [indice, momento] of MOMENTOS.entries()) {
      const coincidencias = delGrupo.filter((celda) => celda.codigoMomento === momento);
      const errores: string[] = [];
      if (coincidencias.length === 0) errores.push("momento_faltante");
      if (coincidencias.length > 1) errores.push("momento_duplicado");
      const celda = coincidencias[0] ?? { grupoEdadId, codigoMomento: momento, completa: false };
      if (!celda.completa) errores.push("contenido_incompleto");
      if (celda.orden !== undefined && celda.orden !== null && celda.orden !== indice + 1) errores.push("orden_invalido");
      resultado.celdas.push({ ...celda, errores });
      if (errores.length > 0) resultado.valida = false;
    }
  }
  return resultado;
}

export function validarMatrizCrecer(celdas: CeldaCrecer[], franjasSeleccionadas: FranjaCrecer[]): ErrorMatrizCrecer[] {
  const errores: ErrorMatrizCrecer[] = [];
  for (const franja of franjasSeleccionadas) {
    const grupo = celdas.filter((celda) => celda.codigoFranja === franja);
    const grupoEdadId = grupo[0]?.grupoEdadId ?? franja;
    const momentos = new Set<string>();
    for (const celda of grupo) {
      if (momentos.has(celda.codigoMomento)) errores.push({ codigo: "MOMENTO_DUPLICADO", grupoEdadId, mensaje: `El momento ${celda.codigoMomento} está duplicado` });
      momentos.add(celda.codigoMomento);
      if (!celda.completa) errores.push({ codigo: "MOMENTO_INCOMPLETO", grupoEdadId, mensaje: `Falta contenido para ${celda.codigoMomento}` });
    }
    for (const momento of MOMENTOS) {
      if (!momentos.has(momento)) errores.push({ codigo: "MOMENTO_AUSENTE", grupoEdadId, mensaje: `Falta el momento ${momento}` });
    }
    if (grupo.length > MOMENTOS.length) errores.push({ codigo: "MATRIZ_EXCEDE_SEIS", grupoEdadId, mensaje: "Una franja no puede tener más de seis momentos" });
  }
  return errores;
}
