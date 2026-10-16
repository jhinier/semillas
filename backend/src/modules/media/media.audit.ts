import type { Json } from "../../db/database.types";
import type { MediaRepository } from "./media.repository";

export function snapshotRecurso(recurso: Record<string, unknown>): Json {
  return {
    id: String(recurso.id ?? ""),
    titulo: (recurso.titulo as string | null | undefined) ?? null,
    texto_alternativo:
      (recurso.texto_alternativo as string | null | undefined) ?? null,
    tipo_mime: (recurso.tipo_mime as string | null | undefined) ?? null,
    tamano_bytes: (recurso.tamano_bytes as number | null | undefined) ?? null,
    bucket_almacenamiento:
      (recurso.bucket_almacenamiento as string | null | undefined) ?? null,
    clave_almacenamiento:
      (recurso.clave_almacenamiento as string | null | undefined) ?? null,
    activo: Boolean(recurso.activo),
  };
}

export async function registrarAuditoriaSegura(
  repositorio: MediaRepository,
  datos: Parameters<MediaRepository["registrarAuditoria"]>[0],
) {
  try {
    await repositorio.registrarAuditoria(datos);
  } catch (error) {
    console.error("No se pudo registrar auditoría de recurso multimedia", error);
  }
}
