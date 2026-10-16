import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { responderExito } from "../../shared/http/respuesta";
import type { DbClient } from "../../db/client";
import { crearCatalogRepository } from "./catalog.repository";
import { crearCasosUsoCatalogo } from "./catalog.use-cases";

type Dependencias = {
  db?: DbClient;
};

export function crearModuloCatalogo({ db }: Dependencias = {}) {
  const catalogRoutes = new Hono<AppBindings>();

  function obtenerCasosUso(c: Context<AppBindings>) {
    const cliente = db ?? c.get("drizzle");
    if (!cliente) throw new Error("Cliente Drizzle no disponible");
    const repositorio = crearCatalogRepository(cliente);
    return crearCasosUsoCatalogo(repositorio);
  }

  catalogRoutes.get("/grupos-etarios", async (c) => {
    return responderExito(await obtenerCasosUso(c).listarGruposEtarios(c.env.SUPABASE_URL));
  });

  catalogRoutes.get("/tipos-actividad", async (c) => {
    return responderExito(await obtenerCasosUso(c).listarTiposActividad());
  });

  catalogRoutes.get("/libros-biblicos", async (c) => {
    return responderExito(await obtenerCasosUso(c).listarLibrosBiblicos());
  });

  catalogRoutes.get("/versiones-biblicas", async (c) => {
    return responderExito(await obtenerCasosUso(c).listarVersionesBiblicas());
  });

  catalogRoutes.get("/pasos-crecer", async (c) => {
    return responderExito(await obtenerCasosUso(c).listarPasosCrecer());
  });

  return catalogRoutes;
}

export const catalogRoutes = crearModuloCatalogo();
