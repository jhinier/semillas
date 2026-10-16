import { useQuery, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { toast } from "sonner";

import {
  actualizarMetadatosRecurso,
  eliminarRecursoMultimedia,
  obtenerRecursoMultimedia,
  obtenerRecursosMultimedia,
  obtenerUrlFirmadaRecurso,
  reemplazarArchivoRecurso,
  subirArchivo,
  type DetalleRecursoMultimedia,
  type MetadataTecnicaArchivo,
  type RecursoMultimedia,
  type TipoRecursoMultimedia,
} from "../../media/media.api";
import type {
  MediaCardItem,
  MediaTypeFilter,
  MediaUsageFilter,
  MediaViewMode,
} from "../admin-media.types";

type UploadProgress = {
  actual: number;
  total: number;
  nombre: string;
};

interface UseAdminMediaPageReturn {
  selectedId: string;
  setSelectedId: (id: string) => void;
  activeTab: MediaTypeFilter;
  searchValue: string;
  selectedSort: string;
  usageFilter: MediaUsageFilter;
  viewMode: MediaViewMode;
  paginaActual: number;
  porPagina: number;
  isUploading: boolean;
  isMutating: boolean;
  uploadProgress: UploadProgress | null;
  mediaQuery: UseQueryResult<RecursoMultimedia[]>;
  detailQuery: UseQueryResult<DetalleRecursoMultimedia>;
  totalResources: number;
  mappedMedia: MediaCardItem[];
  filteredMedia: MediaCardItem[];
  paginatedItems: MediaCardItem[];
  selectedResource: MediaCardItem | null;
  selectedDetail: DetalleRecursoMultimedia | null;
  countsByType: Record<Exclude<MediaTypeFilter, "">, number>;
  countsByUsage: Record<MediaUsageFilter, number>;
  handleTabChange: (tab: MediaTypeFilter) => void;
  handleSearchChange: (value: string) => void;
  handleSortChange: (sort: string) => void;
  handleUsageFilterChange: (filter: MediaUsageFilter) => void;
  handleViewModeChange: (mode: MediaViewMode) => void;
  handleDelete: (id: string) => Promise<void>;
  handleUpdateMetadata: (
    id: string,
    data: { titulo: string; textoAlternativo: string | null },
  ) => Promise<void>;
  handleReplace: (
    id: string,
    file: File,
    data: { titulo?: string; textoAlternativo?: string | null },
  ) => Promise<void>;
  handleGetFreshUrl: (id: string) => Promise<string>;
  handleFilesChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  inputArchivoRef: RefObject<HTMLInputElement | null>;
  setPaginaActual: (page: number) => void;
  setPorPagina: (perPage: number) => void;
}

const TYPE_LABELS: Record<MediaCardItem["tipo"], string> = {
  imagen: "Imagen",
  audio: "Audio",
  video: "Video",
  documento: "Documento",
};

function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "Tamaño no disponible";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value: string): { label: string; timestamp: number } {
  const date = new Date(value);
  const timestamp = Number.isNaN(date.getTime()) ? 0 : date.getTime();
  return {
    timestamp,
    label: timestamp
      ? date.toLocaleString("es-EC", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Fecha no disponible",
  };
}

function inferMediaType(file: File): TipoRecursoMultimedia {
  if (file.type.startsWith("image/")) return "imagen";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return "documento";
}

async function readMediaMetadata(file: File): Promise<MetadataTecnicaArchivo> {
  if (file.type.startsWith("image/") && "createImageBitmap" in globalThis) {
    try {
      const bitmap = await createImageBitmap(file);
      const metadata = { anchoPx: bitmap.width, altoPx: bitmap.height };
      bitmap.close();
      return metadata;
    } catch {
      return {};
    }
  }

  if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
    const url = URL.createObjectURL(file);
    try {
      const element: HTMLMediaElement = file.type.startsWith("audio/")
        ? document.createElement("audio")
        : document.createElement("video");
      element.preload = "metadata";
      element.src = url;
      await new Promise<void>((resolve, reject) => {
        element.onloadedmetadata = () => resolve();
        element.onerror = () => reject(new Error("metadata"));
      });
      const video = element instanceof HTMLVideoElement ? element : null;
      return {
        anchoPx: video?.videoWidth || null,
        altoPx: video?.videoHeight || null,
        duracionSeg: Number.isFinite(element.duration)
          ? Math.round(element.duration)
          : null,
      };
    } catch {
      return {};
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return {};
}

export function useAdminMediaPage(): UseAdminMediaPageReturn {
  const queryClient = useQueryClient();
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState<MediaTypeFilter>("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedSort, setSelectedSort] = useState("recientes");
  const [usageFilter, setUsageFilter] = useState<MediaUsageFilter>("todos");
  const [viewMode, setViewMode] = useState<MediaViewMode>("grid");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(12);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const mediaQuery = useQuery({
    queryKey: ["admin", "media"],
    queryFn: () => obtenerRecursosMultimedia(),
  });

  const detailQuery = useQuery<DetalleRecursoMultimedia>({
    queryKey: ["admin", "media", selectedId],
    queryFn: () => obtenerRecursoMultimedia(selectedId),
    enabled: Boolean(selectedId),
  });

  const mappedMedia = useMemo<MediaCardItem[]>(() => {
    return (mediaQuery.data ?? []).map((asset) => {
      const created = formatDate(asset.creado_en);
      const updated = formatDate(asset.actualizado_en);
      const formato =
        asset.tipo_mime?.split("/")[1]?.replace("jpeg", "jpg").toUpperCase() ??
        "DESCONOCIDO";
      const dimensiones =
        asset.ancho_px && asset.alto_px
          ? `${asset.ancho_px} × ${asset.alto_px} px`
          : "No disponibles";

      return {
        id: asset.id,
        nombre: asset.titulo?.trim() || `recurso-${asset.id.slice(0, 8)}`,
        tipo: asset.tipo,
        tipoLabel: TYPE_LABELS[asset.tipo],
        imgUrl: asset.url_publica,
        usadoEnCount: asset.uso_total ?? null,
        subidoPor: asset.creado_por,
        fechaSubido: created.label,
        fechaTimestamp: created.timestamp,
        fechaActualizado: updated.label,
        tamano: formatBytes(asset.tamano_bytes),
        tamanoBytes: asset.tamano_bytes,
        formato,
        tipoMime: asset.tipo_mime,
        resolucion: dimensiones,
        dimensiones,
        anchoPx: asset.ancho_px,
        altoPx: asset.alto_px,
        duracionSeg: asset.duracion_seg,
        altText: asset.texto_alternativo?.trim() || null,
      } satisfies MediaCardItem;
    });
  }, [mediaQuery.data]);

  const countsByType = useMemo(
    () => ({
      imagen: mappedMedia.filter((item) => item.tipo === "imagen").length,
      audio: mappedMedia.filter((item) => item.tipo === "audio").length,
      video: mappedMedia.filter((item) => item.tipo === "video").length,
      documento: mappedMedia.filter((item) => item.tipo === "documento").length,
    }),
    [mappedMedia],
  );

  const countsByUsage = useMemo<Record<MediaUsageFilter, number>>(
    () => ({
      todos: mappedMedia.length,
      usados: mappedMedia.filter((item) => (item.usadoEnCount ?? 0) > 0).length,
      sin_uso: mappedMedia.filter((item) => item.usadoEnCount === 0).length,
      accesibilidad: mappedMedia.filter(
        (item) => item.tipo === "imagen" && !item.altText,
      ).length,
    }),
    [mappedMedia],
  );

  const filteredMedia = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLocaleLowerCase("es");
    const filtered = mappedMedia.filter((item) => {
      if (activeTab && item.tipo !== activeTab) return false;
      if (usageFilter === "usados" && (item.usadoEnCount ?? 0) <= 0) return false;
      if (usageFilter === "sin_uso" && item.usadoEnCount !== 0) return false;
      if (
        usageFilter === "accesibilidad" &&
        !(item.tipo === "imagen" && !item.altText)
      ) {
        return false;
      }
      if (!normalizedSearch) return true;

      return [item.nombre, item.altText, item.formato, item.tipoLabel]
        .filter(Boolean)
        .some((value) =>
          String(value).toLocaleLowerCase("es").includes(normalizedSearch),
        );
    });

    return [...filtered].sort((a, b) => {
      if (selectedSort === "antiguos") return a.fechaTimestamp - b.fechaTimestamp;
      if (selectedSort === "nombre") return a.nombre.localeCompare(b.nombre, "es");
      return b.fechaTimestamp - a.fechaTimestamp;
    });
  }, [activeTab, mappedMedia, searchValue, selectedSort, usageFilter]);

  const paginatedItems = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return filteredMedia.slice(inicio, inicio + porPagina);
  }, [filteredMedia, paginaActual, porPagina]);

  const selectedResource = useMemo(
    () => mappedMedia.find((item) => item.id === selectedId) ?? null,
    [mappedMedia, selectedId],
  );

  const refresh = async (id?: string) => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    if (id) {
      await queryClient.invalidateQueries({ queryKey: ["admin", "media", id] });
    }
  };

  const handleTabChange = (tab: MediaTypeFilter) => {
    setActiveTab(tab);
    setPaginaActual(1);
    if (selectedResource && tab && selectedResource.tipo !== tab) setSelectedId("");
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPaginaActual(1);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    setPaginaActual(1);
  };

  const handleUsageFilterChange = (filter: MediaUsageFilter) => {
    setUsageFilter(filter);
    setPaginaActual(1);
  };

  const handleViewModeChange = (mode: MediaViewMode) => setViewMode(mode);

  const handleDelete = async (id: string) => {
    const detail = detailQuery.data;
    if (detail?.uso_total) {
      toast.error(
        `Este recurso se usa en ${detail.uso_total} ${detail.uso_total === 1 ? "lugar" : "lugares"}. Reemplázalo o quita primero sus referencias.`,
      );
      return;
    }
    if (
      !globalThis.confirm(
        "¿Eliminar definitivamente este recurso? El archivo se quitará del almacenamiento.",
      )
    ) {
      return;
    }

    setIsMutating(true);
    try {
      await eliminarRecursoMultimedia(id);
      await refresh();
      setSelectedId("");
      toast.success("Recurso eliminado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar el recurso",
      );
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateMetadata = async (
    id: string,
    data: { titulo: string; textoAlternativo: string | null },
  ) => {
    setIsMutating(true);
    try {
      await actualizarMetadatosRecurso(id, data);
      await refresh(id);
      toast.success("Información actualizada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo actualizar el recurso",
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  const handleReplace = async (
    id: string,
    file: File,
    data: { titulo?: string; textoAlternativo?: string | null },
  ) => {
    setIsMutating(true);
    try {
      const metadata = await readMediaMetadata(file);
      await reemplazarArchivoRecurso(id, file, { ...data, metadata });
      await refresh(id);
      toast.success("Archivo reemplazado sin romper sus referencias");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo reemplazar el archivo",
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  const handleGetFreshUrl = async (id: string) => {
    const result = await obtenerUrlFirmadaRecurso(id);
    return result.url;
  };

  const handleFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    let uploaded = 0;
    let lastResourceId = "";

    for (const [index, file] of files.entries()) {
      setUploadProgress({ actual: index + 1, total: files.length, nombre: file.name });

      try {
        const title = file.name.replace(/\.[^.]+$/, "").trim();
        const metadata = await readMediaMetadata(file);
        const resource = await subirArchivo(
          file,
          inferMediaType(file),
          undefined,
          title.length >= 2 ? title : undefined,
          metadata,
        );
        uploaded += 1;
        lastResourceId = resource.id;
      } catch (error) {
        toast.error(
          `${file.name}: ${error instanceof Error ? error.message : "no se pudo subir"}`,
        );
      }
    }

    setUploadProgress(null);
    await refresh();

    if (lastResourceId) {
      setActiveTab("");
      setUsageFilter("todos");
      setSelectedId(lastResourceId);
      setPaginaActual(1);
    }

    if (uploaded > 0) {
      toast.success(
        uploaded === 1
          ? "Recurso subido correctamente"
          : `${uploaded} recursos subidos correctamente`,
      );
    }
  };

  return {
    selectedId,
    setSelectedId,
    activeTab,
    searchValue,
    selectedSort,
    usageFilter,
    viewMode,
    paginaActual,
    porPagina,
    isUploading: uploadProgress !== null,
    isMutating,
    uploadProgress,
    mediaQuery,
    detailQuery,
    totalResources: mappedMedia.length,
    mappedMedia,
    filteredMedia,
    paginatedItems,
    selectedResource,
    selectedDetail: detailQuery.data ?? null,
    countsByType,
    countsByUsage,
    handleTabChange,
    handleSearchChange,
    handleSortChange,
    handleUsageFilterChange,
    handleViewModeChange,
    handleDelete,
    handleUpdateMetadata,
    handleReplace,
    handleGetFreshUrl,
    handleFilesChange,
    inputArchivoRef,
    setPaginaActual,
    setPorPagina,
  };
}
