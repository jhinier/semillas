import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "../../db/database.types";

type DbClient = SupabaseClient<Database>;

type RecursoMultimediaInsert = Database["public"]["Tables"]["recurso_multimedia"]["Insert"];
type RecursoMultimediaUpdate = Database["public"]["Tables"]["recurso_multimedia"]["Update"];
type RecursoMultimediaRow = Database["public"]["Tables"]["recurso_multimedia"]["Row"];

const STORAGE_BUCKET = "media";

export type MediaRepository = ReturnType<typeof crearMediaRepository>;

export type FuenteUsoMedia = {
  temas: Array<{ id: string; titulo: string; slug: string; portada_recurso_id: string | null }>;
  sendas: Array<{ id: string; nombre: string; imagen_recurso_id: string | null }>;
  contenidos: Array<{
    id: string;
    titulo: string;
    paso_id: string;
    recurso_id: string | null;
    recurso_audio_id: string | null;
    datos_extra: Json;
  }>;
  pasos: Array<{ id: string; tema_id: string; tipo_paso_id: string }>;
  tiposPaso: Array<{ id: string; nombre: string; codigo: string }>;
  actividades: Array<{
    id: string;
    titulo: string;
    tema_id: string;
    configuracion: Json;
  }>;
};

export function crearMediaRepository(db: DbClient) {
  return {
    async subirArchivo(storagePath: string, archivo: File, bucket = STORAGE_BUCKET) {
      return db.storage.from(bucket).upload(storagePath, archivo, {
        contentType: archivo.type,
        upsert: false,
      });
    },

    async insertarRecurso(datos: RecursoMultimediaInsert) {
      const { data, error } = await db
        .from("recurso_multimedia")
        .insert(datos)
        .select("*")
        .single();
      if (error || !data) throw error;
      return data as RecursoMultimediaRow;
    },

    async obtenerRecursoActivo(id: string) {
      const { data, error } = await db
        .from("recurso_multimedia")
        .select("*")
        .eq("id", id)
        .eq("activo", true)
        .maybeSingle();

      if (error) throw error;
      return (data as RecursoMultimediaRow | null) ?? null;
    },

    async listarRecursosActivos() {
      const { data, error } = await db
        .from("recurso_multimedia")
        .select("*")
        .eq("activo", true)
        .order("creado_en", { ascending: false });
      if (error) throw error;
      return (data as RecursoMultimediaRow[] | null) ?? [];
    },

    async listarFuentesUso(): Promise<FuenteUsoMedia> {
      const [temas, sendas, contenidos, pasos, tiposPaso, actividades] = await Promise.all([
        db.from("tema").select("id,titulo,slug,portada_recurso_id"),
        db.from("senda").select("id,nombre,imagen_recurso_id"),
        db
          .from("contenido_paso_tema")
          .select("id,titulo,paso_id,recurso_id,recurso_audio_id,datos_extra"),
        db.from("paso_tema").select("id,tema_id,tipo_paso_id"),
        db.from("tipo_paso_crecer").select("id,nombre,codigo"),
        db.from("actividad").select("id,titulo,tema_id,configuracion"),
      ]);

      const error =
        temas.error ??
        sendas.error ??
        contenidos.error ??
        pasos.error ??
        tiposPaso.error ??
        actividades.error;
      if (error) throw error;

      return {
        temas: (Array.isArray(temas.data) ? temas.data : []) as FuenteUsoMedia["temas"],
        sendas: (Array.isArray(sendas.data) ? sendas.data : []) as FuenteUsoMedia["sendas"],
        contenidos: (Array.isArray(contenidos.data) ? contenidos.data : []) as FuenteUsoMedia["contenidos"],
        pasos: (Array.isArray(pasos.data) ? pasos.data : []) as FuenteUsoMedia["pasos"],
        tiposPaso: (Array.isArray(tiposPaso.data) ? tiposPaso.data : []) as FuenteUsoMedia["tiposPaso"],
        actividades: (Array.isArray(actividades.data) ? actividades.data : []) as FuenteUsoMedia["actividades"],
      };
    },

    async obtenerCreador(usuarioId: string | null) {
      if (!usuarioId) return null;
      const { data, error } = await db
        .from("usuario_app")
        .select("id,nombre_visible,correo")
        .eq("id", usuarioId)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },

    async actualizarRecurso(id: string, datos: RecursoMultimediaUpdate) {
      const { data, error } = await db
        .from("recurso_multimedia")
        .update({
          ...datos,
          actualizado_en: new Date().toISOString(),
        } satisfies RecursoMultimediaUpdate)
        .eq("id", id)
        .eq("activo", true)
        .select("*")
        .single();
      if (error || !data) throw error;
      return data as RecursoMultimediaRow;
    },

    async registrarAuditoria(datos: {
      actorUsuarioId: string;
      accion: string;
      entidadId: string;
      datosAntes?: Json | null;
      datosDespues?: Json | null;
    }) {
      const { error } = await db.from("registro_auditoria").insert({
        actor_usuario_id: datos.actorUsuarioId,
        accion: datos.accion,
        tipo_entidad: "recurso_multimedia",
        entidad_id: datos.entidadId,
        datos_antes: datos.datosAntes ?? null,
        datos_despues: datos.datosDespues ?? null,
      });
      if (error) throw error;
    },

    async eliminarRegistro(id: string) {
      const { error } = await db.from("recurso_multimedia").delete().eq("id", id);
      if (error) throw error;
    },

    async actualizarRutaAcceso(id: string, ruta: string) {
      const { data, error } = await db
        .from("recurso_multimedia")
        .update({
          url_publica: ruta,
          actualizado_en: new Date().toISOString(),
        } satisfies RecursoMultimediaUpdate)
        .eq("id", id)
        .eq("activo", true)
        .select("*")
        .single();
      if (error || !data) throw error;
      return data as RecursoMultimediaRow;
    },

    async desactivarRecurso(id: string) {
      const { error } = await db
        .from("recurso_multimedia")
        .update({
          activo: false,
          actualizado_en: new Date().toISOString(),
        } satisfies RecursoMultimediaUpdate)
        .eq("id", id);
      if (error) throw error;
    },

    async eliminarArchivo(bucket: string, clave: string) {
      return db.storage.from(bucket).remove([clave]);
    },

    async crearURLFirmada(bucket: string, clave: string, expiracionSegundos: number) {
      return db.storage.from(bucket).createSignedUrl(clave, expiracionSegundos);
    },

    bucket: STORAGE_BUCKET,
  };
}
