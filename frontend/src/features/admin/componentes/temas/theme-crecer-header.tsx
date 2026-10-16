import type { LucideIcon } from "lucide-react";
import { Layers3, Clock3, Sparkles, NotebookPen, Eye } from "lucide-react";
import { formatElapsed } from "./theme-view.utils";

interface ThemeCrecerHeaderProps {
  theme?: {
    titulo?: string | null;
    objetivo?: string | null;
    actualizado_en?: string | null;
    portada_recurso?: { url_publica?: string | null } | null;
    senda?: { nombre?: string | null } | null;
  };
  portadaUrl: string | null;
  estado: {
    clase: string;
    punto: string;
    etiqueta: string;
    fondoHero: string;
    brillo: string;
  };
  pasosCompletos: number;
  totalPasos: number;
  progreso: number;
  selectedAgeGroup?: {
    id: string;
    nombre?: string | null;
    descripcion?: string | null;
    edad_minima?: number;
    edad_maxima?: number;
  } | null;
  onBack: () => void;
}

export function ThemeCrecerHeader({
  theme,
  portadaUrl,
  estado,
  pasosCompletos,
  totalPasos,
  progreso,
  selectedAgeGroup,
  onBack,
}: ThemeCrecerHeaderProps) {
  return (
    <section className={`relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br ${estado.fondoHero} text-white shadow-[0_24px_80px_rgba(18,59,44,0.16)]`}>
      <div className={`absolute inset-0 ${estado.brillo}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_28%)]" />

      <div className="relative grid gap-6 p-6 lg:grid-cols-[1.15fr_.85fr] lg:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <StatusPill clase={estado.clase} punto={estado.punto} texto={`Editor ${estado.etiqueta}`} />
            <Chip>{theme?.senda?.nombre ?? "Senda sin definir"}</Chip>
            <Chip>{theme?.titulo ?? "Tema sin título"}</Chip>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-white/60">
              Editor CRECER
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {theme?.titulo ?? "Sin título"}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-white/82 sm:text-[15px]">
              {theme?.objetivo ?? "Completa los seis momentos CRECER para cada franja de edad."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricMini icon={Layers3} label="Pasos" value={`${pasosCompletos}/${totalPasos}`} />
            <MetricMini icon={Clock3} label="Actualizado" value={formatElapsed(theme?.actualizado_en)} />
            <MetricMini icon={Sparkles} label="Progreso" value={`${progreso}%`} />
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 p-4 backdrop-blur">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10">
            {portadaUrl ? (
              <img src={portadaUrl} alt={`Portada de ${theme?.titulo ?? "tema"}`} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 px-6 text-center text-white/72">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12">
                  <NotebookPen size={24} className="text-white/80" />
                </div>
                <p className="text-sm font-bold">Sin portada configurada</p>
                <p className="text-xs leading-6 text-white/58">
                  El editor se ve mejor con portada y metadatos completos.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/15 bg-white/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">Franja activa</p>
            {selectedAgeGroup ? (
              <>
                <p className="mt-2 text-sm font-black text-white">{selectedAgeGroup.nombre}</p>
                <p className="mt-1 text-xs leading-6 text-white/68">
                  {selectedAgeGroup.descripcion ?? `${selectedAgeGroup.edad_minima}-${selectedAgeGroup.edad_maxima} años`}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm font-semibold text-white/72">Selecciona una franja para empezar a editar.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ clase, punto, texto }: { clase: string; punto: string; texto: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] ${clase}`}>
      <span className={`h-2 w-2 rounded-full ${punto}`} />
      {texto}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/72">{children}</span>;
}

function MetricMini({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/12 bg-white/10 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-white/62">
        <Icon size={14} />
        <p className="text-[10px] font-bold uppercase tracking-[0.22em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}
