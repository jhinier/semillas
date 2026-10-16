import { evaluarMatrizCrecer } from "./matriz-crecer";
import type { DatosPublicacion, ErrorPublicacion, ResultadoValidacionPublicacion } from "./publicacion.types";

function requerir(errores: ErrorPublicacion[], valor: string | null | undefined, codigo: string, ruta: string, mensaje: string) {
  if (!valor?.trim()) errores.push({ codigo, ruta, mensaje });
}

export function validarPublicacion(datos: DatosPublicacion): ResultadoValidacionPublicacion {
  const errores: ErrorPublicacion[] = [];
  requerir(errores, datos.titulo, "TITULO_REQUERIDO", "titulo", "El título es obligatorio");
  requerir(errores, datos.sendaId, "SENDA_REQUERIDA", "sendaId", "La senda es obligatoria");
  requerir(errores, datos.versionBiblicaId, "VERSION_BIBLICA_REQUERIDA", "versionBiblicaId", "La versión bíblica es obligatoria");
  requerir(errores, datos.versiculo?.texto, "VERSICULO_REQUERIDO", "versiculo.texto", "El versículo clave es obligatorio");
  if (!datos.versiculo?.libroId || !datos.versiculo.capitulo || !datos.versiculo.numero) {
    errores.push({ codigo: "REFERENCIA_BIBLICA_REQUERIDA", ruta: "versiculo", mensaje: "El versículo debe tener libro, capítulo y número" });
  }
  if (!datos.portada?.id) errores.push({ codigo: "PORTADA_REQUERIDA", ruta: "portada.id", mensaje: "La portada es obligatoria" });
  if (!datos.portada?.alt?.trim()) errores.push({ codigo: "ALT_REQUERIDO", ruta: "portada.alt", mensaje: "La portada requiere texto alternativo" });
  if (datos.gruposEdadIds.length === 0) errores.push({ codigo: "FRANJA_REQUERIDA", ruta: "gruposEdadIds", mensaje: "Selecciona al menos una franja" });

  const matriz = evaluarMatrizCrecer(datos.gruposEdadIds, datos.celdasCrecer);
  for (const celda of matriz.celdas) {
    for (const codigo of celda.errores) {
      errores.push({
        codigo: `CRECER_${codigo.toUpperCase()}`,
        ruta: `crecer.${celda.grupoEdadId}.${celda.codigoMomento}`,
        mensaje: `La celda ${celda.codigoMomento} no está completa`,
        grupoEdadId: celda.grupoEdadId,
        momento: celda.codigoMomento,
      });
    }
  }

  if (datos.actividades.length === 0) errores.push({ codigo: "ACTIVIDAD_REQUERIDA", ruta: "actividades", mensaje: "Debe existir al menos una actividad" });
  for (const actividad of datos.actividades) {
    requerir(errores, actividad.titulo, "ACTIVIDAD_TITULO_REQUERIDO", `actividades.${actividad.id}.titulo`, "El título de la actividad es obligatorio");
    requerir(errores, actividad.consigna, "ACTIVIDAD_CONSIGNA_REQUERIDA", `actividades.${actividad.id}.consigna`, "La consigna es obligatoria");
    if (actividad.requiereOpciones && !(actividad.opciones ?? []).some((opcion) => opcion.correcta)) {
      errores.push({ codigo: "RESPUESTA_CORRECTA_REQUERIDA", ruta: `actividades.${actividad.id}.opciones`, mensaje: "Debe existir una respuesta correcta" });
    }
    if (actividad.mediaValida === false) errores.push({ codigo: "MEDIA_INVALIDA", ruta: `actividades.${actividad.id}.media`, mensaje: "La media de la actividad no es válida" });
    if (actividad.configuracionValida === false) errores.push({ codigo: "CONFIGURACION_ACTIVIDAD_INVALIDA", ruta: `actividades.${actividad.id}.configuracion`, mensaje: "La configuración de la actividad no cumple el contrato canónico" });
  }
  if (datos.markdown && /<script\b|javascript:|on[a-z]+\s*=/i.test(datos.markdown)) {
    errores.push({ codigo: "MARKDOWN_INSEGURO", ruta: "markdown", mensaje: "El contenido contiene HTML o JavaScript peligroso" });
  }
  if (!datos.revisionAprobada) errores.push({ codigo: "REVISION_REQUERIDA", ruta: "revisionAprobada", mensaje: "La publicación requiere aprobación humana" });
  if (datos.narracionSemillasValida === false) errores.push({ codigo: "NARRACION_SEMILLAS_REQUERIDA", ruta: "crecer.semillas.audio", mensaje: "La franja Semillas requiere audio de narración en sus seis pasos" });

  return { valido: errores.length === 0, errores };
}
