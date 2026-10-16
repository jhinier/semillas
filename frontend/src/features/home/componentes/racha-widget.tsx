import * as React from "react";
import { Flame, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/componentes/ui/card-base";
import { unirClases } from "@/lib/utilidades";

export interface RachaWidgetProps {
  diasRacha: number;
}

export const RachaWidget: React.FC<RachaWidgetProps> = ({ diasRacha }) => {
  const tieneRacha = diasRacha > 0;

  return (
    <Card sombra="sm" hoverEffect="none" className="home-streak-card">
      <div className="home-streak-card__header">
        <span className={unirClases("home-streak-card__badge", tieneRacha ? "is-active" : "")}> 
          <Flame size={18} aria-hidden="true" />
        </span>
        <div>
          <span className="home-streak-card__eyebrow">Racha</span>
          <h2>{tieneRacha ? `${diasRacha} días` : "Empieza hoy"}</h2>
        </div>
      </div>

      <p className="home-streak-card__text">
        {tieneRacha
          ? `¡Increíble! Has estudiado ${diasRacha} días seguidos.`
          : "Completa una lección para iniciar tu racha."}
      </p>

      <Link to="/app/temas" className="home-streak-card__action">
        <span>{tieneRacha ? "Seguir" : "Comenzar"}</span>
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </Card>
  );
};
