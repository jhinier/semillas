import { Eye } from "lucide-react";
import type { JSX } from "react";

interface VistaReferenciaProps {
  imagen: string;
  onAmpliar: () => void;
}

export function VistaReferencia({ imagen, onAmpliar }: VistaReferenciaProps): JSX.Element {
  return (
    <div
      className="flex flex-col items-center gap-3 bg-indigo-50 border-2 border-indigo-200 text-indigo-800 rounded-2xl p-4 shadow-sm w-full cursor-pointer hover:bg-indigo-100 transition-colors"
      onClick={onAmpliar}
    >
      <div className="relative group w-full">
        <img
          src={imagen}
          alt="Referencia"
          className="w-full h-auto aspect-video rounded-xl object-cover border-2 border-white shadow-sm transition-transform group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-indigo-900/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-8 h-8 text-white drop-shadow-md" />
        </div>
      </div>
      <div className="text-center w-full">
        <p className="font-bold text-indigo-900 flex items-center justify-center gap-1">
          Imagen completa
        </p>
        <p className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full inline-block mt-1">
          Toca para ampliar
        </p>
      </div>
    </div>
  );
}
