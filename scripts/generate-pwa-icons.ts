import { deflateSync } from "node:zlib";
import { mkdir, writeFile } from "node:fs/promises";

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const tipo = new TextEncoder().encode(type);
  const contenido = new Uint8Array(tipo.length + data.length);
  contenido.set(tipo);
  contenido.set(data, tipo.length);
  const salida = new Uint8Array(12 + data.length);
  new DataView(salida.buffer).setUint32(0, data.length);
  salida.set(contenido, 4);
  new DataView(salida.buffer).setUint32(8 + data.length, crc32(contenido));
  return salida;
}

function crearPng(tamano: number): Uint8Array {
  const filas = new Uint8Array(tamano * (tamano * 4 + 1));
  for (let y = 0; y < tamano; y++) {
    const fila = y * (tamano * 4 + 1);
    filas[fila] = 0;
    for (let x = 0; x < tamano; x++) {
      const indice = fila + 1 + x * 4;
      const dx = x - tamano / 2;
      const dy = y - tamano / 2;
      const distancia = Math.sqrt(dx * dx + dy * dy) / tamano;
      const esSemilla = distancia < 0.23;
      const esHoja = ((x - tamano * 0.62) ** 2 + (y - tamano * 0.36) ** 2) < (tamano * 0.13) ** 2;
      if (esSemilla) [filas[indice], filas[indice + 1], filas[indice + 2], filas[indice + 3]] = [244, 183, 64, 255];
      else if (esHoja) [filas[indice], filas[indice + 1], filas[indice + 2], filas[indice + 3]] = [46, 158, 91, 255];
      else [filas[indice], filas[indice + 1], filas[indice + 2], filas[indice + 3]] = [247, 244, 236, 255];
    }
  }
  const encabezado = new Uint8Array(13);
  const vista = new DataView(encabezado.buffer);
  vista.setUint32(0, tamano); vista.setUint32(4, tamano); encabezado[8] = 8; encabezado[9] = 6;
  const firma = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const partes = [firma, chunk("IHDR", encabezado), chunk("IDAT", deflateSync(filas)), chunk("IEND", new Uint8Array())];
  const total = new Uint8Array(partes.reduce((suma, parte) => suma + parte.length, 0));
  let offset = 0;
  for (const parte of partes) { total.set(parte, offset); offset += parte.length; }
  return total;
}

await mkdir("frontend/public/icons", { recursive: true });
for (const [nombre, tamano] of [["icon-192.png", 192], ["icon-512.png", 512], ["maskable-512.png", 512], ["apple-touch-icon-180.png", 180]] as const) {
  await writeFile(`frontend/public/icons/${nombre}`, crearPng(tamano));
}
