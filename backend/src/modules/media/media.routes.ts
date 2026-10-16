import { Hono } from "hono";
import type { AppBindings } from "../../config/env";
import { esResultadoConError } from "../../shared/errors/result-helpers";
import { responderError, responderExito } from "../../shared/http/respuesta";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { requireRole } from "../../shared/middleware/role.middleware";
import { crearMediaRepository } from "./media.repository";
import { crearCasosUsoMedia } from "./media.use-cases";

export const mediaRoutes = new Hono<AppBindings>();

function numeroOpcional(valor: string | File | null) {
  if (typeof valor !== "string" || !valor.trim()) return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

mediaRoutes.post(
  "/subir",
  authMiddleware,
  requireRole("administrador"),
  async (c) => {
    const formData = await c.req.formData();
    const archivo = formData.get("archivo");
    const tipoRaw = formData.get("tipo");
    const textoAlternativo =
      (formData.get("texto_alternativo") as string | null) || undefined;
    const titulo = (formData.get("titulo") as string | null) || undefined;

    if (!archivo || !(archivo instanceof File)) {
      return responderError(
        "El campo 'archivo' es requerido y debe ser un archivo",
        "VALIDATION_ERROR",
        400,
      );
    }

    const casos = crearCasosUsoMedia(crearMediaRepository(c.get("db")));
    const resultado = await casos.subir({
      archivo,
      tipoRaw,
      textoAlternativo,
      titulo,
      userId: c.get("user").id,
      anchoPx: numeroOpcional(formData.get("ancho_px")),
      altoPx: numeroOpcional(formData.get("alto_px")),
      duracionSeg: numeroOpcional(formData.get("duracion_seg")),
    });

    if (esResultadoConError(resultado)) {
      return responderError(
        resultado.error.mensaje,
        resultado.error.codigo,
        resultado.error.estado,
      );
    }
    return responderExito(resultado.recurso, 201);
  },
);

mediaRoutes.get("/:id/url", authMiddleware, async (c) => {
  const casos = crearCasosUsoMedia(crearMediaRepository(c.get("db")));
  const resultado = await casos.obtenerUrl(c.req.param("id"));
  if (esResultadoConError(resultado)) {
    return responderError(
      resultado.error.mensaje,
      resultado.error.codigo,
      resultado.error.estado,
    );
  }
  return responderExito({
    url: resultado.url,
    expira_en_segundos: resultado.expiraEnSegundos,
  });
});

mediaRoutes.get(
  "/",
  authMiddleware,
  requireRole("administrador"),
  async (c) => {
    const casos = crearCasosUsoMedia(crearMediaRepository(c.get("db")));
    return responderExito(await casos.listar());
  },
);

mediaRoutes.get(
  "/:id",
  authMiddleware,
  requireRole("administrador"),
  async (c) => {
    const casos = crearCasosUsoMedia(crearMediaRepository(c.get("db")));
    const resultado = await casos.obtener(c.req.param("id"));
    if (esResultadoConError(resultado)) {
      return responderError(
        resultado.error.mensaje,
        resultado.error.codigo,
        resultado.error.estado,
      );
    }
    return responderExito(resultado);
  },
);

mediaRoutes.patch(
  "/:id",
  authMiddleware,
  requireRole("administrador"),
  async (c) => {
    const body = await c.req.json().catch(() => null);
    const casos = crearCasosUsoMedia(crearMediaRepository(c.get("db")));
    const resultado = await casos.actualizar(
      c.req.param("id"),
      body,
      c.get("user").id,
    );
    if (esResultadoConError(resultado)) {
      return responderError(
        resultado.error.mensaje,
        resultado.error.codigo,
        resultado.error.estado,
      );
    }
    return responderExito(resultado.recurso);
  },
);

mediaRoutes.post(
  "/:id/reemplazar",
  authMiddleware,
  requireRole("administrador"),
  async (c) => {
    const formData = await c.req.formData();
    const archivo = formData.get("archivo");
    if (!archivo || !(archivo instanceof File)) {
      return responderError(
        "El campo 'archivo' es requerido y debe ser un archivo",
        "VALIDATION_ERROR",
        400,
      );
    }

    const casos = crearCasosUsoMedia(crearMediaRepository(c.get("db")));
    const resultado = await casos.reemplazar({
      id: c.req.param("id"),
      archivo,
      actorUsuarioId: c.get("user").id,
      entrada: {
        titulo: (formData.get("titulo") as string | null) || undefined,
        textoAlternativo:
          formData.has("texto_alternativo")
            ? ((formData.get("texto_alternativo") as string | null) ?? null)
            : undefined,
        anchoPx: numeroOpcional(formData.get("ancho_px")),
        altoPx: numeroOpcional(formData.get("alto_px")),
        duracionSeg: numeroOpcional(formData.get("duracion_seg")),
      },
    });
    if (esResultadoConError(resultado)) {
      return responderError(
        resultado.error.mensaje,
        resultado.error.codigo,
        resultado.error.estado,
      );
    }
    return responderExito(resultado.recurso);
  },
);

mediaRoutes.delete(
  "/:id",
  authMiddleware,
  requireRole("administrador"),
  async (c) => {
    const casos = crearCasosUsoMedia(crearMediaRepository(c.get("db")));
    const resultado = await casos.eliminar(
      c.req.param("id"),
      c.get("user").id,
    );
    if (esResultadoConError(resultado)) {
      return responderError(
        resultado.error.mensaje,
        resultado.error.codigo,
        resultado.error.estado,
      );
    }
    return responderExito(resultado);
  },
);
