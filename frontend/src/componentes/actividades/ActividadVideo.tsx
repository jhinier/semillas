import { useState } from "react";
import type { Actividad } from "../../shared/api/api";
import { playSound } from "../../lib/audio";
import { CompletadoCard } from "./CompletadoCard";
import { PlaySquare, Check, X } from "lucide-react";

interface ActividadVideoProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}

interface ConfiguracionVideo {
  pregunta?: string;
  opciones?: string[];
  respuesta_correcta?: number;
  video_url?: string;
}

export function ActividadVideo({ actividad, onComplete }: ActividadVideoProps) {
  const [completed, setCompleted] = useState(false);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  const configuracion = actividad.configuracion as Partial<ConfiguracionVideo>;
  const pregunta = configuracion.pregunta ?? "¿Qué aprendiste del video?";
  const opciones = configuracion.opciones ?? [];
  const respuestaCorrecta = configuracion.respuesta_correcta ?? 0;

  // Lógica de video y fallback
  let rawUrl = configuracion.video_url || "";
  if (!rawUrl || rawUrl.includes("bibleproject.com")) {
    rawUrl = "https://youtu.be/0wkVnoI_yPU";
  }

  // Parsear URL de Youtube
  let embedUrl = rawUrl;
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    const videoId = rawUrl.split("v=")[1]?.split("&")[0] || rawUrl.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`;
    }
  }

  const handleSeleccionar = (index: number) => {
    if (completed) return;
    
    setSeleccion(index);
    if (index === respuestaCorrecta) {
      playSound("acertado");
      setErrorIndex(null);
      setCompleted(true);
      setTimeout(() => {
        playSound("insignia");
        onComplete(actividad.id, actividad.xp_recompensa || 0);
      }, 500);
    } else {
      playSound("error");
      setErrorIndex(index);
      // Quitar la marca de error después de un segundo
      setTimeout(() => setErrorIndex(null), 1000);
    }
  };

  return (
    <div className="flex flex-col gap-8 items-center w-full max-w-4xl mx-auto py-4 animate-in fade-in zoom-in-95">
      
      {!completed ? (
        <div className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          
          {/* Reproductor de Video */}
          <div className="w-full aspect-video bg-slate-900 relative">
            {embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be") ? (
              <iframe
                src={embedUrl}
                title="Reproductor de Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              ></iframe>
            ) : (
              <video
                src={embedUrl}
                controls
                className="w-full h-full object-contain"
              >
                Tu navegador no soporta videos HTML5.
              </video>
            )}
          </div>

          {/* Área de Preguntas */}
          <div className="p-5 md:p-12 flex flex-col gap-6 items-center text-center">
            <h3 className="text-xl md:text-2xl font-black text-slate-800">
              {pregunta}
            </h3>

            <div className="flex flex-col gap-4 w-full max-w-lg mt-4">
              {opciones.map((opcion, index) => {
                const isSelected = seleccion === index;
                const isError = errorIndex === index;
                
                let baseClasses = "px-5 py-4 rounded-2xl border-2 font-bold text-base md:text-lg transition-all flex items-center justify-between ";
                
                if (isError) {
                  baseClasses += "border-rose-400 bg-rose-50 text-rose-700 animate-shake";
                } else if (isSelected && completed) {
                  baseClasses += "border-emerald-500 bg-emerald-500 text-white";
                } else {
                  baseClasses += "border-slate-200 bg-white text-slate-700 hover:border-red-400 hover:text-red-600 hover:-translate-y-1 hover:shadow-md cursor-pointer";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSeleccionar(index)}
                    disabled={completed}
                    className={baseClasses}
                  >
                    <span>{opcion}</span>
                    {isError && <X className="w-6 h-6 text-rose-500" />}
                    {isSelected && completed && <Check className="w-6 h-6 text-white" />}
                  </button>
                );
              })}
            </div>
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
