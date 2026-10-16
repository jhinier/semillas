import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import "../estilos.css";
import "../landing.css";
import { Navbar } from "@/features/landing/componentes/Navbar";
import { HeroSection } from "@/features/landing/componentes/HeroSection";
import { PathsSection } from "@/features/landing/componentes/PathsSection";
import { FeaturesSection } from "@/features/landing/componentes/FeaturesSection";
import { ClubesSection } from "@/features/landing/componentes/ClubesSection";
import { MethodologySection } from "@/features/landing/componentes/MethodologySection";
import { Footer } from "@/features/landing/componentes/Footer";
import { WelcomeBanner } from "@/features/landing/componentes/WelcomeBanner";
import { estaInstaladaComoPWA } from "@/shared/utils/pwa";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  useEffect(() => {
    document.title = "Semillas - Aprende la Palabra de Dios jugando";

    console.log("[Landing] URL:", window.location.href);
    console.log("[Landing] pathname:", window.location.pathname);
    console.log("[Landing] estaInstaladaComoPWA:", estaInstaladaComoPWA());
    console.log("[Landing] standalone:", window.matchMedia("(display-mode: standalone)").matches);
    console.log("[Landing] fullscreen:", window.matchMedia("(display-mode: fullscreen)").matches);
    console.log("[Landing] navigator.standalone:", (window.navigator as Navigator & { standalone?: boolean }).standalone);
  }, []);
  return (
    <div className="landing-wrapper" id="top">
      <WelcomeBanner />
      <div className="landing-shell">
        <Navbar />

        <main className="main-content">
          <HeroSection />
          <PathsSection />
          <FeaturesSection />
          <ClubesSection />
          <MethodologySection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
