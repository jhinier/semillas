import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "../../db/database.types";
import { schema, type DbClient } from "../../db/client";
import { BadRequestError, NotFoundError, UnprocessableEntityError } from "../../shared/errors/http-error";
import { z } from "zod";
import { crearSlugCopia, crearTituloCopia, mapActivity, mapStep, mapTheme } from "./admin.formatters";
import { actualizarAjustesSistemaSchema, createActivitySchema, createSendaSchema, createThemeSchema, reorderActivitiesSchema, resolveReviewSchema, submitReviewSchema, updateActivitySchema, updateSendaSchema, updateThemeSchema, updateUserSchema, upsertStepContentSchema } from "./admin.schemas";
import { evaluarMatrizCrecer, MOMENTOS, type MomentoCrecer } from "./publicacion/matriz-crecer";
import { validarPublicacion } from "./publicacion/validar-publicacion";
import { validarTransicionEditorial, puedePublicar } from "./publicacion/editorial-policy";
import { CODIGOS_ACTIVIDAD_CANONICOS, validarConfiguracionActividad } from "../activities/activity-config.schemas";

export type AdminUser = {
  id: string;
  role: string;
  displayName: string;
};

type AdminDb = {
  supabase: SupabaseClient<Database>;
  drizzle?: DbClient;
};

type CreateThemeInput = z.infer<typeof createThemeSchema>;
type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
type UpsertStepContentInput = z.infer<typeof upsertStepContentSchema>;
type CreateActivityInput = z.infer<typeof createActivitySchema>;
type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;
type CreateSendaInput = z.infer<typeof createSendaSchema>;
type UpdateSendaInput = z.infer<typeof updateSendaSchema>;
type ReorderActivitiesInput = z.infer<typeof reorderActivitiesSchema>;
type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
type ResolveReviewInput = z.infer<typeof resolveReviewSchema>;
type UpdateAjustesSistemaInput = z.infer<typeof actualizarAjustesSistemaSchema>;

const CLAVES_AJUSTES_SISTEMA = {
  nombrePlataforma: "administracion.nombre_plataforma",
  correoSoporte: "administracion.correo_soporte",
  zonaHoraria: "administracion.zona_horaria",
  notasObligatoriasCambios: "administracion.notas_obligatorias_cambios",
  notasObligatoriasRechazo: "administracion.notas_obligatorias_rechazo"
} as const;

const VALORES_AJUSTES_SISTEMA = Object.values(CLAVES_AJUSTES_SISTEMA);

export function crearAdminRepository({ supabase, drizzle }: AdminDb) {
  function requerirDrizzle() {
    if (!drizzle) {
      throw new Error("Cliente Drizzle no disponible: configura HYPERDRIVE o SUPABASE_DATABASE_URL");
    }
    return drizzle;
  }

  async function registrarAuditoria(input: {
    actorId?: string | null;
    accion: string;
    tipoEntidad: string;
    entidadId?: string | null;
    antes?: unknown;
    despues?: unknown;
  }) {
    const { error } = await supabase.from("registro_auditoria").insert({
      actor_usuario_id: input.actorId ?? null,
      accion: input.accion,
      tipo_entidad: input.tipoEntidad,
      entidad_id: input.entidadId ?? null,
      datos_antes: (input.antes ?? null) as Json,
      datos_despues: (input.despues ?? null) as Json
    });
    if (error) throw error;
  }

  async function validarConfiguracionActividadPersistida(tipoActividadId: string, configuracion: unknown) {
    const { data, error } = await supabase.from("tipo_actividad").select("codigo").eq("id", tipoActividadId).single();
    if (error || !data) throw new NotFoundError("Tipo de actividad no encontrado");
    if (!CODIGOS_ACTIVIDAD_CANONICOS.includes(data.codigo as typeof CODIGOS_ACTIVIDAD_CANONICOS[number])) {
      throw new BadRequestError("El tipo de actividad no usa un código canónico", { codigo: data.codigo });
    }
    const resultado = validarConfiguracionActividad(data.codigo, configuracion);
    if (!resultado.success) {
      throw new BadRequestError("La configuración de la actividad es inválida", resultado.error.flatten());
    }
    return resultado.data;
  }

  async function calcularCompletitudTema(temaId: string, opciones: { requiereRevisionAprobada?: boolean } = {}) {
    const [temaResult, gruposResult, pasosResult, actividadesResult, versiculoResult] = await Promise.all([
      supabase.from("tema").select("id, titulo, slug, objetivo, resumen, portada_recurso_id, version_biblica_id, senda_id, xp_recompensa, minutos_estimados").eq("id", temaId).single(),
      supabase.from("tema_grupo_edad").select("grupo_edad_id, grupo_edad:grupo_edad_id(codigo)").eq("tema_id", temaId),
      supabase.from("paso_tema").select("id, tipo_paso_id, orden, tipo_paso:tipo_paso_id(codigo), contenidos:contenido_paso_tema(id, grupo_edad_id, titulo, cuerpo, recurso_audio_id)").eq("tema_id", temaId),
      supabase.from("actividad").select("id, paso_id, grupo_edad_id, titulo, consigna, configuracion, tipo_actividad:tipo_actividad_id(codigo), opciones:opcion_actividad(correcta)").eq("tema_id", temaId),
      supabase.from("versiculo_clave").select("texto, libro_id, capitulo, versiculo").eq("tema_id", temaId).maybeSingle()
    ]);

    if (temaResult.error || !temaResult.data) throw new NotFoundError("Tema no encontrado");
    if (gruposResult.error) throw gruposResult.error;
    if (pasosResult.error) throw pasosResult.error;
    if (actividadesResult.error) throw actividadesResult.error;
    if (versiculoResult.error) throw versiculoResult.error;
    const portadaResult = await supabase.from("recurso_multimedia").select("id, texto_alternativo").eq("id", temaResult.data.portada_recurso_id ?? "00000000-0000-0000-0000-000000000000").maybeSingle();
    if (portadaResult.error) throw portadaResult.error;
    let revisionAprobada = true;
    if (opciones.requiereRevisionAprobada) {
      const revisionResult = await supabase
        .from("revision_contenido")
        .select("id")
        .eq("tema_id", temaId)
        .eq("estado", "aprobado")
        .limit(1)
        .maybeSingle();
      if (revisionResult.error) throw revisionResult.error;
      revisionAprobada = Boolean(revisionResult.data);
    }

    const tema = temaResult.data;
    const grupos = gruposResult.data ?? [];
    const pasos = pasosResult.data ?? [];
    const actividades = actividadesResult.data ?? [];
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
      versiculo: versiculoResult.data
        ? { texto: versiculoResult.data.texto, libroId: String(versiculoResult.data.libro_id), capitulo: versiculoResult.data.capitulo, numero: versiculoResult.data.versiculo }
        : null,
      portada: portadaResult.data
        ? { id: portadaResult.data.id, alt: portadaResult.data.texto_alternativo }
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

  async function calcularCompletitudTemasEnLote(temasData: any[]) {
    if (temasData.length === 0) return new Map();
    const temaIds = temasData.map(t => String(t.id));

    const [gruposResult, pasosResult, actividadesResult, versiculoResult] = await Promise.all([
      supabase.from("tema_grupo_edad").select("tema_id, grupo_edad_id, grupo_edad:grupo_edad_id(codigo)").in("tema_id", temaIds),
      supabase.from("paso_tema").select("tema_id, id, tipo_paso_id, orden, tipo_paso:tipo_paso_id(codigo), contenidos:contenido_paso_tema(id, grupo_edad_id, titulo, cuerpo, recurso_audio_id)").in("tema_id", temaIds),
      supabase.from("actividad").select("tema_id, id, paso_id, grupo_edad_id, titulo, consigna, configuracion, tipo_actividad:tipo_actividad_id(codigo), opciones:opcion_actividad(correcta)").in("tema_id", temaIds),
      supabase.from("versiculo_clave").select("tema_id, texto, libro_id, capitulo, versiculo").in("tema_id", temaIds)
    ]);

    const gruposMap = new Map<string, any[]>();
    const pasosMap = new Map<string, any[]>();
    const actMap = new Map<string, any[]>();
    const verMap = new Map<string, any>();

    temaIds.forEach(id => {
      gruposMap.set(id, []);
      pasosMap.set(id, []);
      actMap.set(id, []);
    });

    (gruposResult.data ?? []).forEach((g: any) => gruposMap.get(g.tema_id)?.push(g));
    (pasosResult.data ?? []).forEach((p: any) => pasosMap.get(p.tema_id)?.push(p));
    (actividadesResult.data ?? []).forEach((a: any) => actMap.get(a.tema_id)?.push(a));
    (versiculoResult.data ?? []).forEach((v: any) => verMap.set(v.tema_id, v));

    const completitudMap = new Map<string, any>();

    temasData.forEach(tema => {
      const grupos = gruposMap.get(String(tema.id)) ?? [];
      const pasos = pasosMap.get(String(tema.id)) ?? [];
      const actividades = actMap.get(String(tema.id)) ?? [];
      const versiculoResultData = verMap.get(String(tema.id));
      
      const portadaResultData = tema.portada_recurso ? { id: tema.portada_recurso.id, texto_alternativo: tema.portada_recurso.texto_alternativo } : null;

      const esperados = Math.max(grupos.length * 6, 1);
      const contenidosValidos = pasos.flatMap((paso: any) => paso.contenidos ?? []).filter((contenido: any) => contenido.titulo?.trim() && contenido.cuerpo?.trim()).length;
      const gruposEdadIds = grupos.map((grupo: any) => grupo.grupo_edad_id);
      const gruposSemillas = grupos.filter((grupo: any) => {
        const edad = Array.isArray(grupo.grupo_edad) ? grupo.grupo_edad[0] : grupo.grupo_edad;
        return edad?.codigo === "semillas";
      }).map((grupo: any) => grupo.grupo_edad_id);
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
        gruposSemillas.every((grupoEdadId: any) => celdas.some((celda: any) => celda.grupoEdadId === grupoEdadId && celda.codigoMomento === momento && celda.completa && celda.audioValida)),
      );
      const publicacion = validarPublicacion({
        titulo: tema.titulo,
        sendaId: tema.senda_id,
        versionBiblicaId: tema.version_biblica_id,
        versiculo: versiculoResultData
          ? { texto: versiculoResultData.texto, libroId: String(versiculoResultData.libro_id), capitulo: versiculoResultData.capitulo, numero: versiculoResultData.versiculo }
          : null,
        portada: portadaResultData
          ? { id: portadaResultData.id, alt: portadaResultData.texto_alternativo }
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
        revisionAprobada: true, // Listado general no verifica revisión
        narracionSemillasValida,
      });

      const criterios = [
        { codigo: "informacion", etiqueta: "Información general", completo: Boolean(tema.titulo && tema.slug && tema.objetivo && tema.resumen && tema.senda_id) },
        { codigo: "portada", etiqueta: "Portada", completo: Boolean(tema.portada_recurso_id) },
        { codigo: "publico", etiqueta: "Público objetivo", completo: grupos.length > 0 },
        { codigo: "crecer", etiqueta: "Recorrido CRECER", completo: matriz.valida, detalle: `${contenidosValidos}/${esperados} contenidos` },
        { codigo: "actividades", etiqueta: "Actividades", completo: actividades.length > 0, detalle: `${actividades.length} actividades` },
        { codigo: "configuracion", etiqueta: "Configuración", completo: Boolean(tema.version_biblica_id && tema.minutos_estimados > 0 && tema.xp_recompensa >= 0) },
        { codigo: "publicacion", etiqueta: "Validación de publicación", completo: publicacion.valido, detalle: publicacion.errores.map((error: any) => error.codigo).join(", ") }
      ];
      const porcentaje = Math.round((criterios.filter((criterio) => criterio.completo).length / criterios.length) * 100);

      completitudMap.set(String(tema.id), {
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
        revisionAprobada: true,
        errores_publicacion: publicacion.errores
      });
    });

    return completitudMap;
  }

  async function leerAjustesSistema() {
    const { data, error } = await supabase
      .from("configuracion_plataforma")
      .select("clave, valor, actualizado_en")
      .in("clave", VALORES_AJUSTES_SISTEMA);

    if (error) throw error;
    const valores = new Map((data ?? []).map((fila) => [fila.clave, fila.valor]));
    const actualizadoEn = (data ?? []).reduce<string | null>((reciente, fila) =>
      !reciente || fila.actualizado_en > reciente ? fila.actualizado_en : reciente, null);

    return {
      id: "principal",
      nombre_plataforma: typeof valores.get(CLAVES_AJUSTES_SISTEMA.nombrePlataforma) === "string"
        ? valores.get(CLAVES_AJUSTES_SISTEMA.nombrePlataforma) as string
        : "Semillas",
      correo_soporte: typeof valores.get(CLAVES_AJUSTES_SISTEMA.correoSoporte) === "string"
        ? valores.get(CLAVES_AJUSTES_SISTEMA.correoSoporte) as string
        : null,
      zona_horaria: typeof valores.get(CLAVES_AJUSTES_SISTEMA.zonaHoraria) === "string"
        ? valores.get(CLAVES_AJUSTES_SISTEMA.zonaHoraria) as string
        : "America/Guayaquil",
      notas_obligatorias_cambios: typeof valores.get(CLAVES_AJUSTES_SISTEMA.notasObligatoriasCambios) === "boolean"
        ? valores.get(CLAVES_AJUSTES_SISTEMA.notasObligatoriasCambios) as boolean
        : true,
      notas_obligatorias_rechazo: typeof valores.get(CLAVES_AJUSTES_SISTEMA.notasObligatoriasRechazo) === "boolean"
        ? valores.get(CLAVES_AJUSTES_SISTEMA.notasObligatoriasRechazo) as boolean
        : true,
      creado_en: actualizadoEn,
      actualizado_en: actualizadoEn
    };
  }

  return {
    async obtenerAjustesSistema() {
      return leerAjustesSistema();
    },

    async actualizarAjustesSistema(body: UpdateAjustesSistemaInput, actorId: string) {
      const actuales = await leerAjustesSistema();
      const siguientes = {
        nombre_plataforma: body.nombre_plataforma ?? actuales.nombre_plataforma,
        correo_soporte: body.correo_soporte === undefined ? actuales.correo_soporte : body.correo_soporte,
        zona_horaria: body.zona_horaria ?? actuales.zona_horaria,
        notas_obligatorias_cambios: body.notas_obligatorias_cambios ?? actuales.notas_obligatorias_cambios,
        notas_obligatorias_rechazo: body.notas_obligatorias_rechazo ?? actuales.notas_obligatorias_rechazo
      };
      const actualizadoEn = new Date().toISOString();
      const { error } = await supabase.from("configuracion_plataforma").upsert([
        { clave: CLAVES_AJUSTES_SISTEMA.nombrePlataforma, categoria: "administracion", valor: siguientes.nombre_plataforma, descripcion: "Nombre administrativo de la plataforma.", actualizado_por: actorId, actualizado_en: actualizadoEn },
        { clave: CLAVES_AJUSTES_SISTEMA.correoSoporte, categoria: "administracion", valor: siguientes.correo_soporte, descripcion: "Correo de soporte de la plataforma.", actualizado_por: actorId, actualizado_en: actualizadoEn },
        { clave: CLAVES_AJUSTES_SISTEMA.zonaHoraria, categoria: "administracion", valor: siguientes.zona_horaria, descripcion: "Zona horaria de referencia.", actualizado_por: actorId, actualizado_en: actualizadoEn },
        { clave: CLAVES_AJUSTES_SISTEMA.notasObligatoriasCambios, categoria: "administracion", valor: siguientes.notas_obligatorias_cambios, descripcion: "Exige notas al solicitar cambios.", actualizado_por: actorId, actualizado_en: actualizadoEn },
        { clave: CLAVES_AJUSTES_SISTEMA.notasObligatoriasRechazo, categoria: "administracion", valor: siguientes.notas_obligatorias_rechazo, descripcion: "Exige motivo al rechazar contenido.", actualizado_por: actorId, actualizado_en: actualizadoEn }
      ], { onConflict: "clave" });

      if (error) throw error;
      const data = await leerAjustesSistema();

      await registrarAuditoria({
        actorId,
        accion: "actualizar_ajustes",
        tipoEntidad: "configuracion_plataforma",
        antes: actuales,
        despues: data
      });

      return data;
    },

    async obtenerResumen() {
      const [themes, users, activities, published] = await Promise.all([
        supabase.from("tema").select("id", { count: "exact", head: true }),
        supabase.from("usuario_app").select("id", { count: "exact", head: true }),
        supabase.from("actividad").select("id", { count: "exact", head: true }),
        supabase.from("tema").select("id", { count: "exact", head: true }).eq("estado", "publicado")
      ]);

      for (const resultado of [themes, users, activities, published]) {
        if (resultado.error) throw resultado.error;
      }

      return {
        temas: themes.count ?? 0,
        publicados: published.count ?? 0,
        usuarios: users.count ?? 0,
        actividades: activities.count ?? 0
      };
    },

    async obtenerResumenDetallado() {
      const ahora = new Date();
      const inicioSemana = new Date(ahora);
      inicioSemana.setDate(ahora.getDate() - 6);
      inicioSemana.setHours(0, 0, 0, 0);

      const [temasResult, usuariosResult, actividadesResult, clubesResult, revisionesResult, auditoriaResult] = await Promise.all([
        supabase.from("tema").select("id, titulo, estado, actualizado_en, publicado_en, senda:senda_id(nombre), autor:creado_por(nombre_visible)").order("actualizado_en", { ascending: false }),
        supabase.from("usuario_app").select("id", { count: "exact", head: true }).eq("activo", true),
        supabase.from("actividad").select("id", { count: "exact", head: true }),
        supabase.from("club").select("id", { count: "exact", head: true }).eq("activo", true),
        supabase.from("revision_contenido").select("id, tema_id, estado, notas, creado_en, revisado_en, tema:tema_id(titulo, senda:senda_id(nombre)), enviado:enviado_por(nombre_visible)").in("estado", ["enviado", "cambios_solicitados"]).order("creado_en", { ascending: false }).limit(8),
        supabase.from("registro_auditoria").select("id, accion, tipo_entidad, entidad_id, creado_en, actor:actor_usuario_id(nombre_visible)").order("creado_en", { ascending: false }).limit(10)
      ]);

      for (const resultado of [temasResult, usuariosResult, actividadesResult, clubesResult, revisionesResult, auditoriaResult]) {
        if (resultado.error) throw resultado.error;
      }

      const temas = temasResult.data ?? [];
      const estados = ["borrador", "revision", "aprobado", "publicado", "archivado"].reduce<Record<string, number>>((acumulado, estado) => {
        acumulado[estado] = temas.filter((tema) => tema.estado === estado).length;
        return acumulado;
      }, {});

      const publicacionesSemana = Array.from({ length: 7 }, (_, indice) => {
        const fecha = new Date(inicioSemana);
        fecha.setDate(inicioSemana.getDate() + indice);
        const clave = fecha.toISOString().slice(0, 10);
        return {
          fecha: clave,
          etiqueta: new Intl.DateTimeFormat("es-EC", { weekday: "short" }).format(fecha),
          total: temas.filter((tema) => tema.publicado_en?.slice(0, 10) === clave).length
        };
      });

      return {
        metricas: {
          temas: temas.length,
          publicados: estados.publicado ?? 0,
          usuarios_activos: usuariosResult.count ?? 0,
          actividades: actividadesResult.count ?? 0,
          clubes_activos: clubesResult.count ?? 0,
          pendientes_revision: revisionesResult.data?.length ?? 0
        },
        estados,
        temas_recientes: temas.slice(0, 6).map((tema: any) => ({
          id: tema.id,
          titulo: tema.titulo,
          estado: tema.estado,
          actualizado_en: tema.actualizado_en,
          senda: tema.senda?.nombre ?? "Sin senda",
          autor: tema.autor?.nombre_visible ?? "Sin autor"
        })),
        revisiones: (revisionesResult.data ?? []).map((revision: any) => ({
          id: revision.id,
          tema_id: revision.tema_id,
          titulo: revision.tema?.titulo ?? "Tema",
          senda: revision.tema?.senda?.nombre ?? "Sin senda",
          estado: revision.estado,
          notas: revision.notas,
          creado_en: revision.creado_en,
          enviado_por: revision.enviado?.nombre_visible ?? "Administrador"
        })),
        actividad_reciente: (auditoriaResult.data ?? []).map((evento: any) => ({
          id: evento.id,
          accion: evento.accion,
          tipo_entidad: evento.tipo_entidad,
          entidad_id: evento.entidad_id,
          creado_en: evento.creado_en,
          actor: evento.actor?.nombre_visible ?? "Sistema"
        })),
        publicaciones_semana: publicacionesSemana
      };
    },

    async listarTemasPaginados(filtros: { q?: string; estado?: string; sendaId?: string; grupoEdadId?: string; limit: number; offset: number }) {
      let themeIdsByAge: string[] | null = null;
      if (filtros.grupoEdadId) {
        const { data: relaciones, error: relacionesError } = await supabase.from("tema_grupo_edad").select("tema_id").eq("grupo_edad_id", filtros.grupoEdadId);
        if (relacionesError) throw relacionesError;
        themeIdsByAge = [...new Set((relaciones ?? []).map((relacion) => relacion.tema_id))];
        if (themeIdsByAge.length === 0) return { temas: [], total: 0, limit: filtros.limit, offset: filtros.offset };
      }

      let query = supabase
        .from("tema")
        .select("*, path:senda_id(id, codigo, nombre, color_hex), created_by:creado_por(id, nombre_visible), portada_recurso:portada_recurso_id(id, url_publica, texto_alternativo, titulo), grupos_edad:tema_grupo_edad(grupo_edad:grupo_edad_id(id, codigo, nombre))", { count: "exact" })
        .order("actualizado_en", { ascending: false })
        .range(filtros.offset, filtros.offset + filtros.limit - 1);

      if (filtros.q) {
        const q = filtros.q.replace(/[,%()]/g, " ").trim();
        if (q) query = query.or(`titulo.ilike.%${q}%,resumen.ilike.%${q}%,slug.ilike.%${q}%`);
      }
      if (filtros.estado && filtros.estado !== "todos") query = query.eq("estado", filtros.estado as Database["public"]["Enums"]["estado_publicacion"]);
      if (filtros.sendaId) query = query.eq("senda_id", filtros.sendaId);
      if (themeIdsByAge) query = query.in("id", themeIdsByAge);

      const { data, error, count } = await query;
      if (error) throw error;
      const dataArray = data ?? [];
      const completitudBatch = await calcularCompletitudTemasEnLote(dataArray);

      const temas = dataArray.map((theme: Record<string, unknown>) => ({
        ...mapTheme(theme),
        completitud: completitudBatch.get(String(theme.id))
      }));

      return { temas, total: count ?? 0, limit: filtros.limit, offset: filtros.offset };
    },

    async obtenerEstudioTema(temaId: string) {
      const [tema, pasos, actividades, completitud, revisionesResult] = await Promise.all([
        this.obtenerTema(temaId),
        this.listarPasosTema(temaId),
        this.listarActividades({ temaId, limit: 500, offset: 0 }),
        calcularCompletitudTema(temaId),
        supabase.from("revision_contenido").select("*").eq("tema_id", temaId).order("creado_en", { ascending: false }).limit(10)
      ]);
      if (revisionesResult.error) throw revisionesResult.error;
      return { tema, pasos, actividades: actividades.actividades, completitud, revisiones: revisionesResult.data ?? [] };
    },

    async listarActividades(filtros: { temaId?: string; tipoId?: string; grupoEdadId?: string; estado?: string; limit: number; offset: number }) {
      let themeIdsByStatus: string[] | null = null;
      if (filtros.estado && filtros.estado !== "todas") {
        const estadoTema = filtros.estado === "publicada"
          ? "publicado"
          : filtros.estado === "revision"
            ? "revision"
            : "borrador";
        const { data: temasEstado, error: temasEstadoError } = await supabase
          .from("tema")
          .select("id")
          .eq("estado", estadoTema as Database["public"]["Enums"]["estado_publicacion"]);
        if (temasEstadoError) throw temasEstadoError;
        themeIdsByStatus = (temasEstado ?? []).map((tema) => tema.id);
        if (themeIdsByStatus.length === 0) return { actividades: [], total: 0 };
      }

      let query = supabase
        .from("actividad")
        .select(`
      *,
      tipo_actividad:tipo_actividad_id(id, codigo, nombre),
      opciones:opcion_actividad(id, actividad_id, etiqueta, texto, correcta, orden, retroalimentacion),
      tema:tema_id(id, titulo, slug, estado, senda:senda_id(id, codigo, nombre, color_hex)),
      grupo_edad:grupo_edad_id(id, codigo, nombre)
    `, { count: "exact" })
        .order("creado_en", { ascending: false })
        .range(filtros.offset, filtros.offset + filtros.limit - 1);

      if (filtros.temaId) query = query.eq("tema_id", filtros.temaId);
      if (filtros.tipoId) query = query.eq("tipo_actividad_id", filtros.tipoId);
      if (filtros.grupoEdadId) query = query.eq("grupo_edad_id", filtros.grupoEdadId);
      if (themeIdsByStatus) query = query.in("tema_id", themeIdsByStatus);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        actividades: (data ?? []).map((a: Record<string, unknown>) => mapActivity(a)),
        total: count ?? 0
      };
    },

    async obtenerActividad(actividadId: string) {
      const { data, error } = await supabase
        .from("actividad")
        .select(`
          *,
          tipo_actividad:tipo_actividad_id(id, codigo, nombre),
          opciones:opcion_actividad(id, actividad_id, etiqueta, texto, correcta, orden, retroalimentacion),
          tema:tema_id(id, titulo, slug, estado, senda:senda_id(id, codigo, nombre, color_hex)),
          grupo_edad:grupo_edad_id(id, codigo, nombre)
        `)
        .eq("id", actividadId)
        .single();

      if (error || !data) throw new NotFoundError("Actividad no encontrada");
      return mapActivity(data as Record<string, unknown>);
    },

    async listarTemas(status?: string) {
      let query = supabase
        .from("tema")
        .select("*, path:senda_id(id, codigo, nombre, color_hex), created_by:creado_por(id, nombre_visible), portada_recurso:portada_recurso_id(id, url_publica, texto_alternativo, titulo), grupos_edad:tema_grupo_edad(grupo_edad:grupo_edad_id(id, codigo, nombre))")
        .order("actualizado_en", { ascending: false });

      if (status) query = query.eq("estado", status as Database["public"]["Enums"]["estado_publicacion"]);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((theme: Record<string, unknown>) => mapTheme(theme));
    },

    async obtenerTema(temaId: string) {
      const { data, error } = await supabase
        .from("tema")
        .select("*, path:senda_id(id, codigo, nombre, color_hex), created_by:creado_por(id, nombre_visible), portada_recurso:portada_recurso_id(id, url_publica, texto_alternativo, titulo), grupos_edad:tema_grupo_edad(grupo_edad:grupo_edad_id(id, codigo, nombre))")
        .eq("id", temaId)
        .single();
      if (error || !data) throw new NotFoundError("Tema no encontrado");
      return mapTheme(data as Record<string, unknown>);
    },

    async crearTema(body: CreateThemeInput, userId: string) {
      const { data: theme, error } = await supabase
        .from("tema")
        .insert({
          senda_id: body.senda_id,
          titulo: body.titulo,
          slug: body.slug,
          objetivo: body.objetivo,
          resumen: body.resumen,
          version_biblica_id: body.version_biblica_id,
          estado: "borrador",
          xp_recompensa: body.xp_recompensa,
          minutos_estimados: body.minutos_estimados,
          portada_recurso_id: body.portada_recurso_id ?? null,
          creado_por: userId
        })
        .select("*")
        .single();

      if (error || !theme) throw error;
      const rows = body.grupo_edad_ids.map((grupoEdadId: string) => ({ tema_id: theme.id, grupo_edad_id: grupoEdadId }));
      const { error: ageError } = await supabase.from("tema_grupo_edad").insert(rows);
      if (ageError) {
        // Supabase REST no agrupa estas escrituras en una transacción. Eliminamos
        // el padre para no dejar un tema huérfano si falla la relación etaria.
        await supabase.from("tema").delete().eq("id", theme.id);
        throw ageError;
      }
      return mapTheme(theme as Record<string, unknown>);
    },

    async actualizarTema(temaId: string, body: UpdateThemeInput) {
      const { data: theme, error } = await supabase
        .from("tema")
        .update({
          ...(body.senda_id !== undefined ? { senda_id: body.senda_id } : {}),
          ...(body.titulo !== undefined ? { titulo: body.titulo } : {}),
          ...(body.slug !== undefined ? { slug: body.slug } : {}),
          ...(body.objetivo !== undefined ? { objetivo: body.objetivo } : {}),
          ...(body.resumen !== undefined ? { resumen: body.resumen } : {}),
          ...(body.minutos_estimados !== undefined ? { minutos_estimados: body.minutos_estimados } : {}),
          ...(body.xp_recompensa !== undefined ? { xp_recompensa: body.xp_recompensa } : {}),
          ...(body.version_biblica_id !== undefined ? { version_biblica_id: body.version_biblica_id } : {}),
          ...(body.portada_recurso_id !== undefined ? { portada_recurso_id: body.portada_recurso_id } : {}),
          actualizado_en: new Date().toISOString()
        })
        .eq("id", temaId)
        .select("*")
        .single();
      if (error || !theme) throw new NotFoundError("Tema no encontrado");
      if (body.grupo_edad_ids) {
        const { data: relacionesAnteriores, error: relacionesError } = await supabase
          .from("tema_grupo_edad")
          .select("grupo_edad_id")
          .eq("tema_id", temaId);
        if (relacionesError) throw relacionesError;

        const { error: deleteError } = await supabase.from("tema_grupo_edad").delete().eq("tema_id", temaId);
        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
          .from("tema_grupo_edad")
          .insert(body.grupo_edad_ids.map((grupoEdadId: string) => ({ tema_id: temaId, grupo_edad_id: grupoEdadId })));

        if (insertError) {
          const restaurar = (relacionesAnteriores ?? []).map((relacion) => ({
            tema_id: temaId,
            grupo_edad_id: relacion.grupo_edad_id
          }));
          if (restaurar.length > 0) await supabase.from("tema_grupo_edad").insert(restaurar);
          throw insertError;
        }
      }
      return mapTheme(theme as Record<string, unknown>);
    },

    async borrarTema(temaId: string) {
      const { error } = await supabase.from("tema").delete().eq("id", temaId);
      if (error) throw error;
      return { deleted: true };
    },

    async crearPasoTema(temaId: string, body: UpsertStepContentInput) {
      const { data: stepType } = await supabase.from("tipo_paso_crecer").select("orden").eq("id", body.tipo_paso_id).single();
      const sortOrder = stepType?.orden ?? 1;
      const { data: step, error: stepError } = await supabase.from("paso_tema").upsert({ tema_id: temaId, tipo_paso_id: body.tipo_paso_id, orden: sortOrder, obligatorio: true }, { onConflict: "tema_id,tipo_paso_id" }).select("*").single();
      if (stepError || !step) throw stepError;
      const { data: content, error: contentError } = await supabase.from("contenido_paso_tema").upsert({
        paso_id: step.id,
        grupo_edad_id: body.grupo_edad_id,
        titulo: body.titulo,
        cuerpo: body.cuerpo,
        instruccion_corta: body.instruccion_corta ?? null,
        recurso_id: body.recurso_id ?? null,
        recurso_audio_id: body.recurso_audio_id ?? null,
        datos_extra: (body.datos_extra ?? {}) as Json
      }, { onConflict: "paso_id,grupo_edad_id" }).select("*").single();
      if (contentError) throw contentError;

      if (body.preguntas) {
        const { error: deleteQuestionsError } = await supabase.from("pregunta_reflexion").delete().eq("paso_id", step.id).eq("grupo_edad_id", body.grupo_edad_id);
        if (deleteQuestionsError) throw deleteQuestionsError;
        if (body.preguntas.length > 0) {
          const { error: insertQuestionsError } = await supabase.from("pregunta_reflexion").insert(body.preguntas.map((pregunta) => ({
            paso_id: step.id,
            grupo_edad_id: body.grupo_edad_id,
            pregunta: pregunta.pregunta,
            orden: pregunta.orden
          })));
          if (insertQuestionsError) throw insertQuestionsError;
        }
      }

      return { paso: mapStep(step as Record<string, unknown>), contenido: {
        id: String(content.id), paso_id: String(content.paso_id), grupo_edad_id: String(content.grupo_edad_id),
        titulo: String(content.titulo), cuerpo: String(content.cuerpo),
        instruccion_corta: (content.instruccion_corta ?? null) as string | null,
        recurso_id: (content.recurso_id ?? null) as string | null,
        recurso_audio_id: (content.recurso_audio_id ?? null) as string | null,
        datos_extra: (content.datos_extra ?? {}) as Record<string, unknown>
      } };
    },

    async listarPasosTema(temaId: string) {
      const { data: steps, error } = await supabase.from("paso_tema").select(`*, tipo_paso:tipo_paso_id(*), contenidos:contenido_paso_tema(*), preguntas:pregunta_reflexion(*)`).eq("tema_id", temaId).order("orden", { ascending: true });
      if (error) throw error;
      return (steps ?? []).map((step: Record<string, unknown>) => mapStep(step));
    },

    async borrarPasoTema(temaId: string, tipoPasoId: string) {
      const { data: step } = await supabase.from("paso_tema").select("id").eq("tema_id", temaId).eq("tipo_paso_id", tipoPasoId).single();
      if (!step) throw new NotFoundError("Paso no encontrado");
      await supabase.from("contenido_paso_tema").delete().eq("paso_id", step.id);
      await supabase.from("paso_tema").delete().eq("id", step.id);
      return { deleted: true };
    },

    async crearActividad(body: CreateActivityInput) {
      const configuracion = await validarConfiguracionActividadPersistida(body.tipo_actividad_id, body.configuracion);
      const { data: activity, error } = await supabase.from("actividad").insert({ tema_id: body.tema_id, paso_id: body.paso_id ?? null, grupo_edad_id: body.grupo_edad_id, tipo_actividad_id: body.tipo_actividad_id, titulo: body.titulo, consigna: body.consigna, retroalimentacion: body.retroalimentacion ?? null, orden: body.orden, xp_recompensa: body.xp_recompensa, limite_tiempo_seg: body.limite_tiempo_seg ?? null, dificultad: body.dificultad, obligatorio: body.obligatorio, configuracion: configuracion as Json }).select("*").single();
      if (error || !activity) throw error;
      if (body.opciones.length > 0) {
        const rows = body.opciones.map((opcion) => ({ actividad_id: activity.id, etiqueta: opcion.etiqueta, texto: opcion.texto, correcta: opcion.correcta, orden: opcion.orden, retroalimentacion: opcion.retroalimentacion ?? null }));
        const { error: optionsError } = await supabase.from("opcion_actividad").insert(rows);
        if (optionsError) {
          await supabase.from("actividad").delete().eq("id", activity.id);
          throw optionsError;
        }
      }
      return activity;
    },

    async actualizarActividad(actividadId: string, body: UpdateActivityInput) {
      const configuracion = body.configuracion === undefined ? undefined : await (async () => {
        const { data: actual, error } = await supabase.from("actividad").select("tipo_actividad_id").eq("id", actividadId).single();
        if (error || !actual) throw new NotFoundError("Actividad no encontrada");
        return validarConfiguracionActividadPersistida(actual.tipo_actividad_id, body.configuracion);
      })();
      const { data: activity, error } = await supabase.from("actividad").update({
        ...(body.tema_id !== undefined ? { tema_id: body.tema_id } : {}),
        ...(body.paso_id !== undefined ? { paso_id: body.paso_id } : {}),
        ...(body.grupo_edad_id !== undefined ? { grupo_edad_id: body.grupo_edad_id } : {}),
        ...(body.tipo_actividad_id !== undefined ? { tipo_actividad_id: body.tipo_actividad_id } : {}),
        ...(body.titulo !== undefined ? { titulo: body.titulo } : {}),
        ...(body.consigna !== undefined ? { consigna: body.consigna } : {}),
        ...(body.retroalimentacion !== undefined ? { retroalimentacion: body.retroalimentacion } : {}),
        ...(body.orden !== undefined ? { orden: body.orden } : {}),
        ...(body.xp_recompensa !== undefined ? { xp_recompensa: body.xp_recompensa } : {}),
        ...(body.limite_tiempo_seg !== undefined ? { limite_tiempo_seg: body.limite_tiempo_seg } : {}),
        ...(body.dificultad !== undefined ? { dificultad: body.dificultad } : {}),
        ...(body.obligatorio !== undefined ? { obligatorio: body.obligatorio } : {}),
        ...(configuracion !== undefined ? { configuracion: configuracion as Json } : {}),
        actualizado_en: new Date().toISOString()
      } as Database["public"]["Tables"]["actividad"]["Update"]).eq("id", actividadId).select("*").single();
      if (error || !activity) throw new NotFoundError("Actividad no encontrada");
      if (body.opciones) {
        const { data: opcionesAnteriores, error: opcionesError } = await supabase
          .from("opcion_actividad")
          .select("etiqueta, texto, correcta, orden, retroalimentacion")
          .eq("actividad_id", actividadId);
        if (opcionesError) throw opcionesError;

        const { error: delError } = await supabase.from("opcion_actividad").delete().eq("actividad_id", actividadId);
        if (delError) throw delError;

        const rows = body.opciones.map((opcion) => ({ actividad_id: actividadId, etiqueta: opcion.etiqueta, texto: opcion.texto, correcta: opcion.correcta, orden: opcion.orden, retroalimentacion: opcion.retroalimentacion ?? null }));
        const { error: insError } = rows.length > 0
          ? await supabase.from("opcion_actividad").insert(rows)
          : { error: null };

        if (insError) {
          const restaurar = (opcionesAnteriores ?? []).map((opcion) => ({ ...opcion, actividad_id: actividadId }));
          if (restaurar.length > 0) await supabase.from("opcion_actividad").insert(restaurar);
          throw insError;
        }
      }
      return activity;
    },

    async borrarActividad(actividadId: string) {
      await supabase.from("opcion_actividad").delete().eq("actividad_id", actividadId);
      await supabase.from("progreso_actividad_usuario").delete().eq("actividad_id", actividadId);
      const { error } = await supabase.from("actividad").delete().eq("id", actividadId);
      if (error) throw error;
      return { deleted: true };
    },

    async reordenarActividades(temaId: string, body: ReorderActivitiesInput) {
      const { data: actividades, error } = await supabase.from("actividad").select("id").eq("tema_id", temaId).in("id", body.actividad_ids);
      if (error) throw error;
      if ((actividades ?? []).length !== body.actividad_ids.length) throw new BadRequestError("Una o más actividades no pertenecen al tema");

      for (let indice = 0; indice < body.actividad_ids.length; indice += 1) {
        const { error: updateError } = await supabase.from("actividad").update({ orden: 1000 + indice }).eq("id", body.actividad_ids[indice]);
        if (updateError) throw updateError;
      }
      for (let indice = 0; indice < body.actividad_ids.length; indice += 1) {
        const { error: updateError } = await supabase.from("actividad").update({ orden: indice + 1, actualizado_en: new Date().toISOString() }).eq("id", body.actividad_ids[indice]);
        if (updateError) throw updateError;
      }
      return this.listarActividades({ temaId, limit: 500, offset: 0 });
    },

    async duplicarActividad(actividadId: string) {
      const { data: origen, error } = await supabase.from("actividad").select("*, opciones:opcion_actividad(*)").eq("id", actividadId).single();
      if (error || !origen) throw new NotFoundError("Actividad no encontrada");
      const { data: creada, error: createError } = await supabase.from("actividad").insert({
        tema_id: origen.tema_id,
        paso_id: origen.paso_id,
        grupo_edad_id: origen.grupo_edad_id,
        tipo_actividad_id: origen.tipo_actividad_id,
        titulo: crearTituloCopia(origen.titulo),
        consigna: origen.consigna,
        retroalimentacion: origen.retroalimentacion,
        orden: Number(origen.orden ?? 0) + 1,
        xp_recompensa: origen.xp_recompensa,
        limite_tiempo_seg: origen.limite_tiempo_seg,
        dificultad: origen.dificultad,
        obligatorio: origen.obligatorio,
        configuracion: origen.configuracion
      }).select("*").single();
      if (createError || !creada) throw createError;
      const opciones = Array.isArray(origen.opciones) ? origen.opciones : [];
      if (opciones.length > 0) {
        const { error: optionsError } = await supabase.from("opcion_actividad").insert(opciones.map((opcion: any) => ({
          actividad_id: creada.id,
          etiqueta: opcion.etiqueta,
          texto: opcion.texto,
          correcta: opcion.correcta,
          orden: opcion.orden,
          retroalimentacion: opcion.retroalimentacion
        })));
        if (optionsError) throw optionsError;
      }
      return this.obtenerActividad(creada.id);
    },

    async enviarTemaRevision(temaId: string, body: SubmitReviewInput, userId: string) {
      const completitud = await calcularCompletitudTema(temaId);
      if (!completitud.listo_para_revision) {
        throw new BadRequestError("Completa la información, CRECER y actividades antes de enviar a revisión", completitud);
      }
      const { data, error } = await supabase.from("revision_contenido").insert({
        tema_id: temaId,
        enviado_por: userId,
        estado: "enviado",
        notas: body.notas ?? null
      }).select("*").single();
      if (error) throw error;
      await supabase.from("tema").update({ estado: "revision", actualizado_en: new Date().toISOString() }).eq("id", temaId);
      await registrarAuditoria({ actorId: userId, accion: "enviar_revision", tipoEntidad: "tema", entidadId: temaId, despues: data });
      return data;
    },

    async resolverRevisionTema(temaId: string, body: ResolveReviewInput, userId: string) {
      const { data: revision, error: revisionError } = await supabase.from("revision_contenido").select("id").eq("tema_id", temaId).eq("estado", "enviado").order("creado_en", { ascending: false }).limit(1).maybeSingle();
      if (revisionError) throw revisionError;
      if (!revision) throw new BadRequestError("El tema no tiene una revisión pendiente");
      const { data, error } = await supabase.from("revision_contenido").update({
        estado: body.estado,
        notas: body.notas ?? null,
        revisado_por: userId,
        revisado_en: new Date().toISOString()
      }).eq("id", revision.id).select("*").single();
      if (error) throw error;
      const estadoTema = body.estado === "aprobado" ? "aprobado" : "borrador";
      await supabase.from("tema").update({ estado: estadoTema, actualizado_en: new Date().toISOString() }).eq("id", temaId);
      await registrarAuditoria({ actorId: userId, accion: `revision_${body.estado}`, tipoEntidad: "tema", entidadId: temaId, despues: data });
      return data;
    },

    async publicarTema(temaId: string, userId: string) {
      const { data: theme, error: themeError } = await supabase.from("tema").select("id, estado, version_contenido").eq("id", temaId).single();
      if (themeError || !theme) throw new NotFoundError("Tema no encontrado");
      if (theme.estado === "publicado") return mapTheme(theme as Record<string, unknown>);
      const completitud = await calcularCompletitudTema(temaId, { requiereRevisionAprobada: true });
      if (!completitud.listo_para_revision) throw new UnprocessableEntityError("El tema todavía no está completo para publicarse", completitud);
      if (!puedePublicar(theme.estado as "borrador" | "revision" | "aprobado" | "publicado" | "archivado", completitud.revisionAprobada)) {
        throw new BadRequestError("El tema debe aprobarse antes de publicarse");
      }
      validarTransicionEditorial(theme.estado as "aprobado", "publicado");
      const currentVersion = theme.version_contenido ?? 0;
      const { data: filasPublicadas, error } = await supabase.rpc("publicar_tema_con_auditoria", {
        p_tema_id: temaId,
        p_actor_id: userId,
        p_version_esperada: currentVersion,
      });
      if (error) throw error;
      const data = filasPublicadas?.[0];
      if (!data) throw new BadRequestError("El tema cambió mientras se publicaba; vuelve a cargarlo");
      return mapTheme(data as Record<string, unknown>);
    },

    async guardarBorradorTema(temaId: string) {
      const { data, error } = await supabase.from("tema").update({ estado: "borrador", actualizado_en: new Date().toISOString() }).eq("id", temaId).select("*").single();
      if (error) throw error;
      return mapTheme(data as Record<string, unknown>);
    },

    async archivarTema(temaId: string) {
      const { error } = await supabase.from("tema").update({ estado: "archivado", actualizado_en: new Date().toISOString() }).eq("id", temaId);
      if (error) throw error;
      return this.obtenerTema(temaId);
    },

    async duplicarTema(temaId: string, user: AdminUser) {
      const [temaOrigenResult, pasosResult, actividadesResult] = await Promise.all([
        supabase.from("tema").select("*, path:senda_id(id, codigo, nombre, color_hex), created_by:creado_por(id, nombre_visible), portada_recurso:portada_recurso_id(id, url_publica, texto_alternativo, titulo), grupos_edad:tema_grupo_edad(grupo_edad:grupo_edad_id(id, codigo, nombre))").eq("id", temaId).single(),
        supabase.from("paso_tema").select("*, contenidos:contenido_paso_tema(*), preguntas:pregunta_reflexion(*)").eq("tema_id", temaId).order("orden"),
        supabase.from("actividad").select("*, opciones:opcion_actividad(*)").eq("tema_id", temaId).order("orden")
      ]);
      if (temaOrigenResult.error || !temaOrigenResult.data) throw new NotFoundError("Tema no encontrado");
      if (pasosResult.error) throw pasosResult.error;
      if (actividadesResult.error) throw actividadesResult.error;

      const temaBase = temaOrigenResult.data as any;
      const { data: temaDuplicado, error: duplicadoError } = await supabase.from("tema").insert({
        senda_id: temaBase.senda_id,
        titulo: crearTituloCopia(temaBase.titulo ?? "Tema"),
        slug: crearSlugCopia(temaBase.slug ?? "tema"),
        objetivo: temaBase.objetivo,
        resumen: temaBase.resumen,
        portada_recurso_id: temaBase.portada_recurso_id,
        estado: "borrador",
        version_biblica_id: temaBase.version_biblica_id,
        xp_recompensa: temaBase.xp_recompensa,
        minutos_estimados: temaBase.minutos_estimados,
        version_contenido: 0,
        creado_por: user.id,
        actualizado_en: new Date().toISOString()
      }).select("*").single();
      if (duplicadoError || !temaDuplicado) throw duplicadoError ?? new Error("No se pudo duplicar el tema");

      try {
        const gruposEdad = Array.isArray(temaBase.grupos_edad) ? temaBase.grupos_edad.map((grupo: any) => ({
          tema_id: temaDuplicado.id,
          grupo_edad_id: grupo.grupo_edad?.id ?? grupo.id
        })) : [];
        if (gruposEdad.length > 0) {
          const { error } = await supabase.from("tema_grupo_edad").insert(gruposEdad);
          if (error) throw error;
        }

        const pasoIdMap = new Map<string, string>();
        for (const paso of pasosResult.data ?? []) {
          const { data: nuevoPaso, error } = await supabase.from("paso_tema").insert({
            tema_id: temaDuplicado.id,
            tipo_paso_id: paso.tipo_paso_id,
            orden: paso.orden,
            obligatorio: paso.obligatorio
          }).select("*").single();
          if (error || !nuevoPaso) throw error;
          pasoIdMap.set(paso.id, nuevoPaso.id);

          const contenidos = Array.isArray(paso.contenidos) ? paso.contenidos : [];
          if (contenidos.length > 0) {
            const { error: contentError } = await supabase.from("contenido_paso_tema").insert(contenidos.map((contenido: any) => ({
              paso_id: nuevoPaso.id,
              grupo_edad_id: contenido.grupo_edad_id,
              titulo: contenido.titulo,
              cuerpo: contenido.cuerpo,
              instruccion_corta: contenido.instruccion_corta,
              recurso_id: contenido.recurso_id,
              recurso_audio_id: contenido.recurso_audio_id,
              datos_extra: contenido.datos_extra
            })));
            if (contentError) throw contentError;
          }
          const preguntas = Array.isArray(paso.preguntas) ? paso.preguntas : [];
          if (preguntas.length > 0) {
            const { error: questionsError } = await supabase.from("pregunta_reflexion").insert(preguntas.map((pregunta: any) => ({
              paso_id: nuevoPaso.id,
              grupo_edad_id: pregunta.grupo_edad_id,
              pregunta: pregunta.pregunta,
              orden: pregunta.orden
            })));
            if (questionsError) throw questionsError;
          }
        }

        for (const actividad of actividadesResult.data ?? []) {
          const { data: nuevaActividad, error } = await supabase.from("actividad").insert({
            tema_id: temaDuplicado.id,
            paso_id: actividad.paso_id ? pasoIdMap.get(actividad.paso_id) ?? null : null,
            grupo_edad_id: actividad.grupo_edad_id,
            tipo_actividad_id: actividad.tipo_actividad_id,
            titulo: actividad.titulo,
            consigna: actividad.consigna,
            retroalimentacion: actividad.retroalimentacion,
            orden: actividad.orden,
            xp_recompensa: actividad.xp_recompensa,
            limite_tiempo_seg: actividad.limite_tiempo_seg,
            dificultad: actividad.dificultad,
            obligatorio: actividad.obligatorio,
            configuracion: actividad.configuracion
          }).select("*").single();
          if (error || !nuevaActividad) throw error;
          const opciones = Array.isArray(actividad.opciones) ? actividad.opciones : [];
          if (opciones.length > 0) {
            const { error: optionsError } = await supabase.from("opcion_actividad").insert(opciones.map((opcion: any) => ({
              actividad_id: nuevaActividad.id,
              etiqueta: opcion.etiqueta,
              texto: opcion.texto,
              correcta: opcion.correcta,
              orden: opcion.orden,
              retroalimentacion: opcion.retroalimentacion
            })));
            if (optionsError) throw optionsError;
          }
        }
      } catch (error) {
        await supabase.from("tema").delete().eq("id", temaDuplicado.id);
        throw error;
      }

      await registrarAuditoria({ actorId: user.id, accion: "duplicar", tipoEntidad: "tema", entidadId: temaDuplicado.id, despues: { origen_id: temaId } });
      return this.obtenerTema(temaDuplicado.id);
    },

    async listarUsuarios(params: { q?: string; rol?: string; limit: number; offset: number }) {
      const condiciones = [] as Array<ReturnType<typeof eq> | ReturnType<typeof or>>;
      if (params.q) condiciones.push(or(ilike(schema.usuarioApp.nombreVisible, `%${params.q}%`), ilike(schema.usuarioApp.correo, `%${params.q}%`))!);
      if (params.rol) condiciones.push(eq(schema.usuarioApp.rol, params.rol as Database["public"]["Enums"]["rol_usuario"]));
      const whereClause = condiciones.length > 0 ? and(...condiciones) : undefined;
      const clienteDrizzle = requerirDrizzle();
      const usuarios = await clienteDrizzle.select({ usuario: schema.usuarioApp, perfil: schema.perfil }).from(schema.usuarioApp).leftJoin(schema.perfil, eq(schema.usuarioApp.id, schema.perfil.usuarioId)).where(whereClause).orderBy(desc(schema.usuarioApp.creadoEn)).limit(params.limit).offset(params.offset);
      const [countRow] = await clienteDrizzle.select({ total: sql<number>`count(*)` }).from(schema.usuarioApp).where(whereClause);
      return { usuarios: usuarios.map((fila) => ({ id: fila.usuario.id, rol: fila.usuario.rol, proveedor: fila.usuario.proveedor, nombre_visible: fila.usuario.nombreVisible, correo: fila.usuario.correo, activo: fila.usuario.activo, creado_en: fila.usuario.creadoEn.toISOString(), actualizado_en: fila.usuario.actualizadoEn.toISOString(), ultimo_login_en: fila.usuario.ultimoLoginEn ? fila.usuario.ultimoLoginEn.toISOString() : null, perfil: fila.perfil })), total: Number(countRow?.total ?? 0) };
    },

    async obtenerUsuario(usuarioId: string) {
      const clienteDrizzle = requerirDrizzle();
      const [usuario] = await clienteDrizzle.select({ usuario: schema.usuarioApp, perfil: schema.perfil }).from(schema.usuarioApp).leftJoin(schema.perfil, eq(schema.usuarioApp.id, schema.perfil.usuarioId)).where(eq(schema.usuarioApp.id, usuarioId)).limit(1);
      if (!usuario) throw new NotFoundError("Usuario no encontrado");
      return { id: usuario.usuario.id, rol: usuario.usuario.rol, proveedor: usuario.usuario.proveedor, nombre_visible: usuario.usuario.nombreVisible, correo: usuario.usuario.correo, activo: usuario.usuario.activo, creado_en: usuario.usuario.creadoEn.toISOString(), actualizado_en: usuario.usuario.actualizadoEn.toISOString(), ultimo_login_en: usuario.usuario.ultimoLoginEn ? usuario.usuario.ultimoLoginEn.toISOString() : null, perfil: usuario.perfil };
    },

    async actualizarUsuario(usuarioId: string, body: UpdateUserInput) {
      const clienteDrizzle = requerirDrizzle();
      const [existing] = await clienteDrizzle.select({ id: schema.usuarioApp.id }).from(schema.usuarioApp).where(eq(schema.usuarioApp.id, usuarioId)).limit(1); if (!existing) throw new NotFoundError("Usuario no encontrado");
      await clienteDrizzle.update(schema.usuarioApp).set({ ...(body.rol !== undefined ? { rol: body.rol } : {}), ...(body.nombre_visible !== undefined ? { nombreVisible: body.nombre_visible } : {}), actualizadoEn: new Date() }).where(eq(schema.usuarioApp.id, usuarioId));
      return this.obtenerUsuario(usuarioId);
    },

    async eliminarUsuario(usuarioId: string) {
      const clienteDrizzle = requerirDrizzle();
      const [existing] = await clienteDrizzle.select({ id: schema.usuarioApp.id }).from(schema.usuarioApp).where(eq(schema.usuarioApp.id, usuarioId)).limit(1); if (!existing) throw new NotFoundError("Usuario no encontrado");
      await clienteDrizzle.update(schema.usuarioApp).set({ activo: false, actualizadoEn: new Date() }).where(eq(schema.usuarioApp.id, usuarioId));
      return { eliminado: true };
    },

    async listarSendas() {
      const clienteDrizzle = requerirDrizzle();
      return clienteDrizzle
        .select()
        .from(schema.senda)
        .orderBy(asc(schema.senda.orden));
    },

    async crearSenda(body: CreateSendaInput) {
      const clienteDrizzle = requerirDrizzle();
      const [senda] = await clienteDrizzle
        .insert(schema.senda)
        .values({
          codigo: body.codigo,
          nombre: body.nombre,
          descripcion: body.descripcion ?? null,
          colorHex: body.color_hex,
          nombreIcono: body.nombre_icono ?? null,
          imagenRecursoId: body.imagen_recurso_id ?? null,
          orden: body.orden,
          activo: body.activo
        })
        .returning();
      return senda;
    },

    async obtenerSenda(sendaId: string) {
      const clienteDrizzle = requerirDrizzle();
      const [senda] = await clienteDrizzle
        .select()
        .from(schema.senda)
        .where(eq(schema.senda.id, sendaId))
        .limit(1);
      if (!senda) throw new NotFoundError("Senda no encontrada");
      return senda;
    },

    async actualizarSenda(sendaId: string, body: UpdateSendaInput) {
      const clienteDrizzle = requerirDrizzle();
      const updateData: Partial<typeof schema.senda.$inferInsert> = {};
      if (body.codigo !== undefined) updateData.codigo = body.codigo;
      if (body.nombre !== undefined) updateData.nombre = body.nombre;
      if (body.descripcion !== undefined) updateData.descripcion = body.descripcion;
      if (body.color_hex !== undefined) updateData.colorHex = body.color_hex;
      if (body.nombre_icono !== undefined) updateData.nombreIcono = body.nombre_icono;
      if (body.imagen_recurso_id !== undefined) updateData.imagenRecursoId = body.imagen_recurso_id;
      if (body.orden !== undefined) updateData.orden = body.orden;
      if (body.activo !== undefined) updateData.activo = body.activo;

      const [senda] = await clienteDrizzle
        .update(schema.senda)
        .set(updateData)
        .where(eq(schema.senda.id, sendaId))
        .returning();
      if (!senda) throw new NotFoundError("Senda no encontrada");
      return senda;
    }
  };
}
