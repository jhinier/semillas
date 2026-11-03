type EntornoProceso = { env?: Record<string, string | undefined> };

function obtenerEntornoProceso() {
  return (globalThis as typeof globalThis & { process?: EntornoProceso }).process?.env;
}

function requerida(nombre: string, valor: string | undefined): string {
  const normalizado = valor?.trim();
  if (!normalizado) {
    throw new Error(`[semillas] Falta la variable de entorno ${nombre}`);
  }
  return normalizado;
}

function variablePublica(nombre: string, valorVite: string | undefined): string {
  const entornoProceso = obtenerEntornoProceso();
  return requerida(nombre, valorVite ?? entornoProceso?.[nombre]);
}

function obtenerApiUrl(): string {
  const entornoProceso = obtenerEntornoProceso();
  const valor = variablePublica("VITE_API_URL", import.meta.env.VITE_API_URL ?? entornoProceso?.VITE_API_URL);
  return valor.replace(/\/$/, "");
}

export const env = {
  get supabaseUrl(): string {
    return variablePublica("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL).replace(/\/$/, "");
  },
  get supabaseAnonKey(): string {
    return variablePublica("VITE_SUPABASE_ANON_KEY", import.meta.env.VITE_SUPABASE_ANON_KEY);
  },
};

export function obtenerApiUrlPublica(): string {
  return obtenerApiUrl();
}
