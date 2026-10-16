import { createMiddleware } from "hono/factory";
import type { AppBindings } from "../../config/env";

export type ClaseRateLimit = "publico" | "autenticado" | "sensible";

type Limite = { maximo: number; ventanaMs: number };
type BindingRateLimit = { limit: (entrada: { key: string }) => Promise<{ success: boolean }> };

const LIMITES: Record<ClaseRateLimit, Limite> = {
  publico: { maximo: 60, ventanaMs: 60_000 },
  autenticado: { maximo: 120, ventanaMs: 60_000 },
  sensible: { maximo: 5, ventanaMs: 60_000 },
};

const memoria = new Map<string, { inicio: number; cantidad: number }>();

export function crearRateLimitMiddleware(clase: ClaseRateLimit) {
  const limite = LIMITES[clase];
  return createMiddleware<AppBindings>(async (c, next) => {
    const identificador = c.get("user")?.id ?? c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const ruta = new URL(c.req.url).pathname;
    const key = `${identificador}:${clase}:${ruta}`;
    const binding = c.env.RATE_LIMITER as BindingRateLimit | undefined;
    const permitidoPorBinding = binding ? await binding.limit({ key }) : null;
    let permitido = permitidoPorBinding?.success ?? true;

    if (!binding) {
      const ahora = Date.now();
      const actual = memoria.get(key);
      const registro = !actual || ahora - actual.inicio >= limite.ventanaMs
        ? { inicio: ahora, cantidad: 0 }
        : actual;
      registro.cantidad += 1;
      memoria.set(key, registro);
      permitido = registro.cantidad <= limite.maximo;
    }

    if (!permitido) {
      c.header("Retry-After", String(Math.ceil(limite.ventanaMs / 1000)));
      return c.json({ exito: false, error: "Demasiadas solicitudes", codigo: "RATE_LIMIT_EXCEEDED" }, 429);
    }
    await next();
  });
}

export function limpiarRateLimitMemoria() {
  memoria.clear();
}
