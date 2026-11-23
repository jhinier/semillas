import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Eye,
  Gamepad2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  asegurarGrupoEdadEnTema,
  crearActividad,
  duplicarActividad,
  eliminarActividad,
  obtenerActividadAdmin,
  obtenerActividadesAdmin,
  obtenerEstudioTemaAdmin,
  obtenerPasosAdmin,
  obtenerTemaAdmin,
  reordenarActividades,
  type ActividadAdmin,
} from "../features/admin/admin.api";
import { ThemeWorkflowStepper } from "../features/admin/componentes/temas/theme-workflow-stepper";
import {
  actualizarGrupoEdadDelBorrador,
  defaultOptions,
  emptyDraft,
  esObjetoPlano,
  tieneContenidoEnBorrador,
  type ActivityDraft,
} from "../features/admin/types";
import {
  resolverPasoTemaParaActividad,
  useThemeActivitiesMutation,
} from "../features/admin/hooks/use-theme-activities";
import {
  obtenerGruposEdad,
  obtenerPasosCrecer,
  obtenerTiposActividad,
} from "../features/catalog/catalog.api";
import { obtenerRecursosMultimedia, subirArchivo } from "../features/media/media.api";
import {
  esCodigoCuestionario,
  normalizarConfiguracionActividad,
  prepararOpcionesYConfiguracionActividad,
  sincronizarOpcionesCuestionario,
} from "@/features/admin/componentes/temas/activity-configuration";
import { resolverFranjasDelTema } from "@/features/admin/componentes/temas";
import {
  ActivityEditorWorkspace,
  type ActivityEditorTab,
} from "@/features/admin/componentes/temas/activity-editor-workspace";
import { getActivityTypeDefinition } from "@/features/admin/componentes/temas/activity-type-catalog";
import "./admin-activities-studio.css";

type ActivityRouteSearch = {
  form?: "nueva" | "editar";
  actividadId?: string;
  tab?: ActivityEditorTab;
};

export const Route = createFileRoute("/admin/temas/$themeId/activities")({
  component: AdminThemeActivitiesPage,
  validateSearch: (search: Record<string, unknown>): ActivityRouteSearch => ({
    form: search.form === "nueva" || search.form === "editar" ? search.form : undefined,
    actividadId: typeof search.actividadId === "string" ? search.actividadId : undefined,
    tab: isEditorTab(search.tab) ? search.tab : undefined,
  }),
});

function AdminThemeActivitiesPage() {
  const { themeId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const [selectedAge, setSelectedAge] = useState("");
  const [draft, setDraft] = useState<ActivityDraft>(emptyDraft);
  const [configText, setConfigText] = useState("{}");
  const [isDirty, setIsDirty] = useState(false);
  const [showReuseDialog, setShowReuseDialog] = useState(false);
  const [reuseSearch, setReuseSearch] = useState("");
  const [reuseTypeCode, setReuseTypeCode] = useState("");
  const [reuseTargetStepId, setReuseTargetStepId] = useState("");
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const newFormInitialized = useRef(false);
  const pendingTemplateRef = useRef<ActivityDraft | null>(null);
  const editFormInitializedId = useRef<string | null>(null);
  const ageSelectedByUser = useRef(false);

  const themeQuery = useQuery({
    queryKey: ["admin", "theme", themeId],
    queryFn: () => obtenerTemaAdmin(themeId),
  });
  const estudioQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "studio"],
    queryFn: () => obtenerEstudioTemaAdmin(themeId),
  });
  const groupsQuery = useQuery({
    queryKey: ["catalog", "age-groups"],
    queryFn: obtenerGruposEdad,
    staleTime: 1000 * 60 * 60,
  });
  const typesQuery = useQuery({
    queryKey: ["catalog", "activity-types"],
    queryFn: obtenerTiposActividad,
    staleTime: 1000 * 60 * 60,
  });
  const mediaQuery = useQuery({
    queryKey: ["admin", "media"],
    queryFn: obtenerRecursosMultimedia,
  });
  const stepsQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "steps"],
    queryFn: () => obtenerPasosAdmin(themeId),
  });
  const crecerStepsQuery = useQuery({
    queryKey: ["catalog", "crecer-steps"],
    queryFn: obtenerPasosCrecer,
    staleTime: 1000 * 60 * 60,
  });
  const reusableActivitiesQuery = useQuery({
    queryKey: ["admin", "activities", "reusable"],
    queryFn: () => obtenerActividadesAdmin({ limit: 500 }),
    enabled: showReuseDialog,
  });
  const activitiesQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "activities", selectedAge],
    queryFn: () =>
      obtenerActividadesAdmin({
        tema_id: themeId,
        grupo_edad_id: selectedAge || undefined,
        limit: 500,
      }),
  });
  const editQuery = useQuery({
    queryKey: ["admin", "activity", search.actividadId],
    queryFn: () => obtenerActividadAdmin(search.actividadId!),
    enabled: search.form === "editar" && Boolean(search.actividadId),
  });

  const allowedGroups = useMemo(() => {
    const gruposTema = themeQuery.data?.grupos_edad?.length
      ? themeQuery.data.grupos_edad
      : estudioQuery.data?.tema?.grupos_edad;
    return resolverFranjasDelTema(groupsQuery.data, gruposTema);
  }, [estudioQuery.data?.tema?.grupos_edad, groupsQuery.data, themeQuery.data?.grupos_edad]);

  const combinedSteps = useMemo(() => {
    const existing = stepsQuery.data ?? [];
    const catalog = [...(crecerStepsQuery.data ?? [])].sort((a, b) => a.orden - b.orden);
    if (!catalog.length) return existing;
    return catalog.map((tipo) => {
      const match = existing.find(
        (step) => step.tipo_paso?.id === tipo.id || step.tipo_paso?.codigo === tipo.codigo,
      );
      if (match) return match;
      return {
        id: `crecer:${tipo.id}`,
        tema_id: themeId,
        tipo_paso_id: tipo.id,
        orden: tipo.orden,
        obligatorio: true,
        tipo_paso: {
          id: tipo.id,
          codigo: tipo.codigo,
          nombre: `${tipo.nombre} (se creará al guardar)`,
          descripcion: tipo.descripcion ?? null,
          orden: tipo.orden,
          color_hex: tipo.color_hex ?? null,
        },
        contenidos: [],
        preguntas: [],
      };
    });
  }, [crecerStepsQuery.data, stepsQuery.data, themeId]);

  useEffect(() => {
    if (!reuseTargetStepId && combinedSteps.length > 0) {
      setReuseTargetStepId(combinedSteps[0]!.id);
    }
  }, [combinedSteps, reuseTargetStepId]);

  const activityCountsByAge = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const act of estudioQuery.data?.actividades ?? []) {
      if (act.grupo_edad_id) {
        counts[act.grupo_edad_id] = (counts[act.grupo_edad_id] ?? 0) + 1;
      }
    }
    return counts;
  }, [estudioQuery.data?.actividades]);

  useEffect(() => {
    if (!allowedGroups.length || themeQuery.isLoading) return;
    if (selectedAge && !allowedGroups.some((g) => g.id === selectedAge)) {
      ageSelectedByUser.current = false;
      setSelectedAge(allowedGroups[0]!.id);
      return;
    }
    if (ageSelectedByUser.current || search.form === "editar") return;
    const includedIds = new Set(themeQuery.data?.grupos_edad?.map((g) => g.id) ?? []);
    const groupWithActivities = allowedGroups.find((group) => (activityCountsByAge[group.id] ?? 0) > 0);
    const defaultIncluded = allowedGroups.find((group) => includedIds.has(group.id));
    if (!selectedAge) {
      setSelectedAge((groupWithActivities ?? defaultIncluded ?? allowedGroups[0])?.id ?? "");
      return;
    }
    if ((activityCountsByAge[selectedAge] ?? 0) === 0 && groupWithActivities) {
      setSelectedAge(groupWithActivities.id);
    }
  }, [activityCountsByAge, allowedGroups, search.form, selectedAge, themeQuery.data?.grupos_edad, themeQuery.isLoading]);

  useEffect(() => {
    if (search.form !== "nueva") {
      newFormInitialized.current = false;
      return;
    }
    if (newFormInitialized.current || !selectedAge || !combinedSteps.length || !typesQuery.data?.length) return;

    if (pendingTemplateRef.current) {
      const template = pendingTemplateRef.current;
      pendingTemplateRef.current = null;
      setDraft(template);
      setConfigText(JSON.stringify(template.configuracion, null, 2));
      setIsDirty(true);
      newFormInitialized.current = true;
      return;
    }

    const firstType = typesQuery.data[0];
    const baseOptions = defaultOptions.map((option) => ({ ...option }));
    const initialConfig = normalizarConfiguracionActividad(firstType?.codigo ?? "", {}, baseOptions);
    setDraft({
      ...emptyDraft,
      grupo_edad_id: selectedAge,
      paso_id: combinedSteps[0]?.id ?? "",
      tipo_actividad_id: firstType?.id ?? "",
      configuracion: initialConfig,
      opciones: baseOptions,
    });
    setConfigText(JSON.stringify(initialConfig, null, 2));
    setIsDirty(false);
    newFormInitialized.current = true;
  }, [search.form, selectedAge, combinedSteps, typesQuery.data]);

  useEffect(() => {
    if (search.form !== "editar") {
      editFormInitializedId.current = null;
      return;
    }
    const activity = editQuery.data;
    if (!activity) return;
    if (editFormInitializedId.current === activity.id) return;

    const opcionesServidor = [...(activity.opciones ?? [])].sort(
      (a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0),
    );
    const opcionesRaw = opcionesServidor.length
      ? opcionesServidor.map((option, index) => ({
          etiqueta: option.etiqueta ?? String.fromCharCode(65 + index),
          texto: option.texto,
          correcta: option.correcta,
          orden: option.orden || index + 1,
        }))
      : defaultOptions.map((option) => ({ ...option }));

    const codigoActividad =
      activity.tipo_actividad?.codigo ??
      typesQuery.data?.find((item) => item.id === activity.tipo_actividad_id)?.codigo ??
      "";

    const sincronizado = esCodigoCuestionario(codigoActividad)
      ? sincronizarOpcionesCuestionario(activity.configuracion ?? {}, opcionesRaw, {
          preferirOpcionesBorrador: opcionesServidor.some((o) => o.texto.trim().length > 0),
        })
      : {
          configuracion: normalizarConfiguracionActividad(
            codigoActividad,
            activity.configuracion ?? {},
            opcionesRaw,
          ),
          opciones: opcionesRaw,
        };

    const nextDraft: ActivityDraft = {
      paso_id: activity.paso_id ?? "",
      grupo_edad_id: activity.grupo_edad_id,
      tipo_actividad_id: activity.tipo_actividad_id,
      titulo: activity.titulo,
      consigna: activity.consigna,
      retroalimentacion: activity.retroalimentacion ?? "",
      xp_recompensa: activity.xp_recompensa,
      limite_tiempo_seg: activity.limite_tiempo_seg,
      dificultad: (activity.dificultad as ActivityDraft["dificultad"]) ?? "facil",
      obligatorio: activity.obligatorio,
      configuracion: sincronizado.configuracion,
      opciones: sincronizado.opciones,
    };

    editFormInitializedId.current = activity.id;
    ageSelectedByUser.current = true;
    setSelectedAge(activity.grupo_edad_id);
    setDraft(nextDraft);
    setConfigText(JSON.stringify(nextDraft.configuracion, null, 2));
    setIsDirty(false);
  }, [editQuery.data, search.form, typesQuery.data]);

  useEffect(() => {
    if (!isDirty) return;
    const preventClose = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventClose);
    return () => window.removeEventListener("beforeunload", preventClose);
  }, [isDirty]);

  const isFormOpen = search.form === "nueva" || search.form === "editar";
  const selectedType = typesQuery.data?.find((type) => type.id === draft.tipo_actividad_id);
  const activities = useMemo(
    () => [...(activitiesQuery.data?.actividades ?? [])].sort((a, b) => a.orden - b.orden),
    [activitiesQuery.data],
  );

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "activities"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "steps"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "studio"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "themes"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] }),
      ...(search.actividadId
        ? [queryClient.invalidateQueries({ queryKey: ["admin", "activity", search.actividadId] })]
        : []),
    ]);
  };

  const closeForm = (force = false) => {
    if (!force && isDirty && !window.confirm("Hay cambios sin guardar. ¿Descartarlos y cerrar el editor?")) return;
    setIsDirty(false);
    navigate({ search: {} });
  };

  const goBack = () => {
    if (isFormOpen && isDirty && !window.confirm("Hay cambios sin guardar. ¿Descartarlos y volver al tema?")) return;
    setIsDirty(false);
    navigate({ to: "/admin/temas/$themeId/detalle", params: { themeId } });
  };

  const openNew = () => {
    navigate({ search: { form: "nueva", tab: "contexto" } });
  };

  const openEdit = (activityId: string, tab: ActivityEditorTab = "contexto") => {
    navigate({ search: { form: "editar", actividadId: activityId, tab } });
  };

  const changeAgeContext = (groupId: string) => {
    if (
      search.form === "nueva" &&
      groupId !== selectedAge &&
      (tieneContenidoEnBorrador(draft) || configText.trim() !== "{}") &&
      !window.confirm("El borrador conservará su contenido y cambiará de franja. ¿Continuar?")
    ) return;

    ageSelectedByUser.current = true;
    setSelectedAge(groupId);
    if (search.form === "nueva") {
      setDraft((current) => actualizarGrupoEdadDelBorrador(current, groupId));
      setIsDirty(true);
    }
  };

  const updateDraft = (nextDraft: ActivityDraft) => {
    setDraft(nextDraft);
    if (nextDraft.grupo_edad_id) setSelectedAge(nextDraft.grupo_edad_id);
    setIsDirty(true);
  };

  const updateConfigText = (value: string) => {
    setConfigText(value);
    try {
      const parsed = JSON.parse(value) as unknown;
      if (esObjetoPlano(parsed)) {
        setDraft((current) => ({ ...current, configuracion: parsed }));
      }
    } catch {
      // El editor conserva el último JSON válido mientras el usuario termina de escribir.
    }
    setIsDirty(true);
  };

  const changeType = (typeId: string) => {
    if (typeId === draft.tipo_actividad_id) return;
    const hasTypeData = Object.keys(draft.configuracion).length > 0 || draft.opciones.some((option) => option.texto.trim());
    if (hasTypeData && !window.confirm("Cambiar el tipo reiniciará la mecánica y sus opciones. ¿Continuar?")) return;

    const type = typesQuery.data?.find((item) => item.id === typeId);
    const baseOptions = defaultOptions.map((option) => ({ ...option }));
    const nextConfig = normalizarConfiguracionActividad(type?.codigo ?? "", {}, baseOptions);
    updateDraft({
      ...draft,
      tipo_actividad_id: typeId,
      configuracion: nextConfig,
      opciones: baseOptions,
    });
    setConfigText(JSON.stringify(nextConfig, null, 2));
  };

  const pasoSeleccionado = combinedSteps.find((step) => step.id === draft.paso_id);

  const saveMutation = useThemeActivitiesMutation({
    themeId,
    draft,
    configText,
    codigoTipoActividad: selectedType?.codigo ?? "",
    pasoNombreSeleccionado: pasoSeleccionado?.tipo_paso?.nombre,
    ordenActual: search.form === "editar"
      ? activities.find((activity) => activity.id === search.actividadId)?.orden ?? activities.length
      : activities.length,
    esModoEditar: search.form === "editar",
    actividadId: search.actividadId,
    gruposTemaActuales: themeQuery.data?.grupos_edad,
  });

  const reusableActivities = useMemo(() => {
    const lista = reusableActivitiesQuery.data?.actividades ?? [];
    const q = reuseSearch.trim().toLocaleLowerCase("es");
    return lista.filter((act) => {
      if (reuseTypeCode && act.tipo_actividad?.codigo !== reuseTypeCode) return false;
      if (!q) return true;
      return (
        act.titulo.toLocaleLowerCase("es").includes(q) ||
        act.consigna.toLocaleLowerCase("es").includes(q) ||
        (act.tema?.titulo ?? "").toLocaleLowerCase("es").includes(q)
      );
    });
  }, [reusableActivitiesQuery.data?.actividades, reuseSearch, reuseTypeCode]);

  const usarComoPlantilla = (source: ActividadAdmin) => {
    const codigo =
      source.tipo_actividad?.codigo ??
      typesQuery.data?.find((t) => t.id === source.tipo_actividad_id)?.codigo ??
      "";
    const { configuracion, opciones } = prepararOpcionesYConfiguracionActividad(
      codigo,
      source.configuracion ?? {},
      source.opciones ?? [],
    );

    pendingTemplateRef.current = {
      paso_id: reuseTargetStepId || combinedSteps[0]?.id || "",
      grupo_edad_id: selectedAge || allowedGroups[0]?.id || "",
      tipo_actividad_id: source.tipo_actividad_id,
      titulo: source.titulo,
      consigna: source.consigna,
      retroalimentacion: source.retroalimentacion ?? "",
      xp_recompensa: source.xp_recompensa,
      limite_tiempo_seg: source.limite_tiempo_seg,
      dificultad: (source.dificultad as ActivityDraft["dificultad"]) ?? "facil",
      obligatorio: source.obligatorio,
      configuracion,
      opciones: opciones.length ? opciones : defaultOptions.map((o) => ({ ...o })),
    };
    setShowReuseDialog(false);
    navigate({ search: { form: "nueva", tab: "contenido" } });
  };

  const copiarDirectoDesdeBiblioteca = async (source: ActividadAdmin) => {
    const grupoDestino = selectedAge || allowedGroups[0]?.id;
    const pasoDestino = reuseTargetStepId || combinedSteps[0]?.id;
    if (!grupoDestino || !pasoDestino) {
      toast.error("Selecciona primero una franja de edad y un momento CRECER.");
      return;
    }

    try {
      setCopyingId(source.id);
      const pasoObjetivo = combinedSteps.find((s) => s.id === pasoDestino);
      const pasoIdResuelto = await resolverPasoTemaParaActividad({
        themeId,
        pasoIdSeleccionado: pasoDestino,
        grupoEdadId: grupoDestino,
        pasoNombre: pasoObjetivo?.tipo_paso?.nombre,
      });

      const codigo =
        source.tipo_actividad?.codigo ??
        typesQuery.data?.find((t) => t.id === source.tipo_actividad_id)?.codigo ??
        "";
      const { configuracion, opciones } = prepararOpcionesYConfiguracionActividad(
        codigo,
        source.configuracion ?? {},
        source.opciones ?? [],
      );

      await crearActividad({
        tema_id: themeId,
        paso_id: pasoIdResuelto,
        grupo_edad_id: grupoDestino,
        tipo_actividad_id: source.tipo_actividad_id,
        titulo: source.titulo,
        consigna: source.consigna,
        retroalimentacion: source.retroalimentacion ?? undefined,
        orden: activities.length + 1,
        xp_recompensa: source.xp_recompensa,
        limite_tiempo_seg: source.limite_tiempo_seg,
        dificultad: (source.dificultad as ActivityDraft["dificultad"]) ?? "facil",
        obligatorio: source.obligatorio,
        configuracion,
        opciones,
      });

      if (!themeQuery.data?.grupos_edad?.length) {
        await asegurarGrupoEdadEnTema(themeId, grupoDestino, themeQuery.data?.grupos_edad);
      }
      await invalidate();
      setShowReuseDialog(false);
      toast.success(`“${source.titulo}” se copió a esta franja`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo copiar la actividad");
    } finally {
      setCopyingId(null);
    }
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync();
    await invalidate();
    closeForm(true);
  };

  const deleteMutation = useMutation({
    mutationFn: eliminarActividad,
    onSuccess: async () => {
      await invalidate();
      toast.success("Actividad eliminada");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo eliminar"),
  });
  const duplicateMutation = useMutation({
    mutationFn: duplicarActividad,
    onSuccess: async () => {
      await invalidate();
      toast.success("Actividad duplicada");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo duplicar"),
  });
  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => reordenarActividades(themeId, ids),
    onSuccess: invalidate,
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo reordenar"),
  });
  const uploadMutation = useMutation({
    mutationFn: async ({ file, key, type }: { file: File; key: string; type: "imagen" | "audio" | "video" }) => ({
      key,
      resource: await subirArchivo(file, type, `${draft.titulo || "Actividad"} - ${key}`),
    }),
    onSuccess: ({ key, resource }: { key: string; resource: Awaited<ReturnType<typeof subirArchivo>> }) => {
      setDraft((current) => {
        const merged = {
          ...current.configuracion,
          [key]: resource.url_publica,
          [`${key}_recurso_id`]: resource.id,
        };
        const nextConfig = normalizarConfiguracionActividad(
          selectedType?.codigo ?? "",
          merged,
          current.opciones,
        );
        setConfigText(JSON.stringify(nextConfig, null, 2));
        return { ...current, configuracion: nextConfig };
      });
      setIsDirty(true);
      toast.success("Recurso agregado");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo subir el recurso"),
  });

  const moveActivity = (activityId: string, direction: -1 | 1) => {
    const index = activities.findIndex((activity) => activity.id === activityId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= activities.length) return;
    const ids = activities.map((activity) => activity.id);
    [ids[index], ids[target]] = [ids[target]!, ids[index]!];
    reorderMutation.mutate(ids);
  };

  if (themeQuery.isLoading || groupsQuery.isLoading || typesQuery.isLoading || stepsQuery.isLoading) {
    return <div className="admin-activity-loading"><Loader2 className="animate-spin" /><span>Preparando el estudio de actividades…</span></div>;
  }

  if (themeQuery.isError || !themeQuery.data) {
    return <div className="admin-activity-error"><strong>No se pudo abrir el tema</strong><button type="button" onClick={goBack}>Volver</button></div>;
  }

  return (
    <div className="admin-activity-studio-page">
      <header className="admin-activity-studio-hero">
        <div className="admin-activity-studio-hero__title">
          <button type="button" className="admin-icon-button" onClick={goBack} aria-label="Volver al resumen del tema"><ArrowLeft size={18} /></button>
          <div>
            <span className="admin-eyebrow">Paso 4 de 5 · Actividades interactivas</span>
            <h1>Actividades del tema</h1>
            <p><strong>{themeQuery.data.titulo}</strong> · agrega juegos o cuestionarios por edad y momento CRECER.</p>
          </div>
        </div>
        {!isFormOpen ? (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="admin-secondary-button" onClick={() => setShowReuseDialog(true)}>
              <Copy size={16} /> Reutilizar existente
            </button>
            <button type="button" className="admin-primary-button" onClick={openNew}>
              <Plus size={17} /> Agregar actividad
            </button>
          </div>
        ) : null}
      </header>

      <ThemeWorkflowStepper
        currentStep={4}
        themeId={themeId}
        themeEstado={themeQuery.data.estado}
        completitud={estudioQuery.data?.completitud}
      />

      {isFormOpen ? (
        editQuery.isLoading ? (
          <div className="admin-activity-loading"><Loader2 className="animate-spin" /><span>Cargando actividad…</span></div>
        ) : (
          <ActivityEditorWorkspace
            draft={draft}
            onChange={updateDraft}
            configText={configText}
            onConfigTextChange={updateConfigText}
            steps={combinedSteps}
            groups={allowedGroups}
            types={typesQuery.data ?? []}
            resources={mediaQuery.data ?? []}
            selectedTypeCode={selectedType?.codigo ?? ""}
            tab={search.tab ?? "contexto"}
            onTabChange={(tab) => navigate({ search: { ...search, tab } })}
            onTypeChange={changeType}
            onUpload={(file, key, type) => uploadMutation.mutate({ file, key, type })}
            uploading={uploadMutation.isPending}
            saving={saveMutation.isPending}
            dirty={isDirty}
            isEditMode={search.form === "editar"}
            onSave={handleSave}
            onClose={() => closeForm()}
          />
        )
      ) : (
        <>
          {allowedGroups.length === 1 ? (
            <section className="admin-age-switcher" aria-label="Franja de edad del tema">
              <div>
                <span className="admin-eyebrow">Franja definida en Paso 1</span>
                <strong>
                  {allowedGroups[0]!.nombre} · {activityCountsByAge[allowedGroups[0]!.id] ?? activities.length}{" "}
                  {(activityCountsByAge[allowedGroups[0]!.id] ?? activities.length) === 1 ? "actividad" : "actividades"}
                </strong>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-violet-600 hover:underline dark:text-violet-300"
                onClick={() =>
                  navigate({
                    to: "/admin/temas/$themeId/edit",
                    params: { themeId },
                    search: { tab: "general" },
                  })
                }
              >
                Cambiar franja en Paso 1
              </button>
            </section>
          ) : (
            <section className="admin-age-switcher" aria-label="Franja de edad">
              <div>
                <span className="admin-eyebrow">Franjas elegidas en Paso 1</span>
                <strong>Contenido independiente por audiencia</strong>
              </div>
              <div className="admin-age-switcher__options">
                {allowedGroups.map((group) => {
                  const count = activityCountsByAge[group.id] ?? 0;
                  return (
                    <button key={group.id} type="button" onClick={() => changeAgeContext(group.id)} className={selectedAge === group.id ? "admin-age-switcher__option--active" : ""}>
                      <span>{group.nombre}</span>
                      <small>{count} {count === 1 ? "actividad" : "actividades"} · {selectedAge === group.id ? "Editando" : "Ver secuencia"}</small>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="admin-activity-sequence-board">
            <header>
              <div><span className="admin-eyebrow">Secuencia editorial</span><h2>{activities.length} {activities.length === 1 ? "actividad" : "actividades"}</h2></div>
              <p>El orden de esta lista es el orden que seguirá el estudiante dentro del recorrido.</p>
            </header>

            {activitiesQuery.isLoading ? (
              <div className="admin-activity-loading"><Loader2 className="animate-spin" /><span>Cargando secuencia…</span></div>
            ) : activities.length === 0 ? (
              <div className="admin-activity-empty-state">
                <span><Gamepad2 size={25} /></span>
                <h3>Esta franja todavía no tiene actividades</h3>
                <p>Crea una nueva actividad o reutiliza alguna que ya exista en otro tema o franja de edad.</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button type="button" className="admin-primary-button" onClick={openNew}><Plus size={17} /> Crear nueva actividad</button>
                  <button type="button" className="admin-secondary-button" onClick={() => setShowReuseDialog(true)}><Copy size={16} /> Reutilizar existente</button>
                </div>
              </div>
            ) : (
              <div className="admin-activity-sequence-list">
                {activities.map((activity, index) => (
                  <ActivitySequenceRow
                    key={activity.id}
                    activity={activity}
                    index={index}
                    total={activities.length}
                    steps={combinedSteps}
                    onMove={moveActivity}
                    onEdit={() => openEdit(activity.id)}
                    onPreview={() => openEdit(activity.id, "preview")}
                    onDuplicate={() => duplicateMutation.mutate(activity.id)}
                    onDelete={() => {
                      if (window.confirm(`¿Eliminar “${activity.titulo}”? Esta acción no se puede deshacer.`)) deleteMutation.mutate(activity.id);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="admin-step-footer-bar">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => navigate({ to: "/admin/temas/$themeId/crecer", params: { themeId } })}
            >
              <ArrowLeft size={16} /> Paso anterior: Enseñanza CRECER
            </button>
            <button
              type="button"
              className="admin-primary-button"
              onClick={() => {
                const totalActs = estudioQuery.data?.completitud?.estadisticas?.actividades ?? activities.length;
                if (totalActs === 0 && activities.length === 0) {
                  toast.error("Crea al menos una actividad antes de continuar al Paso 5.");
                  return;
                }
                navigate({
                  to: "/admin/temas/$themeId/edit",
                  params: { themeId },
                  search: { tab: "publicacion" },
                });
              }}
            >
              Continuar al Paso 5: Revisar y publicar <ArrowRight size={17} />
            </button>
          </div>
        </>
      )}

      {showReuseDialog ? (
        <div
          className="activity-theme-picker-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setShowReuseDialog(false);
          }}
        >
          <section className="activity-theme-picker max-w-2xl w-full" role="dialog" aria-modal="true" aria-labelledby="reuse-activity-title">
            <header>
              <div>
                <span className="admin-eyebrow">Biblioteca de actividades</span>
                <h2 id="reuse-activity-title">Reutilizar una actividad existente</h2>
                <p>Elige una actividad ya creada para copiarla directo a esta franja o cargarla como plantilla editable.</p>
              </div>
              <button type="button" onClick={() => setShowReuseDialog(false)} aria-label="Cerrar"><X size={19} /></button>
            </header>

            <div className="activity-theme-picker__toolbar !flex-col !items-stretch gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="activity-library-search sm:col-span-2">
                  <Search size={16} />
                  <input
                    value={reuseSearch}
                    onChange={(e) => setReuseSearch(e.target.value)}
                    placeholder="Buscar por título, consigna o tema…"
                  />
                </label>
                <select
                  value={reuseTypeCode}
                  onChange={(e) => setReuseTypeCode(e.target.value)}
                  aria-label="Filtrar por tipo"
                  className="min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3.5 py-2.5 text-xs font-bold"
                >
                  <option value="">Todos los tipos</option>
                  {(typesQuery.data ?? []).map((type) => (
                    <option key={type.id} value={type.codigo}>{type.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">Momento CRECER destino:</span>
                <select
                  value={reuseTargetStepId}
                  onChange={(e) => setReuseTargetStepId(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-1.5 text-xs font-bold"
                >
                  {combinedSteps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.tipo_paso?.nombre ?? "Momento"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="activity-theme-picker__list max-h-96 overflow-y-auto space-y-2.5">
              {reusableActivitiesQuery.isLoading ? (
                <div className="admin-activity-loading"><Loader2 className="animate-spin" /><span>Cargando actividades…</span></div>
              ) : reusableActivities.length === 0 ? (
                <div className="activity-theme-picker__empty"><Search size={20} /><p>No encontramos actividades con ese filtro.</p></div>
              ) : (
                reusableActivities.slice(0, 30).map((act) => (
                  <div key={act.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-extrabold">{act.titulo}</strong>
                      <small className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {act.tipo_actividad?.nombre ?? "Actividad"} · {act.tema?.titulo ?? "Otro tema"} · {act.grupo_edad?.nombre ?? "Franja"}
                      </small>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="admin-secondary-button !py-1.5 !px-3 text-xs"
                        onClick={() => usarComoPlantilla(act)}
                      >
                        Editar como plantilla
                      </button>
                      <button
                        type="button"
                        disabled={copyingId === act.id}
                        className="admin-primary-button !py-1.5 !px-3 text-xs"
                        onClick={() => void copiarDirectoDesdeBiblioteca(act)}
                      >
                        {copyingId === act.id ? "Copiando..." : "Copiar aquí"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function ActivitySequenceRow({
  activity,
  index,
  total,
  steps,
  onMove,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
}: {
  activity: ActividadAdmin;
  index: number;
  total: number;
  steps: Array<{ id: string; tipo_paso?: { nombre?: string | null } | null }>;
  onMove: (id: string, direction: -1 | 1) => void;
  onEdit: () => void;
  onPreview: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const type = getActivityTypeDefinition(activity.tipo_actividad?.codigo);
  const Icon = type.icono;
  const step = steps.find((item) => item.id === activity.paso_id);

  return (
    <article className="admin-activity-sequence-row">
      <div className="admin-activity-sequence-row__order">
        <strong>{String(index + 1).padStart(2, "0")}</strong>
        <div>
          <button type="button" disabled={index === 0} onClick={() => onMove(activity.id, -1)} aria-label="Subir actividad"><ArrowUp size={14} /></button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove(activity.id, 1)} aria-label="Bajar actividad"><ArrowDown size={14} /></button>
        </div>
      </div>
      <span className={`admin-activity-type-icon admin-activity-type-icon--${type.tono}`}><Icon size={20} /></span>
      <div className="admin-activity-sequence-row__copy">
        <div><h3>{activity.titulo}</h3><span>{activity.tipo_actividad?.nombre ?? type.nombre}</span></div>
        <p>{activity.consigna}</p>
        <div className="admin-activity-meta"><span>{step?.tipo_paso?.nombre ?? "Sin momento"}</span><span>{activity.xp_recompensa} XP</span><span>{activity.obligatorio ? "Obligatoria" : "Opcional"}</span></div>
      </div>
      <div className="admin-activity-sequence-row__actions">
        <button type="button" onClick={onPreview} aria-label="Vista previa"><Eye size={16} /></button>
        <button type="button" onClick={onEdit} aria-label="Editar"><Pencil size={16} /></button>
        <button type="button" onClick={onDuplicate} aria-label="Duplicar"><Copy size={16} /></button>
        <button type="button" className="admin-danger-icon" onClick={onDelete} aria-label="Eliminar"><Trash2 size={16} /></button>
      </div>
    </article>
  );
}

function isEditorTab(value: unknown): value is ActivityEditorTab {
  return value === "contexto" || value === "contenido" || value === "mecanica" || value === "preview";
}
