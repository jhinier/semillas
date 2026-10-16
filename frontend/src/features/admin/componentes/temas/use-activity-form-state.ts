import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { obtenerGruposEdad } from "../../../catalog/catalog.api";
import { obtenerActividades } from "../../../themes/themes.api";
import { obtenerActividadAdmin, obtenerPasosAdmin } from "../../admin.api";
import { obtenerTiposActividad } from "../../../catalog/catalog.api";
import type { Actividad, Paso } from "@/shared/api/api";
import type { ActividadAdmin } from "../../admin.api";

export interface Opcion {
  etiqueta: string;
  texto: string;
  correcta: boolean;
  orden: number;
}

export interface ActividadParaEditar {
  titulo: string;
  consigna: string;
  xp_recompensa: number;
  paso_id?: string | null;
  tipo_actividad_id: string;
  retroalimentacion?: string | null;
  opciones?: Array<{ etiqueta?: string | null; texto?: string | null; correcta?: boolean | null }> | null;
  grupo_edad_id?: string | null;
}

interface UseActivityFormStateProps {
  actividadId?: string;
  themeId: string;
  isEditMode: boolean;
}

interface UseActivityFormStateReturn {
  selectedAgeGroupId: string;
  setSelectedAgeGroupId: (id: string) => void;
  title: string;
  setTitle: (v: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  xpReward: number;
  setXpReward: (v: number) => void;
  selectedStepId: string;
  setSelectedStepId: (v: string) => void;
  selectedActivityTypeId: string;
  setSelectedActivityTypeId: (v: string) => void;
  feedback: string;
  setFeedback: (v: string) => void;
  options: Opcion[];
  setOptions: React.Dispatch<React.SetStateAction<Opcion[]>>;
  resetForm: () => void;
  ageGroupsQuery: ReturnType<typeof useQuery<Array<{ id: string; nombre?: string | null }>, Error, Array<{ id: string; nombre?: string | null }>, ["catalog", "age-groups"]>>;
  activityToEditQuery: ReturnType<typeof useQuery<ActividadAdmin, Error, ActividadAdmin, ["admin", "activity", string | undefined]>>;
  activitiesQuery: ReturnType<typeof useQuery<Actividad[], Error, Actividad[], ["admin", "theme", string, "activities", string]>>;
  stepsQuery: ReturnType<typeof useQuery<Paso[], Error, Paso[], ["admin", "theme", string, "steps"]>>;
  activityTypesQuery: ReturnType<typeof useQuery<Array<{ id: string; nombre?: string | null }>, Error, Array<{ id: string; nombre?: string | null }>, ["catalog", "activity-types"]>>;
}

const defaultOptions: Opcion[] = [
  { etiqueta: "A", texto: "", correcta: false, orden: 1 },
  { etiqueta: "B", texto: "", correcta: false, orden: 2 },
  { etiqueta: "C", texto: "", correcta: false, orden: 3 },
  { etiqueta: "D", texto: "", correcta: false, orden: 4 }
];

export function useActivityFormState({
  actividadId,
  themeId,
  isEditMode,
}: UseActivityFormStateProps): UseActivityFormStateReturn {
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [xpReward, setXpReward] = useState(10);
  const [selectedStepId, setSelectedStepId] = useState("");
  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [options, setOptions] = useState<Opcion[]>(defaultOptions);

  const ageGroupsQuery = useQuery({
    queryKey: ["catalog", "age-groups"],
    queryFn: obtenerGruposEdad,
    staleTime: 1000 * 60 * 60,
  });

  const activityToEditQuery = useQuery({
    queryKey: ["admin", "activity", actividadId],
    queryFn: () => obtenerActividadAdmin(actividadId!),
    enabled: !!actividadId,
  });

  useEffect(() => {
    if (activityToEditQuery.data && isEditMode) {
      const act = activityToEditQuery.data;
      setTitle(act.titulo);
      setPrompt(act.consigna);
      setXpReward(act.xp_recompensa);
      setSelectedStepId(act.paso_id || "");
      setSelectedActivityTypeId(act.tipo_actividad_id);
      setFeedback(act.retroalimentacion || "");
      if (act.opciones && act.opciones.length > 0) {
        setOptions(act.opciones.map((opt, idx) => ({
          etiqueta: opt.etiqueta || String.fromCharCode(65 + idx),
          texto: opt.texto || "",
          correcta: opt.correcta ?? false,
          orden: idx + 1
        })));
      }
      if (act.grupo_edad_id) {
        setSelectedAgeGroupId(act.grupo_edad_id);
      }
    }
  }, [activityToEditQuery.data, isEditMode]);

  useEffect(() => {
    if (!selectedAgeGroupId && ageGroupsQuery.data && ageGroupsQuery.data.length > 0) {
      const first = ageGroupsQuery.data[0];
      if (first && !isEditMode) setSelectedAgeGroupId(first.id);
    }
  }, [ageGroupsQuery.data, selectedAgeGroupId, isEditMode]);

  const activitiesQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "activities", selectedAgeGroupId],
    queryFn: () => obtenerActividades(themeId, selectedAgeGroupId || undefined),
    enabled: !!selectedAgeGroupId && !isEditMode
  });

  const stepsQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "steps"],
    queryFn: () => obtenerPasosAdmin(themeId)
  });

  const activityTypesQuery = useQuery({
    queryKey: ["catalog", "activity-types"],
    queryFn: obtenerTiposActividad,
    staleTime: 1000 * 60 * 60,
  });

  const resetForm = () => {
    setTitle("");
    setPrompt("");
    setXpReward(10);
    setFeedback("");
    setSelectedStepId("");
    setSelectedActivityTypeId("");
    setOptions(defaultOptions);
  };

  return {
    selectedAgeGroupId,
    setSelectedAgeGroupId,
    title,
    setTitle,
    prompt,
    setPrompt,
    xpReward,
    setXpReward,
    selectedStepId,
    setSelectedStepId,
    selectedActivityTypeId,
    setSelectedActivityTypeId,
    feedback,
    setFeedback,
    options,
    setOptions,
    resetForm,
    ageGroupsQuery,
    activityToEditQuery,
    activitiesQuery,
    stepsQuery,
    activityTypesQuery,
  };
}
