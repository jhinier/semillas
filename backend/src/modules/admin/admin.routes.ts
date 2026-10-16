import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { requireRole } from "../../shared/middleware/role.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { responderExito } from "../../shared/http/respuesta";
import {
  createActivitySchema,
  createAdminUserSchema,
  createThemeSchema,
  reportsQuerySchema,
  reorderActivitiesSchema,
  resolveReviewSchema,
  reviewListQuerySchema,
  submitReviewSchema,
  actualizarAjustesSistemaSchema,
  updateActivitySchema,
  updatePlatformSettingsSchema,
  updateThemeSchema,
  updateUserSchema,
  inviteUserSchema,
  createChildUserSchema,
  bulkUserActionSchema,
  upsertStepContentSchema,
  createSendaSchema,
  updateSendaSchema
} from "./admin.schemas";
import { crearAdminRepository } from "./admin.repository";
import { crearAdminUsersRepository } from "./admin-users.repository";
import { crearAdminGovernanceRepository } from "./admin-governance.repository";
import { crearCasoObtenerResumen } from "./casos-uso/resumen";
import { crearCasosUsoActividades } from "./casos-uso/actividades";
import { crearCasosUsoAjustes } from "./casos-uso/ajustes";
import { crearCasosUsoTemas } from "./casos-uso/temas";
import { crearCasosUsoUsuarios } from "./casos-uso/usuarios";
import { crearCasosUsoSendas } from "./casos-uso/sendas";

type CrearRepositorioAdmin = typeof crearAdminRepository;
type CrearRepositorioUsuarios = typeof crearAdminUsersRepository;

export function crearModuloAdmin(
  crearRepositorio: CrearRepositorioAdmin = crearAdminRepository,
  crearRepositorioUsuarios: CrearRepositorioUsuarios = crearAdminUsersRepository,
  crearRepositorioGovernance: typeof crearAdminGovernanceRepository = crearAdminGovernanceRepository
) {
  const adminRoutes = new Hono<AppBindings>();

  function obtenerCasosUso(c: Context<AppBindings>) {
    const dependencias = { supabase: c.get("db"), drizzle: c.get("drizzle") };
    const repositorio = crearRepositorio(dependencias);
    const repositorioUsuarios = crearRepositorioUsuarios(dependencias);
    const governance = crearRepositorioGovernance({ supabase: c.get("db") });

    return {
      resumen: crearCasoObtenerResumen(repositorio),
      actividades: crearCasosUsoActividades(repositorio),
      ajustes: crearCasosUsoAjustes(repositorio),
      temas: crearCasosUsoTemas(repositorio),
      usuarios: crearCasosUsoUsuarios(repositorioUsuarios),
      sendas: crearCasosUsoSendas(repositorio),
      governance
    };
  }

  adminRoutes.use("*", authMiddleware);
  adminRoutes.use("*", requireRole("administrador"));

  adminRoutes.get("/resumen", async (c) => {
    const casos = obtenerCasosUso(c);
    return responderExito(await casos.resumen.ejecutar());
  });

  adminRoutes.get("/sendas", async (c) => responderExito(await obtenerCasosUso(c).sendas.listar()));
  adminRoutes.post("/sendas", zValidator("json", createSendaSchema), async (c) => responderExito(await obtenerCasosUso(c).sendas.crear(c.req.valid("json")), 201));
  adminRoutes.get("/sendas/:id", async (c) => responderExito(await obtenerCasosUso(c).sendas.obtener(c.req.param("id"))));
  adminRoutes.patch("/sendas/:id", zValidator("json", updateSendaSchema), async (c) => responderExito(await obtenerCasosUso(c).sendas.actualizar(c.req.param("id"), c.req.valid("json"))));
  adminRoutes.get("/resumen/detallado", async (c) => responderExito(await obtenerCasosUso(c).resumen.ejecutarDetallado()));
  adminRoutes.get("/revisiones", zValidator("query", reviewListQuerySchema), async (c) =>
    responderExito(await obtenerCasosUso(c).governance.listarRevisiones(c.req.valid("query")))
  );
  adminRoutes.get("/revisiones/:revision_id", async (c) =>
    responderExito(await obtenerCasosUso(c).governance.obtenerRevision(c.req.param("revision_id")))
  );
  adminRoutes.post("/revisiones/:revision_id/resolver", zValidator("json", resolveReviewSchema), async (c) =>
    responderExito(
      await obtenerCasosUso(c).governance.resolverRevision(
        c.req.param("revision_id"),
        c.req.valid("json"),
        c.get("user").id,
      ),
    ),
  );
  adminRoutes.get("/reportes", zValidator("query", reportsQuerySchema), async (c) =>
    responderExito(await obtenerCasosUso(c).governance.obtenerReportes(c.req.valid("query")))
  );
  adminRoutes.get("/ajustes", async (c) => responderExito(await obtenerCasosUso(c).ajustes.obtener()));
  adminRoutes.patch("/ajustes", zValidator("json", actualizarAjustesSistemaSchema), async (c) =>
    responderExito(await obtenerCasosUso(c).ajustes.actualizar(c.req.valid("json"), c.get("user").id))
  );
  adminRoutes.patch("/ajustes-plataforma", zValidator("json", updatePlatformSettingsSchema), async (c) =>
    responderExito(
      await obtenerCasosUso(c).governance.actualizarAjustes(c.req.valid("json"), c.get("user").id),
    ),
  );
  adminRoutes.get("/actividades", async (c) => {
    const casos = obtenerCasosUso(c);
    return responderExito(await casos.actividades.listar({ temaId: c.req.query("tema_id") ?? undefined, tipoId: c.req.query("tipo_actividad_id") ?? undefined, grupoEdadId: c.req.query("grupo_edad_id") ?? undefined, estado: c.req.query("estado") ?? undefined, limit: Math.min(Math.max(Number(c.req.query("limit") ?? "100"), 1), 500), offset: Math.max(Number(c.req.query("offset") ?? "0"), 0) }));
  });
  adminRoutes.get("/actividades/:actividad_id", async (c) => responderExito(await obtenerCasosUso(c).actividades.obtener(c.req.param("actividad_id"))));
  adminRoutes.get("/temas", async (c) => responderExito(await obtenerCasosUso(c).temas.listar(c.req.query("status") ?? undefined)));
  adminRoutes.get("/temas-listado", async (c) => responderExito(await obtenerCasosUso(c).temas.listarPaginados({
    q: c.req.query("q") ?? undefined,
    estado: c.req.query("estado") ?? undefined,
    sendaId: c.req.query("senda_id") ?? undefined,
    grupoEdadId: c.req.query("grupo_edad_id") ?? undefined,
    limit: Math.min(Math.max(Number(c.req.query("limit") ?? "20"), 1), 100),
    offset: Math.max(Number(c.req.query("offset") ?? "0"), 0)
  })));
  adminRoutes.get("/temas/:tema_id/estudio", async (c) => responderExito(await obtenerCasosUso(c).temas.obtenerEstudio(c.req.param("tema_id"))));
  adminRoutes.get("/temas/:tema_id", async (c) => responderExito(await obtenerCasosUso(c).temas.obtener(c.req.param("tema_id"))));
  adminRoutes.post("/temas", zValidator("json", createThemeSchema), async (c) => responderExito(await obtenerCasosUso(c).temas.crear(c.req.valid("json"), c.get("user").id), 201));
  adminRoutes.patch("/temas/:tema_id", zValidator("json", updateThemeSchema), async (c) => responderExito(await obtenerCasosUso(c).temas.actualizar(c.req.param("tema_id"), c.req.valid("json"))));
  adminRoutes.delete("/temas/:tema_id", async (c) => responderExito(await obtenerCasosUso(c).temas.eliminar(c.req.param("tema_id"))));
  adminRoutes.post("/temas/:tema_id/pasos", zValidator("json", upsertStepContentSchema), async (c) => responderExito(await obtenerCasosUso(c).temas.crearPaso(c.req.param("tema_id"), c.req.valid("json"))));
  adminRoutes.get("/temas/:tema_id/pasos", async (c) => responderExito(await obtenerCasosUso(c).temas.listarPasos(c.req.param("tema_id"))));
  adminRoutes.delete("/temas/:tema_id/pasos/:tipo_paso_id", async (c) => responderExito(await obtenerCasosUso(c).temas.eliminarPaso(c.req.param("tema_id"), c.req.param("tipo_paso_id"))));
  adminRoutes.post("/actividades", zValidator("json", createActivitySchema), async (c) => responderExito(await obtenerCasosUso(c).actividades.crear(c.req.valid("json")), 201));
  adminRoutes.patch("/actividades/:actividad_id", zValidator("json", updateActivitySchema), async (c) => responderExito(await obtenerCasosUso(c).actividades.actualizar(c.req.param("actividad_id"), c.req.valid("json"))));
  adminRoutes.delete("/actividades/:actividad_id", async (c) => responderExito(await obtenerCasosUso(c).actividades.eliminar(c.req.param("actividad_id"))));
  adminRoutes.post("/actividades/:actividad_id/duplicar", async (c) => responderExito(await obtenerCasosUso(c).actividades.duplicar(c.req.param("actividad_id")), 201));
  adminRoutes.post("/temas/:tema_id/actividades/reordenar", zValidator("json", reorderActivitiesSchema), async (c) => responderExito(await obtenerCasosUso(c).actividades.reordenar(c.req.param("tema_id"), c.req.valid("json"))));
  adminRoutes.post("/temas/:tema_id/enviar-revision", zValidator("json", submitReviewSchema), async (c) => responderExito(await obtenerCasosUso(c).temas.enviarRevision(c.req.param("tema_id"), c.req.valid("json"), c.get("user").id)));
  adminRoutes.post("/temas/:tema_id/resolver-revision", zValidator("json", resolveReviewSchema), async (c) => responderExito(await obtenerCasosUso(c).temas.resolverRevision(c.req.param("tema_id"), c.req.valid("json"), c.get("user").id)));
  adminRoutes.post("/temas/:tema_id/publicar", async (c) => responderExito(await obtenerCasosUso(c).temas.publicar(c.req.param("tema_id"), c.get("user").id)));
  adminRoutes.post("/temas/:tema_id/borrador", async (c) => responderExito(await obtenerCasosUso(c).temas.guardarBorrador(c.req.param("tema_id"))));
  adminRoutes.post("/temas/:tema_id/archivar", async (c) => responderExito(await obtenerCasosUso(c).temas.archivar(c.req.param("tema_id"))));
  adminRoutes.post("/temas/:tema_id/duplicar", async (c) => responderExito(await obtenerCasosUso(c).temas.duplicar(c.req.param("tema_id"), c.get("user")), 201));
  adminRoutes.get("/usuarios", async (c) => responderExito(await obtenerCasosUso(c).usuarios.listar({
    q: c.req.query("q") ?? undefined,
    rol: c.req.query("rol") ?? undefined,
    estado: (c.req.query("estado") as "activo" | "pendiente" | "bloqueado" | undefined) ?? undefined,
    grupoEdadId: c.req.query("grupo_edad_id") ?? undefined,
    clubId: c.req.query("club_id") ?? undefined,
    limit: Math.min(Math.max(Number(c.req.query("limit") ?? "20"), 1), 100),
    offset: Math.max(Number(c.req.query("offset") ?? "0"), 0)
  })));
  adminRoutes.post("/usuarios/invitar", zValidator("json", inviteUserSchema), async (c) =>
    responderExito(await obtenerCasosUso(c).usuarios.invitar(c.req.valid("json"), c.get("user").id), 201)
  );
  adminRoutes.post("/usuarios/menores", zValidator("json", createChildUserSchema), async (c) =>
    responderExito(await obtenerCasosUso(c).usuarios.crearMenor(c.req.valid("json"), c.get("user").id), 201)
  );
  adminRoutes.post("/usuarios/acciones", zValidator("json", bulkUserActionSchema), async (c) =>
    responderExito(await obtenerCasosUso(c).usuarios.accionMasiva(c.req.valid("json"), c.get("user").id))
  );
  adminRoutes.get("/usuarios/:usuario_id", async (c) =>
    responderExito(await obtenerCasosUso(c).usuarios.obtener(c.req.param("usuario_id")))
  );
  adminRoutes.post("/usuarios/cuenta", zValidator("json", createAdminUserSchema), async (c) =>
    responderExito(await obtenerCasosUso(c).governance.crearUsuario(c.req.valid("json"), c.get("user").id), 201)
  );
  adminRoutes.patch("/usuarios/:usuario_id", zValidator("json", updateUserSchema), async (c) =>
    responderExito(await obtenerCasosUso(c).usuarios.actualizar(
      c.req.param("usuario_id"),
      c.req.valid("json"),
      c.get("user").id
    ))
  );
  adminRoutes.delete("/usuarios/:usuario_id", async (c) =>
    responderExito(await obtenerCasosUso(c).usuarios.eliminar(c.req.param("usuario_id"), c.get("user").id))
  );

  return adminRoutes;
}

export const adminRoutes = crearModuloAdmin();
