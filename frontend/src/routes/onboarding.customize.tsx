import { createFileRoute } from "@tanstack/react-router";
import { OnboardingTopbar } from "../features/onboarding/componentes/OnboardingTopbar";
import { OnboardingStepIndicator } from "../features/onboarding/componentes/OnboardingStepIndicator";
import { NicknameField } from "../features/onboarding/componentes/NicknameField";
import { AvatarSelector } from "../features/onboarding/componentes/AvatarSelector";
import { FormNavigation } from "../features/onboarding/componentes/FormNavigation";
import { ProfilePreview } from "../features/onboarding/componentes/ProfilePreview";
import { HelpModal } from "../features/onboarding/componentes/HelpModal";
import { useCustomizePage } from "../features/onboarding/hooks/use-customize-page";
import "./onboarding-customize.css";

export const Route = createFileRoute("/onboarding/customize")({
  component: CustomizePage,
});

function CustomizePage() {
  const {
    nickname,
    setNickname,
    selectedAvatar,
    setSelectedAvatar,
    isHelpOpen,
    setIsHelpOpen,
    handleFinish,
    isButtonEnabled,
    actualizarPerfilMutation,
    navigateToBack,
  } = useCustomizePage();

  return (
    <div className="onboarding-customize-page">
      <OnboardingTopbar onHelpClick={() => setIsHelpOpen(true)} />
      <main className="onboarding-customize-main">
        <section className="onboarding-customize-card" aria-labelledby="customize-title">
          <div className="onboarding-customize-scroll">
            <header className="onboarding-customize-header">
              <span className="onboarding-customize-kicker">Paso 2 de 2</span>
              <h1 id="customize-title">Crea tu perfil</h1>
              <p>Cuéntanos un poco sobre ti para personalizar tu experiencia en Semillas.</p>
            </header>

            <OnboardingStepIndicator pasoActual={2} />
            <NicknameField value={nickname} onChange={setNickname} />
            <AvatarSelector selectedAvatar={selectedAvatar} onSelect={setSelectedAvatar} />
          </div>

          <FormNavigation
            onBack={navigateToBack}
            onFinish={handleFinish}
            isEnabled={isButtonEnabled}
            isLoading={actualizarPerfilMutation.isPending}
            hasError={actualizarPerfilMutation.isError}
          />
        </section>

        <ProfilePreview selectedAvatar={selectedAvatar} nickname={nickname} />
      </main>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
