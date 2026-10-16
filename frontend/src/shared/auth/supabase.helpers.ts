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
    onAuthStateChange: (
      callback: (_event: string, session: Session | null) => void,
    ) => { data: { subscription: { unsubscribe: () => void } } };
    signOut: () => Promise<{ error: Error | null }>;
  };
};

function sincronizarTokenSesion(session: Session | null) {
  if (session?.access_token) {
    sessionStorageApi.setAccessToken(session.access_token);
    if (session.user?.id) sessionStorageApi.setAuthUserId(session.user.id);
    return;
  }

  sessionStorageApi.clearAccessToken();
  sessionStorageApi.clearAuthUserId();
}

export async function sincronizarSesionAutenticadaConCliente(cliente: ClienteSupabaseAuth) {
  const { data, error } = await cliente.auth.getSession();

  if (error) {
    sessionStorageApi.clearAccessToken();
    throw error;
  }

  sincronizarTokenSesion(data.session);
  return data.session;
}

export function escucharCambiosAutenticacionConCliente(
  cliente: ClienteSupabaseAuth,
  onCambio?: (session: Session | null) => void | Promise<void>,
) {
  const { data } = cliente.auth.onAuthStateChange((_event, session) => {
    sincronizarTokenSesion(session);
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
  await cliente.auth.signOut();
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
