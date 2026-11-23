import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  Eye,
  FileText,
  Gamepad2,
  Loader2,
  Save,
  Settings2,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import type { ActivityDraft } from "../../types";
import type { RecursoMultimedia } from "../../../media/media.api";
import {
  esCodigoCuestionario,
  normalizarConfiguracionActividad,
  sincronizarOpcionesCuestionario,
  validarActividadParaGuardar,
} from "./activity-configuration";
import { ActivityTypeConfigBuilder } from "./activity-type-config-builder";
import { ActivityDraftPreview } from "./activity-draft-preview";
import { getActivityTypeDefinition } from "./activity-type-catalog";

export type ActivityEditorTab = "contexto" | "contenido" | "mecanica" | "preview";

type StepInfo = { id: string; tipo_paso?: { nombre?: string | null } | null };
type GroupInfo = { id: string; nombre: string };
type TypeInfo = { id: string; codigo: string; nombre: string; descripcion: string | null; es_juego: boolean };

interface ActivityEditorWorkspaceProps {
  draft: ActivityDraft;
  onChange: (draft: ActivityDraft) => void;
  configText: string;
  onConfigTextChange: (value: string) => void;
  steps: StepInfo[];
  groups: GroupInfo[];
  types: TypeInfo[];
  resources: RecursoMultimedia[];
  selectedTypeCode: string;
  tab: ActivityEditorTab;
  onTabChange: (tab: ActivityEditorTab) => void;
  onTypeChange: (typeId: string) => void;
  onUpload: (file: File, key: string, type: "imagen" | "audio" | "video") => void;
  uploading: boolean;
  saving: boolean;
  dirty: boolean;
  isEditMode: boolean;
  onSave: () => void;
  onClose: () => void;
}

const TABS: Array<{ id: ActivityEditorTab; label: string; helper: string; icon: typeof FileText }> = [
  { id: "contexto", label: "1. Ubicación y tipo", helper: "Edad, momento y juego", icon: Settings2 },
  { id: "contenido", label: "2. Instrucciones", helper: "Título y mensaje", icon: FileText },
  { id: "mecanica", label: "3. Diseño interactivo", helper: "Preguntas o recursos", icon: Gamepad2 },
  { id: "preview", label: "4. Vista previa", helper: "Probar y guardar", icon: Eye },
];

export function ActivityEditorWorkspace(props: ActivityEditorWorkspaceProps) {
  const update = <K extends keyof ActivityDraft>(key: K, value: ActivityDraft[K]) => props.onChange({ ...props.draft, [key]: value });
  const updateConfig = (configuracion: Record<string, unknown>) => {
    if (esCodigoCuestionario(props.selectedTypeCode)) {
      const { configuracion: configNormalizada, opciones: opcionesSincronizadas } = sincronizarOpcionesCuestionario(
        configuracion,
        props.draft.opciones,
      );
      props.onChange({
        ...props.draft,
        configuracion: configNormalizada,
        opciones: opcionesSincronizadas,
      });
      props.onConfigTextChange(JSON.stringify(configNormalizada, null, 2));
      return;
    }

    const normalizada = normalizarConfiguracionActividad(props.selectedTypeCode, configuracion, props.draft.opciones);
    props.onChange({
      ...props.draft,
      configuracion: normalizada,
    });
    props.onConfigTextChange(JSON.stringify(normalizada, null, 2));
  };

  const selectedType = props.types.find((type) => type.id === props.draft.tipo_actividad_id);
  const selectedGroup = props.groups.find((group) => group.id === props.draft.grupo_edad_id);
  const selectedStep = props.steps.find((step) => step.id === props.draft.paso_id);
  const definition = getActivityTypeDefinition(props.selectedTypeCode);
  const validation = getEditorValidation(props.draft, props.selectedTypeCode, props.configText);
  const currentIndex = TABS.findIndex((item) => item.id === props.tab);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex >= 0 && currentIndex < TABS.length - 1;

  return (
    <div className="activity-editor-workspace">
      <header className="activity-editor-workspace__header">
        <div>
          <span className="admin-eyebrow">Editor de actividad</span>
          <h2>{props.isEditMode ? "Editar actividad" : "Nueva actividad"}</h2>
          <p>Configura la experiencia por etapas y comprueba cómo la verá el estudiante.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={props.onClose}>Cerrar editor</button>
      </header>

      <nav className="activity-editor-tabs" aria-label="Pasos de la actividad">
        {TABS.map((item, index) => {
          const Icon = item.icon;
          const active = item.id === props.tab;
          const complete = validation.byTab[item.id].length === 0 && index < 3;
          const previousIncomplete =
            index > currentIndex &&
            TABS.slice(0, index).some((prev) => validation.byTab[prev.id].length > 0);
          return (
            <button
              key={item.id}
              type="button"
              disabled={previousIncomplete}
              className={`activity-editor-tab ${active ? "activity-editor-tab--active" : ""} ${previousIncomplete ? "opacity-55 cursor-not-allowed" : ""}`}
              aria-current={active ? "step" : undefined}
              title={previousIncomplete ? "Completa los pasos anteriores primero" : undefined}
              onClick={() => props.onTabChange(item.id)}
            >
              <span className="activity-editor-tab__icon">{complete ? <CircleCheck size={18} /> : <Icon size={18} />}</span>
              <span><strong>{item.label}</strong><small>{item.helper}</small></span>
            </button>
          );
        })}
      </nav>

      <div className="activity-editor-workspace__layout">
        <main className="activity-editor-workspace__main">
          {props.tab === "contexto" ? (
            <section className="activity-editor-panel">
              <PanelHeading
                eyebrow="Paso 1 de 4"
                title="Ubica la actividad"
                description={
                  props.groups.length === 1
                    ? "Elige en qué momento CRECER aparece y qué tipo de actividad será (la franja se toma del Paso 1)."
                    : "Selecciona para qué edad es, en qué momento CRECER aparece y qué tipo de actividad será."
                }
              />
              <div className="activity-editor-context-grid">
                <Field
                  label="Edad destinataria"
                  help={
                    props.groups.length === 1
                      ? "Franja fija definida en el Paso 1 (Datos base)."
                      : "La actividad solo se mostrará a este grupo."
                  }
                >
                  {props.groups.length === 1 ? (
                    <div
                      className="flex min-h-[44px] items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-sm font-extrabold text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200"
                      role="status"
                    >
                      <span>{props.groups[0]!.nombre}</span>
                      <span className="text-[11px] font-bold opacity-80">Definida en Paso 1</span>
                    </div>
                  ) : (
                    <select value={props.draft.grupo_edad_id} onChange={(event) => update("grupo_edad_id", event.target.value)}>
                      <option value="">Selecciona una edad</option>
                      {props.groups.map((group) => <option key={group.id} value={group.id}>{group.nombre}</option>)}
                    </select>
                  )}
                </Field>
                <Field label="Momento CRECER" help="Elige en qué parte de la lección se presenta.">
                  <select value={props.draft.paso_id} onChange={(event) => update("paso_id", event.target.value)}>
                    <option value="">Selecciona un momento</option>
                    {props.steps.map((step) => <option key={step.id} value={step.id}>{step.tipo_paso?.nombre ?? "Momento"}</option>)}
                  </select>
                </Field>
              </div>

              <div className="activity-type-picker">
                <div className="activity-type-picker__heading">
                  <div><strong>Tipo de actividad</strong><p>Elige un formato interactivo; el siguiente paso se adaptará automáticamente.</p></div>
                  {selectedType ? <span>{selectedType.nombre}</span> : null}
                </div>
                <div className="activity-type-picker__grid">
                  {props.types.map((type) => {
                    const info = getActivityTypeDefinition(type.codigo);
                    const Icon = info.icono;
                    const active = type.id === props.draft.tipo_actividad_id;
                    return (
                      <button key={type.id} type="button" onClick={() => props.onTypeChange(type.id)} className={`activity-type-card activity-type-card--${info.tono} ${active ? "activity-type-card--active" : ""}`} aria-pressed={active}>
                        <span><Icon size={20} /></span>
                        <strong>{type.nombre}</strong>
                        <small>{type.descripcion || info.descripcion}</small>
                        {active ? <Check size={17} /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {props.tab === "contenido" ? (
            <section className="activity-editor-panel">
              <PanelHeading eyebrow="Paso 2 de 4" title="Escribe el título e instrucciones" description="Usa textos claros, breves y fáciles de entender para los estudiantes." />
              <div className="activity-editor-form-grid">
                <Field label="Título de la actividad" wide help={`${props.draft.titulo.length}/120 caracteres`}>
                  <input maxLength={120} value={props.draft.titulo} onChange={(event) => update("titulo", event.target.value)} placeholder="Ejemplo: Descubre los frutos del Espíritu" />
                </Field>
                <Field label="Instrucciones para el estudiante" wide help="Explica con sencillez qué debe hacer para completar la actividad.">
                  <textarea rows={4} value={props.draft.consigna} onChange={(event) => update("consigna", event.target.value)} placeholder="Ejemplo: Elige la respuesta correcta sobre la historia de hoy." />
                </Field>
                <Field label="Mensaje final de felicitación" wide help="Se muestra al completar correctamente la actividad.">
                  <textarea rows={3} value={props.draft.retroalimentacion} onChange={(event) => update("retroalimentacion", event.target.value)} placeholder="Ejemplo: ¡Excelente! Recordaste muy bien la enseñanza." />
                </Field>
                <Field label="Puntos (XP)" help="Recompensa por completar la actividad.">
                  <input type="number" min={0} max={500} value={props.draft.xp_recompensa} onChange={(event) => update("xp_recompensa", Number(event.target.value))} />
                </Field>
                <Field label="Tiempo límite (opcional)" help="Déjalo vacío si no hay reloj.">
                  <div className="activity-editor-input-suffix"><input type="number" min={1} value={props.draft.limite_tiempo_seg ?? ""} onChange={(event) => update("limite_tiempo_seg", event.target.value ? Number(event.target.value) : null)} /><span>seg</span></div>
                </Field>
                <Field label="Nivel">
                  <select value={props.draft.dificultad} onChange={(event) => update("dificultad", event.target.value as ActivityDraft["dificultad"])}><option value="facil">Fácil</option><option value="normal">Normal</option><option value="dificil">Difícil</option></select>
                </Field>
                <Field label="Requisito">
                  <select value={props.draft.obligatorio ? "obligatoria" : "opcional"} onChange={(event) => update("obligatorio", event.target.value === "obligatoria")}><option value="obligatoria">Obligatoria</option><option value="opcional">Opcional</option></select>
                </Field>
              </div>
            </section>
          ) : null}

          {props.tab === "mecanica" ? (
            <section className="activity-editor-panel">
              <PanelHeading eyebrow="Paso 3 de 4" title={selectedType ? `Configura: ${selectedType.nombre}` : "Configura el contenido interactivo"} description={selectedType?.descripcion || definition.descripcion} />
              {!selectedType ? (
                <div className="activity-editor-empty"><CircleAlert size={22} /><strong>Primero elige un tipo de actividad</strong><p>Regresa al Paso 1 para elegir el formato.</p></div>
              ) : (
                <div className="activity-editor-mechanics">
                  <ActivityTypeConfigBuilder codigo={props.selectedTypeCode} configuracion={props.draft.configuracion} onChange={updateConfig} onUpload={props.onUpload} resources={props.resources} uploading={props.uploading} />
                </div>
              )}
            </section>
          ) : null}

          {props.tab === "preview" ? (
            <section className="activity-editor-panel activity-editor-panel--preview">
              <PanelHeading eyebrow="Paso 4 de 4" title="Prueba la actividad antes de guardar" description="Así es como interactuará el estudiante dentro de su lección." />
              <ActivityDraftPreview draft={props.draft} typeCode={props.selectedTypeCode} typeName={selectedType?.nombre} ageGroupName={selectedGroup?.nombre} stepName={selectedStep?.tipo_paso?.nombre} />
            </section>
          ) : null}

          <footer className="activity-editor-footer">
            <div>
              {props.dirty ? <span className="activity-editor-dirty"><CircleAlert size={15} /> Cambios sin guardar</span> : <span className="activity-editor-clean"><CircleCheck size={15} /> Sin cambios pendientes</span>}
              <small>{validation.all.length ? `${validation.all.length} campo${validation.all.length === 1 ? "" : "s"} pendiente${validation.all.length === 1 ? "" : "s"}` : "Actividad lista para guardar"}</small>
            </div>
            <div className="activity-editor-footer__actions">
              <button type="button" className="admin-secondary-button" disabled={!canGoBack} onClick={() => canGoBack && props.onTabChange(TABS[currentIndex - 1]!.id)}><ArrowLeft size={16} /> Paso anterior</button>
              {canGoForward ? (
                <button
                  type="button"
                  className={currentIndex < 3 ? "admin-primary-button" : "admin-secondary-button"}
                  onClick={() => {
                    const issues = validation.byTab[props.tab];
                    if (issues.length > 0) {
                      toast.error(issues[0]);
                      return;
                    }
                    props.onTabChange(TABS[currentIndex + 1]!.id);
                  }}
                >
                  Siguiente paso <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" className="admin-primary-button" disabled={props.saving || props.uploading || validation.all.length > 0} onClick={props.onSave}>
                  {props.saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
                  {props.saving ? "Guardando..." : props.isEditMode ? "Guardar cambios" : "Guardar actividad"}
                </button>
              )}
            </div>
          </footer>
        </main>

        <aside className="activity-editor-workspace__aside">
          <section className="activity-editor-summary">
            <span className="admin-eyebrow">Resumen</span>
            <h3>{props.draft.titulo.trim() || "Actividad sin título"}</h3>
            <p>{selectedType?.nombre || "Tipo sin seleccionar"}</p>
            <dl>
              <div><dt>Edad</dt><dd>{selectedGroup?.nombre || "Pendiente"}</dd></div>
              <div><dt>Momento</dt><dd>{selectedStep?.tipo_paso?.nombre || "Pendiente"}</dd></div>
              <div><dt>Puntos</dt><dd>{props.draft.xp_recompensa} XP</dd></div>
              <div><dt>Nivel</dt><dd>{capitalize(props.draft.dificultad)}</dd></div>
            </dl>
          </section>
          <section className="activity-editor-checklist" aria-label="Progreso de llenado">
            <h3>Progreso de esta actividad</h3>
            {TABS.slice(0, 3).map((item) => {
              const issues = validation.byTab[item.id];
              return (
                <div
                  key={item.id}
                  className={`activity-editor-checklist__item flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
                    issues.length
                      ? "activity-editor-checklist__item--pending border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                      : "activity-editor-checklist__item--complete border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-500/15 dark:text-emerald-100"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">{issues.length ? <CircleAlert size={15} className="text-amber-500 dark:text-amber-400" /> : <CircleCheck size={15} className="text-emerald-600 dark:text-emerald-400" />}</span>
                  <div>
                    <strong className="block font-bold">{item.label}</strong>
                    <small className="block opacity-90">{issues.length ? issues[0] : "Listo"}</small>
                  </div>
                </div>
              );
            })}
          </section>
        </aside>
      </div>
    </div>
  );
}

function PanelHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="activity-editor-panel__heading"><span>{eyebrow}</span><h3>{title}</h3><p>{description}</p></header>;
}

function Field({ label, help, wide, children }: { label: string; help?: string; wide?: boolean; children: ReactNode }) {
  return <label className={`activity-editor-field ${wide ? "activity-editor-field--wide" : ""}`}><span>{label}</span>{children}{help ? <small>{help}</small> : null}</label>;
}

function getEditorValidation(draft: ActivityDraft, code: string, configText: string) {
  const byTab: Record<ActivityEditorTab, string[]> = { contexto: [], contenido: [], mecanica: [], preview: [] };
  if (!draft.grupo_edad_id) byTab.contexto.push("Selecciona una edad");
  if (!draft.paso_id) byTab.contexto.push("Selecciona un momento CRECER");
  if (!draft.tipo_actividad_id) byTab.contexto.push("Selecciona un tipo de actividad");
  if (draft.titulo.trim().length < 3) byTab.contenido.push("El título debe tener al menos 3 letras");
  if (draft.consigna.trim().length < 3) byTab.contenido.push("Escribe instrucciones claras (mínimo 3 letras)");
  if (draft.xp_recompensa < 0 || draft.xp_recompensa > 500) byTab.contenido.push("Los puntos deben estar entre 0 y 500 XP");
  try {
    const parsed = JSON.parse(configText) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      byTab.mecanica.push("Revisa la configuración de esta actividad");
    }
  } catch {
    byTab.mecanica.push("Revisa la configuración de esta actividad");
  }
  if (code) {
    const issue = validarActividadParaGuardar({ codigo: code, configuracion: draft.configuracion, opciones: draft.opciones });
    if (issue) byTab.mecanica.push(issue);
  }
  return { byTab, all: [...byTab.contexto, ...byTab.contenido, ...byTab.mecanica] };
}

function capitalize(value: string) { return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "—"; }
