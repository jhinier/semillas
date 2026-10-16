import { expect, test } from "bun:test";
import { MOMENTOS, type CeldaMatriz } from "./matriz-crecer";
import { validarPublicacion } from "./validar-publicacion";
import type { DatosPublicacion } from "./publicacion.types";

function datosBase(): DatosPublicacion {
  const celdas: CeldaMatriz[] = MOMENTOS.map((codigoMomento, indice) => ({ grupoEdadId: "g1", codigoMomento, completa: true, orden: indice + 1 }));
  return {
    titulo: "Tema válido",
    sendaId: "senda-1",
    versionBiblicaId: "version-1",
    versiculo: { texto: "Texto", libroId: "libro-1", capitulo: 1, numero: 1 },
    portada: { id: "media-1", alt: "Ilustración del tema" },
    gruposEdadIds: ["g1"],
    celdasCrecer: celdas,
    actividades: [{ id: "actividad-1", titulo: "Pregunta", consigna: "Responde", requiereOpciones: true, opciones: [{ correcta: true }] }],
    revisionAprobada: true,
  };
}

test("acepta un tema publicable completo", () => {
  expect(validarPublicacion(datosBase())).toEqual({ valido: true, errores: [] });
});

test("devuelve errores estructurados para bypass e inyección", () => {
  const datos = datosBase();
  datos.revisionAprobada = false;
  datos.celdasCrecer = datos.celdasCrecer.slice(0, 5);
  datos.actividades[0]!.opciones = [{ correcta: false }];
  datos.markdown = '<script>alert("x")</script>';
  const resultado = validarPublicacion(datos);
  expect(resultado.valido).toBe(false);
  expect(resultado.errores.map((error) => error.codigo)).toEqual(expect.arrayContaining([
    "CRECER_MOMENTO_FALTANTE",
    "RESPUESTA_CORRECTA_REQUERIDA",
    "MARKDOWN_INSEGURO",
    "REVISION_REQUERIDA",
  ]));
});

test("bloquea una configuración de actividad no canónica", () => {
  const datos = datosBase();
  datos.actividades[0]!.configuracionValida = false;
  const resultado = validarPublicacion(datos);
  expect(resultado.valido).toBe(false);
  expect(resultado.errores).toContainEqual(expect.objectContaining({
    codigo: "CONFIGURACION_ACTIVIDAD_INVALIDA",
    ruta: "actividades.actividad-1.configuracion",
  }));
});

test("exige narración completa para Semillas", () => {
  const datos = datosBase();
  datos.narracionSemillasValida = false;
  const resultado = validarPublicacion(datos);
  expect(resultado.valido).toBe(false);
  expect(resultado.errores).toContainEqual(expect.objectContaining({ codigo: "NARRACION_SEMILLAS_REQUERIDA" }));
});
