type Direction = [number, number];

const DIRECTIONS: Direction[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [1, -1]
];

interface PlacementResult {
  grid: string[][];
  palabrasColocadas: string[];
}

export function generarSopaDeLetras(
  palabras: string[],
  numFilas: number,
  numColumnas: number
): PlacementResult {
  const grid = Array(numFilas).fill(null).map(() => Array(numColumnas).fill(""));
  const palabrasColocadas: string[] = [];

  const limpias = [...new Set(
    palabras
      .map((w) => w.trim().toUpperCase().replace(/\s+/g, ""))
      .filter((w) => w.length >= 2),
  )].sort((a, b) => b.length - a.length);

  const intentarColocar = (word: string, startR: number, startC: number, dir: Direction): boolean => {
    for (let i = 0; i < word.length; i++) {
      const r = startR + dir[0] * i;
      const c = startC + dir[1] * i;

      if (r < 0 || r >= numFilas || c < 0 || c >= numColumnas) return false;
      if (grid[r]![c]! !== "" && grid[r]![c]! !== word[i]) return false;
    }

    for (let i = 0; i < word.length; i++) {
      const r = startR + dir[0] * i;
      const c = startC + dir[1] * i;
      grid[r]![c]! = word[i]!;
    }
    return true;
  };

  for (const word of limpias) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 140) {
      attempts++;
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]!;
      const startR = Math.floor(Math.random() * numFilas);
      const startC = Math.floor(Math.random() * numColumnas);
      placed = intentarColocar(word, startR, startC, dir);
    }

    // Escaneo determinista si el muestreo aleatorio no encontró hueco
    if (!placed) {
      outer: for (let r = 0; r < numFilas; r++) {
        for (let c = 0; c < numColumnas; c++) {
          for (const dir of DIRECTIONS) {
            if (intentarColocar(word, r, c, dir)) {
              placed = true;
              break outer;
            }
          }
        }
      }
    }

    if (placed) {
      palabrasColocadas.push(word);
    }
  }

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < numFilas; r++) {
    for (let c = 0; c < numColumnas; c++) {
      if (grid[r]![c]! === "") {
        grid[r]![c]! = ALPHABET[Math.floor(Math.random() * ALPHABET.length)]!;
      }
    }
  }

  return { grid, palabrasColocadas };
}

export function construirPalabraDesdeCelda(
  grid: string[][],
  startR: number,
  startC: number,
  stepR: number,
  stepC: number,
  length: number
): { palabra: string; celdas: Set<string> } {
  let palabra = "";
  const celdas = new Set<string>();
  let currR = startR;
  let currC = startC;
  
  for (let i = 0; i < length; i++) {
    palabra += grid[currR]![currC]!;
    celdas.add(`${currR},${currC}`);
    currR += stepR;
    currC += stepC;
  }
  
  return { palabra, celdas };
}
