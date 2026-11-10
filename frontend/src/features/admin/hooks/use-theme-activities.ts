import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  actualizarActividad,
  crearActividad,
} from "../admin.api";
import {
  normalizarConfiguracionActividad,
  sincronizarOpcionesCuestionario,
  validarActividadParaGuardar,
} from "../componentes/temas/activity-configuration";
import type { ActivityDraft } from "../types";
import { esObjetoPlano } from "../types";

interface UseThemeActivitiesMutationProps {
  themeId: string;
  draft: ActivityDraft;
  configText: string;
  codigoTipoActividad: string;
  ordenActual: number;
  esModoEditar: boolean;
  actividadId?: string;
}

export function useThemeActivitiesMutation({
  themeId,
  draft,
  configText,
  codigoTipoActividad,
  ordenActual,
  esModoEditar,
  actividadId,
}: UseThemeActivitiesMutationProps) {
  return useMutation({
    mutationFn: async () => {
      let configuracionAvanzada: unknown;
      try {
        configuracionAvanzada = JSON.parse(configText);
      } catch {
        throw new Error("La configuración avanzada no contiene JSON válido");
      }
      if (!esObjetoPlano(configuracionAvanzada))
        throw new Error("La configuración avanzada debe ser un objeto JSON plano.");
      if (
        !draft.titulo.trim() ||
        !draft.consigna.trim() ||
        !draft.paso_id ||
        !draft.grupo_edad_id ||
        !draft.tipo_actividad_id
      )
        throw new Error("Completa los campos obligatorios");

      let configuracion = normalizarConfiguracionActividad(
        codigoTipoActividad,
        configuracionAvanzada,
        draft.opciones
      );
      let opcionesPayload = draft.opciones;

      if (codigoTipoActividad === "cuestionario") {
        const sincronizadas = sincronizarOpcionesCuestionario(
          configuracionAvanzada,
          draft.opciones
        );
        const filtradas = sincronizadas.opciones
          .filter((op) => op.texto.trim().length > 0)
          .map((op, index) => ({
            ...op,
            etiqueta: String.fromCharCode(65 + index),
            texto: op.texto.trim(),
            orden: index + 1,
          }));
        opcionesPayload = filtradas;
        configuracion = {
          ...sincronizadas.configuracion,
          opciones: filtradas.map((op, index) => ({
            id: `opcion-${index + 1}`,
            texto: op.texto,
            correcta: op.correcta,
          })),
        };
      }

      const errorConfiguracion = validarActividadParaGuardar({
        codigo: codigoTipoActividad,
        configuracion,
        opciones: opcionesPayload,
      });
      if (errorConfiguracion) throw new Error(errorConfiguracion);

      const payload = {
        tema_id: themeId,
        paso_id: draft.paso_id,
        grupo_edad_id: draft.grupo_edad_id,
        tipo_actividad_id: draft.tipo_actividad_id,
        titulo: draft.titulo.trim(),
        consigna: draft.consigna.trim(),
        retroalimentacion: draft.retroalimentacion.trim() || undefined,
        orden: esModoEditar ? ordenActual : ordenActual + 1,
        xp_recompensa: draft.xp_recompensa,
        limite_tiempo_seg: draft.limite_tiempo_seg,
        dificultad: draft.dificultad,
        obligatorio: draft.obligatorio,
        configuracion,
        opciones: opcionesPayload
          .filter((option) => option.texto.trim())
          .map((option, index) => ({
            ...option,
            etiqueta: String.fromCharCode(65 + index),
            texto: option.texto.trim(),
            orden: index + 1,
          })),
      };
      if (esModoEditar && actividadId) return actualizarActividad(actividadId, payload);
      return crearActividad(payload);
    },
    onSuccess: () => {
      toast.success(esModoEditar ? "Actividad actualizada" : "Actividad creada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    },
  });
}
