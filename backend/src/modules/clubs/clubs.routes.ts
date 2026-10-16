import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { responderError, responderExito } from "../../shared/http/respuesta";
import { esResultadoConError } from "../../shared/errors/result-helpers";
import {
  createChallengeSchema,
  createClubSchema,
  joinClubSchema,
  transferLeadershipPublicSchema,
  updateClubSchema,
} from "./clubs.schemas";
import { crearClubsRepository } from "./clubs.repository";
import { crearCasosUsoClubs } from "./casos-uso/clubs";
import {
  serializarClub,
  serializarClubPublico,
  serializarMiembroClub,
  serializarRankingClub,
  serializarRetoClub,
} from "./clubs.mapper";
import { crearCasoModeracionClub } from "./casos-uso/moderation";
import { crearReporteClubSchema } from "./moderation.schemas";

export const clubsRoutes = new Hono<AppBindings>();

clubsRoutes.use("*", authMiddleware);

function crearCasos(c: Context<AppBindings>) {
  const cliente = c.get("drizzle");
  if (!cliente) throw new Error("Cliente Drizzle no disponible");
  return crearCasosUsoClubs(crearClubsRepository(cliente));
}

function crearModeracion(c: Context<AppBindings>) {
  const cliente = c.get("drizzle");
  if (!cliente) throw new Error("Cliente Drizzle no disponible");
  return crearCasoModeracionClub(crearClubsRepository(cliente));
}

clubsRoutes.get("/mios", async (c) => {
  const casos = crearCasos(c);
  const memberships = await casos.listarMios(c.get("user").id);
  const repositorio = crearClubsRepository(c.get("drizzle")!);
  const conteos = await repositorio.contarMiembrosPorClub();
  const miembrosPorClub = new Map(conteos.map((fila) => [fila.clubId, Number(fila.total)]));
  return responderExito(memberships.map((m) => ({
    ...serializarClub(m.club),
    member_count: miembrosPorClub.get(m.club.id) ?? 0,
    rol_miembro: m.rolMiembro,
    unido_en: m.unidoEn.toISOString(),
  })));
});

clubsRoutes.get("/", async (c) => {
  const casos = crearCasos(c);
  const repositorio = crearClubsRepository(c.get("drizzle")!);
  const clubs = await casos.listar(c.req.query("q") ?? undefined);
  const miembros = await repositorio.contarMiembrosPorClub();
  const miembrosPorClub = new Map(miembros.map((fila) => [fila.clubId, Number(fila.total)]));
  return responderExito(clubs.map((club) => ({
    ...serializarClubPublico(club),
    member_count: miembrosPorClub.get(club.id) ?? 0,
  })));
});

clubsRoutes.post("/", zValidator("json", createClubSchema), async (c) => {
  if (c.get("user").provider === "invitado") {
    return responderError("Vincula tu cuenta antes de crear un club", "CUENTA_REQUERIDA", 403);
  }
  const club = await crearCasos(c).crear(c.req.valid("json"), c.get("user").id);
  return responderExito(serializarClub(club), 201);
});

clubsRoutes.post("/unirse", zValidator("json", joinClubSchema), async (c) => {
  const resultado = await crearCasos(c).unirsePorCodigo(c.req.valid("json").codigo_acceso, c.get("user").id);
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito({
    unido: !("alreadyMember" in resultado),
    ya_era_miembro: "alreadyMember" in resultado,
    club: serializarClub(resultado.club),
  });
});

clubsRoutes.get("/:clubId", async (c) => {
  const casos = crearCasos(c);
  const clubId = c.req.param("clubId");
  const membresia = await casos.esMiembro(clubId, c.get("user").id);
  if (!membresia) return responderError("No perteneces a este club", "FORBIDDEN", 403);
  const club = await casos.obtener(clubId);
  if (!club) return responderError("Club no encontrado", "NOT_FOUND", 404);
  const [creador, members] = await Promise.all([
    casos.obtenerCreador(club.creadoPor),
    casos.listarMiembros(clubId),
  ]);
  return responderExito({
    ...serializarClub(club),
    created_by: creador ?? null,
    membership: {
      rol_miembro: membresia.rolMiembro,
      unido_en: membresia.unidoEn.toISOString(),
    },
    members: members.map((member) => serializarMiembroClub({ ...member, es_actual: String(member.usuario_id) === c.get("user").id })),
  });
});

clubsRoutes.patch("/:clubId", zValidator("json", updateClubSchema), async (c) => {
  const resultado = await crearCasos(c).actualizar(c.req.param("clubId"), c.req.valid("json"), c.get("user").id);
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(serializarClub(resultado));
});

clubsRoutes.post("/:clubId/regenerar-codigo", async (c) => {
  const resultado = await crearCasos(c).regenerarCodigo(c.req.param("clubId"), c.get("user").id);
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(serializarClub(resultado));
});

clubsRoutes.post("/:clubId/unirse", zValidator("json", joinClubSchema), async (c) => {
  const resultado = await crearCasos(c).unirse(c.req.param("clubId"), c.req.valid("json").codigo_acceso, c.get("user").id);
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito({
    unido: !("alreadyMember" in resultado),
    ya_era_miembro: "alreadyMember" in resultado,
    club: serializarClub(resultado.club),
  });
});

clubsRoutes.post("/:clubId/salir", async (c) => {
  const resultado = await crearCasos(c).salir(c.req.param("clubId"), c.get("user").id);
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(resultado);
});

clubsRoutes.post("/:clubId/reportes", zValidator("json", crearReporteClubSchema), async (c) => {
  const resultado = await crearModeracion(c).reportar(c.req.param("clubId"), c.get("user").id, c.req.valid("json"));
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito({ id: (resultado as { id: string }).id }, 201);
});

clubsRoutes.delete("/:clubId", async (c) => {
  const resultado = await crearCasos(c).archivar(c.req.param("clubId"), c.get("user").id);
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(resultado);
});

clubsRoutes.delete("/:clubId/miembros/:miembroToken", async (c) => {
  const repositorio = crearClubsRepository(c.get("drizzle")!);
  const membership = await repositorio.obtenerMembresiaPorToken(c.req.param("miembroToken"), c.req.param("clubId"));
  if (!membership) return responderError("Miembro no encontrado", "NOT_FOUND", 404);
  const resultado = await crearCasos(c).quitarMiembro(c.req.param("clubId"), membership.usuarioId, c.get("user").id);
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(resultado);
});

clubsRoutes.post("/:clubId/transferir-liderazgo", zValidator("json", transferLeadershipPublicSchema), async (c) => {
  const repositorio = crearClubsRepository(c.get("drizzle")!);
  const membership = await repositorio.obtenerMembresiaPorToken(c.req.valid("json").miembro_token, c.req.param("clubId"));
  if (!membership) return responderError("Miembro no encontrado", "NOT_FOUND", 404);
  const resultado = await crearCasos(c).transferirLiderazgo(
    c.req.param("clubId"),
    membership.usuarioId,
    c.get("user").id,
  );
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(resultado);
});

clubsRoutes.get("/:clubId/ranking", async (c) => {
  const casos = crearCasos(c);
  const clubId = c.req.param("clubId");
  if (!(await casos.esMiembro(clubId, c.get("user").id))) {
    return responderError("No perteneces a este club", "FORBIDDEN", 403);
  }
  const club = await casos.obtener(clubId);
  if (!club?.activo) return responderError("Club inactivo", "FORBIDDEN", 403);
  const ranking = await casos.ranking(clubId);
  return responderExito(Array.from(ranking as Iterable<Record<string, unknown>>).map((member) => serializarRankingClub({ ...member, es_actual: String(member.usuario_id) === c.get("user").id })));
});

clubsRoutes.get("/:clubId/retos", async (c) => {
  const casos = crearCasos(c);
  const clubId = c.req.param("clubId");
  if (!(await casos.esMiembro(clubId, c.get("user").id))) {
    return responderError("No perteneces a este club", "FORBIDDEN", 403);
  }
  const data = await casos.listarRetos(clubId, c.get("user").id);
  if (esResultadoConError(data)) return responderError(data.error.mensaje, data.error.codigo, data.error.estado);
  return responderExito(data.map(serializarRetoClub));
});

clubsRoutes.post("/:clubId/retos", zValidator("json", createChallengeSchema), async (c) => {
  const resultado = await crearCasos(c).crearReto(c.req.param("clubId"), c.req.valid("json"), c.get("user").id);
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(serializarRetoClub(resultado), 201);
});

clubsRoutes.post("/:clubId/retos/:retoId/reclamar", async (c) => {
  const resultado = await crearCasos(c).reclamarReto(
    c.req.param("clubId"),
    c.req.param("retoId"),
    c.get("user").id,
  );
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(resultado);
});
