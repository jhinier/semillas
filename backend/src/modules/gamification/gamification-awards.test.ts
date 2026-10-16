import { describe, expect, it } from "bun:test";
import { reclamarLogro } from "./gamification-awards";

type SelectChain = {
  from(): SelectChain;
  leftJoin(): SelectChain;
  where(): SelectChain;
  limit(): Promise<Array<{ logroId: string; reclamadoEn: Date | null; bonoXp: number; nombre: string; codigo: string }>>;
};

type UpdateChain = {
  set(): UpdateChain;
  where(): UpdateChain;
  returning(): Promise<Array<{ logroId: string }>>;
};

type DbFalsa = {
  transaction<T>(callback: (tx: DbFalsa) => Promise<T>): Promise<T>;
  select(): SelectChain;
  update(): UpdateChain;
  insert(): { values(): Promise<unknown[]> };
  obtenerEventos(): number;
};

function crearDbFalsa() {
  let reclamado = false;
  let eventosInsertados = 0;

  const db: DbFalsa = {
    async transaction<T>(callback: (tx: DbFalsa) => Promise<T>) {
      return callback(db);
    },
    select() {
      const consulta = {
        from() { return consulta; },
        leftJoin() { return consulta; },
        where() { return consulta; },
        async limit() {
          return [{
            logroId: "logro-1",
            reclamadoEn: reclamado ? new Date() : null,
            bonoXp: 25,
            nombre: "Primer paso",
            codigo: "primer-paso",
          }];
        },
      };
      return consulta;
    },
    update() {
      const consulta = {
        set() { return consulta; },
        where() { return consulta; },
        async returning() {
          if (reclamado) return [];
          reclamado = true;
          return [{ logroId: "logro-1" }];
        },
      };
      return consulta;
    },
    insert() {
      return {
        values() {
          eventosInsertados += 1;
          return Promise.resolve([]);
        },
      };
    },
    obtenerEventos() { return eventosInsertados; },
  };

  return db;
}

describe("recompensas de gamificación", () => {
  it("otorga el bono de una insignia una sola vez", async () => {
    const db = crearDbFalsa();

    const primero = await reclamarLogro(db as never, "usuario-1", "logro-1");
    const segundo = await reclamarLogro(db as never, "usuario-1", "logro-1");

    expect(primero).toEqual({ bonoXp: 25, nombre: "Primer paso" });
    expect(segundo).toEqual({ bonoXp: 0, nombre: "Primer paso" });
    expect(db.obtenerEventos()).toBe(1);
  });
});
