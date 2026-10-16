import * as React from "react";
import { LoaderCircle } from "lucide-react";

export interface SocialLoginButtonProps {
  onClick?: () => void;
  logo: string;
  label: string;
  tipo: "google" | "facebook" | "guest";
  guestNote?: string;
  disabled?: boolean;
  isPending?: boolean;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  onClick,
  logo,
  label,
  tipo,
  guestNote,
  disabled,
  isPending,
}) => {
  const isDisabled = disabled || isPending;
  const textoCargando = tipo === "facebook" ? "Conectando con Facebook..." : "Conectando con Google...";

  if (tipo === "guest") {
    return (
      <button
        type="button"
        className={`login-social__btn login-social__btn--guest ${isDisabled ? "is-disabled" : ""}`}
        onClick={onClick}
        disabled={isDisabled}
      >
        <div className="login-social__guest-icon-wrap">
          <img src={logo} alt="" className="login-social__icon login-social__icon--guest" width="32" height="32" />
        </div>
        <div className="login-social__guest-text">
          <span className="login-social__guest-title">{isPending ? "Entrando..." : label}</span>
          {guestNote && <span className="login-social__guest-note">{guestNote}</span>}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`login-social__btn login-social__btn--${tipo} ${isDisabled ? "is-disabled" : ""}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {isPending ? (
        <LoaderCircle className="login-social__icon animate-spin text-green-600" size={22} />
      ) : (
        <img src={logo} alt="" className="login-social__icon" width="22" height="22" />
      )}
      <span>{isPending ? textoCargando : label}</span>
    </button>
  );
};
