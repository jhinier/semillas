import { CloudDownload, Sprout, Trophy } from "lucide-react";

interface FeatureCardProps {
  variante: "green" | "blue" | "yellow";
  titulo: string;
  descripcion: string;
  icono: typeof Sprout;
}

function FeatureCard({ variante, icono: Icon, titulo, descripcion }: FeatureCardProps) {
  return (
    <article className={`feature-card feature-card--${variante}`}>
      <div className="feature-card__icon" aria-hidden="true">
        <Icon size={24} />
      </div>
      <div className="feature-card__text">
        <h3>{titulo}</h3>
        <p>{descripcion}</p>
      </div>
    </article>
  );
}

export function FeaturesSection() {
  const features = [
    {
      variante: "green" as const,
      icono: Sprout,
      titulo: "Aprende con CRECER",
      descripcion: "Una metodología sencilla que convierte el aprendizaje en una aventura espiritual.",
    },
    {
      variante: "blue" as const,
      icono: CloudDownload,
      titulo: "Funciona offline",
      descripcion: "Descarga la app y continúa aprendiendo incluso sin conexión a internet.",
    },
    {
      variante: "yellow" as const,
      icono: Trophy,
      titulo: "Gana insignias y XP",
      descripcion: "Completa actividades, gana experiencia y desbloquea recompensas.",
    },
  ];

  return (
    <section id="como-funciona" className="landing-section">
      <div className="section-header section-header--center">
        <span className="section-kicker">Cómo funciona</span>
        <h2>Una experiencia simple y divertida</h2>
        <p>Todo está pensado para que niñas y niños aprendan de forma clara, segura y motivadora.</p>
      </div>

      <div className="features">
        {features.map((feature) => (
          <FeatureCard key={feature.titulo} {...feature} />
        ))}
      </div>
    </section>
  );
}
