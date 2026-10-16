import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { registroAuditoria } from "../../db/schema";
import { esResultadoConError } from "../../shared/errors/result-helpers";
import { responderError, responderExito } from "../../shared/http/respuesta";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { requireRole } from "../../shared/middleware/role.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { createChallengeSchema, transferLeadershipSchema } from "./clubs.schemas";
import { crearClubsRepository } from "./clubs.repository";
import { crearCasosUsoAdminClubs } from "./casos-uso/admin-clubs";
import {
  actualizarClubAdminSchema,
  adminClubListSchema,
  agregarMiembroAdminSchema,
  cerrarRetoAdminSchema,
  clubParamsSchema,
  crearClubAdminSchema,
  miembroClubParamsSchema,
  retoClubParamsSchema,
} from "./admin-clubs.schemas";

type CasosUsoAdminClubs = ReturnType<typeof crearCasosUsoAdminClubs>;

type RegistroAuditoria = {
  actor_usuario_id: string;
  accion: string;
  tipo_entidad: "club";
  entidad_id: string;
  datos_antes: Record<string, unknown> | null;
  datos_despues: Record<string, unknown> | null;
};

type DependenciasAdminClubs = {
  crearCasos?: (contexto: Context<AppBindings>) => CasosUsoAdminClubs;
  registrarAuditoria?: (registro: RegistroAuditoria, contexto: Context<AppBindings>) => Promise<void>;
  ejecutarEnTransaccion?: <T>(
    contexto: Context<AppBindings>,
    operacion: (transaccion: ContextoTransaccion) => Promise<T>,
  ) => Promise<T>;
};

type RepositorioClubs = ReturnType<typeof crearClubsRepository>;

type ContextoTransaccion = {
  casos: CasosUsoAdminClubs;
  repositorio: RepositorioClubs;
  registrarAuditoria: (registro: RegistroAuditoria) => Promise<void>;
};

function crearCasosPredeterminados(contexto: Context<AppBindings>) {
  const cliente = contexto.get("drizzle");
  if (!cliente) throw new Error("Cliente Drizzle no disponible");
  return crearCasosUsoAdminClubs(crearClubsRepository(cliente));
}

function estadoClub(club: Awaited<ReturnType<RepositorioClubs["obtenerClub"]>>) {
  return club ? { id: club.id, nombre: club.nombre, descripcion: club.descripcion, activo: club.activo } : null;
}

function estadoMiembro(miembro: Awaited<ReturnType<RepositorioClubs["obtenerMembresia"]>>, usuarioId: string, clubId: string) {
  return miembro ? { usuario_id: usuarioId, club_id: clubId, rol_miembro: miembro.rolMiembro, unido_en: miembro.unidoEn.toISOString() } : null;
}

function estadoReto(reto: Awaited<ReturnType<RepositorioClubs["obtenerReto"]>>) {
  return reto ? {
    id: reto.id,
    club_id: reto.clubId,
    nombre: reto.nombre,
    fecha_inicio: reto.fechaInicio.toISOString(),
    fecha_fin: reto.fechaFin.toISOString(),
  } : null;
}

export function crearModuloAdminClubs(dependencias: DependenciasAdminClubs = {}) {
  const adminClubsRoutes = new Hono<AppBindings>();
  const crearCasos = dependencias.crearCasos ?? crearCasosPredeterminados;
  const ejecutarEnTransaccion = dependencias.ejecutarEnTransaccion ?? (async <T>(contexto: Context<AppBindings>, operacion: (transaccion: ContextoTransaccion) => Promise<T>) => {
    const cliente = contexto.get("drizzle");
    if (!cliente) throw new Error("Cliente Drizzle no disponible");
    return cliente.transaction(async (tx) => {
      const repositorio = crearClubsRepository(tx as unknown as Parameters<typeof crearClubsRepository>[0]);
      const casos = crearCasosUsoAdminClubs(repositorio);
      const registrarAuditoria = dependencias.registrarAuditoria
        ? (registro: RegistroAuditoria) => dependencias.registrarAuditoria!(registro, contexto)
        : (registro: RegistroAuditoria) => tx.insert(registroAuditoria).values({
          actorUsuarioId: registro.actor_usuario_id,
          accion: registro.accion,
          tipoEntidad: registro.tipo_entidad,
          entidadId: registro.entidad_id,
          datosAntes: registro.datos_antes,
          datosDespues: registro.datos_despues,
          direccionIp: contexto.req.header("cf-connecting-ip") ?? null,
          agenteUsuario: contexto.req.header("user-agent") ?? null,
        }).then(() => undefined);
      return operacion({ casos, repositorio, registrarAuditoria });
    });
  });

  adminClubsRoutes.use("*", authMiddleware);
  adminClubsRoutes.use("*", requireRole("administrador"));

  async function ejecutarYAuditar(
    contexto: Context<AppBindings>,
    accion: string,
    clubId: string,
    obtenerAntes: (repositorio: RepositorioClubs) => Promise<Record<string, unknown> | null>,
    ejecutar: (casos: CasosUsoAdminClubs) => Promise<unknown>,
    obtenerDespues: (repositorio: RepositorioClubs, resultado: unknown) => Promise<Record<string, unknown> | null>,
    estado = 200,
  ) {
    return ejecutarEnTransaccion(contexto, async ({ casos, repositorio, registrarAuditoria }) => {
      const antes = await obtenerAntes(repositorio);
      const resultado = await ejecutar(casos);
      if (esResultadoConError(resultado)) {
        return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
      }
      const despues = await obtenerDespues(repositorio, resultado);
      await registrarAuditoria({
        actor_usuario_id: contexto.get("user").id,
        accion,
        tipo_entidad: "club",
        entidad_id: clubId,
        datos_antes: antes,
        datos_despues: despues,
      });
      return responderExito(resultado, estado);
    });
  }

  adminClubsRoutes.get("/", zValidator("query", adminClubListSchema), async (c) => {
    const { estado, ...filtros } = c.req.valid("query");
    const activo = estado === "todos" ? undefined : estado === "activo";
    return responderExito(await crearCasos(c).listar({ ...filtros, activo }));
  });

  adminClubsRoutes.post("/", zValidator("json", crearClubAdminSchema), async (c) => ejecutarEnTransaccion(c, async ({ casos, registrarAuditoria }) => {
    const body = c.req.valid("json");
    const resultado = await casos.crear({
      nombre: body.nombre,
      descripcion: body.descripcion,
      liderUsuarioId: body.lider_usuario_id,
    }, c.get("user").id);
    if (esResultadoConError(resultado)) {
      return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
    }
    await registrarAuditoria({
      actor_usuario_id: c.get("user").id,
      accion: "club.creado",
      tipo_entidad: "club",
      entidad_id: resultado.id,
      datos_antes: null,
      datos_despues: {
        id: resultado.id,
        nombre: resultado.nombre,
        descripcion: resultado.descripcion,
        activo: resultado.activo,
        lider: resultado.lider,
      },
    });
    return responderExito(resultado, 201);
  }));

  adminClubsRoutes.get("/:clubId", zValidator("param", clubParamsSchema), async (c) => {
    const resultado = await crearCasos(c).obtenerDetalle(c.req.param("clubId"));
    if (esResultadoConError(resultado)) {
      return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
    }
    return responderExito(resultado);
  });

  adminClubsRoutes.patch("/:clubId", zValidator("param", clubParamsSchema), zValidator("json", actualizarClubAdminSchema), async (c) => ejecutarYAuditar(
    c,
    "club.actualizado",
    c.req.valid("param").clubId,
    async (repositorio) => estadoClub(await repositorio.obtenerClub(c.req.valid("param").clubId)),
    (casos) => casos.actualizar(c.req.valid("param").clubId, c.req.valid("json")),
    async (repositorio) => estadoClub(await repositorio.obtenerClub(c.req.valid("param").clubId)),
  ));

  adminClubsRoutes.post("/:clubId/miembros", zValidator("param", clubParamsSchema), zValidator("json", agregarMiembroAdminSchema), async (c) => ejecutarYAuditar(
    c,
    "club.miembro_agregado",
    c.req.valid("param").clubId,
    async () => null,
    (casos) => casos.agregarMiembro(c.req.valid("param").clubId, c.req.valid("json").usuario_id),
    async (repositorio) => estadoMiembro(await repositorio.obtenerMembresia(c.req.valid("json").usuario_id, c.req.valid("param").clubId), c.req.valid("json").usuario_id, c.req.valid("param").clubId),
    201,
  ));

  adminClubsRoutes.post("/:clubId/regenerar-codigo", zValidator("param", clubParamsSchema), async (c) => ejecutarYAuditar(
    c,
    "club.codigo_regenerado",
    c.req.valid("param").clubId,
    async (repositorio) => estadoClub(await repositorio.obtenerClub(c.req.valid("param").clubId)),
    (casos) => casos.regenerarCodigo(c.req.valid("param").clubId),
    async (repositorio) => estadoClub(await repositorio.obtenerClub(c.req.valid("param").clubId)),
  ));

  adminClubsRoutes.post("/:clubId/archivar", zValidator("param", clubParamsSchema), async (c) => ejecutarYAuditar(
    c,
    "club.archivado",
    c.req.valid("param").clubId,
    async (repositorio) => estadoClub(await repositorio.obtenerClub(c.req.valid("param").clubId)),
    (casos) => casos.archivar(c.req.valid("param").clubId, c.get("user").id),
    async (repositorio) => estadoClub(await repositorio.obtenerClub(c.req.valid("param").clubId)),
  ));

  adminClubsRoutes.post("/:clubId/reactivar", zValidator("param", clubParamsSchema), async (c) => ejecutarYAuditar(
    c,
    "club.reactivado",
    c.req.valid("param").clubId,
    async (repositorio) => estadoClub(await repositorio.obtenerClub(c.req.valid("param").clubId)),
    (casos) => casos.reactivar(c.req.valid("param").clubId, c.get("user").id),
    async (repositorio) => estadoClub(await repositorio.obtenerClub(c.req.valid("param").clubId)),
  ));

  adminClubsRoutes.delete("/:clubId/miembros/:usuarioId", zValidator("param", miembroClubParamsSchema), async (c) => ejecutarYAuditar(
    c,
    "club.miembro_expulsado",
    c.req.valid("param").clubId,
    async (repositorio) => estadoMiembro(await repositorio.obtenerMembresia(c.req.valid("param").usuarioId, c.req.valid("param").clubId), c.req.valid("param").usuarioId, c.req.valid("param").clubId),
    (casos) => casos.quitarMiembro(c.req.valid("param").clubId, c.req.valid("param").usuarioId, c.get("user").id),
    async (repositorio) => estadoMiembro(await repositorio.obtenerMembresia(c.req.valid("param").usuarioId, c.req.valid("param").clubId), c.req.valid("param").usuarioId, c.req.valid("param").clubId),
  ));

  adminClubsRoutes.post("/:clubId/transferir-liderazgo", zValidator("param", clubParamsSchema), zValidator("json", transferLeadershipSchema), async (c) => ejecutarYAuditar(
    c,
    "club.liderazgo_transferido",
    c.req.valid("param").clubId,
    async (repositorio) => estadoMiembro(await repositorio.obtenerMembresia(c.req.valid("json").usuario_id, c.req.valid("param").clubId), c.req.valid("json").usuario_id, c.req.valid("param").clubId),
    (casos) => casos.transferirLiderazgo(c.req.valid("param").clubId, c.req.valid("json").usuario_id, c.get("user").id),
    async (repositorio) => estadoMiembro(await repositorio.obtenerMembresia(c.req.valid("json").usuario_id, c.req.valid("param").clubId), c.req.valid("json").usuario_id, c.req.valid("param").clubId),
  ));

  adminClubsRoutes.post("/:clubId/retos", zValidator("param", clubParamsSchema), zValidator("json", createChallengeSchema), async (c) => {
    const reto = c.req.valid("json");
    return ejecutarYAuditar(
      c,
      "club.reto_creado",
      c.req.valid("param").clubId,
      async () => null,
      (casos) => casos.crearReto(c.req.valid("param").clubId, {
        nombre: reto.nombre,
        descripcion: reto.descripcion ?? null,
        codigoMetrica: reto.codigo_metrica,
        valorObjetivo: reto.valor_objetivo,
        xpReto: reto.xp_reto,
        fechaInicio: new Date(reto.fecha_inicio),
        fechaFin: new Date(reto.fecha_fin),
      }, c.get("user").id),
      async (repositorio, resultado) => estadoReto(await repositorio.obtenerReto(c.req.valid("param").clubId, (resultado as { id: string }).id)),
      201,
    );
  });

  adminClubsRoutes.post("/:clubId/retos/:retoId/cerrar", zValidator("param", retoClubParamsSchema), zValidator("json", cerrarRetoAdminSchema), async (c) => ejecutarYAuditar(
    c,
    "club.reto_cerrado",
    c.req.valid("param").clubId,
    async (repositorio) => estadoReto(await repositorio.obtenerReto(c.req.valid("param").clubId, c.req.valid("param").retoId)),
    (casos) => casos.cerrarReto(c.req.valid("param").clubId, c.req.valid("param").retoId, c.get("user").id),
    async (repositorio) => estadoReto(await repositorio.obtenerReto(c.req.valid("param").clubId, c.req.valid("param").retoId)),
  ));

  return adminClubsRoutes;
}

export const adminClubsRoutes = crearModuloAdminClubs();
