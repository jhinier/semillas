import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  FileImage,
  FilePenLine,
  Loader2,
  Quote,
  Save,
  Send,
  Settings2,
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

export const Route = createFileRoute("/admin/temas/$themeId/edit")({
  component: ThemeMetadataEditorPage,
});

type EditorTab = "general" | "portada" | "publicacion";

function ThemeMetadataEditorPage() {
  const { themeId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<EditorTab>("general");
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
      grupo_edad_ids: tema.grupos_edad?.map((grupo) => grupo.id) ?? [],
      portada_recurso_id: tema.portada_recurso_id,
      libro_id: versiculoActual?.libro_id ?? referenciaActual?.libro_id ?? 43,
      capitulo: versiculoActual?.capitulo ?? referenciaActual?.capitulo ?? 3,
      versiculo: versiculoActual?.versiculo ?? referenciaActual?.versiculo_inicio ?? 16,
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
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const payload = useMemo<ActualizarTemaSolicitud>(() => {
    const versiculoLimpio = form.versiculo_texto.trim();
    return {
      titulo: form.titulo,
      slug: form.slug,
      senda_id: form.senda_id,
      objetivo: form.objetivo,
      resumen: form.resumen,
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
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: () => actualizarTema(themeId, payload),
    onSuccess: async () => {
      await invalidate();
      setDirty(false);
      toast.success("Tema y versículo general guardados");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar",
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
        metadata.textoAlternativo || `Portada del tema ${form.titulo || tema?.titulo || ""}`,
        metadata.titulo || `Portada - ${form.titulo || tema?.titulo || "Tema"}`,
      );
      await actualizarTema(themeId, { portada_recurso_id: recurso.id });
      return recurso;
    },
    onSuccess: async (recurso) => {
      setForm((current) => ({ ...current, portada_recurso_id: recurso.id }));
      await invalidate();
      toast.success("Portada actualizada");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la portada",
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
      toast.success("Enviado a revisión");
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
      toast.success("¡Tema publicado exitosamente al 100%!");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "No se pudo publicar",
      ),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => duplicarTema(themeId),
    onSuccess: (duplicated) => {
      toast.success("Tema duplicado con CRECER y actividades");
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
    onSuccess: () => {
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
        tema?.portada_recurso?.texto_alternativo || `Portada de ${tema?.titulo ?? "tema"}`,
      titulo: tema?.portada_recurso?.titulo || `Portada - ${tema?.titulo ?? "Tema"}`,
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
  if (!tema || estudioQuery.isError)
    return (
      <div className="admin-dashboard-state">
        <span>
          <FilePenLine />
        </span>
        <h2>No se pudo abrir el editor</h2>
        <p>
          {estudioQuery.error instanceof Error
            ? estudioQuery.error.message
            : "Tema no encontrado"}
        </p>
      </div>
    );

  const coverUrl =
    coverPreviewMedia.src ||
    obtenerIlustracionFallback(form.titulo || tema.titulo);
  const libroNombre = obtenerNombreLibroBiblico(form.libro_id);
  const citaBiblica = `${libroNombre} ${form.capitulo || 1}:${form.versiculo || 1}`;
  const tieneVersiculoEnFormulario = form.versiculo_texto.trim().length >= 5;

  return (
    <div className="admin-theme-studio">
      <header className="admin-theme-library__hero">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="admin-icon-button"
            onClick={() =>
              navigate({
                to: "/admin/temas/$themeId/detalle",
                params: { themeId },
              })
            }
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <span className="admin-eyebrow">Editor de tema</span>
            <h2 className="!text-2xl">{tema.titulo}</h2>
            <p>
              Configura la información general, el versículo bíblico, la portada
              y la publicación del tema.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
            Vista previa
          </button>
          <button
            type="button"
            className="admin-primary-button"
            disabled={!dirty || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Save size={17} />
            )}{" "}
            Guardar cambios
          </button>
        </div>
      </header>

      <nav className="admin-theme-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`admin-theme-tab ${activeTab === "general" ? "admin-theme-tab--active" : ""}`}
        >
          <FilePenLine size={15} /> Información y versículo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("portada")}
          className={`admin-theme-tab ${activeTab === "portada" ? "admin-theme-tab--active" : ""}`}
        >
          <FileImage size={15} /> Portada
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("publicacion")}
          className={`admin-theme-tab ${activeTab === "publicacion" ? "admin-theme-tab--active" : ""}`}
        >
          <ShieldCheck size={15} /> Publicación ({completitud?.porcentaje ?? 0}%)
        </button>
      </nav>

      <div className="admin-editor-shell">
        <main className="admin-editor-main">
          {activeTab === "general" ? (
            <>
              <section className="admin-editor-section">
                <div className="admin-editor-section__header">
                  <div>
                    <h2>Información general</h2>
                    <p>
                      Datos usados por la app, los filtros, el buscador y el
                      paquete offline.
                    </p>
                  </div>
                </div>
                <div className="admin-form-grid">
                  <Field label="Título" wide>
                    <input
                      value={form.titulo}
                      maxLength={120}
                      onChange={(event) =>
                        updateForm("titulo", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Slug">
                    <input
                      value={form.slug}
                      maxLength={140}
                      onChange={(event) =>
                        updateForm("slug", slugify(event.target.value))
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
                  <Field
                    label="Resumen"
                    help="Se muestra en tarjetas y resultados de búsqueda."
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
                    label="Objetivo pedagógico"
                    help="Describe qué debe comprender o aplicar el estudiante."
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
                  <Field label="Versión bíblica">
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
                  <Field label="Duración estimada (min)">
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
                  <Field label="XP por completar">
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
                  <Field label="Franjas disponibles" wide>
                    <div className="grid grid-cols-3 gap-3">
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
                            <small className="mt-1 block text-slate-400">
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
                    <h2>Historia bíblica y versículo general</h2>
                    <p>
                      Requisito indispensable para alcanzar el 100% de
                      completitud editorial y habilitar la publicación del tema.
                    </p>
                  </div>
                </div>
                <div className="admin-form-grid">
                  <Field
                    label="Libro de la Biblia"
                    help="Selecciona de qué libro bíblico se toma la enseñanza."
                  >
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
                    label="¿Qué parte de la historia bíblica se está tomando?"
                    help="Indica el pasaje o episodio bíblico del libro seleccionado (ej. David y Goliat en el valle de Ela, El buen samaritano, etc.)."
                    wide
                  >
                    <input
                      value={form.parte_historia}
                      maxLength={220}
                      placeholder={`Ejemplo: Historia tomada de ${libroNombre} ${form.capitulo} (contexto del pasaje bíblico)`}
                      onChange={(event) =>
                        updateForm("parte_historia", event.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Versículo general del tema"
                    help="Ingresa el texto del versículo general; se mostrará en la parte inferior del tema y completará la validación al 100%."
                    wide
                  >
                    <textarea
                      rows={3}
                      value={form.versiculo_texto}
                      placeholder="Ejemplo: Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito..."
                      onChange={(event) =>
                        updateForm("versiculo_texto", event.target.value)
                      }
                    />
                  </Field>
                </div>
              </section>
            </>
          ) : activeTab === "portada" ? (
            <section className="admin-editor-section">
              <div className="admin-editor-section__header">
                <div>
                  <h2>Portada del tema</h2>
                  <p>
                    La misma imagen se utiliza en la biblioteca, el detalle y el
                    paquete offline.
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
            </section>
          ) : (
            <section className="admin-editor-section">
              <div className="admin-editor-section__header">
                <div>
                  <h2>Flujo de publicación</h2>
                  <p>
                    El backend valida la completitud antes de aceptar una
                    revisión o publicación.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <span className="admin-eyebrow">Estado actual</span>
                  <strong className="mt-3 block text-3xl font-black capitalize text-slate-900">
                    {tema.estado}
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Versión de contenido {tema.version_contenido}. Cada
                    publicación incrementa la versión para las descargas
                    offline.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <span className="admin-eyebrow">Completitud</span>
                  <strong className="mt-3 block text-3xl font-black text-slate-900">
                    {completitud?.porcentaje ?? 0}%
                  </strong>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {completitud?.listo_para_revision
                      ? "Todos los requisitos están al 100%. Ya puedes publicar el tema."
                      : "Completa el versículo general y los criterios pendientes antes de publicar."}
                  </p>
                </div>
              </div>
              <div className="admin-completeness-list mt-5">
                {completitud?.criterios.map((item) => (
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
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="admin-secondary-button"
                  disabled={
                    (!completitud?.listo_para_revision &&
                      !tieneVersiculoEnFormulario) ||
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
                    (!completitud?.listo_para_revision &&
                      !tieneVersiculoEnFormulario) ||
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
            </section>
          )}

          {/* Tarjeta inferior con el Versículo General y Parte de la Historia Bíblica */}
          <section
            aria-label="Versículo general del tema"
            className="mt-5 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/70 p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-violet-800">
                <BookOpen size={14} /> Versículo general del tema · {citaBiblica}
              </span>
              {form.parte_historia.trim() ? (
                <span className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">
                  Historia: {form.parte_historia.trim()}
                </span>
              ) : null}
            </div>
            <blockquote className="mt-3 flex items-start gap-3 text-base font-bold italic leading-relaxed text-slate-800">
              <Quote size={20} className="mt-0.5 shrink-0 text-violet-500" />
              <span>
                {form.versiculo_texto.trim()
                  ? `“${form.versiculo_texto.trim()}”`
                  : "Ingresa el versículo general arriba para alcanzar el 100% de completitud y visualizarlo aquí en la parte inferior."}
              </span>
            </blockquote>
            <p className="mt-2 text-right text-xs font-extrabold uppercase tracking-wider text-violet-700">
              — {citaBiblica}
              {form.parte_historia.trim()
                ? ` · ${form.parte_historia.trim()}`
                : ""}
            </p>
          </section>
        </main>

        <aside className="admin-editor-aside">
          <section className="admin-editor-section">
            <span className="admin-eyebrow">Portada actual</span>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={coverUrl}
                alt={`Portada actual de ${tema.titulo}`}
                className="aspect-video w-full object-cover"
                onError={() => void coverPreviewMedia.handleImageError()}
              />
            </div>
            <button
              type="button"
              className="admin-secondary-button mt-3 w-full"
              onClick={() => setActiveTab("portada")}
            >
              <FileImage size={16} /> Cambiar portada
            </button>
          </section>

          <section className="admin-editor-section">
            <div className="admin-editor-section__header">
              <div>
                <h2>Acciones</h2>
                <p>Operaciones que afectan a todo el tema.</p>
              </div>
            </div>
            <div className="grid gap-2">
              <button
                type="button"
                className="admin-secondary-button w-full"
                onClick={() =>
                  navigate({
                    to: "/admin/temas/$themeId/crecer",
                    params: { themeId },
                  })
                }
              >
                <Settings2 size={17} /> Editor CRECER
              </button>
              <button
                type="button"
                className="admin-secondary-button w-full"
                disabled={duplicateMutation.isPending}
                onClick={() => duplicateMutation.mutate()}
              >
                <Copy size={17} /> Duplicar completo
              </button>
              <button
                type="button"
                className="admin-secondary-button w-full !border-red-200 !text-red-600"
                disabled={archiveMutation.isPending}
                onClick={() => archiveMutation.mutate()}
              >
                <Trash2 size={17} /> Archivar tema
              </button>
            </div>
          </section>

          <section className="admin-editor-section">
            <h2 className="font-black text-slate-800">Guardado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {dirty
                ? "Hay cambios sin guardar."
                : "Los datos están sincronizados con el backend."}
            </p>
            <button
              type="button"
              className="admin-primary-button mt-4 w-full"
              disabled={!dirty || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}{" "}
              Guardar
            </button>
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
      <h2>Cargando editor</h2>
      <p>Preparando información y catálogos.</p>
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
