import { expect, test } from "bun:test";
import { crearSolicitudSubida } from "./restore-storage";
import { validarNombreObjeto } from "./backup-storage";

test("codifica cada segmento de una ruta de Storage", () => {
  const url = crearSolicitudSubida("https://project.supabase.co", "media privada", "tema uno/audio final.mp3");
  expect(url).toBe("https://project.supabase.co/storage/v1/object/media%20privada/tema%20uno/audio%20final.mp3");
});

test("rechaza rutas de objeto con traversal", () => {
  expect(() => validarNombreObjeto("../secreto.txt")).toThrow("STORAGE_OBJECT_PATH_INVALID");
  expect(() => validarNombreObjeto("tema/audio.mp3")).not.toThrow();
});
