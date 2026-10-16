import { ArrowLeftRight, Flag, MoreHorizontal, UserMinus, Users, Zap } from "lucide-react";
import type { MiembroClub } from "@/features/clubes/clubes.api";
import { resolverAvatar } from "@/shared/constants/avatares";

interface MiembrosClubProps {
  members: MiembroClub[];
  isLeader: boolean;
  pending: boolean;
  onRemove: (member: MiembroClub) => void;
  onTransfer: (member: MiembroClub) => void;
  onReport: (member: MiembroClub) => void;
}

function roleName(role: string) {
  return role === "lider" || role === "propietario" ? "Líder" : "Miembro";
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("es-EC", { month: "short", year: "numeric" }).format(new Date(value));
}

export function MiembrosClub({ members, isLeader, pending, onRemove, onTransfer, onReport }: MiembrosClubProps) {
  return (
    <section className="club-section-card">
      <header>
        <div>
          <span className="clubes-eyebrow">Comunidad protegida</span>
          <h2>{members.length} miembros</h2>
          <p>Solo se muestran apodos, avatares y progreso del club.</p>
        </div>
        <Users size={31} />
      </header>
      <div className="club-members-list">
        {members.map((member) => {
          const avatar = resolverAvatar(member.clave_avatar || member.url_avatar || "1");
          const isMe = member.es_actual;
          const isMemberLeader = ["lider", "propietario"].includes(member.rol_miembro);
          return (
            <article key={member.miembro_token} className="club-member-row">
              <img src={avatar} alt="" aria-hidden="true" />
              <div className="club-member-row__identity">
                <strong>{member.apodo}{isMe ? " · Tú" : ""}</strong>
                <span>{roleName(member.rol_miembro)} · Se unió {formatMonth(member.unido_en)}</span>
              </div>
              <div className="club-member-row__stats">
                <span><Zap size={15} /> {member.xp_semana} XP esta semana</span>
                <span>{member.actividades_semana} actividades</span>
              </div>
              {isLeader && !isMe && !isMemberLeader ? (
                <details className="club-member-actions">
                  <summary aria-label={`Acciones para ${member.apodo}`}><MoreHorizontal size={20} /></summary>
                  <div>
                    <button type="button" disabled={pending} onClick={() => onReport(member)}>
                      <Flag size={16} /> Reportar
                    </button>
                    <button type="button" disabled={pending} onClick={() => onTransfer(member)}>
                      <ArrowLeftRight size={16} /> Transferir liderazgo
                    </button>
                    <button type="button" disabled={pending} className="danger" onClick={() => onRemove(member)}>
                      <UserMinus size={16} /> Retirar del club
                    </button>
                  </div>
                </details>
              ) : (
                <>
                  <span className="club-role-pill" data-leader={isMemberLeader}>{roleName(member.rol_miembro)}</span>
                  {!isMe ? <button className="club-member-report" type="button" onClick={() => onReport(member)} aria-label={`Reportar a ${member.apodo}`}><Flag size={16} /></button> : null}
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
