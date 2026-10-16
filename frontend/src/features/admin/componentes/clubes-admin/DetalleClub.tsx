import { Archive, Target, UserRoundCog, Users } from "lucide-react";
import type { ClubAdminResumen, CrearRetoClubAdminSolicitud, DetalleClubAdmin, MiembroClubAdmin, RetoClubAdmin } from "../../admin-clubes.api";
import { FormularioCrearReto } from "./FormularioCrearReto";

function formatoFecha(fecha: string | null) {
  if (!fecha) return "Sin fecha";
  return new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(fecha));
}

interface DetalleClubProps {
  club?: ClubAdminResumen;
  detalle?: DetalleClubAdmin;
  deshabilitado: boolean;
  onAccion?: (confirmacion: {
    tipo: "archivar" | "reactivar" | "expulsar" | "transferir" | "cerrar-reto";
    club: ClubAdminResumen;
    nombreObjetivo?: string;
    usuarioId?: string;
    retoId?: string;
  }) => void;
  onCrearReto?: (clubId: string, datos: CrearRetoClubAdminSolicitud) => void;
}

export function DetalleClub({ club, detalle, deshabilitado, onAccion, onCrearReto }: DetalleClubProps) {
  if (!club) {
    return (
      <aside className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        Selecciona un club para ver sus miembros y retos.
      </aside>
    );
  }

  return (
    <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-emerald-600">Detalle</p>
        <h3 className="mt-1 text-xl font-black text-slate-900">{club.nombre}</h3>
        <p className="mt-1 text-sm text-slate-500">{club.descripcion ?? "Sin descripción"}</p>
      </div>

      <div>
        <h4 className="flex items-center gap-2 font-bold text-slate-800">
          <Users className="size-4" aria-hidden="true" /> Miembros
        </h4>
        <ul className="mt-3 space-y-2">
          {detalle?.miembros.map((miembro: MiembroClubAdmin) => (
            <li key={miembro.usuario_id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                <b className="text-slate-700">{miembro.apodo}</b>
                <span className="ml-1 text-slate-500">{miembro.rol_miembro ?? "miembro"}</span>
              </span>
              <span className="flex gap-1">
                <button
                  type="button"
                  aria-label={`Transferir liderazgo a ${miembro.apodo}`}
                  disabled={deshabilitado}
                  onClick={() =>
                    onAccion?.({
                      tipo: "transferir",
                      club,
                      nombreObjetivo: miembro.apodo,
                      usuarioId: miembro.usuario_id,
                    })
                  }
                  className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <UserRoundCog className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`Expulsar a ${miembro.apodo}`}
                  disabled={deshabilitado}
                  onClick={() =>
                    onAccion?.({
                      tipo: "expulsar",
                      club,
                      nombreObjetivo: miembro.apodo,
                      usuarioId: miembro.usuario_id,
                    })
                  }
                  className="rounded p-1 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Archive className="size-4" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="flex items-center gap-2 font-bold text-slate-800">
          <Target className="size-4" aria-hidden="true" /> Retos abiertos
        </h4>
        <ul className="mt-3 space-y-2">
          {detalle?.retos.map((reto: RetoClubAdmin) => (
            <li key={reto.id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                <b className="block text-slate-700">{reto.nombre}</b>
                <span className="text-xs text-slate-500">Hasta {formatoFecha(reto.fecha_fin)}</span>
              </span>
              <button
                type="button"
                aria-label={`Cerrar reto ${reto.nombre}`}
                disabled={deshabilitado}
                onClick={() =>
                  onAccion?.({
                    tipo: "cerrar-reto",
                    club,
                    retoId: reto.id,
                  })
                }
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cerrar
              </button>
            </li>
          ))}
          {(!detalle?.retos || detalle.retos.length === 0) && (
            <li className="text-sm text-slate-400">Sin retos abiertos.</li>
          )}
        </ul>
      </div>

      {onCrearReto && <FormularioCrearReto clubId={club.id} deshabilitado={deshabilitado} onCrear={onCrearReto} />}
    </aside>
  );
}
