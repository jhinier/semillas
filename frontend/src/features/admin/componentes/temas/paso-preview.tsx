import imgPlaceholder from "@/assets/images/Ilustraciones/Tema1.webp";

interface ClubVisibilidades {
  todos: boolean;
  semillitas: boolean;
  guardianes: boolean;
  corazones: boolean;
  jovenes: boolean;
}

interface PasoPreviewProps {
  liveTitle: string;
  liveResumen: string;
  liveDuration: number;
  liveXp: number;
  activeVersion: string;
  clubVisibilities: ClubVisibilidades;
  checkedClubsCount: number;
}

export function PasoPreview({
  liveTitle,
  liveResumen,
  liveDuration,
  liveXp,
  activeVersion,
  clubVisibilities,
  checkedClubsCount,
}: PasoPreviewProps) {
  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col text-left">
        <h3 className="font-extrabold text-slate-800 text-sm mb-4">Vista previa</h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none mb-3">
          Así se verá tu tema en la plataforma
        </span>

        <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-xs bg-slate-50/50 flex flex-col">
          <div className="w-full h-36 overflow-hidden bg-slate-100 relative shrink-0">
            <img src={imgPlaceholder} alt="Vista previa" className="w-full h-full object-cover" />
          </div>
          <div className="p-4 flex flex-col gap-2">
            <div>
              <span className="inline-flex px-1.5 py-0.5 rounded bg-violet-100 text-violet-600 text-[9px] font-extrabold uppercase tracking-wider">
                Tema
              </span>
            </div>
            <h4 className="font-extrabold text-slate-800 text-[14px] leading-tight truncate">
              {liveTitle}
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-0.5 line-clamp-2 min-h-[34px]">
              {liveResumen}
            </p>

            <div className="flex items-center gap-3.5 mt-2.5 text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-3 select-none">
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-clock text-[9px]" />
                <span>{liveDuration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-star text-[9px] text-amber-400" />
                <span>{liveXp} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <i className="fa-solid fa-book-open text-[9px]" />
                <span>{activeVersion}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400 select-none">
              <span>Visible en {checkedClubsCount} clubes</span>
              <div className="flex items-center -space-x-1.5">
                {clubVisibilities.semillitas && (
                  <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 border border-white flex items-center justify-center text-[8px] shadow-xs">
                    <i className="fa-solid fa-leaf" />
                  </div>
                )}
                {clubVisibilities.guardianes && (
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 border border-white flex items-center justify-center text-[8px] shadow-xs">
                    <i className="fa-solid fa-feather" />
                  </div>
                )}
                {clubVisibilities.corazones && (
                  <div className="w-5 h-5 rounded-full bg-red-50 text-red-500 border border-white flex items-center justify-center text-[8px] shadow-xs">
                    <i className="fa-solid fa-heart" />
                  </div>
                )}
                {clubVisibilities.jovenes && (
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 border border-white flex items-center justify-center text-[8px] shadow-xs">
                    <i className="fa-solid fa-mountain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 text-amber-600">
          <i className="fa-solid fa-lightbulb text-xs shrink-0 mt-0.5" />
          <span className="text-[11px] font-bold leading-relaxed">
            Puedes guardar como borrador en cualquier momento y continuar después.
          </span>
        </div>
      </div>
    </>
  );
}
