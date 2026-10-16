import { Link } from "@tanstack/react-router";
import { Archive, Plus, UserRoundCog } from "lucide-react";
import type { MiembroClubAdmin } from "../../admin-clubes.api";
import { formatoFechaClub, rolMiembroHumano } from "./club-admin-utils";

interface MiembrosClubAdminProps {
  miembros: MiembroClubAdmin[];
  deshabilitado: boolean;
  onAgregar: () => void;
  onTransferir: (miembro: MiembroClubAdmin) => void;
  onExpulsar: (miembro: MiembroClubAdmin) => void;
}

export function MiembrosClubAdmin({ miembros, deshabilitado, onAgregar, onTransferir, onExpulsar }: MiembrosClubAdminProps) {
  const responsables = miembros.filter((miembro) => ["propietario", "lider"].includes(miembro.rol_miembro ?? ""));

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-black text-slate-900">Miembros del club</h2>
          <p className="mt-0.5 text-sm text-slate-500">Consulta el perfil, cambia el liderazgo o retira miembros.</p>
        </div>
        <button type="button" onClick={onAgregar} disabled={deshabilitado} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
          <Plus className="size-4" aria-hidden="true" /> Agregar miembro
        </button>
      </header>

      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Usuario</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3 text-right">XP total</th>
            <th className="px-4 py-3 text-right">Esta semana</th>
            <th className="px-4 py-3">Ingreso</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {miembros.map((miembro) => (
            <tr key={miembro.usuario_id} className="hover:bg-slate-50/70">
              <td className="px-5 py-3.5">
                <Link to="/admin/usuarios/$userId" params={{ userId: miembro.usuario_id }} className="font-bold text-slate-900 hover:text-emerald-700 hover:underline">
                  {miembro.apodo}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">{miembro.actividades_semana} actividades esta semana</p>
              </td>
              <td className="px-4 py-3.5">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${miembro.rol_miembro === "miembro" ? "bg-slate-100 text-slate-600" : "bg-violet-50 text-violet-700"}`}>
                  {rolMiembroHumano(miembro.rol_miembro)}
                </span>
              </td>
              <td className="px-4 py-3.5 text-right font-semibold text-slate-700">{miembro.xp_total.toLocaleString("es-EC")}</td>
              <td className="px-4 py-3.5 text-right font-semibold text-emerald-700">+{miembro.xp_semana}</td>
              <td className="px-4 py-3.5 text-slate-600">{formatoFechaClub(miembro.unido_en)}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-1">
                  {miembro.rol_miembro === "miembro" ? (
                    <button type="button" title={`Transferir liderazgo a ${miembro.apodo}`} aria-label={`Transferir liderazgo a ${miembro.apodo}`} disabled={deshabilitado} onClick={() => onTransferir(miembro)} className="grid size-9 place-items-center rounded-lg text-violet-700 hover:bg-violet-50 disabled:opacity-50">
                      <UserRoundCog className="size-4" aria-hidden="true" />
                    </button>
                  ) : null}
                  {(() => {
                    const esResponsable = ["propietario", "lider"].includes(miembro.rol_miembro ?? "");
                    const protegido = esResponsable && responsables.length <= 1;
                    const etiqueta = protegido
                      ? `Transfiere el liderazgo antes de retirar a ${miembro.apodo}`
                      : `Expulsar a ${miembro.apodo}`;

                    return (
                      <button
                        type="button"
                        title={etiqueta}
                        aria-label={etiqueta}
                        disabled={deshabilitado || protegido}
                        onClick={() => onExpulsar(miembro)}
                        className="grid size-9 place-items-center rounded-lg text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Archive className="size-4" aria-hidden="true" />
                      </button>
                    );
                  })()}
                </div>
              </td>
            </tr>
          ))}
          {miembros.length === 0 ? <tr><td colSpan={6} className="px-6 py-14 text-center text-sm text-slate-500">El club todavía no tiene miembros.</td></tr> : null}
        </tbody>
      </table>
    </section>
  );
}
