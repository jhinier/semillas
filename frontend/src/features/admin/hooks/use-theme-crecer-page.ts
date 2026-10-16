import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { obtenerPasosAdmin, guardarParlante, obtenerTemaAdmin } from "../admin.api";
import { obtenerGruposEdad, obtenerPasosCrecer } from "../../catalog/catalog.api";
import {
  obtenerRecursosMultimedia,
  obtenerUrlFirmadaRecurso,
  subirArchivo,
  type RecursoMultimedia,
} from "../../media/media.api";
import { obtenerUrlPortadaTema } from "../../themes/themes.api";
import { obtenerEstadoTema } from "../componentes/temas/theme-view.utils";

interface UseThemeCrecerPageProps { themeId: string; }
export type ReflectionQuestion = { pregunta: string; orden: number };
export type CrecerDraft = {
  title: string;
  body: string;
  shortInstruction: string;
  resourceId: string | null;
  audioResourceId: string | null;
  questions: ReflectionQuestion[];
};

type SubirImagen = (archivo: File, tipo: "imagen") => Promise<Pick<RecursoMultimedia, "id">>;
type ObtenerUrlFirmada = (recursoId: string) => Promise<{ url: string }>;
type DraftState = { themeId: string; items: Record<string, CrecerDraft> };
type StepRecord = {
  tipo_paso?: { codigo: string } | null;
  contenidos?: Array<{
    grupo_edad_id: string;
    titulo?: string | null;
    cuerpo?: string | null;
    instruccion_corta?: string | null;
    recurso_id?: string | null;
    recurso_audio_id?: string | null;
  }> | null;
  preguntas?: Array<{
    grupo_edad_id: string;
    pregunta: string;
    orden: number;
  }> | null;
};

type SaveDraftVariables = {
  key: string;
  ageGroupId: string;
  stepCode: string;
  stepName: string;
  draft: CrecerDraft;
};

const DRAFT_STORAGE_PREFIX = "semillas:admin-crecer:drafts";
const DRAFT_KEY_SEPARATOR = "::";

export function crearClaveBorradorCrecer(ageGroupId: string, stepCode: string) {
  return `${ageGroupId}${DRAFT_KEY_SEPARATOR}${stepCode}`;
}

export function sonBorradoresCrecerIguales(left: CrecerDraft, right: CrecerDraft) {
  return (
    left.title === right.title &&
    left.body === right.body &&
    left.shortInstruction === right.shortInstruction &&
    left.resourceId === right.resourceId &&
    left.audioResourceId === right.audioResourceId &&
    left.questions.length === right.questions.length &&
    left.questions.every(
      (question, index) =>
        question.pregunta === right.questions[index]?.pregunta &&
        question.orden === right.questions[index]?.orden,
    )
  );
}

export function actualizarBorradoresCrecer(
  drafts: Record<string, CrecerDraft>,
  key: string,
  nextDraft: CrecerDraft,
  serverDraft: CrecerDraft,
) {
  const nextDrafts = { ...drafts };

  if (sonBorradoresCrecerIguales(nextDraft, serverDraft)) {
    delete nextDrafts[key];
  } else {
    nextDrafts[key] = nextDraft;
  }

  return nextDrafts;
}

export function validarContenidoCrecer(titulo: string, cuerpo: string) {
  const tituloLimpio = titulo.trim();
  const cuerpoLimpio = cuerpo.trim();

  if (tituloLimpio.length < 2) return "El título debe tener al menos 2 caracteres";
  if (tituloLimpio.length > 120) return "El título no puede superar 120 caracteres";
  if (cuerpoLimpio.length < 5) return "El contenido debe tener al menos 5 caracteres";

  return null;
}

export async function subirImagenMarkdown(
  archivo: File,
  subir: SubirImagen = subirArchivo,
  obtenerUrlFirmada: ObtenerUrlFirmada = obtenerUrlFirmadaRecurso,
) {
  const recurso = await subir(archivo, "imagen");
  const { url } = await obtenerUrlFirmada(recurso.id);
  return url;
}

function crearBorradorVacio(): CrecerDraft {
  return {
    title: "",
    body: "",
    shortInstruction: "",
    resourceId: null,
    audioResourceId: null,
    questions: [],
  };
}

function crearBorradorServidor(
  stepsData: StepRecord[] | undefined,
  ageGroupId: string,
  stepCode: string,
): CrecerDraft {
  if (!ageGroupId || !stepCode) return crearBorradorVacio();

  const stepRecord = stepsData?.find((step) => step.tipo_paso?.codigo === stepCode);
  const content = stepRecord?.contenidos?.find((item) => item.grupo_edad_id === ageGroupId);
  const questions = (stepRecord?.preguntas ?? [])
    .filter((question) => question.grupo_edad_id === ageGroupId)
    .sort((left, right) => left.orden - right.orden)
    .map((question, index) => ({ pregunta: question.pregunta, orden: index + 1 }));

  return {
    title: content?.titulo ?? "",
    body: content?.cuerpo ?? "",
    shortInstruction: content?.instruccion_corta ?? "",
    resourceId: content?.recurso_id ?? null,
    audioResourceId: content?.recurso_audio_id ?? null,
    questions,
  };
}

function storageKey(themeId: string) {
  return `${DRAFT_STORAGE_PREFIX}:${themeId}`;
}

function isReflectionQuestion(value: unknown): value is ReflectionQuestion {
  if (!value || typeof value !== "object") return false;
  const question = value as Partial<ReflectionQuestion>;
  return typeof question.pregunta === "string" && typeof question.orden === "number";
}

function isCrecerDraft(value: unknown): value is CrecerDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<CrecerDraft>;

  return (
    typeof draft.title === "string" &&
    typeof draft.body === "string" &&
    typeof draft.shortInstruction === "string" &&
    (typeof draft.resourceId === "string" || draft.resourceId === null) &&
    (typeof draft.audioResourceId === "string" || draft.audioResourceId === null) &&
    Array.isArray(draft.questions) &&
    draft.questions.every(isReflectionQuestion)
  );
}

function leerBorradoresCrecer(themeId: string) {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(storageKey(themeId));
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, draft]) => isCrecerDraft(draft)),
    ) as Record<string, CrecerDraft>;
  } catch {
    window.sessionStorage.removeItem(storageKey(themeId));
    return {};
  }
}

export function useThemeCrecerPage({ themeId }: UseThemeCrecerPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState("");
  const [activeStepCode, setActiveStepCode] = useState("conectar");
  const [draftState, setDraftState] = useState<DraftState>(() => ({
    themeId,
    items: leerBorradoresCrecer(themeId),
  }));
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);

  const themeQuery = useQuery({ queryKey: ["admin", "theme", themeId], queryFn: () => obtenerTemaAdmin(themeId) });
  const portadaQuery = useQuery({ queryKey: ["theme-portada", themeId], queryFn: () => obtenerUrlPortadaTema(themeId), enabled: Boolean(themeQuery.data?.portada_recurso_id), staleTime: 10 * 60 * 1000 });
  const stepsQuery = useQuery({ queryKey: ["admin", "theme", themeId, "steps"], queryFn: () => obtenerPasosAdmin(themeId) });
  const ageGroupsQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad, staleTime: 1000 * 60 * 60 });
  const crecerStepsQuery = useQuery({ queryKey: ["catalog", "crecer-steps"], queryFn: obtenerPasosCrecer, staleTime: 1000 * 60 * 60 });
  const mediaQuery = useQuery({ queryKey: ["admin", "media"], queryFn: obtenerRecursosMultimedia });

  const theme = themeQuery.data;
  const portadaUrl = portadaQuery.data?.url ?? theme?.portada_recurso?.url_publica ?? null;
  const estado = obtenerEstadoTema(theme?.estado ?? "borrador");
  const drafts = draftState.themeId === themeId ? draftState.items : {};

  useEffect(() => {
    if (draftState.themeId === themeId) return;
    setDraftState({ themeId, items: leerBorradoresCrecer(themeId) });
    setSelectedAgeGroupId("");
    setActiveStepCode("conectar");
    setLastSavedKey(null);
  }, [draftState.themeId, themeId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = storageKey(draftState.themeId);
    if (Object.keys(draftState.items).length) {
      window.sessionStorage.setItem(key, JSON.stringify(draftState.items));
    } else {
      window.sessionStorage.removeItem(key);
    }
  }, [draftState]);

  useEffect(() => {
    if (selectedAgeGroupId || !ageGroupsQuery.data?.length) return;
    const available = theme?.grupos_edad?.[0]?.id;
    setSelectedAgeGroupId(available ?? ageGroupsQuery.data?.[0]?.id ?? "");
  }, [ageGroupsQuery.data, selectedAgeGroupId, theme?.grupos_edad]);

  useEffect(() => {
    if (!stepsQuery.data || draftState.themeId !== themeId) return;

    setDraftState((current) => {
      if (current.themeId !== themeId) return current;

      const reconciled = Object.fromEntries(
        Object.entries(current.items).filter(([key, draft]) => {
          const [ageGroupId, stepCode] = key.split(DRAFT_KEY_SEPARATOR);
          if (!ageGroupId || !stepCode) return false;
          const serverDraft = crearBorradorServidor(stepsQuery.data, ageGroupId, stepCode);
          return !sonBorradoresCrecerIguales(draft, serverDraft);
        }),
      );

      return Object.keys(reconciled).length === Object.keys(current.items).length
        ? current
        : { ...current, items: reconciled };
    });
  }, [draftState.themeId, stepsQuery.data, themeId]);

  const selectedAgeGroup = useMemo(
    () => ageGroupsQuery.data?.find((ageGroup) => ageGroup.id === selectedAgeGroupId) ?? null,
    [ageGroupsQuery.data, selectedAgeGroupId],
  );
  const activeStep = crecerStepsQuery.data?.find((step) => step.codigo === activeStepCode);
  const activeStepRecord = useMemo(
    () => stepsQuery.data?.find((step) => step.tipo_paso?.codigo === activeStepCode) ?? null,
    [stepsQuery.data, activeStepCode],
  );
  const activeStepContent = useMemo(() => {
    if (!selectedAgeGroupId || !activeStepRecord) return null;
    return activeStepRecord.contenidos?.find((content) => content.grupo_edad_id === selectedAgeGroupId) ?? null;
  }, [activeStepRecord, selectedAgeGroupId]);

  const currentDraftKey = selectedAgeGroupId
    ? crearClaveBorradorCrecer(selectedAgeGroupId, activeStepCode)
    : "";
  const serverDraft = useMemo(
    () => crearBorradorServidor(stepsQuery.data, selectedAgeGroupId, activeStepCode),
    [activeStepCode, selectedAgeGroupId, stepsQuery.data],
  );
  const currentDraft = currentDraftKey && drafts[currentDraftKey]
    ? drafts[currentDraftKey]
    : serverDraft;

  const updateCurrentDraft = useCallback(
    (update: (draft: CrecerDraft) => CrecerDraft) => {
      if (!currentDraftKey) return;
      setLastSavedKey(null);

      setDraftState((current) => {
        const currentItems = current.themeId === themeId
          ? current.items
          : leerBorradoresCrecer(themeId);
        const baseDraft = currentItems[currentDraftKey] ?? serverDraft;
        const nextDraft = update(baseDraft);

        return {
          themeId,
          items: actualizarBorradoresCrecer(
            currentItems,
            currentDraftKey,
            nextDraft,
            serverDraft,
          ),
        };
      });
    },
    [currentDraftKey, serverDraft, themeId],
  );

  const setTitle = useCallback(
    (value: string) => updateCurrentDraft((draft) => ({ ...draft, title: value })),
    [updateCurrentDraft],
  );
  const setBody = useCallback(
    (value: string) => updateCurrentDraft((draft) => ({ ...draft, body: value })),
    [updateCurrentDraft],
  );
  const setShortInstruction = useCallback(
    (value: string) => updateCurrentDraft((draft) => ({ ...draft, shortInstruction: value })),
    [updateCurrentDraft],
  );
  const setResourceId = useCallback(
    (value: string | null) => updateCurrentDraft((draft) => ({ ...draft, resourceId: value })),
    [updateCurrentDraft],
  );
  const setAudioResourceId = useCallback(
    (value: string | null) => updateCurrentDraft((draft) => ({ ...draft, audioResourceId: value })),
    [updateCurrentDraft],
  );
  const setQuestions = useCallback(
    (value: ReflectionQuestion[]) =>
      updateCurrentDraft((draft) => ({
        ...draft,
        questions: value.map((question, index) => ({
          pregunta: question.pregunta,
          orden: index + 1,
        })),
      })),
    [updateCurrentDraft],
  );

  const unsavedDraftCount = Object.keys(drafts).length;
  const hasUnsavedChanges = unsavedDraftCount > 0;
  const isCurrentDirty = Boolean(currentDraftKey && drafts[currentDraftKey]);

  useBlocker({
    shouldBlockFn: () => {
      if (!hasUnsavedChanges) return false;
      const label = unsavedDraftCount === 1
        ? "un borrador sin guardar"
        : `${unsavedDraftCount} borradores sin guardar`;
      return !window.confirm(
        `Tienes ${label} en el Editor CRECER. ¿Deseas salir de todos modos? Los borradores se conservarán temporalmente en esta pestaña.`,
      );
    },
    enableBeforeUnload: hasUnsavedChanges,
  });

  const saveMutation = useMutation({
    mutationFn: ({ ageGroupId, stepCode, draft }: SaveDraftVariables) => {
      const stepType = crecerStepsQuery.data?.find((step) => step.codigo === stepCode);
      if (!stepType || !ageGroupId) throw new Error("Selecciona una franja y un paso");
      const validationError = validarContenidoCrecer(draft.title, draft.body);
      if (validationError) throw new Error(validationError);

      return guardarParlante(themeId, {
        tipo_paso_id: stepType.id,
        grupo_edad_id: ageGroupId,
        titulo: draft.title.trim(),
        cuerpo: draft.body.trim(),
        instruccion_corta: draft.shortInstruction.trim() || undefined,
        recurso_id: draft.resourceId,
        recurso_audio_id: draft.audioResourceId,
        datos_extra: { formato: "markdown", actualizado_desde: "admin" },
        preguntas: draft.questions
          .filter((question) => question.pregunta.trim())
          .map((question, index) => ({ pregunta: question.pregunta.trim(), orden: index + 1 })),
      });
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "steps"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "studio"] }),
      ]);

      setDraftState((current) => {
        if (current.themeId !== themeId) return current;
        const latestDraft = current.items[variables.key];
        if (!latestDraft || !sonBorradoresCrecerIguales(latestDraft, variables.draft)) {
          return current;
        }

        const nextItems = { ...current.items };
        delete nextItems[variables.key];
        return { ...current, items: nextItems };
      });
      setLastSavedKey(variables.key);
      toast.success(`${variables.stepName} guardado`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo guardar el paso"),
  });

  const saveCurrentDraft = useCallback(() => {
    if (!currentDraftKey || !selectedAgeGroupId || !activeStep) {
      toast.error("Selecciona una franja y un paso");
      return;
    }
    if (!isCurrentDirty) {
      toast.info("No hay cambios nuevos para guardar");
      return;
    }

    saveMutation.mutate({
      key: currentDraftKey,
      ageGroupId: selectedAgeGroupId,
      stepCode: activeStepCode,
      stepName: activeStep.nombre,
      draft: currentDraft,
    });
  }, [activeStep, activeStepCode, currentDraft, currentDraftKey, isCurrentDirty, saveMutation, selectedAgeGroupId]);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type, metadata }: { file: File; type: "imagen" | "audio" | "video"; metadata: { titulo: string; textoAlternativo: string } }) => subirArchivo(file, type, metadata.textoAlternativo || undefined, metadata.titulo || undefined),
    onSuccess: async (resource, variables) => {
      if (variables.type === "audio") setAudioResourceId(resource.id); else setResourceId(resource.id);
      await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Recurso subido; guarda el paso para vincularlo");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo subir el recurso"),
  });

  const handleSubirImagenMarkdown = async (archivo: File) => {
    const url = await subirImagenMarkdown(archivo);
    await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    toast.success("Imagen subida e insertada en el contenido");
    return url;
  };

  const pasos = crecerStepsQuery.data ?? [];
  const totalPasos = pasos.length || 6;
  const pasosCompletos = pasos.filter((step) => selectedAgeGroupId && stepsQuery.data?.some((contentStep) => contentStep.tipo_paso?.codigo === step.codigo && contentStep.contenidos?.some((content) => content.grupo_edad_id === selectedAgeGroupId && content.titulo?.trim() && content.cuerpo?.trim()))).length;
  const progreso = selectedAgeGroupId ? Math.round((pasosCompletos / totalPasos) * 100) : 0;
  const media = mediaQuery.data ?? [];
  const selectedResource = media.find((resource) => resource.id === currentDraft.resourceId) ?? null;
  const selectedAudio = media.find((resource) => resource.id === currentDraft.audioResourceId) ?? null;
  const isCurrentSaved = Boolean(
    currentDraftKey &&
    lastSavedKey === currentDraftKey &&
    !isCurrentDirty,
  );

  const hasDraftForStep = useCallback(
    (stepCode: string) => Boolean(
      selectedAgeGroupId && drafts[crearClaveBorradorCrecer(selectedAgeGroupId, stepCode)],
    ),
    [drafts, selectedAgeGroupId],
  );
  const hasDraftForAgeGroup = useCallback(
    (ageGroupId: string) =>
      Object.keys(drafts).some((key) => key.startsWith(`${ageGroupId}${DRAFT_KEY_SEPARATOR}`)),
    [drafts],
  );
  const hasDraftForCell = useCallback(
    (ageGroupId: string, stepCode: string) => Boolean(drafts[crearClaveBorradorCrecer(ageGroupId, stepCode)]),
    [drafts],
  );

  return {
    theme, portadaUrl, estado, selectedAgeGroup, activeStep, activeStepContent, pasos, totalPasos, pasosCompletos, progreso,
    selectedAgeGroupId, setSelectedAgeGroupId, activeStepCode, setActiveStepCode,
    title: currentDraft.title, setTitle,
    body: currentDraft.body, setBody,
    shortInstruction: currentDraft.shortInstruction, setShortInstruction,
    resourceId: currentDraft.resourceId, setResourceId,
    audioResourceId: currentDraft.audioResourceId, setAudioResourceId,
    questions: currentDraft.questions, setQuestions,
    selectedResource, selectedAudio, media,
    themeQuery, portadaQuery, stepsQuery, ageGroupsQuery, crecerStepsQuery, mediaQuery, saveMutation, uploadMutation,
    handleSubirImagenMarkdown, saveCurrentDraft,
    isCurrentDirty, isCurrentSaved, hasUnsavedChanges, unsavedDraftCount,
    hasDraftForStep, hasDraftForAgeGroup, hasDraftForCell,
    handleBack: () => navigate({ to: "/admin/temas/$themeId/detalle", params: { themeId } }),
  };
}

export function isVisualMedia(resource: RecursoMultimedia) { return resource.tipo === "imagen" || resource.tipo === "video"; }
