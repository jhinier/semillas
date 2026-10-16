import type { AuthRepository } from "../auth.repository";

type CredencialesAdminDev = {
  correo: string;
  password: string;
};

export function crearCasoConfigurarAdminDev(
  repositorio: AuthRepository,
  credenciales: CredencialesAdminDev
) {
  return async function configurarAdminDev() {
    const adminEmail = credenciales.correo;
    const adminPassword = credenciales.password;

    const existente = await repositorio.buscarUsuarioPorCorreo(adminEmail);

    if (existente) {
      const usuario = existente.rol !== "administrador"
        ? await repositorio.actualizarRolUsuario(existente.id, "administrador")
        : existente;

      const perfil = await repositorio.buscarPerfilPorUsuarioId(usuario.id);

      return {
        usuario,
        perfil,
        credenciales: { correo: adminEmail, password: adminPassword },
        mensaje: "Administrador de desarrollo disponible para iniciar sesión con correo."
      };
    }

    const authUser = await repositorio.crearUsuarioAuthAdmin({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Admin Dev" },
      app_metadata: { role: "administrador" }
    });

    const usuario = await repositorio.crearUsuarioApp({
      proveedor: "correo",
      rol: "administrador",
      nombre_visible: "Admin Dev",
      correo: adminEmail,
      id_externo: authUser.id
    });

    try {
      const perfil = await repositorio.crearPerfil({ usuario_id: usuario.id, apodo: "Admin Dev" });
      return {
        usuario,
        perfil,
        credenciales: { correo: adminEmail, password: adminPassword },
        mensaje: "Administrador creado. Usa este correo y contraseña para iniciar sesión."
      };
    } catch (error) {
      // La creación ocurre en Auth y en PostgREST. Compensamos ambas escrituras
      // para que el endpoint pueda reintentarse sin dejar identidades incompletas.
      await repositorio.eliminarUsuarioApp(usuario.id);
      await repositorio.eliminarUsuarioAuth(authUser.id);
      throw error;
    }
  };
}
