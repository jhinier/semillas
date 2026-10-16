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
  const res = await fetch(`${obtenerApiUrlPublica()}${ruta}`, {
    method: "POST",
    headers: headersAutenticacion(),
    body: formData,
  });
  const resultado = await res.json().catch(() => null);
  if (!res.ok || !resultado?.exito) {
    throw new Error(resultado?.error ?? "No se pudo procesar el archivo");
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
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("tipo", tipo);
  if (textoAlternativo) formData.append("texto_alternativo", textoAlternativo);
  if (titulo) formData.append("titulo", titulo);
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
