import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Copy,
  Eye,
  FilePenLine,
  Gamepad2,
  Layers3,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  archivarTema,
  duplicarTema,
  obtenerTemasAdminPaginados,
  publicarTema,
  despublicarTema,
  type TemaListadoAdmin,
} from "../features/admin/admin.api";
import { obtenerGruposEdad } from "../features/catalog/catalog.api";
import { obtenerSendas } from "../features/sendas/sendas.api";
import { resolverPortadaTemaAdmin, usePortadasFirmadasAdmin } from "../features/admin/admin-theme-cover";

export const Route = createFileRoute("/admin/temas")({ component: AdminThemesPage });

const PAGE_SIZE = 12;
const estados = [
  { id: "todos", label: "Todos" },
  { id: "borrador", label: "Borradores" },
  { id: "revision", label: "En revisión" },
  { id: "aprobado", label: "Aprobados" },
  { id: "publicado", label: "Publicados" },
  { id: "archivado", label: "Archivados" },
];

function AdminThemesPage() {
  const location = useLocation();
  const isExact = location.pathname === "/admin/temas" || location.pathname === "/admin/temas/";
  return isExact ? <AdminThemeLibrary /> : <Outlet />;
}

function AdminThemeLibrary() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState("todos");
  const [sendaId, setSendaId] = useState("");
  const [grupoEdadId, setGrupoEdadId] = useState("");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtros = useMemo(() => ({
    q: query.trim() || undefined,
    estado,
    senda_id: sendaId || undefined,
    grupo_edad_id: grupoEdadId || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  }), [query, estado, sendaId, grupoEdadId, page]);

  const temasQuery = useQuery({
    queryKey: ["admin", "themes", "paginated", filtros],
    queryFn: () => obtenerTemasAdminPaginados(filtros),
    placeholderData: (previous) => previous,
  });
  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas });
  const edadesQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };
  const mutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publicar" | "borrador" | "archivar" | "duplicar" }) => {
      if (action === "publicar") return publicarTema(id);
      if (action === "borrador") return despublicarTema(id);
      if (action === "archivar") return archivarTema(id);
      return duplicarTema(id);
    },
    onSuccess: (_data, variables) => {
      invalidate();
      setOpenMenu(null);
      toast.success(variables.action === "duplicar" ? "Tema duplicado" : "Estado actualizado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo completar la acción"),
  });

  const data = temasQuery.data;
  const portadasFirmadas = usePortadasFirmadasAdmin(data?.temas ?? []);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const resetPage = <T,>(setter: (value: T) => void, value: T) => { setter(value); setPage(1); };

  return (
    <div className="admin-theme-library">
      <section className="admin-theme-library__hero">
        <div>
          <span className="admin-eyebrow">Biblioteca editorial</span>
          <h2>Temas y lecciones</h2>
          <p>Gestiona metadatos, recorrido CRECER, actividades, medios, revisión y publicación desde cada tema.</p>
        </div>
        <div className="admin-theme-library__hero-actions">
          <button type="button" className="admin-secondary-button" onClick={() => navigate({ to: "/admin/revision" })}><Send size={17} /> Cola de revisión</button>
          <button type="button" className="admin-primary-button" onClick={() => navigate({ to: "/admin/temas/new" })}><Plus size={17} /> Crear tema</button>
        </div>
      </section>

      <section className="admin-theme-toolbar" aria-label="Filtros de temas">
        <label className="admin-theme-control"><Search size={17} /><input value={query} onChange={(event) => resetPage(setQuery, event.target.value)} placeholder="Buscar por título, resumen o slug" /></label>
        <label className="admin-theme-control"><span className="sr-only">Senda</span><select value={sendaId} onChange={(event) => resetPage(setSendaId, event.target.value)}><option value="">Todas las sendas</option>{sendasQuery.data?.map((senda) => <option key={senda.id} value={senda.id}>{senda.nombre}</option>)}</select></label>
        <label className="admin-theme-control"><span className="sr-only">Franja</span><select value={grupoEdadId} onChange={(event) => resetPage(setGrupoEdadId, event.target.value)}><option value="">Todas las franjas</option>{edadesQuery.data?.map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>)}</select></label>
        <button type="button" className="admin-secondary-button" onClick={() => { setQuery(""); setSendaId(""); setGrupoEdadId(""); setEstado("todos"); setPage(1); }}>Limpiar</button>
      </section>

      <nav className="admin-theme-tabs" aria-label="Estados editoriales">
        {estados.map((item) => (
          <button key={item.id} type="button" className={`admin-theme-tab ${estado === item.id ? "admin-theme-tab--active" : ""}`} onClick={() => { setEstado(item.id); setPage(1); }}>
            {item.label}
          </button>
        ))}
      </nav>

      {temasQuery.isLoading ? (
        <div className="admin-library-empty"><Loader2 className="mx-auto animate-spin text-violet-600" /><h3>Cargando temas</h3><p>Consultando la biblioteca editorial.</p></div>
      ) : temasQuery.isError ? (
        <div className="admin-library-empty"><BookOpenCheck className="mx-auto text-slate-300" /><h3>No se pudo cargar la biblioteca</h3><p>{temasQuery.error instanceof Error ? temasQuery.error.message : "Vuelve a intentarlo."}</p><button type="button" className="admin-primary-button mt-4" onClick={() => temasQuery.refetch()}>Reintentar</button></div>
      ) : !data?.temas.length ? (
        <div className="admin-library-empty"><BookOpenCheck className="mx-auto text-slate-300" size={34} /><h3>No hay temas con estos filtros</h3><p>Cambia los filtros o crea una nueva lección.</p></div>
      ) : (
        <section className="admin-theme-results" aria-label="Resultados de temas">
          {data.temas.map((tema) => (
            <ThemeLibraryRow
              key={tema.id}
              tema={tema}
              portadaFirmada={portadasFirmadas.get(tema.id) ?? null}
              menuOpen={openMenu === tema.id}
              onToggleMenu={() => setOpenMenu(openMenu === tema.id ? null : tema.id)}
              onNavigate={(destination) => {
                const routes = {
                  detalle: "/admin/temas/$themeId/detalle",
                  editar: "/admin/temas/$themeId/edit",
                  crecer: "/admin/temas/$themeId/crecer",
                  actividades: "/admin/temas/$themeId/activities",
                  preview: "/admin/temas/$themeId/preview",
                } as const;
                navigate({ to: routes[destination], params: { themeId: tema.id } });
              }}
              onAction={(action) => mutation.mutate({ id: tema.id, action })}
              actionPending={mutation.isPending && mutation.variables?.id === tema.id}
            />
          ))}
        </section>
      )}

      <footer className="admin-theme-pagination">
        <span>Mostrando {data?.temas.length ?? 0} de {data?.total ?? 0} temas</span>
        <div className="admin-theme-pagination__buttons">
          <button type="button" aria-label="Página anterior" disabled={page <= 1 || temasQuery.isFetching} onClick={() => setPage((value) => Math.max(1, value - 1))}><ArrowLeft size={16} /></button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" aria-label="Página siguiente" disabled={page >= totalPages || temasQuery.isFetching} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}><ArrowRight size={16} /></button>
        </div>
      </footer>
    </div>
  );
}

function ThemeLibraryRow({ tema, portadaFirmada, menuOpen, onToggleMenu, onNavigate, onAction, actionPending }: {
  tema: TemaListadoAdmin;
  portadaFirmada: string | null;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: (destination: "detalle" | "editar" | "crecer" | "actividades" | "preview") => void;
  onAction: (action: "publicar" | "borrador" | "archivar" | "duplicar") => void;
  actionPending: boolean;
}) {
  const cover = resolverPortadaTemaAdmin({
    titulo: tema.titulo,
    urlFirmada: portadaFirmada,
    urlPublica: tema.portada_recurso?.url_publica ?? null,
  });
  const ages = tema.grupos_edad?.map((grupo) => grupo.nombre).join(", ") || "Sin franja";
  const stateLabel = estados.find((item) => item.id === tema.estado)?.label ?? tema.estado;

  return (
    <article className="admin-theme-row">
      <img className="admin-theme-row__cover" src={cover} alt="" loading="lazy" />
      <button type="button" className="admin-theme-row__identity text-left" onClick={() => onNavigate("detalle")}>
        <strong>{tema.titulo}</strong><p>{tema.resumen || tema.objetivo}</p>
      </button>
      <div className="admin-theme-row__meta"><i>🌱</i><div><strong className="block text-slate-700">{tema.senda?.nombre ?? "Sin senda"}</strong><small>{ages}</small></div></div>
      <div className="admin-theme-row__progress"><header><span>Completitud</span><strong>{tema.completitud.porcentaje}%</strong></header><div><span style={{ width: `${tema.completitud.porcentaje}%` }} /></div><small className="text-[10px] text-slate-400">{tema.completitud.estadisticas.actividades} actividades · {tema.completitud.estadisticas.contenidos_creados}/{tema.completitud.estadisticas.contenidos_esperados} contenidos</small></div>
      <div className="admin-theme-row__author"><span className="admin-state-pill bg-slate-100 text-slate-600">{stateLabel}</span><small className="mt-2 block text-[10px] text-slate-400">{formatDate(tema.actualizado_en)}</small></div>
      <div className="admin-theme-row__actions relative">
        <button type="button" className="admin-icon-button" title="Abrir vista previa" onClick={() => onNavigate("preview")}><Eye size={17} /></button>
        <button type="button" className="admin-icon-button" title="Editar información" onClick={() => onNavigate("editar")}><FilePenLine size={17} /></button>
        <button type="button" className="admin-icon-button" title="Editor CRECER" onClick={() => onNavigate("crecer")}><Layers3 size={17} /></button>
        <button type="button" className="admin-icon-button" title="Actividades" onClick={() => onNavigate("actividades")}><Gamepad2 size={17} /></button>
        <button type="button" className="admin-icon-button" title="Más acciones" onClick={onToggleMenu}>{actionPending ? <Loader2 className="animate-spin" size={17} /> : <MoreHorizontal size={18} />}</button>
        {menuOpen ? (
          <div className="absolute right-0 top-full z-30 mt-2 grid min-w-48 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <button type="button" onClick={() => onNavigate("preview")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"><Eye size={15} /> Vista previa</button>
            <button type="button" onClick={() => onAction("duplicar")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50"><Copy size={15} /> Duplicar completo</button>
            {tema.estado === "publicado" ? <button type="button" onClick={() => onAction("borrador")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-amber-700 hover:bg-amber-50"><FilePenLine size={15} /> Pasar a borrador</button> : <button type="button" disabled={!tema.completitud.listo_para_revision || tema.estado !== "aprobado"} onClick={() => onAction("publicar")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} /> {tema.estado === "aprobado" ? "Publicar" : "Requiere aprobación"}</button>}
            <button type="button" onClick={() => onAction("archivar")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50"><Archive size={15} /> Archivar</button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
