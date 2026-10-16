import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import type { GrupoEdad } from "../../../shared/api/api";

const mapaColores: Record<string, { borde: string; fondo: string; acento: string; suave: string }> = {
  semillas: { borde: "#43A047", fondo: "#E8F5E9", acento: "#2E7D32", suave: "#F3FAF4" },
  exploradores: { borde: "#3D8BD4", fondo: "#EAF4FD", acento: "#2874C6", suave: "#F5FAFF" },
  embajadores: { borde: "#EE6C4D", fondo: "#FDEDEA", acento: "#D9573A", suave: "#FFF8F6" },
};

interface GrupoEdadCardProps {
  grupo: GrupoEdad;
  seleccionado: boolean;
  onSelect: (id: string) => void;
}

export function GrupoEdadCard({ grupo, seleccionado, onSelect }: GrupoEdadCardProps) {
  const colores = mapaColores[grupo.codigo] ?? {
    borde: "#7E57C2",
    fondo: "#EDE7F6",
    acento: "#6A42B8",
    suave: "#FAF7FF",
  };

  const style = {
    "--age-accent": colores.acento,
    "--age-border": colores.borde,
    "--age-background": colores.fondo,
    "--age-soft": colores.suave,
  } as CSSProperties;

  return (
    <label
      className={`onboarding-age-card ${seleccionado ? "is-selected" : ""}`}
      style={style}
    >
      <input
        type="radio"
        name="age_group"
        value={grupo.id}
        checked={seleccionado}
        onChange={() => onSelect(grupo.id)}
        className="onboarding-age-card__radio"
      />

      <div className="onboarding-age-card__media">
        <img
          src={grupo.imagen_url ?? undefined}
          alt=""
          className="onboarding-age-card__image"
          loading="lazy"
        />
        <span className="onboarding-age-card__check" aria-hidden="true">
          <Check size={22} strokeWidth={3} />
        </span>
      </div>

      <div className="onboarding-age-card__body">
        <div className="onboarding-age-card__heading">
          <h2>{grupo.nombre}</h2>
          <span className="onboarding-age-card__range">
            {grupo.edad_minima}–{grupo.edad_maxima} años
          </span>
        </div>
        <p>{grupo.descripcion}</p>
      </div>
    </label>
  );
}
