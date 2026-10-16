import { useDeferredValue, useEffect, useState } from "react";
import { Archive, ArchiveRestore, Medal, Pencil, Plus, Search, ShieldAlert, WifiOff } from "lucide-react";
import { Paginacion } from "@/componentes/ui/paginacion";
import type {
  CodigoCriterioLogro,
  LogroAdminResumen,
} from "../../admin-logros.api";
import { useAdminLogros } from "../../hooks/use-admin-logros";
import { CRITERIOS_LOGRO, formatearFechaCorta, obtenerCriterio } from "./logros-admin-utils";
import { DialogoConfirmacionLogro, type ConfirmacionLogroAccion } from "./DialogoConfirmacionLogro";
import { FormularioLogro } from "./FormularioLogro";

type EstadoFiltro = "activo" | "archivado" | "todos";
export function AdminLogrosPanel() {
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

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil((data?.meta.total ?? 0) / porPagina));
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [data?.meta.total, paginaActual, porPagina]);

  function abrirEditar(logro: LogroAdminResumen) {
    setLogroEnEdicion(logro);
  }

  function navegarNuevoLogro() {
    if (typeof window !== "undefined") {
      window.location.assign("/admin/logros/nuevo");
    }
  }

  async function manejarConfirmar() {
    if (!confirmacion) return;
    try {
      if (confirmacion.tipo === "archivar") {
        await archivar.mutateAsync(confirmacion.logroId);
      } else {
        await reactivar.mutateAsync(confirmacion.logroId);
      }
      setConfirmacion(null);
    } catch {
      setConfirmacion(null);
    }
  }

  return (
    <section aria-labelledby="admin-logros-title" className="space-y-5">
      <header className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Gamificación</p>
          <h1 id="admin-logros-title" className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Logros
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Crea, edita y archiva los reconocimientos disponibles en la plataforma.
          </p>
        </div>
        <button
          type="button"
          onClick={navegarNuevoLogro}
          disabled={!estaConectado || mutando}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" /> Nuevo logro
        </button>
      </header>

      {!estaConectado ? (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <WifiOff className="size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold">
            La administración de logros requiere conexión a internet.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_12rem_14rem] gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="relative min-w-0">
          <span className="sr-only">Buscar logros</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            aria-label="Buscar logros"
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            disabled={!estaConectado}
            placeholder="Buscar por nombre o código"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por estado</span>
          <select
            aria-label="Filtrar por estado"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as EstadoFiltro);
              setPaginaActual(1);
            }}
            disabled={!estaConectado}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 disabled:bg-slate-100"
          >
            <option value="activo">Activos</option>
            <option value="archivado">Archivados</option>
            <option value="todos">Todos</option>
          </select>
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
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 disabled:bg-slate-100"
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
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Medal className="size-4" aria-hidden="true" />
              <span>
                <b className="text-slate-900">{data?.meta.total ?? 0}</b> logros encontrados
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Logro</th>
                  <th className="px-4 py-3">Criterio</th>
                  <th className="px-4 py-3 text-center">XP</th>
                  <th className="px-4 py-3 text-center">Otorgados</th>
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
                        Cambia la búsqueda o crea el primer logro.
                      </p>
                      <button
                        type="button"
                        onClick={navegarNuevoLogro}
                        className="mt-4 text-sm font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        Crear logro
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

          {data && data.meta.total > 0 ? (
            <Paginacion
              total={data.meta.total}
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
  const criterio = obtenerCriterio(logro.codigo_criterio);
  return (
    <tr className="group hover:bg-slate-50/80">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          {logro.url_icono ? (
            <img
              src={logro.url_icono}
              alt=""
              loading="lazy"
              className="size-9 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <Medal className="size-4" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <span className="block truncate font-bold text-slate-900">{logro.nombre}</span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[10px]">{logro.codigo}</code>
              {logro.descripcion ? <span className="ml-2">{logro.descripcion}</span> : null}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-slate-700">
        <span className="font-semibold">{criterio.etiqueta}</span>
        <span className="ml-2 text-xs text-slate-500">
          {logro.valor_criterio} {criterio.unidad}
        </span>
      </td>
      <td className="px-4 py-3.5 text-center font-bold text-violet-700">+{logro.bono_xp}</td>
      <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
        {logro.otorgados.toLocaleString("es-EC")}
      </td>
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
            logro.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {logro.activo ? "Activo" : "Archivado"}
        </span>
        <span className="mt-0.5 block text-[10px] text-slate-400">
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
