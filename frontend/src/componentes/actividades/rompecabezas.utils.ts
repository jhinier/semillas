export type PiezaRompecabezas = {
  id: number;
  posicionCorrecta: number;
  posicionActual: number;
};

export type DimensionesRompecabezas = {
  filas: number;
  columnas: number;
};

export function normalizarDimensionesRompecabezas(filas?: number, columnas?: number): DimensionesRompecabezas {
  return {
    filas: Number.isFinite(filas) && typeof filas === "number" ? Math.max(1, Math.floor(filas)) : 1,
    columnas: Number.isFinite(columnas) && typeof columnas === "number" ? Math.max(1, Math.floor(columnas)) : 1,
  };
}

export function crearPiezasRompecabezas(filas: number, columnas: number): PiezaRompecabezas[] {
  const totalPiezas = filas * columnas;

  return Array.from({ length: totalPiezas }, (_, indice) => ({
    id: indice,
    posicionCorrecta: indice,
    posicionActual: indice,
  }));
}

export function mezclarPiezasRompecabezas(
  piezas: PiezaRompecabezas[],
  random: () => number = Math.random,
): PiezaRompecabezas[] {
  const posicionesMezcladas = piezas
    .map((pieza) => pieza.posicionActual)
    .map((posicion) => ({ posicion, orden: random() }))
    .sort((a, b) => a.orden - b.orden)
    .map(({ posicion }) => posicion);

  const piezasMezcladas = piezas.map((pieza, indice) => ({
    ...pieza,
    posicionActual: posicionesMezcladas[indice] ?? pieza.posicionActual,
  }));

  if (piezasMezcladas.length > 1 && rompecabezasCompletado(piezasMezcladas)) {
    const [primeraPieza, segundaPieza] = piezasMezcladas;

    if (primeraPieza && segundaPieza) {
      return intercambiarPiezas(piezasMezcladas, primeraPieza.id, segundaPieza.id);
    }
  }

  return piezasMezcladas;
}

export function intercambiarPiezas(
  piezas: PiezaRompecabezas[],
  primeraId: number,
  segundaId: number,
): PiezaRompecabezas[] {
  const primeraPieza = piezas.find((pieza) => pieza.id === primeraId);
  const segundaPieza = piezas.find((pieza) => pieza.id === segundaId);

  if (!primeraPieza || !segundaPieza || primeraId === segundaId) {
    return piezas;
  }

  return piezas.map((pieza) => {
    if (pieza.id === primeraId) {
      return { ...pieza, posicionActual: segundaPieza.posicionActual };
    }

    if (pieza.id === segundaId) {
      return { ...pieza, posicionActual: primeraPieza.posicionActual };
    }

    return pieza;
  });
}

export function rompecabezasCompletado(piezas: PiezaRompecabezas[]): boolean {
  return piezas.every((pieza) => pieza.posicionActual === pieza.posicionCorrecta);
}

function calcularPorcentaje(indice: number, total: number): number {
  if (total <= 1) {
    return 0;
  }

  return (indice / (total - 1)) * 100;
}

export function calcularFondoPieza(posicionCorrecta: number, filas: number, columnas: number) {
  const fila = Math.floor(posicionCorrecta / columnas);
  const columna = posicionCorrecta % columnas;

  return {
    fila,
    columna,
    backgroundSize: `${columnas * 100}% ${filas * 100}%`,
    backgroundPosition: `${calcularPorcentaje(columna, columnas)}% ${calcularPorcentaje(fila, filas)}%`,
  };
}
