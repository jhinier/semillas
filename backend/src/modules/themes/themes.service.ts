import type { ThemesRepository } from "./themes.repository";
import type { createSupabaseAdmin } from "../../db/client";
import { BadRequestError } from "../../shared/errors/http-error";

const URL_FIRMA_EXPIRADA_SEGUNDOS = 300;

type Dependencias = {
  themes: ThemesRepository;
  crearSupabaseAdmin: typeof createSupabaseAdmin;
};

type RegistroTema = Awaited<ReturnType<ThemesRepository["listarTemasPublicos"]>>[number];

function serializarPortada(portada: RegistroTema["portada"]) {
  if (!portada) return null;

  return {
    id: portada.id,
    titulo: portada.titulo,
    tipo: portada.tipo,
    url_publica: portada.urlPublica,
    texto_alternativo: portada.textoAlternativo,
    tipo_mime: portada.tipoMime,
    tamano_bytes: portada.tamanoBytes,
    duracion_seg: portada.duracionSeg,
    ancho_px: portada.anchoPx,
    alto_px: portada.altoPx
  };
}

function serializarTemaListado({ tema, senda, portada }: RegistroTema) {
  return {
    id: tema.id,
    senda_id: tema.sendaId,
    titulo: tema.titulo,
    slug: tema.slug,
    objetivo: tema.objetivo,
    resumen: tema.resumen,
    portada_recurso_id: tema.portadaRecursoId,
    estado: tema.estado,
    version_biblica_id: tema.versionBiblicaId,
    xp_recompensa: tema.xpRecompensa,
    minutos_estimados: tema.minutosEstimados,
    version_contenido: tema.versionContenido,
    publicado_en: tema.publicadoEn?.toISOString() ?? null,
    creado_en: tema.creadoEn?.toISOString() ?? null,
    actualizado_en: tema.actualizadoEn?.toISOString() ?? null,
    senda: senda
      ? {
          id: senda.id,
          codigo: senda.codigo,
          nombre: senda.nombre,
          descripcion: senda.descripcion,
          color_hex: senda.colorHex,
          nombre_icono: senda.nombreIcono,
          orden: senda.orden
        }
      : null,
    portada_recurso: serializarPortada(portada)
  };
}

function serializarPaso(registro: Awaited<ReturnType<ThemesRepository["listarPasosTema"]>>[number]) {
  return {
    id: registro.paso.id,
    tema_id: registro.paso.temaId,
    orden: registro.paso.orden,
    obligatorio: registro.paso.obligatorio,
    tipo_paso: registro.tipoPaso
      ? {
          id: registro.tipoPaso.id,
          codigo: registro.tipoPaso.codigo,
          nombre: registro.tipoPaso.nombre,
          descripcion: registro.tipoPaso.descripcion,
          orden: registro.tipoPaso.orden,
          color_hex: registro.tipoPaso.colorHex
        }
      : null,
    contenidos: registro.contenidos.map((contenido) => ({
      id: contenido.id,
      paso_id: contenido.pasoId,
      grupo_edad_id: contenido.grupoEdadId,
      titulo: contenido.titulo,
      cuerpo: contenido.cuerpo,
      instruccion_corta: contenido.instruccionCorta,
      recurso_id: contenido.recursoId,
      recurso_audio_id: contenido.recursoAudioId,
      datos_extra: contenido.datosExtra
    })),
    preguntas: registro.preguntas.map((pregunta) => ({
      id: pregunta.id,
      paso_id: pregunta.pasoId,
      grupo_edad_id: pregunta.grupoEdadId,
      pregunta: pregunta.pregunta,
      orden: pregunta.orden
    }))
  };
}

function serializarActividad(registro: Awaited<ReturnType<ThemesRepository["listarActividadesTema"]>>[number]) {
  return {
    id: registro.actividad.id,
    tema_id: registro.actividad.temaId,
    paso_id: registro.actividad.pasoId,
    grupo_edad_id: registro.actividad.grupoEdadId,
    tipo_actividad_id: registro.actividad.tipoActividadId,
    titulo: registro.actividad.titulo,
    consigna: registro.actividad.consigna,
    orden: registro.actividad.orden,
    xp_recompensa: registro.actividad.xpRecompensa,
    dificultad: registro.actividad.dificultad,
    limite_tiempo_seg: registro.actividad.limiteTiempoSeg,
    obligatorio: registro.actividad.obligatorio,
    retroalimentacion: registro.actividad.retroalimentacion,
    configuracion: registro.actividad.configuracion ?? {},
    creado_en: registro.actividad.creadoEn.toISOString(),
    actualizado_en: registro.actividad.actualizadoEn.toISOString(),
    tipo_actividad: registro.tipoActividad
      ? {
          id: registro.tipoActividad.id,
          codigo: registro.tipoActividad.codigo,
          nombre: registro.tipoActividad.nombre,
          descripcion: registro.tipoActividad.descripcion,
          es_juego: registro.tipoActividad.esJuego,
          activo: registro.tipoActividad.activo,
          creado_en: registro.tipoActividad.creadoEn.toISOString()
        }
      : null,
    opciones: registro.opciones.map((opcion) => ({
      id: opcion.id,
      actividad_id: opcion.actividadId,
      etiqueta: opcion.etiqueta,
      texto: opcion.texto,
      orden: opcion.orden
    }))
  };
}

function serializarActividadOffline(registro: Awaited<ReturnType<ThemesRepository["listarActividadesTema"]>>[number]) {
  return {
    ...serializarActividad(registro),
    opciones: registro.opciones.map((opcion) => ({
      id: opcion.id,
      actividad_id: opcion.actividadId,
      etiqueta: opcion.etiqueta,
      texto: opcion.texto,
      orden: opcion.orden,
      correcta: opcion.correcta,
      retroalimentacion: opcion.retroalimentacion,
    })),
  };
}

function recolectarIdsConfiguracion(valor: unknown, destino: Set<string>, clavePadre = "") {
  if (typeof valor === "string") {
    const pareceId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(valor);
    const clave = clavePadre.toLowerCase();
    if (pareceId && (clave.includes("recurso") || clave.includes("imagen") || clave.includes("audio") || clave.includes("video"))) {
      destino.add(valor);
    }
    return;
  }

  if (Array.isArray(valor)) {
    for (const item of valor) recolectarIdsConfiguracion(item, destino, clavePadre);
    return;
  }

  if (valor && typeof valor === "object") {
    for (const [clave, item] of Object.entries(valor as Record<string, unknown>)) {
      recolectarIdsConfiguracion(item, destino, clave);
    }
  }
}

function serializarRecursoOffline(recurso: Awaited<ReturnType<ThemesRepository["listarRecursosPorIds"]>>[number], urlDescarga: string) {
  return {
    id: recurso.id,
    tipo: recurso.tipo,
    titulo: recurso.titulo,
    url_descarga: urlDescarga,
    texto_alternativo: recurso.textoAlternativo,
    tipo_mime: recurso.tipoMime,
    tamano_bytes: recurso.tamanoBytes,
    duracion_seg: recurso.duracionSeg,
    ancho_px: recurso.anchoPx,
    alto_px: recurso.altoPx,
  };
}

export function crearThemesService({ themes, crearSupabaseAdmin }: Dependencias) {
  return {
    async listarTemasPublicos(sendaId?: string) {
      const data = await themes.listarTemasPublicos(sendaId);
      return data.map(serializarTemaListado);
    },

    async obtenerTemaPublico(temaId: string) {
      const data = await themes.obtenerTemaPublico(temaId);
      return data ? serializarTemaListado(data) : null;
    },

    async obtenerPortadaTema(env: Parameters<typeof createSupabaseAdmin>[0], temaId: string) {
      const resultado = await themes.obtenerPortadaTema(temaId);

      if (!resultado) return null;
      if (!resultado.portada?.claveAlmacenamiento || !resultado.portada.activo) return null;

      const supabaseAdmin = crearSupabaseAdmin(env);
      const bucket = resultado.portada.bucketAlmacenamiento ?? "media";
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(resultado.portada.claveAlmacenamiento, URL_FIRMA_EXPIRADA_SEGUNDOS);

      if (error || !data?.signedUrl) {
        throw error ?? new Error("No se pudo generar URL firmada de la portada");
      }

      return { url: data.signedUrl, expira_en_segundos: URL_FIRMA_EXPIRADA_SEGUNDOS };
    },

    async crearPaqueteOffline(
      env: Parameters<typeof createSupabaseAdmin>[0],
      usuarioId: string,
      temaId: string,
      grupoEdadId: string,
    ) {
      const grupoPerfil = await themes.obtenerGrupoEdadUsuario(usuarioId);
      if (!grupoPerfil) {
        throw new BadRequestError("Completa tu franja de edad antes de descargar contenido");
      }

      if (grupoPerfil !== grupoEdadId) {
        throw new BadRequestError("La franja solicitada no coincide con el perfil del usuario");
      }

      if (!(await themes.temaDisponibleParaGrupo(temaId, grupoEdadId))) {
        return null;
      }

      const [temaRegistro, pasos, actividades] = await Promise.all([
        themes.obtenerTemaPublico(temaId),
        themes.listarPasosTema(temaId, grupoEdadId),
        themes.listarActividadesTema(temaId, grupoEdadId),
      ]);

      if (!temaRegistro) return null;

      const idsRecursos = new Set<string>();
      if (temaRegistro.tema.portadaRecursoId) idsRecursos.add(temaRegistro.tema.portadaRecursoId);

      for (const { contenidos } of pasos) {
        for (const contenido of contenidos) {
          if (contenido.recursoId) idsRecursos.add(contenido.recursoId);
          if (contenido.recursoAudioId) idsRecursos.add(contenido.recursoAudioId);
          recolectarIdsConfiguracion(contenido.datosExtra, idsRecursos);
        }
      }

      for (const { actividad } of actividades) {
        recolectarIdsConfiguracion(actividad.configuracion, idsRecursos);
      }

      const recursos = await themes.listarRecursosPorIds([...idsRecursos]);
      const supabaseAdmin = crearSupabaseAdmin(env);
      const medios = await Promise.all(
        recursos.filter((recurso) => recurso.activo).map(async (recurso) => {
          let urlDescarga = recurso.urlPublica;

          if (recurso.claveAlmacenamiento) {
            const bucket = recurso.bucketAlmacenamiento ?? "media";
            const { data, error } = await supabaseAdmin.storage
              .from(bucket)
              .createSignedUrl(recurso.claveAlmacenamiento, 60 * 60);
            if (!error && data?.signedUrl) {
              urlDescarga = data.signedUrl;
            }
          }

          return serializarRecursoOffline(recurso, urlDescarga);
        })
      );

      const paquete = {
        schema_version: 1,
        generado_en: new Date().toISOString(),
        grupo_edad_id: grupoEdadId,
        tema: serializarTemaListado(temaRegistro),
        pasos: pasos.map(serializarPaso),
        actividades: actividades.map(serializarActividadOffline),
        medios,
      };

      const bytesJson = new TextEncoder().encode(JSON.stringify(paquete)).byteLength;
      const bytesMedios = medios.reduce((total, medio) => total + Number(medio.tamano_bytes ?? 0), 0);
      const tamanoBytes = bytesJson + bytesMedios;

      const paqueteGuardado =
        (await themes.obtenerPaqueteOffline(temaId, temaRegistro.tema.versionContenido)) ??
        (await themes.guardarPaqueteOffline({
          temaId,
          versionContenido: temaRegistro.tema.versionContenido,
          tamanoBytes,
          manifiesto: {
            schema_version: paquete.schema_version,
            grupo_edad_id: grupoEdadId,
            tema_id: temaId,
            version_contenido: temaRegistro.tema.versionContenido,
            pasos: pasos.length,
            actividades: actividades.length,
            medios: medios.map((medio) => medio.id),
          },
        }));

      if (paqueteGuardado) {
        await themes.registrarDescargaOffline(usuarioId, paqueteGuardado.id);
      }

      return {
        paquete_id: paqueteGuardado?.id ?? null,
        tamano_bytes: tamanoBytes,
        ...paquete,
      };
    },

    async listarPasosTema(temaId: string, grupoEdadId?: string) {
      const data = await themes.listarPasosTema(temaId, grupoEdadId);
      return data.map(serializarPaso);
    },

    async listarActividadesTema(temaId: string, grupoEdadId?: string) {
      const data = await themes.listarActividadesTema(temaId, grupoEdadId);
      return data.map(serializarActividad);
    }
  };
}

export type ThemesService = ReturnType<typeof crearThemesService>;
