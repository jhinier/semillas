import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Quote,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { crearTema, type CrearTemaSolicitud } from "../features/admin/admin.api";
import { ThemeWorkflowStepper } from "../features/admin/componentes/temas/theme-workflow-stepper";
import {
  LIBROS_BIBLICOS_CATALOGO,
  obtenerGruposEdad,
  obtenerNombreLibroBiblico,
  obtenerVersionesBiblicas,
} from "../features/catalog/catalog.api";
import { obtenerSendas } from "../features/sendas/sendas.api";

export const Route = createFileRoute("/admin/temas/new")({ component: NewThemePage });

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
  const [libroId, setLibroId] = useState(43);
  const [capitulo, setCapitulo] = useState(3);
  const [versiculo, setVersiculo] = useState(16);
  const [parteHistoria, setParteHistoria] = useState("");
  const [versiculoTexto, setVersiculoTexto] = useState("");

  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas });
  const edadesQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad });
  const versionesQuery = useQuery({ queryKey: ["catalog", "bible-versions"], queryFn: obtenerVersionesBiblicas });

  const update = <K extends keyof CrearTemaSolicitud>(key: K, value: CrearTemaSolicitud[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const primeraVersion = versionesQuery.data?.[0];
    if (!form.version_biblica_id && primeraVersion?.id) {
      update("version_biblica_id", primeraVersion.id);
    }
  }, [form.version_biblica_id, versionesQuery.data]);

  const createMutation = useMutation({
    mutationFn: () => {
      const tituloLimpio = form.titulo.trim();
      const slugAutomatico = slugify(tituloLimpio) || `tema-${Date.now()}`;
      return crearTema({
        ...form,
        titulo: tituloLimpio,
        slug: slugAutomatico,
        objetivo: form.objetivo.trim(),
        resumen: form.resumen.trim(),
        versiculo_clave: versiculoTexto.trim()
          ? {
              libro_id: Number(libroId) || 43,
              capitulo: Math.max(1, Number(capitulo) || 1),
              versiculo: Math.max(1, Number(versiculo) || 1),
              texto: versiculoTexto.trim(),
              parte_historia: parteHistoria.trim() || undefined,
            }
          : undefined,
      });
    },
    onSuccess: async (theme) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "themes"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success("Borrador guardado. Ahora agrega la portada del tema (Paso 2).");
      navigate({
        to: "/admin/temas/$themeId/edit",
        params: { themeId: theme.id },
        search: { tab: "portada" },
      });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "No se pudo guardar el borrador"),
  });

  const validation = useMemo(() => {
    const missing: string[] = [];
    if (form.titulo.trim().length < 3) missing.push("título (mínimo 3 letras)");
    if (!form.senda_id) missing.push("senda");
    if (!form.version_biblica_id) missing.push("versión de la Biblia");
    if (form.resumen.trim().length < 10) missing.push("resumen corto (mínimo 10 letras)");
    if (form.objetivo.trim().length < 10) missing.push("objetivo de aprendizaje (mínimo 10 letras)");
    if (!form.grupo_edad_ids.length) missing.push("al menos una edad");
    return { valid: missing.length === 0, missing };
  }, [form]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validation.valid) {
      toast.error(`Antes de continuar completa: ${validation.missing.join(", ")}`);
      return;
    }
    createMutation.mutate();
  };

  const isCatalogLoading = sendasQuery.isLoading || edadesQuery.isLoading || versionesQuery.isLoading;

  if (isCatalogLoading) {
    return (
      <div className="admin-dashboard-state">
        <span><Loader2 className="animate-spin" /></span>
        <h2>Preparando creador de temas</h2>
        <p>Cargando sendas, edades y libros bíblicos.</p>
      </div>
    );
  }

  const libroNombre = obtenerNombreLibroBiblico(libroId);
  const citaBiblica = `${libroNombre} ${capitulo || 1}:${versiculo || 1}`;

  return (
    <div className="admin-theme-studio">
      <header className="admin-theme-library__hero">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="admin-icon-button"
            aria-label="Volver al listado de temas"
            onClick={() => navigate({ to: "/admin/temas" })}
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <span className="admin-eyebrow">Paso 1 de 5 · Borrador inicial</span>
            <h2>Crear nuevo tema</h2>
            <p>Sigue los pasos en orden: primero guarda los datos básicos y el versículo clave.</p>
          </div>
        </div>
      </header>

      <ThemeWorkflowStepper currentStep={1} />

      <form className="admin-editor-shell" onSubmit={handleSubmit}>
        <main className="admin-editor-main">
          <section className="admin-editor-section">
            <div className="admin-editor-section__header">
              <div>
                <h2>1. Información principal del tema</h2>
                <p>Estos datos ayudan a maestros y estudiantes a identificar de qué trata esta lección.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <Field label="Título del tema" wide>
                <input
                  value={form.titulo}
                  maxLength={120}
                  placeholder="Ejemplo: La fe de Abraham"
                  onChange={(event) => update("titulo", event.target.value)}
                />
              </Field>
              <Field label="Senda a la que pertenece">
                <select value={form.senda_id} onChange={(event) => update("senda_id", event.target.value)}>
                  <option value="">Selecciona una senda</option>
                  {sendasQuery.data?.map((senda) => (
                    <option key={senda.id} value={senda.id}>{senda.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Versión de la Biblia">
                <select value={form.version_biblica_id} onChange={(event) => update("version_biblica_id", event.target.value)}>
                  <option value="">Selecciona una versión</option>
                  {versionesQuery.data?.map((version) => (
                    <option key={version.id} value={version.id}>{version.nombre}</option>
                  ))}
                </select>
              </Field>
              <Field label="Resumen breve" wide>
                <textarea
                  rows={3}
                  maxLength={400}
                  placeholder="Describe en una o dos frases de qué trata este tema..."
                  value={form.resumen}
                  onChange={(event) => update("resumen", event.target.value)}
                />
              </Field>
              <Field label="Objetivo de aprendizaje" wide>
                <textarea
                  rows={4}
                  maxLength={1000}
                  placeholder="¿Qué aprenderá o aplicará el estudiante al terminar esta lección?"
                  value={form.objetivo}
                  onChange={(event) => update("objetivo", event.target.value)}
                />
              </Field>
              <Field label="Duración aproximada (minutos)">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={form.minutos_estimados}
                  onChange={(event) => update("minutos_estimados", Number(event.target.value))}
                />
              </Field>
              <Field label="Puntos (XP) al completar">
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={form.xp_recompensa}
                  onChange={(event) => update("xp_recompensa", Number(event.target.value))}
                />
              </Field>
              <Field label="¿Para qué edades está pensado?" wide>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {edadesQuery.data?.map((group) => {
                    const selected = form.grupo_edad_ids.includes(group.id);
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() =>
                          update(
                            "grupo_edad_ids",
                            selected
                              ? form.grupo_edad_ids.filter((id) => id !== group.id)
                              : [...form.grupo_edad_ids, group.id],
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className="flex items-center justify-between font-bold text-slate-800">
                          {group.nombre}
                          {selected ? (
                            <CheckCircle2 size={18} className="text-violet-600" />
                          ) : (
                            <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
                          )}
                        </span>
                        <small className="mt-1 block text-slate-500">
                          {group.edad_minima}–{group.edad_maxima} años
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
                <h2>2. Versículo clave e historia bíblica</h2>
                <p>Selecciona la cita bíblica central para mostrarla al final del tema.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <Field label="Libro de la Biblia">
                <select value={libroId} onChange={(event) => setLibroId(Number(event.target.value))}>
                  {LIBROS_BIBLICOS_CATALOGO.map((libro) => (
                    <option key={libro.id} value={libro.id}>{libro.nombre} ({libro.testamento})</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Capítulo">
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={capitulo}
                    onChange={(event) => setCapitulo(Math.max(1, Number(event.target.value) || 1))}
                  />
                </Field>
                <Field label="Versículo">
                  <input
                    type="number"
                    min={1}
                    max={176}
                    value={versiculo}
                    onChange={(event) => setVersiculo(Math.max(1, Number(event.target.value) || 1))}
                  />
                </Field>
              </div>
              <Field label="Contexto o escena bíblica (opcional)" wide>
                <input
                  value={parteHistoria}
                  maxLength={220}
                  placeholder={`Ejemplo: Historia de ${libroNombre} ${capitulo}`}
                  onChange={(event) => setParteHistoria(event.target.value)}
                />
              </Field>
              <Field label="Texto completo del versículo clave" wide>
                <textarea
                  rows={3}
                  value={versiculoTexto}
                  placeholder="Escribe aquí el versículo completo..."
                  onChange={(event) => setVersiculoTexto(event.target.value)}
                />
              </Field>
            </div>

            <div className="admin-step-footer-bar">
              <span className="text-sm text-slate-500">
                Se guardará como <strong>Borrador</strong> y pasarás automáticamente al Paso 2 (Portada).
              </span>
              <button
                type="submit"
                className="admin-primary-button"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={17} /> Guardando borrador...
                  </>
                ) : (
                  <>
                    Guardar borrador y continuar al Paso 2 <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </section>
        </main>

        <aside className="admin-editor-aside">
          <section className="admin-editor-section">
            <span className="admin-eyebrow">Resumen en vivo</span>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5">
              <small className="font-bold uppercase tracking-[.16em] text-violet-600">
                {sendasQuery.data?.find((senda) => senda.id === form.senda_id)?.nombre ?? "Sin senda seleccionada"}
              </small>
              <h3 className="mt-2 text-2xl font-black text-slate-900">
                {form.titulo || "Título del tema"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {form.resumen || "El resumen aparecerá aquí conforme escribas."}
              </p>
            </div>
            <div
              aria-label="Vista previa del versículo"
              className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/70 p-4"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-violet-800">
                <BookOpen size={13} /> {citaBiblica}
              </span>
              <blockquote className="mt-2 flex items-start gap-2 text-sm italic text-slate-700">
                <Quote size={16} className="mt-0.5 shrink-0 text-violet-500" />
                <span>
                  {versiculoTexto.trim()
                    ? `“${versiculoTexto.trim()}”`
                    : "El versículo clave se mostrará aquí."}
                </span>
              </blockquote>
            </div>
          </section>

          <section className="admin-editor-section">
            <span className="admin-eyebrow">Lista de verificación · Paso 1</span>
            <div className="admin-completeness-list mt-3">
              <div className={`admin-completeness-item ${validation.valid ? "admin-completeness-item--complete" : ""}`}>
                <span>Datos básicos completos</span>
                {validation.valid ? <CheckCircle2 size={16} /> : <span>{validation.missing.length} faltantes</span>}
              </div>
              <div className={`admin-completeness-item ${versiculoTexto.trim() ? "admin-completeness-item--complete" : ""}`}>
                <span>Versículo clave escrito</span>
                {versiculoTexto.trim() ? <CheckCircle2 size={16} /> : <span>Recomendado</span>}
              </div>
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`admin-field ${wide ? "admin-field--wide" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140);
}
