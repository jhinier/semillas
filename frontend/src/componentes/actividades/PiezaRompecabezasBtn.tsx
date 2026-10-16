import { Grip } from "lucide-react";
import type { JSX } from "react";
import type { PiezaRompecabezas } from "./rompecabezas.utils";

interface PiezaRompecabezasBtnProps {
  pieza: PiezaRompecabezas;
  imagen: string;
  totalPiezas: number;
  seleccionada: boolean;
  fondo: { backgroundSize: string; backgroundPosition: string };
  onSeleccionar: (id: number) => void;
  onIniciarArrastre: (id: number) => void;
  onSoltar: (id: number) => void;
  onArrastreFinalizado: () => void;
}

export function PiezaRompecabezasBtn({
  pieza,
  imagen,
  totalPiezas,
  seleccionada,
  fondo,
  onSeleccionar,
  onIniciarArrastre,
  onSoltar,
  onArrastreFinalizado,
}: PiezaRompecabezasBtnProps): JSX.Element {
  return (
    <button
      type="button"
      draggable
      onClick={() => onSeleccionar(pieza.id)}
      onDragStart={() => onIniciarArrastre(pieza.id)}
      onDragOver={(evento) => evento.preventDefault()}
      onDrop={() => onSoltar(pieza.id)}
      onDragEnd={onArrastreFinalizado}
      aria-label={`Pieza ${pieza.id + 1} de ${totalPiezas}`}
      aria-pressed={seleccionada}
      className={[
        "relative touch-manipulation border border-white bg-cover bg-no-repeat transition duration-200 ease-out",
        "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3D8BD4]",
        seleccionada ? "z-10 scale-95 ring-4 ring-[#3D8BD4]" : "hover:scale-[0.98] active:scale-95",
      ].join(" ")}
      style={{ backgroundImage: `url(${imagen})`, backgroundSize: fondo.backgroundSize, backgroundPosition: fondo.backgroundPosition }}
    >
      <span className="sr-only">Toca o arrastra esta pieza para intercambiarla</span>
      {seleccionada && <Grip className="absolute right-2 top-2 size-5 rounded-full bg-white/90 p-1 text-[#3D8BD4]" aria-hidden="true" />}
    </button>
  );
}
