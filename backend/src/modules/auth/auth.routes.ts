import { Hono } from "hono";
import type { AppBindings } from "../../config/env";
import { zValidator } from "../../shared/middleware/validate.middleware";
import { createGuestSchema } from "./auth.schemas";
import { responderError, responderExito } from "../../shared/http/respuesta";
import { serializarPerfil } from "../../shared/serializers/perfil.serializer";
import { serializarUsuario } from "../../shared/serializers/usuario.serializer";
import { crearAuthRepository } from "./auth.repository";
import { crearCasoCrearInvitado } from "./casos-uso/crear-invitado";
import { crearCasoConfigurarAdminDev } from "./casos-uso/configurar-admin-dev";

export const authRoutes = new Hono<AppBindings>();

authRoutes.post("/invitado", zValidator("json", createGuestSchema), async (c) => {
  const body = c.req.valid("json");
  const repositorio = crearAuthRepository(c.get("db"));
  const crearInvitado = crearCasoCrearInvitado(repositorio);
  const { usuario, perfil, tokenInvitado } = await crearInvitado(body);

  return responderExito(
    {
      usuario: serializarUsuario(usuario),
      perfil: serializarPerfil(perfil),
      autenticacion: {
        tipo: "invitado",
        encabezado: "x-guest-user-id",
        valor: usuario.id,
        encabezado_token: "x-guest-token",
        token: tokenInvitado
      }
    },
    201
  );
});

authRoutes.post("/configuracion-dev", async (c) => {
  const habilitado = c.env.ENABLE_DEV_ADMIN_SETUP === "true";
  const esEntornoLocal = c.env.APP_ENV === "development" || c.env.APP_ENV === "local";
  const correo = c.env.DEV_ADMIN_EMAIL?.trim();
  const password = c.env.DEV_ADMIN_PASSWORD;
  const tokenConfiguracion = c.env.DEV_ADMIN_SETUP_TOKEN;
  const tokenRecibido = c.req.header("x-dev-setup-token");

  if (!esEntornoLocal || !habilitado) {
    return responderError("Configuración administrativa desactivada", "DEV_SETUP_DISABLED", 404);
  }

  if (!correo || !password || password.length < 12 || !tokenConfiguracion || tokenConfiguracion.length < 16) {
    return responderError("Variables de configuración administrativa incompletas o débiles", "DEV_SETUP_MISCONFIGURED", 503);
  }

  if (tokenRecibido !== tokenConfiguracion) {
    return responderError("Token de configuración inválido", "UNAUTHORIZED", 401);
  }

  const repositorio = crearAuthRepository(c.get("db"));
  const configurarAdminDev = crearCasoConfigurarAdminDev(repositorio, { correo, password });
  const resultado = await configurarAdminDev();

  return responderExito({
    usuario: serializarUsuario(resultado.usuario),
    credenciales: resultado.credenciales,
    ...(resultado.perfil ? { perfil: serializarPerfil(resultado.perfil) } : {}),
    mensaje: resultado.mensaje
  });
});
