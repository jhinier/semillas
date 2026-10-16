import { Link } from "@tanstack/react-router";
import {
  CircleUserRound,
  Download,
  LogOut,
  Medal,
  RefreshCw,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { Boton } from "@/componentes/ui/boton";

type OpcionCuenta = {
  to: "/app/perfil" | "/app/logros" | "/app/descargas" | "/app/sincronizacion" | "/login";
  label: string;
  Icono: LucideIcon;
  search?: { seccion: "ajustes" };
  cerrarSesion?: boolean;
};

export const OPCIONES_CUENTA_MOVIL: OpcionCuenta[] = [
  { to: "/app/perfil", label: "Mi perfil", Icono: CircleUserRound },
  {
    to: "/app/perfil",
    label: "Preferencias",
    Icono: Settings,
    search: { seccion: "ajustes" },
  },
  { to: "/app/logros", label: "Mis insignias", Icono: Medal },
  { to: "/app/descargas", label: "Descargas", Icono: Download },
  { to: "/app/sincronizacion", label: "Sincronización", Icono: RefreshCw },
  {
    to: "/login",
    label: "Cerrar sesión",
    Icono: LogOut,
    cerrarSesion: true,
  },
];

export function AppAccountMenuMobile({
  visible,
  onCerrar,
  onCerrarSesion,
}: {
  visible: boolean;
  onCerrar: () => void;
  onCerrarSesion: () => void | Promise<void>;
}) {
  if (!visible) return null;

  const renderIcono = (Icono: LucideIcon) => <Icono size={20} aria-hidden="true" />;

  return (
    <div
      className="account-sheet-backdrop"
      role="presentation"
      onClick={onCerrar}
    >
      <div
        className="account-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cuenta-sheet-title"
        aria-label="Menú de cuenta"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="cuenta-sheet-title" className="cuenta-sheet__title">
          Sesión de tu cuenta
        </h2>
        <div className="account-sheet__handle" aria-hidden="true" />

        <div className="account-sheet__list">
          {OPCIONES_CUENTA_MOVIL.map((opcion) => {
            const contenidoIcono = renderIcono(opcion.Icono);
            return opcion.cerrarSesion ? (
              <button
                key={opcion.label}
                type="button"
                className="account-sheet__action is-danger"
                onClick={async () => {
                  onCerrar();
                  await onCerrarSesion();
                }}
              >
                <span className="account-sheet__icon">{contenidoIcono}</span>
                <span>{opcion.label}</span>
              </button>
            ) : (
              <Link
                key={opcion.label}
                to={opcion.to}
                search={opcion.search}
                onClick={onCerrar}
                className="account-sheet__action"
              >
                <span className="account-sheet__icon">{contenidoIcono}</span>
                <span>{opcion.label}</span>
              </Link>
            );
          })}
        </div>

        <Boton variante="contorno" tamano="mediano" anchoCompleto onClick={onCerrar}>
          Cancelar
        </Boton>
      </div>
    </div>
  );
}
