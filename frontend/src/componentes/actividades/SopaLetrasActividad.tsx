import { useState, useEffect, useCallback } from "react";
import { playSound } from "../../lib/audio";
import { SopaLetrasInstrucciones } from "./SopaLetrasInstrucciones";
import { SopaLetrasListaPalabras } from "./SopaLetrasListaPalabras";
import { SopaLetrasGrid } from "./SopaLetrasGrid";
import { SopaLetrasCompletado } from "./SopaLetrasCompletado";
import { generarSopaDeLetras, construirPalabraDesdeCelda } from "./SopaLetrasLogica";

interface SopaLetrasConfig {
  filas?: number;
  columnas?: number;
  palabras?: string[];
}

interface Actividad {
  id: string;
  configuracion?: SopaLetrasConfig;
  xp_recompensa?: number;
  retroalimentacion?: string | null;
}

interface SopaLetrasProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xpRecompensa: number) => void;
}

interface CellCoord {
  r: number;
  c: number;
}

export function SopaLetrasActividad({ actividad, onComplete }: SopaLetrasProps) {
  const [grid, setGrid] = useState<string[][]>([]);
  const [palabras, setPalabras] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [selectionStart, setSelectionStart] = useState<CellCoord | null>(null);
  const [completed, setCompleted] = useState(false);
  const [errorFlash, setErrorFlash] = useState<Set<string>>(new Set());

  const numFilas = actividad.configuracion?.filas || 8;
  const numColumnas = actividad.configuracion?.columnas || 8;

  const generarSopa = useCallback(() => {
    const words: string[] = (actividad.configuracion?.palabras || []).map((w: string) => w.toUpperCase());
    const { grid: newGrid, palabrasColocadas } = generarSopaDeLetras(words, numFilas, numColumnas);
    setPalabras(palabrasColocadas);
    setGrid(newGrid);
  }, [actividad, numFilas, numColumnas]);

  useEffect(() => {
    generarSopa();
    setFoundWords([]);
    setFoundCells(new Set());
    setSelectionStart(null);
    setCompleted(false);
  }, [generarSopa]);

  const handleCellClick = (r: number, c: number) => {
    if (completed) return;

    if (!selectionStart) {
      playSound('iniciar');
      setSelectionStart({ r, c });
      setErrorFlash(new Set());
    } else {
      const startR = selectionStart.r;
      const startC = selectionStart.c;
      
      const diffR = r - startR;
      const diffC = c - startC;
      
      const stepR = diffR === 0 ? 0 : diffR / Math.abs(diffR);
      const stepC = diffC === 0 ? 0 : diffC / Math.abs(diffC);
      
      if (Math.abs(diffR) === Math.abs(diffC) || diffR === 0 || diffC === 0) {
        const length = Math.max(Math.abs(diffR), Math.abs(diffC)) + 1;
        const { palabra: currentWord, celdas: selectedCells } = construirPalabraDesdeCelda(
          grid, startR, startC, stepR, stepC, length
        );
        
        const reverseWord = currentWord.split('').reverse().join('');
        const matchedWord = palabras.find(w => (w === currentWord || w === reverseWord) && !foundWords.includes(w));
        
        if (matchedWord) {
          playSound('acertado');
          setFoundWords(prev => [...prev, matchedWord]);
          setFoundCells(prev => new Set([...Array.from(prev), ...Array.from(selectedCells)]));
          
          if (foundWords.length + 1 === palabras.length) {
            setTimeout(() => {
              setCompleted(true);
              playSound('insignia');
              onComplete(actividad.id, actividad.xp_recompensa || 0);
            }, 800);
          }
        } else {
          playSound('error');
          setErrorFlash(selectedCells);
          setTimeout(() => setErrorFlash(new Set()), 1000);
        }
      } else {
        playSound('error');
      }
      
      setSelectionStart(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 animate-in fade-in zoom-in-95">
      {!completed ? (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch justify-center">
          <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center gap-6">
            <SopaLetrasInstrucciones 
              instruction="Toca la primera letra y luego la última para formar la palabra oculta."
            />
            <SopaLetrasListaPalabras palabras={palabras} foundWords={foundWords} />
          </div>
          <div className="w-full md:w-1/2 lg:w-3/5 flex justify-center items-center">
            <SopaLetrasGrid
              grid={grid}
              numColumnas={numColumnas}
              foundCells={foundCells}
              selectionStart={selectionStart}
              errorFlash={errorFlash}
              onCellClick={handleCellClick}
            />
          </div>
        </div>
      ) : (
        <SopaLetrasCompletado retroalimentacion={actividad.retroalimentacion} />
      )}
    </div>
  );
}
