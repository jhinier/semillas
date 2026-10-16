import type { ClubsRepository } from "../clubs.repository";

type CrearRetoAdminEntrada = Omit<Parameters<ClubsRepository["crearReto"]>[0], "clubId" | "creadoPor">;

type CrearClubAdminEntrada = {
  nombre: string;
  descripcion?: string;
  liderUsuarioId: string;
};

type ActualizarClubAdminEntrada = {
  nombre?: string;
  descripcion?: string | null;
};

function error(mensaje: string, codigo: string, estado: number) {
  return { error: { mensaje, codigo, estado } } as const;
}

function fechaIso(fecha: Date | string | null | undefined) {
  if (!fecha) return null;
  return typeof fecha === "string" ? fecha : fecha.toISOString();
}

function generarCodigoInvitacion() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => caracteres[byte % caracteres.length]).join("");
}

export function crearCasosUsoAdminClubs(repositorio: ClubsRepository) {
  async function generarCodigoUnico() {
    let codigoInvitacion = generarCodigoInvitacion();
    for (let intento = 0; intento < 5; intento += 1) {
      const existente = await repositorio.buscarCodigoInvitacion(codigoInvitacion);
      if (!existente) return codigoInvitacion;
      codigoInvitacion = generarCodigoInvitacion();
    }
    throw new Error("No se pudo generar un código de invitación único");
  }

  return {
    listar: async (filtros: { q?: string; activo?: boolean; orden?: "recientes" | "nombre" | "miembros"; limit: number; offset: number }) => {
      const resultado = await repositorio.listarClubesAdministracion(filtros);
      return {
        clubes: resultado.clubes.map((club) => ({
          id: club.id,
          nombre: club.nombre,
          descripcion: club.descripcion,
          activo: club.activo,
          creado_en: club.creadoEn.toISOString(),
          miembros: Number(club.miembros),
          retos_abiertos: Number(club.retosAbiertos),
          lider: club.liderUsuarioId && club.liderApodo
            ? { usuario_id: club.liderUsuarioId, apodo: club.liderApodo }
            : null,
        })),
        meta: { total: resultado.total, limit: filtros.limit, offset: filtros.offset },
      };
    },

    obtenerDetalle: async (clubId: string) => {
      const club = await repositorio.obtenerClub(clubId);
      if (!club) return error("Club no encontrado", "NOT_FOUND", 404);
      const [miembros, retos] = await Promise.all([
        repositorio.listarMiembrosClubAdministracion(clubId),
        repositorio.listarRetos(clubId),
      ]);
      return {
        club: {
          id: club.id,
          nombre: club.nombre,
          descripcion: club.descripcion,
          codigo_invitacion: club.codigoInvitacion,
          activo: club.activo,
          creado_en: club.creadoEn.toISOString(),
        },
        miembros: miembros.map((miembro) => ({
          usuario_id: String(miembro.usuario_id),
          apodo: String(miembro.apodo),
          rol_miembro: typeof miembro.rol_miembro === "string" ? miembro.rol_miembro : null,
          unido_en: fechaIso(miembro.unido_en as Date | string | null | undefined),
          url_avatar: miembro.url_avatar ? String(miembro.url_avatar) : null,
          xp_total: Number(miembro.xp_total ?? 0),
          xp_semana: Number(miembro.xp_semana ?? 0),
          actividades_semana: Number(miembro.actividades_semana ?? 0),
        })),
        retos: retos.map((reto) => ({
          id: reto.id,
          nombre: reto.nombre,
          descripcion: reto.descripcion,
          codigo_metrica: reto.codigoMetrica,
          valor_objetivo: reto.valorObjetivo,
          xp_reto: reto.xpReto,
          fecha_inicio: reto.fechaInicio.toISOString(),
          fecha_fin: reto.fechaFin.toISOString(),
        })),
      };
    },

    crear: async (entrada: CrearClubAdminEntrada, administradorId: string) => {
      const lider = await repositorio.obtenerCreadorClub(entrada.liderUsuarioId);
      if (!lider) return error("El usuario seleccionado no existe", "USER_NOT_FOUND", 404);

      const codigoInvitacion = await generarCodigoUnico();
      const club = await repositorio.crearClub({
        nombre: entrada.nombre,
        descripcion: entrada.descripcion?.trim() || null,
        codigoInvitacion,
        creadoPor: administradorId,
      });
      const membresia = await repositorio.agregarMiembro({
        clubId: club.id,
        usuarioId: entrada.liderUsuarioId,
        rolMiembro: "lider",
      });
      if (!membresia) {
        await repositorio.eliminarClub(club.id);
        return error("No se pudo asignar el liderazgo del club", "LEADER_ASSIGNMENT_FAILED", 409);
      }

      return {
        id: club.id,
        nombre: club.nombre,
        descripcion: club.descripcion,
        codigo_invitacion: club.codigoInvitacion,
        activo: club.activo,
        creado_en: club.creadoEn.toISOString(),
        lider: { usuario_id: lider.id, apodo: lider.nombre_visible ?? "Usuario Semillas" },
      };
    },

    actualizar: async (clubId: string, entrada: ActualizarClubAdminEntrada) => {
      const existente = await repositorio.obtenerClub(clubId);
      if (!existente) return error("Club no encontrado", "NOT_FOUND", 404);
      const club = await repositorio.actualizarClub(clubId, {
        ...(entrada.nombre !== undefined ? { nombre: entrada.nombre } : {}),
        ...(entrada.descripcion !== undefined ? { descripcion: entrada.descripcion?.trim() || null } : {}),
      });
      if (!club) return error("Club no encontrado", "NOT_FOUND", 404);
      return {
        id: club.id,
        nombre: club.nombre,
        descripcion: club.descripcion,
        codigo_invitacion: club.codigoInvitacion,
        activo: club.activo,
        creado_en: club.creadoEn.toISOString(),
      };
    },

    agregarMiembro: async (clubId: string, usuarioId: string) => {
      const club = await repositorio.obtenerClub(clubId);
      if (!club) return error("Club no encontrado", "NOT_FOUND", 404);
      if (!club.activo) return error("Reactiva el club antes de agregar miembros", "CLUB_ARCHIVED", 400);
      const usuario = await repositorio.obtenerCreadorClub(usuarioId);
      if (!usuario) return error("Usuario no encontrado", "USER_NOT_FOUND", 404);
      const existente = await repositorio.obtenerMembresia(usuarioId, clubId);
      if (existente) return error("El usuario ya pertenece al club", "ALREADY_MEMBER", 409);
      const membresia = await repositorio.agregarMiembro({ clubId, usuarioId, rolMiembro: "miembro" });
      if (!membresia) return error("No se pudo agregar el miembro", "MEMBER_CREATE_FAILED", 409);
      return { added: true, usuario_id: usuarioId } as const;
    },

    regenerarCodigo: async (clubId: string) => {
      const existente = await repositorio.obtenerClub(clubId);
      if (!existente) return error("Club no encontrado", "NOT_FOUND", 404);
      const codigoInvitacion = await generarCodigoUnico();
      const club = await repositorio.actualizarCodigoInvitacion(clubId, codigoInvitacion);
      if (!club) return error("Club no encontrado", "NOT_FOUND", 404);
      return { codigo_invitacion: club.codigoInvitacion } as const;
    },

    archivar: async (clubId: string, _administradorId: string) => {
      const club = await repositorio.desactivarClub(clubId);
      return club ? { archived: true } : error("Club no encontrado", "NOT_FOUND", 404);
    },

    reactivar: async (clubId: string, _administradorId: string) => {
      const club = await repositorio.reactivarClub(clubId);
      return club ? { reactivated: true } : error("Club no encontrado", "NOT_FOUND", 404);
    },

    quitarMiembro: async (clubId: string, usuarioId: string, _administradorId: string) => {
      const resultado = await repositorio.quitarMiembroAdministracion(clubId, usuarioId);
      if (resultado.resultado === "no_encontrado") return error("Miembro no encontrado", "NOT_FOUND", 404);
      if (resultado.resultado === "RESPONSABLE_REQUERIDO") {
        return error("Transfiere la responsabilidad antes de retirar al ultimo responsable", "RESPONSABLE_REQUERIDO", 400);
      }
      return { removed: true } as const;
    },

    transferirLiderazgo: async (clubId: string, usuarioId: string, _administradorId: string) => {
      const resultado = await repositorio.transferirResponsabilidadClub(clubId, usuarioId);
      if (resultado.resultado === "no_encontrado") return error("Miembro no encontrado", "NOT_FOUND", 404);
      if (resultado.resultado === "RESPONSABLE_REQUERIDO") {
        return error("El club no tiene responsable", "RESPONSABLE_REQUERIDO", 400);
      }
      if (resultado.resultado === "ya_responsable") {
        return error("La persona ya es responsable del club", "INVALID_OPERATION", 400);
      }
      return { transferred: true, usuario_id: usuarioId } as const;
    },

    crearReto: (clubId: string, reto: CrearRetoAdminEntrada, administradorId: string) =>
      repositorio.crearReto({ ...reto, clubId, creadoPor: administradorId }),

    cerrarReto: async (clubId: string, retoId: string, _administradorId: string) => {
      const reto = await repositorio.cerrarReto(clubId, retoId);
      return reto ? { closed: true } : error("Reto no encontrado", "NOT_FOUND", 404);
    },
  };
}
