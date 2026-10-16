import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  FileImage,
  ImagePlus,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { crearTema, type CrearTemaSolicitud } from "../features/admin/admin.api";
import { obtenerGruposEdad, obtenerVersionesBiblicas } from "../features/catalog/catalog.api";
import { obtenerUrlFirmadaRecurso, subirArchivo, type RecursoMultimedia } from "../features/media/media.api";
import { obtenerSendas } from "../features/sendas/sendas.api";
import { CoverImageUpload } from "../features/admin/componentes/temas/cover-image-upload";
import { obtenerRecursosMultimedia } from "../features/media/media.api";

export const Route = createFileRoute("/admin/temas/new")({ component: NewThemePage });

type Destination = "detalle" | "crecer";

const initialForm: CrearTemaSolicitud = {
  titulo: "",
  slug: "",
  senda_id: "",
  grupo_edad_ids: [],
  version_biblica_id: "",
  objetivo: "",
  resumen: "",
  minutos_estimados: 20,
  xp_recompensa: 100,
  portada_recurso_id: null,
};

function NewThemePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CrearTemaSolicitud>(initialForm);
  const [cover, setCover] = useState<RecursoMultimedia | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [destination, setDestination] = useState<Destination>("crecer");

  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas });
  const edadesQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad });
  const versionesQuery = useQuery({ queryKey: ["catalog", "bible-versions"], queryFn: obtenerVersionesBiblicas });
  const recursosQuery = useQuery({ queryKey: ["media", "resources"], queryFn: obtenerRecursosMultimedia });

  const update = <K extends keyof CrearTemaSolicitud>(key: K, value: CrearTemaSolicitud[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => () => {
    if (coverPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(coverPreviewUrl);
  }, [coverPreviewUrl]);

  const coverMutation = useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: { titulo: string; textoAlternativo: string } }) =>
      subirArchivo(file, "imagen", metadata.textoAlternativo, metadata.titulo),
    onSuccess: () => {
      toast.success("Portada cargada");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo subir la portada"),
  });

  const createMutation = useMutation({
    mutationFn: () => crearTema({ ...form, titulo: form.titulo.trim(), slug: form.slug.trim(), objetivo: form.objetivo.trim(), resumen: form.resumen.trim() }),
    onSuccess: async (theme) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
      toast.success("Tema creado como borrador");
      if (destination === "crecer") {
        navigate({ to: "/admin/temas/$themeId/crecer", params: { themeId: theme.id } });
      } else {
        navigate({ to: "/admin/temas/$themeId/detalle", params: { themeId: theme.id } });
      }
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo crear el tema"),
  });

  const validation = useMemo(() => {
    const missing: string[] = [];
    if (form.titulo.trim().length < 3) missing.push("título");
    if (form.slug.trim().length < 3) missing.push("slug");
    if (!form.senda_id) missing.push("senda");
    if (!form.version_biblica_id) missing.push("versión bíblica");
    if (form.objetivo.trim().length < 10) missing.push("objetivo");
    if (form.resumen.trim().length < 10) missing.push("resumen");
    if (!form.grupo_edad_ids.length) missing.push("franja de edad");
    return { valid: missing.length === 0, missing };
  }, [form]);

  const submit = (nextDestination: Destination) => {
    setDestination(nextDestination);
    if (!validation.valid) {
      toast.error(`Completa: ${validation.missing.join(", ")}`);
      return;
    }
    createMutation.mutate();
  };

  const isCatalogLoading = sendasQuery.isLoading || edadesQuery.isLoading || versionesQuery.isLoading;
  const displayedCoverUrl = coverPreviewUrl ?? cover?.url_publica ?? null;

  const handleCoverSelect = async (resource: RecursoMultimedia) => {
    setCover(resource);
    update("portada_recurso_id", resource.id);
    try {
      const { url } = await obtenerUrlFirmadaRecurso(resource.id);
      setCoverPreviewUrl(url);
    } catch {
      setCoverPreviewUrl(resource.url_publica ?? null);
    }
  };

  if (isCatalogLoading) return <div className="admin-dashboard-state"><span><Loader2 className="animate-spin" /></span><h2>Preparando editor</h2><p>Cargando sendas, franjas y versiones bíblicas.</p></div>;

  return (
    <div className="admin-theme-studio">
      <header className="admin-theme-library__hero">
        <div className="flex items-center gap-4">
          <button type="button" className="admin-icon-button" onClick={() => navigate({ to: "/admin/temas" })}><ArrowLeft size={19} /></button>
          <div><span className="admin-eyebrow">Nuevo contenido</span><h2>Crear tema</h2><p>Crea el borrador con datos reales y continúa al recorrido CRECER.</p></div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="admin-secondary-button" disabled={createMutation.isPending} onClick={() => submit("detalle")}><Save size={17} /> Guardar borrador</button>
          <button type="button" className="admin-primary-button" disabled={createMutation.isPending} onClick={() => submit("crecer")}>{createMutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <Sparkles size={17} />} Crear y editar CRECER</button>
        </div>
      </header>

      <div className="admin-editor-shell">
        <main className="admin-editor-main">
          <section className="admin-editor-section">
            <div className="admin-editor-section__header"><div><h2>Información general</h2><p>Estos campos se almacenan en PostgreSQL y se utilizan en la app, búsqueda y paquetes offline.</p></div></div>
            <div className="admin-form-grid">
              <Field label="Título" wide><input value={form.titulo} maxLength={120} onChange={(event) => { const titulo = event.target.value; update("titulo", titulo); if (!form.slug || form.slug === slugify(form.titulo)) update("slug", slugify(titulo)); }} /></Field>
              <Field label="Slug"><input value={form.slug} maxLength={140} onChange={(event) => update("slug", slugify(event.target.value))} /></Field>
              <Field label="Senda"><select value={form.senda_id} onChange={(event) => update("senda_id", event.target.value)}><option value="">Selecciona una senda</option>{sendasQuery.data?.map((senda) => <option key={senda.id} value={senda.id}>{senda.nombre}</option>)}</select></Field>
              <Field label="Versión bíblica"><select value={form.version_biblica_id} onChange={(event) => update("version_biblica_id", event.target.value)}><option value="">Selecciona una versión</option>{versionesQuery.data?.map((version) => <option key={version.id} value={version.id}>{version.nombre}</option>)}</select></Field>
              <Field label="Resumen" wide><textarea rows={3} maxLength={400} value={form.resumen} onChange={(event) => update("resumen", event.target.value)} /></Field>
              <Field label="Objetivo pedagógico" wide><textarea rows={5} maxLength={1000} value={form.objetivo} onChange={(event) => update("objetivo", event.target.value)} /></Field>
              <Field label="Duración estimada (minutos)"><input type="number" min={1} max={120} value={form.minutos_estimados} onChange={(event) => update("minutos_estimados", Number(event.target.value))} /></Field>
              <Field label="XP por completar"><input type="number" min={0} max={500} value={form.xp_recompensa} onChange={(event) => update("xp_recompensa", Number(event.target.value))} /></Field>
              <Field label="Franjas disponibles" wide><div className="grid grid-cols-3 gap-3">{edadesQuery.data?.map((group) => { const selected = form.grupo_edad_ids.includes(group.id); return <button key={group.id} type="button" onClick={() => update("grupo_edad_ids", selected ? form.grupo_edad_ids.filter((id) => id !== group.id) : [...form.grupo_edad_ids, group.id])} className={`rounded-2xl border p-4 text-left ${selected ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"}`}><span className="flex items-center justify-between font-bold text-slate-800">{group.nombre}{selected ? <CheckCircle2 size={18} className="text-violet-600" /> : <span className="h-4 w-4 rounded-full border-2 border-slate-300" />}</span><small className="mt-1 block text-slate-400">{group.edad_minima}–{group.edad_maxima} años</small></button>; })}</div></Field>
            </div>
          </section>

          <section className="admin-editor-section">
            <div className="admin-editor-section__header"><div><h2>Portada</h2><p>Opcional al crear. Puedes reemplazarla más adelante desde Información del tema.</p></div></div>
            <CoverImageUpload
              themeTitle={form.titulo.trim() || undefined}
              cover={cover}
              resources={recursosQuery.data ?? []}
              isUploading={coverMutation.isPending}
              onSelect={handleCoverSelect}
              onRemove={() => {
                setCover(null);
                update("portada_recurso_id", null);
                setCoverPreviewUrl(null);
              }}
              onUpload={async (file, metadata) => {
                const resource = await coverMutation.mutateAsync({
                  file,
                  metadata,
                });
                await handleCoverSelect(resource);
                return resource;
              }}
            />
          </section>
        </main>

        <aside className="admin-editor-aside">
          <section className="admin-editor-section">
            <span className="admin-eyebrow">Vista previa</span>
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="aspect-video bg-slate-100">{displayedCoverUrl ? <img src={displayedCoverUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><ImagePlus size={42} /></div>}</div>
              <div className="p-5"><small className="font-bold uppercase tracking-[.16em] text-violet-600">{sendasQuery.data?.find((senda) => senda.id === form.senda_id)?.nombre ?? "Sin senda"}</small><h3 className="mt-2 text-2xl font-black text-slate-900">{form.titulo || "Título del tema"}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{form.resumen || "El resumen aparecerá aquí."}</p></div>
            </div>
          </section>
          <section className="admin-editor-section"><span className="admin-eyebrow">Completitud inicial</span><p className="mt-3 text-sm leading-6 text-slate-500">Después de crear el tema deberás completar sus seis fases CRECER para cada franja, asignar al menos una actividad y enviarlo a revisión.</p><div className="admin-completeness-list mt-4"><div className={`admin-completeness-item ${validation.valid ? "admin-completeness-item--complete" : ""}`}><span>Información requerida</span>{validation.valid ? <CheckCircle2 size={16} /> : <span>{validation.missing.length} pendientes</span>}</div><div className={`admin-completeness-item ${cover ? "admin-completeness-item--complete" : ""}`}><span>Portada</span>{cover ? <CheckCircle2 size={16} /> : <span>Opcional ahora</span>}</div></div></section>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`admin-field ${wide ? "admin-field--wide" : ""}`}><span>{label}</span>{children}</label>;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);
}
