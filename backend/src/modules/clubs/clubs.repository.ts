import { and, asc, desc, eq, gte, ilike, sql } from "drizzle-orm";
import type { DbClient } from "../../db/client";
import { schema } from "../../db/client";

export type ClubsRepository = ReturnType<typeof crearClubsRepository>;

type RetoParaProgreso = {
  id: string;
  codigoMetrica: string;
  fechaInicio: Date;
  fechaFin: Date;
  valorObjetivo: number;
};

export function crearClubsRepository(db: DbClient) {
  return {
    async listarMisClubes(usuarioId: string) {
      return db
        .select({
          club: schema.club,
          rolMiembro: schema.miembroClub.rolMiembro,
          unidoEn: schema.miembroClub.unidoEn,
        })
        .from(schema.miembroClub)
        .innerJoin(schema.club, eq(schema.miembroClub.clubId, schema.club.id))
        .where(and(eq(schema.miembroClub.usuarioId, usuarioId), eq(schema.club.activo, true)))
        .orderBy(desc(schema.miembroClub.unidoEn));
    },

    async listarClubes(search?: string) {
      const condiciones = [eq(schema.club.activo, true)];
      if (search) condiciones.push(ilike(schema.club.nombre, `%${search}%`));
      return db.select().from(schema.club).where(and(...condiciones)).orderBy(desc(schema.club.creadoEn));
    },

    async listarClubesAdministracion(input: { q?: string; activo?: boolean; orden?: "recientes" | "nombre" | "miembros"; limit: number; offset: number }) {
      const condiciones = [];
      if (input.q) condiciones.push(ilike(schema.club.nombre, `%${input.q}%`));
      if (input.activo !== undefined) condiciones.push(eq(schema.club.activo, input.activo));

      const filtro = condiciones.length > 0 ? and(...condiciones) : undefined;
      const orden = input.orden === "nombre"
        ? asc(schema.club.nombre)
        : input.orden === "miembros"
          ? desc(sql<number>`count(distinct ${schema.miembroClub.usuarioId})`)
          : desc(schema.club.creadoEn);
      const [clubes, [conteo]] = await Promise.all([
        db
          .select({
            id: schema.club.id,
            nombre: schema.club.nombre,
            descripcion: schema.club.descripcion,
            activo: schema.club.activo,
            creadoEn: schema.club.creadoEn,
            liderUsuarioId: sql<string | null>`(
              select responsable.usuario_id
              from miembro_club responsable
              where responsable.club_id = ${schema.club.id}
                and responsable.rol_miembro in ('propietario', 'lider')
              order by
                case responsable.rol_miembro when 'propietario' then 0 else 1 end,
                responsable.unido_en asc,
                responsable.usuario_id asc
              limit 1
            )`,
            liderApodo: sql<string | null>`(
              select coalesce(perfil_responsable.apodo, 'Semillero')
              from miembro_club responsable
              left join perfil perfil_responsable on perfil_responsable.usuario_id = responsable.usuario_id
              where responsable.club_id = ${schema.club.id}
                and responsable.rol_miembro in ('propietario', 'lider')
              order by
                case responsable.rol_miembro when 'propietario' then 0 else 1 end,
                responsable.unido_en asc,
                responsable.usuario_id asc
              limit 1
            )`,
            miembros: sql<number>`count(distinct ${schema.miembroClub.usuarioId})`,
            retosAbiertos: sql<number>`count(distinct ${schema.retoClub.id}) filter (where ${schema.retoClub.fechaFin} > now())`,
          })
          .from(schema.club)
          .leftJoin(schema.miembroClub, eq(schema.miembroClub.clubId, schema.club.id))
          .leftJoin(schema.perfil, eq(schema.perfil.usuarioId, schema.miembroClub.usuarioId))
          .leftJoin(schema.retoClub, eq(schema.retoClub.clubId, schema.club.id))
          .where(filtro)
          .groupBy(schema.club.id)
          .orderBy(orden)
          .limit(input.limit)
          .offset(input.offset),
        db.select({ total: sql<number>`count(*)` }).from(schema.club).where(filtro),
      ]);

      return { clubes, total: Number(conteo?.total ?? 0) };
    },

    async contarMiembrosPorClub() {
      return db
        .select({ clubId: schema.miembroClub.clubId, total: sql<number>`count(*)` })
        .from(schema.miembroClub)
        .groupBy(schema.miembroClub.clubId);
    },

    async obtenerClub(clubId: string) {
      const [club] = await db.select().from(schema.club).where(eq(schema.club.id, clubId)).limit(1);
      return club ?? null;
    },

    async obtenerClubPorCodigo(codigo: string) {
      const [club] = await db
        .select()
        .from(schema.club)
        .where(and(eq(schema.club.codigoInvitacion, codigo.toUpperCase()), eq(schema.club.activo, true)))
        .limit(1);
      return club ?? null;
    },

    async obtenerCreadorClub(usuarioId: string) {
      const [creador] = await db
        .select({ id: schema.usuarioApp.id, nombre_visible: schema.usuarioApp.nombreVisible })
        .from(schema.usuarioApp)
        .where(eq(schema.usuarioApp.id, usuarioId))
        .limit(1);
      return creador ?? null;
    },

    async listarMiembrosClub(clubId: string) {
      const resultado = await db.execute(sql`
        select
          cm.club_id,
          cm.usuario_id,
          cm.token_publico,
          cm.rol_miembro,
          cm.unido_en,
          coalesce(p.apodo, ua.nombre_visible, 'Semillero') as apodo,
          p.clave_avatar,
          p.url_avatar,
          coalesce(vx.xp_total, 0)::int as xp_total,
          coalesce(semanal.xp_semana, 0)::int as xp_semana,
          coalesce(semanal.actividades_semana, 0)::int as actividades_semana
        from miembro_club cm
        join usuario_app ua on ua.id = cm.usuario_id
        left join perfil p on p.usuario_id = cm.usuario_id
        left join v_xp_usuario vx on vx.usuario_id = cm.usuario_id
        left join lateral (
          select
            coalesce(sum(ep.xp_otorgada), 0)::int as xp_semana,
            count(*) filter (where ep.tipo_evento = 'actividad_completada')::int as actividades_semana
          from evento_progreso ep
          where ep.usuario_id = cm.usuario_id
            and ep.ocurrido_en_cliente >= date_trunc('week', now())
        ) semanal on true
        where cm.club_id = ${clubId}
        order by
          case cm.rol_miembro when 'propietario' then 0 when 'lider' then 1 else 2 end,
          xp_semana desc,
          xp_total desc,
          apodo asc
      `);
      return Array.from(resultado as Iterable<Record<string, unknown>>);
    },

    async listarMiembrosClubAdministracion(clubId: string) {
      const resultado = await db.execute(sql`
        select
          cm.club_id,
          cm.usuario_id,
          cm.token_publico,
          cm.rol_miembro,
          cm.unido_en,
          coalesce(p.apodo, 'Semillero') as apodo,
          p.clave_avatar,
          p.url_avatar,
          coalesce(vx.xp_total, 0)::int as xp_total,
          coalesce(semanal.xp_semana, 0)::int as xp_semana,
          coalesce(semanal.actividades_semana, 0)::int as actividades_semana
        from miembro_club cm
        left join perfil p on p.usuario_id = cm.usuario_id
        left join v_xp_usuario vx on vx.usuario_id = cm.usuario_id
        left join lateral (
          select
            coalesce(sum(ep.xp_otorgada), 0)::int as xp_semana,
            count(*) filter (where ep.tipo_evento = 'actividad_completada')::int as actividades_semana
          from evento_progreso ep
          where ep.usuario_id = cm.usuario_id
            and ep.ocurrido_en_cliente >= date_trunc('week', now())
        ) semanal on true
        where cm.club_id = ${clubId}
        order by
          case cm.rol_miembro when 'propietario' then 0 when 'lider' then 1 else 2 end,
          xp_semana desc,
          xp_total desc,
          apodo asc
      `);
      return Array.from(resultado as Iterable<Record<string, unknown>>);
    },

    async buscarCodigoInvitacion(codigo: string) {
      const [existing] = await db
        .select({ id: schema.club.id })
        .from(schema.club)
        .where(eq(schema.club.codigoInvitacion, codigo))
        .limit(1);
      return existing ?? null;
    },

    async crearClub(datos: { nombre: string; descripcion: string | null; codigoInvitacion: string; creadoPor: string }) {
      const [club] = await db.insert(schema.club).values(datos).returning();
      return club;
    },

    async actualizarClub(clubId: string, datos: { nombre?: string; descripcion?: string | null }) {
      const [club] = await db.update(schema.club).set(datos).where(eq(schema.club.id, clubId)).returning();
      return club ?? null;
    },

    async actualizarCodigoInvitacion(clubId: string, codigoInvitacion: string) {
      const [club] = await db
        .update(schema.club)
        .set({ codigoInvitacion })
        .where(eq(schema.club.id, clubId))
        .returning();
      return club ?? null;
    },

    async agregarMiembro(datos: { clubId: string; usuarioId: string; rolMiembro: string }) {
      const [creado] = await db.insert(schema.miembroClub).values(datos).onConflictDoNothing().returning();
      return creado ?? null;
    },

    async eliminarClub(clubId: string) {
      await db.delete(schema.club).where(eq(schema.club.id, clubId));
    },

    async obtenerMembresia(usuarioId: string, clubId: string) {
      const [membership] = await db
        .select({
          rolMiembro: schema.miembroClub.rolMiembro,
          unidoEn: schema.miembroClub.unidoEn,
        })
        .from(schema.miembroClub)
        .where(and(eq(schema.miembroClub.clubId, clubId), eq(schema.miembroClub.usuarioId, usuarioId)))
        .limit(1);
      return membership ?? null;
    },

    async obtenerMembresiaPorToken(tokenPublico: string, clubId: string) {
      const [membership] = await db
        .select()
        .from(schema.miembroClub)
        .where(and(eq(schema.miembroClub.clubId, clubId), eq(schema.miembroClub.tokenPublico, tokenPublico)))
        .limit(1);
      return membership ?? null;
    },

    async contarMiembrosClub(clubId: string) {
      const [countRow] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.miembroClub)
        .where(eq(schema.miembroClub.clubId, clubId));
      return Number(countRow?.total ?? 0);
    },

    async eliminarMiembro(usuarioId: string, clubId: string) {
      await db
        .delete(schema.miembroClub)
        .where(and(eq(schema.miembroClub.clubId, clubId), eq(schema.miembroClub.usuarioId, usuarioId)));
    },

    async actualizarRolMiembro(usuarioId: string, clubId: string, rolMiembro: string) {
      const [membership] = await db
        .update(schema.miembroClub)
        .set({ rolMiembro })
        .where(and(eq(schema.miembroClub.clubId, clubId), eq(schema.miembroClub.usuarioId, usuarioId)))
        .returning();
      return membership ?? null;
    },

    async quitarMiembroAdministracion(clubId: string, usuarioId: string) {
      return db.transaction(async (tx) => {
        const miembros = Array.from(await tx.execute(sql`
          select usuario_id, rol_miembro
          from miembro_club
          where club_id = ${clubId}
          for update
        `)) as Array<{ usuario_id: string; rol_miembro: string }>;
        const miembro = miembros.find(({ usuario_id }) => usuario_id === usuarioId);
        if (!miembro) return { resultado: "no_encontrado" } as const;

        const esResponsable = miembro.rol_miembro === "lider" || miembro.rol_miembro === "propietario";
        const responsables = miembros.filter(({ rol_miembro }) => rol_miembro === "lider" || rol_miembro === "propietario");
        if (esResponsable && responsables.length <= 1) {
          return { resultado: "RESPONSABLE_REQUERIDO" } as const;
        }

        await tx
          .delete(schema.miembroClub)
          .where(and(eq(schema.miembroClub.clubId, clubId), eq(schema.miembroClub.usuarioId, usuarioId)));
        return { resultado: "eliminado" } as const;
      });
    },

    async transferirResponsabilidadClub(clubId: string, usuarioId: string) {
      return db.transaction(async (tx) => {
        const miembros = Array.from(await tx.execute(sql`
          select usuario_id, rol_miembro
          from miembro_club
          where club_id = ${clubId}
          for update
        `)) as Array<{ usuario_id: string; rol_miembro: string }>;
        const nuevoResponsable = miembros.find(({ usuario_id }) => usuario_id === usuarioId);
        if (!nuevoResponsable) return { resultado: "no_encontrado" } as const;

        const responsableActual = miembros.find(({ rol_miembro }) => rol_miembro === "propietario")
          ?? miembros.find(({ rol_miembro }) => rol_miembro === "lider");
        if (!responsableActual) return { resultado: "RESPONSABLE_REQUERIDO" } as const;
        if (responsableActual.usuario_id === usuarioId) return { resultado: "ya_responsable" } as const;

        await tx
          .update(schema.miembroClub)
          .set({ rolMiembro: responsableActual.rol_miembro })
          .where(and(eq(schema.miembroClub.clubId, clubId), eq(schema.miembroClub.usuarioId, usuarioId)));
        await tx
          .update(schema.miembroClub)
          .set({ rolMiembro: "miembro" })
          .where(and(eq(schema.miembroClub.clubId, clubId), eq(schema.miembroClub.usuarioId, responsableActual.usuario_id)));
        return { resultado: "transferido" } as const;
      });
    },

    async desactivarClub(clubId: string) {
      const [club] = await db
        .update(schema.club)
        .set({ activo: false })
        .where(eq(schema.club.id, clubId))
        .returning();
      return club ?? null;
    },

    async reactivarClub(clubId: string) {
      const [club] = await db
        .update(schema.club)
        .set({ activo: true })
        .where(eq(schema.club.id, clubId))
        .returning();
      return club ?? null;
    },

    async obtenerRanking(clubId: string) {
      const resultado = await db.execute(sql`
        select
          cm.club_id,
          cm.usuario_id,
          cm.token_publico,
          cm.rol_miembro,
          coalesce(p.apodo, ua.nombre_visible, 'Semillero') as apodo,
          p.clave_avatar,
          p.url_avatar,
          coalesce(vx.xp_total, 0)::int as xp_total,
          coalesce(semanal.xp_semana, 0)::int as xp_semana,
          coalesce(semanal.actividades_semana, 0)::int as actividades_semana,
          rank() over (
            order by coalesce(semanal.xp_semana, 0) desc,
              coalesce(vx.xp_total, 0) desc,
              coalesce(p.apodo, 'Semillero') asc,
              cm.usuario_id asc
          )::int as numero_ranking
        from miembro_club cm
        join usuario_app ua on ua.id = cm.usuario_id
        left join perfil p on p.usuario_id = cm.usuario_id
        left join v_xp_usuario vx on vx.usuario_id = cm.usuario_id
        left join lateral (
          select
            coalesce(sum(ep.xp_otorgada), 0)::int as xp_semana,
            count(*) filter (where ep.tipo_evento = 'actividad_completada')::int as actividades_semana
          from evento_progreso ep
          where ep.usuario_id = cm.usuario_id
            and ep.ocurrido_en_cliente >= date_trunc('week', now())
        ) semanal on true
        where cm.club_id = ${clubId}
        order by numero_ranking asc, apodo asc
      `);
      return Array.from(resultado as Iterable<Record<string, unknown>>);
    },

    async listarRetos(clubId: string) {
      return db
        .select()
        .from(schema.retoClub)
        .where(eq(schema.retoClub.clubId, clubId))
        .orderBy(desc(schema.retoClub.fechaInicio));
    },

    async obtenerReto(clubId: string, retoId: string) {
      const [reto] = await db
        .select()
        .from(schema.retoClub)
        .where(and(eq(schema.retoClub.clubId, clubId), eq(schema.retoClub.id, retoId)))
        .limit(1);
      return reto ?? null;
    },

    async obtenerRecompensaReto(retoId: string, usuarioId: string) {
      const [recompensa] = await db
        .select()
        .from(schema.recompensaRetoClubUsuario)
        .where(and(
          eq(schema.recompensaRetoClubUsuario.retoId, retoId),
          eq(schema.recompensaRetoClubUsuario.usuarioId, usuarioId),
        ))
        .limit(1);
      return recompensa ?? null;
    },

    async reclamarRecompensaReto(retoId: string, usuarioId: string, xpOtorgada: number) {
      const resultado = await db.execute(sql`
        with reclamo as (
          insert into recompensa_reto_club_usuario (reto_id, usuario_id, xp_otorgada)
          values (${retoId}, ${usuarioId}, ${xpOtorgada})
          on conflict (reto_id, usuario_id) do nothing
          returning reto_id
        ), evento as (
          insert into evento_progreso (
            id_evento_cliente, usuario_id, tipo_evento, datos, xp_otorgada, ocurrido_en_cliente
          )
          select
            gen_random_uuid(),
            ${usuarioId},
            'recompensa_reclamada',
            jsonb_build_object('reto_club_id', ${retoId}),
            ${xpOtorgada},
            now()
          from reclamo
          returning id
        )
        select exists(select 1 from reclamo) as reclamado
      `);
      const [fila] = Array.from(resultado as Iterable<Record<string, unknown>>);
      return Boolean(fila?.reclamado);
    },

    async crearReto(datos: {
      clubId: string;
      nombre: string;
      descripcion: string | null;
      codigoMetrica: string;
      valorObjetivo: number;
      xpReto: number;
      fechaInicio: Date;
      fechaFin: Date;
      creadoPor: string;
    }) {
      const [data] = await db.insert(schema.retoClub).values(datos).returning();
      return data;
    },

    async cerrarReto(clubId: string, retoId: string) {
      const [reto] = await db
        .update(schema.retoClub)
        .set({ fechaFin: new Date() })
        .where(and(eq(schema.retoClub.clubId, clubId), eq(schema.retoClub.id, retoId)))
        .returning();
      return reto ?? null;
    },

    async calcularProgresoReto(clubId: string, usuarioId: string, reto: RetoParaProgreso) {
      const condicionComun = and(
        eq(schema.miembroClub.clubId, clubId),
        sql`${schema.eventoProgreso.ocurridoEnCliente} >= ${reto.fechaInicio}`,
        sql`${schema.eventoProgreso.ocurridoEnCliente} <= ${reto.fechaFin}`,
      );

      if (reto.codigoMetrica === "xp_grupal") {
        const [fila] = await db
          .select({
            total: sql<number>`coalesce(sum(${schema.eventoProgreso.xpOtorgada}), 0)`,
            aporteUsuario: sql<number>`coalesce(sum(${schema.eventoProgreso.xpOtorgada}) filter (where ${schema.eventoProgreso.usuarioId} = ${usuarioId}), 0)`,
          })
          .from(schema.eventoProgreso)
        .innerJoin(schema.miembroClub, eq(schema.miembroClub.usuarioId, schema.eventoProgreso.usuarioId))
          .where(and(condicionComun, eq(schema.miembroClub.clubId, clubId), sql`${schema.miembroClub.unidoEn} <= ${schema.eventoProgreso.ocurridoEnCliente}`));
        return { total: Number(fila?.total ?? 0), aporteUsuario: Number(fila?.aporteUsuario ?? 0) };
      }

      const tipoEvento = reto.codigoMetrica === "temas_completados" ? "tema_completado" : "actividad_completada";
      const [fila] = await db
        .select({
          total: sql<number>`count(*) filter (where ${schema.eventoProgreso.tipoEvento} = ${tipoEvento})`,
          aporteUsuario: sql<number>`count(*) filter (where ${schema.eventoProgreso.tipoEvento} = ${tipoEvento} and ${schema.eventoProgreso.usuarioId} = ${usuarioId})`,
        })
        .from(schema.eventoProgreso)
        .innerJoin(schema.miembroClub, eq(schema.miembroClub.usuarioId, schema.eventoProgreso.usuarioId))
        .where(and(condicionComun, eq(schema.miembroClub.clubId, clubId), sql`${schema.miembroClub.unidoEn} <= ${schema.eventoProgreso.ocurridoEnCliente}`));

      return { total: Number(fila?.total ?? 0), aporteUsuario: Number(fila?.aporteUsuario ?? 0) };
    },

    async contarReportesRecientes(usuarioId: string, desde: Date) {
      const [fila] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.reporteClub)
        .where(and(eq(schema.reporteClub.reportadoPor, usuarioId), gte(schema.reporteClub.creadoEn, desde)));
      return Number(fila?.total ?? 0);
    },

    async crearReporte(input: {
      clubId: string;
      reportadoPor: string;
      reportadoUsuarioId: string;
      categoria: string;
      detalle?: string;
    }) {
      return db.transaction(async (tx) => {
        const [reporte] = await tx.insert(schema.reporteClub).values(input).returning();
        if (!reporte) throw new Error("No se pudo crear el reporte");
        await tx.insert(schema.registroAuditoria).values({
          tipoEntidad: "reporte_club",
          entidadId: reporte.id,
          accion: "crear",
          datosDespues: { club_id: reporte.clubId, reportado_usuario_id: reporte.reportadoUsuarioId, categoria: reporte.categoria },
          actorUsuarioId: reporte.reportadoPor,
        });
        return reporte;
      });
    },

    async obtenerReporte(id: string) {
      const [reporte] = await db.select().from(schema.reporteClub).where(eq(schema.reporteClub.id, id)).limit(1);
      return reporte ?? null;
    },

    async listarReportes(estado?: string) {
      const filtro = estado ? eq(schema.reporteClub.estado, estado) : undefined;
      return db.select().from(schema.reporteClub).where(filtro).orderBy(desc(schema.reporteClub.creadoEn));
    },

    async resolverReporte(id: string, input: { estado: string; nota?: string; resueltoPor: string }) {
      return db.transaction(async (tx) => {
        const [antes] = await tx.select().from(schema.reporteClub).where(eq(schema.reporteClub.id, id)).limit(1);
        if (!antes) return null;
        const [reporte] = await tx
          .update(schema.reporteClub)
          .set({ estado: input.estado, notaResolucion: input.nota ?? null, resueltoPor: input.resueltoPor, actualizadoEn: new Date() })
          .where(eq(schema.reporteClub.id, id))
          .returning();
        if (reporte) {
          await tx.insert(schema.registroAuditoria).values({
            tipoEntidad: "reporte_club",
            entidadId: id,
            accion: "resolver",
            datosAntes: { estado: antes.estado },
            datosDespues: { estado: reporte.estado, nota: reporte.notaResolucion },
            actorUsuarioId: input.resueltoPor,
          });
        }
        return reporte ?? null;
      });
    },
  };
}
