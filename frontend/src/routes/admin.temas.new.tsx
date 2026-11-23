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
import {
  AdminStudioField,
  AvisoSeccionObligatoria,
  claseContenedorSelectorPaso1,
  claseTarjetaSelectorPaso1,
  enfocarCampoPaso1,
  validarCamposObligatoriosPaso1,
} from "../features/admin/componentes/temas";
import { ThemeWorkflowStepper } from "../features/admin/componentes/temas/theme-workflow-stepper";
import {
  obtenerGruposEdad,
  obtenerLibrosBiblicosSincrono,
  obtenerNombreLibroBiblico,
  obtenerVersionesBiblicas,
  resolverLibroPorDefectoId,
  useLibrosBiblicos,
} from "../features/catalog/catalog.api";
import { obtenerSendas } from "../features/sendas/sendas.api";

export const Route = createFileRoute("/admin/temas/new")({
  component: NewThemePage,
  validateSearch: (search: Record<string, unknown>): { grupoEdadId?: string } => ({
    grupoEdadId: typeof search.grupoEdadId === "string" ? search.grupoEdadId : undefined,
  }),
});

const initialForm: CrearTemaSolicitud = {
  titulo: "",
  slug: "",
  senda_id: "",
  senda_ids: [],
  grupo_edad_ids: [],
  version_biblica_id: "",
  objetivo: "",
  resumen: "",
  minutos_estimados: 20,
  xp_recompensa: 100,
  portada_recurso_id: null,
};

function NewThemePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CrearTemaSolicitud>(initialForm);
  const [libroId, setLibroId] = useState<number | null>(null);
  const [capitulo, setCapitulo] = useState(3);
  const [versiculo, setVersiculo] = useState(16);
  const [parteHistoria, setParteHistoria] = useState("");
  const [versiculoTexto, setVersiculoTexto] = useState("");

  const sendasQuery = useQuery({ queryKey: ["sendas"], queryFn: obtenerSendas });
  const edadesQuery = useQuery({ queryKey: ["catalog", "age-groups"], queryFn: obtenerGruposEdad });
  const versionesQuery = useQuery({ queryKey: ["catalog", "bible-versions"], queryFn: obtenerVersionesBiblicas });
  const librosQuery = useLibrosBiblicos();
  const libros = librosQuery.data ?? obtenerLibrosBiblicosSincrono();
  const libroSeleccionadoId = libroId ?? resolverLibroPorDefectoId(libros);

  const update = <K extends keyof CrearTemaSolicitud>(key: K, value: CrearTemaSolicitud[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const primeraVersion = versionesQuery.data?.[0];
    if (!form.version_biblica_id && primeraVersion?.id) {
      update("version_biblica_id", primeraVersion.id);
    }
  }, [form.version_biblica_id, versionesQuery.data]);

  useEffect(() => {
    if (!search.grupoEdadId || !edadesQuery.data?.length) return;
    const match = edadesQuery.data.find((g) => g.id === search.grupoEdadId || g.codigo === search.grupoEdadId);
    if (match && form.grupo_edad_ids.length === 0) {
      update("grupo_edad_ids", [match.id]);
    }
  }, [edadesQuery.data, form.grupo_edad_ids.length, search.grupoEdadId]);

  const createMutation = useMutation({
    mutationFn: () => {
      const tituloLimpio = form.titulo.trim();
      const slugAutomatico = slugify(tituloLimpio) || `tema-${Date.now()}`;
      const sendasSeleccionadas = form.senda_ids?.length
        ? form.senda_ids
        : form.senda_id
          ? [form.senda_id]
          : [];
      return crearTema({
        ...form,
        senda_id: sendasSeleccionadas[0] ?? form.senda_id,
        senda_ids: sendasSeleccionadas,
        titulo: tituloLimpio,
        slug: slugAutomatico,
        objetivo: form.objetivo.trim(),
        resumen: form.resumen.trim(),
        versiculo_clave: versiculoTexto.trim()
          ? {
              libro_id: Number(libroSeleccionadoId) || resolverLibroPorDefectoId(libros),
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

  const paso1Validacion = useMemo(
    () =>
      validarCamposObligatoriosPaso1({
        titulo: form.titulo,
        senda_ids: form.senda_ids ?? [],
        senda_id: form.senda_id,
        version_biblica_id: form.version_biblica_id,
        resumen: form.resumen,
        objetivo: form.objetivo,
        grupo_edad_ids: form.grupo_edad_ids,
        libro_id: libroSeleccionadoId,
        capitulo,
        versiculo,
        versiculo_texto: versiculoTexto,
      }),
    [capitulo, form, libroSeleccionadoId, versiculo, versiculoTexto],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!paso1Validacion.esValido) {
      const primero = paso1Validacion.pendientes[0];
      if (primero) enfocarCampoPaso1(primero.id);
      toast.error(
        `Antes de continuar completa: ${paso1Validacion.pendientes.map((item) => item.mensajeToast).join(", ")}`,
      );
      return;
    }
    createMutation.mutate();
  };

  const isCatalogLoading =
    sendasQuery.isLoading ||
    edadesQuery.isLoading ||
    versionesQuery.isLoading ||
    librosQuery.isLoading;

  if (isCatalogLoading) {
    return (
      <div className="admin-dashboard-state">
        <span><Loader2 className="animate-spin" /></span>
        <h2>Preparando creador de temas</h2>
        <p>Cargando sendas, edades y libros bíblicos.</p>
      </div>
    );
  }

  const libroNombre = obtenerNombreLibroBiblico(libroSeleccionadoId, libros);
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
          <section
            className={`admin-editor-section ${paso1Validacion.pendientesGeneral.length > 0 ? "admin-editor-section--attention" : ""}`}
          >
            <div className="admin-editor-section__header">
              <div>
                <h2>1. Información principal del tema</h2>
                <p>Estos datos ayudan a maestros y estudiantes a identificar de qué trata esta lección.</p>
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
                    ? `Obligatorio: escribe al menos 3 letras (llevas ${paso1Validacion.tituloLargo} de 3).`
                    : undefined
                }
                wide
              >
                <input
                  id="tema-titulo"
                  value={form.titulo}
                  maxLength={120}
                  placeholder="Ejemplo: La fe de Abraham"
                  onChange={(event) => update("titulo", event.target.value)}
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
                    const currentIds = form.senda_ids?.length
                      ? form.senda_ids
                      : form.senda_id
                        ? [form.senda_id]
                        : [];
                    const selected = currentIds.includes(senda.id);
                    const isPrimary = currentIds[0] === senda.id;

                    const toggleSenda = () => {
                      const next = selected
                        ? currentIds.filter((id) => id !== senda.id)
                        : [...currentIds, senda.id];
                      setForm((prev) => ({
                        ...prev,
                        senda_ids: next,
                        senda_id: next[0] ?? "",
                      }));
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
                            <CheckCircle2 size={18} className="shrink-0 text-violet-600 dark:text-violet-300" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" />
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
                    : `Seleccionada(s): ${form.grupo_edad_ids.length} ${form.grupo_edad_ids.length === 1 ? "franja" : "franjas"} (${form.grupo_edad_ids.length * 6} momentos en CRECER). Solo las franjas marcadas aquí aparecerán en Paso 3 y Paso 4.`
                }
                wide
              >
                <div
                  id="tema-edades"
                  className={claseContenedorSelectorPaso1(paso1Validacion.edadesInvalidas)}
                >
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
                        className={claseTarjetaSelectorPaso1(selected, paso1Validacion.edadesInvalidas)}
                      >
                        <span className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-100">
                          {group.nombre}
                          {selected ? (
                            <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-300" />
                          ) : (
                            <span className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                          )}
                        </span>
                        <small className="mt-1 block text-slate-500 dark:text-slate-300">
                          {group.edad_minima}–{group.edad_maxima} años · {selected ? "Incluida en CRECER (clic para quitar)" : "No incluida (clic para agregar)"}
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
                  onChange={(event) => update("version_biblica_id", event.target.value)}
                  aria-invalid={paso1Validacion.versionBiblicaInvalida || undefined}
                >
                  <option value="">Selecciona una versión</option>
                  {versionesQuery.data?.map((version) => (
                    <option key={version.id} value={version.id}>{version.nombre}</option>
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
                    : "Se muestra en el listado y búsquedas de temas."
                }
                wide
              >
                <textarea
                  id="tema-resumen"
                  rows={3}
                  maxLength={400}
                  placeholder="Describe en una o dos frases de qué trata este tema..."
                  value={form.resumen}
                  onChange={(event) => update("resumen", event.target.value)}
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
                    : "¿Qué aprenderá o aplicará el estudiante al terminar esta lección?"
                }
                wide
              >
                <textarea
                  id="tema-objetivo"
                  rows={4}
                  maxLength={1000}
                  placeholder="¿Qué aprenderá o aplicará el estudiante al terminar esta lección?"
                  value={form.objetivo}
                  onChange={(event) => update("objetivo", event.target.value)}
                  aria-invalid={paso1Validacion.objetivoInvalido || undefined}
                />
              </AdminStudioField>
              <AdminStudioField htmlFor="tema-minutos" label="Duración aproximada (minutos)">
                <input
                  id="tema-minutos"
                  type="number"
                  min={1}
                  max={120}
                  value={form.minutos_estimados}
                  onChange={(event) => update("minutos_estimados", Number(event.target.value))}
                />
              </AdminStudioField>
              <AdminStudioField htmlFor="tema-xp" label="Puntos (XP) al completar">
                <input
                  id="tema-xp"
                  type="number"
                  min={0}
                  max={500}
                  value={form.xp_recompensa}
                  onChange={(event) => update("xp_recompensa", Number(event.target.value))}
                />
              </AdminStudioField>
            </div>
          </section>

          <section
            className={`admin-editor-section ${paso1Validacion.pendientesVersiculo.length > 0 ? "admin-editor-section--attention" : ""}`}
          >
            <div className="admin-editor-section__header">
              <div>
                <h2>2. Versículo clave e historia bíblica</h2>
                <p>Selecciona la cita bíblica central para mostrarla al final del tema.</p>
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
                  value={libroSeleccionadoId}
                  onChange={(event) => setLibroId(Number(event.target.value))}
                  aria-invalid={paso1Validacion.libroInvalido || undefined}
                >
                  {libros.map((libro) => (
                    <option key={libro.id} value={libro.id}>{libro.nombre} ({libro.testamento})</option>
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
                    value={capitulo > 0 ? capitulo : ""}
                    onChange={(event) =>
                      setCapitulo(event.target.value === "" ? 0 : Number(event.target.value))
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
                    value={versiculo > 0 ? versiculo : ""}
                    onChange={(event) =>
                      setVersiculo(event.target.value === "" ? 0 : Number(event.target.value))
                    }
                    aria-invalid={paso1Validacion.versiculoNumInvalido || undefined}
                  />
                </AdminStudioField>
              </div>
              <AdminStudioField htmlFor="tema-parte-historia" label="Contexto o escena bíblica (opcional)" wide>
                <input
                  id="tema-parte-historia"
                  value={parteHistoria}
                  maxLength={220}
                  placeholder={`Ejemplo: Historia de ${libroNombre} ${capitulo || 1}`}
                  onChange={(event) => setParteHistoria(event.target.value)}
                />
              </AdminStudioField>
              <AdminStudioField
                htmlFor="tema-versiculo-texto"
                label="Texto completo del versículo clave"
                required
                invalid={paso1Validacion.versiculoTextoInvalido}
                help={
                  paso1Validacion.versiculoTextoInvalido
                    ? `Obligatorio: escribe el texto completo del versículo (mínimo 3 letras, llevas ${paso1Validacion.versiculoTextoLargo} de 3).`
                    : "Se mostrará al estudiante al iniciar y completar el tema."
                }
                wide
              >
                <textarea
                  id="tema-versiculo-texto"
                  rows={3}
                  value={versiculoTexto}
                  placeholder="Escribe aquí el versículo completo..."
                  onChange={(event) => setVersiculoTexto(event.target.value)}
                  aria-invalid={paso1Validacion.versiculoTextoInvalido || undefined}
                />
              </AdminStudioField>
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

          <section
            className={`admin-editor-section ${!paso1Validacion.esValido ? "admin-editor-section--attention" : ""}`}
          >
            <span className="admin-eyebrow">Lista de verificación · Paso 1</span>
            <div className="admin-completeness-list mt-3">
              {paso1Validacion.esValido ? (
                <div className="admin-completeness-item admin-completeness-item--complete">
                  <span>Todos los campos obligatorios completos</span>
                  <CheckCircle2 size={16} />
                </div>
              ) : (
                paso1Validacion.pendientes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => enfocarCampoPaso1(item.id)}
                    className="admin-completeness-item admin-completeness-item--attention w-full text-left transition hover:opacity-90"
                  >
                    <span>{item.etiqueta}</span>
                    <span>Falta</span>
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>
      </form>
    </div>
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
