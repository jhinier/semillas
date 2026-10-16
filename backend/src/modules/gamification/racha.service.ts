export const ZONA_HORARIA_REFERENCIA = "America/Guayaquil";

function fechaEnZona(fecha: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

function restarDia(fecha: string, cantidad = 1): string {
  const copia = new Date(`${fecha}T00:00:00.000Z`);
  copia.setUTCDate(copia.getUTCDate() - cantidad);
  return copia.toISOString().slice(0, 10);
}

export type ResultadoRacha = { actual: number; mejor: number };

export function calcularRachaDiaria(
  dias: readonly string[],
  referencia = new Date(),
  timeZone = ZONA_HORARIA_REFERENCIA,
): ResultadoRacha {
  const disponibles = new Set(dias);
  let actual = 0;
  const hoy = fechaEnZona(referencia, timeZone);
  const ayer = restarDia(hoy);
  let cursor = disponibles.has(hoy) ? hoy : disponibles.has(ayer) ? ayer : null;
  while (cursor && disponibles.has(cursor)) {
    actual += 1;
    cursor = restarDia(cursor);
  }

  const ordenados = [...disponibles].sort();
  let mejor = 0;
  let consecutivos = 0;
  let anterior: string | null = null;
  for (const dia of ordenados) {
    if (anterior && restarDia(dia) === anterior) consecutivos += 1;
    else consecutivos = 1;
    mejor = Math.max(mejor, consecutivos);
    anterior = dia;
  }
  return { actual, mejor };
}
