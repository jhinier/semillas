import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import padreImg from "@/assets/images/Ilustraciones/Senda del Padre.webp";
import hijoImg from "@/assets/images/Ilustraciones/Senda del hijo.webp";
import espirituImg from "@/assets/images/Ilustraciones/Senda del espiritu santo.webp";

interface PathCardProps {
  tipo: "padre" | "hijo" | "espiritu";
  titulo: string;
  descripcion: string;
}

const imageMap = {
  padre: padreImg,
  hijo: hijoImg,
  espiritu: espirituImg,
};

const variantMap = {
  padre: "path-card--yellow",
  hijo: "path-card--blue",
  espiritu: "path-card--purple",
};

function PathCard({ tipo, titulo, descripcion }: PathCardProps) {
  return (
    <Link
      to="/login"
      search={{ redirect: "/onboarding" }}
      className={`path-card ${variantMap[tipo]}`}
      aria-label={`Explorar la Senda del ${titulo}`}
    >
      <div className="path-card__info">
        <span className="path-label">Senda del</span>
        <h3>{titulo}</h3>
        <p>{descripcion}</p>
        <span className="icon-btn" aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      </div>

      <div className="path-card__image-wrap">
        <img src={imageMap[tipo]} alt="" loading="lazy" />
      </div>
    </Link>
  );
}

export function PathsSection() {
  const sendas = [
    { tipo: "padre" as const, titulo: "Padre", descripcion: "Dios es nuestro Padre amoroso." },
    { tipo: "hijo" as const, titulo: "Hijo", descripcion: "Jesús es nuestro Salvador y amigo." },
    {
      tipo: "espiritu" as const,
      titulo: "Espíritu Santo",
      descripcion: "El Espíritu Santo nos guía y fortalece.",
    },
  ];

  return (
    <section id="sendas" className="landing-section">
      <div className="section-header section-header--center">
        <span className="section-kicker">Explora</span>
        <h2>Las tres Sendas</h2>
        <p>Recorre un camino de fe pensado para aprender, crecer y compartir.</p>
      </div>

      <div className="paths">
        {sendas.map((senda) => (
          <PathCard key={senda.tipo} {...senda} />
        ))}
      </div>
    </section>
  );
}
