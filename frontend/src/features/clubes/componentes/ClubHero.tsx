import { CalendarDays, Check, Copy, Crown, Share2, ShieldCheck, Users } from "lucide-react";
import type { Club } from "@/features/clubes/clubes.api";

interface ClubHeroProps {
  club: Club;
  members: number;
  role: string;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("es-EC", { month: "short", year: "numeric" }).format(new Date(value));
}

export function ClubHero({ club, members, role, copied, onCopy, onShare }: ClubHeroProps) {
  const roleLabel = role === "lider" || role === "propietario" ? "Líder" : "Miembro";
  return (
    <section className="club-hero">
      <div className="club-hero__art" aria-hidden="true">
        <span className="club-hero__orb club-hero__orb--one" />
        <span className="club-hero__orb club-hero__orb--two" />
        <Users size={76} />
      </div>
      <div className="club-hero__content">
        <div className="club-hero__badges">
          <span><ShieldCheck size={15} /> Club protegido</span>
          <span><Crown size={15} /> {roleLabel}</span>
        </div>
        <h2>{club.nombre}</h2>
        <p>{club.descripcion || "Un espacio para aprender, avanzar y celebrar juntos."}</p>
        <div className="club-hero__stats">
          <span><Users size={18} /><strong>{members}</strong> miembros</span>
          <span><CalendarDays size={18} /> Desde {formatMonth(club.creado_en)}</span>
        </div>
      </div>
      <div className="club-hero__invite">
        <span className="clubes-eyebrow">Código de invitación</span>
        <strong>{club.codigo_invitacion}</strong>
        <div>
          <button type="button" onClick={onCopy}>
            {copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copiado" : "Copiar"}
          </button>
          <button type="button" onClick={onShare}><Share2 size={17} /> Compartir</button>
        </div>
      </div>
    </section>
  );
}
