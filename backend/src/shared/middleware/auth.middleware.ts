import { createMiddleware } from "hono/factory";
import type { AppBindings, AuthSessionUser } from "../../config/env";
import { createSupabaseAdmin, createSupabaseAuthClient } from "../../db/client";
import { crearAuthRepository } from "../../modules/auth/auth.repository";
import { crearCasoResolverSesion } from "../../modules/auth/casos-uso/resolver-sesion";
import { verificarTokenInvitado } from "../security/guest-token";
import { UnauthorizedError } from "../errors/http-error";

export const authMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const db = c.get("db") ?? createSupabaseAdmin(c.env);
  c.set("db", db);

  const guestUserId = c.req.header("x-guest-user-id");
  const guestToken = c.req.header("x-guest-token");
  const authHeader = c.req.header("authorization");
  c.set("guestUserId", guestUserId ?? null);

  if (guestUserId || guestToken) {
    if (!guestUserId || !guestToken) {
      throw new UnauthorizedError("La sesión invitada está incompleta");
    }

    const authUser: AuthSessionUser | null = authHeader?.startsWith("Bearer ")
      ? await obtenerUsuarioSupabase(c.env, authHeader)
      : null;

    const { data, error } = await db
      .from("usuario_app")
      .select("id, rol, proveedor, nombre_visible, correo, activo, token_invitado_hash")
      .eq("id", guestUserId)
      .eq("proveedor", "invitado")
      .single();

    if (
      error ||
      !data ||
      !data.activo ||
      !data.token_invitado_hash ||
      !(await verificarTokenInvitado(guestToken, data.token_invitado_hash))
    ) {
      throw new UnauthorizedError("Credenciales de invitado inválidas");
    }

    c.set("user", {
      id: data.id,
      role: data.rol,
      displayName: data.nombre_visible,
      email: data.correo,
      provider: data.proveedor
    });

    if (authUser) c.set("authSessionUser", authUser);
    await next();
    return;
  }

  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Falta token de autenticación");
  }

  const usuarioSupabase = await obtenerUsuarioSupabase(c.env, authHeader);
  const resolverSesion = crearCasoResolverSesion(crearAuthRepository(db));
  const usuario = await resolverSesion(usuarioSupabase);
  c.set("user", usuario);
  c.set("authSessionUser", usuarioSupabase);
  await next();
});

async function obtenerUsuarioSupabase(
  env: AppBindings["Bindings"],
  authHeader: string
): Promise<AuthSessionUser> {
  const token = authHeader.replace("Bearer ", "").trim();
  const authClient = createSupabaseAuthClient(env, token);
  const { data: { user }, error } = await authClient.auth.getUser();

  if (error || !user) throw new UnauthorizedError("Token inválido");

  return {
    id: user.id,
    displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "Semillero",
    email: user.email ?? null,
    provider:
      user.app_metadata?.provider === "facebook"
        ? "facebook"
        : user.app_metadata?.provider === "google"
          ? "google"
          : "correo"
  };
}
