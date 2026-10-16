import { expect, test } from "bun:test";
import { limpiarDatosSesionOffline } from "./logout-cleanup";

test("limpia datos privados y no elimina caches públicas", async () => {
  const limpiadas: string[] = [];
  const cachesEliminadas: string[] = [];
  let queriesLimpias = false;
  await limpiarDatosSesionOffline({
    clearOfflineTables: [async () => { limpiadas.push("perfil"); }, async () => { limpiadas.push("outbox"); }],
    listCacheNames: async () => ["semillas-user-api-v1", "semillas-public-api-v1", "semillas-offline-media-v1"],
    deleteCache: async (nombre) => { cachesEliminadas.push(nombre); return true; },
    clearQueries: () => { queriesLimpias = true; },
  });
  expect(limpiadas).toEqual(["perfil", "outbox"]);
  expect(cachesEliminadas).toEqual(["semillas-user-api-v1", "semillas-offline-media-v1"]);
  expect(queriesLimpias).toBe(true);
});
