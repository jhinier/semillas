import { obtenerApiUrlPublica } from "../../shared/config/env";
import { RUTAS_API, peticion } from "../../shared/api/api";
import { sessionStorageApi } from "../../shared/api/session";

export type TipoRecursoMultimedia = "imagen" | "audio" | "video" | "documento";

export type RecursoMultimedia = {
  id: string;
  tipo: TipoRecursoMultimedia;
  bucket_almacenamiento: string | null;
  clave_almacenamiento: string | null;
  url_publica: string;
  texto_alternativo: string | null;
  titulo: string | null;
  tipo_mime: string | null;
  tamano_bytes: number | null;
  ancho_px: number | null;
  alto_px: number | null;
  duracion_seg: number | null;
  creado_por: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
  uso_total?: number | null;
};

export type UsoRecursoMultimedia = {
  tipo: "tema" | "senda" | "paso" | "actividad";
  entidad_id: string;
  titulo: string;
  contexto: string;
  tema_id: string | null;
  href: string;
};

export type DetalleRecursoMultimedia = RecursoMultimedia & {
  uso_total: number;
  puede_eliminar: boolean;
  usos: UsoRecursoMultimedia[];
  subido_por_usuario: {
    id: string;
    nombre_visible: string;
    correo: string | null;
  } | null;
};

export type MetadataTecnicaArchivo = {
  anchoPx?: number | null;
  altoPx?: number | null;
  duracionSeg?: number | null;
};

const LIMITES_BYTES_POR_TIPO: Record<TipoRecursoMultimedia, number> = {
  imagen: 5 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  documento: 10 * 1024 * 1024,
};

const FORMATOS_PERMITIDOS_POR_TIPO: Record<TipoRecursoMultimedia, { mimes: string[]; label: string }> = {
  imagen: {
    mimes: ["image/jpeg", "image/png", "image/webp"],
    label: "JPG, PNG o WebP",
  },
  audio: {
    mimes: ["audio/mpeg", "audio/mp3", "audio/aac", "audio/mp4", "audio/ogg", "audio/webm"],
    label: "MP3, AAC, OGG o WebM",
  },
  video: {
    mimes: ["video/mp4", "video/webm"],
    label: "MP4 o WebM",
  },
  documento: {
    mimes: ["application/pdf"],
    label: "PDF",
  },
};

export function validarArchivoMultimediaCliente(
  archivo: File,
  tipo: TipoRecursoMultimedia,
): string | null {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "No hay conexión a internet. Conéctate a una red estable antes de subir el archivo.";
  }

  if (!archivo || archivo.size <= 0) {
    return `El archivo «${archivo?.name ?? "seleccionado"}» está vacío (0 bytes).`;
  }

  const reglaFormato = FORMATOS_PERMITIDOS_POR_TIPO[tipo];
  if (reglaFormato && archivo.type && !reglaFormato.mimes.includes(archivo.type)) {
    return `Formato no compatible (${archivo.type || "desconocido"}). Para recursos de tipo ${tipo} usa archivos ${reglaFormato.label}.`;
  }

  const maxBytes = LIMITES_BYTES_POR_TIPO[tipo] ?? 50 * 1024 * 1024;
  if (archivo.size > maxBytes) {
    const pesoMb = (archivo.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
    return `El archivo «${archivo.name}» pesa ${pesoMb} MB y supera el tamaño máximo permitido de ${maxMb} MB para ${tipo}s. Comprime el archivo e inténtalo nuevamente.`;
  }

  return null;
}

function traducirErrorSubida(error: unknown, archivo?: File | null, estadoHttp?: number): string {
  const nombre = archivo?.name ? `«${archivo.name}»` : "el archivo";
  const pesoMb = archivo ? `${(archivo.size / (1024 * 1024)).toFixed(1)} MB` : "";
  const esVideo = archivo?.type?.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv)$/i.test(archivo?.name ?? "");

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return `No se pudo subir ${nombre}: se perdió la conexión a internet durante la carga.`;
  }

  if (estadoHttp === 413) {
    return `No se pudo subir ${nombre} (${pesoMb}): el servidor rechazó la carga porque el archivo supera el tamaño máximo aceptado por el servidor (HTTP 413). Intenta comprimir el video a menos de 15 MB.`;
  }

  if (estadoHttp === 401 || estadoHttp === 403) {
    return `No tienes permisos para subir ${nombre} o tu sesión expiró. Vuelve a iniciar sesión como administrador.`;
  }

  if (error instanceof Error) {
    const msg = error.message || "";
    if (
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("Load failed") ||
      error.name === "TypeError"
    ) {
      if (esVideo) {
        return `No se pudo subir el video ${nombre}${pesoMb ? ` (${pesoMb})` : ""}: el servidor cortó o rechazó la conexión durante la transferencia. Causas frecuentes: el video supera el límite de carga del servidor proxy/backend (se recomienda un MP4/WebM menor a 15 MB, máximo 50 MB), el tiempo de espera se agotó o el servidor backend no está disponible.`;
      }
      return `No se pudo conectar con el servidor para subir ${nombre}${pesoMb ? ` (${pesoMb})` : ""}. Verifica que el servidor backend esté activo y que el archivo no supere el límite permitido.`;
    }
    return msg;
  }

  return `No se pudo procesar ${nombre}. Revisa el formato y tamaño del archivo e inténtalo de nuevo.`;
}

function headersAutenticacion() {
  const headers: Record<string, string> = {};
  const idInvitado = sessionStorageApi.getGuestUserId();
  const tokenInvitado = sessionStorageApi.getGuestToken();
  const token = sessionStorageApi.getAccessToken();
  if (idInvitado) headers["X-Guest-User-Id"] = idInvitado;
  if (tokenInvitado) headers["X-Guest-Token"] = tokenInvitado;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function enviarFormulario<T>(ruta: string, formData: FormData) {
  const archivoRaw = formData.get("archivo");
  const archivo = archivoRaw instanceof File ? archivoRaw : null;

  let res: Response;
  try {
    res = await fetch(`${obtenerApiUrlPublica()}${ruta}`, {
      method: "POST",
      headers: headersAutenticacion(),
      body: formData,
    });
  } catch (error) {
    throw new Error(traducirErrorSubida(error, archivo));
  }

  const resultado = await res.json().catch(() => null);
  if (!res.ok || !resultado?.exito) {
    const mensajeServidor =
      typeof resultado?.error === "string"
        ? resultado.error
        : typeof resultado?.error?.mensaje === "string"
          ? resultado.error.mensaje
          : typeof resultado?.mensaje === "string"
            ? resultado.mensaje
            : null;
    if (mensajeServidor) {
      throw new Error(mensajeServidor);
    }
    throw new Error(traducirErrorSubida(new Error(`Error HTTP ${res.status}`), archivo, res.status));
  }
  return resultado.datos as T;
}

function agregarMetadataTecnica(
  formData: FormData,
  metadata?: MetadataTecnicaArchivo,
) {
  if (metadata?.anchoPx) formData.append("ancho_px", String(metadata.anchoPx));
  if (metadata?.altoPx) formData.append("alto_px", String(metadata.altoPx));
  if (metadata?.duracionSeg !== undefined && metadata.duracionSeg !== null) {
    formData.append("duracion_seg", String(metadata.duracionSeg));
  }
}

export async function subirArchivo(
  archivo: File,
  tipo: TipoRecursoMultimedia,
  textoAlternativo?: string,
  titulo?: string,
  metadata?: MetadataTecnicaArchivo,
): Promise<RecursoMultimedia> {
  const errorValidacion = validarArchivoMultimediaCliente(archivo, tipo);
  if (errorValidacion) {
    throw new Error(errorValidacion);
  }

  const tituloLimpio = (titulo ?? archivo.name.replace(/\.[^.]+$/, "")).trim() || "Recurso multimedia";
  const altFinal =
    textoAlternativo?.trim() ||
    (tipo === "imagen" ? `Ilustración de ${tituloLimpio}` : undefined);

  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("tipo", tipo);
  if (altFinal) formData.append("texto_alternativo", altFinal);
  if (tituloLimpio.length >= 2) formData.append("titulo", tituloLimpio);
  agregarMetadataTecnica(formData, metadata);
  return enviarFormulario<RecursoMultimedia>(RUTAS_API.MEDIA.SUBIR, formData);
}

export function obtenerRecursoMultimedia(id: string) {
  return peticion<DetalleRecursoMultimedia>(RUTAS_API.MEDIA.VER(id));
}

export function obtenerUrlFirmadaRecurso(id: string) {
  return peticion<{ url: string; expira_en_segundos: number }>(
    RUTAS_API.MEDIA.URL_FIRMADA(id),
  );
}

export function actualizarMetadatosRecurso(
  id: string,
  datos: { titulo?: string; textoAlternativo?: string | null },
) {
  return peticion<RecursoMultimedia>(RUTAS_API.MEDIA.ACTUALIZAR(id), {
    metodo: "PATCH",
    cuerpo: {
      titulo: datos.titulo,
      textoAlternativo: datos.textoAlternativo,
    },
  });
}

export async function reemplazarArchivoRecurso(
  id: string,
  archivo: File,
  datos: {
    titulo?: string;
    textoAlternativo?: string | null;
    metadata?: MetadataTecnicaArchivo;
  },
) {
  const formData = new FormData();
  formData.append("archivo", archivo);
  if (datos.titulo) formData.append("titulo", datos.titulo);
  if (datos.textoAlternativo !== undefined) {
    formData.append("texto_alternativo", datos.textoAlternativo ?? "");
  }
  agregarMetadataTecnica(formData, datos.metadata);
  return enviarFormulario<RecursoMultimedia>(
    RUTAS_API.MEDIA.REEMPLAZAR(id),
    formData,
  );
}

export function eliminarRecursoMultimedia(id: string) {
  return peticion<{ deleted: boolean }>(RUTAS_API.MEDIA.ELIMINAR(id), {
    metodo: "DELETE",
  });
}

export function obtenerRecursosMultimedia() {
  return peticion<RecursoMultimedia[]>(RUTAS_API.MEDIA.LISTAR);
}
