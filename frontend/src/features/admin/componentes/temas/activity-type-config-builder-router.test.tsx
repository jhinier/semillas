import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ActivityTypeConfigBuilder } from "./activity-type-config-builder";

describe("ActivityTypeConfigBuilder", () => {
  const render = (codigo: string, config: Record<string, unknown> = {}) =>
    renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo={codigo}
        configuracion={config}
        onChange={() => {}}
        onUpload={() => {}}
        resources={[]}
        uploading={false}
      />,
    );

  it("mensaje cuando no hay tipo seleccionado", () => {
    const html = render("");
    expect(html).toContain("Selecciona un tipo");
  });

  it("muestra rompecabezas como selector de imagen", () => {
    const html = render("rompecabezas");
    expect(html).toContain("Elegir imagen");
    expect(html).toContain("Abrir biblioteca");
  });

  it("muestra video con selector de biblioteca", () => {
    const html = render("actividad_video");
    expect(html).toContain("Elegir video");
  });

  it("muestra cuestionario con editor de opciones", () => {
    const html = render("cuestionario", {
      opciones: [
        { id: "op-1", texto: "A", correcta: true },
        { id: "op-2", texto: "B", correcta: false },
      ],
    });

    expect(html).toContain("Opciones");
    expect(html).toContain("Agregar opción");
    expect(html).toContain("Correcta");
  });

  it("muestra audio con selector de biblioteca", () => {
    const html = render("actividad_audio");
    expect(html).toContain("Elegir audio");
  });

  it("muestra cancion con selector de audio", () => {
    const html = render("cancion");
    expect(html).toContain("Elegir audio");
  });

  it("muestra verdadero_falso con afirmaciones", () => {
    const html = render("verdadero_falso", { afirmaciones: [] });
    expect(html).toContain("Afirmaciones");
  });

  it("muestra relacionar_pares con pares", () => {
    const html = render("relacionar_pares", { pares: [] });
    expect(html).toContain("Pares para relacionar");
  });

  it("muestra tarjetas_memoria con tarjetas", () => {
    const html = render("tarjetas_memoria", { pares: [] });
    expect(html).toContain("Tarjetas de memoria");
  });

  it("muestra sopa_letras con palabras", () => {
    const html = render("sopa_letras", { palabras: [], filas: 12, columnas: 12 });
    expect(html).toContain("Palabras");
    expect(html).toContain("Filas");
    expect(html).toContain("Columnas");
  });

  it("muestra manualidad con materiales y pasos", () => {
    const html = render("manualidad", { materiales: [], pasos: [] });
    expect(html).toContain("Materiales");
    expect(html).toContain("Pasos");
  });

  it("muestra arrastrar_soltar con secuencia", () => {
    const html = render("arrastrar_soltar", { items: [] });
    expect(html).toContain("Secuencia correcta");
  });

  it("muestra aventura_decisiones con escenas", () => {
    const html = render("aventura_decisiones", {
      escenas: [{
        id: "escena-1",
        texto: "Llegaste al río",
        imagen_url: "",
        opciones: [{ id: "op-1", texto: "Opción", correcta: true }],
      }],
    });
    expect(html).toContain("Escena 1");
  });

  it("tipo desconocido no muestra error", () => {
    const html = render("tipo_inexistente");
    expect(html).not.toContain("Error");
    expect(html).toContain("no requiere campos adicionales");
  });
});
