import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, X } from "lucide-react";
import { buscarUsuariosClubAdmin } from "../../admin-clubes.api";

interface AgregarMiembroDialogProps {
  abierto: boolean;
  excluidos: string[];
  guardando: boolean;
  onCerrar: () => void;
  onAgregar: (usuarioId: string) => Promise<void>;
}

export function AgregarMiembroDialog({ abierto, excluidos, guardando, onCerrar, onAgregar }: AgregarMiembroDialogProps) {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState("");
  const [error, setError] = useState<string>();
  const busquedaDiferida = useDeferredValue(busqueda.trim());

  useEffect(() => {
    if (abierto) return;
    setBusqueda("");
    setSeleccionado("");
    setError(undefined);
  }, [abierto]);

  const usuariosQuery = useQuery({
    queryKey: ["admin", "clubes", "buscar-miembro", busquedaDiferida],
    queryFn: () => buscarUsuariosClubAdmin(busquedaDiferida),
    enabled: abierto,
    staleTime: 20_000,
  });
  const usuarios = useMemo(
    () => (usuariosQuery.data?.usuarios ?? []).filter((usuario) => usuario.activo !== false && !excluidos.includes(usuario.id)),
    [excluidos, usuariosQuery.data],
  );

  if (!abierto) return null;

  const confirmar = async () => {
    if (!seleccionado) {
      setError("Selecciona un usuario.");
      return;
    }
    setError(undefined);
    await onAgregar(seleccionado);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="agregar-miembro-title" className="fixed inset-0 z-50 grid place-items-center p-6">
      <button type="button" className="absolute inset-0 bg-slate-950/45" aria-label="Cerrar selector de miembros" onClick={onCerrar} />
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="agregar-miembro-title" className="text-xl font-black text-slate-950">Agregar miembro</h2>
            <p className="mt-1 text-sm text-slate-500">Busca una cuenta activa que todavía no pertenezca al club.</p>
          </div>
          <button type="button" onClick={onCerrar} disabled={guardando} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="grid gap-4 px-6 py-5">
          <label className="relative">
            <span className="sr-only">Buscar usuarios</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              autoFocus
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              disabled={guardando}
              placeholder="Nombre o correo"
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
            {usuariosQuery.isLoading ? (
              <p className="p-8 text-center text-sm text-slate-500">Buscando usuarios…</p>
            ) : usuariosQuery.isError ? (
              <p className="p-8 text-center text-sm text-red-600">No se pudo consultar el directorio.</p>
            ) : usuarios.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">No hay usuarios disponibles.</p>
            ) : (
              usuarios.map((usuario) => {
                const nombre = usuario.perfil?.apodo || usuario.nombre_visible || usuario.correo || "Usuario Semillas";
                const activo = seleccionado === usuario.id;
                return (
                  <button
                    key={usuario.id}
                    type="button"
                    onClick={() => setSeleccionado(usuario.id)}
                    className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 ${activo ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                  >
                    <span className={`grid size-9 place-items-center rounded-full ${activo ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <UserPlus className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">{nombre}</span>
                      <span className="block truncate text-xs text-slate-500">{usuario.correo ?? usuario.rol}</span>
                    </span>
                    {activo ? <span className="text-xs font-bold text-emerald-700">Seleccionado</span> : null}
                  </button>
                );
              })
            )}
          </div>
          {error ? <p role="alert" className="text-sm font-semibold text-red-700">{error}</p> : null}
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onCerrar} disabled={guardando} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
          <button type="button" onClick={() => void confirmar()} disabled={guardando || !seleccionado} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
            {guardando ? "Agregando…" : "Agregar miembro"}
          </button>
        </footer>
      </div>
    </div>
  );
}
