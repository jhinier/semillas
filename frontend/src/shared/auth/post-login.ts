import type { Perfil, Usuario } from "../../shared/api/api";

export function obtenerRutaPostLogin(perfil: Perfil | null | undefined, usuario?: Usuario | null) {
  if (usuario?.rol === "administrador") {
    return "/admin";
  }

  const apodo = perfil?.apodo?.trim() ?? "";
  const grupoEdadId = perfil?.grupo_edad_id ?? null;

  if (!grupoEdadId) {
    return "/onboarding";
  }

  if (!apodo) {
    return "/onboarding/customize";
  }

  return "/app";
}
