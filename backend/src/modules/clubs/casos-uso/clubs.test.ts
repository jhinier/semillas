import { describe, expect, test } from "bun:test";
import { crearCasosUsoClubs } from "./clubs";

function crearRepositorio(overrides: Record<string, unknown> = {}) {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const base = {
    listarMisClubes: async () => [],
    listarClubes: async () => [],
    obtenerMembresia: async () => ({ rolMiembro: "lider", unidoEn: new Date() }),
    obtenerClub: async () => null,
    obtenerCreadorClub: async () => null,
    listarMiembrosClub: async () => [],
    buscarCodigoInvitacion: async () => null,
    crearClub: async () => ({
      id: "club-1",
      nombre: "Club",
      descripcion: null,
      codigoInvitacion: "ABCDEFGH",
      creadoPor: "user-1",
      activo: true,
      creadoEn: new Date(),
    }),
    actualizarClub: async () => null,
    actualizarCodigoInvitacion: async () => null,
    agregarMiembro: async () => ({ clubId: "club-1", usuarioId: "user-1", rolMiembro: "lider", unidoEn: new Date() }),
    eliminarClub: async () => undefined,
    contarMiembrosClub: async () => 2,
    eliminarMiembro: async (...args: unknown[]) => { calls.push({ method: "eliminarMiembro", args }); },
    actualizarRolMiembro: async (...args: unknown[]) => {
      calls.push({ method: "actualizarRolMiembro", args });
      return { clubId: args[1], usuarioId: args[0], rolMiembro: args[2], unidoEn: new Date() };
    },
    desactivarClub: async () => null,
    obtenerRanking: async () => [],
    listarRetos: async () => [],
    obtenerReto: async () => null,
    obtenerRecompensaReto: async () => null,
    reclamarRecompensaReto: async () => true,
    crearReto: async () => ({ id: "reto-1" }),
    calcularProgresoReto: async () => ({ total: 0, aporteUsuario: 0 }),
    obtenerClubPorCodigo: async () => null,
    contarMiembrosPorClub: async () => [],
    ...overrides,
  };
  return { repo: base as any, calls };
}

describe("clubes", () => {
  test("transfiere el liderazgo a otro miembro", async () => {
    const { repo, calls } = crearRepositorio({
      obtenerMembresia: async (userId: string) => ({
        rolMiembro: userId === "lider-1" ? "lider" : "miembro",
        unidoEn: new Date(),
      }),
    });
    const casos = crearCasosUsoClubs(repo);

    const result = await casos.transferirLiderazgo("club-1", "member-2", "lider-1");

    expect(result).toEqual({ transferred: true, usuario_id: "member-2" });
    expect(calls).toEqual([
      { method: "actualizarRolMiembro", args: ["member-2", "club-1", "lider"] },
      { method: "actualizarRolMiembro", args: ["lider-1", "club-1", "miembro"] },
    ]);
  });

  test("calcula porcentaje y aporte de un reto", async () => {
    const now = new Date();
    const { repo } = crearRepositorio({
      obtenerClub: async () => ({ activo: true }),
      listarRetos: async () => [{
        id: "reto-1",
        clubId: "club-1",
        nombre: "10 actividades",
        descripcion: null,
        codigoMetrica: "actividades_completadas",
        valorObjetivo: 10,
        xpReto: 100,
        fechaInicio: now,
        fechaFin: new Date(now.getTime() + 86400000),
        creadoPor: "lider-1",
        creadoEn: now,
      }],
      calcularProgresoReto: async () => ({ total: 6, aporteUsuario: 2 }),
    });
    const casos = crearCasosUsoClubs(repo);

    const retos = await casos.listarRetos("club-1", "user-1");
    const reto = Array.isArray(retos) ? retos[0] : undefined;

    expect(reto?.porcentaje).toBe(60);
    expect(reto?.miAporte).toBe(2);
    expect(reto?.completado).toBe(false);
  });

  test("impide que un miembro retire a otra persona", async () => {
    const { repo } = crearRepositorio({
      obtenerMembresia: async () => ({ rolMiembro: "miembro", unidoEn: new Date() }),
    });
    const casos = crearCasosUsoClubs(repo);

    const result = await casos.quitarMiembro("club-1", "member-2", "member-1");

    expect("error" in result).toBe(true);
  });
  test("reclama una recompensa solo cuando el reto está completo", async () => {
    const now = new Date();
    const { repo } = crearRepositorio({
      obtenerClub: async () => ({ activo: true }),
      obtenerReto: async () => ({
        id: "reto-1", clubId: "club-1", nombre: "Meta", descripcion: null,
        codigoMetrica: "xp_grupal", valorObjetivo: 100, xpReto: 50,
        fechaInicio: now, fechaFin: new Date(now.getTime() + 86400000),
        creadoPor: "leader", creadoEn: now,
      }),
      calcularProgresoReto: async () => ({ total: 100, aporteUsuario: 20 }),
      reclamarRecompensaReto: async () => true,
    });
    const casos = crearCasosUsoClubs(repo);

    const result = await casos.reclamarReto("club-1", "reto-1", "user-1");

    expect(result).toEqual({ reclamado: true, ya_reclamada: false, xp_otorgada: 50 });
  });

});
