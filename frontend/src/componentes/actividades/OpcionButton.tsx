import { Check, X } from "lucide-react";
import imgVerdadero from "../../assets/images/icons/Verdadero.webp";
import imgFalso from "../../assets/images/icons/Falso.webp";

interface OpcionButtonProps {
  isTrueButton: boolean;
  isSelected: boolean | null;
  isCorrectAnswer: boolean;
  onSelect: (esVerdadero: boolean) => void;
  disabled: boolean;
}

export function OpcionButton({
  isTrueButton,
  isSelected,
  isCorrectAnswer,
  onSelect,
  disabled,
}: OpcionButtonProps) {
  const selected = isSelected === isTrueButton;

  let btnClass = "w-full text-left px-5 py-6 rounded-2xl font-medium text-xl sm:text-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 mb-4 ";
  let textClass = "text-slate-700";
  let iconClass = "text-slate-400";

  if (isSelected === null) {
    btnClass += isTrueButton
      ? "bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer shadow-sm"
      : "bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer shadow-sm";
    iconClass = isTrueButton ? "text-blue-500" : "text-blue-500";
  } else {
    if (selected && isCorrectAnswer) {
      btnClass += "bg-green-50 border-green-500 z-10 shadow-sm";
      textClass = "text-slate-800 font-bold";
      iconClass = "text-green-500";
    } else if (selected && !isCorrectAnswer) {
      btnClass += "bg-red-50 border-red-400";
      textClass = "text-slate-800 font-bold";
      iconClass = "text-red-500";
    } else if (isCorrectAnswer) {
      btnClass += "bg-green-50/50 border-green-400 opacity-80";
      textClass = "text-slate-700 font-semibold";
      iconClass = "text-green-400";
    } else {
      btnClass += "bg-white border-slate-200 opacity-50";
      textClass = "text-slate-500";
    }
  }

  return (
    <button
      onClick={() => onSelect(isTrueButton)}
      disabled={disabled}
      className={btnClass}
    >
      <div className={iconClass + " mb-2 flex justify-center"}>
        {isTrueButton ? (
          <img src={imgVerdadero} alt="Verdadero" className="w-20 h-20 object-contain drop-shadow-sm" />
        ) : (
          <img src={imgFalso} alt="Falso" className="w-20 h-20 object-contain drop-shadow-sm" />
        )}
      </div>
      <span className={textClass}>{isTrueButton ? "Verdadero" : "Falso"}</span>

      {selected && isCorrectAnswer && (
        <div className="absolute top-4 right-4 text-green-600"><Check size={28} strokeWidth={3} /></div>
      )}
      {selected && !isCorrectAnswer && (
        <div className="absolute top-4 right-4 text-red-500"><X size={28} strokeWidth={3} /></div>
      )}
    </button>
  );
}
