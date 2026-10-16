import { CheckCircle2 } from "lucide-react";

interface PareButtonProps {
  texto: string;
  isMatched: boolean;
  isSelected: boolean;
  isError: boolean;
  colorClass: string;
  selectedColorClass: string;
  onClick: () => void;
}

export function PareButton({
  texto,
  isMatched,
  isSelected,
  isError,
  colorClass,
  selectedColorClass,
  onClick,
}: PareButtonProps) {
  let btnClass =
    "w-full text-left p-4 sm:p-5 rounded-2xl font-medium text-base sm:text-lg transition-all border-2 flex items-center justify-between shadow-sm relative break-words ";

  if (isMatched) {
    btnClass += "bg-green-100 border-green-500 text-green-800 opacity-90 scale-95";
  } else if (isError) {
    btnClass += "bg-red-50 border-red-500 text-red-700 animate-shake";
  } else if (isSelected) {
    btnClass += `${selectedColorClass} ring-4 ring-opacity-20 transform scale-[1.02] z-10`;
  } else {
    btnClass += `${colorClass} hover:border-opacity-80 hover:bg-opacity-50 cursor-pointer`;
  }

  return (
    <button onClick={onClick} className={btnClass}>
      <span>{texto}</span>
      {isMatched && <CheckCircle2 className="text-green-600" />}
    </button>
  );
}
