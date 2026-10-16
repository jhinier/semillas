import { describe, expect, it } from "bun:test";
import { crearCasoModeracionClub } from "./casos-uso/moderation";

function repo(overrides: Record<string, unknown> = {}) {
  return {
    obtenerClub: async () => ({ activo: true }),
    obtenerMembresia: async () => ({ rolMiembro: "miembro" }),
    obtenerMembresiaPorToken: async () => ({ usuarioId: "user-2" }),
    contarReportesRecientes: async () => 0,
    crearReporte: async (input: unknown) => input,
    obtenerReporte: async () => ({ id: "r1" }),
    resolverReporte: async (_id: string, input: unknown) => input,
    listarReportes: async () => [],
    ...overrides,
  };
}

describe("moderación de clubes", () => {
  it("permite reportar a miembros y limita abuso", async () => {
    const caso = crearCasoModeracionClub(repo());
    const reporte = await caso.reportar("club-1", "user-1", { miembro_token: "550e8400-e29b-41d4-a716-446655440002", categoria: "otro" });
    expect(reporte).toMatchObject({ clubId: "club-1", reportadoPor: "user-1" });

    const limitado = crearCasoModeracionClub(repo({ contarReportesRecientes: async () => 5 }));
    await expect(limitado.reportar("club-1", "user-1", { miembro_token: "550e8400-e29b-41d4-a716-446655440002", categoria: "otro" })).resolves.toMatchObject({ error: { estado: 429 } });
  });

  it("rechaza reportes de quienes no pertenecen al club", async () => {
    const caso = crearCasoModeracionClub(repo({ obtenerMembresia: async () => null }));
    await expect(caso.reportar("club-1", "user-1", { miembro_token: "550e8400-e29b-41d4-a716-446655440002", categoria: "acoso" })).resolves.toMatchObject({ error: { estado: 403 } });
  });

  it("rechaza resolver un reporte ya cerrado", async () => {
    const caso = crearCasoModeracionClub(repo({ obtenerReporte: async () => ({ id: "r1", estado: "resuelto" }) }));
    await expect(caso.resolver("r1", { estado: "descartado" }, "admin-1")).resolves.toMatchObject({ error: { estado: 409 } });
  });
});
