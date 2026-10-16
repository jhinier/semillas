import { expect, test } from "bun:test";
import { db } from "./db";

test("la versión vigente conserva índices de identidad offline", () => {
  expect(db.verno).toBe(5);
  expect(db.progresoUsuario.schema.indexes.map((index) => index.name)).toContain("scopeId");
  expect(db.perfil.schema.indexes.map((index) => index.name)).toContain("scopeId");
  expect(db.syncState.schema.indexes.map((index) => index.name)).toContain("scopeId");
  expect(db.mediaReferences.schema.indexes.map((index) => index.name)).toContain("temaLocalId");
});
