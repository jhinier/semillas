import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db, type TemaLocal } from "./db";
import { eliminarMedioDeCache } from "./media-cache";
import { descargarMediosTransaccional, eliminarMediosPromovidosNoUsados, prepararMediosParaGuardar } from "./download-transaction";
import { mapearPaqueteOfflineARegistros, type PaqueteOfflineRespuesta } from "./offline-package";
import { queueEventoProgreso } from "./outbox";
import { obtenerScopeOffline } from "./user-scope";
import { peticion } from "@/shared/api/api";
import { obtenerTema } from "@/features/themes/themes.api";
import {
  construirActividadesFallback,
  obtenerSeedSendaEdad,
  resolverClaveSendaTema,
  resolverCodigoGrupoEdad,
} from "@/features/crecer/hooks/use-crecer-fase";

type DescargaTemaParams = {
  temaId: string;
  grupoEdadId?: string;
  perfilGrupoEdadId?: string;
  onProgress?: (progreso: number) => void;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizarGrupoEdadUuid(grupoEdadId?: string | null): string {
  if (!grupoEdadId) return "10000000-0000-0000-0000-000000000001";
  if (UUID_REGEX.test(grupoEdadId)) return grupoEdadId;
  const limpio = grupoEdadId.toLowerCase();
  if (limpio.includes("embajador")) return "10000000-0000-0000-0000-000000000003";
  if (limpio.includes("explorador")) return "10000000-0000-0000-0000-000000000002";
  return "10000000-0000-0000-0000-000000000001";
}

async function construirPaqueteOfflineResiliente(
  temaId: string,
  grupoEdadUuid: string,
  paqueteBase?: PaqueteOfflineRespuesta | null,
): Promise<PaqueteOfflineRespuesta> {
  const ahora = new Date().toISOString();
  const temaInfo = paqueteBase?.tema ?? (await obtenerTema(temaId));
  const claveSenda = resolverClaveSendaTema(temaInfo);
  const codigoEdad = resolverCodigoGrupoEdad(grupoEdadUuid);
  const seed = obtenerSeedSendaEdad(claveSenda, codigoEdad);

  const definicionPasos: Array<{
    orden: number;
    codigo: "conectar" | "relatar" | "ensenar" | "comprobar" | "experimentar" | "recompensar";
    nombre: string;
    color: string;
  }> = [
    { orden: 1, codigo: "conectar", nombre: "Conectar", color: "#3D8BD4" },
    { orden: 2, codigo: "relatar", nombre: "Relatar", color: "#2E9E5B" },
    { orden: 3, codigo: "ensenar", nombre: "Enseñar", color: "#E9A23B" },
    { orden: 4, codigo: "comprobar", nombre: "Comprobar", color: "#7E57C2" },
    { orden: 5, codigo: "experimentar", nombre: "Experimentar", color: "#17A398" },
    { orden: 6, codigo: "recompensar", nombre: "Recompensar", color: "#EE6C4D" },
  ];

  const pasosExistentesPorCodigo = new Map(
    (paqueteBase?.pasos ?? []).flatMap((p) =>
      p.tipo_paso?.codigo ? [[p.tipo_paso.codigo, p] as const] : [],
    ),
  );

  const pasosCompletos: PaqueteOfflineRespuesta["pasos"] = definicionPasos.map((def) => {
    const existente = pasosExistentesPorCodigo.get(def.codigo);
    const pasoId = existente?.id ?? `offline-paso-${temaInfo.id}-${def.codigo}`;
    const seedPaso = seed.pasos[def.codigo];
    const tieneContenidoValido =
      existente &&
      existente.contenidos.length > 0 &&
      (def.codigo !== "conectar" || (existente.contenidos[0]?.cuerpo?.length ?? 0) >= 200);

    const contenidos: PaqueteOfflineRespuesta["pasos"][number]["contenidos"] = tieneContenidoValido
      ? existente.contenidos.map((c) => ({
          ...c,
          datos_extra: {
            ...(c.datos_extra ?? {}),
            ...(def.codigo === "conectar" ? { detalle_senda: seed.detalle } : {}),
            cita_biblica: seed.detalle.citaBiblica,
            versiculo_clave: seed.detalle.versiculoClave,
          },
        }))
      : [
          {
            id: `offline-cont-${temaInfo.id}-${def.codigo}-${codigoEdad}`,
            paso_id: pasoId,
            grupo_edad_id: grupoEdadUuid,
            titulo: seedPaso.titulo,
            cuerpo: seedPaso.cuerpo,
            instruccion_corta: seedPaso.instruccion_corta,
            recurso_id: null,
            recurso_audio_id: null,
            datos_extra: {
              ...(def.codigo === "conectar" ? { detalle_senda: seed.detalle } : {}),
              cita_biblica: seed.detalle.citaBiblica,
              versiculo_clave: seed.detalle.versiculoClave,
            },
          },
        ];

    const preguntas: PaqueteOfflineRespuesta["pasos"][number]["preguntas"] =
      existente && existente.preguntas.length > 0
        ? existente.preguntas
        : def.codigo === "experimentar" && seedPaso.pregunta_reflexion
          ? [
              {
                id: `offline-preg-${temaInfo.id}-${codigoEdad}`,
                paso_id: pasoId,
                grupo_edad_id: grupoEdadUuid,
                pregunta: seedPaso.pregunta_reflexion,
                orden: 1,
              },
            ]
          : [];

    return {
      id: pasoId,
      tema_id: temaInfo.id,
      orden: def.orden,
      obligatorio: true,
      tipo_paso: existente?.tipo_paso ?? {
        id: def.codigo,
        codigo: def.codigo,
        nombre: def.nombre,
        descripcion: null,
        orden: def.orden,
        color_hex: def.color,
      },
      contenidos,
      preguntas,
    };
  });

  const pasoComprobarId =
    pasosCompletos.find((p) => p.tipo_paso?.codigo === "comprobar")?.id ??
    `offline-paso-${temaInfo.id}-comprobar`;

  const actividadesBase = paqueteBase?.actividades ?? [];
  const actividadesCompletas: PaqueteOfflineRespuesta["actividades"] =
    actividadesBase.length >= 2
      ? actividadesBase.map((act) => ({
          ...act,
          paso_id: act.paso_id ?? pasoComprobarId,
        }))
      : construirActividadesFallback(
          temaInfo.id,
          pasoComprobarId,
          grupoEdadUuid,
          claveSenda,
          codigoEdad,
        ).map((act) => ({
          id: act.id,
          tema_id: act.tema_id,
          paso_id: pasoComprobarId,
          grupo_edad_id: grupoEdadUuid,
          tipo_actividad_id: act.tipo_actividad_id,
          titulo: act.titulo,
          consigna: act.consigna ?? "",
          orden: act.orden,
          xp_recompensa: act.xp_recompensa,
          dificultad: act.dificultad,
          limite_tiempo_seg: act.limite_tiempo_seg,
          obligatorio: act.obligatorio,
          retroalimentacion: act.retroalimentacion,
          configuracion: (act.configuracion as Record<string, unknown>) ?? {},
          creado_en: act.creado_en ?? ahora,
          actualizado_en: act.actualizado_en ?? ahora,
          tipo_actividad: act.tipo_actividad
            ? {
                id: act.tipo_actividad.id,
                codigo: act.tipo_actividad.codigo,
                nombre: act.tipo_actividad.nombre,
                descripcion: act.tipo_actividad.descripcion ?? null,
                es_juego: act.tipo_actividad.es_juego ?? false,
                activo: act.tipo_actividad.activo ?? true,
                creado_en: act.creado_en ?? ahora,
              }
            : null,
          opciones: (act.opciones ?? []).map((op) => ({
            id: op.id,
            actividad_id: act.id,
            etiqueta: op.etiqueta ?? null,
            texto: op.texto,
            orden: op.orden,
            correcta: op.correcta,
            retroalimentacion: op.retroalimentacion ?? null,
          })),
        }));

  const medios = paqueteBase?.medios ?? [];
  const bytesJson = new TextEncoder().encode(
    JSON.stringify({ tema: temaInfo, pasos: pasosCompletos, actividades: actividadesCompletas }),
  ).byteLength;
  const tamanoBytes = Math.max(paqueteBase?.tamano_bytes ?? 0, bytesJson + 2_200_000);

  return {
    paquete_id: paqueteBase?.paquete_id ?? `local-pkg-${temaInfo.id}-${codigoEdad}`,
    tamano_bytes: tamanoBytes,
    schema_version: 1,
    generado_en: ahora,
    grupo_edad_id: grupoEdadUuid,
    tema: {
      id: temaInfo.id,
      senda_id: temaInfo.senda_id,
      titulo: temaInfo.titulo,
      slug: temaInfo.slug,
      objetivo: temaInfo.objetivo,
      resumen: temaInfo.resumen ?? temaInfo.objetivo,
      portada_recurso_id: temaInfo.portada_recurso_id ?? null,
      estado: temaInfo.estado ?? "publicado",
      version_biblica_id: temaInfo.version_biblica_id ?? null,
      xp_recompensa: temaInfo.xp_recompensa ?? 150,
      minutos_estimados: temaInfo.minutos_estimados ?? 20,
      version_contenido: temaInfo.version_contenido ?? 1,
      publicado_en: temaInfo.publicado_en ?? ahora,
      creado_en: ahora,
      actualizado_en: temaInfo.actualizado_en ?? ahora,
      senda: temaInfo.senda
        ? {
            id: temaInfo.senda.id,
            codigo: temaInfo.senda.codigo,
            nombre: temaInfo.senda.nombre,
            descripcion: temaInfo.senda.descripcion ?? null,
            color_hex: temaInfo.senda.color_hex,
            nombre_icono: temaInfo.senda.nombre_icono ?? null,
            orden: temaInfo.senda.orden ?? 1,
          }
        : null,
      portada_recurso: temaInfo.portada_recurso
        ? {
            id: temaInfo.portada_recurso.id,
            url_publica: temaInfo.portada_recurso.url_publica,
            texto_alternativo: temaInfo.portada_recurso.texto_alternativo ?? temaInfo.titulo,
            titulo: temaInfo.portada_recurso.titulo ?? temaInfo.titulo,
          }
        : null,
    },
    pasos: pasosCompletos,
    actividades: actividadesCompletas,
    medios,
  };
}

async function preCachearRutasTemaOffline(temaId: string): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return;
  }

  try {
    const [navCache, codeCache] = await Promise.all([
      caches.open("semillas-navigation-shell-v1"),
      caches.open("semillas-app-code-v1"),
    ]);

    const resIndex = await fetch("/index.html", { credentials: "same-origin" }).catch(() => null);
    if (resIndex && resIndex.ok) {
      const rutas = [
        "/",
        "/index.html",
        "/app",
        "/app/temas",
        "/app/descargas",
        `/app/temas/${temaId}`,
        `/app/C_conectar/${temaId}`,
        `/app/R_relatar/${temaId}`,
        `/app/E_ensenar/${temaId}`,
        `/app/C_comprobar/${temaId}`,
        `/app/E_experimentar/${temaId}`,
        `/app/R_recompensar/${temaId}`,
      ];
      await Promise.allSettled(
        rutas.map((ruta) => navCache.put(ruta, resIndex.clone())),
      );
    }

    const recursos = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((url) => {
        try {
          const parsed = new URL(url, window.location.origin);
          if (parsed.origin !== window.location.origin) return false;
          return (
            parsed.pathname.startsWith("/src/") ||
            parsed.pathname.startsWith("/node_modules/") ||
            parsed.pathname.startsWith("/@") ||
            parsed.pathname.startsWith("/assets/") ||
            parsed.pathname.endsWith(".js") ||
            parsed.pathname.endsWith(".ts") ||
            parsed.pathname.endsWith(".tsx") ||
            parsed.pathname.endsWith(".css")
          );
        } catch {
          return false;
        }
      });

    await Promise.allSettled(
      recursos.map(async (url) => {
        const yaExiste = await codeCache.match(url);
        if (!yaExiste) {
          const res = await fetch(url, { credentials: "same-origin" }).catch(() => null);
          if (res && res.ok) {
            await codeCache.put(url, res.clone());
          }
        }
      }),
    );
  } catch {
    // ignorar si CacheStorage no está disponible
  }
}

function verificarRestriccionWifi(): void {
  if (typeof window === "undefined") return;
  try {
    const soloWifi = window.localStorage.getItem("semillas-pref-wifi-only") === "true";
    if (!soloWifi) return;

    const nav = navigator as Navigator & {
      connection?: { type?: string; effectiveType?: string; saveData?: boolean };
    };
    const conn = nav.connection;
    if (conn && (conn.type === "cellular" || conn.saveData === true)) {
      throw new Error(
        "Tienes activada la opción «Descargas solo con Wi-Fi» en tus Preferencias. Conéctate a una red Wi-Fi o desactiva esta opción en Perfil → Preferencias.",
      );
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("Descargas solo con Wi-Fi")) {
      throw err;
    }
  }
}

export function useDescargarTema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: descargarTemaOffline,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["offline"] });
      void queryClient.invalidateQueries({ queryKey: ["sync"] });
      void queryClient.invalidateQueries({ queryKey: ["temas"] });
      void queryClient.invalidateQueries({ queryKey: ["theme"] });
    },
  });
}

export async function descargarTemaOffline({
  temaId,
  grupoEdadId: grupoSolicitado,
  perfilGrupoEdadId,
  onProgress,
}: DescargaTemaParams) {
  verificarRestriccionWifi();

  const grupoEdadUuid = normalizarGrupoEdadUuid(grupoSolicitado ?? perfilGrupoEdadId);
  onProgress?.(10);

  let paqueteRemoto: PaqueteOfflineRespuesta | null = null;
  if (typeof navigator === "undefined" || navigator.onLine) {
    try {
      paqueteRemoto = await peticion<PaqueteOfflineRespuesta>(`/temas/${temaId}/paquete-offline`, {
        metodo: "POST",
        cuerpo: { grupo_edad_id: grupoEdadUuid },
      });
    } catch {
      paqueteRemoto = null;
    }
  }

  const paquete = await construirPaqueteOfflineResiliente(temaId, grupoEdadUuid, paqueteRemoto);
  onProgress?.(35);

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
    descargaProgreso: 40,
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

  const mediosAnteriores = new Set(temaExistente?.mediaServerIds ?? []);
  const registrosMedios = await descargarMediosTransaccional(
    paquete,
    temaLocalId,
    (progreso) => {
      onProgress?.(Math.max(40, Math.min(95, progreso)));
      void db.temas.update(temaLocalId, {
        descargaProgreso: Math.max(40, Math.min(95, progreso)),
        descargaEstado: "descargando",
        updatedAt: new Date().toISOString(),
      });
    },
    { tolerarFallos: true },
  );

  try {
    await db.transaction("rw", [db.temas, db.pasos, db.actividades, db.mediaCache, db.mediaReferences, db.descargaJobs], async () => {
      await db.pasos.where("temaLocalId").equals(temaLocalId).delete();
      await db.actividades.where("temaLocalId").equals(temaLocalId).delete();
      await db.mediaReferences.where("temaLocalId").equals(temaLocalId).delete();
      await db.descargaJobs.delete(temaId);
      await db.descargaJobs.delete(paquete.tema.id);
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
        await db.mediaReferences.bulkPut(
          mediosParaGuardar.map((registro) => ({
            serverId: registro.serverId,
            temaLocalId,
            createdAt: Date.now(),
          })),
        );
      }
    });
  } catch (error) {
    await eliminarMediosPromovidosNoUsados(
      registrosMedios.map((registro) => registro.serverId),
      mediosAnteriores,
    );
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
    mediaServerIds: registrosMedios.map((medio) => medio.serverId),
    downloadedAt: ahora,
    updatedAt: ahora,
  });

  await eliminarMediosPromovidosNoUsados(
    [...mediosAnteriores].filter((mediaId) => !registrosMedios.some((medio) => medio.serverId === mediaId)),
    new Set(registrosMedios.map((medio) => medio.serverId)),
  );

  await queueEventoProgreso("tema_descargado", {
    temaLocalId,
    datos: { tema_id: temaId, version_contenido: paquete.tema.version_contenido },
  }).catch(() => undefined);

  await preCachearRutasTemaOffline(paquete.tema.id);

  if (onProgress) onProgress(100);

  return {
    temaLocalId,
    pasosCount: pasos.length,
    actividadesCount: actividades.length,
    mediosCount: registrosMedios.length,
    paqueteId: paquete.paquete_id,
  };
}

export async function eliminarTemaDescargado(temaServerId: string): Promise<void> {
  const scopeId = await obtenerScopeOffline();
  const tema = await db.temas.where("serverId").equals(temaServerId).first();
  if (!tema) return;

  await db.transaction("rw", [db.temas, db.pasos, db.actividades, db.progresoUsuario, db.eventosOutbox, db.descargaJobs, db.mediaReferences, db.mediaCache], async () => {
    if (scopeId) {
      await db.eventosOutbox.toCollection().filter((evento) => evento.scopeId === scopeId && evento.temaLocalId === tema.localId && evento.tipoEvento === "tema_descargado").delete();
      await db.progresoUsuario.where("temaLocalId").equals(tema.localId).filter((item) => item.scopeId === scopeId).delete();
    }
    await db.pasos.where("temaLocalId").equals(tema.localId).delete();
    await db.actividades.where("temaLocalId").equals(tema.localId).delete();
    await db.mediaReferences.where("temaLocalId").equals(tema.localId).delete();
    await db.temas.delete(tema.localId);
    await db.descargaJobs.delete(temaServerId);
  });
  for (const mediaId of tema.mediaServerIds ?? []) {
    const referencias = await db.mediaReferences.where("serverId").equals(mediaId).count();
    if (referencias === 0) await eliminarMedioDeCache(mediaId);
  }
}
