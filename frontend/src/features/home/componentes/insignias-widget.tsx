import * as React from "react";
import { ArrowRight, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/componentes/ui/card-base";
import { AvatarCircular } from "@/componentes/ui/avatar-circular";

export interface Insignia {
  id: string;
  nombre: string;
  imagenUrl: string;
}

export interface InsigniasWidgetProps {
  insignias: Insignia[];
}

export const InsigniasWidget: React.FC<InsigniasWidgetProps> = ({ insignias }) => {
  const tieneInsignias = insignias && insignias.length > 0;

  return (
    <Card sombra="sm" hoverEffect="none" className="home-badges-card">
      <div className="home-badges-card__header">
        <span className="home-badges-card__badge"><Trophy size={18} aria-hidden="true" /></span>
        <div>
          <span className="home-badges-card__eyebrow">Insignias</span>
          <h2>{tieneInsignias ? `${insignias.length}` : "0"}</h2>
        </div>
      </div>

      {tieneInsignias ? (
        <div className="home-badges-card__list">
          {insignias.slice(0, 4).map((insignia) => (
            <div key={insignia.id} className="home-badges-card__item">
              <AvatarCircular src={insignia.imagenUrl} alt={insignia.nombre} tamano="xs" />
              <span>{insignia.nombre}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="home-badges-card__text">Aún no tienes insignias. Completa una lección para ganar la primera.</p>
      )}

      <Link to="/app/logros" className="home-badges-card__action">
        <span>Ver logros</span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </Card>
  );
};
