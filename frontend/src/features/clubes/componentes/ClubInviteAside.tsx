import { Check, Clipboard, Link2, Share2 } from "lucide-react";
import type { Club } from "@/features/clubes/clubes.api";
import { Card } from "@/componentes/ui/card-base";

interface ClubInviteAsideProps {
  club: Club;
  onCopy: () => void;
  onShare: () => void;
  copied: boolean;
}

export function ClubInviteAside({ club, onCopy, onShare, copied }: ClubInviteAsideProps) {
  return (
    <Card className="club-invite-aside" hoverEffect="none">
      <span className="club-invite-aside__icon"><Link2 size={21} /></span>
      <p className="clubes-eyebrow">Invitación</p>
      <h3>{club.codigo_invitacion}</h3>
      <p>Compártelo únicamente con tu grupo.</p>
      <div>
        <button type="button" onClick={onCopy}>
          {copied ? <Check size={16} /> : <Clipboard size={16} />} {copied ? "Copiado" : "Copiar"}
        </button>
        <button type="button" onClick={onShare}><Share2 size={16} /> Compartir</button>
      </div>
    </Card>
  );
}
