import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { schema, type DbClient } from "../../db/client";
import { BadRequestError, NotFoundError } from "../../shared/errors/http-error";
import type {
  BulkUserActionInput,
  CreateChildUserInput,
  InviteUserInput,
  UpdateUserInput
} from "./admin.schemas";

type AdminUsersDb = {
  supabase: SupabaseClient<Database>;
  drizzle?: DbClient;
};

type ListUsersParams = {
  q?: string;
  rol?: string;
  estado?: "activo" | "pendiente" | "bloqueado";
  grupoEdadId?: string;
  clubId?: string;
  limit: number;
  offset: number;
};

function intersectarIds(base: string[] | null, nuevos: string[]) {
  if (base === null) return [...new Set(nuevos)];
  const permitidos = new Set(nuevos);
  return base.filter((id) => permitidos.has(id));
}

function tokenHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashSha256(valor: string) {
  const bytes = new TextEncoder().encode(valor);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return tokenHex(new Uint8Array(hash));
}

function estadoUsuario(usuario: {
  activo: boolean;
  proveedor: string;
  ultimoLoginEn: Date | null;
}) {
  if (!usuario.activo) return "bloqueado" as const;
  if (usuario.proveedor === "correo" && !usuario.ultimoLoginEn) return "pendiente" as const;
  return "activo" as const;
}

export function crearAdminUsersRepository({ supabase, drizzle }: AdminUsersDb) {
  function requerirDrizzle() {
    if (!drizzle) {
      throw new Error("Cliente Drizzle no disponible: configura HYPERDRIVE o SUPABASE_DATABASE_URL");
    }
    return drizzle;
  }

  async function registrarAuditoria(input: {
    actorId: string;
    accion: string;
    entidadId?: string | null;
    antes?: unknown;
    despues?: unknown;
  }) {
    const { error } = await supabase.from("registro_auditoria").insert({
      actor_usuario_id: input.actorId,
      accion: input.accion,
      tipo_entidad: "usuario",
      entidad_id: input.entidadId ?? null,
      datos_antes: (input.antes ?? null) as Database["public"]["Tables"]["registro_auditoria"]["Insert"]["datos_antes"],
      datos_despues: (input.despues ?? null) as Database["public"]["Tables"]["registro_auditoria"]["Insert"]["datos_despues"]
    });
    if (error) console.warn("No se pudo registrar auditoría de usuario", error.message);
  }

  async function cargarCatalogos() {
    const cliente = requerirDrizzle();
    const [gruposEdad, clubes, tutores] = await Promise.all([
      cliente.select({
        id: schema.grupoEdad.id,
        codigo: schema.grupoEdad.codigo,
        nombre: schema.grupoEdad.nombre,
        edadMinima: schema.grupoEdad.edadMinima,
        edadMaxima: schema.grupoEdad.edadMaxima
      }).from(schema.grupoEdad).orderBy(schema.grupoEdad.orden),
      cliente.select({
        id: schema.club.id,
        nombre: schema.club.nombre,
        activo: schema.club.activo
      }).from(schema.club).where(eq(schema.club.activo, true)).orderBy(schema.club.nombre),
      cliente.select({
        id: schema.usuarioApp.id,
        nombreVisible: schema.usuarioApp.nombreVisible,
        correo: schema.usuarioApp.correo
      }).from(schema.usuarioApp)
        .where(and(eq(schema.usuarioApp.rol, "padre"), eq(schema.usuarioApp.activo, true)))
        .orderBy(schema.usuarioApp.nombreVisible)
    ]);

    return {
      grupos_edad: gruposEdad.map((grupo) => ({
        id: grupo.id,
        codigo: grupo.codigo,
        nombre: grupo.nombre,
        edad_minima: grupo.edadMinima,
        edad_maxima: grupo.edadMaxima
      })),
      clubes,
      tutores: tutores.map((tutor) => ({
        id: tutor.id,
        nombre_visible: tutor.nombreVisible,
        correo: tutor.correo
      }))
    };
  }

  async function enriquecerUsuarios(
    filas: Array<{
      usuario: typeof schema.usuarioApp.$inferSelect;
      perfil: typeof schema.perfil.$inferSelect | null;
      grupoEdad: typeof schema.grupoEdad.$inferSelect | null;
    }>
  ) {
    const cliente = requerirDrizzle();
    const ids = filas.map((fila) => fila.usuario.id);
    if (ids.length === 0) return [];

    const [membresias, vinculos, progreso] = await Promise.all([
      cliente.select({
        usuarioId: schema.miembroClub.usuarioId,
        rolMiembro: schema.miembroClub.rolMiembro,
        unidoEn: schema.miembroClub.unidoEn,
        clubId: schema.club.id,
        clubNombre: schema.club.nombre
      }).from(schema.miembroClub)
        .innerJoin(schema.club, eq(schema.miembroClub.clubId, schema.club.id))
        .where(inArray(schema.miembroClub.usuarioId, ids)),
      cliente.select({
        menorId: schema.vinculoTutorMenor.menorId,
        tutorId: schema.vinculoTutorMenor.tutorId,
        relacion: schema.vinculoTutorMenor.relacion,
        estado: schema.vinculoTutorMenor.estado
      }).from(schema.vinculoTutorMenor)
        .where(or(
          inArray(schema.vinculoTutorMenor.menorId, ids),
          inArray(schema.vinculoTutorMenor.tutorId, ids)
        )),
      cliente.select({
        usuarioId: schema.eventoProgreso.usuarioId,
        xp: sql<number>`coalesce(sum(${schema.eventoProgreso.xpOtorgada}), 0)`,
        eventos: sql<number>`count(*)`
      }).from(schema.eventoProgreso)
        .where(inArray(schema.eventoProgreso.usuarioId, ids))
        .groupBy(schema.eventoProgreso.usuarioId)
    ]);

    const membresiasPorUsuario = new Map<string, Array<{
      id: string;
      nombre: string;
      rol_miembro: string;
      unido_en: string;
    }>>();
    for (const membresia of membresias) {
      const lista = membresiasPorUsuario.get(membresia.usuarioId) ?? [];
      lista.push({
        id: membresia.clubId,
        nombre: membresia.clubNombre,
        rol_miembro: membresia.rolMiembro,
        unido_en: membresia.unidoEn.toISOString()
      });
      membresiasPorUsuario.set(membresia.usuarioId, lista);
    }

    const vinculosPorUsuario = new Map<string, number>();
    for (const vinculo of vinculos) {
      vinculosPorUsuario.set(vinculo.menorId, (vinculosPorUsuario.get(vinculo.menorId) ?? 0) + 1);
      vinculosPorUsuario.set(vinculo.tutorId, (vinculosPorUsuario.get(vinculo.tutorId) ?? 0) + 1);
    }

    const progresoPorUsuario = new Map(
      progreso.map((item) => [
        item.usuarioId,
        { xp: Number(item.xp ?? 0), eventos: Number(item.eventos ?? 0) }
      ])
    );

    return filas.map((fila) => {
      const resumenProgreso = progresoPorUsuario.get(fila.usuario.id) ?? { xp: 0, eventos: 0 };
      return {
        id: fila.usuario.id,
        rol: fila.usuario.rol,
        proveedor: fila.usuario.proveedor,
        nombre_visible: fila.usuario.nombreVisible,
        correo: fila.usuario.correo,
        activo: fila.usuario.activo,
        estado: estadoUsuario(fila.usuario),
        creado_en: fila.usuario.creadoEn.toISOString(),
        actualizado_en: fila.usuario.actualizadoEn.toISOString(),
        ultimo_login_en: fila.usuario.ultimoLoginEn?.toISOString() ?? null,
        perfil: fila.perfil
          ? {
              id: fila.perfil.id,
              apodo: fila.perfil.apodo,
              avatar_url: fila.perfil.urlAvatar,
              clave_avatar: fila.perfil.claveAvatar,
              grupo_edad_id: fila.perfil.grupoEdadId,
              prefiere_audio: fila.perfil.prefiereAudio,
              tamano_texto_preferido: fila.perfil.tamanoTextoPreferido
            }
          : null,
        grupo_edad: fila.grupoEdad
          ? {
              id: fila.grupoEdad.id,
              codigo: fila.grupoEdad.codigo,
              nombre: fila.grupoEdad.nombre,
              edad_minima: fila.grupoEdad.edadMinima,
              edad_maxima: fila.grupoEdad.edadMaxima
            }
          : null,
        clubes: membresiasPorUsuario.get(fila.usuario.id) ?? [],
        vinculos_familiares: vinculosPorUsuario.get(fila.usuario.id) ?? 0,
        progreso: {
          xp_total: resumenProgreso.xp,
          eventos: resumenProgreso.eventos
        }
      };
    });
  }

  async function obtenerBase(usuarioId: string) {
    const cliente = requerirDrizzle();
    const [fila] = await cliente.select({
      usuario: schema.usuarioApp,
      perfil: schema.perfil,
      grupoEdad: schema.grupoEdad
    }).from(schema.usuarioApp)
      .leftJoin(schema.perfil, eq(schema.usuarioApp.id, schema.perfil.usuarioId))
      .leftJoin(schema.grupoEdad, eq(schema.perfil.grupoEdadId, schema.grupoEdad.id))
      .where(eq(schema.usuarioApp.id, usuarioId))
      .limit(1);

    if (!fila) throw new NotFoundError("Usuario no encontrado");
    return fila;
  }

  return {
    async listarUsuarios(params: ListUsersParams) {
      const cliente = requerirDrizzle();
      let idsPermitidos: string[] | null = null;

      if (params.grupoEdadId) {
        const perfiles = await cliente.select({ usuarioId: schema.perfil.usuarioId })
          .from(schema.perfil)
          .where(eq(schema.perfil.grupoEdadId, params.grupoEdadId));
        idsPermitidos = intersectarIds(idsPermitidos, perfiles.map((perfil) => perfil.usuarioId));
      }

      if (params.clubId) {
        const membresias = await cliente.select({ usuarioId: schema.miembroClub.usuarioId })
          .from(schema.miembroClub)
          .where(eq(schema.miembroClub.clubId, params.clubId));
        idsPermitidos = intersectarIds(idsPermitidos, membresias.map((membresia) => membresia.usuarioId));
      }

      const condiciones = [];
      if (params.q) {
        condiciones.push(or(
          ilike(schema.usuarioApp.nombreVisible, `%${params.q}%`),
          ilike(schema.usuarioApp.correo, `%${params.q}%`)
        )!);
      }
      if (params.rol) {
        condiciones.push(eq(
          schema.usuarioApp.rol,
          params.rol as Database["public"]["Enums"]["rol_usuario"]
        ));
      }
      if (params.estado === "activo") {
        condiciones.push(and(
          eq(schema.usuarioApp.activo, true),
          sql`not (${schema.usuarioApp.proveedor} = 'correo' and ${schema.usuarioApp.ultimoLoginEn} is null)`
        )!);
      } else if (params.estado === "bloqueado") {
        condiciones.push(eq(schema.usuarioApp.activo, false));
      } else if (params.estado === "pendiente") {
        condiciones.push(and(
          eq(schema.usuarioApp.activo, true),
          eq(schema.usuarioApp.proveedor, "correo"),
          sql`${schema.usuarioApp.ultimoLoginEn} is null`
        )!);
      }
      if (idsPermitidos) {
        if (idsPermitidos.length === 0) {
          return {
            usuarios: [],
            total: 0,
            resumen: { total: 0, activos: 0, pendientes: 0, bloqueados: 0, administradores: 0, padres: 0 },
            catalogos: await cargarCatalogos()
          };
        }
        condiciones.push(inArray(schema.usuarioApp.id, idsPermitidos));
      }

      const whereClause = condiciones.length ? and(...condiciones) : undefined;
      const filas = await cliente.select({
        usuario: schema.usuarioApp,
        perfil: schema.perfil,
        grupoEdad: schema.grupoEdad
      }).from(schema.usuarioApp)
        .leftJoin(schema.perfil, eq(schema.usuarioApp.id, schema.perfil.usuarioId))
        .leftJoin(schema.grupoEdad, eq(schema.perfil.grupoEdadId, schema.grupoEdad.id))
        .where(whereClause)
        .orderBy(desc(schema.usuarioApp.creadoEn))
        .limit(params.limit)
        .offset(params.offset);

      const [conteo] = await cliente.select({
        total: sql<number>`count(*)`
      }).from(schema.usuarioApp).where(whereClause);

      const [resumen] = await cliente.select({
        total: sql<number>`count(*)`,
        activos: sql<number>`count(*) filter (where ${schema.usuarioApp.activo} = true and not (${schema.usuarioApp.proveedor} = 'correo' and ${schema.usuarioApp.ultimoLoginEn} is null))`,
        pendientes: sql<number>`count(*) filter (where ${schema.usuarioApp.activo} = true and ${schema.usuarioApp.proveedor} = 'correo' and ${schema.usuarioApp.ultimoLoginEn} is null)`,
        bloqueados: sql<number>`count(*) filter (where ${schema.usuarioApp.activo} = false)`,
        administradores: sql<number>`count(*) filter (where ${schema.usuarioApp.rol} = 'administrador')`,
        padres: sql<number>`count(*) filter (where ${schema.usuarioApp.rol} = 'padre')`
      }).from(schema.usuarioApp);

      return {
        usuarios: await enriquecerUsuarios(filas),
        total: Number(conteo?.total ?? 0),
        resumen: {
          total: Number(resumen?.total ?? 0),
          activos: Number(resumen?.activos ?? 0),
          pendientes: Number(resumen?.pendientes ?? 0),
          bloqueados: Number(resumen?.bloqueados ?? 0),
          administradores: Number(resumen?.administradores ?? 0),
          padres: Number(resumen?.padres ?? 0)
        },
        catalogos: await cargarCatalogos()
      };
    },

    async obtenerUsuario(usuarioId: string) {
      const cliente = requerirDrizzle();
      const base = await obtenerBase(usuarioId);
      const [usuario] = await enriquecerUsuarios([base]);

      const [membresias, vinculos, temas, actividades, eventos, auditoria] = await Promise.all([
        cliente.select({
          id: schema.club.id,
          nombre: schema.club.nombre,
          rolMiembro: schema.miembroClub.rolMiembro,
          unidoEn: schema.miembroClub.unidoEn
        }).from(schema.miembroClub)
          .innerJoin(schema.club, eq(schema.miembroClub.clubId, schema.club.id))
          .where(eq(schema.miembroClub.usuarioId, usuarioId)),
        cliente.select().from(schema.vinculoTutorMenor)
          .where(or(
            eq(schema.vinculoTutorMenor.menorId, usuarioId),
            eq(schema.vinculoTutorMenor.tutorId, usuarioId)
          )),
        cliente.select({
          total: sql<number>`count(*)`,
          completados: sql<number>`count(*) filter (where ${schema.progresoTemaUsuario.estado} = 'completado')`
        }).from(schema.progresoTemaUsuario)
          .where(eq(schema.progresoTemaUsuario.usuarioId, usuarioId)),
        cliente.select({
          total: sql<number>`count(*)`,
          completadas: sql<number>`count(*) filter (where ${schema.progresoActividadUsuario.completado} = true)`,
          intentos: sql<number>`coalesce(sum(${schema.progresoActividadUsuario.intentos}), 0)`
        }).from(schema.progresoActividadUsuario)
          .where(eq(schema.progresoActividadUsuario.usuarioId, usuarioId)),
        cliente.select({
          id: schema.eventoProgreso.id,
          tipo: schema.eventoProgreso.tipoEvento,
          temaId: schema.eventoProgreso.temaId,
          actividadId: schema.eventoProgreso.actividadId,
          puntaje: schema.eventoProgreso.puntaje,
          correcta: schema.eventoProgreso.correcta,
          xp: schema.eventoProgreso.xpOtorgada,
          ocurridoEn: schema.eventoProgreso.ocurridoEnCliente
        }).from(schema.eventoProgreso)
          .where(eq(schema.eventoProgreso.usuarioId, usuarioId))
          .orderBy(desc(schema.eventoProgreso.ocurridoEnCliente))
          .limit(20),
        cliente.select({
          id: schema.registroAuditoria.id,
          accion: schema.registroAuditoria.accion,
          datosAntes: schema.registroAuditoria.datosAntes,
          datosDespues: schema.registroAuditoria.datosDespues,
          actorUsuarioId: schema.registroAuditoria.actorUsuarioId,
          creadoEn: schema.registroAuditoria.creadoEn
        }).from(schema.registroAuditoria)
          .where(eq(schema.registroAuditoria.entidadId, usuarioId))
          .orderBy(desc(schema.registroAuditoria.creadoEn))
          .limit(20)
      ]);

      const idsRelacionados = [...new Set(vinculos.flatMap((vinculo) => [vinculo.menorId, vinculo.tutorId]).filter((id) => id !== usuarioId))];
      const relacionados = idsRelacionados.length
        ? await cliente.select({
            id: schema.usuarioApp.id,
            nombreVisible: schema.usuarioApp.nombreVisible,
            correo: schema.usuarioApp.correo
          }).from(schema.usuarioApp).where(inArray(schema.usuarioApp.id, idsRelacionados))
        : [];
      const relacionadosPorId = new Map(relacionados.map((item) => [item.id, item]));

      return {
        ...usuario,
        clubes: membresias.map((membresia) => ({
          id: membresia.id,
          nombre: membresia.nombre,
          rol_miembro: membresia.rolMiembro,
          unido_en: membresia.unidoEn.toISOString()
        })),
        vinculos: vinculos.map((vinculo) => {
          const esMenor = vinculo.menorId === usuarioId;
          const contraparteId = esMenor ? vinculo.tutorId : vinculo.menorId;
          const contraparte = relacionadosPorId.get(contraparteId);
          return {
            id: vinculo.id,
            tipo: esMenor ? "tutor" : "menor",
            relacion: vinculo.relacion,
            estado: vinculo.estado,
            aceptado_en: vinculo.aceptadoEn?.toISOString() ?? null,
            usuario: {
              id: contraparteId,
              nombre_visible: contraparte?.nombreVisible ?? "Usuario",
              correo: contraparte?.correo ?? null
            }
          };
        }),
        estadisticas: {
          temas_total: Number(temas[0]?.total ?? 0),
          temas_completados: Number(temas[0]?.completados ?? 0),
          actividades_total: Number(actividades[0]?.total ?? 0),
          actividades_completadas: Number(actividades[0]?.completadas ?? 0),
          intentos: Number(actividades[0]?.intentos ?? 0),
          xp_total: usuario?.progreso.xp_total ?? 0
        },
        actividad_reciente: eventos.map((evento) => ({
          id: evento.id,
          tipo: evento.tipo,
          tema_id: evento.temaId,
          actividad_id: evento.actividadId,
          puntaje: evento.puntaje,
          correcta: evento.correcta,
          xp_otorgada: evento.xp,
          ocurrido_en: evento.ocurridoEn.toISOString()
        })),
        auditoria: auditoria.map((evento) => ({
          id: evento.id,
          accion: evento.accion,
          datos_antes: evento.datosAntes,
          datos_despues: evento.datosDespues,
          actor_usuario_id: evento.actorUsuarioId,
          creado_en: evento.creadoEn.toISOString()
        }))
      };
    },

    async actualizarUsuario(usuarioId: string, body: UpdateUserInput, actorId: string) {
      if (usuarioId === actorId && (body.activo === false || (body.rol && body.rol !== "administrador"))) {
        throw new BadRequestError("No puedes desactivar ni retirar tu propio rol de administrador");
      }

      const cliente = requerirDrizzle();
      const existente = await obtenerBase(usuarioId);
      const cambiosUsuario: Partial<typeof schema.usuarioApp.$inferInsert> = {
        actualizadoEn: new Date()
      };
      if (body.rol !== undefined) cambiosUsuario.rol = body.rol;
      if (body.nombre_visible !== undefined) cambiosUsuario.nombreVisible = body.nombre_visible;
      if (body.activo !== undefined) cambiosUsuario.activo = body.activo;

      await cliente.update(schema.usuarioApp)
        .set(cambiosUsuario)
        .where(eq(schema.usuarioApp.id, usuarioId));

      if (
        body.apodo !== undefined ||
        body.grupo_edad_id !== undefined ||
        body.avatar_url !== undefined ||
        body.prefiere_audio !== undefined ||
        body.tamano_texto_preferido !== undefined
      ) {
        const perfilActual = existente.perfil;
        const datosPerfil = {
          apodo: body.apodo ?? perfilActual?.apodo ?? existente.usuario.nombreVisible,
          grupoEdadId: body.grupo_edad_id === undefined ? perfilActual?.grupoEdadId ?? null : body.grupo_edad_id,
          urlAvatar: body.avatar_url === undefined ? perfilActual?.urlAvatar ?? null : body.avatar_url,
          prefiereAudio: body.prefiere_audio ?? perfilActual?.prefiereAudio ?? false,
          tamanoTextoPreferido: body.tamano_texto_preferido ?? perfilActual?.tamanoTextoPreferido ?? "mediano",
          actualizadoEn: new Date()
        };

        if (perfilActual) {
          await cliente.update(schema.perfil)
            .set(datosPerfil)
            .where(eq(schema.perfil.usuarioId, usuarioId));
        } else {
          await cliente.insert(schema.perfil).values({
            usuarioId,
            ...datosPerfil
          });
        }
      }

      if (body.club_ids !== undefined) {
        await cliente.delete(schema.miembroClub).where(eq(schema.miembroClub.usuarioId, usuarioId));
        if (body.club_ids.length) {
          await cliente.insert(schema.miembroClub).values(
            body.club_ids.map((clubId) => ({
              usuarioId,
              clubId,
              rolMiembro: "miembro"
            }))
          );
        }
      }

      await registrarAuditoria({
        actorId,
        accion: "actualizar",
        entidadId: usuarioId,
        antes: {
          rol: existente.usuario.rol,
          nombre_visible: existente.usuario.nombreVisible,
          activo: existente.usuario.activo
        },
        despues: body
      });

      return this.obtenerUsuario(usuarioId);
    },

    async invitarUsuario(body: InviteUserInput, actorId: string) {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(body.correo, {
        data: {
          nombre_visible: body.nombre_visible,
          rol: body.rol
        },
        ...(body.redirect_to ? { redirectTo: body.redirect_to } : {})
      });
      if (error || !data.user) {
        throw new BadRequestError(error?.message ?? "No se pudo enviar la invitación");
      }

      const authUser = data.user;
      const { error: userError } = await supabase.from("usuario_app").upsert({
        id: authUser.id,
        correo: body.correo,
        id_externo: authUser.id,
        nombre_visible: body.nombre_visible,
        proveedor: "correo",
        rol: body.rol,
        activo: true,
        actualizado_en: new Date().toISOString()
      }, { onConflict: "id" });
      if (userError) throw userError;

      if (body.apodo || body.grupo_edad_id) {
        const { data: perfilActual } = await supabase.from("perfil")
          .select("id")
          .eq("usuario_id", authUser.id)
          .maybeSingle();

        const perfil = {
          apodo: body.apodo ?? body.nombre_visible,
          grupo_edad_id: body.grupo_edad_id ?? null,
          actualizado_en: new Date().toISOString()
        };
        const respuesta = perfilActual
          ? await supabase.from("perfil").update(perfil).eq("usuario_id", authUser.id)
          : await supabase.from("perfil").insert({ usuario_id: authUser.id, ...perfil });
        if (respuesta.error) throw respuesta.error;
      }

      if (body.club_id) {
        const { error: clubError } = await supabase.from("miembro_club").insert({
          usuario_id: authUser.id,
          club_id: body.club_id,
          rol_miembro: "miembro"
        });
        if (clubError) throw clubError;
      }

      await registrarAuditoria({
        actorId,
        accion: "invitar",
        entidadId: authUser.id,
        despues: { correo: body.correo, rol: body.rol }
      });

      return this.obtenerUsuario(authUser.id);
    },

    async crearMenor(body: CreateChildUserInput, actorId: string) {
      const usuarioId = crypto.randomUUID();
      const token = tokenHex(crypto.getRandomValues(new Uint8Array(32)));
      const tokenHash = await hashSha256(token);

      const { error: userError } = await supabase.from("usuario_app").insert({
        id: usuarioId,
        correo: null,
        id_externo: null,
        token_invitado_hash: tokenHash,
        nombre_visible: body.nombre_visible,
        proveedor: "invitado",
        rol: "usuario",
        activo: true
      });
      if (userError) throw userError;

      try {
        const { error: profileError } = await supabase.from("perfil").insert({
          usuario_id: usuarioId,
          apodo: body.apodo,
          grupo_edad_id: body.grupo_edad_id,
          prefiere_audio: body.prefiere_audio ?? false,
          tamano_texto_preferido: body.tamano_texto_preferido ?? "mediano"
        });
        if (profileError) throw profileError;

        if (body.tutor_id) {
          const { error: linkError } = await supabase.from("vinculo_tutor_menor").insert({
            menor_id: usuarioId,
            tutor_id: body.tutor_id,
            relacion: body.relacion ?? "representante",
            estado: "aceptado",
            aceptado_en: new Date().toISOString()
          });
          if (linkError) throw linkError;
        }

        if (body.club_id) {
          const { error: clubError } = await supabase.from("miembro_club").insert({
            usuario_id: usuarioId,
            club_id: body.club_id,
            rol_miembro: "miembro"
          });
          if (clubError) throw clubError;
        }
      } catch (error) {
        await supabase.from("usuario_app").delete().eq("id", usuarioId);
        throw error;
      }

      await registrarAuditoria({
        actorId,
        accion: "crear_menor",
        entidadId: usuarioId,
        despues: {
          nombre_visible: body.nombre_visible,
          grupo_edad_id: body.grupo_edad_id,
          tutor_id: body.tutor_id ?? null
        }
      });

      return {
        usuario: await this.obtenerUsuario(usuarioId),
        credencial_temporal: {
          usuario_id: usuarioId,
          token
        }
      };
    },

    async accionMasiva(body: BulkUserActionInput, actorId: string) {
      if (body.usuario_ids.includes(actorId) && body.accion === "desactivar") {
        throw new BadRequestError("No puedes desactivar tu propia cuenta");
      }

      const cliente = requerirDrizzle();
      const activo = body.accion === "activar";
      await cliente.update(schema.usuarioApp)
        .set({ activo, actualizadoEn: new Date() })
        .where(inArray(schema.usuarioApp.id, body.usuario_ids));

      await registrarAuditoria({
        actorId,
        accion: `${body.accion}_masivo`,
        despues: { usuario_ids: body.usuario_ids }
      });

      return { actualizados: body.usuario_ids.length };
    },

    async eliminarUsuario(usuarioId: string, actorId: string) {
      if (usuarioId === actorId) {
        throw new BadRequestError("No puedes desactivar tu propia cuenta");
      }
      const cliente = requerirDrizzle();
      const base = await obtenerBase(usuarioId);
      await cliente.update(schema.usuarioApp)
        .set({ activo: false, actualizadoEn: new Date() })
        .where(eq(schema.usuarioApp.id, usuarioId));
      await registrarAuditoria({
        actorId,
        accion: "desactivar",
        entidadId: usuarioId,
        antes: { activo: base.usuario.activo },
        despues: { activo: false }
      });
      return { desactivado: true };
    }
  };
}

export type AdminUsersRepository = ReturnType<typeof crearAdminUsersRepository>;
