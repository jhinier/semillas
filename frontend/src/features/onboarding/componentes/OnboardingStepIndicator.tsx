import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";

interface OnboardingStepIndicatorProps {
  pasoActual: number;
}

export function OnboardingStepIndicator({ pasoActual }: OnboardingStepIndicatorProps) {
  const navigate = useNavigate();

  return (
    <div
      className="customize-stepper"
      role="progressbar"
      aria-label="Progreso del registro"
      aria-valuemin={1}
      aria-valuemax={2}
      aria-valuenow={pasoActual}
    >
      <button
        type="button"
        className="customize-stepper__item customize-stepper__item--complete"
        onClick={() => navigate({ to: "/onboarding" })}
        aria-label="Volver al paso 1: Tu edad"
      >
        <span className="customize-stepper__number">
          <Check size={15} strokeWidth={3} aria-hidden="true" />
        </span>
        <span>Tu edad</span>
      </button>

      <div className="customize-stepper__item customize-stepper__item--current" aria-current="step">
        <span className="customize-stepper__number">2</span>
        <span className="customize-stepper__label-long">Tu información</span>
        <span className="customize-stepper__label-short">Perfil</span>
      </div>
    </div>
  );
}
