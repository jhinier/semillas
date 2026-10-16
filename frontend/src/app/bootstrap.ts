import { ErrorApi } from "@/shared/api/error-api";

export type ResultadoManejoVinculacion =
  | { tipo: "ok" }
  | { tipo: "conflicto"; mensaje: string }
  | { tipo: "error"; error: unknown };

export function clasificarErrorVinculacion(error: unknown): ResultadoManejoVinculacion {
  if (error instanceof ErrorApi && error.estado === 409) {
    return { tipo: "conflicto", mensaje: error.message };
  }
  return { tipo: "error", error };
}

export function resolverRedireccionBootstrap(
  rutaActual: string,
  rutaPostLogin: string,
): string | null {
  if (rutaPostLogin === "/app" && rutaActual.startsWith("/app")) {
    return null;
  }
  if (rutaPostLogin === "/admin" && rutaActual.startsWith("/admin")) {
    return null;
  }
  if (rutaPostLogin.startsWith("/onboarding") && rutaActual.startsWith("/onboarding")) {
    return null;
  }

  return rutaActual === rutaPostLogin ? null : rutaPostLogin;
}
