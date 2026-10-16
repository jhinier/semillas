import { Link } from "@tanstack/react-router";
import { ArrowRight, Target } from "lucide-react";

export interface ProximaInsigniaWidgetProps {
  nombre: string;
  criterio: string;
  bonoXp: number;
}

export function ProximaInsigniaWidget({ nombre, criterio, bonoXp }: ProximaInsigniaWidgetProps) {
  return (
    <section className="logros-next-card" aria-labelledby="logros-next-title">
      <span className="logros-next-card__icon" aria-hidden="true">
        <Target size={21} />
      </span>
      <p className="logros-next-card__eyebrow">Tu próxima insignia</p>
      <h2 id="logros-next-title">{nombre}</h2>
      <p>{criterio}</p>
      <span className="logros-next-card__reward">+{bonoXp} XP al conseguirla</span>
      <Link to="/app/temas" className="logros-next-card__cta">
        Empezar una lección
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}
