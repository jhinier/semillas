import type { ReactNode } from "react";
import { Sparkles, BookOpenText, BadgeInfo } from "lucide-react";

interface ThemeSummary {
  estado?: string | null;
  minutos_estimados?: number | null;
  xp_recompensa?: number | null;
  version_contenido?: number | null;
  grupos_edad?: Array<{ id: string; nombre?: string | null }> | null;
  actualizado_en?: string | null;
  publicado_en?: string | null;
  slug?: string | null;
  senda?: { nombre?: string | null } | null;
  creado_por?: { nombre_visible?: string | null } | null;
}

interface PreviewSidebarProps {
  theme?: ThemeSummary | null;
  estado: { etiqueta: string };
  onEdit: () => void;
  onViewDetail: () => void;
  formatDate: (dateStr?: string | null) => string;
  formatDateTime: (dateStr?: string | null) => string;
}

export function PreviewSidebar({
  theme,
  estado,
  onEdit,
  onViewDetail,
  formatDate,
  formatDateTime,
}: PreviewSidebarProps) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Sparkles size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Resumen rápido</p>
        </div>

        <div className="mt-4 grid gap-3">
          <SidebarMetric label="Estado" value={estado.etiqueta} />
          <SidebarMetric label="Duración" value={`${theme?.minutos_estimados ?? 0} min`} />
          <SidebarMetric label="XP" value={`${theme?.xp_recompensa ?? 0}`} />
          <SidebarMetric label="Versión" value={`v${theme?.version_contenido ?? 0}`} />
        </div>

        <div className="mt-4 rounded-2xl bg-[#f7f4ec] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Disponible para</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {theme?.grupos_edad?.length ? (
              theme.grupos_edad.map((grupo) => (
                <span key={grupo.id} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {grupo.nombre}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">Sin franjas asignadas</span>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <BookOpenText size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Metadatos</p>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          <MetaRow label="Senda" value={theme?.senda?.nombre ?? "—"} />
          <MetaRow label="Creado por" value={theme?.creado_por?.nombre_visible ?? "—"} />
          <MetaRow label="Publicado" value={formatDate(theme?.publicado_en)} />
          <MetaRow label="Actualizado" value={formatDateTime(theme?.actualizado_en)} />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <BadgeInfo size={16} />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]">Acciones</p>
        </div>

        <div className="mt-4 grid gap-2">
          <ActionButton onClick={onEdit}>
            Editar tema
          </ActionButton>
          <ActionButton onClick={onViewDetail} secondary>
            Ver detalle
          </ActionButton>
        </div>
      </section>
    </aside>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className="text-sm font-extrabold text-slate-800">{value}</span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function ActionButton({ children, onClick, secondary = false }: { children: ReactNode; onClick: () => void; secondary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition-colors ${secondary ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-green-600 text-white hover:opacity-95"}`}
    >
      {children}
    </button>
  );
}
