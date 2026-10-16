import { HelpCircle } from "lucide-react";
import logoImg from "@/assets/images/logos/Logotipo.webp";
import { BotonTemaToggle } from "@/componentes/ui/boton-tema-toggle";

interface OnboardingTopbarProps {
  onHelpClick: () => void;
}

export function OnboardingTopbar({ onHelpClick }: OnboardingTopbarProps) {
  return (
    <header className="onboarding-topbar">
      <a href="/" className="onboarding-brand" aria-label="Ir al inicio de Semillas">
        <img
          src={logoImg}
          alt="Logo de Semillas"
          className="onboarding-brand__logo"
          width="56"
          height="56"
        />
        <div className="onboarding-brand__copy">
          <span className="onboarding-brand__title">Semillas</span>
          <span className="onboarding-brand__tagline">Crecer en la Palabra, vivir Su verdad</span>
        </div>
      </a>

      <div className="flex items-center gap-2">
        <BotonTemaToggle />
        <button
          type="button"
          onClick={onHelpClick}
          className="onboarding-help-button"
          aria-label="Abrir ayuda"
        >
          <HelpCircle size={20} aria-hidden="true" />
          <span className="onboarding-help-button__label">Ayuda</span>
        </button>
      </div>
    </header>
  );
}
