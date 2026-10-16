import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { registroAuditoria } from "../../db/schema";
import { esResultadoConError } from "../../shared/errors/result-helpers";
import { responderError, responderExito } from "../../shared/http/respuesta";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { requireRole } from "../../shared/middleware/role.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { crearAdminLogrosRepository } from "./admin-logros.repository";
import {
  actualizarLogroAdminSchema,
  adminLogrosListSchema,
  crearLogroAdminSchema,
  logroParamsSchema,
} from "./admin-logros.schemas";
import { crearCasosUsoAdminLogros } from "./casos-uso/admin-logros";

type CasosUsoAdminLogros = ReturnType<typeof crearCasosUsoAdminLogros>;

type RegistroAuditoria = {
  actor_usuario_id: string;
  accion: string;
  tipo_entidad: "logro";
  entidad_id: string;
  datos_antes: Record<string, unknown> | null;
  datos_despues: Record<string, unknown> | null;
};

type RepositorioAdminLogros = ReturnType<typeof crearAdminLogrosRepository>;

type DependenciasAdminLogros = {
  crearCasos?: (contexto: Context<AppBindings>) => CasosUsoAdminLogros;
  ejecutarEnTransaccion?: <T>(
    contexto: Context<AppBindings>,
    operacion: (transaccion: ContextoTransaccion) => Promise<T>,
  ) => Promise<T>;
  registrarAuditoria?: (registro: RegistroAuditoria, contexto: Context<AppBindings>) => Promise<void>;
};

type ContextoTransaccion = {
  casos: CasosUsoAdminLogros;
  repositorio: RepositorioAdminLogros;
  registrarAuditoria: (registro: RegistroAuditoria) => Promise<void>;
};

function crearCasosPredeterminados(contexto: Context<AppBindings>) {
  const cliente = contexto.get("drizzle");
  if (!cliente) throw new Error("Cliente Drizzle no disponible");
  return crearCasosUsoAdminLogros(crearAdminLogrosRepository(cliente));
}

function estadoLogro(
  fila: Awaited<ReturnType<RepositorioAdminLogros["obtener"]>>,
) {
  if (!fila) return null;
  return {
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    bono_xp: fila.bonoXp,
    codigo_criterio: fila.codigoCriterio,
    valor_criterio: fila.valorCriterio,
    activo: fila.activo,
  };
}

export function crearModuloAdminLogros(dependencias: DependenciasAdminLogros = {}) {
  const adminLogrosRoutes = new Hono<AppBindings>();
  const crearCasos = dependencias.crearCasos ?? crearCasosPredeterminados;
  const ejecutarEnTransaccion =
    dependencias.ejecutarEnTransaccion ??
    (async <T>(contexto: Context<AppBindings>, operacion: (transaccion: ContextoTransaccion) => Promise<T>) => {
      const cliente = contexto.get("drizzle");
      if (!cliente) throw new Error("Cliente Drizzle no disponible");
      return cliente.transaction(async (tx) => {
        const repositorio = crearAdminLogrosRepository(tx as unknown as Parameters<typeof crearAdminLogrosRepository>[0]);
        const casos = crearCasosUsoAdminLogros(repositorio);
        const registrarAuditoria = dependencias.registrarAuditoria
          ? (registro: RegistroAuditoria) => dependencias.registrarAuditoria!(registro, contexto)
          : (registro: RegistroAuditoria) =>
              tx.insert(registroAuditoria).values({
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

  adminLogrosRoutes.use("*", authMiddleware);
  adminLogrosRoutes.use("*", requireRole("administrador"));

  adminLogrosRoutes.get("/", zValidator("query", adminLogrosListSchema), async (c) => {
    return responderExito(await crearCasos(c).listar(c.req.valid("query")));
  });

  adminLogrosRoutes.get("/catalogo", async (c) => {
    return responderExito(await crearCasos(c).listarCatalogoOrdenado());
  });

  adminLogrosRoutes.get("/:logroId", zValidator("param", logroParamsSchema), async (c) => {
    const resultado = await crearCasos(c).obtenerDetalle(c.req.valid("param").logroId);
    if (esResultadoConError(resultado)) {
      return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
    }
    return responderExito(resultado);
  });

  async function ejecutarYAuditar(
    contexto: Context<AppBindings>,
    accion: string,
    logroId: string,
    obtenerAntes: (repositorio: RepositorioAdminLogros) => Promise<Record<string, unknown> | null>,
    ejecutar: (casos: CasosUsoAdminLogros) => Promise<unknown>,
    obtenerDespues: (repositorio: RepositorioAdminLogros, resultado: unknown) => Promise<Record<string, unknown> | null>,
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
        tipo_entidad: "logro",
        entidad_id: logroId,
        datos_antes: antes,
        datos_despues: despues,
      });
      return responderExito(resultado, estado);
    });
  }

  adminLogrosRoutes.post("/", zValidator("json", crearLogroAdminSchema), async (c) =>
    ejecutarEnTransaccion(c, async ({ casos, registrarAuditoria }) => {
      const body = c.req.valid("json");
      const resultado = await casos.crear(body, c.get("user").id);
      if (esResultadoConError(resultado)) {
        return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
      }
      await registrarAuditoria({
        actor_usuario_id: c.get("user").id,
        accion: "logro.creado",
        tipo_entidad: "logro",
        entidad_id: resultado.id,
        datos_antes: null,
        datos_despues: {
          id: resultado.id,
          codigo: resultado.codigo,
          nombre: resultado.nombre,
          bono_xp: resultado.bono_xp,
          codigo_criterio: resultado.codigo_criterio,
          valor_criterio: resultado.valor_criterio,
          activo: resultado.activo,
        },
      });
      return responderExito(resultado, 201);
    }),
  );

  adminLogrosRoutes.patch(
    "/:logroId",
    zValidator("param", logroParamsSchema),
    zValidator("json", actualizarLogroAdminSchema),
    async (c) =>
      ejecutarYAuditar(
        c,
        "logro.actualizado",
        c.req.valid("param").logroId,
        async (repositorio) => estadoLogro(await repositorio.obtener(c.req.valid("param").logroId)),
        (casos) => casos.actualizar(c.req.valid("param").logroId, c.req.valid("json")),
        async (repositorio) => estadoLogro(await repositorio.obtener(c.req.valid("param").logroId)),
      ),
  );

  adminLogrosRoutes.post(
    "/:logroId/archivar",
    zValidator("param", logroParamsSchema),
    async (c) =>
      ejecutarYAuditar(
        c,
        "logro.archivado",
        c.req.valid("param").logroId,
        async (repositorio) => estadoLogro(await repositorio.obtener(c.req.valid("param").logroId)),
        (casos) => casos.archivar(c.req.valid("param").logroId),
        async (repositorio) => estadoLogro(await repositorio.obtener(c.req.valid("param").logroId)),
      ),
  );

  adminLogrosRoutes.post(
    "/:logroId/reactivar",
    zValidator("param", logroParamsSchema),
    async (c) =>
      ejecutarYAuditar(
        c,
        "logro.reactivado",
        c.req.valid("param").logroId,
        async (repositorio) => estadoLogro(await repositorio.obtener(c.req.valid("param").logroId)),
        (casos) => casos.reactivar(c.req.valid("param").logroId),
        async (repositorio) => estadoLogro(await repositorio.obtener(c.req.valid("param").logroId)),
      ),
  );

  return adminLogrosRoutes;
}

export const adminLogrosRoutes = crearModuloAdminLogros();
