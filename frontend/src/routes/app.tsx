import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { hasSession } from "../shared/api/auth-guard";
import { PantallaErrorRuta } from "@/componentes/estados/pantalla-error-ruta";
import { BottomNav } from "@/componentes/ui/bottom-nav";
import { AppSidebar } from "../shared/layout/app-sidebar";
import { AppUserHeader } from "../shared/layout/app-user-header";
import { useAppLayout } from "../shared/layout/hooks/use-app-layout";
import { resolverAvatar } from "@/shared/constants/avatares";
import { cerrarSesionAutenticada } from "@/shared/auth/supabase";
import { sessionStorageApi } from "@/shared/api/session";
import {
  consumirConflictoVinculacion,
  descartarConflictoVinculacion,
  eventoConflictoVinculacion,
} from "@/shared/auth/conflicto-vinculacion";
import { router } from "@/router";
import { DialogoConflictoVinculacion } from "@/componentes/ui/dialogo-conflicto-vinculacion";
import { obtenerMiPerfil } from "@/features/perfil/profile.api";
import { obtenerGamificacionPropia } from "@/features/gamification/gamification.api";
import {
  aplicarPreferenciasDispositivo,
  aplicarTamanoTexto,
  aplicarTemaVisual,
  leerPreferenciaPerfil,
} from "@/shared/accessibility/preferences";
import "./app.css";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (!hasSession()) throw redirect({ to: "/login", search: { redirect: "/app" } });
  },
  errorComponent: PantallaErrorRuta,
  component: AppLayout,
});

function AppLayout() {
  const {
    isOffline,
    handleLogout,
    opcionesBottomNav,
    activoMovil,
    navigateTo,
    pageHeader,
    path,
    esInicio,
    esModoLeccion,
    esDetalleTema,
  } = useAppLayout();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
    staleTime: 1000 * 60 * 5,
  });

  const gamificacionQuery = useQuery({
    queryKey: ["gamification", "me"],
    queryFn: obtenerGamificacionPropia,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 1000 * 60 * 3,
  });

  const logrosBadge = (gamificacionQuery.data?.pendientes_reclamar ?? 0) > 0;

  useEffect(() => {
    const scopeId = meQuery.data?.perfil?.id || meQuery.data?.usuario?.id;
    const rawSize =
      meQuery.data?.perfil?.tamano_texto_preferido ||
      leerPreferenciaPerfil("semillas-pref-text-size", scopeId);
    aplicarTamanoTexto(rawSize);

    const prefersAudio = meQuery.data?.perfil?.prefiere_audio;
    if (typeof prefersAudio === "boolean") {
      window.localStorage.setItem("semillas-prefiere-audio", String(prefersAudio));
    }
  }, [
    meQuery.data?.perfil?.id,
    meQuery.data?.perfil?.prefiere_audio,
    meQuery.data?.perfil?.tamano_texto_preferido,
    meQuery.data?.usuario?.id,
  ]);

  const [mensajeConflicto, setMensajeConflicto] = useState<string | null>(null);

  useEffect(() => {
    const scopeId = meQuery.data?.perfil?.id || meQuery.data?.usuario?.id;
    if (!scopeId && meQuery.isLoading) return;

    const aplicar = () => aplicarPreferenciasDispositivo(scopeId);
    aplicar();

    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      const tema = leerPreferenciaPerfil("semillas-pref-tema", scopeId, "claro");
      if (tema === "sistema") {
        aplicarTemaVisual("sistema");
      }
    };

    window.addEventListener("semillas:preferences-changed", aplicar);
    window.addEventListener("storage", aplicar);
    mediaQuery?.addEventListener?.("change", handleMediaChange);

    return () => {
      window.removeEventListener("semillas:preferences-changed", aplicar);
      window.removeEventListener("storage", aplicar);
      mediaQuery?.removeEventListener?.("change", handleMediaChange);
    };
  }, [meQuery.data?.perfil?.id, meQuery.data?.usuario?.id, meQuery.isLoading]);

  useEffect(() => {
    const inicial = consumirConflictoVinculacion();
    if (inicial) {
      setMensajeConflicto(inicial);
    }
    const handler = () => {
      const siguiente = consumirConflictoVinculacion();
      if (siguiente) {
        setMensajeConflicto(siguiente);
      }
    };
    window.addEventListener(eventoConflictoVinculacion(), handler);
    return () => {
      window.removeEventListener(eventoConflictoVinculacion(), handler);
    };
  }, []);

  const continuarComoInvitado = async () => {
    descartarConflictoVinculacion();
    setMensajeConflicto(null);
    sessionStorageApi.clearAccessToken();
    try {
      await cerrarSesionAutenticada();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Cerrar sesion OAuth durante conflicto fallo:", error);
      }
    }
    if (typeof window !== "undefined") {
      window.location.assign("/app");
    }
  };

  const cambiarCuenta = async () => {
    descartarConflictoVinculacion();
    setMensajeConflicto(null);
    sessionStorageApi.clearGuestSession();
    sessionStorageApi.clearAccessToken();
    try {
      await cerrarSesionAutenticada();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Cerrar sesion OAuth para cambiar cuenta fallo:", error);
      }
    }
    await router.navigate({ to: "/login", search: { redirect: "/app" } });
  };

  const avatarGuardado =
    meQuery.data?.perfil?.clave_avatar || meQuery.data?.perfil?.url_avatar || "1";
  const cuenta = {
    nombre: meQuery.data?.perfil?.apodo || "Semillero",
    nivelTexto:
      meQuery.data?.usuario?.proveedor === "invitado"
        ? "Invitado"
        : meQuery.data?.usuario?.rol === "administrador"
          ? "Administrador"
          : "Cuenta registrada",
    avatarUrl: resolverAvatar(avatarGuardado),
    rol: meQuery.data?.usuario?.rol,
  };

  return (
    <>
      <div className={`app-shell app-shell--app ${esModoLeccion || esDetalleTema ? "app-shell--lesson" : ""}`}>
        {!esModoLeccion && !esDetalleTema ? (
          <AppSidebar
            activePage={path}
            isOffline={isOffline}
            isOpen={false}
            onClose={() => undefined}
            onLogout={handleLogout}
            variant="app"
            logrosBadge={logrosBadge}
          />
        ) : null}

      <div className="app-shell__workspace">
          <a className="skip-link" href="#main-content">Ir al contenido</a>
          {!esModoLeccion && !esDetalleTema ? (
            <AppUserHeader
              title={pageHeader.titulo}
              subtitle={pageHeader.subtitulo}
              nombreVisible={cuenta.nombre}
              nivelTexto={cuenta.nivelTexto}
              avatarUrl={cuenta.avatarUrl}
              onLogout={handleLogout}
              isOffline={isOffline}
              esInicio={esInicio}
              rol={cuenta.rol}
              scopeId={meQuery.data?.perfil?.id || meQuery.data?.usuario?.id}
            />
          ) : null}

          <main id="main-content" className="app-shell__main app-shell__main--app">
            <div className="app-shell__content app-shell__content--app" data-path={path}>
              <Outlet />
            </div>
          </main>

          {!esModoLeccion ? (
            <nav className="app-shell__bottom-nav" aria-label="Navegación principal móvil">
              <BottomNav opciones={opcionesBottomNav} activo={activoMovil} onCambiar={navigateTo} />
            </nav>
          ) : null}
        </div>
      </div>

      {mensajeConflicto ? (
        <DialogoConflictoVinculacion
          mensaje={mensajeConflicto}
          onContinuarInvitado={continuarComoInvitado}
          onCambiarCuenta={cambiarCuenta}
        />
      ) : null}
    </>
  );
}
