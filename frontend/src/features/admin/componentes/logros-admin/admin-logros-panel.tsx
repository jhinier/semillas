import { useDeferredValue, useEffect, useState } from "react";
import { Archive, ArchiveRestore, Medal, Pencil, Plus, Search, ShieldAlert, WifiOff } from "lucide-react";
import { toast } from "sonner";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";
import in2Img from "@/assets/images/Ilustraciones/in2.webp";
import { Paginacion } from "@/componentes/ui/paginacion";
import { subirArchivo } from "@/features/media/media.api";
import { useResolvedMediaUrl } from "@/features/media/use-resolved-media-url";
import type {
  CodigoCriterioLogro,
  LogroAdminResumen,
} from "../../admin-logros.api";
import { useAdminLogros } from "../../hooks/use-admin-logros";
import {
  CRITERIOS_LOGRO,
  describirReglaLogro,
  formatearFechaCorta,
} from "./logros-admin-utils";
import { DialogoConfirmacionLogro, type ConfirmacionLogroAccion } from "./DialogoConfirmacionLogro";
import { FormularioLogro } from "./FormularioLogro";
import "./admin-logros-studio.css";

type EstadoFiltro = "activo" | "archivado" | "todos";

type AdminLogrosPanelProps = {
  onNuevoLogro?: () => void;
};

const TABS_ESTADO: Array<{ valor: EstadoFiltro; etiqueta: string }> = [
  { valor: "activo", etiqueta: "Activos" },
  { valor: "archivado", etiqueta: "Archivados" },
  { valor: "todos", etiqueta: "Todos" },
];

export function AdminLogrosPanel({ onNuevoLogro }: AdminLogrosPanelProps = {}) {
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDeferredValue(busqueda.trim());
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("activo");
  const [criterioFiltro, setCriterioFiltro] = useState<CodigoCriterioLogro | "todos">("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);
  const [confirmacion, setConfirmacion] = useState<ConfirmacionLogroAccion | null>(null);
  const [logroEnEdicion, setLogroEnEdicion] = useState<LogroAdminResumen | null>(null);

  const filtros = {
    q: busquedaDiferida || undefined,
    estado: estadoFiltro,
    criterio: criterioFiltro === "todos" ? undefined : criterioFiltro,
    limit: porPagina,
    offset: (paginaActual - 1) * porPagina,
  };

  const { estaConectado, listado, actualizar, archivar, reactivar, mutando } = useAdminLogros(filtros);
  const data = listado.data;
  const totalItems = data?.meta?.total ?? (data as { total?: number } | undefined)?.total ?? 0;

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil(totalItems / porPagina));
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [totalItems, paginaActual, porPagina]);

  function abrirEditar(logro: LogroAdminResumen) {
    setLogroEnEdicion(logro);
  }

  function navegarNuevoLogro() {
    if (onNuevoLogro) {
      onNuevoLogro();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.assign("/admin/logros/nuevo");
    }
  }

  async function manejarConfirmar() {
    if (!confirmacion) return;
    if (confirmacion.tipo === "archivar") {
      await archivar.mutateAsync(confirmacion.logroId);
    } else {
      await reactivar.mutateAsync(confirmacion.logroId);
    }
    setConfirmacion(null);
  }

  return (
    <section aria-labelledby="admin-logros-title" className="admin-logros-page">
      <header className="admin-logros-hero">
        <div className="admin-logros-hero__left">
          <div className="admin-logros-hero__icon" aria-hidden="true">
            <Medal className="size-6" />
          </div>
          <div>
            <p className="admin-logros-eyebrow">Gamificación</p>
            <h1 id="admin-logros-title" className="admin-logros-title">
              Logros
            </h1>
            <p className="admin-logros-subtitle">
              Crea medallas, define en qué momento se entregan y motiva el avance de cada niño.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={navegarNuevoLogro}
          disabled={!estaConectado || mutando}
          className="admin-logros-primary-btn"
        >
          <Plus className="size-4" aria-hidden="true" /> Nuevo logro
        </button>
      </header>

      {!estaConectado ? (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <WifiOff className="size-5 shrink-0" aria-hidden="true" />
          <span>Sin conexión. La gestión de logros requiere conexión activa.</span>
        </div>
      ) : null}

      <div className="admin-logros-toolbar">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="admin-logros-tabs" role="tablist" aria-label="Filtrar por estado">
            {TABS_ESTADO.map((tab) => {
              const activo = estadoFiltro === tab.valor;
              return (
                <button
                  key={tab.valor}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => {
                    setEstadoFiltro(tab.valor);
                    setPaginaActual(1);
                  }}
                  disabled={!estaConectado}
                  className={`admin-logros-tab ${activo ? "is-active" : ""}`}
                >
                  {tab.etiqueta}
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-logros-filters-row">
          <label className="admin-logros-search-wrap">
            <span className="sr-only">Buscar logros</span>
            <Search className="admin-logros-search-icon size-4" aria-hidden="true" />
            <input
              aria-label="Buscar logros"
              type="search"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              disabled={!estaConectado}
              placeholder="Buscar por nombre o descripción"
              className="admin-logros-input admin-logros-input--with-icon"
            />
          </label>

          <label>
            <span className="sr-only">Filtrar por criterio</span>
            <select
              aria-label="Filtrar por criterio"
              value={criterioFiltro}
              onChange={(e) => {
                setCriterioFiltro(e.target.value as CodigoCriterioLogro | "todos");
                setPaginaActual(1);
              }}
              disabled={!estaConectado}
              className="admin-logros-select font-semibold"
            >
              <option value="todos">Todos los criterios</option>
              {CRITERIOS_LOGRO.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {listado.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <ShieldAlert className="mx-auto size-8 text-red-600" aria-hidden="true" />
          <p className="mt-3 font-bold text-red-900">
            {listado.error instanceof Error ? listado.error.message : "No se pudieron cargar los logros."}
          </p>
          <button
            type="button"
            onClick={() => void listado.refetch()}
            disabled={!estaConectado}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="admin-logros-table-card">
          <div className="admin-logros-table-header">
            <div className="flex items-center gap-2">
              <Medal className="size-4 text-violet-500" aria-hidden="true" />
              <span>
                <strong className="admin-logros-count">{totalItems}</strong>{" "}
                {totalItems === 1 ? "logro encontrado" : "logros encontrados"}
              </span>
            </div>
            <span className="text-xs opacity-75">
              Edita cualquier medalla para ajustar su mensaje, meta o diseño.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Insignia</th>
                  <th className="px-4 py-3">Cómo se gana</th>
                  <th className="px-4 py-3 text-center">Premio</th>
                  <th className="px-4 py-3 text-center">Ganado por</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listado.isLoading ? (
                  Array.from({ length: 6 }, (_, i) => (
                    <tr key={i} aria-label="Cargando logros">
                      {Array.from({ length: 6 }, (_, c) => (
                        <td key={c} className="px-4 py-4">
                          <span className="block h-4 animate-pulse rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (data?.logros ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <p className="font-bold text-slate-700">No hay logros para estos filtros.</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Prueba cambiando el filtro superior o crea un nuevo logro.
                      </p>
                      <button
                        type="button"
                        onClick={navegarNuevoLogro}
                        className="mt-4 text-sm font-bold text-violet-600 hover:text-violet-700"
                      >
                        + Crear nuevo logro
                      </button>
                    </td>
                  </tr>
                ) : (
                  (data?.logros ?? []).map((logro) => (
                    <FilaLogro
                      key={logro.id}
                      logro={logro}
                      onEditar={() => abrirEditar(logro)}
                      onConfirmarAccion={(tipo) =>
                        setConfirmacion({ tipo, logroId: logro.id, nombre: logro.nombre })
                      }
                      deshabilitado={!estaConectado || mutando}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && totalItems > 0 ? (
            <Paginacion
              total={totalItems}
              paginaActual={paginaActual}
              porPagina={porPagina}
              onCambiarPagina={setPaginaActual}
              onCambiarPorPagina={(cantidad) => {
                setPorPagina(cantidad);
                setPaginaActual(1);
              }}
              opcionesPorPagina={[10, 20, 50]}
              className="border-t border-slate-200 px-4 py-3"
            />
          ) : null}
        </div>
      )}

      <FormularioLogro
        abierto={logroEnEdicion !== null}
        modo="editar"
        logro={logroEnEdicion}
        presentacion="modal"
        guardando={actualizar.isPending}
        onCerrar={() => setLogroEnEdicion(null)}
        onSubirImagen={async (archivo, metadata) => {
          const recurso = await subirArchivo(
            archivo,
            "imagen",
            metadata?.textoAlternativo,
            metadata?.titulo,
          );
          toast.success("Imagen de medalla subida correctamente");
          return recurso;
        }}
        onGuardar={(valores) => {
          if (!logroEnEdicion) return;
          void actualizar
            .mutateAsync({
              id: logroEnEdicion.id,
              datos: {
                nombre: valores.nombre,
                descripcion: valores.descripcion || null,
                url_icono: valores.url_icono || null,
                bono_xp: valores.bono_xp,
                codigo_criterio: valores.codigo_criterio,
                valor_criterio: valores.valor_criterio,
              },
            })
            .then(() => setLogroEnEdicion(null))
            .catch(() => undefined);
        }}
      />

      <DialogoConfirmacionLogro
        confirmacion={confirmacion}
        mutando={archivar.isPending || reactivar.isPending}
        onConfirmar={() => void manejarConfirmar()}
        onCancelar={() => setConfirmacion(null)}
      />
    </section>
  );
}

function IconoLogroAdmin({ url, codigo }: { url: string | null; codigo: string }) {
  const fallback = codigo === "primera_leccion" || codigo.includes("1") ? in1Img : in2Img;
  const resolved = useResolvedMediaUrl({
    rawUrl: url,
    useFallbackOnError: false,
  });
  const [src, setSrc] = useState(resolved.src || url || fallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setSrc(resolved.src || url || fallback);
    setHasError(false);
  }, [resolved.src, url, fallback]);

  if (hasError) {
    return (
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        <Medal className="size-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => {
        if (src !== fallback) {
          setSrc(fallback);
        } else {
          setHasError(true);
        }
      }}
      className="size-11 shrink-0 rounded-xl border border-slate-200/70 object-cover"
    />
  );
}

function FilaLogro({
  logro,
  onEditar,
  onConfirmarAccion,
  deshabilitado,
}: {
  logro: LogroAdminResumen;
  onEditar: () => void;
  onConfirmarAccion: (tipo: "archivar" | "reactivar") => void;
  deshabilitado: boolean;
}) {
  const nombreVisible = logro.nombre || (logro as { titulo?: string }).titulo || logro.codigo;
  const bonoXp = logro.bono_xp ?? (logro as { xp_recompensa?: number }).xp_recompensa ?? 0;
  const otorgados = logro.otorgados ?? (logro as { otorgados_count?: number }).otorgados_count ?? 0;
  const reglaAmigable = describirReglaLogro(logro.codigo_criterio, logro.valor_criterio ?? 1);

  return (
    <tr className="group hover:bg-slate-50/80">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <IconoLogroAdmin url={logro.url_icono ?? (logro as { icono_url?: string }).icono_url ?? null} codigo={logro.codigo} />
          <div className="min-w-0">
            <span className="block truncate font-bold text-slate-900">{nombreVisible}</span>
            {logro.descripcion ? (
              <span className="mt-0.5 block truncate text-xs text-slate-500">
                {logro.descripcion}
              </span>
            ) : (
              <span className="mt-0.5 block truncate font-mono text-[11px] text-slate-400">
                {logro.codigo}
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-slate-700">
        <span className="admin-logros-rule-pill">{reglaAmigable}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-center">
        <span className="admin-logros-xp-pill">
          {bonoXp > 0 ? `+${bonoXp} XP` : "Sin XP"}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3.5 text-center font-semibold text-slate-700">
        {otorgados.toLocaleString("es-EC")} {otorgados === 1 ? "niño" : "niños"}
      </td>
      <td className="whitespace-nowrap px-4 py-3.5">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
            logro.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {logro.activo ? "Activo" : "Archivado"}
        </span>
        <span className="mt-1 block text-[11px] text-slate-400">
          {formatearFechaCorta(logro.creado_en)}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onEditar}
            disabled={deshabilitado}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            aria-label={`Editar ${logro.nombre}`}
          >
            <Pencil className="size-4" aria-hidden="true" /> Editar
          </button>
          {logro.activo ? (
            <button
              type="button"
              onClick={() => onConfirmarAccion("archivar")}
              disabled={deshabilitado}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
              aria-label={`Archivar ${logro.nombre}`}
            >
              <Archive className="size-4" aria-hidden="true" /> Archivar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onConfirmarAccion("reactivar")}
              disabled={deshabilitado}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              aria-label={`Reactivar ${logro.nombre}`}
            >
              <ArchiveRestore className="size-4" aria-hidden="true" /> Reactivar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
