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

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (!hasSession()) throw redirect({ to: "/login", search: { redirect: "/app" } });
  },
  errorComponent: PantallaErrorRuta,
  component: AppLayout,
});

function AppLayout() {
  useEffect(() => {
    void import("./app.css");
  }, []);

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
    const rawSize = meQuery.data?.perfil?.tamano_texto_preferido;
    const normalizedSize = rawSize === "grande" ? "grande" : rawSize === "pequeno" || rawSize === "pequeño" ? "pequeno" : "mediano";
    document.documentElement.dataset.semillasTextSize = normalizedSize;

    const prefersAudio = meQuery.data?.perfil?.prefiere_audio;
    if (typeof prefersAudio === "boolean") {
      window.localStorage.setItem("semillas-prefiere-audio", String(prefersAudio));
    }

    return () => {
      delete document.documentElement.dataset.semillasTextSize;
    };
  }, [meQuery.data?.perfil?.prefiere_audio, meQuery.data?.perfil?.tamano_texto_preferido]);

  const [mensajeConflicto, setMensajeConflicto] = useState<string | null>(null);

  useEffect(() => {
    // Tema oscuro temporalmente deshabilitado
    document.documentElement.setAttribute("data-theme", "app-light");
  }, []);

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

  const avatarGuardado = meQuery.data?.perfil?.url_avatar || meQuery.data?.perfil?.clave_avatar || "1";
  const cuenta = {
    nombre: meQuery.data?.perfil?.apodo || "Semillero",
    nivelTexto:
      meQuery.data?.usuario?.proveedor === "invitado"
        ? "Invitado"
        : "Cuenta registrada",
    avatarUrl: resolverAvatar(avatarGuardado),
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
