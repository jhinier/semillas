import { useMemo, useState } from "react";
import { playSound } from "../../lib/audio";
import { OpcionButton } from "./OpcionButton";
import { ProgressBar } from "./ProgressBar";
import { AfirmacionCard } from "./AfirmacionCard";
import { NavegacionControles } from "./NavegacionControles";
import { CompletadoCard } from "./CompletadoCard";

interface AfirmacionRaw {
  texto: string;
  es_verdadero?: boolean;
  correcta?: boolean;
}

interface Configuracion {
  afirmaciones?: AfirmacionRaw[];
  enunciado?: string;
  respuesta_correcta?: boolean;
}

interface Actividad {
  id: string;
  titulo?: string;
  consigna?: string | null;
  configuracion?: Configuracion;
  opciones?: Array<{ texto: string; correcta?: boolean }>;
  xp_recompensa?: number;
  retroalimentacion?: string;
}

interface VerdaderoFalsoActividadProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

export function VerdaderoFalsoActividad({ actividad, onComplete }: VerdaderoFalsoActividadProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const afirmaciones = useMemo(() => {
    const raw = actividad.configuracion?.afirmaciones;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((a) => ({
        texto: a.texto,
        es_verdadero: Boolean(a.es_verdadero ?? a.correcta ?? true),
      }));
    }
    if (typeof actividad.configuracion?.enunciado === "string" && actividad.configuracion.enunciado.trim()) {
      return [
        {
          texto: actividad.configuracion.enunciado.trim(),
          es_verdadero: Boolean(actividad.configuracion.respuesta_correcta ?? true),
        },
      ];
    }
    if (Array.isArray(actividad.opciones) && actividad.opciones.length > 0) {
      const opcionVerdadera = actividad.opciones.find(
        (o) => o.texto.toLowerCase().includes("verdad") && o.correcta,
      );
      return [
        {
          texto: actividad.consigna || actividad.titulo || "El amor de Dios permanece para siempre.",
          es_verdadero: opcionVerdadera ? true : Boolean(actividad.opciones[0]?.correcta ?? true),
        },
      ];
    }
    return [
      {
        texto: actividad.consigna || actividad.titulo || "Dios nos ama siempre de manera incondicional.",
        es_verdadero: true,
      },
    ];
  }, [actividad]);

  const currentAfirmacion = afirmaciones[currentIndex]!;
  const selectedOption = answers[currentIndex] !== undefined ? answers[currentIndex] : null;

  const handleSelectOption = (esVerdadero: boolean) => {
    if (selectedOption !== null || completed) return;

    setAnswers((prev) => ({ ...prev, [currentIndex]: esVerdadero }));
    const correct = esVerdadero === currentAfirmacion.es_verdadero;

    if (correct) {
      void playSound("acertado");
    } else {
      void playSound("error");
    }
  };

  const handleNext = () => {
    if (currentIndex < afirmaciones.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (!completed) {
        setCompleted(true);
        void playSound("insignia");
        onComplete(actividad.id, actividad.xp_recompensa || 0);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto py-2 animate-in fade-in zoom-in-95">
      <ProgressBar current={currentIndex + 1} total={afirmaciones.length} />

      <AfirmacionCard texto={currentAfirmacion.texto} />

      <div className="w-full flex flex-col sm:flex-row gap-4 mb-8 relative">
        <div className="flex-1 relative">
          <OpcionButton
            isTrueButton={true}
            isSelected={selectedOption}
            isCorrectAnswer={currentAfirmacion.es_verdadero}
            onSelect={handleSelectOption}
            disabled={selectedOption !== null}
          />
        </div>
        <div className="flex-1 relative">
          <OpcionButton
            isTrueButton={false}
            isSelected={selectedOption}
            isCorrectAnswer={currentAfirmacion.es_verdadero}
            onSelect={handleSelectOption}
            disabled={selectedOption !== null}
          />
        </div>
      </div>

      {!completed && (
        <NavegacionControles
          currentIndex={currentIndex}
          totalCount={afirmaciones.length}
          selectedOption={selectedOption}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      {completed && <CompletadoCard retroalimentacion={actividad.retroalimentacion} />}
    </div>
  );
}
