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
  const grid = Array(numFilas).fill(null).map(() => Array(numColumnas).fill(''));
  const palabrasColocadas: string[] = [];

  for (const word of palabras) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      attempts++;
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]!;
      const startR = Math.floor(Math.random() * numFilas);
      const startC = Math.floor(Math.random() * numColumnas);
      
      let canPlace = true;
      
      for (let i = 0; i < word.length; i++) {
        const r = startR + dir[0] * i;
        const c = startC + dir[1] * i;
        
        if (r < 0 || r >= numFilas || c < 0 || c >= numColumnas) {
          canPlace = false;
          break;
        }
        if (grid[r]![c]! !== '' && grid[r]![c]! !== word[i]) {
          canPlace = false;
          break;
        }
      }
      
      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = startR + dir[0] * i;
          const c = startC + dir[1] * i;
          grid[r]![c]! = word[i];
        }
        placed = true;
        palabrasColocadas.push(word);
      }
    }
  }

  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < numFilas; r++) {
    for (let c = 0; c < numColumnas; c++) {
      if (grid[r]![c]! === '') {
        grid[r]![c]! = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
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
