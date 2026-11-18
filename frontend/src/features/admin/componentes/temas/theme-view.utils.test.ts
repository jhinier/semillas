import { describe, expect, it } from "bun:test";
import {
  obtenerAccionesPendientesPublicacion,
  validarCamposObligatoriosPaso1,
} from "./theme-view.utils";

describe("obtenerAccionesPendientesPublicacion", () => {
  it("muestra solo Revisar Paso 1 cuando únicamente falta el versículo y Paso 4 ya está completo", () => {
    const acciones = obtenerAccionesPendientesPublicacion({
      criterios: [
        { codigo: "informacion", completo: true },
        { codigo: "portada", completo: true },
        { codigo: "crecer", completo: true },
        { codigo: "actividades", completo: true },
        {
          codigo: "publicacion",
          completo: false,
          detalle: "Pendiente: agrega el versículo clave con su cita bíblica",
        },
      ],
      errores_publicacion: [
        { codigo: "VERSICULO_REQUERIDO", mensaje: "Falta versículo" },
        { codigo: "REFERENCIA_BIBLICA_REQUERIDA", mensaje: "Falta cita" },
      ],
    });

    expect(acciones).toEqual([
      { paso: 1, label: "Revisar Paso 1 (Datos y versículo)" },
    ]);
  });

  it("incluye Paso 4 solo cuando Actividades realmente está incompleto", () => {
    const acciones = obtenerAccionesPendientesPublicacion({
      criterios: [
        { codigo: "informacion", completo: true },
        { codigo: "portada", completo: true },
        { codigo: "crecer", completo: true },
        { codigo: "actividades", completo: false, detalle: "Agrega al menos 1 actividad" },
        { codigo: "publicacion", completo: false, detalle: "Pendiente: agrega al menos una actividad" },
      ],
      errores_publicacion: [{ codigo: "ACTIVIDAD_REQUERIDA", mensaje: "Falta actividad" }],
    });

    expect(acciones).toEqual([{ paso: 4, label: "Revisar Paso 4 (Actividades)" }]);
  });
});

describe("validarCamposObligatoriosPaso1", () => {
  it("marca en rojo desde la entrada los campos obligatorios vacíos o por debajo del mínimo", () => {
    const inicial = validarCamposObligatoriosPaso1({
      titulo: "",
      senda_ids: [],
      senda_id: "",
      version_biblica_id: "",
      resumen: "Corto",
      objetivo: "9 letras!",
      grupo_edad_ids: [],
      libro_id: 9,
      capitulo: 0,
      versiculo: 177,
      versiculo_texto: "",
    });
    expect(inicial.tituloInvalido).toBe(true);
    expect(inicial.sendaInvalida).toBe(true);
    expect(inicial.versionBiblicaInvalida).toBe(true);
    expect(inicial.resumenInvalido).toBe(true);
    expect(inicial.objetivoInvalido).toBe(true);
    expect(inicial.edadesInvalidas).toBe(true);
    expect(inicial.libroInvalido).toBe(false);
    expect(inicial.capituloInvalido).toBe(true);
    expect(inicial.versiculoNumInvalido).toBe(true);
    expect(inicial.versiculoTextoInvalido).toBe(true);
    expect(inicial.pendientesGeneral.map((item) => item.id)).toEqual([
      "tema-titulo",
      "tema-sendas",
      "tema-version",
      "tema-resumen",
      "tema-objetivo",
      "tema-edades",
    ]);
    expect(inicial.pendientesVersiculo.map((item) => item.id)).toEqual([
      "tema-capitulo",
      "tema-versiculo",
      "tema-versiculo-texto",
    ]);
    expect(inicial.esValido).toBe(false);

    const completo = validarCamposObligatoriosPaso1({
      titulo: "David y Goliat",
      senda_ids: ["senda-1"],
      senda_id: "senda-1",
      version_biblica_id: "ver-1",
      resumen: "Historia sobre la fe valiente de David frente al gigante.",
      objetivo: "Confiar en Dios en todo momento",
      grupo_edad_ids: ["edad-1"],
      libro_id: 9,
      capitulo: 17,
      versiculo: 45,
      versiculo_texto: "Yo vengo contra ti en el nombre del Señor Todopoderoso.",
    });
    expect(completo.tituloInvalido).toBe(false);
    expect(completo.sendaInvalida).toBe(false);
    expect(completo.versionBiblicaInvalida).toBe(false);
    expect(completo.resumenInvalido).toBe(false);
    expect(completo.objetivoInvalido).toBe(false);
    expect(completo.edadesInvalidas).toBe(false);
    expect(completo.versiculoTextoInvalido).toBe(false);
    expect(completo.libroInvalido).toBe(false);
    expect(completo.capituloInvalido).toBe(false);
    expect(completo.versiculoNumInvalido).toBe(false);
    expect(completo.esValido).toBe(true);
    expect(completo.pendientes).toEqual([]);
  });
});
