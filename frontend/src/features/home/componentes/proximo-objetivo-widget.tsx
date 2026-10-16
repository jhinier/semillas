import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/componentes/ui/card-base";

interface ProximoObjetivoWidgetProps {
  totalInsignias: number;
  xpTotal: number;
}

export function ProximoObjetivoWidget({ totalInsignias, xpTotal }: ProximoObjetivoWidgetProps) {
  const esNuevo = xpTotal === 0;

  return (
    <Card sombra="sm" hoverEffect="none" className="home-goal-card">
      <div className="home-goal-card__header">
        <span className="home-goal-card__icon">
          <Sparkles size={20} aria-hidden="true" />
        </span>
        <div>
          <span className="home-goal-card__eyebrow">Siguiente objetivo</span>
          <h2>{esNuevo ? "Completa tu primera lección" : "Sigue avanzando"}</h2>
        </div>
      </div>

      <p className="home-goal-card__text">
        {esNuevo
          ? "Elige una Senda, termina un tema y comienza a ganar XP e insignias."
          : `Ya tienes ${xpTotal} XP y ${totalInsignias} ${totalInsignias === 1 ? "insignia" : "insignias"}. Continúa con otro tema.`}
      </p>

      <div className="home-goal-card__actions">
        <Link to="/app/temas" className="home-goal-card__primary">
          <span>{esNuevo ? "Elegir un tema" : "Continuar aprendiendo"}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>

        <Link to="/app/logros" className="home-goal-card__secondary">
          <Trophy size={16} aria-hidden="true" />
          <span>Ver insignias</span>
        </Link>
      </div>
    </Card>
  );
}
