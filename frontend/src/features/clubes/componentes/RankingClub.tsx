import { Trophy } from "lucide-react";
import type { MiembroRankingClub } from "@/features/clubes/clubes.api";
import { EmptyInline } from "./EmptyInline";
import { RankingRow } from "./RankingRow";
import { ClubesContentSkeleton } from "./ClubesContentSkeleton";

interface RankingClubProps {
  ranking: MiembroRankingClub[];
  loading: boolean;
}

export function RankingClub({ ranking, loading }: RankingClubProps) {
  return (
    <section className="club-section-card">
      <header>
        <div>
          <span className="clubes-eyebrow">XP ganado desde el lunes</span>
          <h2>Ranking semanal</h2>
          <p>El progreso personal suma al club, pero cada miembro aprende a su ritmo.</p>
        </div>
        <Trophy size={31} />
      </header>
      {loading ? (
        <ClubesContentSkeleton />
      ) : (
        <div className="club-ranking-list">
          {ranking.map((member) => (
            <RankingRow
              key={member.miembro_token}
              member={member}
              isMe={member.es_actual}
            />
          ))}
          {ranking.length === 0 ? (
            <EmptyInline
              icon={Trophy}
              title="El ranking está esperando"
              text="Completen una actividad para inaugurada el ranking semanal."
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
