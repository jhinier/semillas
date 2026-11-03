import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  CircleUserRound,
  Download,
  LogOut,
  Medal,
  RefreshCw,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/componentes/ui/card-base";

type AppAccountMenuProps = {
  nombreVisible: string;
  nivelTexto: string;
  avatarUrl: string;
  onLogout: () => void | Promise<void>;
  rol?: string;
};

type OpcionCuenta = {
  to: "/app/perfil" | "/app/logros" | "/app/descargas" | "/app/sincronizacion" | "/admin";
  label: string;
  Icono: LucideIcon;
  search?: { seccion: "ajustes" };
};

export const OPCIONES_CUENTA: OpcionCuenta[] = [
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
];

export function AppAccountMenu({ nombreVisible, nivelTexto, avatarUrl, onLogout, rol }: AppAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opciones: OpcionCuenta[] = rol === "administrador"
    ? [{ to: "/admin", label: "Panel Administrador", Icono: ShieldCheck }, ...OPCIONES_CUENTA]
    : OPCIONES_CUENTA;

  const closeMenu = () => {
    setIsOpen(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    animationRef.current = setTimeout(() => {
      setIsRendered(false);
    }, 180);
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
      return;
    }

    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    setIsRendered(true);
    requestAnimationFrame(() => setIsOpen(true));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const renderIcono = (Icono: LucideIcon, className?: string) => (
    <Icono size={18} aria-hidden="true" className={className} />
  );

  return (
    <div ref={menuRef} className="account-menu-desktop relative">
      <button
        type="button"
        className="inline-flex min-h-11 flex-row items-center gap-3 rounded-full border-0 bg-transparent px-2 py-1 text-left transition-colors hover:bg-slate-100/80 md:rounded-none md:border-l md:border-[#e5e7eb] md:pl-4 md:pr-1 md:hover:bg-transparent cursor-pointer"
        aria-label="Abrir menú de cuenta"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#2E9E5B] bg-orange-100 shadow-sm">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="block h-full w-full max-h-10 max-w-10 object-cover object-center"
          />
        </div>
        <div className="hidden min-w-0 flex-col justify-center text-left leading-tight md:flex">
          <span className="truncate text-[13.6px] font-extrabold text-violet-700 leading-tight">
            {nombreVisible}
          </span>
          <span className="truncate text-xs font-semibold text-slate-500 leading-tight mt-0.5">
            {nivelTexto}
          </span>
        </div>
      </button>

      {isRendered && (
        <Card
          role="menu"
          aria-label="Menú de cuenta"
          sombra="lg"
          className={`account-menu absolute right-0 top-full z-[160] mt-2 w-60 origin-top-right rounded-2xl border border-[#e5e7eb] p-2 transition-all duration-200 ease-out motion-reduce:transition-none before:content-[''] before:absolute before:-top-1.5 before:right-6 before:w-3 before:h-3 before:bg-white before:rotate-45 before:border-l before:border-t before:border-[#e5e7eb] ${
            isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
        >
          {opciones.map((opcion) => {
            const Icono = opcion.Icono;
            return (
              <Link
                key={`${opcion.to}-${opcion.label}`}
                to={opcion.to}
                search={opcion.search}
                role="menuitem"
                onClick={closeMenu}
                className="account-menu__item flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutro transition-colors hover:bg-black/5 hover:text-neutro-oscuro-max cursor-pointer"
              >
                <span className="account-menu__icon flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef6f1] text-[#2e9e5b]">
                  {renderIcono(Icono)}
                </span>
                {opcion.label}
              </Link>
            );
          })}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeMenu();
              void onLogout();
            }}
            className="account-menu__item account-menu__item--danger mt-1 flex w-full items-center gap-3 rounded-xl border-t border-black/5 px-3 py-2 pt-2.5 text-sm font-semibold text-peligro transition-colors hover:bg-red-500/10 cursor-pointer"
          >
            <span className="account-menu__icon flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-peligro">
              {renderIcono(LogOut)}
            </span>
            Cerrar sesión
          </button>
        </Card>
      )}
    </div>
  );
}
