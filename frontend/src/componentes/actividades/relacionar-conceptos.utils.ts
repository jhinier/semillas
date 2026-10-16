export type ParConcepto = {
  id: string;
  concepto: string;
  relacion: string;
  pista?: string;
};

export type RelacionConcepto = {
  id: string;
  texto: string;
};

export type ResultadoIntentoRelacion = {
  correcto: boolean;
  conceptoId: string;
  relacionId: string;
};

export function mezclarRelacionesConceptos(
  pares: ParConcepto[],
  random: () => number = Math.random,
): RelacionConcepto[] {
  return pares
    .map((par) => ({ id: par.id, texto: par.relacion, orden: random() }))
    .sort((a, b) => a.orden - b.orden)
    .map(({ id, texto }) => ({ id, texto }));
}

export function validarIntentoRelacion(conceptoId: string, relacionId: string): ResultadoIntentoRelacion {
  return {
    correcto: conceptoId === relacionId,
    conceptoId,
    relacionId,
  };
}

export function agregarRelacionCompletada(completadas: string[], conceptoId: string): string[] {
  if (completadas.includes(conceptoId)) {
    return [...completadas];
  }

  return [...completadas, conceptoId];
}

export function relacionesCompletadas(pares: ParConcepto[], completadas: string[]): boolean {
  if (pares.length === 0) {
    return false;
  }

  return pares.every((par) => completadas.includes(par.id));
}
