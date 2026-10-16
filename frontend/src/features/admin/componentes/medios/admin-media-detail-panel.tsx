import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  FileAudio,
  FileText,
  Info,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { MediaCardItem } from "../../admin-media.types";
import type {
  DetalleRecursoMultimedia,
  TipoRecursoMultimedia,
  UsoRecursoMultimedia,
} from "../../../media/media.api";
import { MediaTypeBadge } from "./media-type-badge";

type Props = {
  selectedResource: MediaCardItem;
  detail: DetalleRecursoMultimedia | null;
  isLoading: boolean;
  isBusy: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateMetadata: (
    id: string,
    data: { titulo: string; textoAlternativo: string | null },
  ) => Promise<void>;
  onReplace: (
    id: string,
    file: File,
    data: { titulo?: string; textoAlternativo?: string | null },
  ) => Promise<void>;
  onGetFreshUrl: (id: string) => Promise<string>;
};

type DialogMode = "edit" | "replace" | null;

const ACCEPT_BY_TYPE: Record<TipoRecursoMultimedia, string> = {
  imagen: "image/jpeg,image/png,image/webp",
  audio: "audio/mpeg,audio/aac,audio/ogg,audio/webm",
  video: "video/mp4,video/webm",
  documento: "application/pdf",
};

export function AdminMediaDetailPanel({
  selectedResource,
  detail,
  isLoading,
  isBusy,
  onClose,
  onDelete,
  onUpdateMetadata,
  onReplace,
  onGetFreshUrl,
}: Props) {
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);

  useEffect(() => setDialogMode(null), [selectedResource.id]);

  const copyFreshUrl = async () => {
    try {
      const url = await onGetFreshUrl(selectedResource.id);
      await navigator.clipboard.writeText(url);
      toast.success("Enlace temporal copiado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo copiar el enlace");
    }
  };

  const openFreshUrl = async () => {
    try {
      const url = await onGetFreshUrl(selectedResource.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo abrir el archivo");
    }
  };

  const usageCount = detail?.uso_total ?? selectedResource.usadoEnCount ?? 0;
  const canDelete = detail?.puede_eliminar ?? usageCount === 0;

  return (
    <>
      <aside className="grid min-h-[560px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-5 xl:max-h-[calc(100dvh-7.5rem)] xl:grid-rows-[auto_minmax(0,1fr)_auto]">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Inspector de medios
            </p>
            <h2 className="mt-0.5 truncate !text-base !font-black !leading-tight !tracking-normal text-slate-900">
              {selectedResource.nombre}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar inspector"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 space-y-3 overflow-y-auto p-3">
          <ResourcePreview resource={selectedResource} />

          <section className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <MediaTypeBadge tipo={selectedResource.tipo} />
              {usageCount > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-700">
                  <Info size={12} /> {usageCount} {usageCount === 1 ? "uso" : "usos"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                  <CheckCircle2 size={12} /> Sin usar
                </span>
              )}
            </div>
            <p className="mt-2 break-words text-sm font-black leading-snug text-slate-900">
              {selectedResource.nombre}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {selectedResource.tipoMime ?? "Formato no disponible"}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-2">
            <QuickAction
              icon={<Copy size={15} />}
              label="Copiar enlace"
              onClick={() => void copyFreshUrl()}
            />
            <QuickAction
              icon={<ExternalLink size={15} />}
              label="Abrir archivo"
              onClick={() => void openFreshUrl()}
            />
          </div>

          {isLoading ? <DetailSkeleton /> : null}

          {!isLoading && detail ? (
            <>
              <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <SectionTitle>Información técnica</SectionTitle>
                <dl className="mt-2 space-y-1.5">
                  <MetadataRow label="Tamaño" value={selectedResource.tamano} />
                  <MetadataRow label="Formato" value={selectedResource.formato} />
                  <MetadataRow label="Dimensiones" value={selectedResource.dimensiones} />
                  {selectedResource.duracionSeg !== null ? (
                    <MetadataRow
                      label="Duración"
                      value={formatDuration(selectedResource.duracionSeg)}
                    />
                  ) : null}
                  <MetadataRow label="Cargado" value={selectedResource.fechaSubido} />
                  <MetadataRow
                    label="Actualizado"
                    value={selectedResource.fechaActualizado}
                  />
                  <MetadataRow
                    label="Subido por"
                    value={
                      detail.subido_por_usuario?.nombre_visible ??
                      detail.subido_por_usuario?.correo ??
                      "Usuario no disponible"
                    }
                  />
                </dl>
              </section>

              <UsageSection usos={detail.usos} />

              <section className="rounded-2xl border border-slate-200 p-4">
                <SectionTitle>
                  {selectedResource.tipo === "imagen"
                    ? "Texto alternativo"
                    : "Descripción"}
                </SectionTitle>
                <p
                  className={`mt-2 text-sm font-medium leading-relaxed ${
                    selectedResource.altText ? "text-slate-700" : "text-amber-700"
                  }`}
                >
                  {selectedResource.altText ??
                    (selectedResource.tipo === "imagen"
                      ? "Esta imagen necesita una descripción accesible."
                      : "Este recurso no tiene descripción.")}
                </p>
              </section>
            </>
          ) : null}
        </div>

          <footer className="border-t border-slate-200 bg-white p-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDialogMode("edit")}
              disabled={isBusy || isLoading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil size={15} /> Editar datos
            </button>
            <button
              type="button"
              onClick={() => setDialogMode("replace")}
              disabled={isBusy || isLoading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={15} /> Reemplazar
            </button>
          </div>
          <button
            type="button"
            onClick={() => void onDelete(selectedResource.id)}
            disabled={!canDelete || isBusy || isLoading}
            title={
              canDelete
                ? "Eliminar recurso"
                : `No se puede eliminar: se usa en ${usageCount} ${usageCount === 1 ? "lugar" : "lugares"}`
            }
            className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {isBusy ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {canDelete ? "Eliminar recurso" : `No se puede eliminar · ${usageCount} usos`}
          </button>
        </footer>
      </aside>

      {dialogMode === "edit" ? (
        <EditMetadataDialog
          resource={selectedResource}
          isBusy={isBusy}
          onClose={() => setDialogMode(null)}
          onSave={async (data) => {
            await onUpdateMetadata(selectedResource.id, data);
            setDialogMode(null);
          }}
        />
      ) : null}

      {dialogMode === "replace" ? (
        <ReplaceResourceDialog
          resource={selectedResource}
          isBusy={isBusy}
          onClose={() => setDialogMode(null)}
          onReplace={async (file, data) => {
            await onReplace(selectedResource.id, file, data);
            setDialogMode(null);
          }}
        />
      ) : null}
    </>
  );
}

function UsageSection({ usos }: { usos: UsoRecursoMultimedia[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle>Uso del recurso</SectionTitle>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-600">
          {usos.length}
        </span>
      </div>
      {usos.length ? (
        <div className="mt-3 space-y-2">
          {usos.map((uso) => (
            <a
              key={`${uso.tipo}-${uso.entidad_id}-${uso.contexto}`}
              href={uso.href}
              className="group block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-violet-200 hover:bg-violet-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-600">
                    {usageTypeLabel(uso.tipo)}
                  </span>
                  <strong className="mt-0.5 block truncate text-xs font-black text-slate-800 group-hover:text-violet-700">
                    {uso.titulo}
                  </strong>
                  <span className="mt-1 block text-[11px] font-medium leading-relaxed text-slate-500">
                    {uso.contexto}
                  </span>
                </div>
                <ExternalLink size={14} className="mt-1 shrink-0 text-slate-400" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold leading-relaxed text-emerald-800">
          Este archivo no está vinculado a ningún tema, senda, paso CRECER o actividad. Se puede eliminar de forma segura.
        </div>
      )}
    </section>
  );
}

function EditMetadataDialog({
  resource,
  isBusy,
  onClose,
  onSave,
}: {
  resource: MediaCardItem;
  isBusy: boolean;
  onClose: () => void;
  onSave: (data: { titulo: string; textoAlternativo: string | null }) => Promise<void>;
}) {
  const [title, setTitle] = useState(resource.nombre);
  const [altText, setAltText] = useState(resource.altText ?? "");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (title.trim().length < 2) return;
    await onSave({
      titulo: title.trim(),
      textoAlternativo: altText.trim() || null,
    });
  };

  return (
    <Modal title="Editar información" description="Actualiza cómo se identifica y describe este recurso." onClose={onClose}>
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        <Field label="Título">
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </Field>
        <Field label={resource.tipo === "imagen" ? "Texto alternativo" : "Descripción"}>
          <textarea
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            maxLength={300}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 resize-none"
            placeholder={
              resource.tipo === "imagen"
                ? "Describe lo importante que aparece en la imagen"
                : "Describe brevemente el contenido"
            }
          />
        </Field>
        <DialogActions onClose={onClose} isBusy={isBusy} submitLabel="Guardar cambios" />
      </form>
    </Modal>
  );
}

function ReplaceResourceDialog({
  resource,
  isBusy,
  onClose,
  onReplace,
}: {
  resource: MediaCardItem;
  isBusy: boolean;
  onClose: () => void;
  onReplace: (
    file: File,
    data: { titulo?: string; textoAlternativo?: string | null },
  ) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [keepMetadata, setKeepMetadata] = useState(true);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    await onReplace(file, {
      titulo: keepMetadata ? resource.nombre : file.name.replace(/\.[^.]+$/, ""),
      textoAlternativo: keepMetadata ? resource.altText : null,
    });
  };

  return (
    <Modal
      title="Reemplazar archivo"
      description="Conserva el mismo recurso y todas sus referencias. El archivo anterior se eliminará al completar el reemplazo."
      onClose={onClose}
    >
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-xs font-semibold leading-relaxed text-violet-900">
          Debes seleccionar otro archivo de tipo <strong>{resource.tipoLabel.toLowerCase()}</strong>. Los temas y actividades seguirán apuntando al mismo recurso.
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_BY_TYPE[resource.tipo]}
          className="sr-only"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 text-center transition hover:border-violet-300 hover:bg-violet-50"
        >
          <Upload size={24} className="text-violet-600" />
          <strong className="text-sm font-black text-slate-800">
            {file ? file.name : "Seleccionar archivo de reemplazo"}
          </strong>
          <span className="text-xs font-medium text-slate-500">
            {file ? formatFileSize(file.size) : "Se validará formato, tamaño y firma binaria"}
          </span>
        </button>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
          <input
            type="checkbox"
            checked={keepMetadata}
            onChange={(event) => setKeepMetadata(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-violet-600"
          />
          <span>
            <strong className="block text-xs font-black text-slate-800">Conservar título y descripción</strong>
            <small className="mt-1 block text-[11px] font-medium leading-relaxed text-slate-500">
              Recomendado para no perder la información editorial y de accesibilidad.
            </small>
          </span>
        </label>
        <DialogActions
          onClose={onClose}
          isBusy={isBusy}
          submitLabel="Reemplazar archivo"
          disabled={!file}
        />
      </form>
    </Modal>
  );
}

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar diálogo"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="!text-xl !font-black !leading-tight !tracking-normal text-slate-900">{title}</h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"
          >
            <X size={17} />
          </button>
        </header>
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function DialogActions({
  onClose,
  isBusy,
  submitLabel,
  disabled = false,
}: {
  onClose: () => void;
  isBusy: boolean;
  submitLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
      <button
        type="button"
        onClick={onClose}
        disabled={isBusy}
        className="min-h-10 rounded-xl border border-slate-200 px-4 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={disabled || isBusy}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-extrabold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isBusy ? <Loader2 size={15} className="animate-spin" /> : null}
        {submitLabel}
      </button>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-3" aria-label="Cargando detalles">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

function ResourcePreview({ resource }: { resource: MediaCardItem }) {
  if (resource.tipo === "imagen") {
    return (
      <div className="flex h-48 max-h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <img
          src={resource.imgUrl}
          alt={resource.altText ?? resource.nombre}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }
  if (resource.tipo === "video") {
    return (
      <video
        src={resource.imgUrl}
        controls
        preload="metadata"
        className="h-48 max-h-[240px] w-full rounded-2xl border border-slate-200 bg-slate-950 object-contain"
      />
    );
  }
  if (resource.tipo === "audio") {
    return (
      <div className="flex h-40 max-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-violet-100 bg-violet-50 px-4 text-violet-700">
        <FileAudio size={36} aria-hidden="true" />
        <audio src={resource.imgUrl} controls preload="metadata" className="w-full" />
      </div>
    );
  }
  return (
    <div className="flex h-40 max-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
      <FileText size={36} aria-hidden="true" />
      <span className="text-sm font-extrabold">Documento PDF</span>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="!m-0 !text-[11px] !font-black !uppercase !leading-normal !tracking-[0.14em] text-slate-500">
      {children}
    </h3>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="max-w-[62%] break-words text-right font-extrabold text-slate-700">{value}</dd>
    </div>
  );
}

function usageTypeLabel(type: UsoRecursoMultimedia["tipo"]) {
  if (type === "tema") return "Tema";
  if (type === "senda") return "Senda";
  if (type === "paso") return "Paso CRECER";
  return "Actividad";
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
