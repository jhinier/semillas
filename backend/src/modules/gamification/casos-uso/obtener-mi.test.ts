import { describe, expect, it } from "bun:test";
import { crearCasoObtenerMiGamificacion } from "./obtener-mi";

const USUARIO_ID = "11111111-1111-4111-8111-111111111111";
type RepoFalso = Parameters<typeof crearCasoObtenerMiGamificacion>[0];

function crearRepo(): RepoFalso {
  return {
    async obtenerNivelUsuario() {
      return { usuario_id: USUARIO_ID, xp_total: 125, numero_nivel: 2, nombre_nivel: "Explorador" };
    },
    async listarLogrosUsuario() {
      return [
        {
          usuario_id: USUARIO_ID,
          logro_id: "22222222-2222-4222-8222-222222222222",
          ganado_en: new Date("2026-07-12T00:00:00.000Z"),
          reclamado_en: null,
          logro: {
            id: "22222222-2222-4222-8222-222222222222",
            codigo: "primer-tema",
            nombre: "Primer tema",
            descripcion: "Completaste un tema",
            codigoCriterio: "temas_completados",
            valorCriterio: 1,
            bonoXp: 20,
            urlIcono: null,
            activo: true,
            creadoEn: new Date("2026-07-01T00:00:00.000Z"),
          },
        },
      ];
    },
    async contarLogrosPendientesReclamar() {
      return 1;
    },
    async listarReglasNivel() {
      return [
        { id: "nivel-2", numeroNivel: 2, nombre: "Explorador", xpMinima: 100, colorInsignia: null },
        { id: "nivel-3", numeroNivel: 3, nombre: "Guía", xpMinima: 250, colorInsignia: null },
      ];
    },
    async obtenerRachaUsuario() {
      return { actual: 3, mejor: 5 };
    },
    async reclamarLogro() {
      return null;
    },
  } as RepoFalso;
}

describe("caso de uso de gamificación propia", () => {
  it("devuelve nivel, reglas, racha y logros serializados", async () => {
    const resultado = await crearCasoObtenerMiGamificacion(crearRepo())(USUARIO_ID);

    expect(resultado.nivel?.xp_total).toBe(125);
    expect(resultado.reglas_nivel).toEqual([
      { numero_nivel: 2, nombre: "Explorador", xp_minima: 100 },
      { numero_nivel: 3, nombre: "Guía", xp_minima: 250 },
    ]);
    expect(resultado.racha).toEqual({ actual: 3, mejor: 5 });
    expect(resultado.logros[0]?.logro?.codigo).toBe("primer-tema");
    expect(resultado.pendientes_reclamar).toBe(1);
  });
});
