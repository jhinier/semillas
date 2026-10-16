import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { GrupoEdadGrid } from "@/features/onboarding/componentes/GrupoEdadGrid";
import { OnboardingFooter } from "@/features/onboarding/componentes/OnboardingFooter";
import { OnboardingTopbar } from "@/features/onboarding/componentes/OnboardingTopbar";
import { useOnboardingPage } from "@/features/onboarding/hooks/use-onboarding-page";

export const Route = createFileRoute("/onboarding/")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const {
    selectedGroupId,
    setSelectedGroupId,
    isHelpOpen,
    setIsHelpOpen,
    ageGroupsQuery,
    data,
    handleContinue,
  } = useOnboardingPage();

  return (
    <div className="onboarding-age-page">
      <OnboardingTopbar onHelpClick={() => setIsHelpOpen(true)} />

      <main className="onboarding-age-main">
        <section className="onboarding-age-hero" aria-labelledby="onboarding-age-title">
          <span className="onboarding-age-hero__eyebrow">Paso 1 de 2</span>
          <h1 id="onboarding-age-title" className="onboarding-age-hero__title">
            Elige tu franja de edad
          </h1>
          <p className="onboarding-age-hero__copy">
            Adaptaremos las historias y actividades a tu etapa. Podrás cambiarla después.
          </p>
        </section>

        <div className="onboarding-age-stepper" aria-label="Progreso del registro">
          <div className="onboarding-age-step is-active" aria-current="step">
            <span className="onboarding-age-step__number">1</span>
            <span>Tu edad</span>
          </div>
          <div className="onboarding-age-step">
            <span className="onboarding-age-step__number">2</span>
            <span>Tu información</span>
          </div>
        </div>

        <GrupoEdadGrid
          grupos={data}
          seleccionadoId={selectedGroupId}
          onSelect={setSelectedGroupId}
          cargando={ageGroupsQuery.isLoading}
        />

        <OnboardingFooter deshabilitado={!selectedGroupId} onContinuar={handleContinue} />
      </main>

      {isHelpOpen && (
        <div className="onboarding-help-overlay" onClick={() => setIsHelpOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-help-title"
            className="onboarding-help-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="onboarding-help-dialog__handle" aria-hidden="true" />
            <div className="onboarding-help-dialog__header">
              <div>
                <span className="onboarding-help-dialog__eyebrow">Personalización</span>
                <h2 id="onboarding-help-title">¿Por qué elegir tu edad?</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="onboarding-help-dialog__close"
                aria-label="Cerrar ayuda"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="onboarding-help-dialog__body">
              <p>
                Usamos tu franja de edad para adaptar el lenguaje, las historias y la dificultad
                de las actividades a tu etapa de aprendizaje.
              </p>
              <p>
                No te preocupes: podrás cambiar esta preferencia más adelante desde tu perfil.
              </p>
            </div>
            <button
              type="button"
              className="onboarding-help-dialog__action"
              onClick={() => setIsHelpOpen(false)}
            >
              Entendido
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
