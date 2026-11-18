import * as React from "react";
import { BookOpen, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { EmailAuthForm } from "./email-auth-form";
import { SocialLoginButton } from "./social-login-button";
import googleIcon from "@/assets/images/icons/google.webp";
import facebookIcon from "@/assets/images/icons/facebook.webp";
import guestIcon from "@/assets/images/icons/invitado.webp";

export interface LoginFormCardProps {
  onGoogleClick: () => void;
  onFacebookClick: () => void;
  onGuestClick: () => void;
  googlePending?: boolean;
  facebookPending?: boolean;
  guestPending?: boolean;
  guestError?: boolean;
  guestErrorMessage?: string;
  onEmailSuccess: () => void;
  tabActivo: "social" | "email";
  onCambiarTab: (tab: "social" | "email") => void;
  facebookDisponible: boolean;
  googleDisponible?: boolean;
}

export const LoginFormCard: React.FC<LoginFormCardProps> = ({
  onGoogleClick,
  onFacebookClick,
  onGuestClick,
  googlePending,
  facebookPending,
  guestPending,
  guestError,
  guestErrorMessage,
  onEmailSuccess,
  tabActivo,
  onCambiarTab,
  facebookDisponible,
  googleDisponible = true,
}) => {
  return (
    <section className="login-panel login-panel--form" aria-label="Opciones de inicio de sesión">
      <div className="login-form-wrapper">
        <div className="login-welcome">
          <span className="login-welcome__eyebrow">Tu aventura comienza aquí</span>
          <h1 className="login-welcome__title">Bienvenido a Semillas</h1>
          <p className="login-welcome__subtitle">
            Inicia sesión para continuar tu aventura de fe y aprendizaje.
          </p>
        </div>

        <div className="login-tabs" role="tablist" aria-label="Métodos de acceso">
          <button
            type="button"
            role="tab"
            aria-selected={tabActivo === "social"}
            className={`login-tab ${tabActivo === "social" ? "is-active" : ""}`}
            onClick={() => onCambiarTab("social")}
          >
            Redes sociales
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tabActivo === "email"}
            className={`login-tab ${tabActivo === "email" ? "is-active" : ""}`}
            onClick={() => onCambiarTab("email")}
          >
            Correo electrónico
          </button>
        </div>

        {tabActivo === "social" && (
          <div className="login-social" role="group" aria-label="Opciones de acceso">
            {googleDisponible && (
              <SocialLoginButton
                tipo="google"
                logo={googleIcon}
                label="Continuar con Google"
                onClick={onGoogleClick}
                isPending={googlePending}
              />
            )}

            {facebookDisponible && (
              <SocialLoginButton
                tipo="facebook"
                logo={facebookIcon}
                label="Continuar con Facebook"
                onClick={onFacebookClick}
                isPending={facebookPending}
              />
            )}

            <div className="login-divider" role="separator" aria-hidden="true">
              <span className="login-divider__line"></span>
              <span className="login-divider__label">o explora sin cuenta</span>
              <span className="login-divider__line"></span>
            </div>

            <SocialLoginButton
              tipo="guest"
              logo={guestIcon}
              label="Jugar como invitado"
              guestNote="Explora sin cuenta. Tu progreso no se guardará."
              onClick={onGuestClick}
              isPending={guestPending}
            />

            {guestError && (
              <p className="login-feedback login-feedback--error">
                {guestErrorMessage ?? "No se pudo crear el invitado. Asegúrate de que el backend esté activo."}
              </p>
            )}
          </div>
        )}

        {tabActivo === "email" && <EmailAuthForm onSuccess={onEmailSuccess} />}

        <div className="login-mobile-highlights" aria-label="Características de Semillas">
          <span>
            <ShieldCheck size={15} aria-hidden="true" />
            Contenido seguro
          </span>
          <span>
            <Sparkles size={15} aria-hidden="true" />
            Aprende jugando
          </span>
          <span>
            <BookOpen size={15} aria-hidden="true" />
            Basada en la Biblia
          </span>
        </div>

        <p className="login-mobile-privacy">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>Tu información está protegida.</span>
        </p>
      </div>
    </section>
  );
};
