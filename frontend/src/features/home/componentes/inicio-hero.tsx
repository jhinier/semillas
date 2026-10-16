import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface InicioHeroProps {
  imagenUrl: string;
  nombreUsuario: string;
}

export function InicioHero({ imagenUrl, nombreUsuario }: InicioHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <img
        className="home-hero__image"
        src={imagenUrl}
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <div className="home-hero__overlay" aria-hidden="true" />

      <div className="home-hero__content">
        <span className="home-hero__eyebrow">Tu aventura de hoy</span>
        <h2 id="home-hero-title">Sigue creciendo, {nombreUsuario}</h2>
        <p>Retoma una lección corta, explora una senda o avanza un paso más hoy.</p>

        <Link to="/app/temas" className="home-hero__cta">
          <PlayCircle size={18} aria-hidden="true" />
          <span>Empezar una lección</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
