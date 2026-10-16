import { useState } from "react";
import type { Actividad } from "../../shared/api/api";
import { playSound } from "../../lib/audio";
import { CompletadoCard } from "./CompletadoCard";
import { Music, PlayCircle, Check, Star } from "lucide-react";

interface ActividadCancionProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}

interface ConfiguracionCancion {
  letra?: string[];
  acciones?: string[];
  audio_url?: string;
  cancion_url?: string;
}

export function ActividadCancion({ actividad, onComplete }: ActividadCancionProps) {
  const [completed, setCompleted] = useState(false);
  const [accionesRealizadas, setAccionesRealizadas] = useState<Set<number>>(new Set());

  const configuracion = actividad.configuracion as Partial<ConfiguracionCancion>;
  const letra = configuracion.letra ?? [];
  const acciones = configuracion.acciones ?? [];
  
  // URL de video (tratamos de usar audio_url o cancion_url si son embebibles)
  let rawUrl = (configuracion.audio_url as string) || (configuracion.cancion_url as string) || "";
  
  // Parsear URL de Youtube
  let embedUrl = "";
  let isEmbeddable = false;
  
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    const videoId = rawUrl.split("v=")[1]?.split("&")[0] || rawUrl.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`;
      isEmbeddable = true;
    }
  }

  const handleToggleAccion = (index: number) => {
    setAccionesRealizadas(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
        // Podríamos poner un sonidito aquí si quisieras, como un 'pop' o 'clic'
      }
      return next;
    });
  };

  const puedeCompletar = acciones.length === 0 || accionesRealizadas.size === acciones.length;

  const handleCompletar = () => {
    if (!puedeCompletar) return;
    playSound("acertado");
    setCompleted(true);
    setTimeout(async () => {
      await playSound("insignia");
      onComplete(actividad.id, actividad.xp_recompensa || 0);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-4xl mx-auto py-4 animate-in fade-in zoom-in-95">
      {!completed ? (
        <div className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          
          <div className="p-5 md:p-8 flex flex-col md:flex-row gap-8">
            
            {/* Reproductor y Letra */}
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Reproductor de Video o Botones Externos */}
              <div className="w-full bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl overflow-hidden shadow-sm border-2 border-amber-200 relative flex flex-col items-center justify-center">
                {isEmbeddable ? (
                  <div className="w-full aspect-video bg-slate-900">
                    <iframe
                      src={embedUrl}
                      title="Reproductor de Canción"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    ></iframe>
                  </div>
                ) : (
                  <div className="w-full p-5 sm:p-8 md:p-12 flex flex-col items-center justify-center text-amber-900 gap-4 md:gap-6">
                    <Music className="w-12 h-12 md:w-16 md:h-16 text-amber-500 opacity-90 animate-bounce" />
                    <div className="text-center">
                      <p className="font-black text-xl md:text-3xl text-amber-800 mb-1 md:mb-2">¡Hora de cantar!</p>
                      <p className="font-medium text-amber-700/80 max-w-md mx-auto text-sm md:text-base px-2">
                        Toca uno de los botones para abrir la canción. ¡Canta bien fuerte!
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
                      {configuracion.audio_url && (
                        <a 
                          href={configuracion.audio_url as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 md:px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-center transition-colors shadow-sm text-sm md:text-base"
                        >
                          🎵 Abrir Canción
                        </a>
                      )}
                      {configuracion.cancion_url && (
                        <a 
                          href={configuracion.cancion_url as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 md:px-6 py-3 border-2 border-orange-300 hover:border-orange-400 hover:bg-orange-50 text-orange-700 font-bold rounded-xl text-center transition-colors shadow-sm text-sm md:text-base"
                        >
                          🔍 Buscar en YouTube
                        </a>
                      )}
                      
                      {!configuracion.audio_url && !configuracion.cancion_url && (
                        <p className="text-amber-400 font-bold text-center">Enlace no disponible en la BD.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Letra de la canción */}
              {letra.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-5 md:p-6 border border-slate-100 text-center">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Letra de la Canción
                  </h4>
                  <div className="flex flex-col gap-2">
                    {letra.map((linea, index) => (
                      <p key={index} className="text-base md:text-xl font-medium text-slate-700">
                        {linea}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Acciones y Botón */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              
              {/* Acciones */}
              {acciones.length > 0 && (
                <div className="bg-amber-50/50 rounded-2xl p-5 md:p-6 border border-amber-100">
                  <h4 className="text-xs md:text-sm font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Star size={16} /> ¡Marca lo que ya hiciste!
                  </h4>
                  <div className="flex flex-col gap-3">
                    {acciones.map((accion, index) => {
                      const realizada = accionesRealizadas.has(index);
                      return (
                        <button
                          key={index}
                          onClick={() => handleToggleAccion(index)}
                          className={`flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 border-2 font-bold rounded-xl shadow-sm text-left transition-all active:scale-95 text-sm md:text-base ${
                            realizada 
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' 
                              : 'bg-white border-amber-200 text-amber-700 hover:border-amber-400'
                          }`}
                        >
                          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                            realizada ? 'bg-white border-white text-emerald-500' : 'border-amber-300 bg-amber-50'
                          }`}>
                            {realizada && <Check size={16} strokeWidth={4} />}
                          </div>
                          <span className="capitalize">{accion}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Botón de Completar */}
              <div className="flex-1 flex flex-col justify-end mt-2 md:mt-0">
                <button
                  onClick={handleCompletar}
                  disabled={!puedeCompletar}
                  style={puedeCompletar ? { backgroundColor: '#f59e0b', color: '#ffffff', borderColor: '#d97706' } : {}}
                  className={`w-full py-3 md:py-4 rounded-2xl font-black text-base md:text-xl flex items-center justify-center gap-2 md:gap-3 border-b-4 transition-all ${
                    puedeCompletar 
                      ? 'shadow-lg hover:scale-105 active:scale-95 cursor-pointer' 
                      : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70'
                  }`}
                >
                  <Check size={28} strokeWidth={4} />
                  {puedeCompletar ? '¡Ya lo canté!' : '¡Completa las acciones!'}
                </button>
              </div>

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
