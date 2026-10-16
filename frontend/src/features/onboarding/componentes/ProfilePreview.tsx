import { MAPA_AVATARES } from "@/shared/constants/avatares";
import fondoAvatarImg from "@/assets/images/backgrounds/Fondo Avatar.webp";
import { Sparkles } from "lucide-react";

interface ProfilePreviewProps {
  selectedAvatar: number;
  nickname: string;
}

export function ProfilePreview({ selectedAvatar, nickname }: ProfilePreviewProps) {
  return (
    <aside className="customize-preview" aria-label="Vista previa del perfil">
      <div className="customize-preview__heading">
        <Sparkles size={20} aria-hidden="true" />
        <span>Así se verá tu perfil</span>
      </div>

      <div className="customize-preview__card">
        <div className="customize-preview__cover">
          <img src={fondoAvatarImg} alt="" />
        </div>

        <div className="customize-preview__avatar">
          <img src={MAPA_AVATARES[String(selectedAvatar)]} alt="Avatar seleccionado" />
        </div>

        <div className="customize-preview__name" title={nickname.trim() || "Tú"}>
          {nickname.trim() || "Tú"}
        </div>

        <div className="customize-preview__welcome">
          <strong>¡Bienvenido a Semillas!</strong>
          <p>Aquí aprenderás, explorarás y compartirás lo que descubras.</p>
        </div>
      </div>
    </aside>
  );
}
