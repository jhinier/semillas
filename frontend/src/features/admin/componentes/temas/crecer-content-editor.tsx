import { useState, type ReactNode } from "react";
import {
  Check,
  FileAudio,
  Image,
  Loader,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import type { RecursoMultimedia } from "../../../media/media.api";
import type { ReflectionQuestion } from "../../hooks/use-theme-crecer-page";
import { EditorMarkdown } from "./editor-markdown";
import { MediaGalleryDialog } from "../medios/media-gallery-dialog";

interface CrecerStepInfo { id: string; codigo: string; nombre: string; }
interface AgeGroupInfo { id: string; nombre?: string | null; }

interface CrecerContentEditorProps {
  activeStep: CrecerStepInfo | undefined;
  selectedAgeGroup: AgeGroupInfo | null;
  title: string;
  body: string;
  shortInstruction: string;
  resourceId: string | null;
  audioResourceId: string | null;
  resources: RecursoMultimedia[];
  questions: ReflectionQuestion[];
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onShortInstructionChange: (value: string) => void;
  onResourceChange: (value: string | null) => void;
  onAudioResourceChange: (value: string | null) => void;
  onQuestionsChange: (questions: ReflectionQuestion[]) => void;
  onUpload: (file: File, type: "imagen" | "audio" | "video", metadata: { titulo: string; textoAlternativo: string }) => void;
  onSave: () => void;
  isPending: boolean;
  isUploading: boolean;
  isSuccess: boolean;
  isDirty: boolean;
  unsavedDraftCount: number;
}

export function CrecerContentEditor(props: CrecerContentEditorProps) {
  const [galleryMode, setGalleryMode] = useState<"visual" | "audio" | null>(null);
  const selectedVisual = props.resources.find((resource) => resource.id === props.resourceId) ?? null;
  const selectedAudio = props.resources.find((resource) => resource.id === props.audioResourceId) ?? null;

  return (
    <section className="admin-editor-section">
      <div className="admin-editor-section__header">
        <div><h2>{props.activeStep?.nombre ?? "Paso CRECER"}</h2><p>Versión para {props.selectedAgeGroup?.nombre ?? "la franja seleccionada"}. El contenido, medios y preguntas se guardan juntos.</p></div>
        {props.isDirty ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700" role="status">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" />
            Borrador sin guardar
          </span>
        ) : props.isSuccess ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700" role="status">
            <Check size={15} /> Guardado
          </span>
        ) : null}
      </div>

      <div className="admin-form-grid">
        <Field label="Título del bloque" help="Idea central del paso."><input value={props.title} maxLength={120} onChange={(event) => props.onTitleChange(event.target.value)} placeholder={props.activeStep?.nombre ?? "Título"} /></Field>
        <Field label="Instrucción corta" help="Una frase para comenzar."><input value={props.shortInstruction} maxLength={240} onChange={(event) => props.onShortInstructionChange(event.target.value)} placeholder="Ejemplo: Escucha y piensa..." /></Field>

        <Field label="Contenido principal" wide help="Admite texto con formato simple. Mantén párrafos cortos para lectura en web y móvil.">
          <EditorMarkdown markdown={props.body} onChange={props.onBodyChange} />
        </Field>

        <Field label="Recurso visual" help="Imagen o video que acompaña este paso.">
          <MediaSlot icon={<Image size={20} />} resource={selectedVisual} emptyText="Sin imagen o video" onChoose={() => setGalleryMode("visual")} onRemove={() => props.onResourceChange(null)} />
        </Field>

        <Field label="Narración o audio" help="Audio opcional para accesibilidad y niños que todavía no leen.">
          <MediaSlot icon={<FileAudio size={20} />} resource={selectedAudio} emptyText="Sin audio" onChoose={() => setGalleryMode("audio")} onRemove={() => props.onAudioResourceChange(null)} />
        </Field>

        {props.activeStep?.codigo === "experimentar" ? (
          <Field label="Preguntas de reflexión" wide help="Se muestran al finalizar el bloque y se adaptan a la franja actual.">
            <div className="admin-question-list">
              {props.questions.map((question, index) => (
                <div key={`${question.orden}-${index}`} className="admin-question-row">
                  <span>{index + 1}</span>
                  <input value={question.pregunta} onChange={(event) => props.onQuestionsChange(props.questions.map((item, itemIndex) => itemIndex === index ? { ...item, pregunta: event.target.value } : item))} placeholder="Escribe una pregunta abierta..." />
                  <button type="button" aria-label="Eliminar pregunta" onClick={() => props.onQuestionsChange(props.questions.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, orden: itemIndex + 1 })))}><Trash2 size={15} /></button>
                </div>
              ))}
              <button type="button" className="admin-secondary-button w-fit" onClick={() => props.onQuestionsChange([...props.questions, { pregunta: "", orden: props.questions.length + 1 }])}><Plus size={15} /> Agregar pregunta</button>
            </div>
          </Field>
        ) : null}
      </div>

      <div className="admin-save-bar mt-5">
        <p aria-live="polite">
          {props.isUploading
            ? "Subiendo recurso multimedia..."
            : props.isDirty
              ? props.unsavedDraftCount === 1
                ? "Este paso tiene un borrador local sin guardar."
                : `Este paso y otros ${props.unsavedDraftCount - 1} borradores siguen sin guardar.`
              : "No hay cambios pendientes en este paso."}
        </p>
        <button
          type="button"
          onClick={props.onSave}
          disabled={props.isPending || props.isUploading || !props.isDirty}
          className="admin-primary-button"
        >
          {props.isPending ? <Loader className="animate-spin" size={17} /> : <Save size={17} />}
          {props.isPending ? "Guardando..." : props.isDirty ? "Guardar paso" : "Sin cambios"}
        </button>
      </div>

      <MediaGalleryDialog
        open={galleryMode !== null}
        title={galleryMode === "audio" ? "Narración o audio" : "Recurso visual"}
        acceptedTypes={galleryMode === "audio" ? ["audio"] : ["imagen", "video"]}
        resources={props.resources}
        selectedResourceId={galleryMode === "audio" ? props.audioResourceId : props.resourceId}
        isUploading={props.isUploading}
        onClose={() => setGalleryMode(null)}
        onRemove={() => {
          if (galleryMode === "audio") props.onAudioResourceChange(null);
          else props.onResourceChange(null);
          setGalleryMode(null);
        }}
        onSelect={(resourceId) => {
          if (galleryMode === "audio") props.onAudioResourceChange(resourceId);
          else props.onResourceChange(resourceId);
          setGalleryMode(null);
        }}
        onUpload={(file, metadata) => props.onUpload(file, galleryMode === "audio" ? "audio" : file.type.startsWith("video/") ? "video" : "imagen", metadata)}
      />
    </section>
  );
}

function Field({ label, help, wide, children }: { label: string; help: string; wide?: boolean; children: ReactNode }) { return <div className={`admin-field ${wide ? "admin-field--wide" : ""}`}><span>{label}</span>{children}<small>{help}</small></div>; }
function MediaSlot({ icon, resource, emptyText, onChoose, onRemove }: { icon: ReactNode; resource: RecursoMultimedia | null; emptyText: string; onChoose: () => void; onRemove: () => void }) {
  return (
    <div
      className="admin-media-slot"
      role="button"
      tabIndex={0}
      onClick={onChoose}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChoose(); } }}
    >
      <div className="admin-media-slot__preview">{resource?.tipo === "imagen" ? <img src={resource.url_publica} alt="" /> : icon}</div>
      <div className="admin-media-slot__content">
        <strong title={resource?.titulo ?? undefined}>{resource?.titulo ?? emptyText}</strong>
        <small>{resource ? `${resource.tipo} · ${formatBytes(resource.tamano_bytes)}` : "Selecciona un recurso de la biblioteca o sube uno nuevo."}</small>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={(e) => e.stopPropagation()}>{resource ? "Cambiar recurso" : "Elegir recurso"}</button>
          {resource ? <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="!text-red-600">Quitar</button> : null}
        </div>
      </div>
    </div>
  );
}
function formatBytes(bytes: number | null) { if (!bytes) return "0 KB"; const units = ["B", "KB", "MB", "GB"]; const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`; }
