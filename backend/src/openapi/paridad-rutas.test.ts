import { describe, expect, it } from "bun:test";
import app from "../app";
import { openApiSpec } from "./spec";

const rutasCanónicas = [
  ["get", "/health"],
  ["post", "/autenticacion/invitado"],
  ["get", "/perfil"],
  ["patch", "/perfil/actualizar"],
  ["get", "/sendas"],
  ["get", "/temas"],
  ["get", "/temas/{tema_id}"],
  ["get", "/temas/{tema_id}/pasos"],
  ["get", "/temas/{tema_id}/actividades"],
  ["get", "/actividades/{actividad_id}"],
  ["post", "/actividades/{actividad_id}/responder"],
  ["post", "/progreso/eventos"],
  ["get", "/progreso/mi"],
  ["post", "/sync/push"],
  ["get", "/sync/pull"],
  ["get", "/gamificacion/mi"],
  ["post", "/gamificacion/logros/{logro_id}/reclamar"],
  ["get", "/clubes/mios"],
  ["post", "/clubes"],
  ["post", "/clubes/unirse"],
  ["get", "/administracion/resumen"],
  ["post", "/administracion/temas"],
  ["post", "/administracion/temas/{tema_id}/publicar"],
  ["get", "/media"],
  ["post", "/media/subir"],
] as const;

describe("paridad del contrato OpenAPI", () => {
  it("declara todas las rutas canónicas usadas por los módulos", () => {
    const paths = openApiSpec.paths as Record<string, Record<string, unknown>>;
    const normalizar = (path: string) => path.replace(/:([^/]+)/g, "{param}").replace(/\{[^}]+\}/g, "{param}");
    for (const [metodo, ruta] of rutasCanónicas) {
      expect([...Object.entries(paths)].some(([path, operaciones]) => normalizar(path) === normalizar(ruta) && operaciones[metodo]), `${metodo.toUpperCase()} ${ruta}`).toBe(true);
    }
  });

  it("no deja operaciones Hono sin documentar", () => {
    const normalizar = (path: string) => path.replace(/:([^/]+)/g, "{param}").replace(/\{[^}]+\}/g, "{param}");
    const documentadas = new Set(
      Object.entries(openApiSpec.paths as Record<string, Record<string, unknown>>).flatMap(([path, operaciones]) =>
        Object.keys(operaciones).filter((metodo) => metodo !== "parameters").map((metodo) => `${metodo} ${normalizar(path)}`),
      ),
    );
    const ignoradas = new Set(["/", "/docs", "/openapi.json"]);
    const faltantes = app.routes
      .filter((ruta) => ruta.method !== "ALL" && !ruta.path.includes("/*") && !ignoradas.has(ruta.path))
      .map((ruta) => `${ruta.method.toLowerCase()} ${normalizar(ruta.path)}`)
      .filter((operacion) => !documentadas.has(operacion));

    expect(faltantes).toEqual([]);
  });

  it("no publica alias legacy en el contrato", () => {
    const paths = Object.keys(openApiSpec.paths as Record<string, unknown>);
    expect(paths.some((path) => /^\/(auth|me|themes|activities|progress|gamification)(\/|$)/.test(path))).toBe(false);
  });
});
