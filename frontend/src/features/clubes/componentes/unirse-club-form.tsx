import * as React from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { Boton } from "@/componentes/ui/boton";

export interface UnirseClubFormProps {
  joinCode: string;
  onCodeChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export const UnirseClubForm: React.FC<UnirseClubFormProps> = ({
  joinCode,
  onCodeChange,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <Card sombra="sm" hoverEffect="none" className="club-join-card">
      <span className="club-join-card__icon" aria-hidden="true"><KeyRound size={24} /></span>
      <div>
        <p className="clubes-eyebrow">Tengo una invitación</p>
        <h3>Unirme con un código</h3>
        <p>Escribe el código que te compartió el líder de tu iglesia, curso o familia.</p>
      </div>
      <form onSubmit={onSubmit} className="club-join-card__form">
        <label htmlFor="club-code">Código del club</label>
        <div>
          <input
            id="club-code"
            type="text"
            value={joinCode}
            onChange={(event) => onCodeChange(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            placeholder="ABCD2345"
            autoComplete="one-time-code"
            inputMode="text"
            maxLength={20}
          />
          <Boton
            type="submit"
            variante="violeta"
            cargando={isSubmitting}
            disabled={joinCode.trim().length < 4}
            iconoDerecho={<ArrowRight size={17} />}
          >
            Unirme
          </Boton>
        </div>
      </form>
    </Card>
  );
};
