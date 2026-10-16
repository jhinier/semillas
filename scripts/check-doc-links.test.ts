import { expect, test } from "bun:test";
import { validarEnlacesMarkdown } from "./check-doc-links";

test("detecta un enlace interno roto", () => {
  const errores = validarEnlacesMarkdown(process.cwd(), ["docs/estado-docs.md"]);
  expect(errores).toEqual([]);
});

test("rechaza un documento canónico inexistente", () => {
  expect(validarEnlacesMarkdown(process.cwd(), ["docs/no-existe.md"])[0].mensaje).toBe("Documento canónico inexistente");
});
