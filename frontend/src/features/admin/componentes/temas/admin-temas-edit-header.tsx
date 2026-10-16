import imgBoySheep from "@/assets/images/Ilustraciones/in2.webp";

type AdminTemasEditHeaderProps = {
  title: string;
  onNavigate: (to: string) => void;
};

export function AdminTemasEditHeader({ title, onNavigate }: AdminTemasEditHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400/50 select-none">
        <span className="hover:text-emerald-100 cursor-pointer" onClick={() => onNavigate("/admin")}>Inicio</span>
        <i className="fa-solid fa-chevron-right text-[8px]" />
        <span className="hover:text-emerald-100 cursor-pointer" onClick={() => onNavigate("/admin/temas")}>Temas</span>
        <i className="fa-solid fa-chevron-right text-[8px]" />
        <span className="text-emerald-200/70 truncate max-w-[120px]">{title || "Dios me cuida"}</span>
        <i className="fa-solid fa-chevron-right text-[8px]" />
        <span className="text-green-500">Editar</span>
      </div>

      <div className="flex items-center gap-4 bg-[#142e22] rounded-3xl border border-[#1a3a2a] p-6 shadow-sm">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#1a3a2a] shrink-0">
          <img src={imgBoySheep} alt="Boy with sheep avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-emerald-50">Editar tema</h2>
          <p className="text-xs text-emerald-300/60 mt-1 sm:text-sm">Actualiza la información y el contenido de tu tema.</p>
        </div>
      </div>
    </>
  );
}
