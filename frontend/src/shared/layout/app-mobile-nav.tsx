import { Award, Home, PlayCircle, UserRound, Users } from "lucide-react";
import type { ReactNode } from "react";

export type MobileNavItem = {
  id: string;
  etiqueta: string;
  icono: ReactNode;
  to: string;
};

export function obtenerNavegacionMovil(): MobileNavItem[] {
  return [
    { id: "inicio", etiqueta: "Inicio", icono: <Home className="size-5" />, to: "/app" },
    { id: "jugar", etiqueta: "Jugar", icono: <PlayCircle className="size-5" />, to: "/app/temas" },
    { id: "clubes", etiqueta: "Clubes", icono: <Users className="size-5" />, to: "/app/clubes" },
    { id: "logros", etiqueta: "Logros", icono: <Award className="size-5" />, to: "/app/logros" },
    { id: "perfil", etiqueta: "Perfil", icono: <UserRound className="size-5" />, to: "/app/perfil" },
  ];
}

export function obtenerNavMovilActivo(pathname: string): string {
  if (
    pathname.startsWith("/app/temas") ||
    pathname.startsWith("/app/C_") ||
    pathname.startsWith("/app/E_") ||
    pathname.startsWith("/app/R_")
  ) {
    return "jugar";
  }
  if (pathname === "/app" || pathname === "/app/") return "inicio";
  if (pathname.startsWith("/app/clubes")) return "clubes";
  if (pathname.startsWith("/app/logros")) return "logros";
  if (pathname.startsWith("/app/perfil")) return "perfil";
  return "inicio";
}
