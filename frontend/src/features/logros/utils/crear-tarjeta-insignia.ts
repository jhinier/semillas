import { normalizarNombreInsignia } from "./crear-tarjeta-insignia.utils";
export { normalizarNombreInsignia } from "./crear-tarjeta-insignia.utils";

const TAMANO = 1080;

export async function crearTarjetaInsignia(nombreInsignia: string, imagenUrl: string): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = TAMANO;
  canvas.height = TAMANO;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No se pudo crear la tarjeta de la insignia");
  }

  // 1. Fondo Oscuro Premium (Gradiente Radial)
  const gradienteFondo = ctx.createRadialGradient(TAMANO / 2, TAMANO / 2, 100, TAMANO / 2, TAMANO / 2, 800);
  gradienteFondo.addColorStop(0, "#2e1065"); // Morado oscuro intenso
  gradienteFondo.addColorStop(1, "#020617"); // Casi negro en los bordes
  ctx.fillStyle = gradienteFondo;
  ctx.fillRect(0, 0, TAMANO, TAMANO);

  // 2. Brillos decorativos en las esquinas
  const brilloTop = ctx.createRadialGradient(0, 0, 0, 0, 0, 700);
  brilloTop.addColorStop(0, "rgba(16, 185, 129, 0.2)"); // Verde esmeralda
  brilloTop.addColorStop(1, "rgba(16, 185, 129, 0)");
  ctx.fillStyle = brilloTop;
  ctx.fillRect(0, 0, TAMANO, TAMANO);

  const brilloBot = ctx.createRadialGradient(TAMANO, TAMANO, 0, TAMANO, TAMANO, 700);
  brilloBot.addColorStop(0, "rgba(139, 92, 246, 0.2)"); // Morado brillante
  brilloBot.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = brilloBot;
  ctx.fillRect(0, 0, TAMANO, TAMANO);

  // 3. Estrellas decorativas de fondo
  const dibujarEstrella = (x: number, y: number, size: number, color: string) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.translate(x, y);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.lineTo(0, size);
      ctx.quadraticCurveTo(size / 6, size / 6, size, 0);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  dibujarEstrella(220, 320, 35, "#fde047");
  dibujarEstrella(860, 420, 45, "#34d399");
  dibujarEstrella(180, 650, 25, "#a78bfa");
  dibujarEstrella(820, 720, 30, "#fde047");

  // 4. Textos Superiores
  ctx.textAlign = "center";
  ctx.fillStyle = "#10b981"; // Esmeralda vibrante
  ctx.font = "800 32px Nunito, Arial, sans-serif";
  ctx.fillText("S E M I L L A S", TAMANO / 2, 110);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 72px Nunito, Arial, sans-serif";
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillText("¡Insignia Desbloqueada!", TAMANO / 2, 195);
  ctx.shadowColor = "transparent";

  // 5. Dibujar la Insignia en el centro
  await dibujarInsignia(ctx, imagenUrl);

  // 6. Nombre de la insignia (Gradiente Dorado)
  const gradienteNombre = ctx.createLinearGradient(0, 780, 0, 860);
  gradienteNombre.addColorStop(0, "#fef08a");
  gradienteNombre.addColorStop(0.5, "#fde047");
  gradienteNombre.addColorStop(1, "#eab308");
  ctx.fillStyle = gradienteNombre;
  ctx.font = "900 66px Nunito, Arial, sans-serif";
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 6;
  escribirTextoCentrado(ctx, nombreInsignia.toUpperCase(), TAMANO / 2, 830, 920, 66);
  ctx.shadowColor = "transparent";

  // 7. Textos Inferiores
  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 32px Nunito, Arial, sans-serif";
  ctx.fillText("Sigue aprendiendo, creciendo y compartiendo.", TAMANO / 2, 940);

  ctx.fillStyle = "#34d399";
  ctx.font = "800 28px Nunito, Arial, sans-serif";
  ctx.fillText("Crecer en la Palabra, vivir Su verdad", TAMANO / 2, 1000);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((resultado) => {
      if (resultado) resolve(resultado);
      else reject(new Error("No se pudo exportar la tarjeta de la insignia"));
    }, "image/png", .95);
  });

  return new File([blob], `insignia-${normalizarNombreInsignia(nombreInsignia)}.png`, { type: "image/png" });
}

export function descargarTarjetaInsignia(archivo: File): void {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = archivo.name;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

async function dibujarInsignia(ctx: CanvasRenderingContext2D, imagenUrl: string): Promise<void> {
  const centroX = TAMANO / 2;
  const centroY = 510;
  const radio = 230;

  ctx.save();
  // Aura brillante detrás de la insignia
  const aura = ctx.createRadialGradient(centroX, centroY, radio - 40, centroX, centroY, radio + 120);
  aura.addColorStop(0, "rgba(250, 204, 21, 0.45)"); // Glow dorado intenso
  aura.addColorStop(1, "rgba(250, 204, 21, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(centroX, centroY, radio + 120, 0, Math.PI * 2);
  ctx.fill();

  // Círculo blanco de fondo para la imagen
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 15;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(centroX, centroY, radio + 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  try {
    const imagen = await cargarImagen(imagenUrl);
    const lado = radio * 2;
    ctx.drawImage(imagen, centroX - radio, centroY - radio, lado, lado);
  } catch {
    ctx.fillStyle = "#F4F0FF";
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6D35E8";
    ctx.font = "900 180px Arial, sans-serif";
    ctx.fillText("★", centroX, centroY + 60);
  }
}

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.crossOrigin = "anonymous";
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(new Error("No se pudo cargar la imagen de la insignia"));
    imagen.src = src;
  });
}

function escribirTextoCentrado(
  ctx: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  anchoMaximo: number,
  interlineado: number,
): void {
  const palabras = texto.split(/\s+/);
  const lineas: string[] = [];
  let linea = "";

  for (const palabra of palabras) {
    const candidata = linea ? `${linea} ${palabra}` : palabra;
    if (ctx.measureText(candidata).width > anchoMaximo && linea) {
      lineas.push(linea);
      linea = palabra;
    } else {
      linea = candidata;
    }
  }
  if (linea) lineas.push(linea);

  lineas.slice(0, 2).forEach((lineaActual, indice) => {
    ctx.fillText(lineaActual, x, y + indice * interlineado);
  });
}
