export function evaluarCompletitud(
  tema: any,
  grupos: any[],
  pasos: any[],
  actividades: any[],
  versiculo: any,
  portada: any,
  revisionAprobada: boolean = true
) {
    const esperados = Math.max(grupos.length * 6, 1);
    const contenidosValidos = pasos.flatMap((paso: any) => paso.contenidos ?? []).filter((contenido: any) => contenido.titulo?.trim() && contenido.cuerpo?.trim()).length;
    const gruposEdadIds = grupos.map((grupo) => grupo.grupo_edad_id);
    const gruposSemillas = grupos.filter((grupo: any) => {
      const edad = Array.isArray(grupo.grupo_edad) ? grupo.grupo_edad[0] : grupo.grupo_edad;
      return edad?.codigo === "semillas";
    }).map((grupo) => grupo.grupo_edad_id);
    const celdas = pasos.flatMap((paso: any) => {
      const tipoPaso = Array.isArray(paso.tipo_paso) ? paso.tipo_paso[0] : paso.tipo_paso;
      const codigoMomento = tipoPaso?.codigo as MomentoCrecer | undefined;
      if (!codigoMomento) return [];
      return (paso.contenidos ?? []).map((contenido: any) => ({
        grupoEdadId: contenido.grupo_edad_id,
        codigoMomento,
        completa: Boolean(contenido.titulo?.trim() && contenido.cuerpo?.trim()),
        audioValida: Boolean(contenido.recurso_audio_id),
        orden: paso.orden,
      }));
    });
    const matriz = evaluarMatrizCrecer(gruposEdadIds, celdas);
    const narracionSemillasValida = gruposSemillas.length === 0 || MOMENTOS.every((momento) =>
      gruposSemillas.every((grupoEdadId) => celdas.some((celda: any) => celda.grupoEdadId === grupoEdadId && celda.codigoMomento === momento && celda.completa && celda.audioValida)),
    );
    const publicacion = validarPublicacion({
      titulo: tema.titulo,
      sendaId: tema.senda_id,
      versionBiblicaId: tema.version_biblica_id,
      versiculo: versiculo
        ? { texto: versiculo.texto, libroId: String(versiculo.libro_id), capitulo: versiculo.capitulo, numero: versiculo.versiculo }
        : null,
      portada: portada
        ? { id: portada.id, alt: portada.texto_alternativo }
        : null,
      gruposEdadIds,
      celdasCrecer: celdas,
      actividades: actividades.map((actividad: any) => ({
        id: actividad.id,
        titulo: actividad.titulo,
        consigna: actividad.consigna,
        requiereOpciones: (Array.isArray(actividad.tipo_actividad) ? actividad.tipo_actividad[0] : actividad.tipo_actividad)?.codigo === "cuestionario",
        configuracionValida: validarConfiguracionActividad(
          String((Array.isArray(actividad.tipo_actividad) ? actividad.tipo_actividad[0] : actividad.tipo_actividad)?.codigo ?? ""),
          actividad.configuracion,
        ).success,
        opciones: actividad.opciones ?? [],
      })),
      revisionAprobada,
      narracionSemillasValida,
    });

    const criterios = [
      { codigo: "informacion", etiqueta: "Información general", completo: Boolean(tema.titulo && tema.slug && tema.objetivo && tema.resumen && tema.senda_id) },
      { codigo: "portada", etiqueta: "Portada", completo: Boolean(tema.portada_recurso_id) },
      { codigo: "publico", etiqueta: "Público objetivo", completo: grupos.length > 0 },
      { codigo: "crecer", etiqueta: "Recorrido CRECER", completo: matriz.valida, detalle: `${contenidosValidos}/${esperados} contenidos` },
      { codigo: "actividades", etiqueta: "Actividades", completo: actividades.length > 0, detalle: `${actividades.length} actividades` },
      { codigo: "configuracion", etiqueta: "Configuración", completo: Boolean(tema.version_biblica_id && tema.minutos_estimados > 0 && tema.xp_recompensa >= 0) },
      { codigo: "publicacion", etiqueta: "Validación de publicación", completo: publicacion.valido, detalle: publicacion.errores.map((error) => error.codigo).join(", ") }
    ];
    const porcentaje = Math.round((criterios.filter((criterio) => criterio.completo).length / criterios.length) * 100);

    return {
      porcentaje,
      listo_para_revision: criterios.every((criterio) => criterio.completo),
      criterios,
      estadisticas: {
        grupos_edad: grupos.length,
        pasos_creados: pasos.length,
        contenidos_creados: contenidosValidos,
        contenidos_esperados: esperados,
        actividades: actividades.length
      },
      revisionAprobada,
      errores_publicacion: publicacion.errores
    };
}
