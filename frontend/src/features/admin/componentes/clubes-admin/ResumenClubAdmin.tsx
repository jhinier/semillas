import { Target, Trophy, Users } from "lucide-react";
import type { DetalleClubAdmin } from "../../admin-clubes.api";
import { formatoFechaClub, retoClubEstaAbierto } from "./club-admin-utils";

export function ResumenClubAdmin({ detalle }: { detalle: DetalleClubAdmin }) {
  const retosAbiertos = detalle.retos.filter(retoClubEstaAbierto).length;
  const xpTotal = detalle.miembros.reduce((total, miembro) => total + miembro.xp_total, 0);
  const activosSemana = detalle.miembros.filter((miembro) => miembro.actividades_semana > 0).length;

  const metricas = [
    { etiqueta: "Miembros", valor: detalle.miembros.length, detalle: `${activosSemana} con actividad esta semana`, icono: Users },
    { etiqueta: "Retos abiertos", valor: retosAbiertos, detalle: `${detalle.retos.length} retos registrados`, icono: Target },
    { etiqueta: "XP acumulada", valor: xpTotal.toLocaleString("es-EC"), detalle: "Suma del progreso de miembros", icono: Trophy },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-3 gap-4">
        {metricas.map((metrica) => {
          const Icono = metrica.icono;
          return (
            <article key={metrica.etiqueta} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500">{metrica.etiqueta}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{metrica.valor}</p>
                  <p className="mt-1 text-xs text-slate-500">{metrica.detalle}</p>
                </div>
                <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icono className="size-4" aria-hidden="true" />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-black text-slate-900">Información del club</h2>
          <dl className="mt-4 grid gap-4 text-sm">
            <div>
              <dt className="font-bold text-slate-500">Descripción</dt>
              <dd className="mt-1 leading-6 text-slate-800">{detalle.club.descripcion || "Este club todavía no tiene una descripción."}</dd>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <dt className="font-bold text-slate-500">Creado</dt>
                <dd className="mt-1 text-slate-800">{formatoFechaClub(detalle.club.creado_en)}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Estado</dt>
                <dd className="mt-1 text-slate-800">{detalle.club.activo ? "Activo" : "Archivado"}</dd>
              </div>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-black text-slate-900">Actividad reciente</h2>
          <div className="mt-4 grid gap-3">
            {[...detalle.miembros]
              .sort((a, b) => b.xp_semana - a.xp_semana)
              .slice(0, 4)
              .map((miembro) => (
                <div key={miembro.usuario_id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{miembro.apodo}</p>
                    <p className="text-xs text-slate-500">{miembro.actividades_semana} actividades esta semana</p>
                  </div>
                  <span className="text-sm font-black text-emerald-700">{miembro.xp_semana} XP</span>
                </div>
              ))}
            {detalle.miembros.length === 0 ? <p className="text-sm text-slate-500">Todavía no hay miembros.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
