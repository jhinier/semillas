import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { ActivityTypeConfigBuilder } from "./activity-type-config-builder";
import { obtenerAfirmaciones, obtenerPares, obtenerListaTexto } from "./activity-config-utils";

describe("constructores de configuración de actividades", () => {
  it("convierte valores incompletos en filas editables sin cambiar el contrato", () => {
    expect(obtenerAfirmaciones([{ texto: "Dios es amor", es_verdadero: true }])).toMatchObject([
      { texto: "Dios es amor", es_verdadero: true },
    ]);
    expect(obtenerPares([{ izquierda: "Fe", derecha: "Confiar" }])).toMatchObject([
      { izquierda: "Fe", derecha: "Confiar" },
    ]);
    expect(obtenerListaTexto(["Orar", 12, "Servir"])).toEqual(["Orar", "Servir"]);
  });

  it("muestra constructores visuales y no instrucciones con separadores", () => {
    const html = renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo="verdadero_falso"
        configuracion={{ afirmaciones: [{ texto: "Dios es amor", es_verdadero: true }] }}
        onChange={() => undefined}
        onUpload={() => undefined}
        resources={[]}
        uploading={false}
      />,
    );

    expect(html).toContain("Afirmaciones");
    expect(html).toContain("Verdadera");
    expect(html).not.toContain("texto|true");
  });

  it("muestra sopa de letras como editor visual por palabras", () => {
    const html = renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo="sopa_letras"
        configuracion={{ palabras: ["Orar", "Fe"], filas: 12, columnas: 12 }}
        onChange={() => undefined}
        onUpload={() => undefined}
        resources={[]}
        uploading={false}
      />,
    );

    expect(html).toContain("Palabras");
    expect(html).toContain("Agregar palabra");
    expect(html).not.toContain("separadas por coma");
  });

  it("muestra campos separados para una manualidad", () => {
    const html = renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo="manualidad"
        configuracion={{ materiales: ["Papel"], pasos: ["Dobla el papel"] }}
        onChange={() => undefined}
        onUpload={() => undefined}
        resources={[]}
        uploading={false}
      />,
    );

    expect(html).toContain("Materiales");
    expect(html).toContain("Pasos");
    expect(html).toContain("Agregar material");
  });

  it("abre la biblioteca de recursos para rompecabezas en lugar de subir directo", () => {
    const html = renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo="rompecabezas"
        configuracion={{ imagen: "", filas: 3, columnas: 3 }}
        onChange={() => undefined}
        onUpload={() => undefined}
        resources={[]}
        uploading={false}
      />,
    );

    expect(html).toContain("Abrir biblioteca");
    expect(html).toContain("Selecciona una imagen existente o súbela");
    expect(html).not.toContain("Seleccionar archivo");
  });

  it("abre la biblioteca de recursos para audio en lugar de subir directo", () => {
    const html = renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo="audio"
        configuracion={{ audio_url: "", transcripcion: "" }}
        onChange={() => undefined}
        onUpload={() => undefined}
        resources={[]}
        uploading={false}
      />,
    );

    expect(html).toContain("Abrir biblioteca");
    expect(html).toContain("Selecciona un audio existente o súbelo");
    expect(html).not.toContain("Seleccionar archivo");
  });

  it("muestra campos completos para video, completar versículo y aventura", () => {
    const videoHtml = renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo="actividad_video"
        configuracion={{ video_url: "", pregunta: "", opciones: [], respuesta_correcta: 0 }}
        onChange={() => undefined}
        onUpload={() => undefined}
        resources={[]}
        uploading={false}
      />,
    );

    const completarHtml = renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo="completar_versiculo"
        configuracion={{ frase: "Ama a tu ____", respuesta: "prójimo", opciones: ["prójimo"] }}
        onChange={() => undefined}
        onUpload={() => undefined}
        resources={[]}
        uploading={false}
      />,
    );

    const aventuraHtml = renderToStaticMarkup(
      <ActivityTypeConfigBuilder
        codigo="aventura_decisiones"
        configuracion={{ escenas: [{ texto: "Escena 1", opciones: [] }] }}
        onChange={() => undefined}
        onUpload={() => undefined}
        resources={[]}
        uploading={false}
      />,
    );

    expect(videoHtml).toContain("Pregunta");
    expect(videoHtml).toContain("Respuesta correcta");
    expect(completarHtml).toContain("Banco de palabras");
    expect(completarHtml).toContain("Agregar palabra");
    expect(aventuraHtml).toContain("Escena 1");
    expect(aventuraHtml).toContain("Agregar escena");
  });
});
