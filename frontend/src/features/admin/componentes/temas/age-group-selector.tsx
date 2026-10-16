import { Check, PencilLine, Target } from "lucide-react";

interface AgeGroup {
  id: string;
  nombre?: string | null;
  descripcion?: string | null;
  edad_minima?: number;
  edad_maxima?: number;
}

interface AgeGroupSelectorProps {
  ageGroups: AgeGroup[];
  selectedAgeGroupId: string;
  onSelect: (id: string) => void;
  hasDraft?: (id: string) => boolean;
}

export function AgeGroupSelector({
  ageGroups,
  selectedAgeGroupId,
  onSelect,
  hasDraft,
}: AgeGroupSelectorProps) {
  return (
    <section className="admin-crecer-control admin-crecer-control--age">
      <div className="admin-crecer-control__heading">
        <div className="admin-crecer-control__icon" aria-hidden="true">
          <Target size={18} />
        </div>
        <div>
          <h2>Franja de edad</h2>
          <p>Cada audiencia conserva su propia versión.</p>
        </div>
      </div>

      <div className="admin-crecer-age-options" role="group" aria-label="Franja de edad">
        {ageGroups.map((ageGroup) => {
          const isActive = ageGroup.id === selectedAgeGroupId;
          const hasLocalDraft = hasDraft?.(ageGroup.id) ?? false;
          const ageRange =
            ageGroup.edad_minima != null && ageGroup.edad_maxima != null
              ? `${ageGroup.edad_minima}–${ageGroup.edad_maxima} años`
              : "Franja etaria";

          return (
            <button
              key={ageGroup.id}
              type="button"
              onClick={() => onSelect(ageGroup.id)}
              className={`admin-crecer-age-option ${isActive ? "admin-crecer-age-option--active" : ""}`}
              aria-pressed={isActive}
              title={hasLocalDraft ? `${ageGroup.descripcion ?? ageRange} · Tiene borrador sin guardar` : ageGroup.descripcion ?? ageRange}
            >
              <span className="admin-crecer-age-option__indicator" aria-hidden="true">
                {hasLocalDraft ? (
                  <PencilLine size={14} className="text-amber-600" />
                ) : isActive ? (
                  <Check size={14} strokeWidth={3} />
                ) : null}
              </span>

              <span className="admin-crecer-age-option__copy">
                <strong>{ageGroup.nombre ?? "Franja sin nombre"}</strong>
                <small>{ageRange}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
