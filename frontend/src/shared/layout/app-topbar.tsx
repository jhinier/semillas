import { useQuery } from "@tanstack/react-query";
import { Boton } from "@/componentes/ui/boton";
import { AppAccountMenu } from "./app-account-menu";
import { obtenerMiPerfil } from "../../features/perfil/profile.api";

import type { Perfil, Usuario } from "@/shared/api/api";
import { MAPA_AVATARES } from "@/shared/constants/avatares";

type AppTopbarProps = {
  title: string;
  subtitle: string;
  onOpenSidebar: () => void;
  onLogout: () => void;
  showMenuButton?: boolean;
};

export function obtenerDatosCuentaTopbar(perfil?: Perfil, usuario?: Usuario) {
  const esInvitado = usuario?.proveedor === "invitado";
  const nombre = perfil?.apodo || usuario?.nombre_visible || "Semillero";
  const nivelTexto = esInvitado ? "Invitado" : usuario?.correo || "Cuenta registrada";
  const avatarUrl = MAPA_AVATARES[perfil?.url_avatar || "1"] || MAPA_AVATARES["1"] || "";

  return { nombre, nivelTexto, avatarUrl };
}

export function AppTopbar({
  title,
  subtitle,
  onOpenSidebar,
  onLogout,
  showMenuButton = true,
}: AppTopbarProps) {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
    staleTime: 1000 * 60 * 5,
  });

  const cuenta = obtenerDatosCuentaTopbar(meQuery.data?.perfil, meQuery.data?.usuario);

  return (
    <header className="app-topbar">
      {showMenuButton ? (
        <Boton
          type="button"
          variante="texto"
          tamano="icon-lg"
          className="app-topbar__menu"
          aria-label="Abrir menú principal"
          onClick={onOpenSidebar}
        >
          <i className="fa-solid fa-bars" aria-hidden="true" />
        </Boton>
      ) : (
        <span className="app-topbar__mobile-spacer" aria-hidden="true" />
      )}

      <div className="app-topbar__heading">
        <span className="app-topbar__seed" aria-hidden="true">🌱</span>
        <div className="min-w-0">
          <h1 className="app-topbar__title">{title}</h1>
          {subtitle ? <p className="app-topbar__subtitle">{subtitle}</p> : null}
        </div>
      </div>

      <div className="app-topbar__account">
        <AppAccountMenu
          nombreVisible={cuenta.nombre}
          nivelTexto={cuenta.nivelTexto}
          avatarUrl={cuenta.avatarUrl}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
