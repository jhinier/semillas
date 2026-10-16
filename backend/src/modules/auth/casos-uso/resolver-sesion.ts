import type { AuthSessionUser, AuthUser } from "../../../config/env";
import { UnauthorizedError } from "../../../shared/errors/http-error";

type UsuarioAplicacion = Pick<AuthUser, "id" | "role" | "displayName" | "email" | "provider"> & { activo: boolean };

type RepositorioSesion = {
  buscarUsuarioPorIdExterno: (idExterno: string) => Promise<{
    id: string;
    rol: AuthUser["role"];
    proveedor: AuthUser["provider"];
    nombre_visible: string;
    correo: string | null;
    activo: boolean;
  } | null>;
  crearUsuarioApp: (datos: {
    proveedor: AuthSessionUser["provider"];
    id_externo: string;
    correo: string | null;
    nombre_visible: string;
    rol: "usuario";
  }) => Promise<{
    id: string;
    rol: AuthUser["role"];
    proveedor: AuthUser["provider"];
    nombre_visible: string;
    correo: string | null;
    activo: boolean;
  }>;
  crearPerfil: (datos: { usuario_id: string; apodo: string }) => Promise<unknown>;
  eliminarUsuarioApp: (usuarioId: string) => Promise<void>;
};

export function crearCasoResolverSesion(repositorio: RepositorioSesion) {
  return async function resolverSesion(authUser: AuthSessionUser): Promise<UsuarioAplicacion> {
    const existente = await repositorio.buscarUsuarioPorIdExterno(authUser.id);
    if (existente) {
      if (!existente.activo) throw new UnauthorizedError("La cuenta está bloqueada");
      return mapearUsuario(existente);
    }

    const creado = await repositorio.crearUsuarioApp({
      proveedor: authUser.provider,
      id_externo: authUser.id,
      correo: authUser.email,
      nombre_visible: authUser.displayName,
      rol: "usuario",
    });

    try {
      await repositorio.crearPerfil({ usuario_id: creado.id, apodo: creado.nombre_visible });
    } catch (error) {
      await repositorio.eliminarUsuarioApp(creado.id);
      throw error;
    }

    return mapearUsuario(creado);
  };
}

function mapearUsuario(usuario: {
  id: string;
  rol: AuthUser["role"];
  proveedor: AuthUser["provider"];
  nombre_visible: string;
  correo: string | null;
  activo: boolean;
}): UsuarioAplicacion {
  return {
    id: usuario.id,
    role: usuario.rol,
    displayName: usuario.nombre_visible,
    email: usuario.correo,
    provider: usuario.proveedor,
    activo: usuario.activo,
  };
}
