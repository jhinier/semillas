import { useState, useCallback, useMemo } from "react";
import type { Actividad } from "../../shared/api/api";
import { playSound } from "../../lib/audio";
import { Check, X } from "lucide-react";
import { CompletadoCard } from "./CompletadoCard";
import { ReproductorAudio } from "./ReproductorAudio";
import { LetraSincronizada } from "./LetraSincronizada";
import { useResolvedMediaUrl } from "@/features/media/use-resolved-media-url";

const URL_AUDIO_DEMO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const LETRA_DEFAULT = `[00:00.00]🎶 (Intro musical)
[00:05.00]Dios es nuestro Padre
[00:10.00]Él nos ama mucho
[00:15.00]Nos cuida cada día
[00:20.00]Y nos da su luz.
[00:25.00]Escucha su voz
[00:30.00]En tu corazón
[00:35.00]Él siempre te guía
[00:40.00]Con su inmenso amor.`;

interface ActividadAudioProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}

export function ActividadAudio({ actividad, onComplete }: ActividadAudioProps) {
  const [completed, setCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const configuracion = (actividad.configuracion ?? {}) as Record<string, unknown>;
  const opciones = useMemo(() => {
    if (Array.isArray(configuracion.opciones) && configuracion.opciones.length > 0) {
      return configuracion.opciones as Array<{
        id?: string;
        texto: string;
        correcta?: boolean;
        esCorrecta?: boolean;
      }>;
    }
    if (Array.isArray(actividad.opciones) && actividad.opciones.length > 0) {
      return actividad.opciones.map((o) => ({
        id: o.id,
        texto: o.texto,
        correcta: Boolean(o.correcta),
      }));
    }
    return [];
  }, [configuracion.opciones, actividad.opciones]);

  const pregunta =
    typeof configuracion.pregunta === "string" && configuracion.pregunta.trim()
      ? configuracion.pregunta
      : actividad.consigna || "Selecciona la respuesta correcta";

  const respuestaCorrecta = useMemo(() => {
    if (typeof configuracion.respuesta_correcta === "number") {
      return configuracion.respuesta_correcta;
    }
    const idx = opciones.findIndex((o) => Boolean(o.correcta ?? o.esCorrecta));
    return idx >= 0 ? idx : 0;
  }, [configuracion.respuesta_correcta, opciones]);

  const letraCancion =
    typeof configuracion.letra === "string" && configuracion.letra.trim()
      ? configuracion.letra
      : LETRA_DEFAULT;

  const audioRecursoId =
    (typeof configuracion.audio_recurso_id === "string" && configuracion.audio_recurso_id) ||
    (typeof configuracion.recurso_audio_id === "string" && configuracion.recurso_audio_id) ||
    null;

  const rawAudioUrl =
    typeof configuracion.audio_url === "string" && configuracion.audio_url.trim().length > 0
      ? configuracion.audio_url.trim()
      : null;

  const resolvedAudio = useResolvedMediaUrl({
    resourceId: audioRecursoId,
    rawUrl: rawAudioUrl,
    useFallbackOnError: false,
  });

  const audioUrl = resolvedAudio.src || rawAudioUrl || URL_AUDIO_DEMO;

  const completarActividad = useCallback(async () => {
    if (completed) return;
    setCompleted(true);
    await playSound("insignia");
    onComplete(actividad.id, actividad.xp_recompensa ?? 0);
  }, [completed, onComplete, actividad.id, actividad.xp_recompensa]);

  const handleSelectOption = useCallback(
    (index: number) => {
      if (completed || selectedOption !== null) return;
      setSelectedOption(index);
      const opcion = opciones[index];
      const correct =
        index === respuestaCorrecta || Boolean(opcion?.correcta ?? opcion?.esCorrecta);
      if (correct) {
        void playSound("acertado");
        setTimeout(() => {
          void completarActividad();
        }, 900);
      } else {
        void playSound("error");
      }
    },
    [completed, selectedOption, opciones, respuestaCorrecta, completarActividad],
  );

  const reintentar = useCallback(() => {
    setSelectedOption(null);
  }, []);

  const handleAudioEnded = useCallback(() => {
    if (opciones.length === 0 && !completed) {
      void completarActividad();
    }
  }, [opciones.length, completed, completarActividad]);

  return (
    <div className="flex flex-col gap-8 w-full mx-auto py-4 animate-in fade-in zoom-in-95">
      {audioUrl && (
        <div className="w-full max-w-5xl flex flex-col md:flex-row md:items-stretch gap-6 mx-auto">
          <ReproductorAudio
            src={audioUrl}
            onEnded={handleAudioEnded}
            onTimeUpdate={setCurrentTime}
          />
          <LetraSincronizada letra={letraCancion} currentTime={currentTime} />
        </div>
      )}

      {opciones.length > 0 && !completed && (
        <div className="w-full max-w-5xl mx-auto bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 mt-2">
          <h3 className="text-xl md:text-2xl font-bold text-slate-700 text-center mb-6 tracking-tight">
            {pregunta}
          </h3>

          <div className="flex flex-col w-full gap-4">
            {opciones.map((opcion, index) => {
              const esSeleccionada = selectedOption === index;
              const esCorrecta =
                index === respuestaCorrecta || Boolean(opcion.correcta ?? opcion.esCorrecta);
              const respondida = selectedOption !== null;

              let clases =
                "border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50";
              let translateYClass = "hover:-translate-y-1 active:translate-y-0";

              if (respondida) {
                translateYClass = "translate-y-0";
                if (esCorrecta && esSeleccionada) {
                  clases = "border-emerald-500 bg-emerald-50 text-emerald-700";
                } else if (esSeleccionada && !esCorrecta) {
                  clases = "border-red-400 bg-red-50 text-red-700";
                } else if (esCorrecta) {
                  clases = "border-emerald-500 bg-emerald-50 opacity-60";
                } else {
                  clases = "border-slate-200 bg-slate-50 opacity-50";
                }
              }

              return (
                <button
                  key={opcion.id ?? index}
                  type="button"
                  disabled={respondida || completed}
                  onClick={() => handleSelectOption(index)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${clases} ${translateYClass} ${
                    !respondida
                      ? "cursor-pointer shadow-sm hover:shadow-md"
                      : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-lg ${
                      esSeleccionada
                        ? esCorrecta
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-white text-slate-500 border border-slate-200"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 font-medium text-lg text-slate-700">
                    {opcion.texto}
                  </span>
                  {respondida && esSeleccionada && esCorrecta && (
                    <Check className="text-emerald-600" size={28} strokeWidth={3} />
                  )}
                  {respondida && esSeleccionada && !esCorrecta && (
                    <X className="text-red-500" size={28} strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption !== null &&
            !(
              selectedOption === respuestaCorrecta ||
              Boolean(opciones[selectedOption]?.correcta ?? opciones[selectedOption]?.esCorrecta)
            ) && (
              <div className="w-full mt-8 flex justify-center animate-in slide-in-from-bottom-4">
                <button
                  type="button"
                  onClick={reintentar}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-bold text-lg shadow-md active:scale-95 transition-all"
                >
                  Intentar otra vez
                </button>
              </div>
            )}
        </div>
      )}

      {opciones.length === 0 && !completed && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void completarActividad()}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-black text-white shadow-md hover:bg-emerald-700"
          >
            <Check size={22} />
            ¡Terminé de escuchar el audio!
          </button>
        </div>
      )}

      {completed && (
        <div className="w-full mt-4">
          <CompletadoCard
            retroalimentacion={actividad.retroalimentacion ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
