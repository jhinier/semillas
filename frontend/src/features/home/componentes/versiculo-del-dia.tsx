import * as React from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import versiculoImg from "@/assets/images/Ilustraciones/Versiculo del dia.webp";
import { Card } from "@/componentes/ui/card-base";

export interface VersiculoDelDiaProps {
  texto: string;
  referencia: string;
}

export const VersiculoDelDia: React.FC<VersiculoDelDiaProps> = ({ texto, referencia }) => {
  const [expandido, setExpandido] = React.useState(false);
  const esLargo = texto.length > 85;

  return (
    <Card sombra="sm" hoverEffect="none" className="home-verse-card">
      <div className="home-verse-card__header">
        <span className="home-verse-card__icon"><BookOpen size={18} aria-hidden="true" /></span>
        <div>
          <span className="home-verse-card__eyebrow">Versículo</span>
          <h2>Del día</h2>
        </div>
      </div>

      <div className="home-verse-card__body">
        <div className="home-verse-card__copy">
          <p className={`home-verse-card__quote ${expandido ? "is-expanded" : ""}`}>
            "{texto}"
          </p>
          <p className="home-verse-card__ref">- {referencia}</p>

          {esLargo && (
            <button type="button" className="home-verse-card__toggle" onClick={() => setExpandido((valor) => !valor)}>
              {expandido ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
              <span>{expandido ? "Ver menos" : "Leer completo"}</span>
            </button>
          )}
        </div>

        <div className="home-verse-card__media">
          <img
            src={versiculoImg}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </Card>
  );
};
