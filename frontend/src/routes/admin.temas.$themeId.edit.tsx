import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  FileImage,
  FilePenLine,
  Loader2,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { obtenerGruposEdad, obtenerVersionesBiblicas } from "../features/catalog/catalog.api";
import { subirArchivo } from "../features/media/media.api";
import { obtenerSendas } from "../features/sendas/sendas.api";

export const Route = createFileRoute("/admin/temas/$themeId/edit")({ component: ThemeMetadataEditorPage });

type EditorTab = "general" | "portada" | "publicacion";

function ThemeMetadataEditorPage() {
  const { themeId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>("general");
  const [form, setForm] = useState({
    titulo: "", slug: "", senda_id: "", objetivo: "", resumen: "", version_biblica_id: "",
    minutos_estimados: 20, xp_recompensa: 100, grupo_edad_ids: [] as string[], portada_recurso_id: null as string | null,
  });
  const [dirty, setDirty] = useState(false);

  const estudioQuery = useQuery({ queryKey: ["admin", "theme", themeId, "studio"], queryFn: () => obtenerEstudioTemaAdmin(themeId) });
  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas });
  const edadesQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad });
  const versionesQuery = useQuery({ queryKey: ["catalog", "bible-versions"], queryFn: obtenerVersionesBiblicas });

  const tema = estudioQuery.data?.tema;
  const completitud = estudioQuery.data?.completitud;
  useEffect(() => {
    if (!tema) return;
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
    });
    setDirty(false);
  }, [tema]);

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => { setForm((current) => ({ ...current, [key]: value })); setDirty(true); };
  const payload = useMemo<ActualizarTemaSolicitud>(() => ({ ...form }), [form]);
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "themes"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: () => actualizarTema(themeId, payload),
    onSuccess: async () => { await invalidate(); setDirty(false); toast.success("Tema guardado"); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo guardar"),
  });
  const coverMutation = useMutation({
    mutationFn: async (file: File | null) => {
      if (!file) return actualizarTema(themeId, { portada_recurso_id: null });
      const recurso = await subirArchivo(file, "imagen", `Portada del tema ${form.titulo}`);
      return actualizarTema(themeId, { portada_recurso_id: recurso.id });
    },
    onSuccess: async () => { await invalidate(); toast.success("Portada actualizada"); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo actualizar la portada"),
  });
  const reviewMutation = useMutation({ mutationFn: () => enviarTemaRevision(themeId), onSuccess: async () => { await invalidate(); toast.success("Enviado a revisión"); }, onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo enviar") });
  const publishMutation = useMutation({ mutationFn: () => publicarTema(themeId), onSuccess: async () => { await invalidate(); toast.success("Tema publicado"); }, onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo publicar") });
  const duplicateMutation = useMutation({ mutationFn: () => duplicarTema(themeId), onSuccess: (duplicated) => { toast.success("Tema duplicado con CRECER y actividades"); navigate({ to: "/admin/temas/$themeId/detalle", params: { themeId: duplicated.id } }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo duplicar") });
  const archiveMutation = useMutation({ mutationFn: () => archivarTema(themeId), onSuccess: () => { toast.success("Tema archivado"); navigate({ to: "/admin/temas" }); }, onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo archivar") });

  if (estudioQuery.isLoading) return <EditorLoading />;
  if (!tema || estudioQuery.isError) return <div className="admin-dashboard-state"><span><FilePenLine /></span><h2>No se pudo abrir el editor</h2><p>{estudioQuery.error instanceof Error ? estudioQuery.error.message : "Tema no encontrado"}</p></div>;

  const cover = tema.portada_recurso?.url_publica || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(tema.titulo)}`;

  return (
    <div className="admin-theme-studio">
      <header className="admin-theme-library__hero">
        <div className="flex items-center gap-4">
          <button type="button" className="admin-icon-button" onClick={() => navigate({ to: "/admin/temas/$themeId/detalle", params: { themeId } })}><ArrowLeft size={19} /></button>
          <div><span className="admin-eyebrow">Editor de tema</span><h2 className="!text-2xl">{tema.titulo}</h2><p>Solo aparecen campos persistidos realmente en PostgreSQL.</p></div>
        </div>
        <div className="flex gap-2"><button type="button" className="admin-secondary-button" onClick={() => navigate({ to: "/admin/temas/$themeId/preview", params: { themeId } })}>Vista previa</button><button type="button" className="admin-primary-button" disabled={!dirty || saveMutation.isPending} onClick={() => saveMutation.mutate()}>{saveMutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Guardar cambios</button></div>
      </header>

      <nav className="admin-theme-tabs">
        <button type="button" onClick={() => setActiveTab("general")} className={`admin-theme-tab ${activeTab === "general" ? "admin-theme-tab--active" : ""}`}><FilePenLine size={15} /> Información</button>
        <button type="button" onClick={() => setActiveTab("portada")} className={`admin-theme-tab ${activeTab === "portada" ? "admin-theme-tab--active" : ""}`}><FileImage size={15} /> Portada</button>
        <button type="button" onClick={() => setActiveTab("publicacion")} className={`admin-theme-tab ${activeTab === "publicacion" ? "admin-theme-tab--active" : ""}`}><ShieldCheck size={15} /> Publicación</button>
      </nav>

      <div className="admin-editor-shell">
        <main className="admin-editor-main">
          {activeTab === "general" ? (
            <section className="admin-editor-section">
              <div className="admin-editor-section__header"><div><h2>Información general</h2><p>Datos usados por la app, los filtros, el buscador y el paquete offline.</p></div></div>
              <div className="admin-form-grid">
                <Field label="Título" wide><input value={form.titulo} maxLength={120} onChange={(event) => updateForm("titulo", event.target.value)} /></Field>
                <Field label="Slug"><input value={form.slug} maxLength={140} onChange={(event) => updateForm("slug", slugify(event.target.value))} /></Field>
                <Field label="Senda"><select value={form.senda_id} onChange={(event) => updateForm("senda_id", event.target.value)}>{sendasQuery.data?.map((senda) => <option key={senda.id} value={senda.id}>{senda.nombre}</option>)}</select></Field>
                <Field label="Resumen" help="Se muestra en tarjetas y resultados de búsqueda." wide><textarea rows={3} value={form.resumen} onChange={(event) => updateForm("resumen", event.target.value)} /></Field>
                <Field label="Objetivo pedagógico" help="Describe qué debe comprender o aplicar el estudiante." wide><textarea rows={5} value={form.objetivo} onChange={(event) => updateForm("objetivo", event.target.value)} /></Field>
                <Field label="Versión bíblica"><select value={form.version_biblica_id} onChange={(event) => updateForm("version_biblica_id", event.target.value)}>{versionesQuery.data?.map((version) => <option key={version.id} value={version.id}>{version.nombre}</option>)}</select></Field>
                <Field label="Duración estimada"><input type="number" min={1} max={120} value={form.minutos_estimados} onChange={(event) => updateForm("minutos_estimados", Number(event.target.value))} /></Field>
                <Field label="XP por completar"><input type="number" min={0} max={500} value={form.xp_recompensa} onChange={(event) => updateForm("xp_recompensa", Number(event.target.value))} /></Field>
                <Field label="Franjas disponibles" wide><div className="grid grid-cols-3 gap-3">{edadesQuery.data?.map((grupo) => { const selected = form.grupo_edad_ids.includes(grupo.id); return <button key={grupo.id} type="button" onClick={() => updateForm("grupo_edad_ids", selected ? form.grupo_edad_ids.filter((id) => id !== grupo.id) : [...form.grupo_edad_ids, grupo.id])} className={`rounded-2xl border p-4 text-left ${selected ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"}`}><span className="flex items-center justify-between font-bold text-slate-800">{grupo.nombre}{selected ? <CheckCircle2 size={18} className="text-violet-600" /> : <CircleIcon />}</span><small className="mt-1 block text-slate-400">{grupo.edad_minima}–{grupo.edad_maxima} años</small></button>; })}</div></Field>
              </div>
            </section>
          ) : activeTab === "portada" ? (
            <section className="admin-editor-section">
              <div className="admin-editor-section__header"><div><h2>Portada del tema</h2><p>La misma imagen se utiliza en la biblioteca, el detalle y el paquete offline.</p></div></div>
              <input ref={fileInput} className="hidden" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => coverMutation.mutate(event.target.files?.[0] ?? null)} />
              <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-6">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100"><img src={cover} alt={`Portada actual de ${tema.titulo}`} className="aspect-[16/9] w-full object-cover" /></div>
                <div className="flex flex-col justify-center gap-3"><button type="button" className="admin-primary-button" disabled={coverMutation.isPending} onClick={() => fileInput.current?.click()}><Upload size={17} /> Subir nueva portada</button><button type="button" className="admin-secondary-button" disabled={!tema.portada_recurso_id || coverMutation.isPending} onClick={() => coverMutation.mutate(null)}><Trash2 size={17} /> Quitar portada</button><p className="text-xs leading-6 text-slate-500">Recomendado: WebP o JPG, relación 16:9, mínimo 1200 × 675 px. El archivo se registra en el módulo de medios.</p></div>
              </div>
            </section>
          ) : (
            <section className="admin-editor-section">
              <div className="admin-editor-section__header"><div><h2>Flujo de publicación</h2><p>El backend valida la completitud antes de aceptar una revisión o publicación.</p></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-slate-50 p-5"><span className="admin-eyebrow">Estado actual</span><strong className="mt-3 block text-3xl font-black capitalize text-slate-900">{tema.estado}</strong><p className="mt-2 text-sm leading-6 text-slate-500">Versión de contenido {tema.version_contenido}. Cada publicación incrementa la versión para las descargas offline.</p></div>
                <div className="rounded-3xl bg-slate-50 p-5"><span className="admin-eyebrow">Completitud</span><strong className="mt-3 block text-3xl font-black text-slate-900">{completitud?.porcentaje ?? 0}%</strong><p className="mt-2 text-sm leading-6 text-slate-500">{completitud?.listo_para_revision ? "El tema puede entrar al flujo editorial." : "Completa los criterios pendientes antes de enviarlo."}</p></div>
              </div>
              <div className="admin-completeness-list mt-5">{completitud?.criterios.map((item) => <div key={item.codigo} className={`admin-completeness-item ${item.completo ? "admin-completeness-item--complete" : ""}`}><span>{item.etiqueta}{item.detalle ? ` · ${item.detalle}` : ""}</span>{item.completo ? <Check size={16} /> : <span>Pendiente</span>}</div>)}</div>
              <div className="mt-5 flex flex-wrap gap-3"><button type="button" className="admin-primary-button" disabled={!completitud?.listo_para_revision || reviewMutation.isPending || tema.estado === "revision"} onClick={() => reviewMutation.mutate()}><Send size={17} /> Enviar a revisión</button><button type="button" className="admin-secondary-button" disabled={!completitud?.listo_para_revision || publishMutation.isPending || tema.estado !== "aprobado"} onClick={() => publishMutation.mutate()}><ShieldCheck size={17} /> Publicar ahora</button></div>
            </section>
          )}
        </main>

        <aside className="admin-editor-aside">
          <section className="admin-editor-section"><div className="admin-editor-section__header"><div><h2>Acciones</h2><p>Operaciones que afectan a todo el tema.</p></div></div><div className="grid gap-2"><button type="button" className="admin-secondary-button w-full" onClick={() => navigate({ to: "/admin/temas/$themeId/crecer", params: { themeId } })}><Settings2 size={17} /> Editor CRECER</button><button type="button" className="admin-secondary-button w-full" disabled={duplicateMutation.isPending} onClick={() => duplicateMutation.mutate()}><Copy size={17} /> Duplicar completo</button><button type="button" className="admin-secondary-button w-full !border-red-200 !text-red-600" disabled={archiveMutation.isPending} onClick={() => archiveMutation.mutate()}><Trash2 size={17} /> Archivar tema</button></div></section>
          <section className="admin-editor-section"><h2 className="font-black text-slate-800">Guardado</h2><p className="mt-2 text-sm leading-6 text-slate-500">{dirty ? "Hay cambios sin guardar." : "Los datos están sincronizados con el backend."}</p><button type="button" className="admin-primary-button mt-4 w-full" disabled={!dirty || saveMutation.isPending} onClick={() => saveMutation.mutate()}>{saveMutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />} Guardar</button></section>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, help, wide, children }: { label: string; help?: string; wide?: boolean; children: React.ReactNode }) { return <label className={`admin-field ${wide ? "admin-field--wide" : ""}`}><span>{label}</span>{children}{help ? <small>{help}</small> : null}</label>; }
function EditorLoading() { return <div className="admin-dashboard-state"><span><Loader2 className="animate-spin" /></span><h2>Cargando editor</h2><p>Preparando información y catálogos.</p></div>; }
function CircleIcon() { return <span className="h-4 w-4 rounded-full border-2 border-slate-300" />; }
function slugify(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
