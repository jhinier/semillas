import { ChevronRight, Link2, Share2, Target, Trophy, Zap } from "lucide-react";
import type { MiembroRankingClub, RetoCooperativo } from "@/features/clubes/clubes.api";
import { Boton } from "@/componentes/ui/boton";
import { RankingRow } from "./RankingRow";

interface ResumenClubProps {
  retos: RetoCooperativo[];
  ranking: MiembroRankingClub[];
  onViewChallenges: () => void;
  onViewRanking: () => void;
  onShare: () => void;
}

function metricDescription(metric: string) {
  if (metric === "xp_grupal") return "Sumen XP entre todos los miembros del club.";
  if (metric === "temas_completados") return "Completen temas entre todos para alcanzar la meta.";
  return "Completen actividades y aporten al objetivo común.";
}

export function ResumenClub({ retos, ranking, onViewChallenges, onViewRanking, onShare }: ResumenClubProps) {
  const reto = retos.find((item) => !item.completado && new Date(item.fecha_fin) >= new Date()) ?? retos[0];
  return (
    <div className="club-summary-grid">
      <section className="club-panel club-panel--challenge">
        <div className="club-panel__header">
          <div>
            <span className="clubes-eyebrow">Reto activo</span>
            <h3>{reto?.nombre ?? "Aún no hay un reto activo"}</h3>
          </div>
          <Target size={26} aria-hidden="true" />
        </div>
        {reto ? (
          <>
            <p>{reto.descripcion || metricDescription(reto.codigo_metrica)}</p>
            <div className="challenge-progress-copy">
              <span>{reto.progreso_actual} de {reto.valor_objetivo}</span>
              <strong>{reto.porcentaje}%</strong>
            </div>
            <div className="challenge-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={reto.porcentaje}>
              <span style={{ width: `${reto.porcentaje}%` }} />
            </div>
            <div className="challenge-meta">
              <span><Zap size={15} /> {reto.xp_reto} XP de premio</span>
              <span>Tu aporte: {reto.mi_aporte}</span>
            </div>
          </>
        ) : (
          <p>El líder puede crear un reto para que todos avancen hacia una meta común.</p>
        )}
        <button type="button" className="club-link-button" onClick={onViewChallenges}>
          Ver todos los retos <ChevronRight size={16} />
        </button>
      </section>

      <section className="club-panel">
        <div className="club-panel__header">
          <div>
            <span className="clubes-eyebrow">Esta semana</span>
            <h3>Ranking del club</h3>
          </div>
          <Trophy size={25} />
        </div>
        <div className="club-ranking-preview">
          {ranking.slice(0, 3).map((member) => (
            <RankingRow key={member.miembro_token} member={member} compact />
          ))}
          {ranking.length === 0 ? (
            <p className="club-muted">El ranking aparecerá cuando el grupo empiece a completar actividades.</p>
          ) : null}
        </div>
        <button type="button" className="club-link-button" onClick={onViewRanking}>
          Ver ranking completo <ChevronRight size={16} />
        </button>
      </section>

      <section className="club-panel club-panel--invite">
        <div className="club-panel__header">
          <div>
            <span className="clubes-eyebrow">Crezcan juntos</span>
            <h3>Invita a tu grupo</h3>
          </div>
          <Link2 size={25} />
        </div>
        <p>Comparte el código solo con personas de tu iglesia, curso o familia.</p>
        <Boton variante="violeta" onClick={onShare} iconoIzquierdo={<Share2 size={17} />}>
          Compartir invitación
        </Boton>
      </section>
    </div>
  );
}
