import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { GrupoEdadGrid } from "@/features/onboarding/componentes/GrupoEdadGrid";
import { OnboardingFooter } from "@/features/onboarding/componentes/OnboardingFooter";
import { OnboardingTopbar } from "@/features/onboarding/componentes/OnboardingTopbar";
import type { GrupoEdad } from "@/shared/api/api";
import semillasImg from "@/assets/images/Ilustraciones/Semilla.webp";
import exploradoresImg from "@/assets/images/Ilustraciones/Exploradores.webp";
import embajadoresImg from "@/assets/images/Ilustraciones/Embajadores.webp";

const grupos: GrupoEdad[] = [
  {
    id: "semillas",
    codigo: "semillas",
    nombre: "Semillas",
    edad_minima: 5,
    edad_maxima: 8,
    descripcion: "Descubre a Dios a través de historias y actividades sencillas.",
    orden: 1,
    imagen_url: semillasImg,
  },
  {
    id: "exploradores",
    codigo: "exploradores",
    nombre: "Exploradores",
    edad_minima: 9,
    edad_maxima: 12,
    descripcion: "Aprende más de Dios y entiende su Palabra.",
    orden: 2,
    imagen_url: exploradoresImg,
  },
  {
    id: "embajadores",
    codigo: "embajadores",
    nombre: "Embajadores",
    edad_minima: 13,
    edad_maxima: 17,
    descripcion: "Profundiza en tu fe y vive con más propósito.",
    orden: 3,
    imagen_url: embajadoresImg,
  },
];

function OnboardingEdadStory({ cargando = false }: { cargando?: boolean }) {
  const [seleccionado, setSeleccionado] = useState("");

  return (
    <div className="onboarding-age-page">
      <OnboardingTopbar onHelpClick={() => undefined} />
      <main className="onboarding-age-main">
        <section className="onboarding-age-hero">
          <span className="onboarding-age-hero__eyebrow">Paso 1 de 2</span>
          <h1 className="onboarding-age-hero__title">Elige tu franja de edad</h1>
          <p className="onboarding-age-hero__copy">
            Adaptaremos las historias y actividades a tu etapa. Podrás cambiarla después.
          </p>
        </section>

        <div className="onboarding-age-stepper">
          <div className="onboarding-age-step is-active">
            <span className="onboarding-age-step__number">1</span>
            <span>Tu edad</span>
          </div>
          <div className="onboarding-age-step">
            <span className="onboarding-age-step__number">2</span>
            <span>Tu información</span>
          </div>
        </div>

        <GrupoEdadGrid
          grupos={cargando ? [] : grupos}
          seleccionadoId={seleccionado}
          onSelect={setSeleccionado}
          cargando={cargando}
        />
        <OnboardingFooter deshabilitado={!seleccionado} onContinuar={() => undefined} />
      </main>
    </div>
  );
}

const meta = {
  title: "Pantallas/Onboarding/Seleccionar edad",
  component: OnboardingEdadStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OnboardingEdadStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Escritorio: Story = {};
export const MovilApp: Story = {
  globals: { viewport: { value: "movilApp", isRotated: false } },
};
export const Cargando: Story = {
  args: { cargando: true },
};
