import { describe, expect, it } from "bun:test";

import { validarContenidoCrecer } from "../../hooks/use-theme-crecer-page";
import { sincronizarMarkdown } from "./editor-markdown.helpers";

describe("validarContenidoCrecer", () => {
  it("rechaza un título de menos de dos caracteres después de quitar espacios", () => {
    expect(validarContenidoCrecer(" a ", "Contenido válido")).toBe(
      "El título debe tener al menos 2 caracteres",
    );
  });

  it("rechaza un cuerpo de menos de cinco caracteres después de quitar espacios", () => {
    expect(validarContenidoCrecer("Título", "  abc ")).toBe(
      "El contenido debe tener al menos 5 caracteres",
    );
  });

  it("rechaza un título de más de 120 caracteres", () => {
    expect(validarContenidoCrecer("a".repeat(121), "Contenido válido")).toBe(
      "El título no puede superar 120 caracteres",
    );
  });
});

describe("sincronizarMarkdown", () => {
  it("reemplaza el documento del editor cuando cambia el contenido seleccionado", () => {
    const documentos: string[] = [];

    sincronizarMarkdown(
      { setMarkdown: (markdown) => documentos.push(markdown) },
      "# Nuevo contenido",
    );

    expect(documentos).toEqual(["# Nuevo contenido"]);
  });
});
