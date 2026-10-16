import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { sessionStorageApi } from "@/shared/api/session";
import { cerrarSesionAutenticada } from "@/shared/auth/supabase";
import { obtenerNavMovilActivo, obtenerNavegacionMovil } from "@/shared/layout/app-mobile-nav";
import { esRutaModoLeccion } from "@/features/crecer/crecer-fases";

type PageHeaderInfo = {
  titulo: string;
  subtitulo: string;
};

const PAGE_HEADER_MAP: Record<string, PageHeaderInfo> = {
  "/app/temas": {
    titulo: "Mis temas",
    subtitulo: "Explora, continúa y completa temas adaptados a tu edad.",
  },
  "/app/logros": {
    titulo: "Mis insignias",
    subtitulo: "Los logros y premios que has alcanzado.",
  },
  "/app/perfil": {
    titulo: "Mi perfil",
    subtitulo: "Administra tu avatar y configuración.",
  },
  "/app/clubes": {
    titulo: "Clubes",
    subtitulo: "Aprende, participa y avanza con tu iglesia, curso o familia.",
  },
  "/app/descargas": {
    titulo: "Descargas",
    subtitulo: "Recursos para aprender y crecer en la fe, incluso sin conexión.",
  },
};

const DEFAULT_HEADER: PageHeaderInfo = {
  titulo: "Inicio",
  subtitulo: "Sigue creciendo hoy con una lección corta y una meta clara.",
};

export function useAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    await cerrarSesionAutenticada();
    sessionStorageApi.clearGuestSession();
    navigate({ to: "/login", search: { redirect: "/onboarding" } });
  };

  const navegacionMovil = useMemo(() => obtenerNavegacionMovil(), []);
  const opcionesBottomNav = navegacionMovil.map(({ id, etiqueta, icono }) => ({
    id,
    etiqueta,
    icono,
    badge: false,
  }));
  const activoMovil = obtenerNavMovilActivo(location.pathname);
  const esInicio = location.pathname === "/app" || location.pathname === "/app/";
  const esModoLeccion = esRutaModoLeccion(location.pathname);
  const esDetalleTema = /^\/app\/temas\/[^/]+\/?$/.test(location.pathname);
  const pageHeader = esInicio ? DEFAULT_HEADER : getPageHeaderInfo(location.pathname) ?? DEFAULT_HEADER;

  const navigateTo = (id: string) => {
    const destino = navegacionMovil.find((opcion) => opcion.id === id)?.to ?? "/app";
    navigate({ to: destino as never });
  };

  return {
    isOffline,
    handleLogout,
    opcionesBottomNav,
    activoMovil,
    navigateTo,
    pageHeader,
    path: location.pathname,
    esInicio,
    esModoLeccion,
    esDetalleTema,
  };
}

function getPageHeaderInfo(path: string): PageHeaderInfo | undefined {
  const basePath = Object.keys(PAGE_HEADER_MAP).find((key) => path.startsWith(key));
  return basePath ? PAGE_HEADER_MAP[basePath]! : undefined;
}
