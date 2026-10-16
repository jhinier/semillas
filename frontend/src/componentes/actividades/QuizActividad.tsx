import { Check, X, ArrowLeft, ArrowRight } from "lucide-react";
import imgBannerQuiz from "../../assets/images/Ilustraciones/banner_quiz.webp";
import { Boton } from "@/componentes/ui/boton";
import { AlertaCompletado } from "@/componentes/ui/alerta-completado";
import { unirClases } from "@/lib/utilidades";
import { useQuiz } from "./hooks/use-quiz";
import type { Actividad } from "@/shared/api/schemas/temas.schema";

interface QuizActividadProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

const letters = ["A", "B", "C", "D", "E", "F"];

export function QuizActividad({ actividad, onComplete }: QuizActividadProps) {
  const {
    currentQuestionIndex,
    completed,
    preguntas,
    currentQuestion,
    selectedOption,
    handleSelectOption,
    handleNext,
    handlePrev,
  } = useQuiz({ actividad, onComplete });

  if (!preguntas.length) return <div className="p-4 text-center text-slate-500">No hay preguntas configuradas.</div>;

  const question = currentQuestion!;

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto py-2 animate-in fade-in zoom-in-95">
      
      {/* Top Bar (Progress) */}
      <div className="flex justify-between w-full mb-8 bg-violet-50 text-violet-800 font-bold px-5 py-3 rounded-xl text-sm">
        <span>Pregunta {currentQuestionIndex + 1} de {preguntas.length}</span>
      </div>

      {/* Pregunta */}
      <div
        className="w-full mb-8 relative flex items-center justify-center p-8 sm:p-12 min-h-[160px] overflow-hidden rounded-3xl bg-cover bg-center"
        style={{ backgroundImage: `url(${imgBannerQuiz})` }}
      >
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 text-center relative z-10">
          {question.pregunta}
        </h3>
      </div>

      {/* Opciones */}
      <div className="w-full flex flex-col mb-8">
        {question.opciones.map((opcion: string, index: number) => {
          const isSelected = selectedOption === index;
          const isCorrectAnswer = index === question.respuesta_correcta;
          
          const baseClass = "w-full text-left px-5 py-4 rounded-xl font-medium text-base sm:text-lg border-2 transition-all flex items-center justify-between mb-3";
          let textClass = "text-slate-700";

          let btnClass = baseClass;
          if (selectedOption === null) {
            btnClass = unirClases(baseClass, "bg-white border-slate-200 hover:border-violet-300 hover:bg-slate-50 cursor-pointer shadow-sm");
          } else {
            if (isSelected && isCorrectAnswer) {
              btnClass = unirClases(baseClass, "bg-green-50 border-green-500 z-10 shadow-sm");
              textClass = "text-slate-800 font-semibold";
            } else if (isSelected && !isCorrectAnswer) {
              btnClass = unirClases(baseClass, "bg-red-50 border-red-300");
              textClass = "text-slate-800 font-semibold";
            } else if (isCorrectAnswer) {
              btnClass = unirClases(baseClass, "bg-green-50/50 border-green-400 opacity-80");
              textClass = "text-slate-700";
            } else {
              btnClass = unirClases(baseClass, "bg-white border-slate-200 opacity-50");
              textClass = "text-slate-500";
            }
          }

          return (
            <button 
              key={index}
              onClick={() => handleSelectOption(index)}
              disabled={selectedOption !== null}
              className={btnClass}
            >
              <div className="flex items-center gap-4">
                <span className={`font-bold ${isSelected ? 'text-slate-800' : 'text-violet-800'}`}>
                  {letters[index]}.
                </span>
                <span className={textClass}>{opcion}</span>
              </div>
              {isSelected && isCorrectAnswer && <div className="text-green-600"><Check size={24} strokeWidth={2.5} /></div>}
              {isSelected && !isCorrectAnswer && <div className="text-red-500"><X size={24} strokeWidth={2.5} /></div>}
            </button>
          );
        })}
      </div>

      {/* Controles de Navegación */}
      {!completed && (
        <div className="flex flex-col-reverse sm:flex-row justify-center items-center gap-4 w-full mt-8">
          <Boton
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            variante="texto"
            className="w-full sm:w-auto"
          >
            <ArrowLeft size={18} /> Anterior
          </Boton>

          <Boton
            onClick={handleNext}
            disabled={selectedOption === null}
            className="w-full sm:w-auto"
          >
            {currentQuestionIndex === preguntas.length - 1 ? "Finalizar" : "Siguiente"} <ArrowRight size={18} />
          </Boton>
        </div>
      )}

      {/* Card de Completado */}
      {completed && (
        <AlertaCompletado
          clase="mt-8"
          mensaje={actividad.retroalimentacion || "Has respondido todas las preguntas."}
        />
      )}
    </div>
  );
}
