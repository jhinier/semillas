import * as React from "react";
import { Share2 } from "lucide-react";
import { Boton } from "@/componentes/ui/boton";
import shareKidsImg from "@/assets/images/Ilustraciones/Ninos_login.webp";

export interface ClubComparteWidgetProps {
  onCompartir: () => void;
}

export const ClubComparteWidget: React.FC<ClubComparteWidgetProps> = ({ onCompartir }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
      <div className="text-left mb-4">
        <h3 className="text-sm font-extrabold text-slate-800">Comparte tu club</h3>
        <p className="text-[10px] text-slate-400 leading-normal">Invita a otros a tu club y aprendan juntos.</p>
      </div>

      <div className="w-full h-28 rounded-2xl overflow-hidden bg-violet-50 flex items-center justify-center border border-violet-200 mb-4">
        <img src={shareKidsImg} alt="Comparte" className="h-full object-cover scale-105" />
      </div>

      <Boton
        variante="violetaContorno"
        onClick={onCompartir}
        className="w-full py-3 px-4 rounded-xl text-xs font-bold shadow-sm"
      >
        <Share2 size={14} />
        Compartir código
      </Boton>
    </div>
  );
};
