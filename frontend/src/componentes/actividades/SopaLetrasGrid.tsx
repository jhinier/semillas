import { SopaLetrasCelda } from "./SopaLetrasCelda";

interface SopaLetrasGridProps {
  grid: string[][];
  numColumnas: number;
  foundCells: Set<string>;
  selectionStart: { r: number; c: number } | null;
  errorFlash: Set<string>;
  onCellClick: (r: number, c: number) => void;
}

export function SopaLetrasGrid({ 
  grid, 
  numColumnas, 
  foundCells, 
  selectionStart, 
  errorFlash, 
  onCellClick 
}: SopaLetrasGridProps) {
  const maxContainerClass =
    numColumnas >= 15
      ? "max-w-xl"
      : numColumnas >= 11
        ? "max-w-md sm:max-w-lg"
        : "max-w-[320px] sm:max-w-sm lg:max-w-md";
  const dense = numColumnas >= 11;

  return (
    <div 
      className={`w-full ${maxContainerClass} bg-slate-100 dark:bg-slate-900/70 rounded-2xl p-2 sm:p-3 grid gap-1 border-4 border-slate-200 dark:border-slate-700 shadow-inner`}
      style={{ 
        gridTemplateColumns: `repeat(${numColumnas}, minmax(0, 1fr))` 
      }}
    >
      {grid.map((row, r) => 
        row.map((letter, c) => {
          const cellKey = `${r},${c}`;
          const isFound = foundCells.has(cellKey);
          const isSelectedStart = selectionStart?.r === r && selectionStart?.c === c;
          const isError = errorFlash.has(cellKey);
          
          return (
            <SopaLetrasCelda
              key={cellKey}
              letter={letter}
              cellKey={cellKey}
              isFound={isFound}
              isSelectedStart={isSelectedStart}
              isError={isError}
              dense={dense}
              onClick={() => onCellClick(r, c)}
            />
          );
        })
      )}
    </div>
  );
}
