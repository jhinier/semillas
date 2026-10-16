import { useState, useEffect } from "react";
import type { Actividad } from "../../shared/api/api";
import { playSound } from "../../lib/audio";
import { CompletadoCard } from "./CompletadoCard";
import { BookOpen, Check, RefreshCcw } from "lucide-react";
import imagenDefault from "../../assets/images/Ilustraciones/Versiculo del dia.webp";

interface ParteVersiculo {
  tipo: "texto" | "hueco";
  valor?: string;
  respuesta?: string;
}

interface CompletarVersiculoProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}

interface ConfiguracionCompletarVersiculo {
  frase?: string;
  respuesta?: string;
  opciones?: string[];
}

export function CompletarVersiculo({ actividad, onComplete }: CompletarVersiculoProps) {
  const [completed, setCompleted] = useState(false);
  
  // Extraer configuración
  const configuracion = actividad.configuracion as Partial<ConfiguracionCompletarVersiculo>;
  
  // Parsear la frase desde la BD (ej. "Ama a tu ____ como a ti mismo")
  const frase = configuracion.frase ?? "Versículo no configurado ____.";
  const respuestaCorrecta = configuracion.respuesta ?? "error";
  const opcionesOriginales = configuracion.opciones ?? [];

  // Convertir la frase con "____" al formato interno de Partes
  const partes: ParteVersiculo[] = [];
  const fragmentos = frase.split(/_{2,}/); // Separa por 2 o más guiones bajos
  
  fragmentos.forEach((fragmento: string, index: number) => {
    partes.push({ tipo: "texto", valor: fragmento });
    // Agregar el hueco si no es el último fragmento
    if (index < fragmentos.length - 1) {
      partes.push({ tipo: "hueco", respuesta: respuestaCorrecta });
    }
  });

  // Estado del juego
  const [opcionesDisponibles, setOpcionesDisponibles] = useState<string[]>([]);
  const [respuestasUsuario, setRespuestasUsuario] = useState<{ [index: number]: string }>({});
  const [errores, setErrores] = useState<number[]>([]);
  const [aciertos, setAciertos] = useState<number[]>([]);

  // Inicializar el juego (mezclar opciones) solo una vez
  useEffect(() => {
    const mezcladas = [...opcionesOriginales].sort(() => Math.random() - 0.5);
    setOpcionesDisponibles(mezcladas);
  }, [opcionesOriginales.join(',')]);

  const handleSeleccionarOpcion = (palabra: string) => {
    // Encontrar el primer hueco vacío
    const primerHuecoVacioIndex = partes.findIndex((parte, idx) => parte.tipo === "hueco" && !respuestasUsuario[idx]);
    
    if (primerHuecoVacioIndex !== -1) {
      playSound("siguiente"); // Sonido sutil al colocar
      setRespuestasUsuario(prev => ({ ...prev, [primerHuecoVacioIndex]: palabra }));
      setOpcionesDisponibles(prev => prev.filter(op => op !== palabra));
      // Limpiar errores si había
      setErrores(prev => prev.filter(e => e !== primerHuecoVacioIndex));
    }
  };

  const handleQuitarRespuesta = (index: number, palabra: string) => {
    playSound("iniciar");
    setRespuestasUsuario(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setOpcionesDisponibles(prev => [...prev, palabra].sort(() => Math.random() - 0.5));
    setErrores(prev => prev.filter(e => e !== index));
    setAciertos(prev => prev.filter(a => a !== index));
  };

  const handleResetear = () => {
    playSound("iniciar");
    setRespuestasUsuario({});
    setErrores([]);
    setAciertos([]);
    const mezcladas = [...opcionesOriginales].sort(() => Math.random() - 0.5);
    setOpcionesDisponibles(mezcladas);
  };

  const handleComprobar = () => {
    let tieneError = false;
    const nuevosErrores: number[] = [];
    const nuevosAciertos: number[] = [];

    partes.forEach((parte, index) => {
      if (parte.tipo === "hueco") {
        if (respuestasUsuario[index] === parte.respuesta) {
          nuevosAciertos.push(index);
        } else if (respuestasUsuario[index]) {
          tieneError = true;
          nuevosErrores.push(index);
        }
      }
    });

    setErrores(nuevosErrores);
    setAciertos(nuevosAciertos);

    if (tieneError) {
      playSound("error");
    } else {
      playSound("acertado");
      setCompleted(true);
      setTimeout(() => {
        playSound("insignia");
        onComplete(actividad.id, actividad.xp_recompensa || 0);
      }, 500);
    }
  };

  const cantidadHuecos = partes.filter(p => p.tipo === "hueco").length;
  const todosLlenos = cantidadHuecos > 0 && Object.keys(respuestasUsuario).length === cantidadHuecos;

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-4xl mx-auto py-4 animate-in fade-in zoom-in-95">
      
      {!completed ? (
        <div className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
          
          <div className="p-5 md:p-10 z-10 flex flex-col gap-8 md:gap-10">
            
            {/* Contenedor del versículo */}
            <div className="bg-slate-50 p-4 md:p-8 rounded-2xl md:rounded-3xl border-2 border-slate-200 leading-[2.5rem] md:leading-[3.5rem] text-lg md:text-2xl text-slate-700 font-medium text-center shadow-inner">
              {partes.map((parte, index) => {
                if (parte.tipo === "texto") {
                  return <span key={index}>{parte.valor}</span>;
                }
                
                // Es un hueco
                const palabraSeleccionada = respuestasUsuario[index];
                const esError = errores.includes(index);
                const esAcierto = aciertos.includes(index);

                if (palabraSeleccionada) {
                  let colorStyles = { backgroundColor: '#7c3aed', color: '#ffffff', borderColor: '#5b21b6' };
                  if (esError) {
                    colorStyles = { backgroundColor: '#ffe4e6', color: '#be123c', borderColor: '#fb7185' };
                  } else if (esAcierto) {
                    colorStyles = { backgroundColor: '#10b981', color: '#ffffff', borderColor: '#047857' };
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !esAcierto && handleQuitarRespuesta(index, palabraSeleccionada)}
                      style={colorStyles}
                      className={`inline-block mx-1 md:mx-2 px-3 md:px-6 h-10 md:h-12 align-middle font-bold text-base md:text-xl rounded-lg md:rounded-xl shadow-sm border-b-4 
                        ${esAcierto ? 'pointer-events-none' : 'hover:scale-105 active:scale-95 cursor-pointer transition-transform'}
                        ${esError ? 'animate-shake' : ''}`}
                    >
                      {palabraSeleccionada}
                    </button>
                  );
                }

                // Hueco vacío
                return (
                  <span 
                    key={index} 
                    className="inline-block mx-1 md:mx-2 w-24 md:w-32 h-10 md:h-12 align-middle bg-slate-200 border-b-4 border-slate-300 rounded-lg md:rounded-xl"
                  ></span>
                );
              })}
            </div>

            {/* Banco de palabras */}
            <div className="flex flex-col gap-4 items-center">
              <h4 className="text-slate-400 font-bold uppercase tracking-widest text-sm">Palabras Disponibles</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {opcionesDisponibles.map((opcion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSeleccionarOpcion(opcion)}
                    style={{ backgroundColor: '#f8fafc', color: '#0f172a', borderColor: '#cbd5e1' }}
                    className="px-4 md:px-6 py-2 md:py-3 border-2 rounded-xl md:rounded-2xl font-black text-base md:text-xl shadow-sm hover:border-violet-400 hover:text-violet-600 hover:-translate-y-1 hover:shadow-md active:translate-y-0 transition-all cursor-pointer"
                  >
                    {opcion}
                  </button>
                ))}
                {opcionesDisponibles.length === 0 && (
                  <span className="text-slate-400 italic">No quedan más palabras.</span>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-2 md:mt-4 flex flex-col sm:flex-row justify-center w-full gap-4 md:gap-6">
              {Object.keys(respuestasUsuario).length > 0 && (
                <button
                  onClick={handleResetear}
                  className="px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-lg md:text-xl flex items-center justify-center gap-2 md:gap-3 border-4 border-slate-200 text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  <RefreshCcw size={24} className="md:w-7 md:h-7" strokeWidth={3} />
                  Resetear
                </button>
              )}

              <button
                onClick={handleComprobar}
                disabled={!todosLlenos}
                style={todosLlenos ? { backgroundColor: '#7c3aed', color: '#ffffff', borderColor: '#5b21b6' } : {}}
                className={`px-8 md:px-10 py-3 md:py-4 rounded-full font-black text-lg md:text-xl flex items-center justify-center gap-2 md:gap-3 border-4 transition-all w-full sm:w-auto
                  ${todosLlenos 
                    ? 'shadow-xl hover:scale-105 active:scale-95 cursor-pointer' 
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70'}`}
              >
                <Check size={24} className="md:w-7 md:h-7" strokeWidth={4} />
                Comprobar
              </button>
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
