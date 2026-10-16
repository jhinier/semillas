type TabConfigProps = {
  estado: string;
  versionContenido: number;
  publicadoEn: string | null;
  minutosEstimados: number;
  xpRecompensa: number;
};

export function TabConfig({
  estado,
  versionContenido,
  publicadoEn,
  minutosEstimados,
  xpRecompensa,
}: TabConfigProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5 text-left">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado actual</p>
          <p className="mt-1 text-sm font-extrabold text-slate-800 capitalize">{estado || "borrador"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Versión</p>
          <p className="mt-1 text-sm font-extrabold text-slate-800">v{versionContenido}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duración</p>
          <p className="mt-1 text-sm font-extrabold text-slate-800">{minutosEstimados} min</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">XP</p>
          <p className="mt-1 text-sm font-extrabold text-slate-800">{xpRecompensa} XP</p>
        </div>
      </div>

      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <p className="text-xs font-bold text-green-600">Publicación</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
          {publicadoEn ? `Publicado el ${new Date(publicadoEn).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}.` : "Todavía no está publicado."}
        </p>
      </div>

      <p className="text-[10px] text-slate-400 font-semibold">
        Los cambios editables se guardan desde Información general, portada y publicación.
      </p>
    </div>
  );
}
