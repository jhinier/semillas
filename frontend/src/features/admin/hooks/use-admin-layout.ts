import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { sessionStorageApi } from "@/shared/api/session";
import { cerrarSesionAutenticada } from "@/shared/auth/supabase";

type AdminHeaderInfo = {
  titulo: string;
  subtitulo: string;
};

const ADMIN_HEADER_MAP: Array<{ match: (path: string) => boolean; info: AdminHeaderInfo }> = [
  {
    match: (path) => path === "/admin" || path === "/admin/",
    info: {
      titulo: "Panel de administración",
      subtitulo: "Supervisa el contenido, la comunidad y las métricas generales de Semillas.",
    },
  },
  {
    match: (path) => path.includes("/admin/temas"),
    info: {
      titulo: "Gestión de temas",
      subtitulo: "Crea, edita y organiza las lecciones y sus pasos CRECER.",
    },
  },
  {
    match: (path) => path.includes("/admin/actividades"),
    info: {
      titulo: "Banco de actividades",
      subtitulo: "Configura retos, preguntas y ejercicios interactivos por franja de edad.",
    },
  },
  {
    match: (path) => path.includes("/admin/sendas"),
    info: {
      titulo: "Sendas de aprendizaje",
      subtitulo: "Administra las rutas temáticas y su identidad visual.",
    },
  },
  {
    match: (path) => path.includes("/admin/usuarios"),
    info: {
      titulo: "Usuarios y roles",
      subtitulo: "Consulta cuentas registradas, permisos y actividad en la plataforma.",
    },
  },
  {
    match: (path) => path.includes("/admin/logros"),
    info: {
      titulo: "Catálogo de insignias",
      subtitulo: "Define logros, criterios de desbloqueo y recompensas de experiencia.",
    },
  },
  {
    match: (path) => path.includes("/admin/clubes"),
    info: {
      titulo: "Clubes y retos",
      subtitulo: "Modera grupos comunitarios, membresías y desafíos cooperativos.",
    },
  },
  {
    match: (path) => path.includes("/admin/medios"),
    info: {
      titulo: "Biblioteca multimedia",
      subtitulo: "Sube y administra imágenes, audios y recursos de apoyo.",
    },
  },
  {
    match: (path) => path.includes("/admin/revision"),
    info: {
      titulo: "Cola de revisión",
      subtitulo: "Revisa y aprueba el contenido antes de publicarlo.",
    },
  },
  {
    match: (path) => path.includes("/admin/reportes"),
    info: {
      titulo: "Reportes y analítica",
      subtitulo: "Explora el avance por sendas, edades y participación.",
    },
  },
  {
    match: (path) => path.includes("/admin/ajustes"),
    info: {
      titulo: "Ajustes del sistema",
      subtitulo: "Configura parámetros generales de la plataforma.",
    },
  },
];

function getPageHeaderInfo(path: string): AdminHeaderInfo {
  const encontrado = ADMIN_HEADER_MAP.find((entry) => entry.match(path));
  return (
    encontrado?.info ?? {
      titulo: "Administración",
      subtitulo: "Panel de gestión de Semillas.",
    }
  );
}

export function useAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activePage = location.pathname;

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
    sessionStorageApi.clearAllSession();
    try {
      await Promise.race([
        cerrarSesionAutenticada(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
    } catch {
      sessionStorageApi.clearAllSession();
    }
    window.location.assign("/login");
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
