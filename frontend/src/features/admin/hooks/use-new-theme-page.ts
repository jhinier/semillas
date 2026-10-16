import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { crearTema, type CrearTemaSolicitud } from "../admin.api";
import { obtenerGruposEdad, obtenerVersionesBiblicas } from "../../catalog/catalog.api";
import { obtenerSendas } from "../../sendas/sendas.api";

export function useNewThemePage() {
  const navigate = useNavigate();

  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas, staleTime: 1000 * 60 * 60 });
  const ageGroupsQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad, staleTime: 1000 * 60 * 60 });
  const bibleVersionsQuery = useQuery({ queryKey: ["catalog", "bible-versions"], queryFn: obtenerVersionesBiblicas, staleTime: 1000 * 60 * 60 });

  const { register, handleSubmit, control, getValues, setValue } = useForm<CrearTemaSolicitud>({
    defaultValues: {
      titulo: "",
      slug: "",
      senda_id: "",
      grupo_edad_ids: [],
      version_biblica_id: "",
      objetivo: "",
      resumen: "",
      minutos_estimados: 40,
      xp_recompensa: 100
    }
  });

  const [modoGuardado, setModoGuardado] = useState<"borrador" | "crecer">("crecer");
  const slugManualEdit = useRef(false);

  const liveTitle = useWatch({ control, name: "titulo" }) || "";
  const liveSlug = useWatch({ control, name: "slug" }) || "";

  useEffect(() => {
    if (!slugManualEdit.current && liveTitle) {
      const slugGenerado = liveTitle
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 140);
      setValue("slug", slugGenerado);
    }
  }, [liveTitle, setValue]);

  const liveResumen = useWatch({ control, name: "resumen" }) || "Resumen breve del tema que ayudará a los niños a crecer en su fe.";
  const liveDuration = useWatch({ control, name: "minutos_estimados" }) || 40;
  const liveXp = useWatch({ control, name: "xp_recompensa" }) || 100;
  const liveVersionId = useWatch({ control, name: "version_biblica_id" });

  const activeVersion = useMemo(() => {
    if (!liveVersionId) return "RVR1960";
    const found = bibleVersionsQuery.data?.find(v => v.id === liveVersionId);
    return found?.codigo ?? "RVR1960";
  }, [liveVersionId, bibleVersionsQuery.data]);

  const [tagsInput, setTagsInput] = useState("");
  const [tagsList, setTagsList] = useState<string[]>([]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagsInput.trim()) {
      e.preventDefault();
      if (!tagsList.includes(tagsInput.trim())) {
        setTagsList([...tagsList, tagsInput.trim()]);
      }
      setTagsInput("");
    }
  };

  const removeTag = (idx: number) => {
    setTagsList(tagsList.filter((_, i) => i !== idx));
  };

  const [clubVisibilities, setClubVisibilities] = useState({
    todos: false,
    semillitas: true,
    guardianes: true,
    corazones: true,
    jovenes: false
  });

  const checkedClubsCount = useMemo(() => {
    let count = 0;
    if (clubVisibilities.todos) return 4;
    if (clubVisibilities.semillitas) count++;
    if (clubVisibilities.guardianes) count++;
    if (clubVisibilities.corazones) count++;
    if (clubVisibilities.jovenes) count++;
    return count;
  }, [clubVisibilities]);

  const createMutation = useMutation({
    mutationFn: crearTema,
    onSuccess: (tema) => {
      if (modoGuardado === "crecer") {
        navigate({ to: "/admin/temas/$themeId/crecer", params: { themeId: tema.id } });
        return;
      }

      navigate({ to: "/admin/temas" });
    }
  });

  const onSubmitForm = (values: CrearTemaSolicitud) => {
    setModoGuardado("crecer");
    createMutation.mutate({
      ...values,
      minutos_estimados: Number(values.minutos_estimados),
      xp_recompensa: Number(values.xp_recompensa)
    });
  };

  const onSaveDraft = () => {
    setModoGuardado("borrador");
    const values = getValues();
    createMutation.mutate({
      ...values,
      minutos_estimados: Number(values.minutos_estimados),
      xp_recompensa: Number(values.xp_recompensa)
    });
  };

  const isLoading = sendasQuery.isLoading || ageGroupsQuery.isLoading || bibleVersionsQuery.isLoading;

  return {
    sendasQuery,
    ageGroupsQuery,
    bibleVersionsQuery,
    register,
    control,
    liveTitle,
    liveSlug,
    liveResumen,
    liveDuration,
    liveXp,
    activeVersion,
    tagsInput,
    onTagsInputChange: setTagsInput,
    tagsList,
    onAddTag: handleAddTag,
    onRemoveTag: removeTag,
    clubVisibilities,
    onClubVisibilitiesChange: setClubVisibilities,
    onSlugManualEdit: () => { slugManualEdit.current = true; },
    checkedClubsCount,
    createMutation,
    onSubmitForm: handleSubmit(onSubmitForm),
    onSaveDraft,
    isLoading,
    navigate
  };
}
