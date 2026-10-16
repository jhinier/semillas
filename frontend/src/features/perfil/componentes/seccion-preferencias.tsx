import { Headphones, Languages, Type, UserRoundCog } from "lucide-react";

interface SeccionPreferenciasProps {
  grupoEdadLabel: string;
  prefiereAudio: boolean;
  tamanoTextoLabel: string;
  onEditarPerfil: () => void;
  onEditarPreferencias: () => void;
}

const preferenceItems = [
  { id: "franja", label: "Franja", icon: UserRoundCog },
  { id: "audio", label: "Audio", icon: Headphones },
  { id: "texto", label: "Tamaño de texto", icon: Type },
] as const;

export function SeccionPreferencias({
  grupoEdadLabel,
  prefiereAudio,
  tamanoTextoLabel,
  onEditarPerfil,
  onEditarPreferencias,
}: SeccionPreferenciasProps) {
  const values = {
    franja: grupoEdadLabel,
    audio: prefiereAudio ? "Activado" : "Desactivado",
    texto: tamanoTextoLabel,
  };

  return (
    <section className="profile-side-card">
      <div className="profile-side-card__heading">
        <div>
          <p className="profile-eyebrow">Aprendizaje</p>
          <h2>Preferencias</h2>
        </div>
        <span className="profile-side-card__status is-neutral">
          <Languages size={17} aria-hidden="true" />
        </span>
      </div>

      <dl className="profile-preferences-list">
        {preferenceItems.map(({ id, label, icon: Icon }) => (
          <div key={id} className="profile-preference-row">
            <span className="profile-preference-row__icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <div>
              <dt>{label}</dt>
              <dd>{values[id]}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="profile-side-card__footer-actions">
        <button type="button" className="profile-text-button" onClick={onEditarPerfil}>
          Editar perfil
        </button>
        <button type="button" className="profile-text-button" onClick={onEditarPreferencias}>
          Cambiar preferencias
        </button>
      </div>
    </section>
  );
}
