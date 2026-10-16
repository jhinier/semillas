import { NotFoundError } from "../../shared/errors/http-error";
import { crearMediaRepository } from "./media.repository";
import {
  actualizarRecursoSchema,
  crearRecursoSchema,
  reemplazarRecursoSchema,
} from "./media.schemas";
import {
  validarArchivoMultimedia,
  type TipoRecurso,
} from "./media.file-validation";
import { construirUsosRecurso } from "./media.usage";
import { registrarAuditoriaSegura, snapshotRecurso } from "./media.audit";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SIGNED_URL_EXPIRES_IN_SECONDS = 300;

function validarUuid(id: string) {
  if (UUID_REGEX.test(id)) return null;
  return {
    error: {
      mensaje: "El ID del recurso multimedia debe ser un UUID válido",
      codigo: "VALIDATION_ERROR",
      estado: 400,
    },
  } as const;
}

export function crearCasosUsoMedia(
  repositorio: ReturnType<typeof crearMediaRepository>,
) {
  return {
    async subir({
      archivo,
      tipoRaw,
      textoAlternativo,
      titulo,
      userId,
      anchoPx,
      altoPx,
      duracionSeg,
    }: {
      archivo: File;
      tipoRaw: unknown;
      textoAlternativo?: string;
      titulo?: string;
      userId: string;
      anchoPx?: number | null;
      altoPx?: number | null;
      duracionSeg?: number | null;
    }) {
      const parsed = crearRecursoSchema.safeParse({
        tipo: tipoRaw,
        textoAlternativo,
        titulo,
        anchoPx,
        altoPx,
        duracionSeg,
      });
      if (!parsed.success) {
        return {
          error: {
            mensaje: `Datos inválidos: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`,
            codigo: "VALIDATION_ERROR",
            estado: 400,
          },
        } as const;
      }

      const tipo = parsed.data.tipo as TipoRecurso;
      if (tipo === "imagen" && !parsed.data.textoAlternativo?.trim()) {
        return {
          error: {
            mensaje: "Las imágenes requieren texto alternativo",
            codigo: "ALT_REQUIRED",
            estado: 400,
          },
        } as const;
      }
      const validacion = await validarArchivoMultimedia(archivo, tipo);
      if (!validacion.ok) return { error: validacion.error } as const;

      const storagePath = `${tipo}/${userId}/${crypto.randomUUID()}-${validacion.cleanName}`;
      const { error: uploadError } = await repositorio.subirArchivo(
        storagePath,
        archivo,
      );
      if (uploadError) {
        return {
          error: {
            mensaje: "Error al subir el archivo al almacenamiento",
            codigo: "STORAGE_ERROR",
            estado: 500,
          },
        } as const;
      }

      let recursoCreadoId: string | null = null;
      try {
        const creado = await repositorio.insertarRecurso({
          tipo,
          bucket_almacenamiento: repositorio.bucket,
          clave_almacenamiento: storagePath,
          url_publica: "",
          texto_alternativo: parsed.data.textoAlternativo ?? null,
          titulo: parsed.data.titulo ?? validacion.cleanName,
          tipo_mime: archivo.type,
          tamano_bytes: archivo.size,
          ancho_px: parsed.data.anchoPx ?? null,
          alto_px: parsed.data.altoPx ?? null,
          duracion_seg: parsed.data.duracionSeg ?? null,
          creado_por: userId,
          activo: true,
        });
        recursoCreadoId = creado.id;
        const recurso = await repositorio.actualizarRutaAcceso(
          creado.id,
          `/media/${creado.id}/url`,
        );
        await registrarAuditoriaSegura(repositorio, {
          actorUsuarioId: userId,
          accion: "crear",
          entidadId: creado.id,
          datosDespues: snapshotRecurso(recurso as unknown as Record<string, unknown>),
        });
        return { recurso } as const;
      } catch (error) {
        await repositorio.eliminarArchivo(repositorio.bucket, storagePath);
        if (recursoCreadoId) await repositorio.eliminarRegistro(recursoCreadoId);
        throw error;
      }
    },

    async obtenerUrl(id: string) {
      const invalid = validarUuid(id);
      if (invalid) return invalid;
      const recurso = await repositorio.obtenerRecursoActivo(id);
      if (!recurso?.clave_almacenamiento) {
        throw new NotFoundError("Recurso multimedia no encontrado");
      }
      const bucket = recurso.bucket_almacenamiento ?? repositorio.bucket;
      const { data, error } = await repositorio.crearURLFirmada(
        bucket,
        recurso.clave_almacenamiento,
        SIGNED_URL_EXPIRES_IN_SECONDS,
      );
      if (error || !data?.signedUrl) {
        return {
          error: {
            mensaje: "Error al crear URL firmada del recurso",
            codigo: "STORAGE_ERROR",
            estado: 500,
          },
        } as const;
      }
      return {
        url: data.signedUrl,
        expiraEnSegundos: SIGNED_URL_EXPIRES_IN_SECONDS,
      } as const;
    },

    async listar() {
      const [recursos, fuentes] = await Promise.all([
        repositorio.listarRecursosActivos(),
        repositorio.listarFuentesUso(),
      ]);
      return Promise.all(
        recursos.map(async (recurso) => {
          let url = recurso.url_publica;
          if (recurso.clave_almacenamiento) {
            const bucket = recurso.bucket_almacenamiento ?? repositorio.bucket;
            const { data } = await repositorio.crearURLFirmada(
              bucket,
              recurso.clave_almacenamiento,
              SIGNED_URL_EXPIRES_IN_SECONDS,
            );
            url = data?.signedUrl ?? url;
          }
          return {
            ...recurso,
            url_publica: url,
            uso_total: construirUsosRecurso(recurso.id, fuentes).length,
          };
        }),
      );
    },

    async obtener(id: string) {
      const invalid = validarUuid(id);
      if (invalid) return invalid;
      const recurso = await repositorio.obtenerRecursoActivo(id);
      if (!recurso) throw new NotFoundError("Recurso multimedia no encontrado");

      const [fuentes, creador] = await Promise.all([
        repositorio.listarFuentesUso(),
        repositorio.obtenerCreador(recurso.creado_por),
      ]);
      const usos = construirUsosRecurso(id, fuentes);
      let url = recurso.url_publica;
      if (recurso.clave_almacenamiento) {
        const bucket = recurso.bucket_almacenamiento ?? repositorio.bucket;
        const { data } = await repositorio.crearURLFirmada(
          bucket,
          recurso.clave_almacenamiento,
          SIGNED_URL_EXPIRES_IN_SECONDS,
        );
        url = data?.signedUrl ?? url;
      }

      return {
        ...recurso,
        url_publica: url,
        uso_total: usos.length,
        puede_eliminar: usos.length === 0,
        usos,
        subido_por_usuario: creador,
      } as const;
    },

    async actualizar(
      id: string,
      entrada: unknown,
      actorUsuarioId: string,
    ) {
      const invalid = validarUuid(id);
      if (invalid) return invalid;
      const parsed = actualizarRecursoSchema.safeParse(entrada);
      if (!parsed.success) {
        return {
          error: {
            mensaje: parsed.error.issues.map((issue) => issue.message).join(", "),
            codigo: "VALIDATION_ERROR",
            estado: 400,
          },
        } as const;
      }
      const existente = await repositorio.obtenerRecursoActivo(id);
      if (!existente) throw new NotFoundError("Recurso multimedia no encontrado");

      const actualizado = await repositorio.actualizarRecurso(id, {
        titulo: parsed.data.titulo,
        texto_alternativo: parsed.data.textoAlternativo,
      });
      await registrarAuditoriaSegura(repositorio, {
        actorUsuarioId,
        accion: "actualizar_metadatos",
        entidadId: id,
        datosAntes: snapshotRecurso(existente as unknown as Record<string, unknown>),
        datosDespues: snapshotRecurso(actualizado as unknown as Record<string, unknown>),
      });
      return { recurso: actualizado } as const;
    },

    async reemplazar({
      id,
      archivo,
      entrada,
      actorUsuarioId,
    }: {
      id: string;
      archivo: File;
      entrada: unknown;
      actorUsuarioId: string;
    }) {
      const invalid = validarUuid(id);
      if (invalid) return invalid;
      const parsed = reemplazarRecursoSchema.safeParse(entrada);
      if (!parsed.success) {
        return {
          error: {
            mensaje: parsed.error.issues.map((issue) => issue.message).join(", "),
            codigo: "VALIDATION_ERROR",
            estado: 400,
          },
        } as const;
      }
      const existente = await repositorio.obtenerRecursoActivo(id);
      if (!existente) throw new NotFoundError("Recurso multimedia no encontrado");

      const tipo = existente.tipo as TipoRecurso;
      const validacion = await validarArchivoMultimedia(archivo, tipo);
      if (!validacion.ok) {
        return {
          error: {
            ...validacion.error,
            mensaje: `El reemplazo debe conservar el tipo ${tipo}. ${validacion.error.mensaje}`,
          },
        } as const;
      }

      const bucket = existente.bucket_almacenamiento ?? repositorio.bucket;
      const nuevaClave = `${tipo}/${actorUsuarioId}/reemplazos/${crypto.randomUUID()}-${validacion.cleanName}`;
      const { error: uploadError } = await repositorio.subirArchivo(
        nuevaClave,
        archivo,
        bucket,
      );
      if (uploadError) {
        return {
          error: {
            mensaje: "No se pudo subir el archivo de reemplazo",
            codigo: "STORAGE_ERROR",
            estado: 500,
          },
        } as const;
      }

      try {
        const actualizado = await repositorio.actualizarRecurso(id, {
          bucket_almacenamiento: bucket,
          clave_almacenamiento: nuevaClave,
          url_publica: `/media/${id}/url`,
          tipo_mime: archivo.type,
          tamano_bytes: archivo.size,
          ancho_px: parsed.data.anchoPx ?? null,
          alto_px: parsed.data.altoPx ?? null,
          duracion_seg: parsed.data.duracionSeg ?? null,
          titulo: parsed.data.titulo ?? existente.titulo,
          texto_alternativo:
            parsed.data.textoAlternativo === undefined
              ? existente.texto_alternativo
              : parsed.data.textoAlternativo,
        });

        if (existente.clave_almacenamiento) {
          await repositorio.eliminarArchivo(bucket, existente.clave_almacenamiento);
        }
        await registrarAuditoriaSegura(repositorio, {
          actorUsuarioId,
          accion: "reemplazar_archivo",
          entidadId: id,
          datosAntes: snapshotRecurso(existente as unknown as Record<string, unknown>),
          datosDespues: snapshotRecurso(actualizado as unknown as Record<string, unknown>),
        });
        return { recurso: actualizado } as const;
      } catch (error) {
        await repositorio.eliminarArchivo(bucket, nuevaClave);
        throw error;
      }
    },

    async eliminar(id: string, actorUsuarioId: string) {
      const invalid = validarUuid(id);
      if (invalid) return invalid;
      const existente = await repositorio.obtenerRecursoActivo(id);
      if (!existente) throw new NotFoundError("Recurso multimedia no encontrado");

      const fuentes = await repositorio.listarFuentesUso();
      const usos = construirUsosRecurso(id, fuentes);
      if (usos.length) {
        return {
          error: {
            mensaje: `No se puede eliminar este recurso porque está en uso en ${usos.length} ${usos.length === 1 ? "lugar" : "lugares"}. Revisa el panel de usos o reemplaza el archivo conservando sus referencias.`,
            codigo: "MEDIA_IN_USE",
            estado: 409,
          },
        } as const;
      }

      if (existente.clave_almacenamiento) {
        const bucket = existente.bucket_almacenamiento ?? repositorio.bucket;
        const { error } = await repositorio.eliminarArchivo(
          bucket,
          existente.clave_almacenamiento,
        );
        if (error) {
          return {
            error: {
              mensaje: "Error al eliminar el archivo del almacenamiento",
              codigo: "STORAGE_ERROR",
              estado: 500,
            },
          } as const;
        }
      }
      await repositorio.desactivarRecurso(id);
      await registrarAuditoriaSegura(repositorio, {
        actorUsuarioId,
        accion: "eliminar",
        entidadId: id,
        datosAntes: snapshotRecurso(existente as unknown as Record<string, unknown>),
        datosDespues: { activo: false },
      });
      return { deleted: true } as const;
    },
  };
}
