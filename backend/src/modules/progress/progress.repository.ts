import { eq, sql, and, inArray } from "drizzle-orm";
import type { DbClient } from "../../db/client";
import { schema } from "../../db/client";
import { calcularRachaDiaria } from "../gamification/racha.service";

/** Actualiza (o inserta) el registro de progreso de un tema al 100% completado */
async function actualizarProgresoTema100(db: DbClient, usuarioId: string, temaId: string) {
  const [existing] = await db
    .select({ id: schema.progresoTemaUsuario.usuarioId })
    .from(schema.progresoTemaUsuario)
    .where(
      sql`${schema.progresoTemaUsuario.usuarioId} = ${usuarioId} AND
          ${schema.progresoTemaUsuario.temaId} = ${temaId}`
    )
    .limit(1);

  if (existing) {
    await db.update(schema.progresoTemaUsuario)
      .set({ porcentaje: 100, estado: "completado", actualizadoEn: new Date(), completadoEn: new Date() })
      .where(
        sql`${schema.progresoTemaUsuario.usuarioId} = ${usuarioId} AND
            ${schema.progresoTemaUsuario.temaId} = ${temaId}`
      );
  } else {
    await db.insert(schema.progresoTemaUsuario)
      .values({ usuarioId, temaId, porcentaje: 100, estado: "completado", completadoEn: new Date() });
  }

  console.log(`[PROGRESO] Tema ${temaId} forzado a 100% para usuario ${usuarioId}`);
}

/** Registra una actividad como completada en progreso_actividad_usuario */
async function asegurarActividadCompletada(
  db: DbClient,
  usuarioId: string,
  actividadId: string,
  puntaje?: number | null
) {
  try {
    const [existing] = await db
      .select({ usuarioId: schema.progresoActividadUsuario.usuarioId })
      .from(schema.progresoActividadUsuario)
      .where(
        and(
          eq(schema.progresoActividadUsuario.usuarioId, usuarioId),
          eq(schema.progresoActividadUsuario.actividadId, actividadId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(schema.progresoActividadUsuario)
        .set({
          completado: true,
          mejorPuntaje: puntaje ?? 100,
          actualizadoEn: new Date(),
          completadoEn: new Date(),
        })
        .where(
          and(
            eq(schema.progresoActividadUsuario.usuarioId, usuarioId),
            eq(schema.progresoActividadUsuario.actividadId, actividadId)
          )
        );
    } else {
      await db.insert(schema.progresoActividadUsuario).values({
        usuarioId,
        actividadId,
        completado: true,
        intentos: 1,
        mejorPuntaje: puntaje ?? 100,
        actualizadoEn: new Date(),
        completadoEn: new Date(),
      });
    }
  } catch (err) {
    console.warn("[PROGRESO] No se pudo sincronizar progreso_actividad_usuario:", err);
  }
}

export function crearProgressRepository(db: DbClient) {
  return {
    async obtenerProgresoPropio(usuarioId: string) {
      const themes = await db
        .select()
        .from(schema.progresoTemaUsuario)
        .where(eq(schema.progresoTemaUsuario.usuarioId, usuarioId));

      const activities = await db
        .select()
        .from(schema.progresoActividadUsuario)
        .where(eq(schema.progresoActividadUsuario.usuarioId, usuarioId));

      return { themes, activities };
    },

    async registrarEvento(usuarioId: string, body: {
      evento_id_cliente: string;
      tipo_evento: string;
      tema_id?: string;
      paso_id?: string;
      actividad_id?: string;
      correcta?: boolean;
      puntaje?: number;
      xp_otorgada?: number;
      datos?: Record<string, unknown>;
      ocurrido_en_cliente?: string;
      dispositivo_id?: string;
    }) {
      let xpOtorga = body.xp_otorgada ?? 0;

      // La recompensa del tema siempre se determina en el servidor.
      if (body.tipo_evento === "tema_completado" && body.tema_id) {
        const [tema] = await db
          .select({ xpRecompensa: schema.tema.xpRecompensa })
          .from(schema.tema)
          .where(eq(schema.tema.id, body.tema_id))
          .limit(1);

        xpOtorga = Number(tema?.xpRecompensa ?? 0);
      }

      if (body.tipo_evento === "actividad_completada" && body.actividad_id) {
        await asegurarActividadCompletada(db, usuarioId, body.actividad_id, body.puntaje);
      }

      // ANTI-FARMING: Si el evento da XP, revisamos que no haya ganado XP por este tema o actividad antes
      if (xpOtorga > 0) {
        if (body.tema_id && body.tipo_evento === "tema_completado") {
          const [exists] = await db
            .select({ id: schema.eventoProgreso.id })
            .from(schema.eventoProgreso)
            .where(
              sql`${schema.eventoProgreso.usuarioId} = ${usuarioId} AND 
                  ${schema.eventoProgreso.temaId} = ${body.tema_id} AND 
                  ${schema.eventoProgreso.xpOtorgada} > 0 AND
                  ${schema.eventoProgreso.tipoEvento} = 'tema_completado'`
            )
            .limit(1);

          if (exists) {
            await actualizarProgresoTema100(db, usuarioId, body.tema_id!);
            const logrosGanados = await verificarYOtorgarLogros(db, usuarioId, body.tipo_evento, body.tema_id);
            return { data: null, logrosGanados };
          }
        }

        if (body.actividad_id && body.tipo_evento === "actividad_completada") {
          const [exists] = await db
            .select({ id: schema.eventoProgreso.id })
            .from(schema.eventoProgreso)
            .where(
              sql`${schema.eventoProgreso.usuarioId} = ${usuarioId} AND 
                  ${schema.eventoProgreso.actividadId} = ${body.actividad_id} AND 
                  ${schema.eventoProgreso.xpOtorgada} > 0 AND
                  ${schema.eventoProgreso.tipoEvento} = 'actividad_completada'`
            )
            .limit(1);

          if (exists) return null;
        }
      }

      const fila = {
        usuarioId,
        idEventoCliente: body.evento_id_cliente,
        tipoEvento: body.tipo_evento as any,
        temaId: body.tema_id ?? null,
        pasoId: body.paso_id ?? null,
        actividadId: body.actividad_id ?? null,
        correcta: body.correcta ?? null,
        puntaje: body.puntaje ?? null,
        xpOtorgada: xpOtorga,
        datos: body.datos ?? {},
        ocurridoEnCliente: body.ocurrido_en_cliente ? new Date(body.ocurrido_en_cliente) : new Date(),
        dispositivoId: body.dispositivo_id ?? null
      };

      const [data] = await db
        .insert(schema.eventoProgreso)
        .values(fila as never)
        .onConflictDoNothing({ target: [schema.eventoProgreso.usuarioId, schema.eventoProgreso.idEventoCliente] })
        .returning();

      // ACTUALIZACIÓN DE PORCENTAJE DEL TEMA
      if (data && data.tipoEvento === "bloque_completado" && data.temaId) {
        const resultPasos = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.pasoTema)
          .where(and(
            eq(schema.pasoTema.temaId, data.temaId),
            eq(schema.pasoTema.obligatorio, true)
          ));

        const total = Number(resultPasos[0]?.count ?? 0);

        if (total > 0) {
          const resultCompletados = await db
            .select({ count: sql<number>`count(distinct ${schema.eventoProgreso.pasoId})` })
            .from(schema.eventoProgreso)
            .where(and(
              eq(schema.eventoProgreso.usuarioId, usuarioId),
              eq(schema.eventoProgreso.temaId, data.temaId),
              eq(schema.eventoProgreso.tipoEvento, 'bloque_completado')
            ));

          const completados = Number(resultCompletados[0]?.count ?? 0);
          const porcentaje = Math.floor((completados / total) * 100);

          const [existingProgress] = await db
            .select({
              id: schema.progresoTemaUsuario.usuarioId,
              porcentajeActual: schema.progresoTemaUsuario.porcentaje
            })
            .from(schema.progresoTemaUsuario)
            .where(and(
              eq(schema.progresoTemaUsuario.usuarioId, usuarioId),
              eq(schema.progresoTemaUsuario.temaId, data.temaId)
            ))
            .limit(1);

          if (existingProgress) {
            const nuevoPorcentaje = Math.max(existingProgress.porcentajeActual, porcentaje);

            await db.update(schema.progresoTemaUsuario)
              .set({
                porcentaje: nuevoPorcentaje,
                estado: nuevoPorcentaje >= 100 ? "completado" : "en_progreso",
                ultimoPasoId: data.pasoId,
                actualizadoEn: new Date(),
                completadoEn: nuevoPorcentaje >= 100 && existingProgress.porcentajeActual < 100 ? new Date() : undefined
              })
              .where(and(
                eq(schema.progresoTemaUsuario.usuarioId, usuarioId),
                eq(schema.progresoTemaUsuario.temaId, data.temaId)
              ));
          } else {
            await db.insert(schema.progresoTemaUsuario)
              .values({
                usuarioId,
                temaId: data.temaId,
                porcentaje,
                estado: porcentaje >= 100 ? "completado" : "en_progreso",
                ultimoPasoId: data.pasoId,
                completadoEn: porcentaje >= 100 ? new Date() : undefined
              });
          }
        }
      } else if (data && data.tipoEvento === "tema_completado" && data.temaId) {
        await actualizarProgresoTema100(db, usuarioId, data.temaId);
      }

      // ────────────────────────────────────────────────────────
      // MOTOR DE LOGROS: Verificar y otorgar logros automáticamente
      // ────────────────────────────────────────────────────────
      const logrosGanados = data
        ? await verificarYOtorgarLogros(db, usuarioId, data.tipoEvento, data.temaId ?? body.tema_id)
        : [];

      return { data: data ?? null, logrosGanados };
    }
  };
}

/**
 * Verifica si el usuario cumple los criterios de algún logro y los otorga.
 */
async function verificarYOtorgarLogros(
  db: DbClient,
  usuarioId: string,
  tipoEvento: string,
  temaIdEvento?: string | null
): Promise<Array<{
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  codigo_criterio: string;
  valor_criterio: number | null;
  bono_xp: number;
  url_icono: string | null;
}>> {
  const eventosRelevantes = ["tema_completado", "actividad_completada", "bloque_completado"];
  if (!eventosRelevantes.includes(tipoEvento)) return [];

  const todosLosLogros = await db
    .select()
    .from(schema.logro)
    .where(eq(schema.logro.activo, true));

  if (todosLosLogros.length === 0) return [];

  const logrosYaGanados = await db
    .select({ logroId: schema.logroUsuario.logroId })
    .from(schema.logroUsuario)
    .where(eq(schema.logroUsuario.usuarioId, usuarioId));

  const idsYaGanados = new Set(logrosYaGanados.map((l) => l.logroId));
  const logrosNoPoseidos = todosLosLogros.filter((l) => !idsYaGanados.has(l.id));
  if (logrosNoPoseidos.length === 0) return [];

  const criteriosNecesarios = new Set(logrosNoPoseidos.map((l) => l.codigoCriterio));
  const metricas: Record<string, number> = {};

  // Consultar temas completados y sus slugs para verificar logros específicos de un tema
  const temasCompletadosFilas = await db
    .select({
      temaId: schema.progresoTemaUsuario.temaId,
      slug: schema.tema.slug,
    })
    .from(schema.progresoTemaUsuario)
    .leftJoin(schema.tema, eq(schema.progresoTemaUsuario.temaId, schema.tema.id))
    .where(and(
      eq(schema.progresoTemaUsuario.usuarioId, usuarioId),
      eq(schema.progresoTemaUsuario.estado, "completado")
    ));

  const slugsTemasCompletados = new Set(
    temasCompletadosFilas.map((t) => (t.slug ?? "").toLowerCase()).filter(Boolean)
  );
  const idsTemasCompletados = new Set(temasCompletadosFilas.map((t) => t.temaId));
  if (tipoEvento === "tema_completado" && temaIdEvento) {
    idsTemasCompletados.add(temaIdEvento);
  }

  if (criteriosNecesarios.has("temas_completados")) {
    metricas["temas_completados"] = idsTemasCompletados.size;
  }

  if (criteriosNecesarios.has("actividades_completadas")) {
    const [res] = await db
      .select({ total: sql<number>`count(distinct ${schema.eventoProgreso.actividadId})` })
      .from(schema.eventoProgreso)
      .where(and(
        eq(schema.eventoProgreso.usuarioId, usuarioId),
        eq(schema.eventoProgreso.tipoEvento, "actividad_completada"),
        sql`${schema.eventoProgreso.actividadId} IS NOT NULL`
      ));
    metricas["actividades_completadas"] = Number(res?.total ?? 0);
  }

  if (criteriosNecesarios.has("dias_racha")) {
    const filasDias = await db
      .select({ dia: sql<string>`(${schema.eventoProgreso.recibidoEnServidor} at time zone 'America/Guayaquil')::date::text` })
      .from(schema.eventoProgreso)
      .where(and(
        eq(schema.eventoProgreso.usuarioId, usuarioId),
        inArray(schema.eventoProgreso.tipoEvento, ["tema_completado", "actividad_respondida"]),
        sql`(${schema.eventoProgreso.tipoEvento} = 'tema_completado' or ${schema.eventoProgreso.correcta} = true)`,
      ))
      .groupBy(sql`(${schema.eventoProgreso.recibidoEnServidor} at time zone 'America/Guayaquil')::date`)
      .orderBy(sql`(${schema.eventoProgreso.recibidoEnServidor} at time zone 'America/Guayaquil')::date desc`)
      .limit(366);

    metricas["dias_racha"] = calcularRachaDiaria(filasDias.map((fila) => fila.dia)).actual;
  }

  const logrosGanados: Array<{
    id: string;
    nombre: string;
    codigo: string;
    descripcion: string | null;
    codigo_criterio: string;
    valor_criterio: number | null;
    bono_xp: number;
    url_icono: string | null;
  }> = [];

  for (const logro of logrosNoPoseidos) {
    const criterio = logro.codigoCriterio;
    const valorRequerido = Math.max(1, logro.valorCriterio ?? 1);
    const codigoLower = (logro.codigo ?? "").toLowerCase();

    // Si es un logro específico de tema (ej. tema-amor-de-dios), verificar que ese tema específico esté completado
    if (codigoLower.startsWith("tema-")) {
      const slugEsperado = codigoLower.replace(/^tema-/, "");
      const completadoTemaEspecifico =
        slugsTemasCompletados.has(slugEsperado) ||
        slugsTemasCompletados.has(`el-${slugEsperado}`) ||
        (slugEsperado === "amor-de-dios" && idsTemasCompletados.has("20000000-0000-0000-0000-000000000001"));
      if (!completadoTemaEspecifico) {
        continue;
      }
    }

    const valorActual = metricas[criterio] ?? 0;

    if (valorActual >= valorRequerido) {
      await db
        .insert(schema.logroUsuario)
        .values({ logroId: logro.id, usuarioId, ganadoEn: new Date() })
        .onConflictDoNothing();

      logrosGanados.push({
        id: logro.id,
        nombre: logro.nombre,
        codigo: logro.codigo,
        descripcion: logro.descripcion ?? null,
        codigo_criterio: logro.codigoCriterio,
        valor_criterio: logro.valorCriterio ?? null,
        bono_xp: logro.bonoXp,
        url_icono: logro.urlIcono ?? null,
      });
    }
  }

  return logrosGanados;
}

export type ProgressRepository = ReturnType<typeof crearProgressRepository>;
