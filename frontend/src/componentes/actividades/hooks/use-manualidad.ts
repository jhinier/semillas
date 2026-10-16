import { useState, useCallback } from "react";
import { playSound } from "../../../lib/audio";

interface Actividad {
  id: string;
  xp_recompensa?: number;
  retroalimentacion?: string;
  configuracion?: {
    materiales?: string[];
    pasos?: string[];
  };
}

interface UseManualidadOptions {
  actividad: Actividad;
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

interface UseManualidadReturn {
  materialesCheck: number[];
  currentStep: number;
  completed: boolean;
  todosMaterialesListos: boolean;
  toggleMaterial: (index: number) => void;
  nextStep: () => void;
}

export function useManualidad({ actividad, onComplete }: UseManualidadOptions): UseManualidadReturn {
  const materiales = actividad.configuracion?.materiales || [];
  const pasos = actividad.configuracion?.pasos || [];

  const [materialesCheck, setMaterialesCheck] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const toggleMaterial = useCallback((index: number) => {
    if (completed) return;

    if (materialesCheck.includes(index)) {
      setMaterialesCheck(materialesCheck.filter(i => i !== index));
    } else {
      playSound('siguiente');
      setMaterialesCheck(prev => [...prev, index]);
    }
  }, [completed, materialesCheck]);

  const todosMaterialesListos = materiales.length === 0 || materialesCheck.length === materiales.length;

  const nextStep = useCallback(() => {
    if (currentStep < pasos.length - 1) {
      playSound('acertado');
      setCurrentStep(prev => prev + 1);
    } else {
      setCompleted(true);
      playSound('insignia');
      onComplete(actividad.id, actividad.xp_recompensa || 0);
    }
  }, [currentStep, pasos.length, actividad.id, actividad.xp_recompensa, onComplete]);

  return {
    materialesCheck,
    currentStep,
    completed,
    todosMaterialesListos,
    toggleMaterial,
    nextStep,
  };
}
