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
  getAgeGroupMeta?: (id: string) => { subtitle?: string; badge?: string } | undefined;
  onEditAgeGroups?: () => void;
}

export function AgeGroupSelector({
  ageGroups,
  selectedAgeGroupId,
  onSelect,
  hasDraft,
  getAgeGroupMeta,
  onEditAgeGroups,
}: AgeGroupSelectorProps) {
  if (ageGroups.length === 0) return null;

  const esUnicaFranja = ageGroups.length === 1;
  if (esUnicaFranja) {
    const unica = ageGroups[0]!;
    const meta = getAgeGroupMeta?.(unica.id);
    const ageRange =
      unica.edad_minima != null && unica.edad_maxima != null
        ? `${unica.edad_minima}–${unica.edad_maxima} años`
        : "Franja etaria";
    return (
      <section className="admin-crecer-control admin-crecer-control--age" aria-label="Franja elegida en Paso 1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="admin-crecer-control__icon" aria-hidden="true">
              <Target size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="m-0">Franja definida en Paso 1: {unica.nombre ?? "Franja sin nombre"}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Check size={12} strokeWidth={3} /> {ageRange}
                </span>
                {meta?.badge ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {meta.badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5">
                Solo se verifica el método CRECER para esta franja (no hace falta volver a seleccionarla aquí).
              </p>
            </div>
          </div>
          {onEditAgeGroups ? (
            <button
              type="button"
              onClick={onEditAgeGroups}
              className="text-xs font-bold text-violet-600 hover:underline dark:text-violet-300"
            >
              Cambiar en Paso 1
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="admin-crecer-control admin-crecer-control--age">
      <div className="admin-crecer-control__heading">
        <div className="admin-crecer-control__icon" aria-hidden="true">
          <Target size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2>1. Alterna entre las {ageGroups.length} franjas elegidas en Paso 1</h2>
            {onEditAgeGroups ? (
              <button
                type="button"
                onClick={onEditAgeGroups}
                className="text-[11px] font-bold text-violet-600 hover:underline dark:text-violet-300"
              >
                Editar franjas en Paso 1
              </button>
            ) : null}
          </div>
          <p>
            Solo aparecen las {ageGroups.length} franjas seleccionadas en Datos base; las demás franjas no se muestran ni se exigen.
          </p>
        </div>
      </div>

      <div
        className="admin-crecer-age-options"
        role="group"
        aria-label="Franja de edad"
        style={{
          gridTemplateColumns:
            ageGroups.length === 2 ? "repeat(2, minmax(0, 1fr))" : undefined,
        }}
      >
        {ageGroups.map((ageGroup) => {
          const isActive = ageGroup.id === selectedAgeGroupId;
          const hasLocalDraft = hasDraft?.(ageGroup.id) ?? false;
          const meta = getAgeGroupMeta?.(ageGroup.id);
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
                <small>{meta?.subtitle ?? ageRange}</small>
                {meta?.badge ? <span>{meta.badge}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
