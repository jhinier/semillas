import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { responderExito } from "../../shared/http/respuesta";
import { serializarPerfil } from "../../shared/serializers/perfil.serializer";
import { serializarUsuario } from "../../shared/serializers/usuario.serializer";
import { updateProfileSchema } from "./users.schemas";
import { crearUsuarioRepository } from "./usuario.repository";
import { crearCasoObtenerPerfil } from "./casos-uso/obtener-perfil";
import { crearCasoActualizarPerfil } from "./casos-uso/actualizar-perfil";
import { crearCasoVincularCuenta } from "./casos-uso/vincular-cuenta";
import type { ModuloDependencias } from "../../shared/types/modulo";

export function crearModuloUsuarios({
  db,
  authMiddleware: middlewareAutenticacion = authMiddleware
}: ModuloDependencias = {}) {
  const usersRoutes = new Hono<AppBindings>();

  function obtenerRepositorio(c: Context<AppBindings>) {
    const cliente = db ?? c.get("drizzle");
    if (!cliente) throw new Error("Cliente Drizzle no disponible");
    return crearUsuarioRepository(cliente);
  }

  usersRoutes.use("*", middlewareAutenticacion);

  usersRoutes.get("/", async (c) => {
    const user = c.get("user");
    const usuarios = obtenerRepositorio(c);
    const obtenerPerfil = crearCasoObtenerPerfil({ usuarios });
    const profile = await obtenerPerfil(user.id);

    return responderExito({
      usuario: serializarUsuario({
        id: user.id,
        rol: user.role,
        proveedor: user.provider,
        nombre_visible: user.displayName,
        correo: user.email
      }),
      perfil: profile
        ? serializarPerfil({
            id: profile.id,
            usuario_id: profile.usuarioId,
            apodo: profile.apodo,
            grupo_edad_id: profile.grupoEdadId,
            url_avatar: profile.urlAvatar,
            clave_avatar: profile.claveAvatar,
            prefiere_audio: profile.prefiereAudio,
            tamano_texto_preferido: profile.tamanoTextoPreferido
          })
        : null
    });
  });

  usersRoutes.patch(
    "/actualizar",
    zValidator("json", updateProfileSchema),
    async (c) => {
      const user = c.get("user");
      const body = c.req.valid("json");
      const usuarios = obtenerRepositorio(c);
      const actualizarPerfil = crearCasoActualizarPerfil({ usuarios });
      const data = await actualizarPerfil(user.id, body);

      return responderExito(
        serializarPerfil({
          id: data.id,
          usuario_id: data.usuarioId,
          apodo: data.apodo,
          grupo_edad_id: data.grupoEdadId,
          url_avatar: data.urlAvatar,
          clave_avatar: data.claveAvatar,
          prefiere_audio: data.prefiereAudio,
          tamano_texto_preferido: data.tamanoTextoPreferido
        })
      );
    }
  );

  usersRoutes.post("/vincular-cuenta", async (c) => {
    const user = c.get("user");
    const authSessionUser = c.get("authSessionUser");
    const usuarios = obtenerRepositorio(c);
    const vincularCuenta = crearCasoVincularCuenta({ usuarios });
    const resultado = await vincularCuenta(user, authSessionUser);

    return responderExito({
      vinculada: true,
      usuario: serializarUsuario(resultado.usuario),
      perfil: resultado.perfil
        ? serializarPerfil({
            id: resultado.perfil.id,
            usuario_id: resultado.perfil.usuarioId,
            apodo: resultado.perfil.apodo,
            grupo_edad_id: resultado.perfil.grupoEdadId,
            url_avatar: resultado.perfil.urlAvatar,
            clave_avatar: resultado.perfil.claveAvatar,
            prefiere_audio: resultado.perfil.prefiereAudio,
            tamano_texto_preferido: resultado.perfil.tamanoTextoPreferido
          })
        : null
    });
  });

  return usersRoutes;
}

export const usersRoutes = crearModuloUsuarios();
