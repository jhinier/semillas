import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ListaOpcionesConCorrecta, ListaOpcionesTexto } from "./activity-config-list-editors";
import type { OpcionConCorrecta } from "./activity-config-list-editors";

describe("ListaOpcionesConCorrecta", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza opciones proporcionadas con texto", () => {
    const opciones: OpcionConCorrecta[] = [
      { id: "op-1", texto: "Opción A", correcta: true },
      { id: "op-2", texto: "Opción B", correcta: false },
    ];
    const html = render(<ListaOpcionesConCorrecta titulo="Opciones" opciones={opciones} etiquetaAgregar="Agregar" onChange={() => {}} />);
    expect(html).toContain("Opción A");
    expect(html).toContain("Opción B");
  });

  it("usa radio buttons para marcar la correcta", () => {
    const opciones: OpcionConCorrecta[] = [
      { id: "op-1", texto: "A", correcta: true },
      { id: "op-2", texto: "B", correcta: false },
    ];
    const html = render(<ListaOpcionesConCorrecta titulo="Opciones" opciones={opciones} etiquetaAgregar="Agregar" onChange={() => {}} />);
    const radioButtons = html.match(/type="radio"/g);
    expect(radioButtons).toHaveLength(2);
  });

  it("marca la opción correcta con atributo checked", () => {
    const opciones: OpcionConCorrecta[] = [
      { id: "op-1", texto: "A", correcta: false },
      { id: "op-2", texto: "B", correcta: true },
    ];
    const html = render(<ListaOpcionesConCorrecta titulo="Opciones" opciones={opciones} etiquetaAgregar="Agregar" onChange={() => {}} />);
    expect(html).toContain("checked");
    expect(html).toContain('name="Opciones"');
  });

  it("provee una opción inicial cuando array está vacío", () => {
    const html = render(<ListaOpcionesConCorrecta titulo="Opciones" opciones={[]} etiquetaAgregar="Agregar" onChange={() => {}} />);
    expect(html).toContain("Agregar");
  });

  it("ofrece botón para agregar opción", () => {
    const opciones: OpcionConCorrecta[] = [
      { id: "op-1", texto: "A", correcta: true },
    ];
    const html = render(<ListaOpcionesConCorrecta titulo="Opciones" opciones={opciones} etiquetaAgregar="Agregar opción" onChange={() => {}} />);
    expect(html).toContain("Agregar opción");
  });

  it("tiene botón eliminar para cada opción", () => {
    const opciones: OpcionConCorrecta[] = [
      { id: "op-1", texto: "A", correcta: true },
      { id: "op-2", texto: "B", correcta: false },
    ];
    const html = render(<ListaOpcionesConCorrecta titulo="Opciones" opciones={opciones} etiquetaAgregar="Agregar" onChange={() => {}} />);
    expect(html).toContain("Eliminar opciones 1");
    expect(html).toContain("Eliminar opciones 2");
  });

  it("la nueva opción agregada no está marcada como correcta", () => {
    const opciones: OpcionConCorrecta[] = [
      { id: "op-1", texto: "A", correcta: true },
    ];
    const html = render(<ListaOpcionesConCorrecta titulo="Opciones" opciones={opciones} etiquetaAgregar="Agregar" onChange={() => {}} />);
    const radioButtons = html.match(/type="radio"/g);
    expect(radioButtons).toHaveLength(1);
  });
});

describe("ListaOpcionesTexto", () => {
  const render = (ui: React.ReactElement) => renderToStaticMarkup(ui);

  it("renderiza filas con numeración", () => {
    const html = render(
      <ListaOpcionesTexto
        titulo="Pasos"
        valores={["Primer paso", "Segundo paso"]}
        etiquetaAgregar="Agregar paso"
        onChange={() => {}}
      />,
    );
    expect(html).toContain("1");
    expect(html).toContain("2");
    expect(html).toContain("Primer paso");
    expect(html).toContain("Segundo paso");
  });

  it("no muestra numeración cuando hay filas vacías", () => {
    const html = render(
      <ListaOpcionesTexto titulo="Palabras" valores={[""]} etiquetaAgregar="Agregar" onChange={() => {}} />,
    );
    expect(html).toContain('aria-label="Palabras 1"');
  });
});
