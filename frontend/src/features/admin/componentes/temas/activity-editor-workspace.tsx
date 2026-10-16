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
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";

import type { ActivityDraft, OptionDraft } from "../../types";
import type { RecursoMultimedia } from "../../../media/media.api";
import { validarActividadParaGuardar } from "./activity-configuration";
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
  { id: "contexto", label: "Contexto", helper: "Tema, franja y tipo", icon: Settings2 },
  { id: "contenido", label: "Contenido", helper: "Título e instrucciones", icon: FileText },
  { id: "mecanica", label: "Mecánica", helper: "Reglas y configuración", icon: Gamepad2 },
  { id: "preview", label: "Vista previa", helper: "Experiencia del estudiante", icon: Eye },
];

export function ActivityEditorWorkspace(props: ActivityEditorWorkspaceProps) {
  const update = <K extends keyof ActivityDraft>(key: K, value: ActivityDraft[K]) => props.onChange({ ...props.draft, [key]: value });
  const updateConfig = (configuracion: Record<string, unknown>) => {
    update("configuracion", configuracion);
    props.onConfigTextChange(JSON.stringify(configuracion, null, 2));
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

      <nav className="activity-editor-tabs" aria-label="Etapas del editor">
        {TABS.map((item, index) => {
          const Icon = item.icon;
          const active = item.id === props.tab;
          const complete = validation.byTab[item.id].length === 0 && index < 3;
          return (
            <button
              key={item.id}
              type="button"
              className={`activity-editor-tab ${active ? "activity-editor-tab--active" : ""}`}
              aria-current={active ? "step" : undefined}
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
              <PanelHeading eyebrow="Paso 1" title="Ubica la actividad" description="Selecciona dónde aparecerá y qué tipo de experiencia vas a construir." />
              <div className="activity-editor-context-grid">
                <Field label="Franja" help="La actividad solo se mostrará a esta audiencia.">
                  <select value={props.draft.grupo_edad_id} onChange={(event) => update("grupo_edad_id", event.target.value)}>
                    <option value="">Selecciona una franja</option>
                    {props.groups.map((group) => <option key={group.id} value={group.id}>{group.nombre}</option>)}
                  </select>
                </Field>
                <Field label="Momento CRECER" help="Define en qué parte del recorrido se presenta.">
                  <select value={props.draft.paso_id} onChange={(event) => update("paso_id", event.target.value)}>
                    <option value="">Selecciona un paso</option>
                    {props.steps.map((step) => <option key={step.id} value={step.id}>{step.tipo_paso?.nombre ?? "Paso"}</option>)}
                  </select>
                </Field>
              </div>

              <div className="activity-type-picker">
                <div className="activity-type-picker__heading">
                  <div><strong>Tipo de actividad</strong><p>Elige una mecánica; después verás únicamente los campos necesarios.</p></div>
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
              <PanelHeading eyebrow="Paso 2" title="Escribe el contenido" description="Usa mensajes breves, directos y adecuados para la franja seleccionada." />
              <div className="activity-editor-form-grid">
                <Field label="Título" wide help={`${props.draft.titulo.length}/120 caracteres`}>
                  <input maxLength={120} value={props.draft.titulo} onChange={(event) => update("titulo", event.target.value)} placeholder="Ejemplo: Descubre los frutos del Espíritu" />
                </Field>
                <Field label="Consigna" wide help="Indica una sola acción clara para comenzar.">
                  <textarea rows={4} value={props.draft.consigna} onChange={(event) => update("consigna", event.target.value)} placeholder="Ejemplo: Encuentra las palabras escondidas en la cuadrícula." />
                </Field>
                <Field label="Retroalimentación" wide help="Se muestra al completar correctamente la actividad.">
                  <textarea rows={3} value={props.draft.retroalimentacion} onChange={(event) => update("retroalimentacion", event.target.value)} placeholder="Ejemplo: ¡Excelente! Reconociste cada fruto." />
                </Field>
                <Field label="XP" help="Recompensa otorgada una sola vez.">
                  <input type="number" min={0} max={500} value={props.draft.xp_recompensa} onChange={(event) => update("xp_recompensa", Number(event.target.value))} />
                </Field>
                <Field label="Tiempo límite" help="Déjalo vacío cuando no deba existir presión de tiempo.">
                  <div className="activity-editor-input-suffix"><input type="number" min={1} value={props.draft.limite_tiempo_seg ?? ""} onChange={(event) => update("limite_tiempo_seg", event.target.value ? Number(event.target.value) : null)} /><span>seg</span></div>
                </Field>
                <Field label="Dificultad">
                  <select value={props.draft.dificultad} onChange={(event) => update("dificultad", event.target.value as ActivityDraft["dificultad"])}><option value="facil">Fácil</option><option value="normal">Normal</option><option value="dificil">Difícil</option></select>
                </Field>
                <Field label="Participación">
                  <select value={props.draft.obligatorio ? "obligatoria" : "opcional"} onChange={(event) => update("obligatorio", event.target.value === "obligatoria")}><option value="obligatoria">Obligatoria</option><option value="opcional">Opcional</option></select>
                </Field>
              </div>
            </section>
          ) : null}

          {props.tab === "mecanica" ? (
            <section className="activity-editor-panel">
              <PanelHeading eyebrow="Paso 3" title={selectedType ? `Configura ${selectedType.nombre}` : "Configura la mecánica"} description={selectedType?.descripcion || definition.descripcion} />
              {!selectedType ? (
                <div className="activity-editor-empty"><CircleAlert size={22} /><strong>Primero elige un tipo de actividad</strong><p>Regresa a Contexto para seleccionar la mecánica.</p></div>
              ) : (
                <div className="activity-editor-mechanics">
                  <ActivityTypeConfigBuilder codigo={props.selectedTypeCode} configuracion={props.draft.configuracion} onChange={updateConfig} onUpload={props.onUpload} resources={props.resources} uploading={props.uploading} />
                  {definition.requiereOpciones ? <OptionsBuilder options={props.draft.opciones} onChange={(opciones) => update("opciones", opciones)} /> : null}
                </div>
              )}
            </section>
          ) : null}

          {props.tab === "preview" ? (
            <section className="activity-editor-panel activity-editor-panel--preview">
              <PanelHeading eyebrow="Paso 4" title="Comprueba la experiencia" description="Esta simulación reutiliza el mismo renderizador que verá el estudiante en /app." />
              <ActivityDraftPreview draft={props.draft} typeCode={props.selectedTypeCode} typeName={selectedType?.nombre} ageGroupName={selectedGroup?.nombre} stepName={selectedStep?.tipo_paso?.nombre} />
            </section>
          ) : null}

          <footer className="activity-editor-footer">
            <div>
              {props.dirty ? <span className="activity-editor-dirty"><CircleAlert size={15} /> Cambios sin guardar</span> : <span className="activity-editor-clean"><CircleCheck size={15} /> Sin cambios pendientes</span>}
              <small>{validation.all.length ? `${validation.all.length} requisito${validation.all.length === 1 ? "" : "s"} pendiente${validation.all.length === 1 ? "" : "s"}` : "Actividad lista para guardar"}</small>
            </div>
            <div className="activity-editor-footer__actions">
              <button type="button" className="admin-secondary-button" disabled={!canGoBack} onClick={() => canGoBack && props.onTabChange(TABS[currentIndex - 1]!.id)}><ArrowLeft size={16} /> Anterior</button>
              {canGoForward ? <button type="button" className="admin-secondary-button" onClick={() => props.onTabChange(TABS[currentIndex + 1]!.id)}>Siguiente <ArrowRight size={16} /></button> : null}
              <button type="button" className="admin-primary-button" disabled={props.saving || props.uploading || validation.all.length > 0} onClick={props.onSave}>{props.saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}{props.saving ? "Guardando..." : props.isEditMode ? "Guardar cambios" : "Crear actividad"}</button>
            </div>
          </footer>
        </main>

        <aside className="activity-editor-workspace__aside">
          <section className="activity-editor-summary">
            <span className="admin-eyebrow">Resumen</span>
            <h3>{props.draft.titulo.trim() || "Actividad sin título"}</h3>
            <p>{selectedType?.nombre || "Tipo sin seleccionar"}</p>
            <dl>
              <div><dt>Franja</dt><dd>{selectedGroup?.nombre || "Pendiente"}</dd></div>
              <div><dt>Momento</dt><dd>{selectedStep?.tipo_paso?.nombre || "Pendiente"}</dd></div>
              <div><dt>XP</dt><dd>{props.draft.xp_recompensa}</dd></div>
              <div><dt>Dificultad</dt><dd>{capitalize(props.draft.dificultad)}</dd></div>
            </dl>
          </section>
          <section className="activity-editor-checklist">
            <h3>Preparación</h3>
            {TABS.slice(0, 3).map((item) => {
              const issues = validation.byTab[item.id];
              return <button key={item.id} type="button" onClick={() => props.onTabChange(item.id)} className={issues.length ? "" : "activity-editor-checklist__complete"}><span>{issues.length ? <CircleAlert size={16} /> : <CircleCheck size={16} />}</span><div><strong>{item.label}</strong><small>{issues.length ? issues[0] : "Completo"}</small></div></button>;
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

function OptionsBuilder({ options, onChange }: { options: OptionDraft[]; onChange: (options: OptionDraft[]) => void }) {
  return (
    <fieldset className="activity-options-builder">
      <legend>Opciones de respuesta</legend>
      <p>Escribe de dos a seis opciones y marca una respuesta correcta.</p>
      <div className="activity-options-builder__list">
        {options.map((option, index) => (
          <div key={`${option.etiqueta}-${index}`} className="activity-option-row">
            <span className="activity-option-row__label">{String.fromCharCode(65 + index)}</span>
            <input value={option.texto} placeholder={`Opción ${index + 1}`} onChange={(event) => onChange(options.map((item, itemIndex) => itemIndex === index ? { ...item, texto: event.target.value } : item))} />
            <label className="activity-option-row__correct"><input type="radio" name="correct-answer" checked={option.correcta} onChange={() => onChange(options.map((item, itemIndex) => ({ ...item, correcta: itemIndex === index })))} /><span>Correcta</span></label>
            <button type="button" aria-label={`Eliminar opción ${index + 1}`} disabled={options.length <= 2} onClick={() => onChange(options.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, etiqueta: String.fromCharCode(65 + itemIndex), orden: itemIndex + 1 })))}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <button type="button" className="admin-secondary-button" disabled={options.length >= 6} onClick={() => onChange([...options, { etiqueta: String.fromCharCode(65 + options.length), texto: "", correcta: false, orden: options.length + 1 }])}><Plus size={15} /> Agregar opción</button>
    </fieldset>
  );
}

function getEditorValidation(draft: ActivityDraft, code: string, configText: string) {
  const byTab: Record<ActivityEditorTab, string[]> = { contexto: [], contenido: [], mecanica: [], preview: [] };
  if (!draft.grupo_edad_id) byTab.contexto.push("Selecciona una franja");
  if (!draft.paso_id) byTab.contexto.push("Selecciona un momento CRECER");
  if (!draft.tipo_actividad_id) byTab.contexto.push("Selecciona un tipo de actividad");
  if (draft.titulo.trim().length < 3) byTab.contenido.push("El título debe tener al menos 3 caracteres");
  if (draft.consigna.trim().length < 3) byTab.contenido.push("La consigna debe tener al menos 3 caracteres");
  if (draft.xp_recompensa < 0 || draft.xp_recompensa > 500) byTab.contenido.push("La recompensa debe estar entre 0 y 500 XP");
  try {
    const parsed = JSON.parse(configText) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      byTab.mecanica.push("La configuración avanzada debe ser un objeto JSON");
    }
  } catch {
    byTab.mecanica.push("La configuración avanzada contiene JSON inválido");
  }
  if (code) {
    const issue = validarActividadParaGuardar({ codigo: code, configuracion: draft.configuracion, opciones: draft.opciones });
    if (issue) byTab.mecanica.push(issue);
  }
  return { byTab, all: [...byTab.contexto, ...byTab.contenido, ...byTab.mecanica] };
}

function capitalize(value: string) { return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "—"; }
