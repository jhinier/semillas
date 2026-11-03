import { useMemo, useState } from "react";
import { playSound } from "../../../lib/audio";
import type { Actividad } from "../../../shared/api/schemas/temas.schema";

interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;
}

interface OpcionConfig {
  texto: string;
  correcta?: boolean;
  esCorrecta?: boolean;
}

interface QuizConfiguracion {
  preguntas?: PreguntaQuiz[];
  opciones?: OpcionConfig[];
  pregunta?: string;
}

interface UseQuizProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

export function useQuiz({ actividad, onComplete }: UseQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [completed, setCompleted] = useState(false);

  const preguntas: PreguntaQuiz[] = useMemo(() => {
    const configuracion = (actividad.configuracion ?? {}) as QuizConfiguracion;
    if (Array.isArray(configuracion.preguntas) && configuracion.preguntas.length > 0) {
      return configuracion.preguntas;
    }

    if (Array.isArray(configuracion.opciones) && configuracion.opciones.length > 0) {
      const idxCorrecta = configuracion.opciones.findIndex(
        (o) => Boolean(o.correcta ?? o.esCorrecta),
      );
      return [
        {
          pregunta: configuracion.pregunta || actividad.consigna || actividad.titulo || "Selecciona la respuesta correcta",
          opciones: configuracion.opciones.map((o) => o.texto),
          respuesta_correcta: idxCorrecta >= 0 ? idxCorrecta : 0,
        },
      ];
    }

    if (Array.isArray(actividad.opciones) && actividad.opciones.length > 0) {
      const idxCorrecta = actividad.opciones.findIndex((o) => Boolean(o.correcta));
      return [
        {
          pregunta: actividad.consigna || actividad.titulo || "Selecciona la respuesta correcta",
          opciones: actividad.opciones.map((o) => o.texto),
          respuesta_correcta: idxCorrecta >= 0 ? idxCorrecta : 0,
        },
      ];
    }

    return [];
  }, [actividad]);

  const currentQuestion = preguntas[currentQuestionIndex];

  const selectedOption = answers[currentQuestionIndex] !== undefined ? answers[currentQuestionIndex] : null;

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || completed || !currentQuestion) return;

    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: index }));
    const correct = index === currentQuestion.respuesta_correcta;

    if (correct) {
      void playSound("acertado");
    } else {
      void playSound("error");
    }
  };

  const handleNext = async () => {
    if (currentQuestionIndex < preguntas.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      if (!completed) {
        setCompleted(true);
        await playSound("insignia");
        onComplete(actividad.id, actividad.xp_recompensa || 0);
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return {
    currentQuestionIndex,
    answers,
    completed,
    preguntas,
    currentQuestion,
    selectedOption,
    handleSelectOption,
    handleNext,
    handlePrev,
  };
}
