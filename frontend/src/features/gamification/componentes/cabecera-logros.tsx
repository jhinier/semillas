import * as React from "react";
import { ChevronDown } from "lucide-react";
import { CampanaBadge } from "@/componentes/ui/chip";

export const CabeceraLogros: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-black text-[#123B2C] leading-tight">Mis logros</h1>
        <p className="text-xs text-[#64748B] font-semibold mt-0.5">Revisa tus insignias, niveles y metas.</p>
      </div>

      <div className="flex items-center gap-3">
        <CampanaBadge conteo={3} />

        <div className="flex items-center gap-2.5 bg-white border border-[#E2E8F0] py-1.5 pl-2 pr-3.5 rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition-all">
          <div
            className="w-7 h-7 rounded-full bg-cover"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80')",
            }}
          />
          <div className="text-left">
            <h4 className="text-[11px] font-extrabold text-[#123B2C] leading-none">Semillero</h4>
            <span className="text-[9px] text-gray-400 font-bold block mt-0.5">Explorador • Nivel 7</span>
          </div>
          <ChevronDown className="size-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
