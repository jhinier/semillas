import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import { useState } from "react";

import type { Actividad } from "@/shared/api/api";
import { QuizActividad } from "@/componentes/actividades/QuizActividad";
import { VerdaderoFalsoActividad } from "@/componentes/actividades/VerdaderoFalsoActividad";
import { RelacionarParesActividad } from "@/componentes/actividades/RelacionarParesActividad";
import { ManualidadActividad } from "@/componentes/actividades/ManualidadActividad";
import { Flashcards } from "@/componentes/actividades/Flashcards";
import { SopaLetrasActividad } from "@/componentes/actividades/SopaLetrasActividad";
import { Rompecabezas } from "@/componentes/actividades/Rompecabezas";
import { ActividadAudio } from "@/componentes/actividades/ActividadAudio";
import { AventuraDecisiones } from "@/componentes/actividades/AventuraDecisiones";
import { ArrastrarSoltar } from "@/componentes/actividades/ArrastrarSoltar";
import { CompletarVersiculo } from "@/componentes/actividades/CompletarVersiculo";
import { ActividadVideo } from "@/componentes/actividades/ActividadVideo";
import { ActividadCancion } from "@/componentes/actividades/ActividadCancion";
import { useResolvedMediaUrl, tema1Img } from "@/features/media/use-resolved-media-url";
import { OpcionMultipleServidor } from "./opcion-multiple-servidor";

interface ActividadWrapperProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void | Promise<void>;
  mode?: "live" | "preview";
}

export function ActividadWrapper({ actividad, onComplete, mode = "live" }: ActividadWrapperProps) {
  const config = (actividad.configuracion ?? {}) as Record<string, unknown>;
  const imagenRecursoId =
    (typeof config.imagen_recurso_id === "string" && config.imagen_recurso_id) ||
    (typeof config.recurso_id === "string" && config.recurso_id) ||
    null;
  const imagenRawUrl =
    (typeof config.imagen_url === "string" && config.imagen_url) ||
    (typeof config.imagen === "string" && config.imagen) ||
    null;
  const codigo = (actividad.tipo_actividad?.codigo ?? "").toLowerCase();

  const mostrarImagenCabecera =
    codigo !== "rompecabezas" && Boolean(imagenRecursoId || imagenRawUrl);

  const mediaCabecera = useResolvedMediaUrl({
    resourceId: mostrarImagenCabecera ? imagenRecursoId : null,
    rawUrl: mostrarImagenCabecera ? imagenRawUrl : null,
    fallbackHint: actividad.titulo,
    useFallbackOnError: true,
  });

  return (
    <article className={`crecer-activity-card ${mode === "preview" ? "crecer-activity-card--preview" : ""}`}>
      <header className="crecer-activity-card__header">
        <span className="crecer-activity-card__badge">
          {actividad.tipo_actividad?.nombre ?? "Actividad"}
        </span>
        <h2>{actividad.titulo}</h2>
        {actividad.consigna ? <p>{actividad.consigna}</p> : null}
        {mostrarImagenCabecera && mediaCabecera.src ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 max-h-64 flex items-center justify-center">
            <img
              src={mediaCabecera.src}
              alt={actividad.titulo}
              className="max-h-64 w-full object-cover"
              onError={() => void mediaCabecera.handleImageError()}
            />
          </div>
        ) : null}
      </header>

      <ContenidoActividad actividad={actividad} onComplete={onComplete} mode={mode} />
    </article>
  );
}

function RompecabezasConMedia({
  actividad,
  onComplete,
}: {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}) {
  const config = (actividad.configuracion ?? {}) as Record<string, unknown>;
  const resourceId =
    (typeof config.imagen_recurso_id === "string" && config.imagen_recurso_id) ||
    (typeof config.recurso_id === "string" && config.recurso_id) ||
    null;
  const rawUrl =
    (typeof config.imagen === "string" && config.imagen) ||
    (typeof config.imagen_url === "string" && config.imagen_url) ||
    null;

  const { src } = useResolvedMediaUrl({
    resourceId,
    rawUrl,
    fallbackHint: actividad.titulo || "tema1",
    useFallbackOnError: true,
  });

  return (
    <Rompecabezas
      imagen={src || tema1Img}
      filas={(config.filas as number) || 3}
      columnas={(config.columnas as number) || 3}
      retroalimentacion={actividad.retroalimentacion ?? undefined}
      onComplete={() => onComplete(actividad.id, actividad.xp_recompensa || 0)}
    />
  );
}

function ContenidoActividad({ actividad, onComplete, mode = "live" }: ActividadWrapperProps) {
  const codigo = (actividad.tipo_actividad?.codigo ?? "").toLowerCase();
  const complete = (actividadId: string, xp?: number) => {
    void onComplete(actividadId, xp);
  };

  if (codigo === "cuestionario" && actividad.opciones && actividad.opciones.length > 0) {
    return mode === "preview"
      ? <OpcionMultiplePreview actividad={actividad} />
      : <OpcionMultipleServidor actividad={actividad} onComplete={onComplete} />;
  }

  switch (codigo) {
    case "actividad_audio":
    case "audio":
      return <ActividadAudio actividad={actividad} onComplete={complete} />;
    case "aventura_decisiones":
      return <AventuraDecisiones actividad={actividad as any} onComplete={complete} />;
    case "arrastrar_soltar":
    case "ordenar_secuencia":
      return <ArrastrarSoltar actividad={actividad as any} onComplete={complete} />;
    case "completar_versiculo":
      return <CompletarVersiculo actividad={actividad as any} onComplete={complete} />;
    case "video":
    case "actividad_video":
      return <ActividadVideo actividad={actividad as any} onComplete={complete} />;
    case "cancion":
    case "actividad_cancion":
      return <ActividadCancion actividad={actividad as any} onComplete={complete} />;
    case "cuestionario":
      return <QuizActividad actividad={actividad as any} onComplete={complete} />;
    case "verdadero_falso":
      return <VerdaderoFalsoActividad actividad={actividad as any} onComplete={complete} />;
    case "relacionar_pares":
    case "relacionar_conceptos":
      return <RelacionarParesActividad actividad={actividad as any} onComplete={complete} />;
    case "manualidad":
      return <ManualidadActividad actividad={actividad as any} onComplete={complete} />;
    case "tarjetas_memoria":
    case "flashcards":
    case "memoria":
      return <Flashcards actividad={actividad as any} onComplete={complete} />;
    case "sopa_letras":
      return <SopaLetrasActividad actividad={actividad as any} onComplete={complete} />;
    case "rompecabezas":
      return <RompecabezasConMedia actividad={actividad} onComplete={complete} />;
    default:
      return <ActividadGenericaInteractiva actividad={actividad} onComplete={complete} />;
  }
}

function ActividadGenericaInteractiva({
  actividad,
  onComplete,
}: {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void;
}) {
  const [completada, setCompletada] = useState(false);
  const [reflexion, setReflexion] = useState("");

  if (actividad.opciones && actividad.opciones.length > 0) {
    return <OpcionMultipleServidor actividad={actividad} onComplete={onComplete} />;
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-600">
        {actividad.consigna || "Realiza esta actividad y confirma cuando la hayas completado."}
      </p>
      {!completada ? (
        <>
          <textarea
            value={reflexion}
            onChange={(e) => setReflexion(e.target.value)}
            rows={3}
            placeholder="Escribe aquí tu respuesta o reflexión sobre esta actividad (opcional)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:border-violet-400 focus:bg-white focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setCompletada(true);
              onComplete(actividad.id, actividad.xp_recompensa || 10);
            }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-violet-700"
          >
            <Sparkles size={16} />
            Marcar actividad como completada
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          <Check size={18} />
          {actividad.retroalimentacion || "¡Actividad completada con éxito!"}
        </div>
      )}
    </div>
  );
}

function OpcionMultiplePreview({ actividad }: { actividad: Actividad }) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const correcta = actividad.opciones.find((opcion) => opcion.correcta)?.id ?? null;

  return (
    <div className="activity-preview-options">
      <div className="activity-preview-options__list">
        {actividad.opciones.map((opcion) => {
          const respondida = seleccionada !== null;
          const isSelected = seleccionada === opcion.id;
          const isCorrect = opcion.id === correcta;
          return (
            <button
              key={opcion.id}
              type="button"
              disabled={respondida}
              onClick={() => setSeleccionada(opcion.id)}
              className={`activity-preview-option ${respondida && isCorrect ? "activity-preview-option--correct" : ""} ${respondida && isSelected && !isCorrect ? "activity-preview-option--wrong" : ""}`}
            >
              <span>{opcion.etiqueta || "•"}</span>
              <strong>{opcion.texto}</strong>
              {respondida && isCorrect ? <Check size={19} /> : null}
              {respondida && isSelected && !isCorrect ? <X size={19} /> : null}
            </button>
          );
        })}
      </div>
      {seleccionada ? (
        <button type="button" className="activity-preview-options__retry" onClick={() => setSeleccionada(null)}>
          <RotateCcw size={15} /> Reiniciar simulación
        </button>
      ) : null}
    </div>
  );
}
