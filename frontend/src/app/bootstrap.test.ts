import { describe, expect, it } from "bun:test";
import { ErrorApi } from "@/shared/api/error-api";
import { clasificarErrorVinculacion, resolverRedireccionBootstrap } from "./bootstrap";

describe("clasificarErrorVinculacion", () => {
  it("devuelve conflicto para ErrorApi 409", () => {
    const error = new ErrorApi(
      "El correo an***@gmail.com ya pertenece a otra cuenta",
      409,
      "CONFLICTO",
    );

    const resultado = clasificarErrorVinculacion(error);

    expect(resultado.tipo).toBe("conflicto");
    if (resultado.tipo === "conflicto") {
      expect(resultado.mensaje).toContain("an***@gmail.com");
    }
  });

  it("devuelve error para ErrorApi 401", () => {
    const error = new ErrorApi("No autorizado", 401, "NO_AUTORIZADO");

    const resultado = clasificarErrorVinculacion(error);

    expect(resultado.tipo).toBe("error");
  });

  it("devuelve error para excepciones genericas", () => {
    const resultado = clasificarErrorVinculacion(new Error("red caida"));

    expect(resultado.tipo).toBe("error");
  });
});

describe("resolverRedireccionBootstrap", () => {
  it("conserva la ruta interna de la aplicación para perfiles con onboarding completo", () => {
    expect(
      resolverRedireccionBootstrap("/app/C_conectar/tema-1", "/app"),
    ).toBeNull();
  });

  it("redirige desde login al inicio de la aplicación", () => {
    expect(resolverRedireccionBootstrap("/auth/callback", "/app")).toBe("/app");
  });

  it("prioriza una ruta obligatoria de onboarding", () => {
    expect(
      resolverRedireccionBootstrap("/app/temas/tema-1", "/onboarding"),
    ).toBe("/onboarding");
  });

  it("conserva la ruta interna de administracion para perfiles admin", () => {
    expect(
      resolverRedireccionBootstrap("/admin/temas", "/admin"),
    ).toBeNull();
  });

  it("conserva la ruta de onboarding si ya esta en onboarding", () => {
    expect(
      resolverRedireccionBootstrap("/onboarding/customize", "/onboarding"),
    ).toBeNull();
  });
});
