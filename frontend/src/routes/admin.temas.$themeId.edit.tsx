import { createFileRoute, useBlocker, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  FilePenLine,
  Loader2,
  Quote,
  Save,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  archivarTema,
  actualizarTema,
  despublicarTema,
  duplicarTema,
  enviarTemaRevision,
  formatearDetalleValidacionPublicacion,
  formatearErrorPublicacionApi,
  obtenerEstudioTemaAdmin,
  publicarTema,
  type ActualizarTemaSolicitud,
} from "../features/admin/admin.api";
import {
  ThemeWorkflowStepper,
  type ThemeWorkflowStep,
} from "../features/admin/componentes/temas/theme-workflow-stepper";
import {
  AdminStudioField,
  AvisoSeccionObligatoria,
  claseContenedorSelectorPaso1,
  claseTarjetaSelectorPaso1,
  enfocarCampoPaso1,
  obtenerAccionesPendientesPublicacion,
  validarCamposObligatoriosPaso1,
} from "../features/admin/componentes/temas";
import {
  obtenerGruposEdad,
  obtenerLibrosBiblicosSincrono,
  obtenerNombreLibroBiblico,
  obtenerVersionesBiblicas,
  resolverLibroPorDefectoId,
  useLibrosBiblicos,
} from "../features/catalog/catalog.api";
import {
  obtenerRecursosMultimedia,
  subirArchivo,
  type RecursoMultimedia,
} from "../features/media/media.api";
import {
  obtenerIlustracionFallback,
  useResolvedMediaUrl,
} from "../features/media/use-resolved-media-url";
import { CoverImageUpload } from "../features/admin/componentes/temas/cover-image-upload";
import { obtenerSendas } from "../features/sendas/sendas.api";

type EditorTab = "general" | "portada" | "publicacion";

export const Route = createFileRoute("/admin/temas/$themeId/edit")({
  validateSearch: (search: Record<string, unknown>): { tab?: EditorTab } => {
    const t = search.tab;
    if (t === "general" || t === "portada" || t === "publicacion") {
      return { tab: t };
    }
    return {};
  },
  component: ThemeMetadataEditorPage,
});

const ESTADOS_TEXTO: Record<string, string> = {
  borrador: "Borrador",
  revision: "En revisión",
  aprobado: "Aprobado",
  publicado: "Publicado",
  archivado: "Archivado",
};

function ThemeMetadataEditorPage() {
  const { themeId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const activeTab: EditorTab = search.tab ?? "general";

  const setActiveTab = (nextTab: EditorTab) => {
    navigate({
      to: "/admin/temas/$themeId/edit",
      params: { themeId },
      search: { tab: nextTab },
      replace: true,
    });
  };

  const [form, setForm] = useState({
    titulo: "",
    slug: "",
    senda_id: "",
    senda_ids: [] as string[],
    objetivo: "",
    resumen: "",
    version_biblica_id: "",
    minutos_estimados: 20,
    xp_recompensa: 100,
    grupo_edad_ids: [] as string[],
    portada_recurso_id: null as string | null,
    libro_id: 0,
    capitulo: 3,
    versiculo: 16,
    parte_historia: "",
    versiculo_texto: "",
  });
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  const hydratedTemaSignatureRef = useRef("");

  const estudioQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "studio"],
    queryFn: () => obtenerEstudioTemaAdmin(themeId),
  });
  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas });
  const edadesQuery = useQuery({
    queryKey: ["catalog", "age-groups"],
    queryFn: obtenerGruposEdad,
  });
  const versionesQuery = useQuery({
    queryKey: ["catalog", "bible-versions"],
    queryFn: obtenerVersionesBiblicas,
  });
  const librosQuery = useLibrosBiblicos();
  const libros = librosQuery.data ?? obtenerLibrosBiblicosSincrono();
  const recursosQuery = useQuery({
    queryKey: ["admin", "media"],
    queryFn: obtenerRecursosMultimedia,
  });

  const tema = estudioQuery.data?.tema;
  const completitud = estudioQuery.data?.completitud;

  useBlocker({
    shouldBlockFn: () => {
      if (!dirtyRef.current) return false;
      return !window.confirm(
        "Tienes cambios sin guardar en los datos o franjas del Paso 1. ¿Deseas salir sin guardar?",
      );
    },
    enableBeforeUnload: dirty,
  });

  useEffect(() => {
    if (!tema) return;
    const grupoIdsTema =
      tema.grupos_edad?.map((grupo) =>
        typeof grupo === "string" ? grupo : grupo.id,
      ) ?? [];
    const signature = [
      tema.id,
      tema.actualizado_en ?? "",
      grupoIdsTema.join(","),
      tema.portada_recurso_id ?? "",
      tema.versiculo_clave?.texto ?? "",
      String(tema.versiculo_clave?.libro_id ?? ""),
    ].join("|");
    if (hydratedTemaSignatureRef.current === signature) return;
    if (dirtyRef.current && hydratedTemaSignatureRef.current.startsWith(`${tema.id}|`)) {
      return;
    }

    const versiculoActual = tema.versiculo_clave;
    const referenciaActual = tema.referencia_biblica;
    const sendasIniciales =
      Array.isArray(tema.senda_ids) && tema.senda_ids.length > 0
        ? tema.senda_ids
        : Array.isArray(tema.sendas) && tema.sendas.length > 0
          ? tema.sendas.map((s) => s.id)
          : tema.senda_id
            ? [tema.senda_id]
            : [];
    const libroGuardado = versiculoActual?.libro_id ?? referenciaActual?.libro_id ?? 0;
    hydratedTemaSignatureRef.current = signature;
    setForm({
      titulo: tema.titulo,
      slug: tema.slug,
      senda_id: sendasIniciales[0] ?? tema.senda_id,
      senda_ids: sendasIniciales,
      objetivo: tema.objetivo,
      resumen: tema.resumen ?? "",
      version_biblica_id: tema.version_biblica_id ?? "",
      minutos_estimados: tema.minutos_estimados,
      xp_recompensa: tema.xp_recompensa,
      grupo_edad_ids: grupoIdsTema,
      portada_recurso_id: tema.portada_recurso_id,
      libro_id: libroGuardado || resolverLibroPorDefectoId(librosQuery.data),
      capitulo: versiculoActual?.capitulo ?? referenciaActual?.capitulo ?? 3,
      versiculo:
        versiculoActual?.versiculo ?? referenciaActual?.versiculo_inicio ?? 16,
      parte_historia:
        versiculoActual?.parte_historia ??
        referenciaActual?.parte_historia ??
        "",
      versiculo_texto: versiculoActual?.texto ?? "",
    });
    dirtyRef.current = false;
    setDirty(false);
  }, [tema]);

  // Si el tema no tenía versículo guardado y el catálogo remoto llega después, actualiza al ID real de Juan
  useEffect(() => {
    if (!tema || dirty || !librosQuery.data?.length) return;
    const libroGuardado = tema.versiculo_clave?.libro_id ?? tema.referencia_biblica?.libro_id;
    if (libroGuardado) return;
    const defectoReal = resolverLibroPorDefectoId(librosQuery.data);
    setForm((current) =>
      current.libro_id === defectoReal ? current : { ...current, libro_id: defectoReal },
    );
  }, [tema, dirty, librosQuery.data]);

  const updateForm = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    dirtyRef.current = true;
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "titulo" && typeof value === "string") {
        const auto = slugify(value);
        if (auto) next.slug = auto;
      }
      return next;
    });
    setDirty(true);
  };

  const payload = useMemo<ActualizarTemaSolicitud>(() => {
    const versiculoLimpio = form.versiculo_texto.trim();
    const sendasElegidas = form.senda_ids.length
      ? form.senda_ids
      : form.senda_id
        ? [form.senda_id]
        : [];
    return {
      titulo: form.titulo.trim(),
      slug: form.slug.trim() || slugify(form.titulo) || undefined,
      senda_id: sendasElegidas[0] ?? form.senda_id,
      senda_ids: sendasElegidas.length ? sendasElegidas : undefined,
      objetivo: form.objetivo.trim(),
      resumen: form.resumen.trim(),
      version_biblica_id: form.version_biblica_id,
      minutos_estimados: form.minutos_estimados,
      xp_recompensa: form.xp_recompensa,
      grupo_edad_ids: form.grupo_edad_ids,
      portada_recurso_id: form.portada_recurso_id,
      versiculo_clave: versiculoLimpio
        ? {
            libro_id: Number(form.libro_id) || resolverLibroPorDefectoId(libros),
            capitulo: Math.max(1, Number(form.capitulo) || 1),
            versiculo: Math.max(1, Number(form.versiculo) || 1),
            texto: versiculoLimpio,
            parte_historia: form.parte_historia.trim() || undefined,
          }
        : undefined,
    };
  }, [form, libros]);

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] }),
      queryClient.invalidateQueries({
        queryKey: ["admin", "theme", themeId, "studio"],
      }),
      queryClient.invalidateQueries({ queryKey: ["admin", "themes"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] }),
    ]);
  };

  const aplicarTemaGuardadoEnCache = (updatedTema: Awaited<ReturnType<typeof actualizarTema>> | null | undefined) => {
    if (!updatedTema) return;
    if (Array.isArray(updatedTema.grupos_edad)) {
      queryClient.setQueryData(["admin", "theme", themeId], updatedTema);
      queryClient.setQueryData(
        ["admin", "theme", themeId, "studio"],
        (actual: { tema?: unknown } | undefined) =>
          actual ? { ...actual, tema: { ...(actual.tema as object), ...updatedTema } } : actual,
      );
    }
  };

  const saveMutation = useMutation({
    mutationFn: () => actualizarTema(themeId, payload),
    onSuccess: async (updatedTema) => {
      dirtyRef.current = false;
      setDirty(false);
      hydratedTemaSignatureRef.current = "";
      aplicarTemaGuardadoEnCache(updatedTema);
      await invalidate();
      toast.success("Cambios guardados");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar",
      ),
  });

  const saveAndGoStep2Mutation = useMutation({
    mutationFn: async () => {
      const validacionActual = validarCamposObligatoriosPaso1(form);
      if (!validacionActual.esValido) {
        const primero = validacionActual.pendientes[0];
        if (primero) enfocarCampoPaso1(primero.id);
        throw new Error(
          `Antes de continuar completa: ${validacionActual.pendientes.map((item) => item.mensajeToast).join(", ")}.`,
        );
      }
      if (dirty) {
        return actualizarTema(themeId, payload);
      }
      return null;
    },
    onSuccess: async (updatedTema) => {
      dirtyRef.current = false;
      setDirty(false);
      hydratedTemaSignatureRef.current = "";
      aplicarTemaGuardadoEnCache(updatedTema);
      await invalidate();
      toast.success("Paso 1 guardado");
      setActiveTab("portada");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Revisa los datos antes de continuar",
      ),
  });

  const coverMutation = useMutation({
    mutationFn: async ({
      file,
      metadata,
    }: {
      file: File;
      metadata: { titulo: string; textoAlternativo: string };
    }) => {
      const recurso = await subirArchivo(
        file,
        "imagen",
        metadata.textoAlternativo ||
          `Portada del tema ${form.titulo || tema?.titulo || ""}`,
        metadata.titulo ||
          `Portada - ${form.titulo || tema?.titulo || "Tema"}`,
      );
      await actualizarTema(themeId, { portada_recurso_id: recurso.id });
      return recurso;
    },
    onSuccess: async (recurso) => {
      setForm((current) => ({ ...current, portada_recurso_id: recurso.id }));
      await invalidate();
      toast.success("Portada guardada");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo subir la portada",
      ),
  });

  const selectCoverMutation = useMutation({
    mutationFn: async (recursoId: string | null) =>
      actualizarTema(themeId, { portada_recurso_id: recursoId }),
    onSuccess: async (_, recursoId) => {
      setForm((current) => ({ ...current, portada_recurso_id: recursoId }));
      await invalidate();
      toast.success(recursoId ? "Portada seleccionada" : "Portada quitada");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la portada",
      ),
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (dirty) await actualizarTema(themeId, payload);
      return enviarTemaRevision(themeId);
    },
    onSuccess: async () => {
      dirtyRef.current = false;
      setDirty(false);
      hydratedTemaSignatureRef.current = "";
      await invalidate();
      toast.success("Tema enviado a revisión");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "No se pudo enviar"),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (dirty) await actualizarTema(themeId, payload);
      return publicarTema(themeId);
    },
    onSuccess: async () => {
      dirtyRef.current = false;
      setDirty(false);
      hydratedTemaSignatureRef.current = "";
      await invalidate();
      toast.success(
        tema?.estado === "publicado"
          ? "¡Publicación actualizada!"
          : "¡Tema publicado exitosamente! Ya está visible para los estudiantes.",
      );
    },
    onError: (error) =>
      toast.error(formatearErrorPublicacionApi(error)),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => despublicarTema(themeId),
    onSuccess: async () => {
      await invalidate();
      toast.success("El tema pasó a Borradores");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "No se pudo pasar a borrador",
      ),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => duplicarTema(themeId),
    onSuccess: async (duplicated) => {
      await invalidate();
      toast.success("Copia creada en Borradores");
      navigate({
        to: "/admin/temas/$themeId/detalle",
        params: { themeId: duplicated.id },
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "No se pudo duplicar",
      ),
  });

  const archiveMutation = useMutation({
    mutationFn: () => archivarTema(themeId),
    onSuccess: async () => {
      await invalidate();
      toast.success("Tema archivado");
      navigate({ to: "/admin/temas" });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "No se pudo archivar",
      ),
  });

  const selectedCoverResource = useMemo<RecursoMultimedia | null>(() => {
    const targetId = form.portada_recurso_id ?? tema?.portada_recurso_id ?? null;
    if (!targetId) return null;
    const fromLibrary = recursosQuery.data?.find((item) => item.id === targetId);
    if (fromLibrary) return fromLibrary;
    const nowIso = new Date().toISOString();
    return {
      id: tema?.portada_recurso?.id || targetId,
      tipo: "imagen",
      bucket_almacenamiento: "semillas-media",
      clave_almacenamiento: `portadas/${targetId}`,
      url_publica: tema?.portada_recurso?.url_publica || "",
      texto_alternativo:
        tema?.portada_recurso?.texto_alternativo ||
        `Portada de ${tema?.titulo ?? "tema"}`,
      titulo:
        tema?.portada_recurso?.titulo || `Portada - ${tema?.titulo ?? "Tema"}`,
      tipo_mime: "image/webp",
      tamano_bytes: null,
      ancho_px: null,
      alto_px: null,
      duracion_seg: null,
      creado_por: null,
      activo: true,
      creado_en: nowIso,
      actualizado_en: nowIso,
    };
  }, [form.portada_recurso_id, recursosQuery.data, tema]);

  const coverPreviewMedia = useResolvedMediaUrl({
    resourceId: selectedCoverResource?.id ?? null,
    rawUrl: selectedCoverResource?.url_publica ?? null,
    fallbackHint: form.titulo || tema?.titulo || "tema",
    useFallbackOnError: true,
  });

  if (estudioQuery.isLoading) return <EditorLoading />;
  if (!tema || estudioQuery.isError) {
    return (
      <div className="admin-dashboard-state">
        <span>
          <FilePenLine />
        </span>
        <h2>No se pudo abrir el tema</h2>
        <p>
          {estudioQuery.error instanceof Error
            ? estudioQuery.error.message
            : "Tema no encontrado"}
        </p>
      </div>
    );
  }

  const coverUrl =
    coverPreviewMedia.src ||
    obtenerIlustracionFallback(form.titulo || tema.titulo);
  const libroNombre = obtenerNombreLibroBiblico(form.libro_id, libros);
  const citaBiblica = `${libroNombre} ${form.capitulo || 1}:${form.versiculo || 1}`;
  const currentStep: ThemeWorkflowStep =
    activeTab === "portada" ? 2 : activeTab === "publicacion" ? 5 : 1;
  const hayPortada = Boolean(selectedCoverResource?.id);
  const paso1Validacion = validarCamposObligatoriosPaso1(form);
  const faltaVersiculoOBiblia = paso1Validacion.pendientesVersiculo.length > 0;
  const accionesPendientes = obtenerAccionesPendientesPublicacion(completitud);

  return (
    <div className="admin-theme-studio">
      <header className="admin-theme-library__hero">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            className="admin-icon-button shrink-0"
            aria-label="Volver al resumen del tema"
            onClick={() =>
              navigate({
                to: "/admin/temas/$themeId/detalle",
                params: { themeId },
              })
            }
          >
            <ArrowLeft size={19} />
          </button>
          <div className="min-w-0">
            <span className="admin-eyebrow">
              Paso {currentStep} de 5 · {ESTADOS_TEXTO[tema.estado] ?? tema.estado}
            </span>
            <h2 className="!text-2xl truncate">{tema.titulo}</h2>
            <p>
              {activeTab === "general"
                ? "Revisa la información general y el versículo clave antes de elegir la portada."
                : activeTab === "portada"
                  ? "Elige o sube la imagen principal que verán los estudiantes al abrir este tema."
                  : "Verifica que todos los pasos estén completos para publicar o enviar a revisión."}
            </p>
          </div>
        </div>
      </header>

      <ThemeWorkflowStepper
        currentStep={currentStep}
        themeId={themeId}
        themeEstado={tema.estado}
        completitud={completitud}
      />

      <div className="admin-editor-shell">
        <main className="admin-editor-main">
          {activeTab === "general" ? (
            <>
              <section
                className={`admin-editor-section ${paso1Validacion.pendientesGeneral.length > 0 ? "admin-editor-section--attention" : ""}`}
              >
                <div className="admin-editor-section__header">
                  <div>
                    <h2>Paso 1. Información general</h2>
                    <p>Estos datos ayudan a organizar el tema por senda y grupo de edad.</p>
                  </div>
                  <AvisoSeccionObligatoria
                    cantidadFaltantes={paso1Validacion.pendientesGeneral.length}
                    singular="Falta 1 campo obligatorio"
                    plural="campos obligatorios por completar"
                  />
                </div>
                <div className="admin-form-grid">
                  <AdminStudioField
                    htmlFor="tema-titulo"
                    label="Título del tema"
                    required
                    invalid={paso1Validacion.tituloInvalido}
                    help={
                      paso1Validacion.tituloInvalido
                        ? `Obligatorio: escribe un título de al menos 3 letras (llevas ${paso1Validacion.tituloLargo} de 3).`
                        : undefined
                    }
                    wide
                  >
                    <input
                      id="tema-titulo"
                      value={form.titulo}
                      maxLength={120}
                      onChange={(event) =>
                        updateForm("titulo", event.target.value)
                      }
                      aria-invalid={paso1Validacion.tituloInvalido || undefined}
                    />
                  </AdminStudioField>
                  <AdminStudioField
                    esGrupo
                    label="Sendas a las que pertenece"
                    required
                    invalid={paso1Validacion.sendaInvalida}
                    help={
                      paso1Validacion.sendaInvalida
                        ? "Obligatorio: selecciona al menos una senda."
                        : "Solo define en qué senda espiritual (Padre, Hijo o Espíritu) aparecerá el tema. No define las franjas de CRECER."
                    }
                    wide
                  >
                    <div
                      id="tema-sendas"
                      className={claseContenedorSelectorPaso1(paso1Validacion.sendaInvalida)}
                    >
                      {sendasQuery.data?.map((senda) => {
                        const actualIds = form.senda_ids.length
                          ? form.senda_ids
                          : form.senda_id
                            ? [form.senda_id]
                            : [];
                        const selected = actualIds.includes(senda.id);
                        const isPrimary = actualIds[0] === senda.id;

                        const toggleSenda = () => {
                          const nextIds = selected
                            ? actualIds.filter((id) => id !== senda.id)
                            : [...actualIds, senda.id];
                          dirtyRef.current = true;
                          setForm((current) => ({
                            ...current,
                            senda_ids: nextIds,
                            senda_id: nextIds[0] ?? "",
                          }));
                          setDirty(true);
                        };

                        return (
                          <button
                            key={senda.id}
                            type="button"
                            onClick={toggleSenda}
                            className={claseTarjetaSelectorPaso1(selected, paso1Validacion.sendaInvalida)}
                          >
                            <span className="flex items-center justify-between gap-2 font-bold text-slate-800 dark:text-slate-100">
                              <span className="flex items-center gap-2 min-w-0">
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: senda.color_hex }}
                                  aria-hidden="true"
                                />
                                <span className="truncate">{senda.nombre}</span>
                              </span>
                              {selected ? (
                                <CheckCircle2
                                  size={18}
                                  className="shrink-0 text-violet-600 dark:text-violet-300"
                                />
                              ) : (
                                <CircleIcon />
                              )}
                            </span>
                            <small className="mt-1.5 block text-slate-500 dark:text-slate-300">
                              {selected ? (isPrimary ? "Senda principal" : "Senda adicional") : "Clic para incluir"}
                            </small>
                          </button>
                        );
                      })}
                    </div>
                  </AdminStudioField>
                  <AdminStudioField
                    esGrupo
                    label="Franjas de edad (CRECER y Actividades)"
                    required
                    invalid={paso1Validacion.edadesInvalidas}
                    help={
                      paso1Validacion.edadesInvalidas
                        ? "Obligatorio: elige al menos una franja de edad."
                        : `Seleccionada(s): ${form.grupo_edad_ids.length} ${form.grupo_edad_ids.length === 1 ? "franja" : "franjas"} (${form.grupo_edad_ids.length * 6} momentos en CRECER). Solo las edades marcadas aquí aparecerán en Paso 3 CRECER, Mapa de avance y Paso 4.`
                    }
                    wide
                  >
                    <div
                      id="tema-edades"
                      className={claseContenedorSelectorPaso1(paso1Validacion.edadesInvalidas)}
                    >
                      {edadesQuery.data?.map((grupo) => {
                        const selected = form.grupo_edad_ids.includes(grupo.id);
                        return (
                          <button
                            key={grupo.id}
                            type="button"
                            onClick={() =>
                              updateForm(
                                "grupo_edad_ids",
                                selected
                                  ? form.grupo_edad_ids.filter(
                                      (id) => id !== grupo.id,
                                    )
                                  : [...form.grupo_edad_ids, grupo.id],
                              )
                            }
                            className={claseTarjetaSelectorPaso1(selected, paso1Validacion.edadesInvalidas)}
                          >
                            <span className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100">
                              {grupo.nombre}
                              {selected ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-violet-600 dark:text-violet-300"
                                />
                              ) : (
                                <CircleIcon />
                              )}
                            </span>
                            <small className="mt-1 block text-slate-500 dark:text-slate-300">
                              {grupo.edad_minima}–{grupo.edad_maxima} años · {selected ? "Incluida en CRECER (clic para quitar)" : "No incluida (clic para agregar)"}
                            </small>
                          </button>
                        );
                      })}
                    </div>
                  </AdminStudioField>
                  <AdminStudioField
                    htmlFor="tema-version"
                    label="Versión de la Biblia"
                    required
                    invalid={paso1Validacion.versionBiblicaInvalida}
                    help={
                      paso1Validacion.versionBiblicaInvalida
                        ? "Obligatorio: selecciona una versión de la Biblia."
                        : undefined
                    }
                  >
                    <select
                      id="tema-version"
                      value={form.version_biblica_id}
                      onChange={(event) =>
                        updateForm("version_biblica_id", event.target.value)
                      }
                      aria-invalid={paso1Validacion.versionBiblicaInvalida || undefined}
                    >
                      <option value="">Selecciona una versión</option>
                      {versionesQuery.data?.map((version) => (
                        <option key={version.id} value={version.id}>
                          {version.nombre}
                        </option>
                      ))}
                    </select>
                  </AdminStudioField>
                  <AdminStudioField
                    htmlFor="tema-resumen"
                    label="Resumen breve"
                    required
                    invalid={paso1Validacion.resumenInvalido}
                    help={
                      paso1Validacion.resumenInvalido
                        ? `Obligatorio: escribe al menos 10 letras (llevas ${paso1Validacion.resumenLargo} de 10).`
                        : "Se muestra en la lista de temas y búsquedas."
                    }
                    wide
                  >
                    <textarea
                      id="tema-resumen"
                      rows={3}
                      value={form.resumen}
                      onChange={(event) =>
                        updateForm("resumen", event.target.value)
                      }
                      aria-invalid={paso1Validacion.resumenInvalido || undefined}
                    />
                  </AdminStudioField>
                  <AdminStudioField
                    htmlFor="tema-objetivo"
                    label="Objetivo de aprendizaje"
                    required
                    invalid={paso1Validacion.objetivoInvalido}
                    help={
                      paso1Validacion.objetivoInvalido
                        ? `Obligatorio: explica en al menos 10 letras qué aprenderá el estudiante (llevas ${paso1Validacion.objetivoLargo} de 10).`
                        : "¿Qué aprenderá o aplicará el estudiante?"
                    }
                    wide
                  >
                    <textarea
                      id="tema-objetivo"
                      rows={4}
                      value={form.objetivo}
                      onChange={(event) =>
                        updateForm("objetivo", event.target.value)
                      }
                      aria-invalid={paso1Validacion.objetivoInvalido || undefined}
                    />
                  </AdminStudioField>
                  <AdminStudioField htmlFor="tema-minutos" label="Duración aproximada (min)">
                    <input
                      id="tema-minutos"
                      type="number"
                      min={1}
                      max={120}
                      value={form.minutos_estimados}
                      onChange={(event) =>
                        updateForm(
                          "minutos_estimados",
                          Number(event.target.value),
                        )
                      }
                    />
                  </AdminStudioField>
                  <AdminStudioField htmlFor="tema-xp" label="Puntos (XP) al completar">
                    <input
                      id="tema-xp"
                      type="number"
                      min={0}
                      max={500}
                      value={form.xp_recompensa}
                      onChange={(event) =>
                        updateForm("xp_recompensa", Number(event.target.value))
                      }
                    />
                  </AdminStudioField>
                </div>
              </section>

              <section
                className={`admin-editor-section ${faltaVersiculoOBiblia ? "admin-editor-section--attention" : ""}`}
              >
                <div className="admin-editor-section__header">
                  <div>
                    <h2>Historia bíblica y versículo clave</h2>
                    <p>Selecciona la cita bíblica principal y escribe el versículo del tema.</p>
                  </div>
                  <AvisoSeccionObligatoria
                    cantidadFaltantes={paso1Validacion.pendientesVersiculo.length}
                    singular="Falta completar versículo obligatorio"
                    plural="campos del versículo por completar"
                  />
                </div>
                <div className="admin-form-grid">
                  <AdminStudioField
                    htmlFor="tema-libro"
                    label="Libro de la Biblia"
                    required
                    invalid={paso1Validacion.libroInvalido}
                    help={paso1Validacion.libroInvalido ? "Obligatorio: selecciona un libro." : undefined}
                  >
                    <select
                      id="tema-libro"
                      value={form.libro_id}
                      onChange={(event) =>
                        updateForm("libro_id", Number(event.target.value))
                      }
                      aria-invalid={paso1Validacion.libroInvalido || undefined}
                    >
                      {libros.map((libro) => (
                        <option key={libro.id} value={libro.id}>
                          {libro.nombre} ({libro.testamento})
                        </option>
                      ))}
                    </select>
                  </AdminStudioField>
                  <div className="grid grid-cols-2 gap-3">
                    <AdminStudioField
                      htmlFor="tema-capitulo"
                      label="Capítulo"
                      required
                      invalid={paso1Validacion.capituloInvalido}
                      help={paso1Validacion.capituloInvalido ? "Obligatorio (1–150)" : undefined}
                    >
                      <input
                        id="tema-capitulo"
                        type="number"
                        min={1}
                        max={150}
                        value={form.capitulo > 0 ? form.capitulo : ""}
                        onChange={(event) =>
                          updateForm(
                            "capitulo",
                            event.target.value === "" ? 0 : Number(event.target.value),
                          )
                        }
                        aria-invalid={paso1Validacion.capituloInvalido || undefined}
                      />
                    </AdminStudioField>
                    <AdminStudioField
                      htmlFor="tema-versiculo"
                      label="Versículo"
                      required
                      invalid={paso1Validacion.versiculoNumInvalido}
                      help={paso1Validacion.versiculoNumInvalido ? "Obligatorio (1–176)" : undefined}
                    >
                      <input
                        id="tema-versiculo"
                        type="number"
                        min={1}
                        max={176}
                        value={form.versiculo > 0 ? form.versiculo : ""}
                        onChange={(event) =>
                          updateForm(
                            "versiculo",
                            event.target.value === "" ? 0 : Number(event.target.value),
                          )
                        }
                        aria-invalid={paso1Validacion.versiculoNumInvalido || undefined}
                      />
                    </AdminStudioField>
                  </div>
                  <AdminStudioField
                    htmlFor="tema-parte-historia"
                    label="Escena o historia bíblica (opcional)"
                    wide
                  >
                    <input
                      id="tema-parte-historia"
                      value={form.parte_historia}
                      maxLength={220}
                      placeholder={`Ejemplo: Historia de ${libroNombre} ${form.capitulo || 1}`}
                      onChange={(event) =>
                        updateForm("parte_historia", event.target.value)
                      }
                    />
                  </AdminStudioField>
                  <AdminStudioField
                    htmlFor="tema-versiculo-texto"
                    label="Texto completo del versículo clave"
                    required
                    invalid={paso1Validacion.versiculoTextoInvalido}
                    help={
                      paso1Validacion.versiculoTextoInvalido
                        ? `Obligatorio: escribe el texto del versículo (mínimo 3 letras, llevas ${paso1Validacion.versiculoTextoLargo} de 3).`
                        : "Se mostrará al estudiante al iniciar y completar el tema."
                    }
                    wide
                  >
                    <textarea
                      id="tema-versiculo-texto"
                      rows={3}
                      value={form.versiculo_texto}
                      placeholder="Escribe aquí el texto del versículo..."
                      onChange={(event) =>
                        updateForm("versiculo_texto", event.target.value)
                      }
                      aria-invalid={paso1Validacion.versiculoTextoInvalido || undefined}
                    />
                  </AdminStudioField>
                </div>

                <div className="admin-step-footer-bar">
                  <button
                    type="button"
                    className="admin-secondary-button"
                    disabled={!dirty || saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    className="admin-primary-button"
                    disabled={saveAndGoStep2Mutation.isPending}
                    onClick={() => saveAndGoStep2Mutation.mutate()}
                  >
                    {saveAndGoStep2Mutation.isPending ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : null}
                    Guardar y continuar al Paso 2: Portada{" "}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            </>
          ) : activeTab === "portada" ? (
            <section className="admin-editor-section">
              <div className="admin-editor-section__header">
                <div>
                  <h2>Paso 2. Portada del tema</h2>
                  <p>
                    Elige una imagen de la galería o sube una nueva para este tema.
                  </p>
                </div>
              </div>
              <CoverImageUpload
                themeTitle={form.titulo.trim() || tema.titulo}
                cover={selectedCoverResource}
                resources={recursosQuery.data ?? []}
                isUploading={
                  coverMutation.isPending || selectCoverMutation.isPending
                }
                onSelect={(resource) => selectCoverMutation.mutate(resource.id)}
                onRemove={() => selectCoverMutation.mutate(null)}
                onUpload={async (file, metadata) =>
                  coverMutation.mutateAsync({ file, metadata })
                }
              />

              <div className="admin-step-footer-bar">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setActiveTab("general")}
                >
                  <ArrowLeft size={16} /> Paso anterior: Datos y versículo
                </button>
                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={() => {
                    if (!hayPortada) {
                      toast.error(
                        "Selecciona o sube una imagen de portada antes de continuar al Paso 3.",
                      );
                      return;
                    }
                    navigate({
                      to: "/admin/temas/$themeId/crecer",
                      params: { themeId },
                    });
                  }}
                >
                  Continuar al Paso 3: Enseñanza CRECER{" "}
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>
          ) : (
            <section className="admin-editor-section">
              <div className="admin-editor-section__header">
                <div>
                  <h2>Paso 5. Revisar y publicar</h2>
                  <p>
                    Confirma que los cinco pasos están completos y elige publicar ahora o enviar a revisión.
                  </p>
                </div>
              </div>

              {tema.estado === "publicado" ? (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-950 dark:border-emerald-500/35 dark:bg-emerald-950/35 dark:text-emerald-100">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <strong className="block text-sm font-extrabold">
                        Este tema ya está publicado
                      </strong>
                      <p className="mt-0.5 text-xs opacity-90">
                        Los estudiantes ya pueden verlo y estudiar su contenido
                        {tema.publicado_en
                          ? ` desde el ${new Date(tema.publicado_en).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}.`
                          : "."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-secondary-button !py-2 !px-3 text-xs"
                    disabled={unpublishMutation.isPending}
                    onClick={() => unpublishMutation.mutate()}
                  >
                    <FilePenLine size={15} /> {unpublishMutation.isPending ? "Cambiando..." : "Pasar a borrador"}
                  </button>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <span className="admin-eyebrow">Estado actual</span>
                  <strong className="mt-3 block text-3xl font-black text-slate-900">
                    {ESTADOS_TEXTO[tema.estado] ?? tema.estado}
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {tema.estado === "publicado"
                      ? "Los estudiantes ya pueden ver y estudiar este tema."
                      : "Mientras esté en borrador solo es visible en este panel."}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <span className="admin-eyebrow">Avance total</span>
                  <strong className="mt-3 block text-3xl font-black text-slate-900">
                    {completitud?.porcentaje ?? 0}%
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {completitud?.listo_para_revision
                      ? "Todos los requisitos están completos. ¡Ya puedes publicar!"
                      : "Completa los puntos pendientes antes de publicar."}
                  </p>
                </div>
              </div>

              <div className="admin-completeness-list mt-5">
                {(completitud?.criterios ?? []).map((item) => {
                  const detalle = item.codigo === "publicacion"
                    ? formatearDetalleValidacionPublicacion(item.detalle)
                    : item.detalle;
                  return (
                    <div
                      key={item.codigo}
                      className={`admin-completeness-item ${item.completo ? "admin-completeness-item--complete" : ""}`}
                    >
                      <span>
                        {item.etiqueta}
                        {detalle ? ` · ${detalle}` : ""}
                      </span>
                      {item.completo ? <Check size={16} /> : <span>Pendiente</span>}
                    </div>
                  );
                })}
              </div>

              {completitud?.franjas_detalle?.length ? (
                <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="block text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      Estado por franja de edad
                    </strong>
                    <button
                      type="button"
                      className="text-xs font-bold text-violet-600 hover:underline dark:text-violet-300"
                      onClick={() => setActiveTab("general")}
                    >
                      Cambiar franjas en Paso 1 →
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Solo se verifican las franjas elegidas en el Paso 1 (6 momentos CRECER y al menos 1 actividad para publicar).
                  </p>
                  <div
                    className={`mt-3 grid grid-cols-1 gap-3 ${
                      completitud.franjas_detalle.length === 1
                        ? "sm:grid-cols-1"
                        : completitud.franjas_detalle.length === 2
                          ? "sm:grid-cols-2"
                          : "sm:grid-cols-3"
                    }`}
                  >
                    {completitud.franjas_detalle.map((franja) => (
                      <div
                        key={franja.grupo_edad_id}
                        className={`rounded-xl border p-3.5 text-xs ${
                          franja.momentos_completos >= franja.momentos_total
                            ? "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/35 dark:text-emerald-100"
                            : "border-slate-200 bg-slate-50/70 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                        }`}
                      >
                        <strong className="block font-extrabold">{franja.nombre}</strong>
                        <span className="mt-0.5 block opacity-85">
                          {franja.momentos_completos}/{franja.momentos_total} momentos · {franja.actividades} act.
                        </span>
                        <small className="mt-1 block font-bold">
                          {tema.estado === "publicado" && franja.lista_para_publicar
                            ? "Publicada y activa"
                            : franja.lista_para_publicar
                              ? "Lista para publicar"
                              : franja.momentos_completos >= franja.momentos_total
                                ? "Solo falta 1 actividad"
                                : franja.incluida === false && franja.momentos_completos === 0
                                  ? "Disponible (sin contenido aún)"
                                  : "En construcción"}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {tema.estado !== "publicado" && !completitud?.listo_para_revision ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/35 dark:text-amber-100">
                  <strong className="block text-sm font-extrabold">
                    ¿Por qué todavía no se habilita “Publicar ahora”?
                  </strong>
                  <ul className="mt-2 list-disc space-y-1 pl-5 opacity-95">
                    {(completitud?.criterios ?? [])
                      .filter((c) => !c.completo)
                      .map((c) => {
                        const detalle = c.codigo === "publicacion"
                          ? formatearDetalleValidacionPublicacion(c.detalle)
                          : c.detalle;
                        return (
                          <li key={c.codigo}>
                            <strong>{c.etiqueta}</strong>
                            {detalle ? `: ${detalle}` : " pendiente"}
                          </li>
                        );
                      })}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {accionesPendientes.map((accion) => (
                      <button
                        key={accion.paso}
                        type="button"
                        className="admin-secondary-button !py-1.5 !px-3 text-xs"
                        onClick={() => {
                          if (accion.paso === 1) {
                            setActiveTab("general");
                            return;
                          }
                          if (accion.paso === 2) {
                            setActiveTab("portada");
                            return;
                          }
                          if (accion.paso === 3) {
                            navigate({
                              to: "/admin/temas/$themeId/crecer",
                              params: { themeId },
                            });
                            return;
                          }
                          navigate({
                            to: "/admin/temas/$themeId/activities",
                            params: { themeId },
                          });
                        }}
                      >
                        {accion.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="admin-step-footer-bar">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                      navigate({
                        to: "/admin/temas/$themeId/activities",
                        params: { themeId },
                      })
                    }
                  >
                    <ArrowLeft size={16} /> Paso anterior: Actividades
                  </button>
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                      navigate({
                        to: "/admin/temas/$themeId/preview",
                        params: { themeId },
                      })
                    }
                  >
                    <Eye size={16} /> Ver como estudiante
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {tema.estado !== "publicado" ? (
                    <button
                      type="button"
                      className="admin-secondary-button"
                      disabled={
                        !completitud?.listo_para_revision ||
                        reviewMutation.isPending ||
                        tema.estado === "revision"
                      }
                      onClick={() => reviewMutation.mutate()}
                    >
                      <Send size={17} /> Enviar a revisión
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-secondary-button"
                      disabled={unpublishMutation.isPending}
                      onClick={() => unpublishMutation.mutate()}
                    >
                      <FilePenLine size={16} /> Pasar a borrador
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-primary-button"
                    disabled={
                      (!completitud?.listo_para_revision && tema.estado !== "publicado") ||
                      publishMutation.isPending
                    }
                    onClick={() => publishMutation.mutate()}
                  >
                    {publishMutation.isPending ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <ShieldCheck size={17} />
                    )}{" "}
                    {tema.estado === "publicado"
                      ? dirty
                        ? "Guardar y actualizar publicación"
                        : "Ya publicado"
                      : "Publicar ahora"}
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>

        <aside className="admin-editor-aside">
          <section className="admin-editor-section">
            <span className="admin-eyebrow">Vista rápida del tema</span>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={coverUrl}
                alt={`Portada actual de ${tema.titulo}`}
                className="aspect-video w-full object-cover"
                onError={() => void coverPreviewMedia.handleImageError()}
              />
            </div>
            <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-violet-800">
                <BookOpen size={13} /> {citaBiblica}
              </span>
              <blockquote className="mt-2 flex items-start gap-2 text-xs italic leading-relaxed text-slate-700">
                <Quote size={14} className="mt-0.5 shrink-0 text-violet-500" />
                <span>
                  {form.versiculo_texto.trim()
                    ? `“${form.versiculo_texto.trim()}”`
                    : "El versículo clave se mostrará aquí."}
                </span>
              </blockquote>
            </div>
          </section>

          <section className="admin-editor-section">
            <span className="admin-eyebrow">Otras opciones</span>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Acciones adicionales sobre todo el tema.
            </p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                className="admin-secondary-button w-full"
                disabled={duplicateMutation.isPending}
                onClick={() => duplicateMutation.mutate()}
              >
                <Copy size={16} /> Crear una copia en Borradores
              </button>
              <button
                type="button"
                className="admin-secondary-button w-full !border-red-200 !text-red-600"
                disabled={archiveMutation.isPending}
                onClick={() => archiveMutation.mutate()}
              >
                <Trash2 size={16} /> Archivar tema
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function EditorLoading() {
  return (
    <div className="admin-dashboard-state">
      <span>
        <Loader2 className="animate-spin" />
      </span>
      <h2>Cargando paso del tema</h2>
      <p>Preparando datos y catálogos.</p>
    </div>
  );
}

function CircleIcon() {
  return <span className="h-4 w-4 rounded-full border-2 border-slate-300" />;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
