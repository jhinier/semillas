interface SopaLetrasCeldaProps {
  letter: string;
  cellKey: string;
  isFound: boolean;
  isSelectedStart: boolean;
  isError: boolean;
  onClick: () => void;
}

export function SopaLetrasCelda({ 
  letter, 
  cellKey, 
  isFound, 
  isSelectedStart, 
  isError, 
  onClick 
}: SopaLetrasCeldaProps) {
  let cellClass = "flex items-center justify-center font-bold text-base sm:text-xl rounded-md sm:rounded-lg cursor-pointer transition-colors select-none ";
  
  if (isFound) {
    cellClass += "bg-green-400 text-white shadow-sm scale-95 opacity-90";
  } else if (isError) {
    cellClass += "bg-red-400 text-white animate-pulse";
  } else if (isSelectedStart) {
    cellClass += "bg-blue-400 text-white shadow-sm ring-4 ring-blue-200";
  } else {
    cellClass += "bg-white text-slate-700 shadow-sm hover:bg-orange-100";
  }

  return (
    <div 
      key={cellKey}
      onClick={onClick}
      className={cellClass}
    >
      {letter}
    </div>
  );
}
