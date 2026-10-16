import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

type DbClient = SupabaseClient<Database>;

type UsuarioAppResumen = Pick<Database["public"]["Tables"]["usuario_app"]["Row"], "id" | "rol" | "proveedor" | "nombre_visible" | "correo" | "activo">;
type UsuarioAppInsert = Database["public"]["Tables"]["usuario_app"]["Insert"];
type PerfilInsert = Database["public"]["Tables"]["perfil"]["Insert"];
type CrearUsuarioAuthAdminBody = Parameters<DbClient["auth"]["admin"]["createUser"]>[0];

export type AuthRepository = ReturnType<typeof crearAuthRepository>;

export function crearAuthRepository(db: DbClient) {
  return {
    async buscarUsuarioPorCorreo(correo: string) {
      const { data } = await db.from("usuario_app").select("id, rol, proveedor, nombre_visible, correo, activo").eq("correo", correo).maybeSingle();
      return (data as UsuarioAppResumen | null) ?? null;
    },
    async buscarUsuarioPorIdExterno(idExterno: string) {
      const { data, error } = await db.from("usuario_app").select("id, rol, proveedor, nombre_visible, correo, activo").eq("id_externo", idExterno).maybeSingle();
      if (error) throw error;
      return (data as UsuarioAppResumen | null) ?? null;
    },
    async actualizarRolUsuario(usuarioId: string, rol: Database["public"]["Tables"]["usuario_app"]["Row"]["rol"]) {
      const { data, error } = await db.from("usuario_app").update({ rol }).eq("id", usuarioId).select("id, rol, proveedor, nombre_visible, correo, activo").single();
      if (error || !data) throw error;
      return data as UsuarioAppResumen;
    },
    async crearUsuarioApp(datos: UsuarioAppInsert) {
      const { data, error } = await db.from("usuario_app").insert(datos).select("id, rol, proveedor, nombre_visible, correo, activo").single();
      if (error || !data) throw error;
      return data as UsuarioAppResumen;
    },
    async crearPerfil(datos: PerfilInsert) {
      const { data, error } = await db.from("perfil").insert(datos).select("*").single();
      if (error || !data) throw error;
      return data;
    },
    async eliminarUsuarioApp(usuarioId: string) {
      const { error } = await db.from("usuario_app").delete().eq("id", usuarioId);
      if (error) throw error;
    },
    async eliminarUsuarioAuth(usuarioAuthId: string) {
      const { error } = await db.auth.admin.deleteUser(usuarioAuthId);
      if (error) throw error;
    },
    async buscarPerfilPorUsuarioId(usuarioId: string) {
      const { data } = await db.from("perfil").select("*").eq("usuario_id", usuarioId).maybeSingle();
      return data ?? null;
    },
    async crearUsuarioAuthAdmin(body: CrearUsuarioAuthAdminBody) {
      const { data, error } = await db.auth.admin.createUser(body);
      if (error || !data?.user) throw error;
      return data.user;
    }
  };
}
