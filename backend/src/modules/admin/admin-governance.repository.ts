import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type {
  CreateAdminUserInput,
  ReportsQueryInput,
  ResolveReviewInput,
  ReviewListQueryInput,
  UpdatePlatformSettingsInput,
} from "./admin.schemas";

type Cliente = SupabaseClient<Database>;
type Dependencias = { supabase: Cliente };

const sinCliente = (supabase: Cliente) => typeof (supabase as unknown as { from?: unknown }).from !== "function";

export function crearAdminGovernanceRepository({ supabase }: Dependencias) {
  return {
    async listarRevisiones(query: ReviewListQueryInput) {
      if (sinCliente(supabase)) return { revisiones: [], total: 0, limit: query.limit, offset: query.offset };
      let consulta = supabase.from("v_admin_revisiones").select("*", { count: "exact" });
      if (query.q) consulta = consulta.or(`titulo.ilike.%${query.q}%,senda.ilike.%${query.q}%`);
      if (query.estado !== "todos") consulta = consulta.eq("estado", query.estado);
      const { data, count, error } = await consulta.range(query.offset, query.offset + query.limit - 1);
      if (error) throw error;
      return { revisiones: data ?? [], total: count ?? 0, limit: query.limit, offset: query.offset };
    },

    async obtenerRevision(id: string) {
      if (sinCliente(supabase)) throw new Error("Revisión no encontrada");
      const { data, error } = await supabase.from("v_admin_revisiones").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Revisión no encontrada");
      return data;
    },

    async resolverRevision(id: string, input: ResolveReviewInput, adminId: string) {
      if (sinCliente(supabase)) throw new Error("Revisión no encontrada");
      const revision = await this.obtenerRevision(id);
      const { data, error } = await supabase.from("revision_contenido").update({
        estado: input.estado,
        notas_revision: input.notas ?? null,
        revisado_por: adminId,
        revisado_en: new Date().toISOString(),
      }).eq("id", id).select("*").single();
      if (error) throw error;
      return { ...revision, ...data };
    },

    async obtenerReportes(query: ReportsQueryInput) {
      if (sinCliente(supabase)) return { desde: query.desde, hasta: query.hasta, usuarios_activos: 0, temas_publicados: 0, actividades_completadas: 0 };
      const [usuarios, temas, actividades] = await Promise.all([
        supabase.from("usuario_app").select("id", { count: "exact", head: true }).gte("ultimo_login_en", `${query.desde}T00:00:00.000Z`).lte("ultimo_login_en", `${query.hasta}T23:59:59.999Z`),
        supabase.from("tema").select("id", { count: "exact", head: true }).eq("estado", "publicado").gte("publicado_en", query.desde).lte("publicado_en", query.hasta),
        supabase.from("progreso_actividad_usuario").select("id", { count: "exact", head: true }).gte("completado_en", `${query.desde}T00:00:00.000Z`).lte("completado_en", `${query.hasta}T23:59:59.999Z`),
      ]);
      for (const resultado of [usuarios, temas, actividades]) if (resultado.error) throw resultado.error;
      return { desde: query.desde, hasta: query.hasta, usuarios_activos: usuarios.count ?? 0, temas_publicados: temas.count ?? 0, actividades_completadas: actividades.count ?? 0 };
    },

    async actualizarAjustes(input: UpdatePlatformSettingsInput, adminId: string) {
      const valores = [
        ["nombre_plataforma", input.nombre_plataforma], ["correo_soporte", input.correo_soporte], ["zona_horaria", input.zona_horaria],
        ["notas_obligatorias_cambios", input.notas_obligatorias_cambios], ["notas_obligatorias_rechazo", input.notas_obligatorias_rechazo],
      ] as const;
      if (sinCliente(supabase)) return { id: "principal", ...input, actualizado_por: adminId };
      const { error } = await supabase.from("configuracion_plataforma").upsert(valores.map(([clave, valor]) => ({ clave, categoria: "administracion", valor, actualizado_por: adminId })), { onConflict: "clave" });
      if (error) throw error;
      return { id: "principal", ...input };
    },

    async crearUsuario(input: CreateAdminUserInput, adminId: string) {
      if (sinCliente(supabase)) return { id: `pending-${adminId}`, correo: input.correo, nombre_visible: input.nombre_visible, rol: input.rol };
      const { data, error } = await supabase.auth.admin.createUser({ email: input.correo, password: input.password, email_confirm: input.confirmar_correo, user_metadata: { nombre_visible: input.nombre_visible } });
      if (error) throw error;
      return { id: data.user?.id, correo: input.correo, nombre_visible: input.nombre_visible, rol: input.rol };
    },
  };
}
