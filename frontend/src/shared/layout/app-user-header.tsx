import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AppAccountMenu } from "./app-account-menu";
import { AppAccountMenuMobile } from "./app-account-menu-mobile";
import logoImg from "@/assets/images/logos/Logotipo.webp";
import { BotonTemaToggle } from "@/componentes/ui/boton-tema-toggle";
import "./app-account-menu-mobile.css";

type AppUserHeaderProps = {
  title: string;
  subtitle: string;
  nombreVisible: string;
  nivelTexto: string;
  avatarUrl: string;
  onLogout: () => void;
  isOffline: boolean;
  esInicio?: boolean;
};

export function AppUserHeader({
  title,
  subtitle,
  nombreVisible,
  nivelTexto,
  avatarUrl,
  onLogout,
  isOffline,
  esInicio = false,
}: AppUserHeaderProps) {
  const [cuentaAbierta, setCuentaAbierta] = useState(false);

  return (
    <header
      className={`app-user-header ${esInicio ? "app-user-header--home" : ""}`}
      aria-label="Encabezado de la pantalla"
    >
      <div className="app-user-header__desktop-row">
        <div className="app-user-header__page-copy">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-4">
          <BotonTemaToggle />
          <AppAccountMenu
            nombreVisible={nombreVisible}
            nivelTexto={nivelTexto}
            avatarUrl={avatarUrl}
            onLogout={onLogout}
          />
        </div>
      </div>

      <div className="app-user-header__mobile-row">
        <Link to="/app" className="app-user-header__mobile-brand" aria-label="Ir al inicio">
          <img src={logoImg} alt="Semillas" className="app-user-header__logo" />
        </Link>

        <h1 className="app-user-header__mobile-title">{title}</h1>

        <button
          type="button"
          className="app-user-header__mobile-avatar"
          aria-label="Abrir menú de cuenta"
          aria-expanded={cuentaAbierta}
          aria-haspopup="dialog"
          onClick={() => setCuentaAbierta(true)}
        >
          <span className="app-user-header__mobile-avatar-circle">
            <img src={avatarUrl} alt="" />
          </span>
        </button>
      </div>

      <AppAccountMenuMobile
        visible={cuentaAbierta}
        onCerrar={() => setCuentaAbierta(false)}
        onCerrarSesion={onLogout}
      />

      {isOffline ? (
        <div className="app-user-header__offline" role="status">
          Estás sin conexión. Tu progreso se sincronizará cuando vuelva internet.
        </div>
      ) : null}
    </header>
  );
}
