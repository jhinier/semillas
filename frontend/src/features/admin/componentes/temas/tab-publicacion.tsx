import { Loader } from "lucide-react";

type TabPublicacionProps = {
  estado: string;
  publicadoEn: string | null;
  isPublishing: boolean;
  isDrafting: boolean;
  onPublicar: () => void;
  onBorrador: () => void;
};

export function TabPublicacion({
  estado,
  publicadoEn,
  isPublishing,
  isDrafting,
  onPublicar,
  onBorrador,
}: TabPublicacionProps) {
  const estaPublicado = estado === "publicado";

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5 text-left">
      <div className={`rounded-2xl border p-4 ${estaPublicado ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}`}>
        <p className={`text-xs font-bold ${estaPublicado ? "text-emerald-700" : "text-amber-700"}`}>
          {estaPublicado ? "Publicado" : "Borrador"}
        </p>
        <p className={`mt-1 text-[11px] leading-relaxed ${estaPublicado ? "text-emerald-600" : "text-amber-600"}`}>
          {publicadoEn
            ? `Última publicación: ${new Date(publicadoEn).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}.`
            : "Este tema todavía no está visible para los usuarios."}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onPublicar}
          disabled={isPublishing || estaPublicado}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPublishing ? <Loader className="animate-spin" size={12} /> : <i className="fa-solid fa-paper-plane text-[10px]" />}
          {estaPublicado ? "Ya publicado" : "Publicar ahora"}
        </button>

        <button
          type="button"
          onClick={onBorrador}
          disabled={isDrafting || !estaPublicado}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDrafting ? <Loader className="animate-spin" size={12} /> : <i className="fa-regular fa-file text-[10px]" />}
          Volver a borrador
        </button>
      </div>
    </div>
  );
}
