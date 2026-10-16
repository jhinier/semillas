import { asc, and, eq, inArray } from "drizzle-orm";
import type { DbClient } from "../../db/client";
import { schema } from "../../db/client";

type TemaFila = typeof schema.tema.$inferSelect;
type SendaFila = typeof schema.senda.$inferSelect | null;
type PortadaFila = typeof schema.recursoMultimedia.$inferSelect | null;

export type TemaListadoRepo = {
  tema: TemaFila;
  senda: SendaFila;
  portada: PortadaFila;
};

export function crearThemesRepository(db: DbClient) {
  return {
    async listarTemasPublicos(sendaId?: string): Promise<TemaListadoRepo[]> {
      if (sendaId) {
        return db
          .select({
            tema: schema.tema,
            senda: schema.senda,
            portada: schema.recursoMultimedia
          })
          .from(schema.tema)
          .leftJoin(schema.senda, eq(schema.tema.sendaId, schema.senda.id))
          .leftJoin(schema.recursoMultimedia, eq(schema.tema.portadaRecursoId, schema.recursoMultimedia.id))
          .where(and(eq(schema.tema.estado, "publicado"), eq(schema.tema.sendaId, sendaId)))
          .orderBy(asc(schema.tema.publicadoEn)) as never;
      }

      return db
        .select({
          tema: schema.tema,
          senda: schema.senda,
          portada: schema.recursoMultimedia
        })
        .from(schema.tema)
        .leftJoin(schema.senda, eq(schema.tema.sendaId, schema.senda.id))
        .leftJoin(schema.recursoMultimedia, eq(schema.tema.portadaRecursoId, schema.recursoMultimedia.id))
        .where(eq(schema.tema.estado, "publicado"))
        .orderBy(asc(schema.tema.publicadoEn)) as never;
    },

    async obtenerTemaPublico(temaId: string): Promise<TemaListadoRepo | null> {
      const [resultado] = await db
        .select({
          tema: schema.tema,
          senda: schema.senda,
          portada: schema.recursoMultimedia
        })
        .from(schema.tema)
        .leftJoin(schema.senda, eq(schema.tema.sendaId, schema.senda.id))
        .leftJoin(schema.recursoMultimedia, eq(schema.tema.portadaRecursoId, schema.recursoMultimedia.id))
        .where(and(eq(schema.tema.id, temaId), eq(schema.tema.estado, "publicado")))
        .limit(1);

      return resultado ?? null;
    },

    async obtenerPortadaTema(temaId: string) {
      const [tema] = await db
        .select({
          estado: schema.tema.estado,
          portada: schema.recursoMultimedia
        })
        .from(schema.tema)
        .leftJoin(schema.recursoMultimedia, eq(schema.tema.portadaRecursoId, schema.recursoMultimedia.id))
        .where(and(eq(schema.tema.id, temaId), eq(schema.tema.estado, "publicado")))
        .limit(1);

      return tema ?? null;
    },

    async listarPasosTema(temaId: string, grupoEdadId?: string) {
      const pasos = await db
        .select({ paso: schema.pasoTema, tipoPaso: schema.tipoPasoCrecer })
        .from(schema.pasoTema)
        .leftJoin(schema.tipoPasoCrecer, eq(schema.pasoTema.tipoPasoId, schema.tipoPasoCrecer.id))
        .innerJoin(schema.tema, eq(schema.pasoTema.temaId, schema.tema.id))
        .where(and(eq(schema.pasoTema.temaId, temaId), eq(schema.tema.estado, "publicado")))
        .orderBy(asc(schema.pasoTema.orden));

      return Promise.all(
        pasos.map(async (registro) => {
          let contenidos = await db
            .select()
            .from(schema.contenidoPasoTema)
            .where(eq(schema.contenidoPasoTema.pasoId, registro.paso.id));

          let preguntas = await db
            .select()
            .from(schema.preguntaReflexion)
            .where(eq(schema.preguntaReflexion.pasoId, registro.paso.id));

          if (grupoEdadId) {
            contenidos = contenidos.filter((contenido) => contenido.grupoEdadId === grupoEdadId);
            preguntas = preguntas.filter((pregunta) => pregunta.grupoEdadId === grupoEdadId);
          }

          return { paso: registro.paso, tipoPaso: registro.tipoPaso, contenidos, preguntas };
        })
      );
    },

    async listarActividadesTema(temaId: string, grupoEdadId?: string) {
      const actividades = grupoEdadId
        ? await db
            .select({ actividad: schema.actividad, tipoActividad: schema.tipoActividad })
            .from(schema.actividad)
            .leftJoin(schema.tipoActividad, eq(schema.actividad.tipoActividadId, schema.tipoActividad.id))
            .innerJoin(schema.tema, eq(schema.actividad.temaId, schema.tema.id))
            .where(and(eq(schema.actividad.temaId, temaId), eq(schema.actividad.grupoEdadId, grupoEdadId), eq(schema.tema.estado, "publicado")))
            .orderBy(asc(schema.actividad.orden))
        : await db
            .select({ actividad: schema.actividad, tipoActividad: schema.tipoActividad })
            .from(schema.actividad)
            .leftJoin(schema.tipoActividad, eq(schema.actividad.tipoActividadId, schema.tipoActividad.id))
            .innerJoin(schema.tema, eq(schema.actividad.temaId, schema.tema.id))
            .where(and(eq(schema.actividad.temaId, temaId), eq(schema.tema.estado, "publicado")))
            .orderBy(asc(schema.actividad.orden));

      return Promise.all(
        actividades.map(async (registro) => {
          const opciones = await db
            .select()
            .from(schema.opcionActividad)
            .where(eq(schema.opcionActividad.actividadId, registro.actividad.id));

          return { actividad: registro.actividad, tipoActividad: registro.tipoActividad, opciones };
        })
      );
    },

    async obtenerGrupoEdadUsuario(usuarioId: string) {
      const [perfil] = await db
        .select({ grupoEdadId: schema.perfil.grupoEdadId })
        .from(schema.perfil)
        .where(eq(schema.perfil.usuarioId, usuarioId))
        .limit(1);

      return perfil?.grupoEdadId ?? null;
    },

    async temaDisponibleParaGrupo(temaId: string, grupoEdadId: string) {
      const [temaGrupo] = await db
        .select({ temaId: schema.temaGrupoEdad.temaId })
        .from(schema.temaGrupoEdad)
        .innerJoin(schema.tema, eq(schema.temaGrupoEdad.temaId, schema.tema.id))
        .where(and(eq(schema.temaGrupoEdad.temaId, temaId), eq(schema.temaGrupoEdad.grupoEdadId, grupoEdadId), eq(schema.tema.estado, "publicado")))
        .limit(1);

      return Boolean(temaGrupo);
    },

    async listarRecursosPorIds(ids: string[]) {
      if (ids.length === 0) return [];

      return db
        .select()
        .from(schema.recursoMultimedia)
        .where(inArray(schema.recursoMultimedia.id, ids));
    },

    async obtenerPaqueteOffline(temaId: string, versionContenido: number) {
      const [paquete] = await db
        .select()
        .from(schema.paqueteSinConexion)
        .where(and(eq(schema.paqueteSinConexion.temaId, temaId), eq(schema.paqueteSinConexion.versionContenido, versionContenido)))
        .limit(1);

      return paquete ?? null;
    },

    async guardarPaqueteOffline(datos: {
      temaId: string;
      versionContenido: number;
      tamanoBytes: number;
      manifiesto: Record<string, unknown>;
    }) {
      const [paquete] = await db
        .insert(schema.paqueteSinConexion)
        .values({
          temaId: datos.temaId,
          versionContenido: datos.versionContenido,
          tamanoBytes: datos.tamanoBytes,
          manifiesto: datos.manifiesto,
        })
        .onConflictDoUpdate({
          target: [schema.paqueteSinConexion.temaId, schema.paqueteSinConexion.versionContenido],
          set: {
            tamanoBytes: datos.tamanoBytes,
            manifiesto: datos.manifiesto,
          },
        })
        .returning();

      return paquete ?? null;
    },

    async registrarDescargaOffline(usuarioId: string, paqueteId: string) {
      await db
        .insert(schema.descargaSinConexionUsuario)
        .values({
          usuarioId,
          paqueteId,
          descargadoEn: new Date(),
          ultimoAbiertoEn: null,
        })
        .onConflictDoUpdate({
          target: [schema.descargaSinConexionUsuario.usuarioId, schema.descargaSinConexionUsuario.paqueteId],
          set: { descargadoEn: new Date() },
        });
    }
  };
}

export type ThemesRepository = ReturnType<typeof crearThemesRepository>;
