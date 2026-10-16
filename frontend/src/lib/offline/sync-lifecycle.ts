const RETRY_BASE_MS = 1_000;
const RETRY_MAX_MS = 30_000;

/** Calcula backoff exponencial acotado con jitter para reintentos de sync. */
export function calcularEsperaReintento(intento: number, aleatorio = Math.random()): number {
  const exponente = Math.min(Math.max(intento, 0), 5);
  const base = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** exponente);
  const jitter = Math.min(Math.max(aleatorio, 0), 1) * Math.floor(base * 0.25);
  return Math.min(RETRY_MAX_MS, base + jitter);
}
