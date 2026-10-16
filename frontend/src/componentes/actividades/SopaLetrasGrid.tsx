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
  return (
    <div 
      className="w-full max-w-[280px] sm:max-w-xs lg:max-w-sm aspect-square bg-slate-100 rounded-2xl p-2 grid gap-1 border-4 border-slate-200 shadow-inner"
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
              onClick={() => onCellClick(r, c)}
            />
          );
        })
      )}
    </div>
  );
}
