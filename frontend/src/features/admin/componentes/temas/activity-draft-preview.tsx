import { Eye, Info } from "lucide-react";

import type { ActivityDraft } from "../../types";
import type { Actividad } from "@/shared/api/api";
import { ActividadWrapper } from "@/features/crecer/componentes/actividad-wrapper";
import { getActivityTypeDefinition } from "./activity-type-catalog";

interface ActivityDraftPreviewProps {
  draft: ActivityDraft;
  typeCode: string;
  typeName?: string | null;
  ageGroupName?: string | null;
  stepName?: string | null;
}

export function crearActividadDesdeBorrador(
  draft: ActivityDraft,
  typeCode: string,
  typeName?: string | null,
): Actividad {
  const definition = getActivityTypeDefinition(typeCode);
  return {
    id: "00000000-0000-4000-8000-000000000001",
    tema_id: "00000000-0000-4000-8000-000000000002",
    paso_id: draft.paso_id || null,
    grupo_edad_id: draft.grupo_edad_id || "00000000-0000-4000-8000-000000000003",
    tipo_actividad_id: draft.tipo_actividad_id || "00000000-0000-4000-8000-000000000004",
    titulo: draft.titulo.trim() || "Título de la actividad",
    consigna: draft.consigna.trim() || "Escribe una consigna para orientar al estudiante.",
    orden: 1,
    xp_recompensa: draft.xp_recompensa,
    dificultad: draft.dificultad,
    limite_tiempo_seg: draft.limite_tiempo_seg,
    obligatorio: draft.obligatorio,
    retroalimentacion: draft.retroalimentacion.trim() || null,
    configuracion: draft.configuracion,
    tipo_actividad: {
      id: draft.tipo_actividad_id || "00000000-0000-4000-8000-000000000004",
      codigo: typeCode,
      nombre: typeName || definition.nombre,
      descripcion: definition.descripcion,
      es_juego: true,
      activo: true,
      creado_en: new Date(0).toISOString(),
    },
    opciones: draft.opciones
      .filter((option) => option.texto.trim())
      .map((option, index) => ({
        id: `00000000-0000-4000-8000-${String(index + 10).padStart(12, "0")}`,
        actividad_id: "00000000-0000-4000-8000-000000000001",
        etiqueta: option.etiqueta || String.fromCharCode(65 + index),
        texto: option.texto.trim(),
        correcta: option.correcta,
        orden: index + 1,
        retroalimentacion: null,
      })),
  };
}

export function ActivityDraftPreview({ draft, typeCode, typeName, ageGroupName, stepName }: ActivityDraftPreviewProps) {
  const activity = crearActividadDesdeBorrador(draft, typeCode, typeName);
  const hasMinimumContent = Boolean(draft.titulo.trim() && draft.consigna.trim() && typeCode);

  return (
    <section className="activity-preview-stage" aria-label="Vista previa de la actividad">
      <div className="activity-preview-stage__topbar">
        <div>
          <span className="activity-preview-stage__eyebrow"><Eye size={14} /> Vista del estudiante</span>
          <strong>{ageGroupName || "Franja sin seleccionar"}</strong>
          <small>{stepName || "Paso CRECER sin seleccionar"}</small>
        </div>
        <span className="activity-preview-stage__badge">Simulación</span>
      </div>

      {!hasMinimumContent ? (
        <div className="activity-preview-stage__empty">
          <Info size={24} />
          <h3>Completa el contexto y el contenido</h3>
          <p>La vista previa interactiva aparecerá cuando elijas un tipo, escribas un título y agregues una consigna.</p>
        </div>
      ) : (
        <div className="activity-preview-stage__canvas">
          <ActividadWrapper actividad={activity} onComplete={() => undefined} mode="preview" />
        </div>
      )}
    </section>
  );
}
