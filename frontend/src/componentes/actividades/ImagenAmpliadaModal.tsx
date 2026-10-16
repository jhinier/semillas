import { X } from "lucide-react";
import type { JSX } from "react";

interface ImagenAmpliadaModalProps {
  imagen: string;
  estaAbierta: boolean;
  onCerrar: () => void;
}

export function ImagenAmpliadaModal({
  imagen,
  estaAbierta,
  onCerrar,
}: ImagenAmpliadaModalProps): JSX.Element | null {
  if (!estaAbierta) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onCerrar}
    >
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
        <button
          className="absolute -top-12 right-0 md:-right-12 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
          onClick={onCerrar}
        >
          <X size={28} />
        </button>
        <img
          src={imagen}
          alt="Referencia ampliada"
          className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
}
