import { Check, RotateCcw, X } from "lucide-react";
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
import { OpcionMultipleServidor } from "./opcion-multiple-servidor";

interface ActividadWrapperProps {
  actividad: Actividad;
  onComplete: (actividadId: string, xp?: number) => void | Promise<void>;
  mode?: "live" | "preview";
}

export function ActividadWrapper({ actividad, onComplete, mode = "live" }: ActividadWrapperProps) {
  return (
    <article className={`crecer-activity-card ${mode === "preview" ? "crecer-activity-card--preview" : ""}`}>
      <header className="crecer-activity-card__header">
        <span className="crecer-activity-card__badge">
          {actividad.tipo_actividad?.nombre ?? "Actividad"}
        </span>
        <h2>{actividad.titulo}</h2>
        {actividad.consigna ? <p>{actividad.consigna}</p> : null}
      </header>

      <ContenidoActividad actividad={actividad} onComplete={onComplete} mode={mode} />
    </article>
  );
}

function ContenidoActividad({ actividad, onComplete, mode = "live" }: ActividadWrapperProps) {
  const codigo = actividad.tipo_actividad?.codigo ?? "";
  const complete = (actividadId: string, xp?: number) => {
    void onComplete(actividadId, xp);
  };

  if (codigo === "cuestionario" && actividad.opciones.length > 0) {
    return mode === "preview"
      ? <OpcionMultiplePreview actividad={actividad} />
      : <OpcionMultipleServidor actividad={actividad} onComplete={onComplete} />;
  }

  switch (codigo) {
    case "actividad_audio":
      return <ActividadAudio actividad={actividad} onComplete={complete} />;
    case "aventura_decisiones":
      return <AventuraDecisiones actividad={actividad as any} onComplete={complete} />;
    case "arrastrar_soltar":
      return <ArrastrarSoltar actividad={actividad as any} onComplete={complete} />;
    case "completar_versiculo":
      return <CompletarVersiculo actividad={actividad as any} onComplete={complete} />;
    case "video":
    case "actividad_video":
      return <ActividadVideo actividad={actividad as any} onComplete={complete} />;
    case "cancion":
      return <ActividadCancion actividad={actividad as any} onComplete={complete} />;
    case "cuestionario":
      return <QuizActividad actividad={actividad as any} onComplete={complete} />;
    case "verdadero_falso":
      return <VerdaderoFalsoActividad actividad={actividad as any} onComplete={complete} />;
    case "relacionar_pares":
      return <RelacionarParesActividad actividad={actividad as any} onComplete={complete} />;
    case "manualidad":
      return <ManualidadActividad actividad={actividad as any} onComplete={complete} />;
    case "tarjetas_memoria":
      return <Flashcards actividad={actividad as any} onComplete={complete} />;
    case "sopa_letras":
      return <SopaLetrasActividad actividad={actividad as any} onComplete={complete} />;
    case "rompecabezas": {
      const config = actividad.configuracion || {};
      const imgUrl = (config.imagen as string) || "/src/assets/images/Ilustraciones/Tema1.webp";
      return (
        <Rompecabezas
          imagen={imgUrl}
          filas={(config.filas as number) || 3}
          columnas={(config.columnas as number) || 3}
          retroalimentacion={actividad.retroalimentacion ?? undefined}
          onComplete={() => complete(actividad.id, actividad.xp_recompensa || 0)}
        />
      );
    }
    default:
      return (
        <div className="crecer-focus__empty" role="status">
          Esta actividad todavía no tiene un reproductor disponible.
        </div>
      );
  }
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
