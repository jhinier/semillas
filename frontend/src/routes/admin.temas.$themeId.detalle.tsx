import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  FilePenLine,
  Layers3,
  Loader2,
  Lock,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  despublicarTema,
  formatearDetalleValidacionPublicacion,
  formatearErrorPublicacionApi,
  obtenerEstudioTemaAdmin,
  publicarTema,
} from "../features/admin/admin.api";
import { ThemeWorkflowStepper, type ThemeWorkflowStep } from "../features/admin/componentes/temas/theme-workflow-stepper";
import { resolverPortadaTemaAdmin, usePortadasFirmadasAdmin } from "../features/admin/admin-theme-cover";
import { obtenerNombreLibroBiblico } from "../features/catalog/catalog.api";
import { obtenerIlustracionFallback } from "../features/media/use-resolved-media-url";

export const Route = createFileRoute("/admin/temas/$themeId/detalle")({ component: AdminThemeStudioPage });

const stepsOrder = ["conectar", "relatar", "ensenar", "comprobar", "experimentar", "recompensar"];
const stepLabels: Record<string, string> = {
  conectar: "Conectar",
  relatar: "Relatar",
  ensenar: "Enseñar",
  comprobar: "Comprobar",
  experimentar: "Experimentar",
  recompensar: "Recompensar",
};

const ESTADOS_TEXTO: Record<string, string> = {
  borrador: "Borrador",
  revision: "En revisión",
  aprobado: "Aprobado",
  publicado: "Publicado",
  archivado: "Archivado",
};

function criterioCompleto(
  criterios: Array<{ codigo: string; completo: boolean }> | undefined,
  codigo: string,
): boolean {
  return Boolean(criterios?.some((c) => c.codigo === codigo && c.completo));
}

function AdminThemeStudioPage() {
  const { themeId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const estudioQuery = useQuery({
    queryKey: ["admin", "theme", themeId, "studio"],
    queryFn: () => obtenerEstudioTemaAdmin(themeId),
  });
  const portadasFirmadas = usePortadasFirmadasAdmin(estudioQuery.data ? [estudioQuery.data.tema] : []);

  const invalidateTheme = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "theme", themeId, "studio"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "themes"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] }),
      queryClient.invalidateQueries({ queryKey: ["temas"] }),
    ]);
  };

  const publishMutation = useMutation({
    mutationFn: () => publicarTema(themeId),
    onSuccess: async () => {
      await invalidateTheme();
      toast.success("¡Tema publicado exitosamente! Ya está disponible para los estudiantes.");
    },
    onError: (err) => toast.error(formatearErrorPublicacionApi(err, "No se pudo publicar el tema")),
  });

  const unpublishMutation = useMutation({
    mutationFn: () => despublicarTema(themeId),
    onSuccess: async () => {
      await invalidateTheme();
      toast.success("El tema pasó a Borradores");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "No se pudo cambiar a borrador"),
  });

  if (estudioQuery.isLoading) {
    return (
      <StudioState
        icon={<Loader2 className="animate-spin" />}
        title="Cargando tu tema"
        description="Preparando el progreso paso a paso."
      />
    );
  }

  if (estudioQuery.isError || !estudioQuery.data) {
    return (
      <StudioState
        icon={<BookOpenCheck />}
        title="No se pudo abrir el tema"
        description={estudioQuery.error instanceof Error ? estudioQuery.error.message : "Vuelve a intentarlo."}
      />
    );
  }

  const { tema, pasos = [], actividades = [], completitud, revisiones = [] } = estudioQuery.data;
  const portada = resolverPortadaTemaAdmin({
    titulo: tema.titulo,
    urlFirmada: portadasFirmadas.get(tema.id) ?? tema.portada_recurso?.url_publica ?? null,
  });
  const grupos = tema.grupos_edad ?? [];
  const ultimaRevision = revisiones?.[0];
  const versiculo = tema.versiculo_clave;
  const referencia = tema.referencia_biblica;
  const libroNombre = obtenerNombreLibroBiblico(versiculo?.libro_id ?? referencia?.libro_id ?? 43);
  const versiculoNumero =
    versiculo?.versiculo ??
    (versiculo as { versiculo_inicio?: number } | null)?.versiculo_inicio ??
    referencia?.versiculo_inicio ??
    1;
  const citaBiblica = versiculo
    ? `${libroNombre} ${versiculo.capitulo}:${versiculoNumero}`
    : referencia
      ? `${libroNombre} ${referencia.capitulo}:${referencia.versiculo_inicio ?? 1}`
      : null;
  const parteHistoria = versiculo?.parte_historia ?? referencia?.parte_historia ?? null;

  const paso1Listo =
    criterioCompleto(completitud?.criterios, "ficha_base") ||
    criterioCompleto(completitud?.criterios, "informacion");
  const paso2Listo = criterioCompleto(completitud?.criterios, "portada");
  const contenidosCreados = completitud?.estadisticas?.contenidos_creados ?? 0;
  const contenidosEsperados = completitud?.estadisticas?.contenidos_esperados ?? 6;
  const paso3Listo =
    criterioCompleto(completitud?.criterios, "contenido_crecer") ||
    criterioCompleto(completitud?.criterios, "crecer") ||
    Boolean(completitud?.franjas_detalle?.some((f) => f.momentos_completos >= 6));
  const paso4Listo = actividades.length > 0;
  const paso5Listo = tema.estado === "publicado";

  const libre = tema.estado === "publicado" || tema.estado === "aprobado" || tema.estado === "revision";

  const nextStep: ThemeWorkflowStep = !paso1Listo
    ? 1
    : !paso2Listo
      ? 2
      : !paso3Listo
        ? 3
        : !paso4Listo
          ? 4
          : 5;

  const navigateToStep = (step: ThemeWorkflowStep) => {
    if (step === 1) {
      navigate({ to: "/admin/temas/$themeId/edit", params: { themeId }, search: { tab: "general" } });
      return;
    }
    if (step === 2) {
      navigate({ to: "/admin/temas/$themeId/edit", params: { themeId }, search: { tab: "portada" } });
      return;
    }
    if (step === 3) {
      navigate({ to: "/admin/temas/$themeId/crecer", params: { themeId } });
      return;
    }
    if (step === 4) {
      navigate({ to: "/admin/temas/$themeId/activities", params: { themeId } });
      return;
    }
    navigate({ to: "/admin/temas/$themeId/edit", params: { themeId }, search: { tab: "publicacion" } });
  };

  const roadmapSteps: Array<{
    step: ThemeWorkflowStep;
    title: string;
    summary: string;
    done: boolean;
    lockedReason: string | null;
    buttonLabel: string;
  }> = [
    {
      step: 1,
      title: "Paso 1. Datos generales y versículo",
      summary: `${tema.senda?.nombre ?? "Sin senda"} · ${grupos.length} edad(es) · ${citaBiblica ?? "Sin versículo aún"}`,
      done: paso1Listo,
      lockedReason: null,
      buttonLabel: paso1Listo ? "Editar datos" : "Completar Paso 1",
    },
    {
      step: 2,
      title: "Paso 2. Imagen de portada",
      summary: paso2Listo ? "Portada seleccionada correctamente." : "Elige o sube la imagen principal que verán los estudiantes.",
      done: paso2Listo,
      lockedReason: null,
      buttonLabel: paso2Listo ? "Cambiar portada" : "Elegir portada",
    },
    {
      step: 3,
      title: "Paso 3. Momentos de enseñanza CRECER",
      summary: `${contenidosCreados} de ${contenidosEsperados} momentos escritos para tus grupos de edad.`,
      done: paso3Listo,
      lockedReason: !libre && !paso2Listo ? "Elige primero la portada en el Paso 2." : null,
      buttonLabel: contenidosCreados > 0 ? "Continuar CRECER" : "Empezar Paso 3",
    },
    {
      step: 4,
      title: "Paso 4. Actividades interactivas",
      summary:
        actividades.length > 0
          ? `${actividades.length} actividad(es) configurada(s) en la secuencia del tema.`
          : "Agrega al menos un cuestionario, video o juego práctico.",
      done: paso4Listo,
      lockedReason:
        !libre && !paso2Listo
          ? "Completa primero el Paso 2 (Portada)."
          : !libre && contenidosCreados === 0
            ? "Guarda al menos un momento CRECER en el Paso 3."
            : null,
      buttonLabel: actividades.length > 0 ? "Administrar actividades" : "Agregar actividad",
    },
    {
      step: 5,
      title: "Paso 5. Vista previa y publicación",
      summary:
        tema.estado === "publicado"
          ? "Este tema ya está publicado para los estudiantes."
          : completitud?.listo_para_revision
            ? "¡Todo listo! Revisa cómo se ve y publícalo o envíalo a revisión."
            : "Se habilita en cuanto completes los pasos anteriores.",
      done: paso5Listo,
      lockedReason:
        !libre && (!paso2Listo || contenidosCreados === 0 || !paso4Listo)
          ? "Completa primero los pasos 1 al 4."
          : null,
      buttonLabel: tema.estado === "publicado" ? "Ver estado publicado" : "Revisar y publicar",
    },
  ];

  const sendasLabel = Array.isArray(tema.sendas) && tema.sendas.length > 0
    ? tema.sendas.map((s) => s.nombre).join(" · ")
    : tema.senda?.nombre ?? "Sin senda";

  const nextStepConfig = roadmapSteps.find((s) => s.step === nextStep) ?? roadmapSteps[0]!;
  const nextStepShortLabel = nextStepConfig.title.split(".")[0] ?? `Paso ${nextStep}`;

  return (
    <div className="admin-theme-studio">
      <button type="button" className="admin-secondary-button w-fit" onClick={() => navigate({ to: "/admin/temas" })}>
        <ArrowLeft size={17} /> Volver al listado de temas
      </button>

      <ThemeWorkflowStepper
        currentStep={nextStep}
        themeId={themeId}
        themeEstado={tema.estado}
        completitud={completitud}
      />

      {tema.estado === "publicado" ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/85 px-5 py-4 text-emerald-950 dark:border-emerald-500/35 dark:bg-emerald-950/35 dark:text-emerald-100">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <strong className="block text-sm font-extrabold">
                Tema publicado y activo para los estudiantes
              </strong>
              <p className="mt-0.5 text-xs opacity-90">
                Esta lección ya es visible en la aplicación estudiantil
                {tema.publicado_en
                  ? ` desde el ${new Date(tema.publicado_en).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })}.`
                  : "."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="admin-secondary-button !py-2 !px-3 text-xs"
              onClick={() => navigate({ to: "/admin/temas/$themeId/preview", params: { themeId } })}
            >
              <Eye size={15} /> Ver como estudiante
            </button>
            <button
              type="button"
              className="admin-secondary-button !py-2 !px-3 text-xs"
              disabled={unpublishMutation.isPending}
              onClick={() => unpublishMutation.mutate()}
            >
              <FilePenLine size={15} /> {unpublishMutation.isPending ? "Cambiando..." : "Pasar a borrador"}
            </button>
          </div>
        </div>
      ) : completitud?.listo_para_revision ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-200 bg-violet-50/85 px-5 py-4 text-violet-950 dark:border-violet-500/35 dark:bg-violet-950/35 dark:text-violet-100">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-300" />
            <div>
              <strong className="block text-sm font-extrabold">
                ¡Este tema cumple los requisitos y está listo para publicar!
              </strong>
              <p className="mt-0.5 text-xs opacity-90">
                Puedes publicarlo ahora mismo o revisar la vista previa antes de hacerlo visible.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="admin-primary-button"
            disabled={publishMutation.isPending}
            onClick={() => publishMutation.mutate()}
          >
            {publishMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            {publishMutation.isPending ? "Publicando..." : "Publicar ahora"}
          </button>
        </div>
      ) : null}

      <section className="admin-theme-studio__hero">
        <div className="admin-theme-studio__copy">
          <div className="admin-theme-studio__badges">
            <span className="admin-theme-studio__badge">
              <Circle size={8} fill="currentColor" /> {ESTADOS_TEXTO[tema.estado] ?? tema.estado}
            </span>
            <span className="admin-theme-studio__badge">{sendasLabel}</span>
            <span className="admin-theme-studio__badge">{completitud?.porcentaje ?? 0}% completado</span>
          </div>
          <h2>{tema.titulo}</h2>
          <p>{tema.resumen || tema.objetivo || "Continúa el flujo paso a paso para dejar este tema listo."}</p>
          <div className="admin-theme-studio__hero-actions">
            <button
              type="button"
              className="admin-primary-button"
              onClick={() => navigateToStep(nextStep)}
            >
              <span>Continuar en {nextStepShortLabel}</span>
              <ArrowRight size={17} />
            </button>
            {tema.estado !== "publicado" && completitud?.listo_para_revision ? (
              <button
                type="button"
                disabled={publishMutation.isPending}
                onClick={() => publishMutation.mutate()}
              >
                <ShieldCheck size={16} />
                <span>{publishMutation.isPending ? "Publicando..." : "Publicar ahora"}</span>
              </button>
            ) : null}
          </div>
        </div>
        <div className="admin-theme-studio__cover">
          <img
            src={portada}
            alt={tema.portada_recurso?.texto_alternativo || `Portada de ${tema.titulo}`}
            onError={(event) => {
              event.currentTarget.src = obtenerIlustracionFallback(tema.titulo);
            }}
          />
        </div>
      </section>

      <div className="admin-theme-studio__grid">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="admin-studio-card">
            <h3>Ruta secuencial del tema</h3>
            <p>Sigue estos cinco pasos en orden para no dejar ningún detalle pendiente.</p>
            <div className="mt-4 flex flex-col gap-3">
              {roadmapSteps.map((item) => {
                const locked = Boolean(item.lockedReason);
                return (
                  <div
                    key={item.step}
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition-colors ${
                      item.done
                        ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/35 dark:bg-emerald-950/35"
                        : item.step === nextStep
                          ? "border-violet-300 bg-violet-50/50 dark:border-violet-500/45 dark:bg-violet-950/40"
                          : "border-slate-200 bg-white dark:border-slate-700/90 dark:bg-slate-900/75"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {item.done ? (
                          <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : locked ? (
                          <Lock size={16} className="shrink-0 text-slate-400 dark:text-slate-500" />
                        ) : (
                          <Circle size={16} className="shrink-0 text-violet-600 dark:text-violet-400" />
                        )}
                        <strong className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{item.title}</strong>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                        {item.lockedReason ?? item.summary}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={locked}
                      className={item.step === nextStep && !locked ? "admin-primary-button" : "admin-secondary-button"}
                      onClick={() => navigateToStep(item.step)}
                    >
                      {item.buttonLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="admin-studio-card">
            <h3>Avance de momentos CRECER por franja de edad</h3>
            <p>Basta completar los 6 momentos y al menos 1 actividad en una sola franja para poder publicar el tema para esa audiencia.</p>
            {completitud?.franjas_detalle?.length ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                    <span className="mt-1 block opacity-85">
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
            ) : null}
            <div className="admin-age-matrix mt-3">
              <table>
                <thead>
                  <tr>
                    <th>Edad</th>
                    {stepsOrder.map((code) => (
                      <th key={code}>{stepLabels[code]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(completitud?.franjas_detalle?.length
                    ? completitud.franjas_detalle.map((f) => ({ id: f.grupo_edad_id, nombre: f.nombre }))
                    : grupos
                  ).map((grupo, idx) => {
                    const gId = typeof grupo === "string" ? grupo : grupo.id;
                    const gNombre = typeof grupo === "string" ? grupo : grupo.nombre;
                    return (
                      <tr key={gId || idx}>
                        <td>{gNombre}</td>
                        {stepsOrder.map((code) => {
                          const ready = (pasos ?? []).some(
                            (paso) =>
                              paso.tipo_paso?.codigo === code &&
                              (paso.contenidos ?? []).some(
                                (contenido) =>
                                  contenido.grupo_edad_id === gId &&
                                  Boolean(contenido.titulo?.trim()) &&
                                  Boolean(contenido.cuerpo?.trim()),
                              ),
                          );
                          return (
                            <td key={code}>
                              <span
                                title={ready ? "Momento completo" : "Pendiente"}
                                className={`admin-matrix-dot ${ready ? "admin-matrix-dot--ready" : ""}`}
                              >
                                {ready ? <Check size={13} /> : <Circle size={10} />}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="admin-studio-aside">
          <section className="admin-studio-card">
            <h3>Progreso general</h3>
            <div
              className="admin-completeness-ring"
              style={{ "--progress": completitud?.porcentaje ?? 0 } as React.CSSProperties}
            >
              <strong>{completitud?.porcentaje ?? 0}%</strong>
            </div>
            <div className="admin-completeness-list">
              {(completitud?.criterios ?? []).map((criterio) => {
                const detalleFormateado = criterio.codigo === "publicacion"
                  ? formatearDetalleValidacionPublicacion(criterio.detalle)
                  : criterio.detalle;
                return (
                  <div
                    key={criterio.codigo}
                    className={`admin-completeness-item ${criterio.completo ? "admin-completeness-item--complete" : ""}`}
                  >
                    <span>
                      {criterio.etiqueta}
                      {detalleFormateado ? <small className="ml-1 opacity-80">· {detalleFormateado}</small> : null}
                    </span>
                    {criterio.completo ? <CheckCircle2 size={16} /> : <Circle size={15} />}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="admin-studio-card">
            <h3>Versículo y detalles</h3>
            <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-violet-800">
                <BookOpen size={13} /> {citaBiblica ?? "Sin cita bíblica"}
              </span>
              <blockquote className="mt-2 flex items-start gap-2 text-xs italic leading-relaxed text-slate-700">
                <Quote size={14} className="mt-0.5 shrink-0 text-violet-500" />
                <span>{versiculo?.texto ? `“${versiculo.texto}”` : "Agrega el versículo en el Paso 1."}</span>
              </blockquote>
              {parteHistoria ? (
                <p className="mt-2 text-[11px] font-semibold text-slate-600">{parteHistoria}</p>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <SummaryLine icon={<Clock3 size={16} />} label="Duración" value={`${tema.minutos_estimados} min`} />
              <SummaryLine icon={<Sparkles size={16} />} label="Puntos (XP)" value={`${tema.xp_recompensa} XP`} />
              <SummaryLine
                icon={<Layers3 size={16} />}
                label="Momentos CRECER"
                value={`${contenidosCreados}/${contenidosEsperados}`}
              />
              <SummaryLine icon={<Activity size={16} />} label="Actividades" value={String(actividades.length)} />
            </div>
            {ultimaRevision ? (
              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <strong>Última revisión:</strong> {ultimaRevision.estado}. {ultimaRevision.notas ?? "Sin notas."}
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}

function SummaryLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
      <span className="flex items-center gap-2 text-slate-500">
        {icon}
        {label}
      </span>
      <strong className="text-slate-800">{value}</strong>
    </div>
  );
}

function StudioState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="admin-dashboard-state">
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
