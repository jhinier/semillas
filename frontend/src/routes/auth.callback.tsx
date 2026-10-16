import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { obtenerMiPerfil } from "../features/perfil/profile.api";
import { obtenerRutaPostLogin } from "../shared/auth/post-login";
import { sincronizarSesionAutenticada } from "../shared/auth/supabase";
import { queryClient } from "../app/query-client";
import { notificarErrorVisible } from "../shared/feedback/error-feedback";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

type ResolverRedireccionAuthCallbackDependencias = {
  estaActivo: () => boolean;
  navegar: (opciones: { to: string; replace?: boolean; search?: { redirect?: string } }) => void;
  sincronizarSesionAutenticada: typeof sincronizarSesionAutenticada;
  obtenerMiPerfil: typeof obtenerMiPerfil;
};

export async function resolverRedireccionAuthCallback({
  estaActivo,
  navegar,
  sincronizarSesionAutenticada,
  obtenerMiPerfil,
}: ResolverRedireccionAuthCallbackDependencias) {
  try {
    await sincronizarSesionAutenticada();
    const respuestaPerfil = await queryClient.ensureQueryData({
      queryKey: ["me"],
      queryFn: obtenerMiPerfil,
    });
    const destino = obtenerRutaPostLogin(respuestaPerfil.perfil, respuestaPerfil.usuario);

    if (estaActivo()) {
      navegar({ to: destino, replace: true });
    }
  } catch (error) {
    notificarErrorVisible({
      clave: "auth:callback",
      error,
      mensajeFallback: "No pudimos terminar de procesar el inicio de sesión.",
      descripcion: "Serás redirigido al inicio de sesión para reintentar el acceso.",
    });

    if (estaActivo()) {
      navegar({ to: "/login", search: { redirect: "/app" }, replace: true });
    }
  }
}

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;
    void resolverRedireccionAuthCallback({
      estaActivo: () => activo,
      navegar: (opciones) => void navigate(opciones as never),
      sincronizarSesionAutenticada,
      obtenerMiPerfil,
    });

    return () => {
      activo = false;
    };
  }, [navigate]);

  return <div aria-live="polite">Procesando inicio de sesión...</div>;
}
