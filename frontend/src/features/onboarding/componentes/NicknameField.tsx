import { User } from "lucide-react";

interface NicknameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function NicknameField({ value, onChange }: NicknameFieldProps) {
  const currentLength = value.length;

  return (
    <section className="customize-section" aria-labelledby="nickname-title">
      <div className="customize-section__title" id="nickname-title">
        <span className="customize-section__number">1</span>
        <span>¿Cómo quieres que te llamemos?</span>
      </div>

      <label className="customize-input" htmlFor="nickname">
        <User size={20} className="customize-input__icon" aria-hidden="true" />
        <input
          id="nickname"
          type="text"
          maxLength={20}
          autoComplete="nickname"
          placeholder="Escribe tu apodo"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby="nickname-counter"
        />
      </label>

      <div className="customize-input__meta" id="nickname-counter" aria-live="polite">
        {currentLength}/20 caracteres
      </div>
    </section>
  );
}
