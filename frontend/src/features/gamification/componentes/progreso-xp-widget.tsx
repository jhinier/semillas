import * as React from "react";
import { Award, Zap } from "lucide-react";

export interface ProgresoXpWidgetProps {
  xpTotal: number;
  numNivel: number;
  nombreNivel: string;
  xpRestantes: number;
  porcentaje: number;
  nombreSiguienteNivel?: string | null;
  esNivelMaximo?: boolean;
  onVerDetalles?: () => void;
}

export const ProgresoXpWidget: React.FC<ProgresoXpWidgetProps> = ({
  xpTotal,
  numNivel,
  nombreNivel,
  xpRestantes,
  porcentaje,
  nombreSiguienteNivel,
  esNivelMaximo = false,
  onVerDetalles,
}) => {
  return (
    <section className="logros-progress-card" aria-labelledby="logros-progress-title">
      <div className="logros-progress-card__header">
        <span className="logros-progress-card__icon" aria-hidden="true">
          <Award size={21} />
        </span>
        <div className="logros-progress-card__copy">
          <p className="logros-progress-card__eyebrow">Tu progreso</p>
          <h2 id="logros-progress-title">Nivel {numNivel} · {nombreNivel}</h2>
        </div>
        {onVerDetalles ? (
          <button type="button" className="logros-progress-card__details" onClick={onVerDetalles}>
            Ver perfil
          </button>
        ) : null}
      </div>

      <div className="logros-progress-card__stats">
        <div>
          <span className="logros-progress-card__value">{xpTotal}</span>
          <span className="logros-progress-card__label">XP acumulados</span>
        </div>
        <div className="logros-progress-card__percent">{porcentaje}%</div>
      </div>

      <div
        className="logros-progress-card__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
        aria-label="Progreso hacia el siguiente nivel"
      >
        <span style={{ width: `${porcentaje}%` }} />
      </div>

      <p className="logros-progress-card__next">
        <Zap size={15} aria-hidden="true" />
        {esNivelMaximo
          ? "Alcanzaste el nivel máximo disponible."
          : `${xpRestantes} XP para ${nombreSiguienteNivel ?? "el siguiente nivel"}`}
      </p>
    </section>
  );
};
