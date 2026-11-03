import { useState } from "react";
import type { Actividad } from "../../shared/api/api";
import { playSound } from "../../lib/audio";
import { ChevronRight, ShieldAlert, X } from "lucide-react";
import imagenDefault from "../../assets/images/Ilustraciones/Exploradores.webp";
import { CompletadoCard } from "./CompletadoCard";
import { obtenerIlustracionFallback } from "@/features/media/use-resolved-media-url";

interface AventuraDecisionesProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}

interface OpcionDecision {
  texto: string;
  correcta: boolean;
}

interface EscenaDecision {
  texto: string;
  imagen_url?: string;
  opciones?: OpcionDecision[];
}

interface ConfiguracionAventuraDecisiones {
  escenas?: EscenaDecision[];
}

export function AventuraDecisiones({ actividad, onComplete }: AventuraDecisionesProps) {
  const [completed, setCompleted] = useState(false);
  const [escenaActualIndex, setEscenaActualIndex] = useState(0);
  const [opcionErroneaIndex, setOpcionErroneaIndex] = useState<number | null>(null);
  const [imgFallbackMap, setImgFallbackMap] = useState<Record<number, string>>({});

  const configuracion = (actividad.configuracion ?? {}) as Partial<ConfiguracionAventuraDecisiones>;
  const escenas =
    Array.isArray(configuracion.escenas) && configuracion.escenas.length > 0
      ? configuracion.escenas
      : [
          {
            texto:
              actividad.consigna ||
              "Un compañero nuevo llega a tu clase y se siente solo. ¿Cómo demuestras el amor de Dios?",
            opciones: [
              { texto: "Acercarme a saludarlo e invitarlo a compartir con nosotros", correcta: true },
              { texto: "Ignorarlo y seguir jugando solo", correcta: false },
            ],
          },
        ];

  const escenaActual = escenas[escenaActualIndex]!;
  const rawImg = escenaActual.imagen_url?.startsWith("/src/assets/")
    ? obtenerIlustracionFallback(escenaActual.imagen_url)
    : escenaActual.imagen_url || imagenDefault;
  const imgSrc = imgFallbackMap[escenaActualIndex] || rawImg;

  const handleSeleccionarOpcion = (opcion: OpcionDecision, index: number) => {
    if (opcion.correcta) {
      void playSound("acertado");
      setOpcionErroneaIndex(null);

      if (escenaActualIndex + 1 < escenas.length) {
        setTimeout(() => {
          setEscenaActualIndex((prev) => prev + 1);
        }, 800);
      } else {
        setTimeout(() => {
          setCompleted(true);
          void playSound("insignia");
          onComplete(actividad.id, actividad.xp_recompensa || 0);
        }, 800);
      }
    } else {
      void playSound("error");
      setOpcionErroneaIndex(index);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full max-w-4xl mx-auto py-4 animate-in fade-in zoom-in-95">
      {!completed ? (
        <div className="w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="w-full bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
            <span className="text-slate-500 font-bold">
              Escena {escenaActualIndex + 1} de {escenas.length}
            </span>
            <div className="flex gap-1">
              {escenas.map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-8 rounded-full transition-all ${
                    i === escenaActualIndex
                      ? "bg-rose-500"
                      : i < escenaActualIndex
                        ? "bg-emerald-400"
                        : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
            <div className="w-full max-w-[200px] md:max-w-none md:w-1/3 aspect-square bg-rose-50 rounded-2xl overflow-hidden shrink-0 border-4 border-white shadow-md relative mx-auto md:mx-0">
              <img
                src={imgSrc}
                alt="Escena"
                className="w-full h-full object-cover object-center"
                onError={() =>
                  setImgFallbackMap((prev) => ({
                    ...prev,
                    [escenaActualIndex]: imagenDefault,
                  }))
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-snug">
                {escenaActual.texto}
              </h3>
            </div>
          </div>

          <div className="bg-slate-50 p-5 md:p-8 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
              ¿Qué decides hacer?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {escenaActual.opciones?.map((opcion: OpcionDecision, index: number) => {
                const esError = opcionErroneaIndex === index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSeleccionarOpcion(opcion, index)}
                    className={`relative flex items-center justify-between p-4 rounded-2xl border-2 text-left font-bold text-lg transition-all ${
                      esError
                        ? "border-red-300 bg-red-50 text-red-700 animate-shake"
                        : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:-translate-y-1 hover:shadow-md"
                    }`}
                  >
                    <span className="flex-1 font-bold text-base md:text-lg text-slate-700 text-left">
                      {opcion.texto}
                    </span>
                    {esError ? (
                      <X className="w-6 h-6 text-red-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {opcionErroneaIndex !== null && (
              <div className="mt-6 flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <p className="font-bold">
                  Esa no parece ser la mejor decisión... ¡Intenta la otra opción!
                </p>
              </div>
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
