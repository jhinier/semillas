import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  actualizarActividad,
  crearActividad,
  type ActividadAdmin,
} from "../admin.api";
import {
  normalizarConfiguracionActividad,
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
      const configuracion = normalizarConfiguracionActividad(
        codigoTipoActividad,
        configuracionAvanzada
      );
      const errorConfiguracion = validarActividadParaGuardar({
        codigo: codigoTipoActividad,
        configuracion,
        opciones: draft.opciones,
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
        opciones: draft.opciones
          .filter((option) => option.texto.trim())
          .map((option, index) => ({
            ...option,
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
