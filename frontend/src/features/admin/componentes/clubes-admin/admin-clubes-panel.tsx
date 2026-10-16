import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpDown, Eye, Plus, RefreshCw, Search, ShieldAlert, Users, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { Paginacion } from "@/componentes/ui/paginacion";
import type { ClubAdminResumen, CrearClubAdminSolicitud } from "../../admin-clubes.api";
import { useAdminClubes } from "../../hooks/use-admin-clubes";

import { BotonEstadoClub } from "./BotonEstadoClub";
import { CrearClubDialog } from "./CrearClubDialog";
import { DialogoConfirmacion, type Confirmacion } from "./DialogoConfirmacion";
export { enviarRetoDesdeFormulario } from "./FormularioCrearReto";

type EstadoFiltro = "activo" | "archivado" | "todos";
type OrdenClubes = "recientes" | "nombre" | "miembros";

export type EstadoAdminClubesPanel = {
  clubes: ClubAdminResumen[];
  total: number;
  isLoading: boolean;
  online?: boolean;
  error?: string;
  confirmacion?: Confirmacion;
  seleccionId?: string;
  busqueda?: string;
  estadoFiltro?: EstadoFiltro;
  orden?: OrdenClubes;
  paginaActual?: number;
  porPagina?: number;
  mutando?: boolean;
};

type AdminClubesPanelVistaProps = {
  estado: EstadoAdminClubesPanel;
  onBuscar?: (busqueda: string) => void;
  onCambiarEstado?: (estado: EstadoFiltro) => void;
  onCambiarOrden?: (orden: OrdenClubes) => void;
  onCambiarPagina?: (pagina: number) => void;
  onCambiarPorPagina?: (cantidad: number) => void;
  onAbrirClub?: (id: string) => void;
  onNuevoClub?: () => void;
  onConfirmar?: () => void;
  onCancelarConfirmacion?: () => void;
  onReintentar?: () => void;
  onAccion?: (confirmacion: Confirmacion) => void;
};

function textoError(error: unknown) {
  return error instanceof Error ? error.message : "No fue posible completar la acción.";
}

export function AdminClubesPanelVista({
  estado,
  onBuscar,
  onCambiarEstado,
  onCambiarOrden,
  onCambiarPagina,
  onCambiarPorPagina,
  onAbrirClub,
  onNuevoClub,
  onConfirmar,
  onCancelarConfirmacion,
  onReintentar,
  onAccion,
}: AdminClubesPanelVistaProps) {
  const online = estado.online ?? true;
  const orden = estado.orden ?? "recientes";
  const paginaActual = estado.paginaActual ?? 1;
  const porPagina = estado.porPagina ?? 20;
  const clubes = estado.clubes;

  return (
    <section aria-labelledby="admin-clubes-title" className="space-y-5">
      <header className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Comunidad</p>
          <h1 id="admin-clubes-title" className="mt-1 text-3xl font-black tracking-tight text-slate-950">Clubes</h1>
          <p className="mt-1 text-sm text-slate-500">Gestiona responsables, miembros y retos cooperativos desde un solo lugar.</p>
        </div>
        <button
          type="button"
          onClick={onNuevoClub}
          disabled={!online || estado.mutando}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" /> Nuevo club
        </button>
      </header>

      {!online ? (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <WifiOff className="size-5 shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold">La administración de clubes requiere conexión a internet.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_11rem_12rem] gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="relative min-w-0">
          <span className="sr-only">Buscar clubes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            aria-label="Buscar clubes"
            type="search"
            value={estado.busqueda ?? ""}
            onChange={(evento) => onBuscar?.(evento.target.value)}
            disabled={!online}
            placeholder="Buscar por nombre"
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          />
        </label>

        <label>
          <span className="sr-only">Filtrar por estado</span>
          <select
            aria-label="Filtrar por estado"
            value={estado.estadoFiltro ?? "activo"}
            onChange={(evento) => onCambiarEstado?.(evento.target.value as EstadoFiltro)}
            disabled={!online}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 disabled:bg-slate-100"
          >
            <option value="activo">Activos</option>
            <option value="archivado">Archivados</option>
            <option value="todos">Todos</option>
          </select>
        </label>

        <label className="relative">
          <span className="sr-only">Ordenar clubes</span>
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <select
            aria-label="Ordenar clubes"
            value={orden}
            onChange={(evento) => onCambiarOrden?.(evento.target.value as OrdenClubes)}
            disabled={!online}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-600 disabled:bg-slate-100"
          >
            <option value="recientes">Más recientes</option>
            <option value="nombre">Nombre A–Z</option>
            <option value="miembros">Más miembros</option>
          </select>
        </label>
      </div>

      {estado.error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <ShieldAlert className="mx-auto size-8 text-red-600" aria-hidden="true" />
          <p className="mt-3 font-bold text-red-900">{estado.error}</p>
          <button
            type="button"
            onClick={onReintentar}
            disabled={!online}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            <RefreshCw className="size-4" aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="size-4" aria-hidden="true" />
              <span><b className="text-slate-900">{estado.total}</b> clubes encontrados</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Club</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3 text-center">Miembros</th>
                  <th className="px-4 py-3 text-center">Retos abiertos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {estado.isLoading ? (
                  Array.from({ length: 6 }, (_, indice) => (
                    <tr key={indice} aria-label="Cargando clubes">
                      {Array.from({ length: 6 }, (__, columna) => (
                        <td key={columna} className="px-4 py-4"><span className="block h-4 animate-pulse rounded bg-slate-200" /></td>
                      ))}
                    </tr>
                  ))
                ) : clubes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <p className="font-bold text-slate-700">No hay clubes para estos filtros.</p>
                      <p className="mt-1 text-sm text-slate-500">Cambia la búsqueda o crea el primer club.</p>
                      <button type="button" onClick={onNuevoClub} className="mt-4 text-sm font-bold text-emerald-700 hover:text-emerald-800">Crear club</button>
                    </td>
                  </tr>
                ) : (
                  clubes.map((club) => (
                    <tr key={club.id} className="group hover:bg-slate-50/80">
                      <td className="px-4 py-3.5">
                        <button type="button" onClick={() => onAbrirClub?.(club.id)} className="max-w-[320px] text-left">
                          <span className="block truncate font-bold text-slate-900 group-hover:text-emerald-700">{club.nombre}</span>
                          <span className="mt-0.5 block truncate text-xs text-slate-500">{club.descripcion || "Sin descripción"}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{club.lider?.apodo ?? <span className="font-semibold text-amber-700">Sin responsable</span>}</td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-700">{club.miembros}</td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-700">{club.retos_abiertos}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${club.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {club.activo ? "Activo" : "Archivado"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onAbrirClub?.(club.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                          >
                            <Eye className="size-4" aria-hidden="true" /> Ver detalle
                          </button>
                          <BotonEstadoClub
                            club={club}
                            deshabilitado={!online || (estado.mutando ?? false)}
                            onAccion={onAccion}
                            soloIcono
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!estado.isLoading && estado.total > 0 ? (
            <Paginacion
              total={estado.total}
              paginaActual={paginaActual}
              porPagina={porPagina}
              onCambiarPagina={(pagina) => onCambiarPagina?.(pagina)}
              onCambiarPorPagina={(cantidad) => onCambiarPorPagina?.(cantidad)}
              opcionesPorPagina={[10, 20, 50]}
              className="border-t border-slate-200 px-4 py-3"
            />
          ) : null}
        </div>
      )}

      {estado.confirmacion ? (
        <DialogoConfirmacion
          confirmacion={estado.confirmacion}
          mutando={estado.mutando ?? false}
          onConfirmar={onConfirmar}
          onCancelar={onCancelarConfirmacion}
        />
      ) : null}
    </section>
  );
}

export function AdminClubesPanel() {
  const navigate = useNavigate();
  const [busqueda, establecerBusqueda] = useState("");
  const busquedaDiferida = useDeferredValue(busqueda.trim());
  const [estadoFiltro, establecerEstadoFiltro] = useState<EstadoFiltro>("activo");
  const [orden, establecerOrden] = useState<OrdenClubes>("recientes");
  const [paginaActual, establecerPaginaActual] = useState(1);
  const [porPagina, establecerPorPagina] = useState(20);
  const [confirmacion, establecerConfirmacion] = useState<Confirmacion>();
  const [crearAbierto, establecerCrearAbierto] = useState(false);

  const clubes = useAdminClubes({
    q: busquedaDiferida || undefined,
    estado: estadoFiltro,
    orden,
    limit: porPagina,
    offset: (paginaActual - 1) * porPagina,
  });
  const listado = clubes.listado.data;
  const mutando = clubes.crear.isPending || clubes.archivar.isPending || clubes.reactivar.isPending;

  useEffect(() => {
    const totalPaginas = Math.max(1, Math.ceil((listado?.meta.total ?? 0) / porPagina));
    if (paginaActual > totalPaginas) establecerPaginaActual(totalPaginas);
  }, [listado?.meta.total, paginaActual, porPagina]);

  const confirmar = async () => {
    if (!confirmacion) return;
    try {
      if (confirmacion.tipo === "archivar") await clubes.archivar.mutateAsync(confirmacion.club.id);
      if (confirmacion.tipo === "reactivar") await clubes.reactivar.mutateAsync(confirmacion.club.id);
      toast.success(confirmacion.tipo === "archivar" ? "Club archivado." : "Club reactivado.");
      establecerConfirmacion(undefined);
    } catch (error) {
      toast.error(textoError(error));
    }
  };

  const crear = async (datos: CrearClubAdminSolicitud) => {
    try {
      const creado = await clubes.crear.mutateAsync(datos);
      toast.success("Club creado correctamente.");
      establecerCrearAbierto(false);
      await navigate({ to: "/admin/clubes/$clubId", params: { clubId: creado.id } });
    } catch (error) {
      toast.error(textoError(error));
      throw error;
    }
  };

  return (
    <>
      <AdminClubesPanelVista
        estado={{
          clubes: listado?.clubes ?? [],
          total: listado?.meta.total ?? 0,
          isLoading: clubes.listado.isLoading,
          online: clubes.estaConectado,
          error: clubes.listado.error ? textoError(clubes.listado.error) : undefined,
          busqueda,
          estadoFiltro,
          orden,
          paginaActual,
          porPagina,
          confirmacion,
          mutando,
        }}
        onBuscar={(valor) => {
          establecerBusqueda(valor);
          establecerPaginaActual(1);
        }}
        onCambiarEstado={(valor) => {
          establecerEstadoFiltro(valor);
          establecerPaginaActual(1);
        }}
        onCambiarOrden={(valor) => {
          establecerOrden(valor);
          establecerPaginaActual(1);
        }}
        onCambiarPagina={establecerPaginaActual}
        onCambiarPorPagina={(cantidad) => {
          establecerPorPagina(cantidad);
          establecerPaginaActual(1);
        }}
        onAbrirClub={(clubId) => void navigate({ to: "/admin/clubes/$clubId", params: { clubId } })}
        onNuevoClub={() => establecerCrearAbierto(true)}
        onAccion={establecerConfirmacion}
        onCancelarConfirmacion={() => establecerConfirmacion(undefined)}
        onConfirmar={confirmar}
        onReintentar={() => void clubes.listado.refetch()}
      />

      <CrearClubDialog
        abierto={crearAbierto}
        guardando={clubes.crear.isPending}
        onCerrar={() => establecerCrearAbierto(false)}
        onCrear={crear}
      />
    </>
  );
}
