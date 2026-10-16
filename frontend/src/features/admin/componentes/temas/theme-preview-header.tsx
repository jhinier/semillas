import type { LucideIcon } from "lucide-react";
import { Clock3, Trophy, LayoutGrid, Users, Sparkles, BookOpenText } from "lucide-react";

export interface ThemePreviewHeaderProps {
  theme?: {
    titulo?: string | null;
    resumen?: string | null;
    objetivo?: string | null;
    version_contenido?: number | null;
    minutos_estimados?: number | null;
    xp_recompensa?: number | null;
    version_biblica_id?: string | number | null;
    actualizado_en?: string | null;
    publicado_en?: string | null;
    slug?: string | null;
    portada_recurso?: { url_publica?: string | null } | null;
    grupos_edad?: Array<{ id: string; nombre?: string | null }> | null;
    senda?: { nombre?: string | null } | null;
    versiculo_clave?: {
      texto?: string | null;
      libro_id?: string | null;
      capitulo?: number | null;
      versiculo?: number | null;
    } | null;
  };
  portadaUrl: string | null;
  estado: { clase: string; punto: string; etiqueta: string };
  formatDate: (dateStr?: string | null) => string;
  formatDateTime: (dateStr?: string | null) => string;
  onEdit: () => void;
  onViewDetail: () => void;
}

export function ThemePreviewHeader({
  theme,
  portadaUrl,
  estado,
  formatDate,
  formatDateTime,
}: ThemePreviewHeaderProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1.2fr_.8fr]">
        <div className="flex flex-col gap-5 p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <StatusPill clase={estado.clase} punto={estado.punto} texto={estado.etiqueta} />
            <Chip>{theme?.senda?.nombre ?? "Senda sin definir"}</Chip>
            <Chip>{theme?.grupos_edad?.length ? `${theme.grupos_edad.length} franjas` : "Sin franjas"}</Chip>
            <Chip>{theme?.version_biblica_id ? "Con versión bíblica" : "Sin versión bíblica"}</Chip>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-slate-400">
              Vista previa editorial
            </p>
            <h1 className="max-w-3xl text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {theme?.titulo ?? "Sin título"}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              {theme?.resumen ?? "Sin resumen"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricMini icon={Clock3} label="Duración" value={`${theme?.minutos_estimados ?? 0} min`} />
            <MetricMini icon={Trophy} label="XP" value={`${theme?.xp_recompensa ?? 0}`} />
            <MetricMini icon={LayoutGrid} label="Versión" value={`v${theme?.version_contenido ?? 0}`} />
            <MetricMini icon={Users} label="Edad" value={theme?.grupos_edad?.length ? `${theme.grupos_edad.length} grupos` : "—"} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SubPanel title="Objetivo" icon={Sparkles}>
              <p className="text-sm leading-7 text-slate-600">
                {theme?.objetivo ?? "—"}
              </p>
            </SubPanel>

            <SubPanel title="Versículo clave" icon={BookOpenText}>
              {theme?.versiculo_clave ? (
                <>
                  <p className="text-sm leading-7 text-slate-600">
                    "{theme.versiculo_clave.texto}"
                  </p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-green-600">
                    {theme.versiculo_clave.libro_id}:{theme.versiculo_clave.capitulo}:{theme.versiculo_clave.versiculo}
                  </p>
                </>
              ) : (
                <p className="text-sm leading-7 text-slate-500">No hay versículo clave configurado.</p>
              )}
            </SubPanel>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-amber-50/30 p-6 lg:border-l lg:border-t-0 lg:p-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
            {portadaUrl ? (
              <img src={portadaUrl} alt={`Portada de ${theme?.titulo ?? "tema"}`} className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <LayoutGrid size={24} />
                </div>
                <p className="text-sm font-bold text-slate-600">Sin portada todavía</p>
                <p className="text-xs leading-6 text-slate-400">
                  La vista previa funciona mejor con una portada cargada.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            <InfoCard label="Última actualización" value={formatDateTime(theme?.actualizado_en)} />
            <InfoCard label="Publicado" value={formatDate(theme?.publicado_en)} />
            <InfoCard label="Slug" value={theme?.slug ?? "—"} mono />
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
  return <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">{children}</span>;
}

function MetricMini({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-100 bg-amber-50/30 p-3">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={14} className="text-green-600" />
        <p className="text-[10px] font-bold uppercase tracking-[0.22em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}

function SubPanel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-amber-50/30 p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-700">
        <Icon size={16} className="text-green-600" />
        <h3 className="text-sm font-black">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold text-slate-700 ${mono ? "font-mono text-[11px]" : ""}`}>{value}</p>
    </div>
  );
}
