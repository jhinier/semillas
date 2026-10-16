const TOKEN_BYTES = 32;

function bytesAHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashTokenInvitado(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesAHex(new Uint8Array(digest));
}

export async function generarCredencialInvitado() {
  const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));
  const token = btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");

  return { token, hash: await hashTokenInvitado(token) };
}

export async function verificarTokenInvitado(token: string, hashEsperado: string) {
  const hashRecibido = await hashTokenInvitado(token);
  if (hashRecibido.length !== hashEsperado.length) return false;

  let diferencia = 0;
  for (let indice = 0; indice < hashRecibido.length; indice++) {
    diferencia |= hashRecibido.charCodeAt(indice) ^ hashEsperado.charCodeAt(indice);
  }
  return diferencia === 0;
}
