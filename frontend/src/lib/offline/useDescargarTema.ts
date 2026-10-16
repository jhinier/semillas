import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db, type TemaLocal } from "./db";
import { eliminarMedioDeCache } from "./media-cache";
import { descargarMediosTransaccional, eliminarMediosPromovidosNoUsados, prepararMediosParaGuardar } from "./download-transaction";
import { mapearPaqueteOfflineARegistros, type PaqueteOfflineRespuesta } from "./offline-package";
import { queueEventoProgreso } from "./outbox";
import { obtenerScopeOffline } from "./user-scope";
import { peticion } from "@/shared/api/api";

type DescargaTemaParams = {
  temaId: string;
  grupoEdadId?: string;
  perfilGrupoEdadId?: string;
  onProgress?: (progreso: number) => void;
};

export function useDescargarTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: descargarTemaOffline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offline"] });
      queryClient.invalidateQueries({ queryKey: ["sync"] });
      queryClient.invalidateQueries({ queryKey: ["temas"] });
    },
  });
}

export async function descargarTemaOffline({ temaId, grupoEdadId: grupoSolicitado, perfilGrupoEdadId, onProgress }: DescargaTemaParams) {
      const grupoEdadId = grupoSolicitado ?? perfilGrupoEdadId;

      if (!grupoEdadId) {
        throw new Error("Completa tu franja de edad antes de descargar contenido.");
      }

      const paquete = await peticion<PaqueteOfflineRespuesta>(`/temas/${temaId}/paquete-offline`, {
        metodo: "POST",
        cuerpo: { grupo_edad_id: grupoEdadId },
      });

      const temaExistente = await db.temas.where("serverId").equals(paquete.tema.id).first();
      const idsExistentes = new Map<string, string>();
      if (temaExistente?.serverId) idsExistentes.set(temaExistente.serverId, temaExistente.localId);
      if (temaExistente) {
        const [pasosExistentes, actividadesExistentes] = await Promise.all([
          db.pasos.where("temaLocalId").equals(temaExistente.localId).toArray(),
          db.actividades.where("temaLocalId").equals(temaExistente.localId).toArray(),
        ]);
        for (const paso of pasosExistentes) {
          if (paso.serverId) idsExistentes.set(paso.serverId, paso.localId);
        }
        for (const actividad of actividadesExistentes) {
          if (actividad.serverId) idsExistentes.set(actividad.serverId, actividad.localId);
        }
      }
      const registros = mapearPaqueteOfflineARegistros(paquete, idsExistentes);
      const temaLocalId = registros.tema.localId;
      const ahora = new Date().toISOString();

      const tema: TemaLocal = {
        ...registros.tema,
        localId: temaLocalId,
        serverId: paquete.tema.id,
        descargaEstado: "descargando",
        descargaProgreso: 0,
        descargadoEn: null,
        downloadedAt: registros.tema.downloadedAt,
        errorDescarga: null,
        syncStatus: "synced",
        createdAt: registros.tema.createdAt,
        updatedAt: ahora,
      };

      const pasos = registros.pasos.map((paso) => ({ ...paso, temaLocalId }));
      const actividades = registros.actividades.map((actividad) => ({
        ...actividad,
        temaLocalId,
      }));

      const mediosAnteriores = new Set((temaExistente?.mediaServerIds ?? []));
      const registrosMedios = await descargarMediosTransaccional(paquete, temaLocalId, (progreso) => {
        onProgress?.(Math.max(10, Math.min(95, progreso)));
        void db.temas.update(temaLocalId, {
          descargaProgreso: Math.max(10, Math.min(95, progreso)),
          descargaEstado: "descargando",
          updatedAt: new Date().toISOString(),
        });
      });

      try {
        await db.transaction("rw", [db.temas, db.pasos, db.actividades, db.mediaCache, db.mediaReferences], async () => {
        await db.pasos.where("temaLocalId").equals(temaLocalId).delete();
        await db.actividades.where("temaLocalId").equals(temaLocalId).delete();
        await db.mediaReferences.where("temaLocalId").equals(temaLocalId).delete();
        await db.temas.put(tema);
        if (pasos.length > 0) await db.pasos.bulkPut(pasos);
        if (actividades.length > 0) await db.actividades.bulkPut(actividades);
        const idsMedios = [...new Set(registrosMedios.map((registro) => registro.serverId))];
        const mediosExistentes = idsMedios.length > 0
          ? await db.mediaCache.where("serverId").anyOf(idsMedios).toArray()
          : [];
        const mediosParaGuardar = prepararMediosParaGuardar(registrosMedios, mediosExistentes);
        if (mediosParaGuardar.length > 0) await db.mediaCache.bulkPut(mediosParaGuardar);
        if (mediosParaGuardar.length > 0) {
          await db.mediaReferences.bulkPut(mediosParaGuardar.map((registro) => ({
            serverId: registro.serverId,
            temaLocalId,
            createdAt: Date.now(),
          })));
        }
        });
      } catch (error) {
        await eliminarMediosPromovidosNoUsados(registrosMedios.map((registro) => registro.serverId), mediosAnteriores);
        throw error;
      }

      await db.temas.update(temaLocalId, {
        descargaEstado: "descargado",
        descargaProgreso: 100,
        descargadoEn: ahora,
        errorDescarga: null,
        paqueteId: paquete.paquete_id,
        paqueteVersionContenido: paquete.tema.version_contenido,
        paqueteTamanoBytes: paquete.tamano_bytes,
        packageId: paquete.paquete_id,
        packageSizeBytes: paquete.tamano_bytes,
        mediaServerIds: paquete.medios.map((medio) => medio.id),
        downloadedAt: ahora,
        updatedAt: ahora,
      });

      await eliminarMediosPromovidosNoUsados(
        [...mediosAnteriores].filter((mediaId) => !paquete.medios.some((medio) => medio.id === mediaId)),
        new Set(paquete.medios.map((medio) => medio.id)),
      );

      await queueEventoProgreso("tema_descargado", {
        temaLocalId,
        datos: { tema_id: temaId, version_contenido: paquete.tema.version_contenido },
      });

      if (onProgress) onProgress(100);

      return {
        temaLocalId,
        pasosCount: pasos.length,
        actividadesCount: actividades.length,
        mediosCount: paquete.medios.length,
        paqueteId: paquete.paquete_id,
      };
}

export async function eliminarTemaDescargado(temaServerId: string): Promise<void> {
  const scopeId = await obtenerScopeOffline();
  if (!scopeId) throw new Error("No hay una sesión offline activa.");
  const tema = await db.temas.where("serverId").equals(temaServerId).first();
  if (!tema) return;

  const [pasos, actividades, eventos] = await Promise.all([
    db.pasos.where("temaLocalId").equals(tema.localId).toArray(),
    db.actividades.where("temaLocalId").equals(tema.localId).toArray(),
    db.eventosOutbox.filter((evento) => evento.scopeId === scopeId).toArray(),
  ]);
  const pasoIds = new Set(pasos.map((paso) => paso.localId));
  const actividadIds = new Set(actividades.map((actividad) => actividad.localId));
  const tieneProgresoPendiente = eventos.some((evento) =>
    evento.tipoEvento !== "tema_descargado" && (
      evento.temaLocalId === tema.localId ||
      Boolean(evento.pasoLocalId && pasoIds.has(evento.pasoLocalId)) ||
      Boolean(evento.actividadLocalId && actividadIds.has(evento.actividadLocalId))
    ),
  );
  if (tieneProgresoPendiente) {
    throw new Error("Este tema tiene progreso pendiente. Conéctate y sincroniza antes de eliminarlo.");
  }

  await db.transaction("rw", [db.temas, db.pasos, db.actividades, db.progresoUsuario, db.eventosOutbox, db.descargaJobs, db.mediaReferences, db.mediaCache], async () => {
    await db.eventosOutbox.toCollection().filter((evento) => evento.scopeId === scopeId && evento.temaLocalId === tema.localId && evento.tipoEvento === "tema_descargado").delete();
    await db.pasos.where("temaLocalId").equals(tema.localId).delete();
    await db.actividades.where("temaLocalId").equals(tema.localId).delete();
    await db.progresoUsuario.where("temaLocalId").equals(tema.localId).filter((item) => item.scopeId === scopeId).delete();
    await db.mediaReferences.where("temaLocalId").equals(tema.localId).delete();
    await db.temas.delete(tema.localId);
    await db.descargaJobs.delete(temaServerId);
  });
  for (const mediaId of tema.mediaServerIds ?? []) {
    const referencias = await db.mediaReferences.where("serverId").equals(mediaId).count();
    if (referencias === 0) await eliminarMedioDeCache(mediaId);
  }
}
