import { expect, test } from "bun:test";
import { migrarInvitadoSiCorresponde } from "./migracion-invitado";

test("vincula antes de limpiar la sesión invitada", async () => {
  const eventos: string[] = [];
  await expect(migrarInvitadoSiCorresponde({
    guestUserId: "guest-1", accessToken: "token", vincularCuenta: async () => { eventos.push("vincular"); }, limpiarSesionInvitado: () => eventos.push("limpiar"),
  })).resolves.toBe("vinculada");
  expect(eventos).toEqual(["vincular", "limpiar"]);
});

test("conserva la sesión si la vinculación falla", async () => {
  let limpio = false;
  await expect(migrarInvitadoSiCorresponde({
    guestUserId: "guest-1", accessToken: "token", vincularCuenta: async () => { throw new Error("conflicto"); }, limpiarSesionInvitado: () => { limpio = true; },
  })).rejects.toThrow("conflicto");
  expect(limpio).toBe(false);
});

test("no hace nada cuando no hay guest pendiente", async () => {
  let vinculado = false;
  await expect(migrarInvitadoSiCorresponde({ guestUserId: null, accessToken: null, vincularCuenta: async () => { vinculado = true; }, limpiarSesionInvitado: () => undefined })).resolves.toBe("sin-pendiente");
  expect(vinculado).toBe(false);
});
