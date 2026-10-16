import type { ClubsRepository } from "../clubs.repository";

function generarCodigoInvitacion() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => caracteres[byte % caracteres.length]).join("");
}

type CrearRetoEntrada = {
  nombre: string;
  descripcion?: string;
  codigo_metrica: string;
  valor_objetivo: number;
  xp_reto: number;
  fecha_inicio: string;
  fecha_fin: string;
};

function puedeAdministrar(rolMiembro?: string | null) {
  return rolMiembro === "lider" || rolMiembro === "propietario";
}

export function crearCasosUsoClubs(repositorio: ClubsRepository) {
  async function generarCodigoUnico() {
    let codigoInvitacion = generarCodigoInvitacion();
    let intentos = 0;
    while (intentos < 5) {
      const existente = await repositorio.buscarCodigoInvitacion(codigoInvitacion);
      if (!existente) return codigoInvitacion;
      codigoInvitacion = generarCodigoInvitacion();
      intentos++;
    }
    throw new Error("No se pudo generar un código de invitación único");
  }

  async function agregarUsuarioAlClub(clubId: string, codigoAcceso: string, userId: string) {
    const club = await repositorio.obtenerClub(clubId);
    if (!club) return { error: { mensaje: "Club no encontrado", codigo: "NOT_FOUND", estado: 404 } } as const;
    if (!club.activo) return { error: { mensaje: "Club inactivo", codigo: "FORBIDDEN", estado: 403 } } as const;
    if (club.codigoInvitacion.toUpperCase() !== codigoAcceso.toUpperCase()) {
      return { error: { mensaje: "Código de invitación incorrecto", codigo: "CODIGO_INCORRECTO", estado: 403 } } as const;
    }

    const existente = await repositorio.obtenerMembresia(userId, clubId);
    if (existente) return { alreadyMember: true, club } as const;

    await repositorio.agregarMiembro({ clubId, usuarioId: userId, rolMiembro: "miembro" });
    return { joined: true, club } as const;
  }

  return {
    listarMios: (usuarioId: string) => repositorio.listarMisClubes(usuarioId),
    listar: (search?: string) => repositorio.listarClubes(search),
    esMiembro: (clubId: string, usuarioId: string) => repositorio.obtenerMembresia(usuarioId, clubId),
    obtener: (clubId: string) => repositorio.obtenerClub(clubId),
    obtenerCreador: (usuarioId: string) => repositorio.obtenerCreadorClub(usuarioId),
    listarMiembros: (clubId: string) => repositorio.listarMiembrosClub(clubId),

    crear: async (body: { nombre: string; descripcion?: string }, userId: string) => {
      const codigoInvitacion = await generarCodigoUnico();
      const club = await repositorio.crearClub({
        nombre: body.nombre,
        descripcion: body.descripcion ?? null,
        codigoInvitacion,
        creadoPor: userId,
      });
      const membresia = await repositorio.agregarMiembro({ clubId: club.id, usuarioId: userId, rolMiembro: "lider" });
      if (!membresia) {
        await repositorio.eliminarClub(club.id);
        throw new Error("No se pudo registrar al líder del club");
      }
      return club;
    },

    actualizar: async (clubId: string, body: { nombre?: string; descripcion?: string }, userId: string) => {
      const membership = await repositorio.obtenerMembresia(userId, clubId);
      if (!puedeAdministrar(membership?.rolMiembro)) {
        return { error: { mensaje: "Solo el líder puede editar el club", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      const club = await repositorio.actualizarClub(clubId, {
        ...(body.nombre !== undefined ? { nombre: body.nombre } : {}),
        ...(body.descripcion !== undefined ? { descripcion: body.descripcion || null } : {}),
      });
      if (!club) return { error: { mensaje: "Club no encontrado", codigo: "NOT_FOUND", estado: 404 } } as const;
      return club;
    },

    regenerarCodigo: async (clubId: string, userId: string) => {
      const membership = await repositorio.obtenerMembresia(userId, clubId);
      if (!puedeAdministrar(membership?.rolMiembro)) {
        return { error: { mensaje: "Solo el líder puede cambiar el código", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      const codigo = await generarCodigoUnico();
      const club = await repositorio.actualizarCodigoInvitacion(clubId, codigo);
      if (!club) return { error: { mensaje: "Club no encontrado", codigo: "NOT_FOUND", estado: 404 } } as const;
      return club;
    },

    unirse: agregarUsuarioAlClub,
    unirsePorCodigo: async (codigoAcceso: string, userId: string) => {
      const club = await repositorio.obtenerClubPorCodigo(codigoAcceso);
      if (!club) return { error: { mensaje: "Código de invitación inválido", codigo: "CODIGO_INCORRECTO", estado: 404 } } as const;
      return agregarUsuarioAlClub(club.id, codigoAcceso, userId);
    },

    salir: async (clubId: string, userId: string) => {
      const membership = await repositorio.obtenerMembresia(userId, clubId);
      if (!membership) return { error: { mensaje: "No eres miembro de este club", codigo: "NOT_FOUND", estado: 404 } } as const;
      if (puedeAdministrar(membership.rolMiembro)) {
        const total = await repositorio.contarMiembrosClub(clubId);
        if (total > 1) {
          return { error: { mensaje: "Transfiere el liderazgo antes de salir", codigo: "TRANSFERIR_LIDERAZGO", estado: 400 } } as const;
        }
      }
      await repositorio.eliminarMiembro(userId, clubId);
      const total = await repositorio.contarMiembrosClub(clubId);
      if (total === 0) await repositorio.desactivarClub(clubId);
      return { left: true } as const;
    },

    archivar: async (clubId: string, userId: string) => {
      const membership = await repositorio.obtenerMembresia(userId, clubId);
      if (!puedeAdministrar(membership?.rolMiembro)) {
        return { error: { mensaje: "Solo el líder puede archivar el club", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      const total = await repositorio.contarMiembrosClub(clubId);
      if (total > 1) {
        return { error: { mensaje: "Retira a los miembros o transfiere el liderazgo antes de archivar", codigo: "CLUB_CON_MIEMBROS", estado: 400 } } as const;
      }
      await repositorio.desactivarClub(clubId);
      return { archived: true } as const;
    },

    quitarMiembro: async (clubId: string, targetUserId: string, actorUserId: string) => {
      const actor = await repositorio.obtenerMembresia(actorUserId, clubId);
      if (!puedeAdministrar(actor?.rolMiembro)) {
        return { error: { mensaje: "Solo el líder puede administrar miembros", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      if (targetUserId === actorUserId) {
        return { error: { mensaje: "Usa la opción Salir del club", codigo: "INVALID_OPERATION", estado: 400 } } as const;
      }
      const target = await repositorio.obtenerMembresia(targetUserId, clubId);
      if (!target) return { error: { mensaje: "Miembro no encontrado", codigo: "NOT_FOUND", estado: 404 } } as const;
      if (puedeAdministrar(target.rolMiembro)) {
        return { error: { mensaje: "No puedes retirar al líder del club", codigo: "INVALID_OPERATION", estado: 400 } } as const;
      }
      await repositorio.eliminarMiembro(targetUserId, clubId);
      return { removed: true } as const;
    },

    transferirLiderazgo: async (clubId: string, targetUserId: string, actorUserId: string) => {
      const actor = await repositorio.obtenerMembresia(actorUserId, clubId);
      if (!puedeAdministrar(actor?.rolMiembro)) {
        return { error: { mensaje: "Solo el líder puede transferir el liderazgo", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      if (targetUserId === actorUserId) {
        return { error: { mensaje: "Ya eres el líder del club", codigo: "INVALID_OPERATION", estado: 400 } } as const;
      }
      const target = await repositorio.obtenerMembresia(targetUserId, clubId);
      if (!target) return { error: { mensaje: "Miembro no encontrado", codigo: "NOT_FOUND", estado: 404 } } as const;
      await repositorio.actualizarRolMiembro(targetUserId, clubId, "lider");
      await repositorio.actualizarRolMiembro(actorUserId, clubId, "miembro");
      return { transferred: true, usuario_id: targetUserId } as const;
    },

    ranking: (clubId: string) => repositorio.obtenerRanking(clubId),

    listarRetos: async (clubId: string, userId: string) => {
      const club = await repositorio.obtenerClub(clubId);
      if (!club || !club.activo) {
        return { error: { mensaje: "Club inactivo", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      const retos = await repositorio.listarRetos(clubId);
      return Promise.all(retos.map(async (reto) => {
        const [progreso, recompensa] = await Promise.all([
          repositorio.calcularProgresoReto(clubId, userId, reto),
          repositorio.obtenerRecompensaReto(reto.id, userId),
        ]);
        const porcentaje = Math.min(100, Math.round((progreso.total / reto.valorObjetivo) * 100));
        return {
          ...reto,
          progresoActual: progreso.total,
          miAporte: progreso.aporteUsuario,
          porcentaje,
          completado: progreso.total >= reto.valorObjetivo,
          recompensaReclamada: Boolean(recompensa),
        };
      }));
    },

    reclamarReto: async (clubId: string, retoId: string, userId: string) => {
      const club = await repositorio.obtenerClub(clubId);
      if (!club || !club.activo) {
        return { error: { mensaje: "Club inactivo", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      const membership = await repositorio.obtenerMembresia(userId, clubId);
      if (!membership) {
        return { error: { mensaje: "No perteneces a este club", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      const reto = await repositorio.obtenerReto(clubId, retoId);
      if (!reto) return { error: { mensaje: "Reto no encontrado", codigo: "NOT_FOUND", estado: 404 } } as const;
      const progreso = await repositorio.calcularProgresoReto(clubId, userId, reto);
      if (progreso.total < reto.valorObjetivo) {
        return { error: { mensaje: "El reto todavía no se ha completado", codigo: "RETO_INCOMPLETO", estado: 400 } } as const;
      }
      const reclamado = await repositorio.reclamarRecompensaReto(reto.id, userId, reto.xpReto);
      return {
        reclamado,
        ya_reclamada: !reclamado,
        xp_otorgada: reclamado ? reto.xpReto : 0,
      } as const;
    },

    crearReto: async (clubId: string, body: CrearRetoEntrada, userId: string) => {
      const club = await repositorio.obtenerClub(clubId);
      if (!club || !club.activo) {
        return { error: { mensaje: "Club inactivo", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      const membership = await repositorio.obtenerMembresia(userId, clubId);
      if (!puedeAdministrar(membership?.rolMiembro)) {
        return { error: { mensaje: "Solo el líder puede crear retos", codigo: "FORBIDDEN", estado: 403 } } as const;
      }
      return repositorio.crearReto({
        clubId,
        nombre: body.nombre,
        descripcion: body.descripcion ?? null,
        codigoMetrica: body.codigo_metrica,
        valorObjetivo: body.valor_objetivo,
        xpReto: body.xp_reto,
        fechaInicio: new Date(body.fecha_inicio),
        fechaFin: new Date(body.fecha_fin),
        creadoPor: userId,
      });
    },
  };
}
