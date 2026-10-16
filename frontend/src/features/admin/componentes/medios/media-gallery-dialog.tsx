import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Check,
  Expand,
  FileAudio,
  FileVideo,
  Image as ImageIcon,
  Info,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import type { RecursoMultimedia } from "../../../media/media.api";

type TipoSeleccionable = "imagen" | "audio" | "video";
type TipoFiltro = TipoSeleccionable | "todos";
type InspectorMode = "details" | "upload";

type MediaGalleryDialogProps = {
  open: boolean;
  title: string;
  acceptedTypes: TipoSeleccionable[];
  resources: RecursoMultimedia[];
  selectedResourceId: string | null;
  isUploading?: boolean;
  onClose: () => void;
  onRemove: () => void;
  onSelect: (resourceId: string) => void;
  onUpload: (
    file: File,
    metadata: { titulo: string; textoAlternativo: string },
  ) => void | Promise<void>;
};

const etiquetasTipo: Record<TipoSeleccionable, string> = {
  imagen: "Imágenes",
  video: "Videos",
  audio: "Audios",
};

const acceptByType: Record<TipoSeleccionable, string> = {
  imagen: "image/jpeg,image/png,image/webp",
  audio: "audio/mpeg,audio/aac,audio/ogg,audio/webm",
  video: "video/mp4,video/webm",
};

const maxFileSizeByType: Record<TipoSeleccionable, number> = {
  imagen: 5 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  video: 50 * 1024 * 1024,
};

export function MediaGalleryDialog({
  open,
  title,
  acceptedTypes,
  resources,
  selectedResourceId,
  isUploading = false,
  onClose,
  onRemove,
  onSelect,
  onUpload,
}: MediaGalleryDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  const expandedImageRef = useRef<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<TipoFiltro>(
    acceptedTypes.length > 1 ? "todos" : (acceptedTypes[0] ?? "imagen"),
  );
  const [pendingResourceId, setPendingResourceId] = useState<string | null>(
    selectedResourceId,
  );
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>("details");
  const [file, setFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [textoAlternativo, setTextoAlternativo] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  closeRef.current = onClose;
  expandedImageRef.current = expandedImageUrl;

  const acceptedTypesKey = acceptedTypes.join("|");

  useEffect(() => {
    if (!file) {
      setLocalPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!open) return;

    const selectedResource = resources.find(
      (resource) => resource.id === selectedResourceId,
    );
    const selectedResourceType = selectedResource?.tipo as
      | TipoSeleccionable
      | undefined;

    setSearch("");
    setPendingResourceId(selectedResourceId);
    setSelectedType(
      selectedResourceType && acceptedTypes.includes(selectedResourceType)
        ? selectedResourceType
        : acceptedTypes.length > 1
          ? "todos"
          : (acceptedTypes[0] ?? "imagen"),
    );
    setInspectorMode(selectedResourceId ? "details" : "upload");
    setFile(null);
    setUploadTitle("");
    setTextoAlternativo("");
    setUploadError(null);
    setIsDragging(false);
  }, [acceptedTypesKey, open, selectedResourceId]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => dialogRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (expandedImageRef.current) setExpandedImageUrl(null);
        else if (!isUploading) closeRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isUploading, open]);

  const availableResources = useMemo(
    () =>
      resources
        .filter((resource) =>
          acceptedTypes.includes(resource.tipo as TipoSeleccionable),
        )
        .sort(
          (a, b) =>
            new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime(),
        ),
    [acceptedTypesKey, resources],
  );

  const countsByType = useMemo(
    () =>
      acceptedTypes.reduce<Record<TipoSeleccionable, number>>(
        (counts, type) => {
          counts[type] = availableResources.filter(
            (resource) => resource.tipo === type,
          ).length;
          return counts;
        },
        { imagen: 0, audio: 0, video: 0 },
      ),
    [acceptedTypesKey, availableResources],
  );

  const visibleResources = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return availableResources.filter((resource) => {
      const matchesType =
        selectedType === "todos" || resource.tipo === selectedType;
      const matchesSearch =
        !normalizedSearch ||
        (resource.titulo ?? "").toLocaleLowerCase().includes(normalizedSearch) ||
        resource.texto_alternativo
          ?.toLocaleLowerCase()
          .includes(normalizedSearch) ||
        (resource.tipo_mime ?? "").toLocaleLowerCase().includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [availableResources, search, selectedType]);

  const pendingResource = useMemo(
    () =>
      availableResources.find(
        (resource) => resource.id === pendingResourceId,
      ) ?? null,
    [availableResources, pendingResourceId],
  );

  if (!open) return null;

  const accept = acceptedTypes.map((type) => acceptByType[type]).join(",");
  const selectedFileType = file ? getSelectableFileType(file) : null;
  const requiresAltText = selectedFileType === "imagen";
  const canUpload = Boolean(
    file &&
      !uploadError &&
      uploadTitle.trim().length >= 2 &&
      (!requiresAltText || textoAlternativo.trim().length >= 3),
  );

  const resetUpload = () => {
    setFile(null);
    setUploadTitle("");
    setTextoAlternativo("");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    const fileType = getSelectableFileType(selectedFile);
    if (!fileType || !acceptedTypes.includes(fileType)) {
      setUploadError("El formato del archivo no es compatible con este campo.");
      resetSelectedFileOnly();
      return;
    }

    if (selectedFile.size > maxFileSizeByType[fileType]) {
      setUploadError(
        `El archivo supera el límite de ${formatBytes(maxFileSizeByType[fileType])}.`,
      );
      resetSelectedFileOnly();
      return;
    }

    setUploadError(null);
    setFile(selectedFile);
    setUploadTitle(selectedFile.name.replace(/\.[^.]+$/, ""));
    setTextoAlternativo("");
    setInspectorMode("upload");

    function resetSelectedFileOnly() {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileChange(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file || !canUpload) return;

    try {
      await onUpload(file, {
        titulo: uploadTitle.trim(),
        textoAlternativo: textoAlternativo.trim(),
      });
      resetUpload();
      closeRef.current();
    } catch {
      // La mutación informa el error y conserva el formulario para reintentar.
    }
  };

  const handleUseResource = () => {
    if (!pendingResourceId) return;
    onSelect(pendingResourceId);
  };

  const handleClose = () => {
    if (!isUploading) closeRef.current();
  };

  return (
    <div className="media-library-overlay" role="presentation">
      <button
        type="button"
        aria-label="Cerrar diálogo"
        className="media-library-overlay__backdrop"
        onClick={handleClose}
        disabled={isUploading}
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-gallery-title"
        aria-describedby="media-gallery-description"
        tabIndex={-1}
        className="media-library-dialog"
      >
        <header className="media-library-header">
          <div className="media-library-header__copy">
            <span className="admin-eyebrow">Biblioteca multimedia</span>
            <h2 id="media-gallery-title">{title}</h2>
            <p id="media-gallery-description">
              Selecciona un recurso de la biblioteca o carga un archivo nuevo.
            </p>
          </div>

          <div className="media-library-header__actions">
            <span>{availableResources.length} recursos disponibles</span>
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Cerrar diálogo"
              onClick={handleClose}
              disabled={isUploading}
            >
              <X size={19} />
            </button>
          </div>
        </header>

        <div className="media-library-body">
          <main className="media-library-main">
            <div className="media-library-toolbar">
              <label
                className="media-library-search"
                htmlFor="media-gallery-search"
              >
                <Search size={18} aria-hidden="true" />
                <span className="admin-sr-only">Buscar en Medios</span>
                <input
                  id="media-gallery-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, descripción o formato"
                  autoComplete="off"
                />
                {search ? (
                  <button
                    type="button"
                    aria-label="Limpiar búsqueda"
                    onClick={() => setSearch("")}
                  >
                    <X size={15} />
                  </button>
                ) : null}
              </label>

              <button
                type="button"
                className="media-library-upload-shortcut"
                onClick={() => setInspectorMode("upload")}
              >
                <Upload size={16} />
                Subir recurso
              </button>

              <div
                className="media-library-type-tabs"
                aria-label="Filtrar por tipo de recurso"
              >
                {acceptedTypes.length > 1 ? (
                  <FilterButton
                    active={selectedType === "todos"}
                    label="Todos"
                    count={availableResources.length}
                    onClick={() => setSelectedType("todos")}
                  />
                ) : null}

                {acceptedTypes.map((type) => (
                  <FilterButton
                    key={type}
                    active={selectedType === type}
                    label={etiquetasTipo[type]}
                    count={countsByType[type]}
                    onClick={() => setSelectedType(type)}
                  />
                ))}
              </div>

              <p className="media-library-results-count" aria-live="polite">
                {visibleResources.length === 1
                  ? "1 resultado"
                  : `${visibleResources.length} resultados`}
              </p>
            </div>

            {visibleResources.length ? (
              <div className="media-library-grid">
                {visibleResources.map((resource) => {
                  const isSelected = pendingResourceId === resource.id;

                  return (
                    <button
                      key={resource.id}
                      type="button"
                      className={`media-library-card ${isSelected ? "media-library-card--selected" : ""}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        setPendingResourceId(resource.id);
                        setInspectorMode("details");
                      }}
                    >
                      <MediaThumbnail resource={resource} />

                      {isSelected ? (
                        <span
                          className="media-library-card__check"
                          aria-label="Recurso seleccionado"
                        >
                          <Check size={15} strokeWidth={3} />
                        </span>
                      ) : null}

                      <span className="media-library-card__body">
                        <strong title={resource.titulo ?? undefined}>
                          {resource.titulo || "Recurso sin título"}
                        </strong>
                        <span>
                          {getTypeLabel(resource.tipo)} ·{" "}
                          {formatBytes(resource.tamano_bytes)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="media-library-empty">
                <Search size={28} aria-hidden="true" />
                <h3>No encontramos recursos</h3>
                <p>
                  Ajusta la búsqueda, cambia el tipo o sube un archivo nuevo.
                </p>
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setInspectorMode("upload")}
                >
                  <Upload size={16} /> Subir recurso
                </button>
              </div>
            )}
          </main>

          <aside className="media-library-inspector" aria-label="Panel del recurso">
            <div className="media-library-inspector__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={inspectorMode === "details"}
                className={inspectorMode === "details" ? "is-active" : ""}
                onClick={() => setInspectorMode("details")}
              >
                Detalles
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={inspectorMode === "upload"}
                className={inspectorMode === "upload" ? "is-active" : ""}
                onClick={() => setInspectorMode("upload")}
              >
                Subir nuevo
              </button>
            </div>

            {inspectorMode === "details" ? (
              <ResourceDetails
                resource={pendingResource}
                onExpand={setExpandedImageUrl}
              />
            ) : (
              <UploadPanel
                accept={accept}
                acceptedTypes={acceptedTypes}
                canUpload={canUpload}
                file={file}
                fileInputRef={fileInputRef}
                isDragging={isDragging}
                isUploading={isUploading}
                localPreviewUrl={localPreviewUrl}
                requiresAltText={requiresAltText}
                textoAlternativo={textoAlternativo}
                uploadError={uploadError}
                uploadTitle={uploadTitle}
                onAltTextChange={setTextoAlternativo}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (event.currentTarget === event.target) setIsDragging(false);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onExpand={setExpandedImageUrl}
                onFileChange={handleFileChange}
                onRemoveFile={resetUpload}
                onTitleChange={setUploadTitle}
                onUpload={() => void handleUpload()}
              />
            )}
          </aside>
        </div>

        <footer className="media-library-footer">
          <div className="media-library-footer__selection" aria-live="polite">
            {pendingResource ? (
              <>
                <span className="media-library-footer__selection-icon">
                  <Check size={15} />
                </span>
                <span>
                  <small>Recurso seleccionado</small>
                  <strong title={pendingResource.titulo ?? undefined}>
                    {pendingResource.titulo || "Recurso sin título"}
                  </strong>
                </span>
              </>
            ) : (
              <>
                <span className="media-library-footer__selection-icon is-empty">
                  <Info size={15} />
                </span>
                <span>
                  <small>Selección</small>
                  <strong>Ningún recurso seleccionado</strong>
                </span>
              </>
            )}
          </div>

          <div className="media-library-footer__actions">
            {selectedResourceId ? (
              <button
                type="button"
                className="media-library-remove-button"
                onClick={onRemove}
                disabled={isUploading}
              >
                <Trash2 size={15} /> Quitar recurso actual
              </button>
            ) : null}
            <button
              type="button"
              className="admin-secondary-button"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="admin-primary-button"
              onClick={handleUseResource}
              disabled={!pendingResourceId || isUploading}
            >
              <Check size={16} /> Usar recurso
            </button>
          </div>
        </footer>
      </section>

      {expandedImageUrl ? (
        <ImageViewer
          url={expandedImageUrl}
          onClose={() => setExpandedImageUrl(null)}
        />
      ) : null}
    </div>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={active ? "is-active" : ""}
      onClick={onClick}
    >
      <span>{label}</span>
      <small>{count}</small>
    </button>
  );
}

function ResourceDetails({
  resource,
  onExpand,
}: {
  resource: RecursoMultimedia | null;
  onExpand: (url: string) => void;
}) {
  if (!resource) {
    return (
      <div className="media-library-inspector-empty">
        <ImageIcon size={30} aria-hidden="true" />
        <h3>Selecciona un recurso</h3>
        <p>
          Verás aquí una vista previa y sus datos antes de incorporarlo al
          contenido.
        </p>
      </div>
    );
  }

  return (
    <section className="media-library-details">
      <div className="media-library-details__preview">
        <MediaPreview
          tipo={resource.tipo}
          url={resource.url_publica}
          alt={resource.texto_alternativo || resource.titulo || "Recurso multimedia"}
          onExpand={onExpand}
        />
      </div>

      <div className="media-library-details__heading">
        <span>{getTypeLabel(resource.tipo)}</span>
        <h3 title={resource.titulo ?? undefined}>{resource.titulo || "Recurso sin título"}</h3>
        <p>
          {formatBytes(resource.tamano_bytes)} · {resource.tipo_mime || "Formato no disponible"}
        </p>
      </div>

      <dl className="media-library-details__metadata">
        <div>
          <dt>Descripción accesible</dt>
          <dd>
            {resource.texto_alternativo?.trim() ||
              "Este recurso todavía no tiene texto alternativo."}
          </dd>
        </div>
        <div>
          <dt>Fecha de carga</dt>
          <dd>{formatDate(resource.creado_en)}</dd>
        </div>
      </dl>
    </section>
  );
}

function UploadPanel({
  accept,
  acceptedTypes,
  canUpload,
  file,
  fileInputRef,
  isDragging,
  isUploading,
  localPreviewUrl,
  requiresAltText,
  textoAlternativo,
  uploadError,
  uploadTitle,
  onAltTextChange,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onExpand,
  onFileChange,
  onRemoveFile,
  onTitleChange,
  onUpload,
}: {
  accept: string;
  acceptedTypes: TipoSeleccionable[];
  canUpload: boolean;
  file: File | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isDragging: boolean;
  isUploading: boolean;
  localPreviewUrl: string | null;
  requiresAltText: boolean;
  textoAlternativo: string;
  uploadError: string | null;
  uploadTitle: string;
  onAltTextChange: (value: string) => void;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onExpand: (url: string) => void;
  onFileChange: (file: File | undefined) => void;
  onRemoveFile: () => void;
  onTitleChange: (value: string) => void;
  onUpload: () => void;
}) {
  return (
    <section className="media-library-upload-panel">
      <div className="media-library-upload-panel__intro">
        <span>
          <Upload size={18} />
        </span>
        <div>
          <h3>Subir nuevo recurso</h3>
          <p>Arrastra un archivo o selecciónalo desde tu equipo.</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="admin-sr-only"
        onChange={(event) => onFileChange(event.target.files?.[0])}
      />

      {!file ? (
        <div
          className={`media-library-dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <span className="media-library-dropzone__icon">
            <Upload size={24} />
          </span>
          <strong>Suelta el archivo aquí</strong>
          <p>o</p>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Elegir archivo
          </button>
          <small>{getAcceptedTypesHelp(acceptedTypes)}</small>
        </div>
      ) : (
        <>
          <div className="media-library-local-file">
            {localPreviewUrl ? (
              <LocalFilePreview
                file={file}
                url={localPreviewUrl}
                onExpand={onExpand}
              />
            ) : null}
            <div className="media-library-local-file__info">
              <strong title={file.name}>{file.name}</strong>
              <span>{formatBytes(file.size)}</span>
            </div>
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Quitar archivo"
              onClick={onRemoveFile}
              disabled={isUploading}
            >
              <X size={16} />
            </button>
          </div>

          <label className="admin-field" htmlFor="media-gallery-upload-title">
            <span>Título del recurso</span>
            <input
              id="media-gallery-upload-title"
              value={uploadTitle}
              maxLength={120}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Nombre claro y fácil de encontrar"
              aria-invalid={uploadTitle.trim().length < 2}
            />
            <small>Mínimo 2 caracteres.</small>
          </label>

          <label className="admin-field" htmlFor="media-gallery-upload-alt">
            <span>
              {requiresAltText
                ? "Texto alternativo"
                : "Descripción del recurso"}
            </span>
            <textarea
              id="media-gallery-upload-alt"
              value={textoAlternativo}
              maxLength={300}
              rows={3}
              onChange={(event) => onAltTextChange(event.target.value)}
              placeholder={
                requiresAltText
                  ? "Describe brevemente lo que aparece en la imagen"
                  : "Describe el contenido para facilitar su identificación"
              }
              aria-invalid={
                requiresAltText && textoAlternativo.trim().length < 3
              }
            />
            <small>
              {requiresAltText
                ? "Obligatorio para mantener el contenido accesible."
                : "Opcional, pero recomendado."}
            </small>
          </label>

          <button
            type="button"
            disabled={!canUpload || isUploading}
            onClick={onUpload}
            className="admin-primary-button media-library-upload-submit"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <Upload size={17} />
            )}
            {isUploading ? "Subiendo recurso..." : "Subir y seleccionar"}
          </button>
        </>
      )}

      {uploadError ? (
        <p className="media-library-upload-error" role="alert">
          {uploadError}
        </p>
      ) : null}
    </section>
  );
}

function LocalFilePreview({
  file,
  url,
  onExpand,
}: {
  file: File;
  url: string;
  onExpand: (url: string) => void;
}) {
  const tipo = getSelectableFileType(file) ?? "imagen";

  return (
    <div className="media-library-local-file__preview">
      <MediaPreview tipo={tipo} url={url} alt={file.name} onExpand={onExpand} />
    </div>
  );
}

function MediaPreview({
  tipo,
  url,
  alt,
  onExpand,
}: {
  tipo: RecursoMultimedia["tipo"];
  url: string;
  alt: string;
  onExpand: (url: string) => void;
}) {
  if (tipo === "imagen") {
    return (
      <div className="media-library-preview media-library-preview--image">
        <img src={url} alt={alt} />
        <button
          type="button"
          onClick={() => onExpand(url)}
          aria-label="Ampliar imagen"
        >
          <Expand size={15} /> Ampliar
        </button>
      </div>
    );
  }

  if (tipo === "video") {
    return (
      <video
        src={url}
        controls
        preload="metadata"
        className="media-library-preview media-library-preview--video"
      />
    );
  }

  return (
    <div className="media-library-preview media-library-preview--audio">
      <span>
        <FileAudio size={28} />
      </span>
      <audio src={url} controls preload="metadata" />
    </div>
  );
}

function ImageViewer({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label="Imagen ampliada"
      className="media-library-image-viewer"
    >
      <button
        type="button"
        aria-label="Cerrar imagen ampliada"
        className="media-library-image-viewer__backdrop"
        onClick={onClose}
      />
      <div className="media-library-image-viewer__content">
        <img src={url} alt="Imagen ampliada" />
        <button
          type="button"
          autoFocus
          aria-label="Cerrar imagen ampliada"
          onClick={onClose}
          className="admin-icon-button"
        >
          <X size={18} />
        </button>
      </div>
    </section>
  );
}

function MediaThumbnail({ resource }: { resource: RecursoMultimedia }) {
  if (resource.tipo === "imagen") {
    return (
      <span className="media-library-card__thumbnail">
        <img src={resource.url_publica} alt="" loading="lazy" />
      </span>
    );
  }

  const icon: ReactNode =
    resource.tipo === "audio" ? (
      <FileAudio size={28} />
    ) : (
      <FileVideo size={28} />
    );

  return (
    <span
      className={`media-library-card__thumbnail media-library-card__thumbnail--${resource.tipo}`}
    >
      {icon}
    </span>
  );
}

function getSelectableFileType(file: File): TipoSeleccionable | null {
  if (file.type.startsWith("image/")) return "imagen";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function getTypeLabel(type: RecursoMultimedia["tipo"]) {
  if (type === "imagen") return "Imagen";
  if (type === "audio") return "Audio";
  if (type === "video") return "Video";
  return "Documento";
}

function getAcceptedTypesHelp(types: TipoSeleccionable[]) {
  const formats = types.flatMap((type) => {
    if (type === "imagen") return ["JPG", "PNG", "WebP"];
    if (type === "audio") return ["MP3", "AAC", "OGG"];
    return ["MP4", "WebM"];
  });

  const maxSize = Math.max(...types.map((type) => maxFileSizeByType[type]));
  return `${formats.join(", ")} · máximo ${formatBytes(maxSize)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return date.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}
