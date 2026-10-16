import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AvatarSelector } from "@/features/onboarding/componentes/AvatarSelector";
import { FormNavigation } from "@/features/onboarding/componentes/FormNavigation";
import { NicknameField } from "@/features/onboarding/componentes/NicknameField";
import { OnboardingStepIndicator } from "@/features/onboarding/componentes/OnboardingStepIndicator";
import { OnboardingTopbar } from "@/features/onboarding/componentes/OnboardingTopbar";
import { ProfilePreview } from "@/features/onboarding/componentes/ProfilePreview";
import { StoryRouter } from "@/storybook/story-router";
import "@/routes/onboarding-customize.css";

function CustomizeStory({ loading = false, error = false }: { loading?: boolean; error?: boolean }) {
  const [nickname, setNickname] = useState("Andres");
  const [avatar, setAvatar] = useState(1);

  return (
    <StoryRouter initialPath="/onboarding/customize">
      <div className="onboarding-customize-page">
        <OnboardingTopbar onHelpClick={() => undefined} />
        <main className="onboarding-customize-main">
          <section className="onboarding-customize-card">
            <div className="onboarding-customize-scroll">
              <header className="onboarding-customize-header">
                <span className="onboarding-customize-kicker">Paso 2 de 2</span>
                <h1>Crea tu perfil</h1>
                <p>Cuéntanos un poco sobre ti para personalizar tu experiencia en Semillas.</p>
              </header>
              <OnboardingStepIndicator pasoActual={2} />
              <NicknameField value={nickname} onChange={setNickname} />
              <AvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />
            </div>
            <FormNavigation
              onBack={() => undefined}
              onFinish={() => undefined}
              isEnabled={nickname.trim().length > 0}
              isLoading={loading}
              hasError={error}
            />
          </section>
          <ProfilePreview selectedAvatar={avatar} nickname={nickname} />
        </main>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/Onboarding/Personalizar perfil",
  component: CustomizeStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CustomizeStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Escritorio: Story = {};
export const MovilApp: Story = {
  globals: { viewport: { value: "movilApp", isRotated: false } },
};
export const Guardando: Story = {
  args: { loading: true },
};
export const Error: Story = {
  args: { error: true },
};
