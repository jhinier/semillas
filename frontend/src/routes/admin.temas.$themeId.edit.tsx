import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  archivarTema,
  actualizarTema,
  duplicarTema,
  enviarTemaRevision,
  obtenerEstudioTemaAdmin,
  publicarTema,
  type ActualizarTemaSolicitud,
} from "../features/admin/admin.api";
import {
  ThemeWorkflowStepper,
  type ThemeWorkflowStep,
} from "../features/admin/componentes/temas/theme-workflow-stepper";
import {
  LIBROS_BIBLICOS_CATALOGO,
  obtenerGruposEdad,
  obtenerNombreLibroBiblico,
  obtenerVersionesBiblicas,
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
    objetivo: "",
    resumen: "",
    version_biblica_id: "",
    minutos_estimados: 20,
    xp_recompensa: 100,
    grupo_edad_ids: [] as string[],
    portada_recurso_id: null as string | null,
    libro_id: 43,
    capitulo: 3,
    versiculo: 16,
    parte_historia: "",
    versiculo_texto: "",
  });
  const [dirty, setDirty] = useState(false);

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
  const recursosQuery = useQuery({
    queryKey: ["admin", "media"],
    queryFn: obtenerRecursosMultimedia,
  });

  const tema = estudioQuery.data?.tema;
  const completitud = estudioQuery.data?.completitud;

  useEffect(() => {
    if (!tema) return;
    const versiculoActual = tema.versiculo_clave;
    const referenciaActual = tema.referencia_biblica;
    setForm({
      titulo: tema.titulo,
      slug: tema.slug,
      senda_id: tema.senda_id,
      objetivo: tema.objetivo,
      resumen: tema.resumen ?? "",
      version_biblica_id: tema.version_biblica_id ?? "",
      minutos_estimados: tema.minutos_estimados,
      xp_recompensa: tema.xp_recompensa,
      grupo_edad_ids:
        tema.grupos_edad?.map((grupo) =>
          typeof grupo === "string" ? grupo : grupo.id,
        ) ?? [],
      portada_recurso_id: tema.portada_recurso_id,
      libro_id: versiculoActual?.libro_id ?? referenciaActual?.libro_id ?? 43,
      capitulo: versiculoActual?.capitulo ?? referenciaActual?.capitulo ?? 3,
      versiculo:
        versiculoActual?.versiculo ?? referenciaActual?.versiculo_inicio ?? 16,
      parte_historia:
        versiculoActual?.parte_historia ??
        referenciaActual?.parte_historia ??
        "",
      versiculo_texto: versiculoActual?.texto ?? "",
    });
    setDirty(false);
  }, [tema]);

  const updateForm = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
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
    return {
      titulo: form.titulo.trim(),
      slug: form.slug.trim() || slugify(form.titulo) || undefined,
      senda_id: form.senda_id,
      objetivo: form.objetivo.trim(),
      resumen: form.resumen.trim(),
      version_biblica_id: form.version_biblica_id,
      minutos_estimados: form.minutos_estimados,
      xp_recompensa: form.xp_recompensa,
      grupo_edad_ids: form.grupo_edad_ids,
      portada_recurso_id: form.portada_recurso_id,
      versiculo_clave: versiculoLimpio
        ? {
            libro_id: Number(form.libro_id) || 43,
            capitulo: Math.max(1, Number(form.capitulo) || 1),
            versiculo: Math.max(1, Number(form.versiculo) || 1),
            texto: versiculoLimpio,
            parte_historia: form.parte_historia.trim() || undefined,
          }
        : undefined,
    };
  }, [form]);

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

  const saveMutation = useMutation({
    mutationFn: () => actualizarTema(themeId, payload),
    onSuccess: async () => {
      await invalidate();
      setDirty(false);
      toast.success("Cambios guardados");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar",
      ),
  });

  const saveAndGoStep2Mutation = useMutation({
    mutationFn: async () => {
      if (form.titulo.trim().length < 3) {
        throw new Error("Escribe un título de al menos 3 letras.");
      }
      if (!form.grupo_edad_ids.length) {
        throw new Error("Selecciona al menos una edad destinataria.");
      }
      if (dirty) {
        await actualizarTema(themeId, payload);
      }
    },
    onSuccess: async () => {
      await invalidate();
      setDirty(false);
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
      await invalidate();
      setDirty(false);
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
      await invalidate();
      setDirty(false);
      toast.success("¡Tema publicado exitosamente!");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "No se pudo publicar",
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
  const libroNombre = obtenerNombreLibroBiblico(form.libro_id);
  const citaBiblica = `${libroNombre} ${form.capitulo || 1}:${form.versiculo || 1}`;
  const currentStep: ThemeWorkflowStep =
    activeTab === "portada" ? 2 : activeTab === "publicacion" ? 5 : 1;
  const hayPortada = Boolean(selectedCoverResource?.id);

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
              <section className="admin-editor-section">
                <div className="admin-editor-section__header">
                  <div>
                    <h2>Paso 1. Información general</h2>
                    <p>Estos datos ayudan a organizar el tema por senda y grupo de edad.</p>
                  </div>
                </div>
                <div className="admin-form-grid">
                  <Field label="Título del tema" wide>
                    <input
                      value={form.titulo}
                      maxLength={120}
                      onChange={(event) =>
                        updateForm("titulo", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Senda">
                    <select
                      value={form.senda_id}
                      onChange={(event) =>
                        updateForm("senda_id", event.target.value)
                      }
                    >
                      {sendasQuery.data?.map((senda) => (
                        <option key={senda.id} value={senda.id}>
                          {senda.nombre}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Versión de la Biblia">
                    <select
                      value={form.version_biblica_id}
                      onChange={(event) =>
                        updateForm("version_biblica_id", event.target.value)
                      }
                    >
                      {versionesQuery.data?.map((version) => (
                        <option key={version.id} value={version.id}>
                          {version.nombre}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Resumen breve"
                    help="Se muestra en la lista de temas y búsquedas."
                    wide
                  >
                    <textarea
                      rows={3}
                      value={form.resumen}
                      onChange={(event) =>
                        updateForm("resumen", event.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Objetivo de aprendizaje"
                    help="¿Qué aprenderá o aplicará el estudiante?"
                    wide
                  >
                    <textarea
                      rows={4}
                      value={form.objetivo}
                      onChange={(event) =>
                        updateForm("objetivo", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Duración aproximada (min)">
                    <input
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
                  </Field>
                  <Field label="Puntos (XP) al completar">
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={form.xp_recompensa}
                      onChange={(event) =>
                        updateForm("xp_recompensa", Number(event.target.value))
                      }
                    />
                  </Field>
                  <Field label="Edades destinatarias" wide>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                            className={`rounded-2xl border p-4 text-left ${selected ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"}`}
                          >
                            <span className="flex items-center justify-between font-bold text-slate-800">
                              {grupo.nombre}
                              {selected ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-violet-600"
                                />
                              ) : (
                                <CircleIcon />
                              )}
                            </span>
                            <small className="mt-1 block text-slate-500">
                              {grupo.edad_minima}–{grupo.edad_maxima} años
                            </small>
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              </section>

              <section className="admin-editor-section">
                <div className="admin-editor-section__header">
                  <div>
                    <h2>Historia bíblica y versículo clave</h2>
                    <p>Selecciona la cita bíblica principal del tema.</p>
                  </div>
                </div>
                <div className="admin-form-grid">
                  <Field label="Libro de la Biblia">
                    <select
                      value={form.libro_id}
                      onChange={(event) =>
                        updateForm("libro_id", Number(event.target.value))
                      }
                    >
                      {LIBROS_BIBLICOS_CATALOGO.map((libro) => (
                        <option key={libro.id} value={libro.id}>
                          {libro.nombre} ({libro.testamento})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Capítulo">
                      <input
                        type="number"
                        min={1}
                        max={150}
                        value={form.capitulo}
                        onChange={(event) =>
                          updateForm(
                            "capitulo",
                            Math.max(1, Number(event.target.value) || 1),
                          )
                        }
                      />
                    </Field>
                    <Field label="Versículo">
                      <input
                        type="number"
                        min={1}
                        max={176}
                        value={form.versiculo}
                        onChange={(event) =>
                          updateForm(
                            "versiculo",
                            Math.max(1, Number(event.target.value) || 1),
                          )
                        }
                      />
                    </Field>
                  </div>
                  <Field
                    label="Escena o historia bíblica (opcional)"
                    wide
                  >
                    <input
                      value={form.parte_historia}
                      maxLength={220}
                      placeholder={`Ejemplo: Historia de ${libroNombre} ${form.capitulo}`}
                      onChange={(event) =>
                        updateForm("parte_historia", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Texto completo del versículo clave" wide>
                    <textarea
                      rows={3}
                      value={form.versiculo_texto}
                      placeholder="Escribe aquí el texto del versículo..."
                      onChange={(event) =>
                        updateForm("versiculo_texto", event.target.value)
                      }
                    />
                  </Field>
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
                {(completitud?.criterios ?? []).map((item) => (
                  <div
                    key={item.codigo}
                    className={`admin-completeness-item ${item.completo ? "admin-completeness-item--complete" : ""}`}
                  >
                    <span>
                      {item.etiqueta}
                      {item.detalle ? ` · ${item.detalle}` : ""}
                    </span>
                    {item.completo ? <Check size={16} /> : <span>Pendiente</span>}
                  </div>
                ))}
              </div>

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

                <div className="flex flex-wrap gap-2">
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
                  <button
                    type="button"
                    className="admin-primary-button"
                    disabled={
                      !completitud?.listo_para_revision ||
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
                      ? "Actualizar publicación"
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

function Field({
  label,
  help,
  wide,
  children,
}: {
  label: string;
  help?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`admin-field ${wide ? "admin-field--wide" : ""}`}>
      <span>{label}</span>
      {children}
      {help ? <small>{help}</small> : null}
    </label>
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
