import { useState, useEffect } from "react";
import { playSound } from "../../lib/audio";
import { ParColumn } from "./ParColumn";
import { CompletadoCard } from "./CompletadoCard";

export interface Par {
  izquierda: string;
  derecha: string;
  id: string;
}

interface RelacionarParesActividadProps {
  actividad: {
    id: string;
    configuracion?: { pares?: Array<{ izquierda: string; derecha: string }> };
    xp_recompensa?: number;
    retroalimentacion?: string;
  };
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

export function RelacionarParesActividad({
  actividad,
  onComplete,
}: RelacionarParesActividadProps) {
  const [paresIzquierda, setParesIzquierda] = useState<Par[]>([]);
  const [paresDerecha, setParesDerecha] = useState<Par[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);

  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [errorPair, setErrorPair] = useState<{ left: number; right: number } | null>(
    null
  );
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const configuracionPares = actividad.configuracion?.pares || [];

    const paresConId = configuracionPares.map(
      (p: { izquierda: string; derecha: string }, index: number) => ({
        ...p,
        id: `par_${index}`,
      })
    );

    setParesIzquierda([...paresConId]);

    const barajados = [...paresConId].sort(() => Math.random() - 0.5);
    setParesDerecha(barajados);
  }, [actividad]);

  const handleLeftClick = (index: number, parId: string) => {
    if (matchedPairs.includes(parId) || completed || errorPair) return;
    playSound("iniciar");
    setSelectedLeft(index === selectedLeft ? null : index);
  };

  const handleRightClick = (index: number, parId: string) => {
    if (matchedPairs.includes(parId) || completed || errorPair) return;
    playSound("iniciar");

    if (selectedLeft !== null) {
      setSelectedRight(index);

      const leftId = paresIzquierda[selectedLeft]!.id;
      const rightId = paresDerecha[index]!.id;

      if (leftId === rightId) {
        playSound("acertado");
        const newMatched = [...matchedPairs, leftId];
        setMatchedPairs(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);

        if (newMatched.length === paresIzquierda.length) {
          setTimeout(() => {
            setCompleted(true);
            playSound("insignia");
            onComplete(actividad.id, actividad.xp_recompensa || 0);
          }, 600);
        }
      } else {
        playSound("error");
        setErrorPair({ left: selectedLeft, right: index });

        setTimeout(() => {
          setErrorPair(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
      }
    } else {
      setSelectedRight(index === selectedRight ? null : index);
    }
  };

  if (!paresIzquierda.length)
    return <div className="p-4 text-center text-slate-500">No hay pares configurados.</div>;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-4 animate-in fade-in zoom-in-95">
      {!completed ? (
        <div className="w-full flex flex-col md:flex-row gap-8 mt-4">
          <ParColumn
            titulo="Concepto"
            pares={paresIzquierda}
            matchedPairs={matchedPairs}
            selectedIndex={selectedLeft}
            errorPair={errorPair}
            colorClass="bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50"
            selectedColorClass="bg-blue-50 border-blue-500 text-blue-800 ring-blue-500/20"
            onItemClick={handleLeftClick}
            side="izquierda"
          />

          <ParColumn
            titulo="Definición"
            pares={paresDerecha}
            matchedPairs={matchedPairs}
            selectedIndex={selectedRight}
            errorPair={errorPair}
            colorClass="bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-slate-50"
            selectedColorClass="bg-purple-50 border-purple-500 text-purple-800 ring-purple-500/20"
            onItemClick={handleRightClick}
            side="derecha"
          />
        </div>
      ) : (
        <CompletadoCard retroalimentacion={actividad.retroalimentacion} />
      )}
    </div>
  );
}
