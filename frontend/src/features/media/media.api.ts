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

export const RECURSOS_MULTIMEDIA_PREDETERMINADOS: RecursoMultimedia[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    tipo: "imagen",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "ilustraciones/Semilla.webp",
    url_publica: "/src/assets/images/Ilustraciones/Semilla.webp",
    texto_alternativo: "Ilustración de la semilla inicial",
    titulo: "Semilla y brote inicial",
    tipo_mime: "image/webp",
    tamano_bytes: 145000,
    ancho_px: 800,
    alto_px: 600,
    duracion_seg: null,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-15T10:00:00Z",
    actualizado_en: "2026-10-15T10:00:00Z",
    uso_total: 4,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    tipo: "imagen",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "ilustraciones/Exploradores.webp",
    url_publica: "/src/assets/images/Ilustraciones/Exploradores.webp",
    texto_alternativo: "Ilustración de la franja exploradores",
    titulo: "Franja Exploradores (9 a 12 años)",
    tipo_mime: "image/webp",
    tamano_bytes: 182000,
    ancho_px: 800,
    alto_px: 600,
    duracion_seg: null,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-16T11:00:00Z",
    actualizado_en: "2026-10-16T11:00:00Z",
    uso_total: 3,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    tipo: "imagen",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "ilustraciones/Embajadores.webp",
    url_publica: "/src/assets/images/Ilustraciones/Embajadores.webp",
    texto_alternativo: "Ilustración de la franja embajadores",
    titulo: "Franja Embajadores (13 a 17 años)",
    tipo_mime: "image/webp",
    tamano_bytes: 195000,
    ancho_px: 800,
    alto_px: 600,
    duracion_seg: null,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-17T12:00:00Z",
    actualizado_en: "2026-10-17T12:00:00Z",
    uso_total: 2,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    tipo: "imagen",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "ilustraciones/Tema1.webp",
    url_publica: "/src/assets/images/Ilustraciones/Tema1.webp",
    texto_alternativo: "Portada del tema El Amor de Dios",
    titulo: "Portada - El Amor de Dios",
    tipo_mime: "image/webp",
    tamano_bytes: 230000,
    ancho_px: 1200,
    alto_px: 800,
    duracion_seg: null,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-18T09:00:00Z",
    actualizado_en: "2026-10-18T09:00:00Z",
    uso_total: 5,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    tipo: "imagen",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "ilustraciones/Versiculo del dia.webp",
    url_publica: "/src/assets/images/Ilustraciones/Versiculo del dia.webp",
    texto_alternativo: "Insignia de Versículo del Día",
    titulo: "Insignia - Versículo del Día",
    tipo_mime: "image/webp",
    tamano_bytes: 120000,
    ancho_px: 512,
    alto_px: 512,
    duracion_seg: null,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-19T14:00:00Z",
    actualizado_en: "2026-10-19T14:00:00Z",
    uso_total: 2,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    tipo: "imagen",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "ilustraciones/Conectar.webp",
    url_publica: "/src/assets/images/Ilustraciones/Conectar.webp",
    texto_alternativo: "CRECER paso Conectar",
    titulo: "CRECER - Conectar",
    tipo_mime: "image/webp",
    tamano_bytes: 165000,
    ancho_px: 600,
    alto_px: 600,
    duracion_seg: null,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-20T15:00:00Z",
    actualizado_en: "2026-10-20T15:00:00Z",
    uso_total: 6,
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    tipo: "audio",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "sonidos/acertado.mp3",
    url_publica: "/src/assets/Sonidos/acertado.mp3",
    texto_alternativo: "Efecto de respuesta correcta",
    titulo: "Sonido de Acierto",
    tipo_mime: "audio/mpeg",
    tamano_bytes: 45000,
    ancho_px: null,
    alto_px: null,
    duracion_seg: 2,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-21T08:00:00Z",
    actualizado_en: "2026-10-21T08:00:00Z",
    uso_total: 12,
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    tipo: "audio",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "sonidos/insignia.mp3",
    url_publica: "/src/assets/Sonidos/insignia.mp3",
    texto_alternativo: "Efecto fanfarria de insignia",
    titulo: "Fanfarria de Insignia",
    tipo_mime: "audio/mpeg",
    tamano_bytes: 78000,
    ancho_px: null,
    alto_px: null,
    duracion_seg: 4,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-21T08:30:00Z",
    actualizado_en: "2026-10-21T08:30:00Z",
    uso_total: 8,
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    tipo: "video",
    bucket_almacenamiento: "semillas-media",
    clave_almacenamiento: "videos/historia.mp4",
    url_publica: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    texto_alternativo: "Video sobre la fe y el amor de Dios",
    titulo: "Video - Historia Bíblica Animada",
    tipo_mime: "video/mp4",
    tamano_bytes: 15400000,
    ancho_px: 1280,
    alto_px: 720,
    duracion_seg: 180,
    creado_por: "Administrador",
    activo: true,
    creado_en: "2026-10-22T09:00:00Z",
    actualizado_en: "2026-10-22T09:00:00Z",
    uso_total: 1,
  },
];

export async function obtenerRecursoMultimedia(id: string): Promise<DetalleRecursoMultimedia> {
  try {
    return await peticion<DetalleRecursoMultimedia>(RUTAS_API.MEDIA.VER(id));
  } catch {
    const fallback = RECURSOS_MULTIMEDIA_PREDETERMINADOS.find((r) => r.id === id) ?? {
      id,
      tipo: "imagen" as const,
      bucket_almacenamiento: null,
      clave_almacenamiento: null,
      url_publica: "/src/assets/images/Ilustraciones/Semilla.webp",
      texto_alternativo: "Recurso multimedia",
      titulo: "Recurso multimedia",
      tipo_mime: "image/webp",
      tamano_bytes: 145000,
      ancho_px: 800,
      alto_px: 600,
      duracion_seg: null,
      creado_por: "Administrador",
      activo: true,
      creado_en: "2026-10-15T10:00:00Z",
      actualizado_en: "2026-10-15T10:00:00Z",
      uso_total: 1,
    };

    return {
      ...fallback,
      uso_total: fallback.uso_total ?? 1,
      puede_eliminar: false,
      usos: [
        {
          tipo: "tema",
          entidad_id: "47a2e22f-86da-466f-92ff-1847d85de609",
          titulo: "El Amor de Dios",
          contexto: "Ilustración educativa",
          tema_id: "47a2e22f-86da-466f-92ff-1847d85de609",
          href: "/admin/temas",
        },
      ],
      subido_por_usuario: {
        id: "aff4c70c-086c-43f3-8501-b55bb13807b2",
        nombre_visible: "Administrador",
        correo: "admin@correo.com",
      },
    };
  }
}

export async function obtenerUrlFirmadaRecurso(id: string) {
  try {
    return await peticion<{ url: string; expira_en_segundos: number }>(
      RUTAS_API.MEDIA.URL_FIRMADA(id),
    );
  } catch {
    const item = RECURSOS_MULTIMEDIA_PREDETERMINADOS.find((r) => r.id === id);
    return {
      url: item?.url_publica || "/src/assets/images/Ilustraciones/Semilla.webp",
      expira_en_segundos: 3600,
    };
  }
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

export async function obtenerRecursosMultimedia(): Promise<RecursoMultimedia[]> {
  try {
    const datos = await peticion<RecursoMultimedia[]>(RUTAS_API.MEDIA.LISTAR);
    if (Array.isArray(datos) && datos.length > 0) {
      return datos;
    }
    return RECURSOS_MULTIMEDIA_PREDETERMINADOS;
  } catch (error) {
    console.warn("[MediaAPI] No se pudo obtener recursos de la API remota, usando catálogo predeterminado:", error);
    return RECURSOS_MULTIMEDIA_PREDETERMINADOS;
  }
}