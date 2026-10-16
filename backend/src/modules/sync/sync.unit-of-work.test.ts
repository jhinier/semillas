import { describe, expect, it } from "bun:test";
import { crearSyncUnitOfWork } from "./sync.unit-of-work";
import type { SyncRepository } from "./sync.repository";

describe("sync unit of work", () => {
  it("delega en la transacción del repositorio", async () => {
    const eventos: string[] = [];
    const repositorio = {
      ejecutarAtomico: async <T>(operacion: (repo: SyncRepository) => Promise<T>) => {
        eventos.push("begin");
        const resultado = await operacion({} as SyncRepository);
        eventos.push("commit");
        return resultado;
      },
    } as SyncRepository;

    await expect(crearSyncUnitOfWork(repositorio).ejecutar(async () => "ok")).resolves.toBe("ok");
    expect(eventos).toEqual(["begin", "commit"]);
  });

  it("propaga el fallo para que la transacción pueda revertir", async () => {
    const repositorio = { ejecutarAtomico: async <T>(operacion: (repo: SyncRepository) => Promise<T>) => operacion({} as SyncRepository) } as SyncRepository;
    await expect(crearSyncUnitOfWork(repositorio).ejecutar(async () => { throw new Error("proyección inválida"); })).rejects.toThrow("proyección inválida");
  });

  it("permite que el adaptador revierta el evento cuando falla una proyección", async () => {
    const eventos: string[] = [];
    const repositorio = {
      ejecutarAtomico: async <T>(operacion: (repo: SyncRepository) => Promise<T>) => {
        const snapshot = [...eventos];
        try {
          return await operacion({
            registrarEvento: async (_usuarioId, evento) => {
              eventos.push(evento.evento_id_cliente);
              return true;
            },
          } as SyncRepository);
        } catch (error) {
          eventos.splice(0, eventos.length, ...snapshot);
          throw error;
        }
      },
    } as SyncRepository;

    const unidad = crearSyncUnitOfWork(repositorio);
    await expect(unidad.ejecutar(async (repo) => {
      await repo.registrarEvento("usuario-1", { evento_id_cliente: "evento-1" } as never);
      throw new Error("fallo de proyección");
    })).rejects.toThrow("fallo de proyección");
    expect(eventos).toEqual([]);
  });
});
