import imgSprout from "@/assets/images/Ilustraciones/Semilla.webp";

interface ThemeStatusPanelProps {
  estado?: string | null;
}

export function ThemeStatusPanel({ estado }: ThemeStatusPanelProps) {
  const estadoLower = estado ?? "borrador";
  const esPublicado = estadoLower === "publicado";
  const esBorrador = estadoLower === "borrador";
  const esRevision = estadoLower === "revision";

  const colorClass = esPublicado
    ? "bg-emerald-100 text-emerald-700"
    : esBorrador
    ? "bg-amber-100 text-amber-700"
    : esRevision
    ? "bg-blue-100 text-blue-700"
    : "bg-slate-100 text-slate-600";

  const dotClass = esPublicado
    ? "bg-emerald-500"
    : esBorrador
    ? "bg-amber-500"
    : esRevision
    ? "bg-blue-500"
    : "bg-slate-500";

  const label =
    esPublicado ? "Publicado" : esBorrador ? "Borrador" : esRevision ? "En revisión" : estado ?? "Borrador";

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col text-left">
      <h3 className="font-extrabold text-slate-800 text-sm mb-4 select-none">Estado del tema</h3>
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded ${colorClass} text-[10px] font-bold`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
              {label}
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 font-semibold leading-relaxed">
            {esPublicado
              ? "Este tema está visible y disponible para todos los usuarios."
              : "Este tema aún no está visible para los usuarios."}
          </p>
        </div>
        <div className="w-14 h-14 overflow-hidden shrink-0 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-center">
          <img src={imgSprout} alt="Sprouting plant" className="w-10 h-10 object-contain" />
        </div>
      </div>
    </div>
  );
}
