import { Zap } from "lucide-react";
import type { MiembroRankingClub } from "@/features/clubes/clubes.api";
import { resolverAvatar } from "@/shared/constants/avatares";

interface RankingRowProps {
  member: MiembroRankingClub;
  compact?: boolean;
  isMe?: boolean;
}

function roleName(role: string) {
  return role === "lider" || role === "propietario" ? "Líder" : "Miembro";
}

export function RankingRow({ member, compact = false, isMe = false }: RankingRowProps) {
  const avatar = resolverAvatar(member.clave_avatar || member.url_avatar || "1");
  return (
    <article className="club-ranking-row" data-compact={compact} data-me={isMe}>
      <span className="club-ranking-row__position">{member.numero_ranking}</span>
      <img src={avatar} alt="" aria-hidden="true" />
      <div>
        <strong>{member.apodo}{isMe ? " · Tú" : ""}</strong>
        <span>{roleName(member.rol_miembro)} · {member.actividades_semana} actividades</span>
      </div>
      <div className="club-ranking-row__xp">
        <Zap size={16} /><strong>{member.xp_semana}</strong><span>XP</span>
      </div>
    </article>
  );
}
