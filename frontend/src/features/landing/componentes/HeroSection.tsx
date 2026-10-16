import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Boton } from "@/componentes/ui/boton";
import { Heart, Play, ShieldCheck, Smile, Sprout } from "lucide-react";
import { esIOS, estaInstaladaComoPWA } from "@/shared/utils/pwa";
const landingImg = "/landing-hero.webp";

const badges = [
  { icon: ShieldCheck, text: "Contenido seguro" },
  { icon: Smile, text: "Para niños de 5 a 14 años" },
  { icon: Heart, text: "Basada en la Biblia" },
];

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
}

export function HeroSection() {
  const [esMovil, setEsMovil] = useState(false);
  const [yaInstalada, setYaInstalada] = useState(false);

  useEffect(() => {
    const isMobile = isMobileDevice();
    const isInstalled = estaInstaladaComoPWA();
    setEsMovil(isMobile);
    setYaInstalada(isInstalled);

    console.log("[HeroSection] URL:", window.location.href);
    console.log("[HeroSection] isMobile:", isMobile);
    console.log("[HeroSection] isInstalled:", isInstalled);
    console.log("[HeroSection] standalone:", window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  const handleComenzarClick = (e: React.MouseEvent) => {
    if (!esMovil || yaInstalada) return;
    e.preventDefault();
    window.location.assign("/install?redirect=/onboarding");
  };

  return (
    <section className="hero">
      <div className="hero__content">
        <span className="section-kicker">Aprender puede ser una aventura</span>

        <h1>
          Aprende la Palabra de Dios
          <span className="hero__accent">
            jugando <Sprout size={40} aria-hidden="true" />
          </span>
        </h1>

        <p>
          Semillas es una plataforma cristiana para niños que enseña el evangelio de
          forma lúdica, interactiva y confiable.
        </p>

        <div className="hero__buttons">
          <Boton
            asChild
            className="landing-button landing-button--primary landing-button--large h-auto rounded-full px-6 py-3"
          >
            <Link
              to={esMovil && !yaInstalada ? "/install" : "/login"}
              search={{ redirect: "/onboarding" }}
              onClick={handleComenzarClick}
            >
              <Play size={18} fill="currentColor" aria-hidden="true" />
              <span>Comenzar ahora</span>
            </Link>
          </Boton>
        </div>

        <div className="hero__badges" aria-label="Beneficios clave de la plataforma">
          {badges.map(({ icon: Icon, text }) => (
            <span key={text} className="hero-badge">
              <Icon size={18} aria-hidden="true" />
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="hero__image">
        <img
          src={landingImg}
          srcSet="/landing-hero-480.webp 480w, /landing-hero.webp 900w"
          sizes="(max-width: 700px) 90vw, 48vw"
          alt="Jesús caminando con niños en un paisaje alegre"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}
