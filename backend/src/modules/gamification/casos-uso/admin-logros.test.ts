import { describe, expect, it } from "bun:test";
import { crearCasosUsoAdminLogros } from "./admin-logros";

const LOGRO_ID = "11111111-1111-4111-8111-111111111111";

type RepoFalso = Parameters<typeof crearCasosUsoAdminLogros>[0];

function crearRepo(sobreescrituras: Partial<RepoFalso> = {}): RepoFalso {
  let ultimo: any = {
    id: LOGRO_ID,
    codigo: "primer-tema",
    nombre: "Primer tema",
    descripcion: "Completaste tu primer tema",
    urlIcono: "https://cdn.example.com/x.png",
    bonoXp: 30,
    codigoCriterio: "temas_completados",
    valorCriterio: 1,
    activo: true,
    creadoEn: new Date("2026-07-13T00:00:00.000Z"),
  };
  return {
    async listar() {
      return { filas: [{ ...ultimo, otorgados: 5 }], total: 1 };
    },
    async listarOrdenadoPorNombre() {
      return [{ id: ultimo.id, codigo: ultimo.codigo, nombre: ultimo.nombre }];
    },
    async obtener(id: string) {
      return id === ultimo.id ? ultimo : null;
    },
    async buscarPorCodigo(codigo: string) {
      return codigo === ultimo.codigo ? { id: ultimo.id } : null;
    },
    async crear(input) {
      ultimo = { ...ultimo, ...input };
      return ultimo;
    },
    async actualizar(_id, parcial) {
      ultimo = { ...ultimo, ...parcial };
      return ultimo;
    },
    async archivar(_id) {
      ultimo = { ...ultimo, activo: false };
      return { id: ultimo.id, activo: false };
    },
    async reactivar(_id) {
      ultimo = { ...ultimo, activo: true };
      return { id: ultimo.id, activo: true };
    },
    async contarOtorgados() {
      return 5;
    },
    ...sobreescrituras,
  } as RepoFalso;
}

describe("casos de uso administrativos de logros", () => {
  it("lista logros con filtros administrativos", async () => {
    const casos = crearCasosUsoAdminLogros(crearRepo());
    const resultado = await casos.listar({
      estado: "activo",
      criterio: undefined,
      limit: 20,
      offset: 0,
    });
    expect(resultado.logros).toHaveLength(1);
    expect(resultado.logros[0].codigo).toBe("primer-tema");
    expect(resultado.meta.total).toBe(1);
  });

  it("normaliza estado a un filtro de activo opcional", async () => {
    let capturado: { activo?: boolean } | undefined;
    const repo = crearRepo({
      async listar(filtros) {
        capturado = filtros;
        return { filas: [], total: 0 };
      },
    });
    const casos = crearCasosUsoAdminLogros(repo);
    await casos.listar({ estado: "archivado", limit: 10, offset: 0 });
    expect(capturado?.activo).toBe(false);
  });

  it("rechaza la creación cuando el código ya existe", async () => {
    const casos = crearCasosUsoAdminLogros(crearRepo());
    const resultado = await casos.crear(
      {
        codigo: "PRIMER-TEMA",
        nombre: "Otro nombre",
        codigo_criterio: "temas_completados",
        valor_criterio: 1,
        bono_xp: 10,
      },
      "admin-1",
    );
    expect("error" in resultado).toBe(true);
    if ("error" in resultado) {
      expect(resultado.error.codigo).toBe("CODIGO_DUPLICADO");
    }
  });

  it("crea un logro y normaliza el código a minúsculas", async () => {
    let capturado: { codigo: string } | undefined;
    const repo = crearRepo({
      async crear(input) {
        capturado = input;
        return {
          id: LOGRO_ID,
          codigo: input.codigo,
          nombre: input.nombre,
          descripcion: input.descripcion,
          urlIcono: input.urlIcono,
          bonoXp: input.bonoXp,
          codigoCriterio: input.codigoCriterio,
          valorCriterio: input.valorCriterio,
          activo: true,
          creadoEn: new Date(),
        };
      },
    });
    const casos = crearCasosUsoAdminLogros(repo);
    const resultado = await casos.crear(
      {
        codigo: "NUEVO-LOGRO",
        nombre: "Nuevo logro",
        codigo_criterio: "dias_racha",
        valor_criterio: 7,
        bono_xp: 50,
      },
      "admin-1",
    );
    expect(capturado?.codigo).toBe("nuevo-logro");
    if (!("error" in resultado)) {
      expect(resultado.codigo).toBe("nuevo-logro");
    }
  });

  it("actualiza campos parciales sin perder el resto", async () => {
    let actualizado: { bonoXp: number } | undefined;
    const repo = crearRepo({
      async actualizar(_id, parcial) {
        actualizado = parcial as { bonoXp: number };
        return {
          id: LOGRO_ID,
          codigo: "primer-tema",
          nombre: "Otro",
          descripcion: null,
          urlIcono: null,
          bonoXp: parcial.bonoXp ?? 30,
          codigoCriterio: "temas_completados",
          valorCriterio: 1,
          activo: true,
          creadoEn: new Date(),
        };
      },
    });
    const casos = crearCasosUsoAdminLogros(repo);
    await casos.actualizar(LOGRO_ID, { bono_xp: 80 });
    expect(actualizado?.bonoXp).toBe(80);
  });

  it("devuelve NOT_FOUND al actualizar un logro inexistente", async () => {
    const casos = crearCasosUsoAdminLogros(crearRepo({ async obtener() { return null as any; } }));
    const resultado = await casos.actualizar("00000000-0000-4000-8000-000000000000", { bono_xp: 10 });
    expect("error" in resultado).toBe(true);
    if ("error" in resultado) {
      expect(resultado.error.codigo).toBe("NOT_FOUND");
    }
  });

  it("archiva y reactiva un logro", async () => {
    const casos = crearCasosUsoAdminLogros(crearRepo());
    expect(await casos.archivar(LOGRO_ID)).toEqual({ archived: true });
    expect(await casos.reactivar(LOGRO_ID)).toEqual({ reactivated: true });
  });

  it("devuelve el detalle con el conteo de otorgados", async () => {
    const casos = crearCasosUsoAdminLogros(crearRepo());
    const detalle = await casos.obtenerDetalle(LOGRO_ID);
    expect("error" in detalle).toBe(false);
    if (!("error" in detalle)) {
      expect(detalle.otorgados).toBe(5);
    }
  });
});