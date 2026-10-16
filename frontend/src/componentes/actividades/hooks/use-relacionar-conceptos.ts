import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import {
  agregarRelacionCompletada,
  mezclarRelacionesConceptos,
  relacionesCompletadas,
  validarIntentoRelacion,
  type ParConcepto,
  type RelacionConcepto,
} from "../relacionar-conceptos.utils";

type FeedbackRelacion = {
  tipo: "correcto" | "incorrecto";
  mensaje: string;
} | null;

interface UseRelacionarConceptosOptions {
  pares: ParConcepto[];
  mostrarPistas?: boolean;
  onComplete?: () => void;
}

interface UseRelacionarConceptosReturn {
  relaciones: RelacionConcepto[];
  conceptoSeleccionadoId: string | null;
  conceptoArrastradoId: string | null;
  completadas: string[];
  feedback: FeedbackRelacion;
  estaCompletada: boolean;
  seleccionarConcepto: (id: string) => void;
  seleccionarRelacion: (relacion: RelacionConcepto) => void;
  soltarSobreRelacion: (relacion: RelacionConcepto) => void;
  reiniciarActividad: () => void;
  setConceptoArrastradoId: Dispatch<SetStateAction<string | null>>;
}

export function useRelacionarConceptos({
  pares,
  onComplete,
}: UseRelacionarConceptosOptions): UseRelacionarConceptosReturn {
  const [relaciones, setRelaciones] = useState<RelacionConcepto[]>(() => mezclarRelacionesConceptos(pares));
  const [conceptoSeleccionadoId, setConceptoSeleccionadoId] = useState<string | null>(null);
  const [conceptoArrastradoId, setConceptoArrastradoId] = useState<string | null>(null);
  const [completadas, setCompletadas] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRelacion>(null);
  const completoNotificado = useRef(false);

  const estaCompletada = relacionesCompletadas(pares, completadas);

  useEffect(() => {
    setRelaciones(mezclarRelacionesConceptos(pares));
    setConceptoSeleccionadoId(null);
    setConceptoArrastradoId(null);
    setCompletadas([]);
    setFeedback(null);
    completoNotificado.current = false;
  }, [pares]);

  useEffect(() => {
    if (!estaCompletada || completoNotificado.current) {
      return;
    }

    completoNotificado.current = true;
    void import("@/lib/audio")
      .then(({ playSound }) => Promise.resolve(playSound("acertado")))
      .catch(() => undefined);
    onComplete?.();
  }, [estaCompletada, onComplete]);

  function reiniciarActividad() {
    setRelaciones(mezclarRelacionesConceptos(pares));
    setConceptoSeleccionadoId(null);
    setConceptoArrastradoId(null);
    setCompletadas([]);
    setFeedback(null);
  }

  function intentarRelacion(conceptoId: string, relacionId: string) {
    const resultado = validarIntentoRelacion(conceptoId, relacionId);

    if (resultado.correcto) {
      setCompletadas((completadasActuales) => agregarRelacionCompletada(completadasActuales, resultado.conceptoId));
      setFeedback({ tipo: "correcto", mensaje: "Correcto. Encontraste la pareja." });
    } else {
      setFeedback({ tipo: "incorrecto", mensaje: "Intenta otra vez. Esa no es la pareja." });
    }

    setConceptoSeleccionadoId(null);
    setConceptoArrastradoId(null);
  }

  function seleccionarConcepto(id: string) {
    if (completadas.includes(id)) {
      return;
    }

    setConceptoSeleccionadoId((seleccionActual) => (seleccionActual === id ? null : id));
    setFeedback(null);
  }

  function seleccionarRelacion(relacion: RelacionConcepto) {
    if (completadas.includes(relacion.id) || conceptoSeleccionadoId === null) {
      return;
    }

    intentarRelacion(conceptoSeleccionadoId, relacion.id);
  }

  function soltarSobreRelacion(relacion: RelacionConcepto) {
    if (conceptoArrastradoId !== null && !completadas.includes(relacion.id)) {
      intentarRelacion(conceptoArrastradoId, relacion.id);
      return;
    }

    setConceptoArrastradoId(null);
  }

  return {
    relaciones,
    conceptoSeleccionadoId,
    conceptoArrastradoId,
    completadas,
    feedback,
    estaCompletada,
    seleccionarConcepto,
    seleccionarRelacion,
    soltarSobreRelacion,
    reiniciarActividad,
    setConceptoArrastradoId,
  };
}

export type { FeedbackRelacion };
