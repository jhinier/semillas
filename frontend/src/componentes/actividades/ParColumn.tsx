import type { Par } from "./RelacionarParesActividad";
import { PareButton } from "./PareButton";

interface ParColumnProps {
  titulo: string;
  pares: Par[];
  matchedPairs: string[];
  selectedIndex: number | null;
  errorPair: { left: number; right: number } | null;
  colorClass: string;
  selectedColorClass: string;
  onItemClick: (index: number, parId: string) => void;
  side: "izquierda" | "derecha";
}

export function ParColumn({
  titulo,
  pares,
  matchedPairs,
  selectedIndex,
  errorPair,
  colorClass,
  selectedColorClass,
  onItemClick,
  side,
}: ParColumnProps) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      <h4 className="text-center font-bold text-slate-400 mb-2 uppercase tracking-widest text-sm">
        {titulo}
      </h4>
      {pares.map((par, i) => {
        const isMatched = matchedPairs.includes(par.id);
        const isSelected = selectedIndex === i;
        const isError = (side === "izquierda" ? errorPair?.left : errorPair?.right) === i;

        return (
          <PareButton
            key={`${side}_${par.id}`}
            texto={side === "izquierda" ? par.izquierda : par.derecha}
            isMatched={isMatched}
            isSelected={isSelected}
            isError={isError}
            colorClass={colorClass}
            selectedColorClass={selectedColorClass}
            onClick={() => onItemClick(i, par.id)}
          />
        );
      })}
    </div>
  );
}
