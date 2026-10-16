import { Check } from "lucide-react";
import { MAPA_AVATARES } from "@/shared/constants/avatares";

interface AvatarSelectorProps {
  selectedAvatar: number;
  onSelect: (n: number) => void;
}

export function AvatarSelector({ selectedAvatar, onSelect }: AvatarSelectorProps) {
  return (
    <fieldset className="customize-section customize-avatar-section">
      <legend className="customize-section__title">
        <span className="customize-section__number">2</span>
        <span>Elige un avatar que te represente</span>
      </legend>

      <div className="customize-avatar-grid">
        {Array.from({ length: 10 }, (_, index) => {
          const avatarNum = index + 1;
          const isSelected = selectedAvatar === avatarNum;

          return (
            <label
              key={avatarNum}
              className={`customize-avatar-option ${isSelected ? "is-selected" : ""}`}
              aria-label={`Seleccionar avatar ${avatarNum}`}
            >
              <input
                type="radio"
                name="avatar"
                value={avatarNum}
                checked={isSelected}
                onChange={() => onSelect(avatarNum)}
              />

              <img
                src={MAPA_AVATARES[String(avatarNum)]}
                alt=""
                loading={avatarNum > 5 ? "lazy" : "eager"}
                draggable="false"
              />

              {isSelected && (
                <span className="customize-avatar-option__check" aria-hidden="true">
                  <Check size={17} strokeWidth={3} />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
