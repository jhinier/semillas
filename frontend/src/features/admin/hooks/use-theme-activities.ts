import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  actualizarActividad,
  asegurarGrupoEdadEnTema,
  crearActividad,
  guardarParlante,
} from "../admin.api";
import {
  normalizarConfiguracionActividad,
  sincronizarOpcionesCuestionario,
  validarActividadParaGuardar,
} from "../componentes/temas/activity-configuration";
import type { ActivityDraft } from "../types";
import { esObjetoPlano } from "../types";

export async function resolverPasoTemaParaActividad({
  themeId,
  pasoIdSeleccionado,
  grupoEdadId,
  pasoNombre,
}: {
  themeId: string;
  pasoIdSeleccionado: string;
  grupoEdadId: string;
  pasoNombre?: string | null;
}): Promise<string> {
  if (!pasoIdSeleccionado.startsWith("crecer:")) {
    return pasoIdSeleccionado;
  }

  const tipoPasoId = pasoIdSeleccionado.slice("crecer:".length);
  const res = (await guardarParlante(themeId, {
    tipo_paso_id: tipoPasoId,
    grupo_edad_id: grupoEdadId,
    titulo: (pasoNombre || "Momento CRECER").replace(/\s*\(se creará al guardar\)\s*$/i, "").trim() || "Momento CRECER",
    cuerpo: "     ",
  })) as { paso?: { id?: string }; id?: string };

  const resolvedId = res?.paso?.id ?? res?.id;
  if (!resolvedId) {
    throw new Error("No se pudo preparar el momento CRECER seleccionado.");
  }
  return resolvedId;
}

interface UseThemeActivitiesMutationProps {
  themeId: string;
  draft: ActivityDraft;
  configText: string;
  codigoTipoActividad: string;
  pasoNombreSeleccionado?: string | null;
  ordenActual: number;
  esModoEditar: boolean;
  actividadId?: string;
  gruposTemaActuales?: Array<{ id: string } | string> | null;
}

export function useThemeActivitiesMutation({
  themeId,
  draft,
  configText,
  codigoTipoActividad,
  pasoNombreSeleccionado,
  ordenActual,
  esModoEditar,
  actividadId,
  gruposTemaActuales,
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

      if (codigoTipoActividad === "actividad_video" || codigoTipoActividad === "video") {
        const respuestaCorrecta =
          typeof configuracion.respuesta_correcta === "number" && Number.isInteger(configuracion.respuesta_correcta)
            ? configuracion.respuesta_correcta
            : 0;
        const rawOpciones = Array.isArray(configuracion.opciones) ? configuracion.opciones : [];
        configuracion = {
          ...configuracion,
          respuesta_correcta: respuestaCorrecta,
          opciones: rawOpciones
            .map((item, idx) => {
              const texto =
                typeof item === "string"
                  ? item.trim()
                  : esObjetoPlano(item) && typeof item.texto === "string"
                    ? item.texto.trim()
                    : "";
              return texto ? { texto, correcta: idx === respuestaCorrecta } : null;
            })
            .filter((item): item is { texto: string; correcta: boolean } => item !== null),
        };
      }

      if (codigoTipoActividad === "cancion") {
        const audioUrl =
          typeof configuracion.audio_url === "string" && configuracion.audio_url.trim()
            ? configuracion.audio_url.trim()
            : typeof configuracion.cancion_url === "string"
              ? configuracion.cancion_url.trim()
              : "";
        if (audioUrl) {
          configuracion = {
            ...configuracion,
            audio_url: audioUrl,
          };
        }
      }

      const pasoIdResuelto = await resolverPasoTemaParaActividad({
        themeId,
        pasoIdSeleccionado: draft.paso_id,
        grupoEdadId: draft.grupo_edad_id,
        pasoNombre: pasoNombreSeleccionado,
      });

      const payload = {
        tema_id: themeId,
        paso_id: pasoIdResuelto,
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
      if (esModoEditar && actividadId) {
        const res = await actualizarActividad(actividadId, payload);
        await asegurarGrupoEdadEnTema(themeId, draft.grupo_edad_id, gruposTemaActuales);
        return res;
      }
      const creada = await crearActividad(payload);
      await asegurarGrupoEdadEnTema(themeId, draft.grupo_edad_id, gruposTemaActuales);
      return creada;
    },
    onSuccess: () => {
      toast.success(esModoEditar ? "Actividad actualizada" : "Actividad creada");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    },
  });
}
