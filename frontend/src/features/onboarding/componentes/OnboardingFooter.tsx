import { ArrowRight } from "lucide-react";

interface OnboardingFooterProps {
  deshabilitado: boolean;
  onContinuar: () => void;
}

export function OnboardingFooter({ deshabilitado, onContinuar }: OnboardingFooterProps) {
  return (
    <div className="onboarding-age-footer">
      <button
        type="button"
        className="onboarding-age-footer__button"
        onClick={onContinuar}
        disabled={deshabilitado}
      >
        <span>{deshabilitado ? "Selecciona una opción" : "Continuar"}</span>
        <ArrowRight size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
