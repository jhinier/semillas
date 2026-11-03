import type { Session } from "@supabase/supabase-js";

import { sessionStorageApi } from "../api/session";

export type ClienteSupabaseAuth = {
  auth: {
    signInWithOAuth: (args: {
      provider: "google" | "facebook";
      options: {
        redirectTo: string;
        queryParams: {
          access_type: "offline";
          prompt: "consent";
        };
      };
    }) => Promise<{ data: { url: string | null }; error: Error | null }>;
    linkIdentity: (args: {
      provider: "google";
    }) => Promise<{ data: { url: string | null }; error: Error | null }>;
    signUp: (args: {
      email: string;
      password: string;
    }) => Promise<{
      data: {
        user: { id: string } | null;
        session: { access_token: string; user: { id: string } } | null;
      };
      error: Error | null;
    }>;
    signInWithPassword: (args: {
      email: string;
      password: string;
    }) => Promise<{
      data: {
        user: { id: string } | null;
        session: { access_token: string; user: { id: string } } | null;
      };
      error: Error | null;
    }>;
    getSession: () => Promise<{ data: { session: Session | null }; error: Error | null }>;
    refreshSession?: () => Promise<{ data: { session: Session | null }; error: Error | null }>;
    onAuthStateChange: (
      callback: (_event: string, session: Session | null) => void,
    ) => { data: { subscription: { unsubscribe: () => void } } };
    signOut: () => Promise<{ error: Error | null }>;
  };
};

function sincronizarTokenSesion(session: Session | null, permitirLimpiar = true) {
  if (session?.access_token) {
    sessionStorageApi.setAccessToken(session.access_token);
    if (session.user?.id) sessionStorageApi.setAuthUserId(session.user.id);
    sessionStorageApi.clearGuestSession();
    return;
  }

  // Nunca borrar la sesión guardada si el usuario está sin conexión al recargar la página (salvo cierre explícito)
  if (!permitirLimpiar) {
    return;
  }

  sessionStorageApi.clearAccessToken();
  sessionStorageApi.clearAuthUserId();
}

export async function sincronizarSesionAutenticadaConCliente(cliente: ClienteSupabaseAuth) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return null;
  }

  const { data, error } = await cliente.auth.getSession();

  if (error) {
    // Si falla por falta de red, conservar el token local para uso offline
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return null;
    }
    throw error;
  }

  sincronizarTokenSesion(data.session, false);
  return data.session;
}

export async function renovarSesionAutenticadaConCliente(cliente: ClienteSupabaseAuth) {
  try {
    if (typeof cliente.auth.refreshSession === "function") {
      const { data, error } = await cliente.auth.refreshSession();
      if (!error && data?.session?.access_token) {
        sincronizarTokenSesion(data.session, false);
        return data.session.access_token;
      }
    }
  } catch {
    // Si falla el refresh directo, intentar getSession
  }

  try {
    const { data } = await cliente.auth.getSession();
    if (data?.session?.access_token) {
      sincronizarTokenSesion(data.session, false);
      return data.session.access_token;
    }
  } catch {
    // continuar
  }

  return null;
}

export function escucharCambiosAutenticacionConCliente(
  cliente: ClienteSupabaseAuth,
  onCambio?: (session: Session | null) => void | Promise<void>,
) {
  const { data } = cliente.auth.onAuthStateChange((event, session) => {
    const permitirLimpiar = event === "SIGNED_OUT";
    sincronizarTokenSesion(session, permitirLimpiar);
    void onCambio?.(session);
  });

  return () => data.subscription.unsubscribe();
}

export async function iniciarSesionGoogleConCliente(cliente: ClienteSupabaseAuth, redirectTo: string) {
  const { data, error } = await cliente.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw error;
  }

  return data.url ?? "";
}

export async function iniciarSesionFacebookConCliente(cliente: ClienteSupabaseAuth, redirectTo: string) {
  const { data, error } = await cliente.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw error;
  }

  return data.url ?? "";
}

export async function vincularGoogleConCliente(cliente: ClienteSupabaseAuth) {
  const { data, error } = await cliente.auth.linkIdentity({
    provider: "google",
  });

  if (error) {
    throw error;
  }

  return data.url ?? "";
}

export async function cerrarSesionAutenticadaConCliente(cliente: ClienteSupabaseAuth) {
  sessionStorageApi.clearAccessToken();
  sessionStorageApi.clearAuthUserId();
  try {
    await Promise.race([
      cliente.auth.signOut(),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch {
    // Ignorar error de red al cerrar sesión sin conexión
  }
  sessionStorageApi.clearAccessToken();
  sessionStorageApi.clearAuthUserId();
}

export async function registrarConCorreoConCliente(
  cliente: ClienteSupabaseAuth,
  email: string,
  password: string,
) {
  const { data, error } = await cliente.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

export async function iniciarSesionConCorreoConCliente(
  cliente: ClienteSupabaseAuth,
  email: string,
  password: string,
) {
  const { data, error } = await cliente.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}
