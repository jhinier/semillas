import type { GrupoEdad } from "../../../shared/api/api";
import { GrupoEdadCard } from "./GrupoEdadCard";

interface GrupoEdadGridProps {
  grupos: GrupoEdad[];
  seleccionadoId: string;
  onSelect: (id: string) => void;
  cargando: boolean;
}

function GrupoEdadSkeleton() {
  return (
    <div className="onboarding-age-skeleton" aria-hidden="true">
      <div className="onboarding-age-skeleton__media" />
      <div className="onboarding-age-skeleton__body">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function GrupoEdadGrid({ grupos, seleccionadoId, onSelect, cargando }: GrupoEdadGridProps) {
  return (
    <fieldset className="onboarding-age-fieldset" aria-busy={cargando}>
      <legend className="sr-only">Selecciona tu franja de edad</legend>

      <div className="onboarding-age-grid">
        {cargando
          ? Array.from({ length: 3 }).map((_, index) => <GrupoEdadSkeleton key={index} />)
          : grupos.map((grupo) => (
              <GrupoEdadCard
                key={grupo.id}
                grupo={grupo}
                seleccionado={seleccionadoId === grupo.id}
                onSelect={onSelect}
              />
            ))}
      </div>
    </fieldset>
  );
}
