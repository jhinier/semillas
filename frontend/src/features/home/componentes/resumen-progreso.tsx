import { Award, Gauge, Trophy } from "lucide-react";

interface ResumenProgresoProps {
  xpTotal: number;
  numeroNivel: number;
  nombreNivel: string;
  totalInsignias: number;
}

export function ResumenProgreso({
  xpTotal,
  numeroNivel,
  nombreNivel,
  totalInsignias,
}: ResumenProgresoProps) {
  return (
    <section className="home-stats" aria-label="Resumen de progreso">
      <article className="home-stat home-stat--purple">
        <span className="home-stat__icon"><Gauge size={20} aria-hidden="true" /></span>
        <div className="home-stat__content">
          <span className="home-stat__label">Nivel</span>
          <span className="home-stat__value">{numeroNivel}</span>
          <span className="home-stat__helper">{nombreNivel}</span>
        </div>
      </article>

      <article className="home-stat home-stat--yellow">
        <span className="home-stat__icon"><Award size={20} aria-hidden="true" /></span>
        <div className="home-stat__content">
          <span className="home-stat__label">XP</span>
          <span className="home-stat__value">{xpTotal}</span>
          <span className="home-stat__helper">Puntos acumulados</span>
        </div>
      </article>

      <article className="home-stat home-stat--green">
        <span className="home-stat__icon"><Trophy size={20} aria-hidden="true" /></span>
        <div className="home-stat__content">
          <span className="home-stat__label">Insignias</span>
          <span className="home-stat__value">{totalInsignias}</span>
          <span className="home-stat__helper">Logros ganados</span>
        </div>
      </article>
    </section>
  );
}
