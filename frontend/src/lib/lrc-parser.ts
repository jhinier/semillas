export interface LineaLRC {
  tiempo: number; // en milisegundos
  texto: string;
}

export function parseLrc(letra: string): LineaLRC[] {
  const lineas = letra.split('\n');
  const resultado: LineaLRC[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const linea of lineas) {
    const match = linea.match(regex);
    if (match) {
      const minutos = parseInt(match[1]!, 10);
      const segundos = parseInt(match[2]!, 10);
      const centesimas = match[3]!.padEnd(3, '0');
      const milisegundos = minutos * 60000 + segundos * 1000 + parseInt(centesimas, 10);
      resultado.push({ tiempo: milisegundos, texto: match[4]!.trim() });
    }
  }

  return resultado.sort((a, b) => a.tiempo - b.tiempo);
}
