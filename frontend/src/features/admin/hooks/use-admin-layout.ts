import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { sessionStorageApi } from "@/shared/api/session";
import { cerrarSesionAutenticada } from "@/shared/auth/supabase";

type PageHeaderInfo = {
  titulo: string;
  subtitulo: string;
};

const PAGE_HEADER_MAP: Record<string, PageHeaderInfo> = {
  "": {
    titulo: "Panel de administración",
    subtitulo: "Resumen general del contenido, actividad y revisión.",
  },
  "/admin/temas/new": {
    titulo: "Crear nuevo tema",
    subtitulo: "Crea un tema que inspire y guíe a los niños en su crecimiento espiritual.",
  },
  "/admin/medios": {
    titulo: "Panel de administración",
    subtitulo: "Gestiona los recursos multimedia de la plataforma.",
  },
  "/admin/usuarios": {
    titulo: "Administración de usuarios",
    subtitulo: "Administra cuentas, roles y participación dentro de la plataforma.",
  },
  "/admin/logros": {
    titulo: "Administración de logros",
    subtitulo: "Gestiona reconocimientos, criterios y recompensas XP.",
  },
  "/admin/clubes": {
    titulo: "Administración de clubes",
    subtitulo: "Gestiona responsables, miembros y retos cooperativos.",
  },
  "/admin/actividades": {
    titulo: "Panel de administración",
    subtitulo: "Gestiona, edita y publica las actividades de Semillas.",
  },
  "/admin/temas": {
    titulo: "Panel de administración",
    subtitulo: "Gestiona, edita y publica las lecciones de Semillas.",
  },
};

const DEFAULT_HEADER: PageHeaderInfo = {
  titulo: "Panel de Control",
  subtitulo: "Estadísticas y resumen de la plataforma.",
};

const CRECER_HEADER: PageHeaderInfo = {
  titulo: "Editor CRECER",
  subtitulo: "Edita los seis momentos de la metodología CRECER.",
};

const ACTIVITIES_HEADER: PageHeaderInfo = {
  titulo: "Actividades",
  subtitulo: "Gestiona las actividades interactivas del tema.",
};

const PREVIEW_HEADER: PageHeaderInfo = {
  titulo: "Vista previa",
  subtitulo: "Previsualiza cómo verá la lección el alumno.",
};

const EMPTY_HEADER: PageHeaderInfo = { titulo: "", subtitulo: "" };

export function useAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePage = location.pathname.replace(/\/$/, "") || "";

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await cerrarSesionAutenticada();
    sessionStorageApi.clearGuestSession();
    navigate({ to: "/login", search: { redirect: "/onboarding" } });
  };

  const pageHeader = getPageHeaderInfo(activePage);

  return {
    sidebarOpen,
    closeSidebar,
    openSidebar,
    handleLogout,
    activePage,
    pageHeader,
  };
}

function getPageHeaderInfo(activePage: string): PageHeaderInfo {
  if (activePage.includes("/crecer")) return CRECER_HEADER;
  if (activePage.includes("/activities") && !activePage.includes("/admin/actividades")) {
    return ACTIVITIES_HEADER;
  }
  if (activePage.includes("/preview")) return PREVIEW_HEADER;
  if (activePage.includes("/detalle") || activePage.includes("/edit")) return EMPTY_HEADER;

  const exact = PAGE_HEADER_MAP[activePage];
  if (exact) return exact;

  const basePath = "/" + activePage.split("/").slice(1, 3).join("/");
  return PAGE_HEADER_MAP[basePath] ?? DEFAULT_HEADER;
}
