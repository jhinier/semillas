interface Opcion {
  id: string;
  etiqueta?: string | null;
  texto: string;
  correcta?: boolean;
  orden?: number;
  retroalimentacion?: string | null;
}

interface OpcionesConFeedbackProps {
  opciones: Opcion[];
  actividadId: string;
  selectedAnswers: Record<string, string>;
  onSelectOption: (actividadId: string, opcionId: string, esCorrecta: boolean, xpRecompensa?: number) => void;
  xpRecompensa?: number;
}

export function OpcionesConFeedback({
  opciones,
  actividadId,
  selectedAnswers,
  onSelectOption,
  xpRecompensa
}: OpcionesConFeedbackProps) {
  return (
    <div className="flex flex-col gap-3 mt-4">
      {opciones.map((opcion) => {
        const isSelected = selectedAnswers[actividadId] === opcion.id;
        const hasAnswered = !!selectedAnswers[actividadId];
        const isCorrect = opcion.correcta;

        let optionClass = "bg-white border-slate-200 hover:border-[#7c3aed] hover:bg-purple-50/30 cursor-pointer";
        if (hasAnswered) {
          if (isSelected) {
            optionClass = isCorrect 
              ? "bg-green-100 border-green-500 ring-2 ring-green-500/20" 
              : "bg-red-100 border-red-500 ring-2 ring-red-500/20";
          } else if (isCorrect) {
            optionClass = "bg-green-100 border-green-500 ring-2 ring-green-500/50";
          } else {
            optionClass = "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed";
          }
        }

        const labelBg = hasAnswered && (isSelected || isCorrect)
          ? (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
          : 'bg-slate-100 text-slate-600';

        const textColor = hasAnswered && (isSelected || isCorrect)
          ? (isCorrect ? 'text-green-800' : 'text-red-800')
          : 'text-slate-700';

        return (
          <div 
            key={opcion.id} 
            onClick={() => !hasAnswered && onSelectOption(actividadId, opcion.id, !!isCorrect, xpRecompensa)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${optionClass} ${hasAnswered ? '' : 'cursor-pointer'}`}
          >
            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${labelBg}`}>
              {opcion.etiqueta}
            </span>
            <span className={`font-medium ${textColor}`}>{opcion.texto}</span>
          </div>
        );
      })}
    </div>
  );
}
