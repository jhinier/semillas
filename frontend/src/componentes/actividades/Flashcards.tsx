import { Check } from "lucide-react";
import dorsoCarta from "../../assets/images/Ilustraciones/flascards.webp";
import { AlertaCompletado } from "@/componentes/ui/alerta-completado";
import { useFlashcards } from "./hooks/use-flashcards";
import type { Actividad } from "@/shared/api/schemas/temas.schema";

interface FlashcardsProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

export function Flashcards({ actividad, onComplete }: FlashcardsProps) {
  const { cards, completed, handleCardClick } = useFlashcards({ actividad, onComplete });

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-2 animate-in fade-in zoom-in-95">
      {!completed ? (
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 place-items-center">
            {cards.map((card, index) => {
              const matchedStyle = card.isMatched ? "opacity-60 scale-95" : "";

              return (
                <div
                  key={card.uid}
                  className={`w-full h-24 sm:h-32 cursor-pointer transition-all duration-300 [perspective:1000px] ${matchedStyle}`}
                  onClick={() => handleCardClick(index)}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] shadow-md rounded-xl ${
                      card.isFlipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-slate-100 rounded-xl border-4 border-white flex items-center justify-center overflow-hidden">
                      <img
                        src={dorsoCarta}
                        alt="Reverso Flashcard"
                        className="w-full h-full object-cover opacity-90 transition-transform hover:scale-110 duration-500"
                      />
                    </div>

                    <div
                      className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl border-2 sm:border-4 flex flex-col items-center justify-center p-2 text-center overflow-hidden ${
                        card.isMatched ? "bg-green-100 border-green-500" : "bg-amber-50 border-amber-400"
                      }`}
                    >
                      <p className={`font-bold ${card.isMatched ? "text-green-800" : "text-amber-700"} text-xs sm:text-sm break-words w-full px-1`}>
                        {card.texto}
                      </p>
                      {card.isMatched && <Check className="text-green-600 mt-1 shrink-0" size={16} strokeWidth={3} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <AlertaCompletado
          clase="mt-4"
          mensaje={actividad.retroalimentacion || "Has encontrado todos los pares con éxito."}
        />
      )}
    </div>
  );
}
