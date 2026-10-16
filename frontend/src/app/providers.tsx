import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { queryClient } from "./query-client";
import { router } from "../router";
import { escucharCambiosAutenticacion, sincronizarSesionAutenticada } from "../shared/auth/supabase";
import { reclamarCuentaInvitada } from "../features/perfil/profile.api";
import { sessionStorageApi } from "../shared/api/session";
import { guardarNombreSugeridoDeGoogle } from "../shared/auth/google-profile";
import { obtenerRutaPostLogin } from "../shared/auth/post-login";
import { obtenerMiPerfil } from "../features/perfil/profile.api";
import { useAutoSync } from "@/lib/offline";
import { OfflineBanner } from "@/componentes/ui/sync-status-badge";
import { SugerenciaInstalacionPWA } from "@/componentes/ui/sugerencia-instalacion-pwa";
import { PwaLifecycle } from "@/componentes/ui/pwa-lifecycle";
import { clasificarErrorVinculacion, resolverRedireccionBootstrap } from "./bootstrap";
import { publicarConflictoVinculacion } from "@/shared/auth/conflicto-vinculacion";
import { migrarInvitadoSiCorresponde } from "../features/auth/migracion-invitado";
import { aplicarTamanoTexto } from "../shared/accessibility/preferences";
import { useVisualViewport } from "@/shared/hooks/visual-viewport";

async function vincularCuentaPendiente() {
  const guestUserId = sessionStorageApi.getGuestUserId();
  const accessToken = sessionStorageApi.getAccessToken();

  await migrarInvitadoSiCorresponde({
    guestUserId,
    accessToken,
    vincularCuenta: reclamarCuentaInvitada,
    limpiarSesionInvitado: () => sessionStorageApi.clearGuestSession(),
  });
  await queryClient.invalidateQueries({ queryKey: ["me"] });
}

async function redirigirSegunOnboarding() {
  const perfilRespuesta = await queryClient.ensureQueryData({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
  });
  const ruta = obtenerRutaPostLogin(perfilRespuesta.perfil, perfilRespuesta.usuario);

  const redireccion = resolverRedireccionBootstrap(window.location.pathname, ruta);
  if (redireccion) {
    await router.navigate({ to: redireccion as never, replace: true });
  }
}

function AuthBootstrap({ children }: { children: ReactNode }) {
  // Las rutas públicas no deben esperar a una consulta de sesión remota para
  // pintar el shell. Las rutas protegidas mantienen su guardia propia.
  useAutoSync(true);
  useVisualViewport();

  useEffect(() => {
    // 1. Aplicar Alto Contraste
    const contraste = localStorage.getItem("semillas-pref-contraste") === "alto";
    if (contraste) {
      document.documentElement.classList.add("alto-contraste");
    } else {
      document.documentElement.classList.remove("alto-contraste");
    }

    aplicarTamanoTexto(localStorage.getItem("semillas-pref-text-size"));

    // 2. Aplicar Tema (Modo Oscuro) temporalmente deshabilitado
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    async function intentarVinculacion() {
      try {
        await vincularCuentaPendiente();
        await redirigirSegunOnboarding();
      } catch (error) {
        const resultado = clasificarErrorVinculacion(error);
        if (resultado.tipo === "conflicto") {
          publicarConflictoVinculacion(resultado.mensaje);
          return;
        }
        if (import.meta.env.DEV) {
          console.warn("Bootstrap: vinculacion no completada", error);
        }
      }
    }

    const detenerEscucha = escucharCambiosAutenticacion((session) => {
      guardarNombreSugeridoDeGoogle(session);
      void intentarVinculacion();
    });

    sincronizarSesionAutenticada()
      .then((session) => {
        guardarNombreSugeridoDeGoogle(session);

        if (!session) {
          return undefined;
        }

        return intentarVinculacion();
      })
      .catch(() => undefined);

    return () => {
      detenerEscucha();
    };
  }, []);

  return (
    <>
      <OfflineBanner />
      <SugerenciaInstalacionPWA />
      {children}
    </>
  );
}

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <PwaLifecycle />
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
