export function mapTheme(theme: Record<string, unknown>) {
  const sendaRaw = theme.path as Record<string, unknown> | undefined;
  const createdByRaw = theme.created_by as Record<string, unknown> | undefined;
  const portadaRaw = theme.portada_recurso as Record<string, unknown> | undefined;
  const ageGroupsRaw = theme.grupos_edad as Array<Record<string, unknown>> | undefined;
  const gruposEdad = Array.isArray(ageGroupsRaw)
    ? ageGroupsRaw.map((ag) => {
        const grupoEdadRaw = (ag.grupo_edad as Record<string, unknown> | undefined) ?? ag;

        return {
          id: String(grupoEdadRaw.id ?? ""),
          codigo: String(grupoEdadRaw.codigo ?? ""),
          nombre: String(grupoEdadRaw.nombre ?? "")
        };
      })
    : [];

  return {
    id: String(theme.id),
    senda_id: String(theme.senda_id ?? ""),
    titulo: String(theme.titulo ?? ""),
    slug: String(theme.slug ?? ""),
    objetivo: String(theme.objetivo ?? ""),
    resumen: (theme.resumen ?? null) as string | null,
    portada_recurso_id: (theme.portada_recurso_id ?? null) as string | null,
    estado: String(theme.estado ?? ""),
    version_biblica_id: (theme.version_biblica_id ?? null) as string | null,
    xp_recompensa: Number(theme.xp_recompensa ?? 0),
    minutos_estimados: Number(theme.minutos_estimados ?? 0),
    version_contenido: Number(theme.version_contenido ?? 0),
    publicado_en: (theme.publicado_en ?? null) as string | null,
    creado_en: (theme.creado_en ?? null) as string | null,
    actualizado_en: (theme.actualizado_en ?? null) as string | null,
    creado_por: createdByRaw
      ? {
          id: String(createdByRaw.id ?? ""),
          nombre_visible: String(createdByRaw.nombre_visible ?? "")
        }
      : null,
    senda: sendaRaw
      ? {
          id: String(sendaRaw.id ?? ""),
          codigo: String(sendaRaw.codigo ?? ""),
          nombre: String(sendaRaw.nombre ?? ""),
          color_hex: String(sendaRaw.color_hex ?? "")
        }
      : null,
    portada_recurso: portadaRaw
      ? {
          id: String(portadaRaw.id ?? ""),
          url_publica: String(portadaRaw.url_publica ?? ""),
          texto_alternativo: (portadaRaw.texto_alternativo ?? null) as string | null,
          titulo: (portadaRaw.titulo ?? null) as string | null
        }
      : null,
    grupos_edad: gruposEdad
  };
}

export function mapStep(step: Record<string, unknown>) {
  const tipoPasoRaw = step.tipo_paso as Record<string, unknown> | undefined;
  const contenidos = Array.isArray(step.contenidos)
    ? step.contenidos.map((content) => ({
        id: String((content as Record<string, unknown>).id),
        grupo_edad_id: String((content as Record<string, unknown>).grupo_edad_id ?? ""),
        titulo: String((content as Record<string, unknown>).titulo ?? ""),
        cuerpo: String((content as Record<string, unknown>).cuerpo ?? ""),
        instruccion_corta: ((content as Record<string, unknown>).instruccion_corta ?? null) as string | null,
        recurso_id: ((content as Record<string, unknown>).recurso_id ?? null) as string | null,
        recurso_audio_id: ((content as Record<string, unknown>).recurso_audio_id ?? null) as string | null,
        datos_extra: ((content as Record<string, unknown>).datos_extra ?? {}) as Record<string, unknown>
      }))
    : [];

  return {
    id: String(step.id),
    tema_id: String(step.tema_id ?? ""),
    orden: Number(step.orden ?? 0),
    tipo_paso: tipoPasoRaw
      ? {
          id: String(tipoPasoRaw.id ?? ""),
          codigo: String(tipoPasoRaw.codigo ?? ""),
          nombre: String(tipoPasoRaw.nombre ?? ""),
          orden: Number(tipoPasoRaw.orden ?? 0),
          color_hex: (tipoPasoRaw.color_hex ?? null) as string | null
        }
      : null,
    contenidos,
    preguntas: Array.isArray(step.preguntas)
      ? (step.preguntas as Array<Record<string, unknown>>)
          .map((pregunta) => ({
            id: String(pregunta.id ?? ""),
            grupo_edad_id: String(pregunta.grupo_edad_id ?? ""),
            pregunta: String(pregunta.pregunta ?? ""),
            orden: Number(pregunta.orden ?? 0)
          }))
          .sort((a, b) => a.orden - b.orden)
      : []
  };
}

export function mapActivity(activity: Record<string, unknown>) {
  const tipoActividadRaw = activity.tipo_actividad as Record<string, unknown> | undefined;
  const temaRaw = activity.tema as Record<string, unknown> | undefined;
  const temaSendaRaw = temaRaw?.senda as Record<string, unknown> | undefined;
  const grupoEdadRaw = activity.grupo_edad as Record<string, unknown> | undefined;
  const opcionesRaw = Array.isArray(activity.opciones)
    ? (activity.opciones as Array<Record<string, unknown>>)
    : [];

  return {
    id: String(activity.id),
    tema_id: String(activity.tema_id ?? ""),
    paso_id: activity.paso_id ? String(activity.paso_id) : null,
    grupo_edad_id: String(activity.grupo_edad_id ?? ""),
    tipo_actividad_id: String(activity.tipo_actividad_id ?? ""),
    titulo: String(activity.titulo ?? ""),
    consigna: String(activity.consigna ?? ""),
    retroalimentacion: (activity.retroalimentacion ?? null) as string | null,
    orden: Number(activity.orden ?? 0),
    xp_recompensa: Number(activity.xp_recompensa ?? 0),
    limite_tiempo_seg: activity.limite_tiempo_seg ? Number(activity.limite_tiempo_seg) : null,
    dificultad: String(activity.dificultad ?? "facil"),
    obligatorio: Boolean(activity.obligatorio),
    configuracion: (activity.configuracion ?? {}) as Record<string, unknown>,
    estado:
      temaRaw?.estado === "publicado"
        ? "publicada"
        : temaRaw?.estado === "revision"
          ? "revision"
          : "borrador",
    creado_en: (activity.creado_en ?? null) as string | null,
    actualizado_en: (activity.actualizado_en ?? null) as string | null,
    opciones: opcionesRaw
      .map((opcion) => ({
        id: String(opcion.id ?? ""),
        actividad_id: String(opcion.actividad_id ?? activity.id ?? ""),
        etiqueta: (opcion.etiqueta ?? null) as string | null,
        texto: String(opcion.texto ?? ""),
        correcta: Boolean(opcion.correcta),
        orden: Number(opcion.orden ?? 0),
        retroalimentacion: (opcion.retroalimentacion ?? null) as string | null,
      }))
      .sort((a, b) => a.orden - b.orden),
    tipo_actividad: tipoActividadRaw
      ? {
          id: String(tipoActividadRaw.id ?? ""),
          codigo: String(tipoActividadRaw.codigo ?? ""),
          nombre: String(tipoActividadRaw.nombre ?? "")
        }
      : null,
    tema: temaRaw
      ? {
          id: String(temaRaw.id ?? ""),
          titulo: String(temaRaw.titulo ?? ""),
          slug: String(temaRaw.slug ?? ""),
          estado: String(temaRaw.estado ?? "borrador"),
          senda: temaSendaRaw
            ? {
                id: String(temaSendaRaw.id ?? ""),
                codigo: String(temaSendaRaw.codigo ?? ""),
                nombre: String(temaSendaRaw.nombre ?? ""),
                color_hex: String(temaSendaRaw.color_hex ?? "")
              }
            : null
        }
      : null,
    grupo_edad: grupoEdadRaw
      ? {
          id: String(grupoEdadRaw.id ?? ""),
          codigo: String(grupoEdadRaw.codigo ?? ""),
          nombre: String(grupoEdadRaw.nombre ?? "")
        }
      : null
  };
}

export function crearSlugCopia(slug: string) {
  const sufijo = `-copia-${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
  const maximo = 140;
  const base = slug.slice(0, Math.max(1, maximo - sufijo.length));

  return `${base}${sufijo}`;
}

export function crearTituloCopia(titulo: string) {
  const sufijo = " (copia)";
  const maximo = 120;
  const base = titulo.slice(0, Math.max(1, maximo - sufijo.length));

  return `${base}${sufijo}`;
}
