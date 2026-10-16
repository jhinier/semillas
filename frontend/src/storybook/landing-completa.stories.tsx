import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClubesSection } from "@/features/landing/componentes/ClubesSection";
import { FeaturesSection } from "@/features/landing/componentes/FeaturesSection";
import { Footer } from "@/features/landing/componentes/Footer";
import { HeroSection } from "@/features/landing/componentes/HeroSection";
import { MethodologySection } from "@/features/landing/componentes/MethodologySection";
import { Navbar } from "@/features/landing/componentes/Navbar";
import { PathsSection } from "@/features/landing/componentes/PathsSection";
import { StoryRouter } from "./story-router";

function LandingCompleta() {
  return (
    <StoryRouter>
      <div className="min-h-screen overflow-x-hidden bg-[#fffdf7]">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <PathsSection />
          <MethodologySection />
          <ClubesSection />
        </main>
        <Footer />
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/Landing/Completa",
  component: LandingCompleta,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LandingCompleta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Escritorio: Story = {};

export const MovilApp: Story = {
  globals: { viewport: { value: "movilApp", isRotated: false } },
};
