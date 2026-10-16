import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";

interface FormNavigationProps {
  onBack: () => void;
  onFinish: () => void;
  isEnabled: boolean;
  isLoading: boolean;
  hasError?: boolean;
}

export function FormNavigation({
  onBack,
  onFinish,
  isEnabled,
  isLoading,
  hasError = false,
}: FormNavigationProps) {
  return (
    <footer className="customize-actions">
      {hasError && (
        <p className="customize-actions__error" role="alert">
          No pudimos guardar tu perfil. Inténtalo nuevamente.
        </p>
      )}

      <div className="customize-actions__row">
        <button type="button" onClick={onBack} className="customize-actions__back">
          <ArrowLeft size={19} aria-hidden="true" />
          <span>Atrás</span>
        </button>

        <button
          type="button"
          onClick={onFinish}
          disabled={!isEnabled || isLoading}
          className="customize-actions__finish"
        >
          {isLoading ? (
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight size={20} aria-hidden="true" />
          )}
          <span>{isLoading ? "Guardando..." : "Finalizar"}</span>
        </button>
      </div>
    </footer>
  );
}
