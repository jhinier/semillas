import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Eye,
  FilePenLine,
  Gamepad2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  duplicarActividad,
  eliminarActividad,
  type ActividadAdmin,
} from "@/features/admin/admin.api";
import {
  type ActivityLibraryStatus,
  getActivityLibraryStatus,
  useAdminActivities,
} from "@/features/admin/hooks/use-admin-activities";
import { getActivityTypeDefinition } from "@/features/admin/componentes/temas/activity-type-catalog";
import "./admin-activities-studio.css";

export const Route = createFileRoute("/admin/actividades")({
  component: AdminActivitiesPage,
});

const STATUS_TABS: Array<{ id: ActivityLibraryStatus; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "publicada", label: "Publicadas" },
  { id: "revision", label: "En revisión" },
  { id: "borrador", label: "Borradores" },
];

function AdminActivitiesPage() {
  const page = useAdminActivities();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [themeSearch, setThemeSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "activities"] });
  const duplicateMutation = useMutation({
    mutationFn: duplicarActividad,
    onSuccess: async () => {
      await invalidate();
      toast.success("Actividad duplicada");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo duplicar"),
  });
  const deleteMutation = useMutation({
    mutationFn: eliminarActividad,
    onSuccess: async () => {
      await invalidate();
      toast.success("Actividad eliminada");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo eliminar"),
  });

  const matchingThemes = useMemo(() => {
    const query = themeSearch.trim().toLocaleLowerCase("es");
    return page.temasBase
      .filter((theme) => !query || theme.titulo.toLocaleLowerCase("es").includes(query))
      .slice(0, 12);
  }, [page.temasBase, themeSearch]);

  const openEditor = (activity: ActividadAdmin, tab: "contexto" | "preview" = "contexto") => {
    navigate({
      to: "/admin/temas/$themeId/activities",
      params: { themeId: activity.tema_id },
      search: { form: "editar", actividadId: activity.id, tab },
    });
  };

  return (
    <div className="activity-library-v2">
      <header className="activity-library-v2__hero">
        <div className="activity-library-v2__heading">
          <span className="activity-library-v2__icon"><Gamepad2 size={24} /></span>
          <div>
            <span className="admin-eyebrow">Biblioteca editorial</span>
            <h1>Actividades</h1>
            <p>Localiza, revisa y edita experiencias sin perder el contexto del tema.</p>
          </div>
        </div>
        <div className="activity-library-v2__hero-actions">
          <div className="activity-library-v2__metric"><strong>{page.statusCounts.todas}</strong><span>actividades</span></div>
          <button type="button" className="admin-primary-button" onClick={() => setShowThemePicker(true)}><Plus size={17} /> Nueva actividad</button>
        </div>
      </header>

      <section className="activity-library-v2__filters" aria-label="Filtros de actividades">
        <div className="activity-library-status-tabs">
          {STATUS_TABS.map((tab) => (
            <button key={tab.id} type="button" onClick={() => page.setActiveStatus(tab.id)} className={page.activeStatus === tab.id ? "activity-library-status-tab--active" : ""}>
              {tab.label}<span>{page.statusCounts[tab.id]}</span>
            </button>
          ))}
        </div>
        <div className="activity-library-filter-grid">
          <label className="activity-library-search"><Search size={17} /><input value={page.searchValue} onChange={(event) => page.setSearchValue(event.target.value)} placeholder="Buscar por título, tema o consigna…" /></label>
          <select value={page.selectedTypeCode} onChange={(event) => page.setSelectedTypeCode(event.target.value)} aria-label="Filtrar por tipo">
            <option value="">Todos los tipos</option>
            {page.activityTypesBase.map((type) => <option key={type.id} value={type.codigo}>{type.nombre} ({page.typeCounts[type.codigo] ?? 0})</option>)}
          </select>
          <select value={page.selectedTemaId} onChange={(event) => page.setSelectedTemaId(event.target.value)} aria-label="Filtrar por tema">
            <option value="">Todos los temas</option>
            {page.temasBase.map((theme) => <option key={theme.id} value={theme.id}>{theme.titulo}</option>)}
          </select>
          <select value={page.selectedSendaId} onChange={(event) => page.setSelectedSendaId(event.target.value)} aria-label="Filtrar por senda">
            <option value="">Todas las sendas</option>
            {page.sendasBase.map((path) => <option key={path.id} value={path.id}>{path.nombre}</option>)}
          </select>
          <select value={page.selectedAgeGroupId} onChange={(event) => page.setSelectedAgeGroupId(event.target.value)} aria-label="Filtrar por franja">
            <option value="">Todas las franjas</option>
            {page.ageGroupsBase.map((group) => <option key={group.id} value={group.id}>{group.nombre}</option>)}
          </select>
          {page.hasFilters ? <button type="button" className="activity-library-clear" onClick={page.clearFilters}><RotateCcw size={15} /> Limpiar</button> : null}
        </div>
      </section>

      <section className="activity-library-v2__results">
        <header>
          <div><span className="admin-eyebrow">Resultados</span><h2>{page.filteredTotal} {page.filteredTotal === 1 ? "actividad" : "actividades"}</h2></div>
          <p>Abre la vista previa para validar la experiencia o entra al editor para modificarla.</p>
        </header>

        {page.isLoading ? (
          <div className="admin-activity-loading"><Loader2 className="animate-spin" /><span>Cargando biblioteca…</span></div>
        ) : page.isError ? (
          <div className="admin-activity-error"><strong>No se pudo cargar la biblioteca</strong><button type="button" onClick={() => void invalidate()}>Reintentar</button></div>
        ) : page.activities.length === 0 ? (
          <div className="admin-activity-empty-state"><span><Search size={24} /></span><h3>No hay coincidencias</h3><p>Ajusta los filtros o crea una actividad nueva.</p>{page.hasFilters ? <button type="button" className="admin-secondary-button" onClick={page.clearFilters}>Limpiar filtros</button> : null}</div>
        ) : (
          <div className="activity-library-list">
            {page.activities.map((activity) => {
              const definition = getActivityTypeDefinition(activity.tipo_actividad?.codigo);
              const Icon = definition.icono;
              const status = getActivityLibraryStatus(activity);
              return (
                <article key={activity.id} className="activity-library-row">
                  <span className={`admin-activity-type-icon admin-activity-type-icon--${definition.tono}`}><Icon size={20} /></span>
                  <div className="activity-library-row__copy">
                    <div className="activity-library-row__title"><h3>{activity.titulo}</h3><StatusBadge status={status} /></div>
                    <p>{activity.consigna}</p>
                    <div className="admin-activity-meta">
                      <span>{activity.tipo_actividad?.nombre ?? definition.nombre}</span>
                      <span>{activity.grupo_edad?.nombre ?? "Sin franja"}</span>
                      <span>{activity.xp_recompensa} XP</span>
                      <span>{formatDifficulty(activity.dificultad)}</span>
                    </div>
                  </div>
                  <div className="activity-library-row__context">
                    <strong>{activity.tema?.titulo ?? "Tema sin nombre"}</strong>
                    <span>{activity.tema?.senda?.nombre ?? "Sin senda"}</span>
                    <small>{formatDate(activity.actualizado_en ?? activity.creado_en)}</small>
                  </div>
                  <div className="activity-library-row__actions">
                    <button type="button" onClick={() => openEditor(activity, "preview")} aria-label="Vista previa"><Eye size={16} /></button>
                    <button type="button" onClick={() => openEditor(activity)} aria-label="Editar"><Pencil size={16} /></button>
                    <div className="activity-library-row__menu">
                      <button type="button" onClick={() => setOpenMenuId(openMenuId === activity.id ? null : activity.id)} aria-label="Más acciones"><MoreHorizontal size={17} /></button>
                      {openMenuId === activity.id ? (
                        <div role="menu">
                          <button type="button" role="menuitem" onClick={() => { setOpenMenuId(null); duplicateMutation.mutate(activity.id); }}><Copy size={15} /> Duplicar</button>
                          <button type="button" role="menuitem" className="activity-library-row__delete" onClick={() => {
                            setOpenMenuId(null);
                            if (window.confirm(`¿Eliminar “${activity.titulo}”? Esta acción no se puede deshacer.`)) deleteMutation.mutate(activity.id);
                          }}><Trash2 size={15} /> Eliminar</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="activity-library-pagination">
          <span>Mostrando {page.filteredTotal ? (page.paginaActual - 1) * page.porPagina + 1 : 0}–{Math.min(page.paginaActual * page.porPagina, page.filteredTotal)} de {page.filteredTotal}</span>
          <div>
            <button type="button" disabled={page.paginaActual === 1} onClick={() => page.setPaginaActual(page.paginaActual - 1)} aria-label="Página anterior"><ArrowLeft size={16} /></button>
            <strong>{page.paginaActual} / {page.totalPages}</strong>
            <button type="button" disabled={page.paginaActual === page.totalPages} onClick={() => page.setPaginaActual(page.paginaActual + 1)} aria-label="Página siguiente"><ArrowRight size={16} /></button>
          </div>
          <select value={page.porPagina} onChange={(event) => page.setPorPagina(Number(event.target.value))} aria-label="Elementos por página"><option value={10}>10 por página</option><option value={20}>20 por página</option><option value={50}>50 por página</option></select>
        </footer>
      </section>

      {showThemePicker ? (
        <div className="activity-theme-picker-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setShowThemePicker(false); }}>
          <section className="activity-theme-picker" role="dialog" aria-modal="true" aria-labelledby="activity-theme-picker-title">
            <header><div><span className="admin-eyebrow">Nueva actividad</span><h2 id="activity-theme-picker-title">Elige el tema</h2><p>La actividad se crea dentro de un tema para conservar la franja y el recorrido CRECER.</p></div><button type="button" onClick={() => setShowThemePicker(false)} aria-label="Cerrar"><X size={19} /></button></header>
            <label className="activity-library-search"><Search size={17} /><input autoFocus value={themeSearch} onChange={(event) => setThemeSearch(event.target.value)} placeholder="Buscar tema…" /></label>
            <div className="activity-theme-picker__list">
              {matchingThemes.map((theme) => (
                <button key={theme.id} type="button" onClick={() => navigate({ to: "/admin/temas/$themeId/activities", params: { themeId: theme.id }, search: { form: "nueva", tab: "contexto" } })}>
                  <span><FilePenLine size={17} /></span><div><strong>{theme.titulo}</strong><small>{theme.estado === "publicado" ? "Publicado" : "Borrador"}</small></div><ArrowRight size={17} />
                </button>
              ))}
              {!matchingThemes.length ? <div className="activity-theme-picker__empty"><Search size={20} /><p>No se encontraron temas.</p></div> : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: "publicada" | "revision" | "borrador" }) {
  if (status === "publicada") return <span className="activity-status activity-status--published"><CheckCircle2 size={13} /> Publicada</span>;
  if (status === "revision") return <span className="activity-status activity-status--review"><FilePenLine size={13} /> En revisión</span>;
  return <span className="activity-status activity-status--draft">Borrador</span>;
}

function formatDifficulty(value: string) {
  if (value === "dificil") return "Difícil";
  if (value === "normal") return "Normal";
  return "Fácil";
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-EC", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
