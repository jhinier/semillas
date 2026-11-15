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
                    <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-slate-100 [backface-visibility:hidden] dark:border-slate-700 dark:bg-slate-800">
                      <img
                        src={dorsoCarta}
                        alt="Reverso Flashcard"
                        className="w-full h-full object-cover opacity-90 transition-transform hover:scale-110 duration-500"
                      />
                    </div>

                    <div
                      className={`absolute inset-0 flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-2 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] sm:border-4 ${
                        card.isMatched
                          ? "border-green-500 bg-green-100 dark:border-emerald-500 dark:bg-emerald-950/80"
                          : "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/80"
                      }`}
                    >
                      <p
                        className={`w-full break-words px-1 text-xs font-bold sm:text-sm ${
                          card.isMatched
                            ? "text-green-800 dark:text-emerald-200"
                            : "text-amber-700 dark:text-amber-200"
                        }`}
                      >
                        {card.texto}
                      </p>
                      {card.isMatched && <Check className="mt-1 shrink-0 text-green-600 dark:text-emerald-300" size={16} strokeWidth={3} />}
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
