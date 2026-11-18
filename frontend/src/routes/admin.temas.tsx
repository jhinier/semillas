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
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  archivarTema,
  despublicarTema,
  duplicarTema,
  enviarTemaRevision,
  obtenerResumenAdminDetallado,
  obtenerTemasAdminPaginados,
  publicarTema,
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

function resolveEstadoSearch(search: unknown): string {
  const obj = search as Record<string, unknown> | string | undefined;
  let raw: string | null = null;
  if (typeof obj === "string") {
    raw = new URLSearchParams(obj).get("estado");
  } else if (obj && typeof obj.estado === "string") {
    raw = obj.estado;
  } else if (typeof window !== "undefined") {
    raw = new URLSearchParams(window.location.search).get("estado");
  }
  const normalized = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return estados.some((item) => item.id === normalized) ? normalized : "todos";
}

function AdminThemesPage() {
  const location = useLocation();
  const isExact = location.pathname === "/admin/temas" || location.pathname === "/admin/temas/";
  return isExact ? <AdminThemeLibrary /> : <Outlet />;
}

function AdminThemeLibrary() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const estadoSearch = resolveEstadoSearch(location.search);
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState(estadoSearch);
  const [sendaId, setSendaId] = useState("");
  const [grupoEdadId, setGrupoEdadId] = useState("");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    setEstado(estadoSearch);
    setPage(1);
  }, [estadoSearch]);

  const filtros = useMemo(
    () => ({
      q: query.trim() || undefined,
      estado,
      senda_id: sendaId || undefined,
      grupo_edad_id: grupoEdadId || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [query, estado, sendaId, grupoEdadId, page],
  );

  const temasQuery = useQuery({
    queryKey: ["admin", "themes", "paginated", filtros],
    queryFn: () => obtenerTemasAdminPaginados(filtros),
    placeholderData: (previous) => previous,
  });
  const resumenQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: obtenerResumenAdminDetallado,
  });
  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas });
  const edadesQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "activities"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    void queryClient.invalidateQueries({ queryKey: ["temas"] });
    void queryClient.invalidateQueries({ queryKey: ["theme"] });
  };

  const mutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "publicar" | "borrador" | "archivar" | "duplicar" | "revision";
    }) => {
      if (action === "publicar") return publicarTema(id);
      if (action === "borrador") return despublicarTema(id);
      if (action === "archivar") return archivarTema(id);
      if (action === "revision") return enviarTemaRevision(id);
      return duplicarTema(id);
    },
    onSuccess: (_data, variables) => {
      invalidate();
      setOpenMenu(null);
      const mensajes = {
        duplicar: "Copia creada en Borradores",
        publicar: "Tema publicado",
        borrador: "Tema movido a Borradores",
        archivar: "Tema archivado",
        revision: "Enviado a revisión",
      };
      toast.success(mensajes[variables.action]);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo completar la acción"),
  });

  const data = temasQuery.data;
  const portadasFirmadas = usePortadasFirmadasAdmin(data?.temas ?? []);
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));
  const resetPage = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };

  const conteosPorEstado = useMemo(() => {
    const est = resumenQuery.data?.estados;
    if (!est) return null;
    const borrador = est.borrador ?? 0;
    const revision = est.revision ?? 0;
    const aprobado = est.aprobado ?? 0;
    const publicado = est.publicado ?? 0;
    const archivado = est.archivado ?? 0;
    return {
      todos: borrador + revision + aprobado + publicado + archivado,
      borrador,
      revision,
      aprobado,
      publicado,
      archivado,
    } as Record<string, number>;
  }, [resumenQuery.data]);

  const hayFiltrosActivos = Boolean(query.trim() || sendaId || grupoEdadId || estado !== "todos");

  return (
    <div className="admin-theme-library">
      <section className="admin-theme-library__hero">
        <div>
          <span className="admin-eyebrow">Biblioteca de lecciones</span>
          <h2>Temas y borradores</h2>
          <p>Crea temas paso a paso, retoma tus borradores en cualquier momento y filtra por senda, edad o estado.</p>
        </div>
        <div className="admin-theme-library__hero-actions">
          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              navigate({
                to: "/admin/temas/new",
                search: grupoEdadId ? ({ grupoEdadId } as any) : ({} as any),
              })
            }
          >
            <Plus size={17} /> {grupoEdadId ? "Crear tema en esta franja" : "Crear nuevo tema"}
          </button>
        </div>
      </section>

      <section className="admin-theme-toolbar" aria-label="Filtros de temas">
        <label className="admin-theme-control">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => resetPage(setQuery, event.target.value)}
            placeholder="Buscar por título o resumen..."
          />
        </label>
        <label className="admin-theme-control">
          <span className="sr-only">Senda</span>
          <select value={sendaId} onChange={(event) => resetPage(setSendaId, event.target.value)}>
            <option value="">Todas las sendas</option>
            {sendasQuery.data?.map((senda) => (
              <option key={senda.id} value={senda.id}>{senda.nombre}</option>
            ))}
          </select>
        </label>
        <label className="admin-theme-control">
          <span className="sr-only">Edad</span>
          <select value={grupoEdadId} onChange={(event) => resetPage(setGrupoEdadId, event.target.value)}>
            <option value="">Todas las edades</option>
            {edadesQuery.data?.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
            ))}
          </select>
        </label>
        {hayFiltrosActivos ? (
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => {
              setQuery("");
              setSendaId("");
              setGrupoEdadId("");
              setEstado("todos");
              setPage(1);
              navigate({ to: "/admin/temas", search: {} as any, replace: true });
            }}
          >
            Limpiar filtros
          </button>
        ) : null}
      </section>

      <nav className="admin-theme-tabs" aria-label="Estados del tema">
        {estados.map((item) => {
          const count = conteosPorEstado?.[item.id];
          return (
            <button
              key={item.id}
              type="button"
              className={`admin-theme-tab ${estado === item.id ? "admin-theme-tab--active" : ""}`}
              onClick={() => {
                setEstado(item.id);
                setPage(1);
                navigate({
                  to: "/admin/temas",
                  search: (item.id === "todos" ? {} : { estado: item.id }) as any,
                  replace: true,
                });
              }}
            >
              <span>{item.label}</span>
              {typeof count === "number" ? (
                <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] font-bold">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {temasQuery.isLoading ? (
        <div className="admin-library-empty">
          <Loader2 className="mx-auto animate-spin text-violet-600" />
          <h3>Cargando temas</h3>
          <p>Buscando lecciones y borradores guardados.</p>
        </div>
      ) : temasQuery.isError ? (
        <div className="admin-library-empty">
          <BookOpenCheck className="mx-auto text-slate-300" />
          <h3>No se pudieron cargar los temas</h3>
          <p>{temasQuery.error instanceof Error ? temasQuery.error.message : "Vuelve a intentarlo."}</p>
          <button type="button" className="admin-primary-button mt-4" onClick={() => temasQuery.refetch()}>
            Reintentar
          </button>
        </div>
      ) : !data?.temas?.length ? (
        <div className="admin-library-empty">
          <BookOpenCheck className="mx-auto text-slate-300" size={34} />
          <h3>No hay temas que coincidan con estos filtros</h3>
          <p>Prueba quitando un filtro o crea un tema nuevo.</p>
        </div>
      ) : (
        <section className="admin-theme-results" aria-label="Resultados de temas">
          {data.temas.map((tema) => (
            <ThemeLibraryRow
              key={tema.id}
              tema={tema}
              portadaFirmada={portadasFirmadas.get(tema.id) ?? null}
              menuOpen={openMenu === tema.id}
              onToggleMenu={() => setOpenMenu(openMenu === tema.id ? null : tema.id)}
              onCloseMenu={() => setOpenMenu(null)}
              onOpenDetail={() => {
                setOpenMenu(null);
                navigate({ to: "/admin/temas/$themeId/detalle", params: { themeId: tema.id } });
              }}
              onPreview={() => {
                setOpenMenu(null);
                navigate({ to: "/admin/temas/$themeId/preview", params: { themeId: tema.id } });
              }}
              onAction={(action) => mutation.mutate({ id: tema.id, action })}
              actionPending={mutation.isPending && mutation.variables?.id === tema.id}
            />
          ))}
        </section>
      )}

      <footer className="admin-theme-pagination">
        <span>Mostrando {data?.temas?.length ?? 0} de {data?.total ?? 0} temas</span>
        <div className="admin-theme-pagination__buttons">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={page <= 1 || temasQuery.isFetching}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            <ArrowLeft size={16} />
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={page >= totalPages || temasQuery.isFetching}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}

function ThemeLibraryRow({
  tema,
  portadaFirmada,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onOpenDetail,
  onPreview,
  onAction,
  actionPending,
}: {
  tema: TemaListadoAdmin;
  portadaFirmada: string | null;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onOpenDetail: () => void;
  onPreview: () => void;
  onAction: (action: "publicar" | "borrador" | "archivar" | "duplicar" | "revision") => void;
  actionPending: boolean;
}) {
  const cover = resolverPortadaTemaAdmin({
    titulo: tema.titulo,
    urlFirmada: portadaFirmada,
    urlPublica: tema.portada_recurso?.url_publica ?? null,
  });
  const ages = Array.isArray(tema.grupos_edad)
    ? tema.grupos_edad
        .map((grupo) => (typeof grupo === "string" ? grupo : grupo?.nombre ?? ""))
        .filter(Boolean)
        .join(", ") || "Sin edad asignada"
    : "Sin edad asignada";
  const stateLabel = estados.find((item) => item.id === tema.estado)?.label ?? tema.estado;
  const completitud = tema.completitud ?? {
    porcentaje: tema.estado === "publicado" ? 100 : 25,
    listo_para_revision: tema.estado === "publicado",
    bloqueos: [],
    estadisticas: {
      pasos_totales: 6,
      pasos_creados: 6,
      contenidos_creados: 0,
      contenidos_esperados: 6,
      actividades: 0,
    },
  };
  const sendaNombre = Array.isArray(tema.sendas) && tema.sendas.length > 0
    ? tema.sendas.map((s) => s.nombre).join(" · ")
    : typeof tema.senda === "string"
      ? tema.senda
      : tema.senda?.nombre ?? "Sin senda";

  return (
    <article className={`admin-theme-row ${menuOpen ? "admin-theme-row--menu-open" : ""}`}>
      <img className="admin-theme-row__cover" src={cover} alt="" loading="lazy" />
      <button type="button" className="admin-theme-row__identity text-left" onClick={onOpenDetail}>
        <strong>{tema.titulo}</strong>
        <p>{tema.resumen || tema.objetivo || "Sin resumen registrado"}</p>
      </button>
      <div className="admin-theme-row__meta">
        <i>🌱</i>
        <div>
          <strong className="block text-slate-700">{sendaNombre}</strong>
          <small>{ages}</small>
        </div>
      </div>
      <div className="admin-theme-row__progress">
        <header>
          <span>Avance</span>
          <strong>{completitud.porcentaje}%</strong>
        </header>
        <div>
          <span style={{ width: `${completitud.porcentaje}%` }} />
        </div>
        <small className="text-[10px] text-slate-400">
          {completitud.estadisticas?.actividades ?? 0} actividades · {completitud.estadisticas?.contenidos_creados ?? 0}/
          {completitud.estadisticas?.contenidos_esperados ?? 0} momentos
        </small>
      </div>
      <div className="admin-theme-row__author">
        <span
          className={`admin-state-pill ${
            tema.estado === "publicado"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {stateLabel}
        </span>
        <small className="mt-2 block text-[10px] text-slate-400">{formatDate(tema.actualizado_en)}</small>
      </div>
      <div className="admin-theme-row__actions relative">
        <button
          type="button"
          className="admin-secondary-button !px-3 !py-1.5 text-xs font-bold"
          onClick={onOpenDetail}
        >
          {tema.estado === "borrador" ? "Continuar" : "Abrir pasos"}
        </button>
        <button
          type="button"
          className="admin-icon-button"
          title="Vista previa como estudiante"
          aria-label="Vista previa como estudiante"
          onClick={onPreview}
        >
          <Eye size={17} />
        </button>
        <button
          type="button"
          className={`admin-icon-button ${menuOpen ? "bg-slate-100 text-slate-900 border-slate-300" : ""}`}
          title="Opciones de estado"
          aria-label="Opciones de estado"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={onToggleMenu}
        >
          {actionPending ? <Loader2 className="animate-spin" size={17} /> : <MoreHorizontal size={18} />}
        </button>
        {menuOpen ? (
          <>
            <div className="fixed inset-0 z-40" onClick={onCloseMenu} aria-hidden="true" />
            <div role="menu" className="admin-theme-dropdown">
              <button type="button" role="menuitem" onClick={() => onAction("duplicar")} className="admin-theme-dropdown__item">
                <Copy size={15} />
                <span>Hacer una copia</span>
              </button>
              {tema.estado === "publicado" ? (
                <button type="button" role="menuitem" onClick={() => onAction("borrador")} className="admin-theme-dropdown__item is-warning">
                  <FilePenLine size={15} />
                  <span>Pasar a borrador</span>
                </button>
              ) : (
                <>
                  {tema.estado === "borrador" ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!completitud.listo_para_revision}
                      onClick={() => onAction("revision")}
                      className="admin-theme-dropdown__item"
                    >
                      <Send size={15} />
                      <span>{completitud.listo_para_revision ? "Enviar a revisión" : "Completa todos los pasos"}</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={!completitud.listo_para_revision}
                    onClick={() => onAction("publicar")}
                    className="admin-theme-dropdown__item is-success"
                  >
                    <Send size={15} />
                    <span>{completitud.listo_para_revision ? "Publicar ahora" : "Aún incompleto"}</span>
                  </button>
                </>
              )}
              {tema.estado !== "archivado" ? (
                <button type="button" role="menuitem" onClick={() => onAction("archivar")} className="admin-theme-dropdown__item is-danger">
                  <Archive size={15} />
                  <span>Archivar tema</span>
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Sin fecha"
    : new Intl.DateTimeFormat("es-EC", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
}
