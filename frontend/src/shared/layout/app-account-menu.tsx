import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
import { Card } from "@/componentes/ui/card-base";

type AppAccountMenuProps = {
  nombreVisible: string;
  nivelTexto: string;
  avatarUrl: string;
  onLogout: () => void | Promise<void>;
};

type OpcionCuenta = {
  to: "/app/perfil" | "/app/logros" | "/app/descargas" | "/app/sincronizacion";
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

export function AppAccountMenu({ nombreVisible, nivelTexto, avatarUrl, onLogout }: AppAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      <Boton
        type="button"
        variante="texto"
        className="flex min-h-11 items-center gap-2 rounded-full border-0 p-1 text-left hover:bg-slate-100 sm:gap-3 md:rounded-none md:border-l md:border-[#e5e7eb] md:pl-5 md:pr-0 md:hover:bg-transparent"
        aria-label="Abrir menú de cuenta"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={toggleMenu}
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-primario bg-orange-200">
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
        </div>
        <div className="hidden flex-col text-left md:flex">
          <span className="text-[13.6px] font-bold text-foreground">{nombreVisible}</span>
          <span className="text-xs text-neutro">{nivelTexto}</span>
        </div>
      </Boton>

      {isRendered && (
        <Card
          role="menu"
          aria-label="Menú de cuenta"
          sombra="lg"
          className={`account-menu absolute right-0 top-full z-[160] mt-2 w-60 origin-top-right rounded-2xl border border-[#e5e7eb] p-2 transition-all duration-200 ease-out motion-reduce:transition-none before:content-[''] before:absolute before:-top-1.5 before:right-6 before:w-3 before:h-3 before:bg-white before:rotate-45 before:border-l before:border-t before:border-[#e5e7eb] ${
            isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
          }`}
        >
          {OPCIONES_CUENTA.map((opcion) => {
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
            onClick={async () => {
              closeMenu();
              await onLogout();
            }}
            className="account-menu__item account-menu__item--danger flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 cursor-pointer"
          >
            <span className="account-menu__icon flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              {renderIcono(LogOut)}
            </span>
            Cerrar sesión
          </button>
        </Card>
      )}
    </div>
  );
}
