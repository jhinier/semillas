import type { Session } from "@supabase/supabase-js";

const GOOGLE_NOMBRE_SUGERIDO_KEY = "semillas_google_nombre_sugerido";

function extraerNombreSugerido(session: Session | null) {
  if (session?.user?.app_metadata?.provider !== "google") {
    return "";
  }

  const nombre =
    session.user.user_metadata?.full_name ??
    session.user.user_metadata?.name ??
    session.user.email?.split("@")[0] ??
    "";

  return String(nombre).trim();
}

export function guardarNombreSugeridoDeGoogle(session: Session | null) {
  const nombre = extraerNombreSugerido(session);

  if (!nombre) {
    limpiarNombreSugeridoDeGoogle();
    return;
  }

  localStorage.setItem(GOOGLE_NOMBRE_SUGERIDO_KEY, nombre);
}

export function leerNombreSugeridoDeGoogle() {
  return localStorage.getItem(GOOGLE_NOMBRE_SUGERIDO_KEY) ?? "";
}

export function limpiarNombreSugeridoDeGoogle() {
  localStorage.removeItem(GOOGLE_NOMBRE_SUGERIDO_KEY);
}
