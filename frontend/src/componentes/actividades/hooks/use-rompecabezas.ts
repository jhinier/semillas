import { useEffect, useMemo, useRef, useState } from "react";
import {
  crearPiezasRompecabezas,
  intercambiarPiezas,
  mezclarPiezasRompecabezas,
  normalizarDimensionesRompecabezas,
  rompecabezasCompletado,
  type PiezaRompecabezas,
} from "../rompecabezas.utils";

interface UseRompecabezasProps {
  imagen: string;
  filas: number;
  columnas: number;
  onComplete?: () => void;
}

export function useRompecabezas({
  imagen,
  filas,
  columnas,
  onComplete,
}: UseRompecabezasProps) {
  const dimensiones = useMemo(
    () => normalizarDimensionesRompecabezas(filas, columnas),
    [filas, columnas],
  );

  const piezasBase = useMemo(
    () => crearPiezasRompecabezas(dimensiones.filas, dimensiones.columnas),
    [dimensiones],
  );

  const [piezas, setPiezas] = useState(() => mezclarPiezasRompecabezas(piezasBase));
  const [piezaSeleccionadaId, setPiezaSeleccionadaId] = useState<number | null>(null);
  const [piezaArrastradaId, setPiezaArrastradaId] = useState<number | null>(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(false);
  const completoNotificado = useRef(false);

  const totalPiezas = dimensiones.filas * dimensiones.columnas;
  const estaCompletado = rompecabezasCompletado(piezas);

  useEffect(() => {
    setPiezas(mezclarPiezasRompecabezas(piezasBase));
    setPiezaSeleccionadaId(null);
    completoNotificado.current = false;
  }, [piezasBase]);

  useEffect(() => {
    if (!estaCompletado || completoNotificado.current) return;

    completoNotificado.current = true;
    void import("@/lib/audio")
      .then(({ playSound }) => Promise.resolve(playSound("acertado")))
      .catch(() => undefined);
    onComplete?.();
  }, [estaCompletado, onComplete]);

  function intercambiarPorId(primeraId: number, segundaId: number) {
    setPiezas((actuales) => intercambiarPiezas(actuales, primeraId, segundaId));
  }

  function seleccionarPieza(id: number) {
    if (piezaSeleccionadaId === null) {
      setPiezaSeleccionadaId(id);
      return;
    }
    if (piezaSeleccionadaId === id) {
      setPiezaSeleccionadaId(null);
      return;
    }
    intercambiarPorId(piezaSeleccionadaId, id);
    setPiezaSeleccionadaId(null);
  }

  function iniciarArrastre(id: number) {
    setPiezaArrastradaId(id);
  }

  function soltarSobrePieza(id: number) {
    if (piezaArrastradaId !== null && piezaArrastradaId !== id) {
      intercambiarPorId(piezaArrastradaId, id);
    }
    setPiezaArrastradaId(null);
  }

  function mezclarOtraVez() {
    setPiezas((actuales) => mezclarPiezasRompecabezas(actuales));
    setPiezaSeleccionadaId(null);
    completoNotificado.current = false;
  }

  return {
    dimensiones,
    piezas,
    piezaSeleccionadaId,
    imagenAmpliada,
    setImagenAmpliada,
    estaCompletado,
    totalPiezas,
    seleccionarPieza,
    iniciarArrastre,
    soltarSobrePieza,
    mezclarOtraVez,
  };
}
