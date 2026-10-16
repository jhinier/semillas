import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserRoundCheck, X } from "lucide-react";
import { buscarUsuariosClubAdmin } from "../../admin-clubes.api";
import type { CrearClubAdminSolicitud } from "../../admin-clubes.api";

interface CrearClubDialogProps {
  abierto: boolean;
  guardando: boolean;
  onCerrar: () => void;
  onCrear: (datos: CrearClubAdminSolicitud) => Promise<void>;
}

function nombreUsuario(usuario: Awaited<ReturnType<typeof buscarUsuariosClubAdmin>>["usuarios"][number]) {
  return usuario.perfil?.apodo || usuario.nombre_visible || usuario.correo || "Usuario Semillas";
}

export function CrearClubDialog({ abierto, guardando, onCerrar, onCrear }: CrearClubDialogProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [liderId, setLiderId] = useState("");
  const [error, setError] = useState<string>();
  const busquedaDiferida = useDeferredValue(busqueda.trim());

  useEffect(() => {
    if (abierto) return;
    setNombre("");
    setDescripcion("");
    setBusqueda("");
    setLiderId("");
    setError(undefined);
  }, [abierto]);

  const usuariosQuery = useQuery({
    queryKey: ["admin", "clubes", "usuarios-disponibles", busquedaDiferida],
    queryFn: () => buscarUsuariosClubAdmin(busquedaDiferida),
    enabled: abierto,
    staleTime: 30_000,
  });

  const usuarios = useMemo(
    () => (usuariosQuery.data?.usuarios ?? []).filter((usuario) => usuario.activo !== false),
    [usuariosQuery.data],
  );

  if (!abierto) return null;

  const cerrar = () => {
    if (guardando) return;
    setError(undefined);
    onCerrar();
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const nombreLimpio = nombre.trim();
    if (nombreLimpio.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (!liderId) {
      setError("Selecciona la persona responsable del club.");
      return;
    }
    setError(undefined);
    await onCrear({
      nombre: nombreLimpio,
      descripcion: descripcion.trim() || undefined,
      lider_usuario_id: liderId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-6" role="dialog" aria-modal="true" aria-labelledby="crear-club-title">
      <button type="button" className="absolute inset-0 bg-slate-950/45" aria-label="Cerrar creación de club" onClick={cerrar} />
      <form onSubmit={enviar} className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="crear-club-title" className="text-xl font-black text-slate-950">Crear club</h2>
            <p className="mt-1 text-sm text-slate-500">Define la identidad del club y asigna una persona responsable.</p>
          </div>
          <button type="button" onClick={cerrar} disabled={guardando} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar">
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="grid gap-5 px-6 py-5">
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Nombre del club
            <input
              autoFocus
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              maxLength={80}
              disabled={guardando}
              className="rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="Ej. Exploradores de la Fe"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Descripción <span className="font-normal text-slate-400">(opcional)</span>
            <textarea
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              maxLength={300}
              rows={3}
              disabled={guardando}
              className="resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 font-normal text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="Propósito o contexto del club"
            />
          </label>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold text-slate-700">Responsable inicial</legend>
            <label className="relative block">
              <span className="sr-only">Buscar usuario responsable</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                disabled={guardando}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Buscar por nombre o correo"
              />
            </label>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
              {usuariosQuery.isLoading ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">Cargando usuarios…</p>
              ) : usuariosQuery.isError ? (
                <p className="px-4 py-6 text-center text-sm text-red-600">No se pudieron cargar los usuarios.</p>
              ) : usuarios.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">No hay usuarios activos para esta búsqueda.</p>
              ) : (
                usuarios.map((usuario) => {
                  const seleccionado = usuario.id === liderId;
                  return (
                    <button
                      key={usuario.id}
                      type="button"
                      onClick={() => setLiderId(usuario.id)}
                      disabled={guardando}
                      className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 ${seleccionado ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                    >
                      <span className={`grid size-9 shrink-0 place-items-center rounded-full ${seleccionado ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <UserRoundCheck className="size-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-800">{nombreUsuario(usuario)}</span>
                        <span className="block truncate text-xs text-slate-500">{usuario.correo ?? usuario.rol}</span>
                      </span>
                      {seleccionado ? <span className="text-xs font-bold text-emerald-700">Seleccionado</span> : null}
                    </button>
                  );
                })
              )}
            </div>
          </fieldset>

          {error ? <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={cerrar} disabled={guardando} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
            {guardando ? "Creando…" : "Crear club"}
          </button>
        </footer>
      </form>
    </div>
  );
}
