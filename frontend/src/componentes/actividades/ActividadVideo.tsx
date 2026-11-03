import { useMemo, useState } from "react";
import type { Actividad } from "../../shared/api/api";
import { playSound } from "../../lib/audio";
import { CompletadoCard } from "./CompletadoCard";
import { Check, X } from "lucide-react";
import { useResolvedMediaUrl } from "@/features/media/use-resolved-media-url";

interface ActividadVideoProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}

type OpcionVideoRaw = string | { texto: string; correcta?: boolean; esCorrecta?: boolean };

interface ConfiguracionVideo {
  pregunta?: string;
  opciones?: OpcionVideoRaw[];
  respuesta_correcta?: number;
  video_url?: string;
  video_recurso_id?: string;
  recurso_id?: string;
}

export function ActividadVideo({ actividad, onComplete }: ActividadVideoProps) {
  const [completed, setCompleted] = useState(false);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);

  const configuracion = (actividad.configuracion ?? {}) as Partial<ConfiguracionVideo>;
  const pregunta = configuracion.pregunta ?? actividad.consigna ?? "¿Qué aprendiste del video?";

  const opcionesNormalizadas = useMemo(() => {
    const raw = Array.isArray(configuracion.opciones)
      ? configuracion.opciones
      : Array.isArray(actividad.opciones)
        ? actividad.opciones.map((o) => ({ texto: o.texto, correcta: o.correcta }))
        : [];
    return raw.map((item) =>
      typeof item === "string"
        ? { texto: item, correcta: false }
        : { texto: item.texto, correcta: Boolean(item.correcta ?? (item as { esCorrecta?: boolean }).esCorrecta) },
    );
  }, [configuracion.opciones, actividad.opciones]);

  const respuestaCorrecta = useMemo(() => {
    if (typeof configuracion.respuesta_correcta === "number") {
      return configuracion.respuesta_correcta;
    }
    const idx = opcionesNormalizadas.findIndex((o) => o.correcta);
    return idx >= 0 ? idx : 0;
  }, [configuracion.respuesta_correcta, opcionesNormalizadas]);

  const videoRecursoId = configuracion.video_recurso_id || configuracion.recurso_id || null;
  const resolvedVideo = useResolvedMediaUrl({
    resourceId: videoRecursoId,
    rawUrl: configuracion.video_url ?? null,
    useFallbackOnError: false,
  });

  let rawUrl = resolvedVideo.src || configuracion.video_url || "";
  if (!rawUrl || rawUrl.includes("bibleproject.com")) {
    rawUrl = "https://youtu.be/0wkVnoI_yPU";
  }

  let embedUrl = rawUrl;
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    const videoId =
      rawUrl.split("v=")[1]?.split("&")[0] || rawUrl.split("youtu.be/")[1]?.split("?")[0];
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&modestbranding=1`;
    }
  }

  const completarDirecto = () => {
    if (completed) return;
    void playSound("acertado");
    setCompleted(true);
    setTimeout(() => {
      void playSound("insignia");
      onComplete(actividad.id, actividad.xp_recompensa || 0);
    }, 400);
  };

  const handleSeleccionar = (index: number) => {
    if (completed) return;

    setSeleccion(index);
    const esCorrecta =
      index === respuestaCorrecta || Boolean(opcionesNormalizadas[index]?.correcta);

    if (esCorrecta) {
      void playSound("acertado");
      setErrorIndex(null);
      setCompleted(true);
      setTimeout(() => {
        void playSound("insignia");
        onComplete(actividad.id, actividad.xp_recompensa || 0);
      }, 500);
    } else {
      void playSound("error");
      setErrorIndex(index);
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
              />
            ) : (
              <video
                src={embedUrl}
                controls
                onEnded={() => {
                  if (opcionesNormalizadas.length === 0) completarDirecto();
                }}
                className="w-full h-full object-contain"
              >
                Tu navegador no soporta videos HTML5.
              </video>
            )}
          </div>

          {/* Área de Preguntas */}
          <div className="p-5 md:p-10 flex flex-col gap-6 items-center text-center">
            {opcionesNormalizadas.length > 0 ? (
              <>
                <h3 className="text-xl md:text-2xl font-black text-slate-800">{pregunta}</h3>

                <div className="flex flex-col gap-4 w-full max-w-lg mt-2">
                  {opcionesNormalizadas.map((opcion, index) => {
                    const isSelected = seleccion === index;
                    const isError = errorIndex === index;

                    let baseClasses =
                      "px-5 py-4 rounded-2xl border-2 font-bold text-base md:text-lg transition-all flex items-center justify-between ";

                    if (isError) {
                      baseClasses += "border-rose-400 bg-rose-50 text-rose-700 animate-shake";
                    } else if (isSelected && completed) {
                      baseClasses += "border-emerald-500 bg-emerald-500 text-white";
                    } else {
                      baseClasses +=
                        "border-slate-200 bg-white text-slate-700 hover:border-violet-400 hover:text-violet-700 hover:-translate-y-1 hover:shadow-md cursor-pointer";
                    }

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSeleccionar(index)}
                        disabled={completed}
                        className={baseClasses}
                      >
                        <span>{opcion.texto}</span>
                        {isError && <X className="w-6 h-6 text-rose-500" />}
                        {isSelected && completed && <Check className="w-6 h-6 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={completarDirecto}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-black text-white shadow-md hover:bg-emerald-700"
              >
                <Check className="w-6 h-6" />
                ¡Terminé de ver el video!
              </button>
            )}
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
