interface SopaLetrasCeldaProps {
  letter: string;
  cellKey: string;
  isFound: boolean;
  isSelectedStart: boolean;
  isError: boolean;
  dense?: boolean;
  onClick: () => void;
}

export function SopaLetrasCelda({ 
  letter, 
  cellKey, 
  isFound, 
  isSelectedStart, 
  isError, 
  dense = false,
  onClick 
}: SopaLetrasCeldaProps) {
  let cellClass = `aspect-square w-full flex items-center justify-center font-bold leading-none ${
    dense ? "text-xs sm:text-sm" : "text-sm sm:text-base"
  } rounded-md sm:rounded-lg cursor-pointer transition-colors select-none `;
  
  if (isFound) {
    cellClass += "bg-green-500 text-white shadow-sm scale-95 opacity-95";
  } else if (isError) {
    cellClass += "bg-red-500 text-white animate-pulse";
  } else if (isSelectedStart) {
    cellClass += "bg-blue-500 text-white shadow-sm ring-2 sm:ring-4 ring-blue-300";
  } else {
    cellClass += "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 shadow-sm hover:bg-orange-100 dark:hover:bg-slate-700";
  }

  return (
    <button 
      type="button"
      key={cellKey}
      onClick={onClick}
      className={cellClass}
    >
      {letter}
    </button>
  );
}
