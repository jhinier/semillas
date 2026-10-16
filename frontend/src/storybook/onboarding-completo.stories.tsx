import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { GrupoEdad } from "@/shared/api/api";
import { AvatarSelector } from "@/features/onboarding/componentes/AvatarSelector";
import { FormNavigation } from "@/features/onboarding/componentes/FormNavigation";
import { GaleriaAvatares } from "@/features/onboarding/componentes/GaleriaAvatares";
import { GrupoEdadGrid } from "@/features/onboarding/componentes/GrupoEdadGrid";
import { HelpModal } from "@/features/onboarding/componentes/HelpModal";
import { NicknameField } from "@/features/onboarding/componentes/NicknameField";
import { OnboardingFooter } from "@/features/onboarding/componentes/OnboardingFooter";
import { OnboardingStepIndicator } from "@/features/onboarding/componentes/OnboardingStepIndicator";
import { OnboardingTopbar } from "@/features/onboarding/componentes/OnboardingTopbar";
import { ProfilePreview } from "@/features/onboarding/componentes/ProfilePreview";
import semillasImg from "@/assets/images/Ilustraciones/Semilla.webp";
import exploradoresImg from "@/assets/images/Ilustraciones/Exploradores.webp";
import embajadoresImg from "@/assets/images/Ilustraciones/Embajadores.webp";

const grupos: GrupoEdad[] = [
  { id: "semillas", codigo: "semillas", nombre: "Semillas", edad_minima: 5, edad_maxima: 7, descripcion: "Aprendizaje visual, breve y acompañado.", orden: 1, imagen_url: semillasImg },
  { id: "exploradores", codigo: "exploradores", nombre: "Exploradores", edad_minima: 8, edad_maxima: 11, descripcion: "Retos, historias y actividades para descubrir.", orden: 2, imagen_url: exploradoresImg },
  { id: "embajadores", codigo: "embajadores", nombre: "Embajadores", edad_minima: 12, edad_maxima: 15, descripcion: "Reflexión, liderazgo y servicio en comunidad.", orden: 3, imagen_url: embajadoresImg },
];

function FlujoOnboarding() {
  const [grupo, setGrupo] = useState("exploradores");
  const [avatar, setAvatar] = useState(4);
  const [avatarGaleria, setAvatarGaleria] = useState<string | null>("avatar4");
  const [nickname, setNickname] = useState("Luz");
  const [ayuda, setAyuda] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <OnboardingTopbar onHelpClick={() => setAyuda(true)} />
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-8">
        <OnboardingStepIndicator pasoActual={2} />
        <section className="mt-7">
          <h1 className="mb-2 text-center text-3xl font-black text-slate-900">Elige tu grupo</h1>
          <p className="mb-7 text-center text-slate-500">Así adaptaremos las actividades a tu etapa.</p>
          <GrupoEdadGrid grupos={grupos} seleccionadoId={grupo} onSelect={setGrupo} cargando={false} />
        </section>
        <section className="grid gap-8 rounded-[2rem] bg-white p-5 shadow-sm lg:grid-cols-[1fr_340px] lg:p-8">
          <div>
            <NicknameField value={nickname} onChange={setNickname} />
            <AvatarSelector selectedAvatar={avatar} onSelect={setAvatar} />
            <div className="mt-8 border-t border-slate-100 pt-7">
              <h2 className="mb-4 text-base font-black text-slate-800">Galería alternativa</h2>
              <GaleriaAvatares seleccionadoId={avatarGaleria} onSelect={setAvatarGaleria} />
            </div>
            <FormNavigation onBack={() => undefined} onFinish={() => undefined} isEnabled={nickname.trim().length >= 2} isLoading={false} />
          </div>
          <ProfilePreview selectedAvatar={avatar} nickname={nickname} />
        </section>
      </main>
      <OnboardingFooter deshabilitado={!grupo} onContinuar={() => undefined} />
      <HelpModal isOpen={ayuda} onClose={() => setAyuda(false)} />
    </div>
  );
}

const meta = {
  title: "Pantallas/Onboarding/Flujo completo",
  component: FlujoOnboarding,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FlujoOnboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
export const CargandoGrupos: Story = {
  render: () => <div className="min-h-screen bg-[#fbfaf6] p-5"><GrupoEdadGrid grupos={[]} seleccionadoId="" onSelect={() => undefined} cargando /></div>,
};
export const AyudaAbierta: Story = {
  render: () => <div className="min-h-screen bg-slate-100"><HelpModal isOpen onClose={() => undefined} /></div>,
  globals: { viewport: { value: "movilCompacto", isRotated: false } },
};
