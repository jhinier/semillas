import { Plus } from "lucide-react";
import type { RetoClubAdmin } from "../../admin-clubes.api";
import { formatoFechaClub, nombreMetricaReto, retoClubEstaAbierto } from "./club-admin-utils";

interface RetosClubAdminProps {
  retos: RetoClubAdmin[];
  deshabilitado: boolean;
  onNuevo: () => void;
  onCerrar: (reto: RetoClubAdmin) => void;
}

export function RetosClubAdmin({ retos, deshabilitado, onNuevo, onCerrar }: RetosClubAdminProps) {
  const ordenados = [...retos].sort(
    (a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime(),
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-black text-slate-900">Retos cooperativos</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Crea metas medibles y cierra retos que ya no deben recibir aportes.
          </p>
        </div>
        <button
          type="button"
          onClick={onNuevo}
          disabled={deshabilitado}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" /> Nuevo reto
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4 p-5">
        {ordenados.map((reto) => {
          const abierto = retoClubEstaAbierto(reto);

          return (
            <article key={reto.id} className="rounded-xl border border-slate-200 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      abierto ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {abierto ? "Abierto" : "Cerrado"}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {nombreMetricaReto(reto.codigo_metrica)}
                  </span>
                </div>
                <h3 className="mt-3 truncate font-black text-slate-900">{reto.nombre}</h3>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                  {reto.descripcion || "Sin descripción"}
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 text-xs">
                <div>
                  <dt className="font-bold text-slate-500">Meta</dt>
                  <dd className="mt-1 font-black text-slate-800">{reto.valor_objetivo}</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Recompensa</dt>
                  <dd className="mt-1 font-black text-slate-800">{reto.xp_reto} XP</dd>
                </div>
                <div>
                  <dt className="font-bold text-slate-500">Finaliza</dt>
                  <dd className="mt-1 font-black text-slate-800">{formatoFechaClub(reto.fecha_fin)}</dd>
                </div>
              </dl>

              {abierto ? (
                <button
                  type="button"
                  onClick={() => onCerrar(reto)}
                  disabled={deshabilitado}
                  className="mt-4 text-xs font-bold text-red-700 hover:underline disabled:opacity-50"
                >
                  Cerrar reto antes de tiempo
                </button>
              ) : null}
            </article>
          );
        })}

        {retos.length === 0 ? (
          <p className="col-span-2 py-12 text-center text-sm text-slate-500">
            No hay retos registrados.
          </p>
        ) : null}
      </div>
    </section>
  );
}
