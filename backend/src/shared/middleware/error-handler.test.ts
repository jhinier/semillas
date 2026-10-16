import { describe, expect, it, spyOn } from "bun:test";
import { Hono } from "hono";
import type { AppBindings } from "../../config/env";
import { HttpError } from "../errors/http-error";
import { ErrorAplicacion, ErrorConflicto } from "../errores/error-aplicacion";
import { errorHandler } from "./error-handler";

const ENTORNO_TEST = {
  APP_ENV: "test",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://ejemplo.supabase.co",
  SUPABASE_ANON_KEY: "anon-key-de-prueba",
  SUPABASE_SERVICE_ROLE_KEY: "service-key-de-prueba"
};

describe("errorHandler", () => {
  it("expone el detalle de HttpError en la respuesta", async () => {
    const app = new Hono<AppBindings>();

    app.get("/", () => {
      throw new HttpError(409, "Conflicto", "CONFLICT", {
        recurso: "tema"
      });
    });

    app.onError(errorHandler);

    const response = await app.fetch(new Request("http://localhost/"), ENTORNO_TEST);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      exito: false,
      error: "Conflicto",
      codigo: "CONFLICT",
      detalle: {
        recurso: "tema"
      }
    });
  });

  it("expone el detalle de ErrorAplicacion en la respuesta", async () => {
    const app = new Hono<AppBindings>();

    app.get("/", () => {
      throw new ErrorConflicto("Dato duplicado", { campo: "correo" });
    });

    app.onError(errorHandler);

    const response = await app.fetch(new Request("http://localhost/"), ENTORNO_TEST);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      exito: false,
      error: "Dato duplicado",
      codigo: "CONFLICTO",
      detalle: { campo: "correo" }
    });
  });

  it("maneja errores desconocidos como error interno", async () => {
    const app = new Hono<AppBindings>();

    app.get("/", () => {
      throw new Error("Algo inesperado");
    });

    app.onError(errorHandler);

    const response = await app.fetch(new Request("http://localhost/"), ENTORNO_TEST);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      exito: false,
      error: "Error interno del servidor",
      codigo: "INTERNAL_SERVER_ERROR"
    });
  });

  it("no expone secretos, hosts ni stack en errores desconocidos", async () => {
    const app = new Hono<AppBindings>();
    app.get("/", () => {
      throw new Error("password=secreto host=db-interno stack=privado");
    });
    app.onError(errorHandler);

    const response = await app.fetch(new Request("http://localhost/"), ENTORNO_TEST);
    const cuerpo = await response.text();
    expect(cuerpo).not.toContain("secreto");
    expect(cuerpo).not.toContain("db-interno");
    expect(cuerpo).not.toContain("stack");
  });

  it("registra la causa de PostgreSQL sin exponerla al cliente", async () => {
    const app = new Hono<AppBindings>();
    const registrarError = spyOn(console, "error").mockImplementation(() => {});
    const causa = Object.assign(new Error('relation "grupo_edad" does not exist'), { code: "42P01" });

    app.get("/", () => {
      throw new Error("Failed query", { cause: causa });
    });
    app.onError(errorHandler);

    const response = await app.fetch(new Request("http://localhost/"), ENTORNO_TEST);

    expect(registrarError).toHaveBeenCalledWith("Unhandled request error", expect.objectContaining({
      causeCode: "42P01",
      causeMessage: 'relation "grupo_edad" does not exist'
    }));
    await expect(response.json()).resolves.toEqual({
      exito: false,
      error: "Error interno del servidor",
      codigo: "INTERNAL_SERVER_ERROR"
    });
    registrarError.mockRestore();
  });
});
