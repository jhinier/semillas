import { expect, test } from "bun:test";
import { claveSyncState, perteneceAlScope } from "./user-scope";

test("solo acepta registros del scope activo", () => {
  expect(perteneceAlScope("invitado:a", "invitado:a")).toBe(true);
  expect(perteneceAlScope("invitado:a", "usuario:b")).toBe(false);
  expect(perteneceAlScope(undefined, "invitado:a")).toBe(false);
});

test("mantiene el estado de sincronización separado por cuenta", () => {
  expect(claveSyncState("invitado:a")).toBe("sync:invitado:a");
  expect(claveSyncState("usuario:b")).not.toBe(claveSyncState("invitado:a"));
});
