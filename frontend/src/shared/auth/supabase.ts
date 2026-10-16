import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import { queryClient } from "../../app/query-client";
import {
  cerrarSesionAutenticadaConCliente,
  escucharCambiosAutenticacionConCliente,
  iniciarSesionFacebookConCliente,
  iniciarSesionConCorreoConCliente,
  iniciarSesionGoogleConCliente,
  registrarConCorreoConCliente,
  vincularGoogleConCliente,
  sincronizarSesionAutenticadaConCliente,
} from "./supabase.helpers";
import { limpiarDatosSesionOffline } from "./logout-cleanup";
import { obtenerScopeOffline } from "@/lib/offline/user-scope";
import { limpiarCacheClubesScope } from "@/features/clubes/club-cache-storage";

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function sincronizarSesionAutenticada() {
  return sincronizarSesionAutenticadaConCliente(supabase);
}

export function escucharCambiosAutenticacion(onCambio?: Parameters<typeof escucharCambiosAutenticacionConCliente>[1]) {
  return escucharCambiosAutenticacionConCliente(supabase, onCambio);
}

export async function iniciarSesionGoogle(redirectTo: string) {
  return iniciarSesionGoogleConCliente(supabase, redirectTo);
}

export async function iniciarSesionFacebook(redirectTo: string) {
  return iniciarSesionFacebookConCliente(supabase, redirectTo);
}

export async function vincularGoogle() {
  return vincularGoogleConCliente(supabase);
}

export async function cerrarSesionAutenticada() {
  const scopeId = await obtenerScopeOffline();
  await cerrarSesionAutenticadaConCliente(supabase);
  // Los datos offline permanecen asociados a su scope para que el usuario
  // pueda continuar después; al cambiar de cuenta nunca se reutilizan.
  await limpiarDatosSesionOffline({
    clearOfflineTables: scopeId ? [() => limpiarCacheClubesScope(scopeId)] : [],
    listCacheNames: typeof caches === "undefined" ? undefined : () => caches.keys(),
    deleteCache: typeof caches === "undefined" ? undefined : (nombre) => caches.delete(nombre),
    clearQueries: () => queryClient.clear(),
  });
}

export async function registrarConCorreo(email: string, password: string) {
  return registrarConCorreoConCliente(supabase, email, password);
}

export async function iniciarSesionConCorreo(email: string, password: string) {
  return iniciarSesionConCorreoConCliente(supabase, email, password);
}
