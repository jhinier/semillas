import { useEffect, useState } from "react";
import { playSound } from "../../../lib/audio";
import type { Actividad } from "../../../shared/api/schemas/temas.schema";

interface ParData {
  id: number;
  texto: string;
}

interface FlashcardConfiguracion {
  pares?: ParData[];
}

export interface FlashcardItem {
  uid: string;
  parId: number;
  texto: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface UseFlashcardsProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

export function useFlashcards({ actividad, onComplete }: UseFlashcardsProps) {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const configuracion = actividad.configuracion as FlashcardConfiguracion;
    const paresData: ParData[] = configuracion.pares || [];
    const deck: FlashcardItem[] = [];

    paresData.forEach((par) => {
      deck.push({ uid: `${par.id}_1`, parId: par.id, texto: par.texto, isFlipped: false, isMatched: false });
      deck.push({ uid: `${par.id}_2`, parId: par.id, texto: par.texto, isFlipped: false, isMatched: false });
    });

    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [actividad]);

  function checkWinCondition(currentCards: FlashcardItem[]) {
    if (currentCards.every((card) => card.isFlipped)) {
      setTimeout(async () => {
        setCompleted(true);
        await playSound("insignia");
        onComplete(actividad.id, actividad.xp_recompensa || 0);
      }, 800);
    }
  }

  function handleCardClick(index: number) {
    if (isLocked || cards[index]!.isFlipped || cards[index]!.isMatched) return;

    playSound("iniciar");

    const newCards = [...cards];
    newCards[index]!.isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);

      const [firstIndex, secondIndex] = newFlippedIndices as [number, number];
      const firstCard = newCards[firstIndex]!;
      const secondCard = newCards[secondIndex]!;

      if (firstCard.parId === secondCard.parId) {
        setTimeout(() => {
          playSound("acertado");
          setCards((prev) => {
            const matched = [...prev];
            matched[firstIndex]!.isMatched = true;
            matched[secondIndex]!.isMatched = true;
            return matched;
          });
          setFlippedIndices([]);
          setIsLocked(false);
          checkWinCondition(newCards);
        }, 500);
      } else {
        setTimeout(() => {
          playSound("error");
          setCards((prev) => {
            const flippedBack = [...prev];
            flippedBack[firstIndex]!.isFlipped = false;
            flippedBack[secondIndex]!.isFlipped = false;
            return flippedBack;
          });
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1200);
      }
    }
  }

  return {
    cards,
    completed,
    handleCardClick,
  };
}
