import { useEffect, useRef, useState } from "react";
import { playSound } from "../../../lib/audio";
import type { Actividad } from "../../../shared/api/schemas/temas.schema";

interface ParData {
  id?: number | string;
  texto?: string;
  izquierda?: string;
  derecha?: string;
  frente?: string;
  reverso?: string;
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

const PARES_DEFAULT: Array<{ a: string; b: string }> = [
  { a: "Dios es Amor", b: "1 Juan 4:8" },
  { a: "Jesús el Hijo", b: "Juan 3:16" },
  { a: "Espíritu Santo", b: "Consolador y Guía" },
  { a: "El Padre", b: "Creador Fiel" },
];

export function useFlashcards({ actividad, onComplete }: UseFlashcardsProps) {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;
    setCompleted(false);
    setFlippedIndices([]);
    setIsLocked(false);

    const configuracion = (actividad.configuracion ?? {}) as FlashcardConfiguracion;
    const paresData: ParData[] = Array.isArray(configuracion.pares) ? configuracion.pares : [];
    const deck: FlashcardItem[] = [];

    if (paresData.length > 0) {
      paresData.forEach((par, index) => {
        const parId = typeof par.id === "number" ? par.id : index + 1;
        const textoA = par.izquierda ?? par.frente ?? par.texto ?? `Carta ${parId}`;
        const textoB = par.derecha ?? par.reverso ?? par.texto ?? textoA;
        deck.push({ uid: `${parId}_1`, parId, texto: textoA, isFlipped: false, isMatched: false });
        deck.push({ uid: `${parId}_2`, parId, texto: textoB, isFlipped: false, isMatched: false });
      });
    } else if (Array.isArray(actividad.opciones) && actividad.opciones.length > 0) {
      actividad.opciones.forEach((op, index) => {
        const parId = index + 1;
        const textoA = op.texto || `Concepto ${parId}`;
        const textoB = op.retroalimentacion?.trim() ? op.retroalimentacion.trim() : textoA;
        deck.push({ uid: `${parId}_1`, parId, texto: textoA, isFlipped: false, isMatched: false });
        deck.push({ uid: `${parId}_2`, parId, texto: textoB, isFlipped: false, isMatched: false });
      });
    } else {
      PARES_DEFAULT.forEach((par, index) => {
        const parId = index + 1;
        deck.push({ uid: `${parId}_1`, parId, texto: par.a, isFlipped: false, isMatched: false });
        deck.push({ uid: `${parId}_2`, parId, texto: par.b, isFlipped: false, isMatched: false });
      });
    }

    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [actividad]);

  function handleCardClick(index: number) {
    if (isLocked || !cards[index] || cards[index]!.isFlipped || cards[index]!.isMatched) return;

    void playSound("iniciar");

    const newCards = cards.map((c, idx) => (idx === index ? { ...c, isFlipped: true } : c));
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
          void playSound("acertado");
          const updated = newCards.map((c, idx) =>
            idx === firstIndex || idx === secondIndex
              ? { ...c, isFlipped: true, isMatched: true }
              : c,
          );
          setCards(updated);
          setFlippedIndices([]);
          setIsLocked(false);

          if (updated.length > 0 && updated.every((card) => card.isMatched) && !completedRef.current) {
            completedRef.current = true;
            setTimeout(async () => {
              setCompleted(true);
              await playSound("insignia");
              onComplete(actividad.id, actividad.xp_recompensa || 0);
            }, 500);
          }
        }, 450);
      } else {
        setTimeout(() => {
          void playSound("error");
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIndex || idx === secondIndex ? { ...c, isFlipped: false } : c,
            ),
          );
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  }

  return {
    cards,
    completed,
    handleCardClick,
  };
}
