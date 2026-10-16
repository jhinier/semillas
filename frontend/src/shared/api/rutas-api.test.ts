import { expect, test } from "bun:test";
import { RUTAS_API } from "./rutas-api";

test("construye rutas canónicas y codifica identificadores", () => {
  expect(RUTAS_API.PERFIL.VINCULAR_CUENTA).toBe("/perfil/vincular-cuenta");
  expect(RUTAS_API.CLUBES.DETALLE("club con espacio")).toBe("/clubes/club%20con%20espacio");
  expect(RUTAS_API.MEDIA.VER("recurso/a")).toBe("/media/recurso%2Fa");
});
