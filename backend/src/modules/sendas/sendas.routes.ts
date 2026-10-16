/**
 * ============================================================
 * MÓDULO DE SENDAS
 * ============================================================
 *
 * Este módulo maneja las rutas relacionadas con las sendas
 * espirituales: Padre, Hijo y Espíritu Santo.
 *
 * ENDPOINTS:
 * - GET /sendas - Lista todas las sendas activas
 *
 * @module modules/sendas
 */

import { Hono } from "hono";
import type { Context } from "hono";
import type { AppBindings } from "../../config/env";
import { responderExito } from "../../shared/http/respuesta";
import type { DbClient } from "../../db/client";
import { crearSendasRepository } from "./sendas.repository";
import { crearCasosUsoSendas } from "./sendas.use-cases";

/**
 * Rutas de Sendas
 * Agrupa todos los endpoints relacionados con sendas
 */
type Dependencias = {
  db?: DbClient;
};

export function crearModuloSendas({ db }: Dependencias = {}) {
  const sendasRoutes = new Hono<AppBindings>();

  function obtenerCasosUso(c: Context<AppBindings>) {
    const cliente = db ?? c.get("drizzle");
    if (!cliente) throw new Error("Cliente Drizzle no disponible");
    const repositorio = crearSendasRepository(cliente);
    return crearCasosUsoSendas(repositorio);
  }

/**
 * GET /sendas
 *
 * Lista todas las sendas espirituales activas ordenadas por orden.
 * No requiere autenticación.
 *
 * @returns Lista de sendas activas
 */
  sendasRoutes.get("/", async (c) => {
    return responderExito(await obtenerCasosUso(c).listarActivas());
  });

  return sendasRoutes;
}

export const sendasRoutes = crearModuloSendas();
