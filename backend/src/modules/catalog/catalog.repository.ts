import { asc, eq } from "drizzle-orm";
import type { DbClient } from "../../db/client";
import { schema } from "../../db/client";

type CatalogRepositoryDb = DbClient;

export function crearCatalogRepository(db: CatalogRepositoryDb) {
  return {
    async listarGruposEtarios() {
      return db
        .select({
          id: schema.grupoEdad.id,
          codigo: schema.grupoEdad.codigo,
          nombre: schema.grupoEdad.nombre,
          edad_minima: schema.grupoEdad.edadMinima,
          edad_maxima: schema.grupoEdad.edadMaxima,
          descripcion: schema.grupoEdad.descripcion,
          orden: schema.grupoEdad.orden
        })
        .from(schema.grupoEdad)
        .orderBy(asc(schema.grupoEdad.orden));
    },

    async listarTiposActividad() {
      return db
        .select({
          id: schema.tipoActividad.id,
          codigo: schema.tipoActividad.codigo,
          nombre: schema.tipoActividad.nombre,
          descripcion: schema.tipoActividad.descripcion,
          es_juego: schema.tipoActividad.esJuego
        })
        .from(schema.tipoActividad)
        .where(eq(schema.tipoActividad.activo, true))
        .orderBy(asc(schema.tipoActividad.nombre));
    },

    async listarLibrosBiblicos() {
      return db
        .select({
          id: schema.libroBiblico.id,
          nombre: schema.libroBiblico.nombre,
          orden: schema.libroBiblico.orden,
          testamento_id: schema.libroBiblico.testamentoId
        })
        .from(schema.libroBiblico)
        .orderBy(asc(schema.libroBiblico.orden));
    },

    async listarVersionesBiblicas() {
      return db
        .select({
          id: schema.versionBiblica.id,
          codigo: schema.versionBiblica.codigo,
          nombre: schema.versionBiblica.nombre,
          dominio_publico: schema.versionBiblica.dominioPublico
        })
        .from(schema.versionBiblica)
        .orderBy(asc(schema.versionBiblica.codigo));
    },

    async listarPasosCrecer() {
      return db
        .select({
          id: schema.tipoPasoCrecer.id,
          codigo: schema.tipoPasoCrecer.codigo,
          nombre: schema.tipoPasoCrecer.nombre,
          descripcion: schema.tipoPasoCrecer.descripcion,
          orden: schema.tipoPasoCrecer.orden,
          color_hex: schema.tipoPasoCrecer.colorHex
        })
        .from(schema.tipoPasoCrecer)
        .orderBy(asc(schema.tipoPasoCrecer.orden));
    }
  };
}
