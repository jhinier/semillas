import { useState, useRef, useEffect } from "react";
import type { Actividad } from "../../shared/api/api";
import { playSound } from "../../lib/audio";
import { CompletadoCard } from "./CompletadoCard";
import { GripVertical, ArrowUp, ArrowDown, ShieldAlert, Check } from "lucide-react";

interface ArrastrarSoltarProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}

interface ConfiguracionArrastrarSoltar {
  items?: string[];
  orden_correcto?: number[];
}

export function ArrastrarSoltar({ actividad, onComplete }: ArrastrarSoltarProps) {
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(false);

  const configuracion = actividad.configuracion as Partial<ConfiguracionArrastrarSoltar>;
  const itemsOriginales = configuracion.items ?? [];
  const ordenCorrecto = configuracion.orden_correcto ?? [];

  // Estado de los items actuales (mezclados inicialmente)
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);

  // Para el drag and drop nativo
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Mezclar los items solo al inicio, asegurando que no estén en el orden correcto
  useEffect(() => {
    if (itemsOriginales.length > 0) {
      let mixed = itemsOriginales.map((text, id) => ({ id, text }));
      // Mezclamos de forma simple (inversa o aleatoria)
      mixed = [...mixed].sort(() => Math.random() - 0.5);
      
      // Si de casualidad se mezcló en el orden correcto, lo volvemos a desordenar
      const isPerfect = mixed.every((item, idx) => item.id === ordenCorrecto[idx]);
      if (isPerfect && mixed.length > 1) {
        // Intercambiar los dos primeros
        const temp = mixed[0];
        mixed[0] = mixed[1]!;
        mixed[1] = temp!;
      }
      setItems(mixed);
    }
  }, [itemsOriginales, ordenCorrecto]);

  // Manejo de Drag and Drop
  const handleSort = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      let _items = [...items];
      const draggedItemContent = _items.splice(dragItem.current, 1)[0];
      if (draggedItemContent) {
        _items.splice(dragOverItem.current, 0, draggedItemContent);
        setItems(_items);
        setError(false);
      }
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Manejo con Botones (Para Móviles / Accesibilidad)
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const _items = [...items];
      const temp = _items[index - 1];
      _items[index - 1] = _items[index]!;
      _items[index] = temp!;
      setItems(_items);
      setError(false);
    } else if (direction === 'down' && index < items.length - 1) {
      const _items = [...items];
      const temp = _items[index + 1];
      _items[index + 1] = _items[index]!;
      _items[index] = temp!;
      setItems(_items);
      setError(false);
    }
  };

  const handleVerificar = () => {
    const isCorrect = items.every((item, index) => item.id === ordenCorrecto[index]);
    
    if (isCorrect) {
      playSound("acertado");
      setCompleted(true);
      setTimeout(() => {
        playSound("insignia");
        onComplete(actividad.id, actividad.xp_recompensa || 0);
      }, 500);
    } else {
      playSound("error");
      setError(true);
    }
  };

  if (itemsOriginales.length === 0) {
    return (
      <div className="text-center p-8 text-rose-500 font-bold bg-rose-50 rounded-2xl border-2 border-rose-200">
        Esta actividad no tiene items configurados.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-3xl mx-auto py-4 animate-in fade-in zoom-in-95">
      {!completed ? (
        <div className="w-full bg-white rounded-[2rem] p-5 md:p-8 shadow-sm border border-slate-100 flex flex-col gap-4">
          
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div 
                key={item.id}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleSort}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all group"
              >
                {/* Drag Handle - Solo visible en desktop */}
                <div className="hidden md:block text-slate-300 group-hover:text-blue-500 cursor-grab active:cursor-grabbing">
                  <GripVertical size={28} />
                </div>
                
                {/* Texto */}
                <span className="flex-1 font-bold text-base md:text-lg text-slate-700 select-none">
                  {item.text}
                </span>
                
                {/* Controles de Accesibilidad / Móvil (Flechitas gigantes) */}
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <button 
                    aria-label={`Mover ${item.text} hacia arriba`}
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-3 md:p-2 text-slate-500 bg-slate-50 hover:text-blue-600 hover:bg-blue-100 border border-slate-200 rounded-xl disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-500 transition-colors shadow-sm"
                  >
                    <ArrowUp size={24} className="md:w-6 md:h-6 w-7 h-7" />
                  </button>
                  <button 
                    aria-label={`Mover ${item.text} hacia abajo`}
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-3 md:p-2 text-slate-500 bg-slate-50 hover:text-blue-600 hover:bg-blue-100 border border-slate-200 rounded-xl disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-slate-500 transition-colors shadow-sm"
                  >
                    <ArrowDown size={24} className="md:w-6 md:h-6 w-7 h-7" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 animate-shake">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <p className="font-bold">El orden no es correcto aún. ¡Sigue intentándolo!</p>
            </div>
          )}

          <div className="mt-6 md:mt-8 flex justify-center w-full">
            <button
              onClick={handleVerificar}
              style={{ backgroundColor: '#059669', color: '#ffffff', borderColor: '#047857' }}
              className="px-8 md:px-10 py-3 md:py-4 rounded-full font-black text-lg md:text-xl shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 border-4 w-full sm:w-auto justify-center"
            >
              <Check size={24} className="md:w-7 md:h-7" strokeWidth={4} />
              Comprobar
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full mt-4">
          <CompletadoCard retroalimentacion={actividad.retroalimentacion ?? undefined} />
        </div>
      )}
    </div>
  );
}
