import { describe, expect, it } from "bun:test";
import { crearReporteClubSchema, resolverReporteClubSchema } from "./moderation.schemas";

describe("schemas de moderación de clubes", () => {
  it("requiere miembro objetivo y categoría cerrada", () => {
    expect(crearReporteClubSchema.safeParse({ categoria: "otro" }).success).toBe(false);
    expect(crearReporteClubSchema.safeParse({ miembro_token: "550e8400-e29b-41d4-a716-446655440000", categoria: "acoso", detalle: "Hecho" }).success).toBe(true);
  });

  it("limita detalle y estados de resolución", () => {
    expect(crearReporteClubSchema.safeParse({ reportado_usuario_id: "550e8400-e29b-41d4-a716-446655440000", categoria: "otro", detalle: "x".repeat(501) }).success).toBe(false);
    expect(resolverReporteClubSchema.safeParse({ estado: "resuelto", nota: "Revisado" }).success).toBe(true);
    expect(resolverReporteClubSchema.safeParse({ estado: "publicado" }).success).toBe(false);
  });
});
