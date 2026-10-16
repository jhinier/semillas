import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  Eye,
  Gamepad2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  duplicarActividad,
  eliminarActividad,
  obtenerActividadAdmin,
  obtenerActividadesAdmin,
  obtenerPasosAdmin,
  obtenerTemaAdmin,
  reordenarActividades,
  type ActividadAdmin,
} from "../features/admin/admin.api";
import {
  actualizarGrupoEdadDelBorrador,
  defaultOptions,
  emptyDraft,
  esObjetoPlano,
  tieneContenidoEnBorrador,
  type ActivityDraft,
} from "../features/admin/types";
import { useThemeActivitiesMutation } from "../features/admin/hooks/use-theme-activities";
import { obtenerGruposEdad, obtenerTiposActividad } from "../features/catalog/catalog.api";
import { obtenerRecursosMultimedia, subirArchivo } from "../features/media/media.api";
import { normalizarConfiguracionActividad } from "@/features/admin/componentes/temas/activity-configuration";
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
  const newFormInitialized = useRef(false);

  const themeQuery = useQuery({
    queryKey: ["admin", "theme", themeId],
    queryFn: () => obtenerTemaAdmin(themeId),
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

  useEffect(() => {
    if (selectedAge || !groupsQuery.data?.length) return;
    setSelectedAge(themeQuery.data?.grupos_edad?.[0]?.id ?? groupsQuery.data[0]?.id ?? "");
  }, [groupsQuery.data, selectedAge, themeQuery.data?.grupos_edad]);

  useEffect(() => {
    if (search.form !== "nueva") {
      newFormInitialized.current = false;
      return;
    }
    if (newFormInitialized.current || !selectedAge || !stepsQuery.data?.length || !typesQuery.data?.length) return;

    const firstType = typesQuery.data[0];
    const initialConfig = normalizarConfiguracionActividad(firstType?.codigo ?? "", {});
    setDraft({
      ...emptyDraft,
      grupo_edad_id: selectedAge,
      paso_id: stepsQuery.data[0]?.id ?? "",
      tipo_actividad_id: firstType?.id ?? "",
      configuracion: initialConfig,
      opciones: defaultOptions.map((option) => ({ ...option })),
    });
    setConfigText(JSON.stringify(initialConfig, null, 2));
    setIsDirty(false);
    newFormInitialized.current = true;
  }, [search.form, selectedAge, stepsQuery.data, typesQuery.data]);

  useEffect(() => {
    const activity = editQuery.data;
    if (!activity || search.form !== "editar") return;

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
      configuracion: activity.configuracion ?? {},
      opciones: activity.opciones.length
        ? activity.opciones.map((option, index) => ({
            etiqueta: option.etiqueta ?? String.fromCharCode(65 + index),
            texto: option.texto,
            correcta: option.correcta,
            orden: option.orden,
          }))
        : defaultOptions.map((option) => ({ ...option })),
    };

    setSelectedAge(activity.grupo_edad_id);
    setDraft(nextDraft);
    setConfigText(JSON.stringify(nextDraft.configuracion, null, 2));
    setIsDirty(false);
  }, [editQuery.data, search.form]);

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
  const allowedGroups = useMemo(() => {
    const ids = new Set(themeQuery.data?.grupos_edad?.map((group) => group.id) ?? []);
    return ids.size ? (groupsQuery.data ?? []).filter((group) => ids.has(group.id)) : groupsQuery.data ?? [];
  }, [groupsQuery.data, themeQuery.data?.grupos_edad]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "activities"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "studio"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "activities"] }),
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
    const nextConfig = normalizarConfiguracionActividad(type?.codigo ?? "", {});
    updateDraft({
      ...draft,
      tipo_actividad_id: typeId,
      configuracion: nextConfig,
      opciones: defaultOptions.map((option) => ({ ...option })),
    });
    setConfigText(JSON.stringify(nextConfig, null, 2));
  };

  const saveMutation = useThemeActivitiesMutation({
    themeId,
    draft,
    configText,
    codigoTipoActividad: selectedType?.codigo ?? "",
    ordenActual: search.form === "editar"
      ? activities.find((activity) => activity.id === search.actividadId)?.orden ?? activities.length
      : activities.length,
    esModoEditar: search.form === "editar",
    actividadId: search.actividadId,
  });

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
      const next = {
        ...draft.configuracion,
        [key]: resource.url_publica,
        [`${key}_recurso_id`]: resource.id,
      };
      setDraft((current) => ({ ...current, configuracion: next }));
      setConfigText(JSON.stringify(next, null, 2));
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
          <button type="button" className="admin-icon-button" onClick={goBack} aria-label="Volver al tema"><ArrowLeft size={18} /></button>
          <div>
            <span className="admin-eyebrow">Editor interactivo</span>
            <h1>Actividades del tema</h1>
            <p><strong>{themeQuery.data.titulo}</strong> · organiza las experiencias por franja y momento CRECER.</p>
          </div>
        </div>
        {!isFormOpen ? <button type="button" className="admin-primary-button" onClick={openNew}><Plus size={17} /> Nueva actividad</button> : null}
      </header>

      {isFormOpen ? (
        editQuery.isLoading ? (
          <div className="admin-activity-loading"><Loader2 className="animate-spin" /><span>Cargando actividad…</span></div>
        ) : (
          <ActivityEditorWorkspace
            draft={draft}
            onChange={updateDraft}
            configText={configText}
            onConfigTextChange={updateConfigText}
            steps={stepsQuery.data ?? []}
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
          <section className="admin-age-switcher" aria-label="Franja de edad">
            <div><span className="admin-eyebrow">Franja activa</span><strong>Contenido independiente por audiencia</strong></div>
            <div className="admin-age-switcher__options">
              {allowedGroups.map((group) => (
                <button key={group.id} type="button" onClick={() => changeAgeContext(group.id)} className={selectedAge === group.id ? "admin-age-switcher__option--active" : ""}>
                  <span>{group.nombre}</span>
                  <small>{selectedAge === group.id ? "Editando" : "Ver secuencia"}</small>
                </button>
              ))}
            </div>
          </section>

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
                <p>Crea la primera experiencia y asígnala a un momento CRECER.</p>
                <button type="button" className="admin-primary-button" onClick={openNew}><Plus size={17} /> Crear primera actividad</button>
              </div>
            ) : (
              <div className="admin-activity-sequence-list">
                {activities.map((activity, index) => (
                  <ActivitySequenceRow
                    key={activity.id}
                    activity={activity}
                    index={index}
                    total={activities.length}
                    steps={stepsQuery.data ?? []}
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
        </>
      )}
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
