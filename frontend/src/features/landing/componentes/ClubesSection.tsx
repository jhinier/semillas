import { Link } from "@tanstack/react-router";
import { Boton } from "@/componentes/ui/boton";
import { Users } from "lucide-react";
import clubesImg from "@/assets/images/Ilustraciones/Ninos 2.webp";

export function ClubesSection() {
  return (
    <section id="clubes" className="clubes">
      <div className="clubes__content">
        <span className="section-kicker">Comunidad</span>
        <h2>
          Únete a los <span className="text-green">Clubes</span>
        </h2>
        <p>
          Comparte lo que aprendes en grupo, en compañía de amigos, y forma parte de
          una comunidad cristiana llena de alegría.
        </p>
        <Boton
          asChild
          className="landing-button landing-button--primary landing-button--large h-auto rounded-full px-6 py-3"
        >
          <Link to="/login" search={{ redirect: "/onboarding" }}>
            <Users size={18} aria-hidden="true" />
            <span>Ver clubes</span>
          </Link>
        </Boton>
      </div>

      <div className="clubes__image">
        <img src={clubesImg} alt="Niños cuidando una pequeña planta" loading="lazy" />
      </div>
    </section>
  );
}
