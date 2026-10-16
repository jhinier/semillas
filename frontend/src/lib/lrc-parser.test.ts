import { describe, expect, it } from "bun:test";
import { parseLrc, type LineaLRC } from "./lrc-parser";

describe("parseLrc", () => {
  it("parsea LRC valido", () => {
    const letra = "[00:12.00]Hola mundo\n[00:15.50]Esto es una prueba";
    const resultado = parseLrc(letra);
    expect(resultado).toHaveLength(2);
    expect(resultado[0]!.texto).toBe("Hola mundo");
    expect(resultado[0]!.tiempo).toBe(12000);
    expect(resultado[1]!.texto).toBe("Esto es una prueba");
    expect(resultado[1]!.tiempo).toBe(15500);
  });

  it("retorna array vacio para letra vacia", () => {
    expect(parseLrc("")).toHaveLength(0);
  });

  it("ignora lineas sin timestamp", () => {
    const letra = "Hola mundo\n[00:05.00]Adios";
    const resultado = parseLrc(letra);
    expect(resultado).toHaveLength(1);
    expect(resultado[0]!.texto).toBe("Adios");
  });

  it("parsea timestamp a cero", () => {
    const letra = "[00:00.00]Inicio";
    const resultado = parseLrc(letra);
    expect(resultado).toHaveLength(1);
    expect(resultado[0]!.tiempo).toBe(0);
    expect(resultado[0]!.texto).toBe("Inicio");
  });

  it("ordena lineas por tiempo ascendente", () => {
    const letra = "[00:10.00]Segunda\n[00:05.00]Primera\n[00:15.00]Tercera";
    const resultado = parseLrc(letra);
    expect(resultado[0]!.texto).toBe("Primera");
    expect(resultado[1]!.texto).toBe("Segunda");
    expect(resultado[2]!.texto).toBe("Tercera");
  });

  it("maneja centesimas con 3 digitos", () => {
    const letra = "[00:01.123]Tres digitos";
    const resultado = parseLrc(letra);
    expect(resultado[0]!.tiempo).toBe(1123);
  });

  it("maneja centesimas con 2 digitos", () => {
    const letra = "[00:01.50]Dos digitos";
    const resultado = parseLrc(letra);
    expect(resultado[0]!.tiempo).toBe(1500);
  });

  it("recorta espacios en blanco del texto", () => {
    const letra = "[00:01.00]   Texto con espacios   ";
    const resultado = parseLrc(letra);
    expect(resultado[0]!.texto).toBe("Texto con espacios");
  });

  it("retorna array vacio para texto sin timestamps validos", () => {
    const letra = "[hola]\n[00:00:00]tampoco\nno es valido";
    const resultado = parseLrc(letra);
    expect(resultado).toHaveLength(0);
  });
});
