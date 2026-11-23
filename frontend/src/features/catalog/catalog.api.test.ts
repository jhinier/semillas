import { describe, expect, it } from "bun:test";

import {
  normalizarLibrosCatalogo,
  obtenerNombreLibroBiblico,
  resolverLibroPorDefectoId,
} from "./catalog.api";

describe("catálogo de libros bíblicos", () => {
  it("conserva los IDs reales de base de datos (id o codigo), ordena por orden canónico y resuelve Juan correctamente", () => {
    const libros = normalizarLibrosCatalogo([
      { codigo: "43", nombre: "2 Juan", orden: 63, testamento_id: 2 },
      { codigo: "63", nombre: "Juan", orden: 43, testamento_id: 2 },
      { id: 39, nombre: "Génesis", orden: 1, testamento_id: 1 },
    ]);

    expect(libros.map((l) => l.nombre)).toEqual(["Génesis", "Juan", "2 Juan"]);
    expect(libros[0]).toMatchObject({ id: 39, testamento: "AT", abreviatura: "Gn" });
    expect(libros[1]).toMatchObject({ id: 63, testamento: "NT", abreviatura: "Jn" });
    expect(obtenerNombreLibroBiblico(63, libros)).toBe("Juan");
    expect(obtenerNombreLibroBiblico(43, libros)).toBe("2 Juan");
    expect(resolverLibroPorDefectoId(libros)).toBe(63);
  });
});
