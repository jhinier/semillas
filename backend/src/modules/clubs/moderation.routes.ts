import { Hono } from "hono";
import type { AppBindings } from "../../config/env";
import { crearClubsRepository } from "./clubs.repository";
import { crearCasoModeracionClub } from "./casos-uso/moderation";
import { resolverReporteClubSchema } from "./moderation.schemas";
import { responderError, responderExito } from "../../shared/http/respuesta";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { requireRole } from "../../shared/middleware/role.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { esResultadoConError } from "../../shared/errors/result-helpers";

export const moderationRoutes = new Hono<AppBindings>();

moderationRoutes.use("*", authMiddleware);
moderationRoutes.use("*", requireRole("administrador"));

moderationRoutes.get("/reportes-clubes", async (c) => {
  const cliente = c.get("drizzle");
  if (!cliente) throw new Error("Cliente Drizzle no disponible");
  const reportes = await crearCasoModeracionClub(crearClubsRepository(cliente)).listar(c.req.query("estado"));
  return responderExito(reportes.map((reporte) => {
    const fila = reporte as {
      id: string;
      clubId: string;
      reportadoPor: string;
      reportadoUsuarioId: string;
      categoria: string;
      detalle: string | null;
      estado: string;
      resueltoPor: string | null;
      notaResolucion: string | null;
      creadoEn: Date;
      actualizadoEn: Date;
    };
    return {
      id: fila.id,
      club_id: fila.clubId,
      reportado_por: fila.reportadoPor,
      reportado_usuario_id: fila.reportadoUsuarioId,
      categoria: fila.categoria,
      detalle: fila.detalle,
      estado: fila.estado,
      resuelto_por: fila.resueltoPor,
      nota_resolucion: fila.notaResolucion,
      creado_en: fila.creadoEn.toISOString(),
      actualizado_en: fila.actualizadoEn.toISOString(),
    };
  }));
});

moderationRoutes.patch("/reportes-clubes/:reporteId", zValidator("json", resolverReporteClubSchema), async (c) => {
  const cliente = c.get("drizzle");
  if (!cliente) throw new Error("Cliente Drizzle no disponible");
  const resultado = await crearCasoModeracionClub(crearClubsRepository(cliente)).resolver(
    c.req.param("reporteId"),
    c.req.valid("json"),
    c.get("user").id,
  );
  if (esResultadoConError(resultado)) return responderError(resultado.error.mensaje, resultado.error.codigo, resultado.error.estado);
  return responderExito(resultado);
});
