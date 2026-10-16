import { expect, test } from "bun:test";
import { crearMapaIdsLocales, obtenerIdLocal } from "./local-id-map";

test("genera IDs locales distintos y conserva mapeos existentes", () => {
  const mapa = crearMapaIdsLocales(["tema-1", "paso-1"], new Map([["tema-1", "local-tema"]]));
  expect(obtenerIdLocal(mapa, "tema-1")).toBe("local-tema");
  expect(obtenerIdLocal(mapa, "paso-1")).not.toBe("paso-1");
  expect(obtenerIdLocal(mapa, "paso-1")).toMatch(/^[0-9a-f-]{36}$/);
});

test("falla si se intenta resolver un serverId no importado", () => {
  expect(() => obtenerIdLocal(new Map(), "ausente")).toThrow("No existe mapeo local");
});
