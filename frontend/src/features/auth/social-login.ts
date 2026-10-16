export function obtenerRedirectGoogle(baseUrl: string) {
  return `${baseUrl}/auth/callback`;
}

export function obtenerRedirectFacebook(baseUrl: string) {
  return `${baseUrl}/auth/callback`;
}

export function esFacebookPermitidoEnOrigen(origin: string) {
  const url = new URL(origin);
  const origenPermitido = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "semillas.pages.dev" || url.hostname === "semillas.org";
  return origenPermitido && import.meta.env.VITE_AUTH_FACEBOOK_ENABLED !== "false";
}

export function estaGoogleHabilitado() {
  return import.meta.env.VITE_AUTH_GOOGLE_ENABLED !== "false";
}
