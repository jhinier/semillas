import { Target, Zap } from "lucide-react";
import type { RetoCooperativo } from "@/features/clubes/clubes.api";
import { Boton } from "@/componentes/ui/boton";

interface ChallengeCardProps {
  reto: RetoCooperativo;
  onClaim?: (retoId: string) => void;
  claiming?: boolean;
}

function daysRemaining(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  if (days <= 0) return "Finalizado";
  if (days === 1) return "1 día";
  return `${days} días`;
}

function metricDescription(metric: string) {
  if (metric === "xp_grupal") return "Sumen XP entre todos los miembros del club.";
  if (metric === "temas_completados") return "Completen temas entre todos para alcanzar la meta.";
  return "Completen actividades y aporten al objetivo común.";
}

export function ChallengeCard({ reto, onClaim = () => undefined, claiming = false }: ChallengeCardProps) {
  return (
    <article className="challenge-card" data-complete={reto.completado}>
      <div className="challenge-card__top">
        <span className="challenge-card__icon"><Target size={20} /></span>
        <span className="challenge-card__status">{reto.completado ? "Completado" : daysRemaining(reto.fecha_fin)}</span>
      </div>
      <h3>{reto.nombre}</h3>
      <p>{reto.descripcion || metricDescription(reto.codigo_metrica)}</p>
      <div className="challenge-progress-copy">
        <span>{reto.progreso_actual} / {reto.valor_objetivo}</span>
        <strong>{reto.porcentaje}%</strong>
      </div>
      <div className="challenge-progress">
        <span style={{ width: `${reto.porcentaje}%` }} />
      </div>
      <footer>
        <span><Zap size={15} /> {reto.xp_reto} XP</span>
        <span>Tu aporte: {reto.mi_aporte}</span>
      </footer>
      {reto.completado ? (
        <Boton
          variante={reto.recompensa_reclamada ? "secundario" : "violeta"}
          disabled={reto.recompensa_reclamada || claiming}
          cargando={claiming && !reto.recompensa_reclamada}
          onClick={() => onClaim(reto.id)}
          className="challenge-card__claim"
        >
          {reto.recompensa_reclamada ? "Recompensa reclamada" : `Reclamar ${reto.xp_reto} XP`}
        </Boton>
      ) : null}
    </article>
  );
}
