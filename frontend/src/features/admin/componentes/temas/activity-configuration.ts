type ConfiguracionActividad = Record<string, unknown>;

type OpcionActividad = {
  etiqueta: string;
  texto: string;
  correcta: boolean;
  orden: number;
};

type ActividadParaGuardar = {
  codigo: string;
  configuracion: ConfiguracionActividad;
  opciones: OpcionActividad[];
};

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function esTextoNoVacio(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

function esEnteroEnRango(valor: unknown, minimo: number, maximo: number): boolean {
  return typeof valor === "number" && Number.isInteger(valor) && valor >= minimo && valor <= maximo;
}

function obtenerArreglo(valor: unknown): unknown[] {
  return Array.isArray(valor) ? valor : [];
}

function obtenerTexto(opcion: unknown): string {
  if (typeof opcion === "string") return opcion;
  if (esRegistro(opcion) && typeof opcion.texto === "string") return opcion.texto;
  return "";
}

function esOpcionCorrecta(opcion: unknown): boolean {
  return esRegistro(opcion) && (opcion.correcta === true || opcion.esCorrecta === true);
}

export function afirmacionesAlineas(valor: unknown): string {
  return obtenerArreglo(valor)
    .map((afirmacion) => {
      if (!esRegistro(afirmacion)) return String(afirmacion);

      const esVerdadero = typeof afirmacion.es_verdadero === "boolean"
        ? afirmacion.es_verdadero
        : afirmacion.correcta === true;

      return `${String(afirmacion.texto ?? "")}|${String(esVerdadero)}`;
    })
    .join("\n");
}

function esPermutacionCompleta(valor: unknown, longitud: number): valor is number[] {
  if (!Array.isArray(valor) || valor.length !== longitud) return false;

  const indices = new Set<number>();

  return valor.every((indice) => {
    if (!esEnteroEnRango(indice, 0, longitud - 1) || indices.has(indice)) return false;

    indices.add(indice);
    return true;
  });
}

function tieneParesCompletos(pares: unknown[], minimo: number, campos: string[]): boolean {
  return pares.length >= minimo && pares.every((par) => esRegistro(par) && campos.every((campo) => esTextoNoVacio(par[campo])));
}

export function normalizarConfiguracionActividad(
  codigo: string,
  configuracion: ConfiguracionActividad,
): ConfiguracionActividad {
  if (codigo === "verdadero_falso") {
    const afirmaciones = obtenerArreglo(configuracion.afirmaciones).map((afirmacion) => {
      if (!esRegistro(afirmacion)) return afirmacion;

      const { correcta, ...afirmacionNormalizada } = afirmacion;

      return {
        ...afirmacionNormalizada,
        es_verdadero: typeof afirmacion.es_verdadero === "boolean" ? afirmacion.es_verdadero : correcta === true,
      };
    });

    return { ...configuracion, afirmaciones };
  }

  if (codigo === "arrastrar_soltar") {
    const items = obtenerArreglo(configuracion.items).filter((item): item is string => typeof item === "string");
    const ordenCorrecto = obtenerArreglo(configuracion.orden_correcto);
    const tieneOrdenValido = esPermutacionCompleta(ordenCorrecto, items.length);

    return {
      ...configuracion,
      items,
      orden_correcto: tieneOrdenValido ? ordenCorrecto : items.map((_, indice) => indice),
    };
  }

  if (codigo === "cancion") {
    const letra = typeof configuracion.letra === "string"
      ? configuracion.letra.split(/\r?\n/)
      : obtenerArreglo(configuracion.letra).filter((linea): linea is string => typeof linea === "string");

    return {
      ...configuracion,
      letra: letra.map((linea) => linea.trim()).filter(Boolean),
    };
  }

  return { ...configuracion };
}

export function validarActividadParaGuardar({
  codigo,
  configuracion,
  opciones,
}: ActividadParaGuardar): string | null {
  if ((codigo === "actividad_video" || codigo === "video") && !esTextoNoVacio(configuracion.video_url)) return "La actividad requiere una URL del video.";
  if (codigo === "actividad_audio" && !esTextoNoVacio(configuracion.audio_url)) return "La actividad requiere una URL del audio.";

  if (codigo === "rompecabezas") {
    if (!esTextoNoVacio(configuracion.imagen)) return "El rompecabezas requiere una imagen.";
    if (!esEnteroEnRango(configuracion.filas, 2, 6) || !esEnteroEnRango(configuracion.columnas, 2, 6)) return "El rompecabezas requiere filas y columnas enteras entre 2 y 6.";
  }

  if (codigo === "completar_versiculo") {
    if (!esTextoNoVacio(configuracion.frase) || !configuracion.frase.includes("__")) return "Completa el versículo con una frase que incluya __.";
    if (!esTextoNoVacio(configuracion.respuesta)) return "Completa el versículo con una respuesta no vacía.";
    if (obtenerArreglo(configuracion.opciones).filter(esTextoNoVacio).length < 1) return "Completa el versículo requiere un banco de palabras.";
  }

  if (codigo === "relacionar_pares" && !tieneParesCompletos(obtenerArreglo(configuracion.pares), 2, ["izquierda", "derecha"])) return "Relacionar pares requiere al menos dos pares con ambos lados.";
  if (codigo === "tarjetas_memoria" && !tieneParesCompletos(obtenerArreglo(configuracion.pares), 2, ["id", "texto"])) return "Tarjetas de memoria requiere al menos dos pares con id y texto.";

  if (codigo === "sopa_letras") {
    const palabras = obtenerArreglo(configuracion.palabras).filter(esTextoNoVacio);
    if (palabras.length < 2) return "La sopa de letras requiere al menos dos palabras.";
    if (!esEnteroEnRango(configuracion.filas, 6, 18) || !esEnteroEnRango(configuracion.columnas, 6, 18)) return "La sopa de letras requiere filas y columnas enteras entre 6 y 18.";
  }

  if (codigo === "manualidad") {
    if (obtenerArreglo(configuracion.materiales).filter(esTextoNoVacio).length === 0) return "La manualidad requiere al menos un material.";
    if (obtenerArreglo(configuracion.pasos).filter(esTextoNoVacio).length === 0) return "La manualidad requiere al menos un paso.";
  }

  if (codigo === "aventura_decisiones") {
    const escenas = obtenerArreglo(configuracion.escenas);
    const tieneEscenaJugable = escenas.some((escena) => {
      if (!esRegistro(escena) || !esTextoNoVacio(escena.texto)) return false;

      const opciones = obtenerArreglo(escena.opciones);
      return opciones.length >= 2 && opciones.every((opcion) => esTextoNoVacio(obtenerTexto(opcion))) && opciones.some(esOpcionCorrecta);
    });

    if (!tieneEscenaJugable) return "La aventura de decisiones requiere escenas con opciones y una respuesta correcta.";
  }

  if (codigo === "actividad_audio") {
    if (!esTextoNoVacio(configuracion.audio_url)) return "La actividad requiere una URL del audio.";
    if (!esTextoNoVacio(configuracion.pregunta)) return "La actividad de audio requiere una pregunta.";

    const opciones = obtenerArreglo(configuracion.opciones);
    if (opciones.length < 2) return "La actividad de audio requiere al menos dos opciones.";

    const opcionesValidas = opciones.filter((opcion) => esTextoNoVacio(obtenerTexto(opcion)));
    if (opcionesValidas.length < 2) return "La actividad de audio requiere opciones con texto.";
    if (opcionesValidas.filter(esOpcionCorrecta).length !== 1) return "La actividad de audio requiere exactamente una respuesta correcta.";
  }

  if (codigo === "actividad_video") {
    if (!esTextoNoVacio(configuracion.video_url)) return "La actividad requiere una URL del video.";
    if (!esTextoNoVacio(configuracion.pregunta)) return "La actividad de video requiere una pregunta.";

    const opciones = obtenerArreglo(configuracion.opciones).filter(esTextoNoVacio);
    if (opciones.length < 2) return "La actividad de video requiere al menos dos opciones.";

    if (!esEnteroEnRango(configuracion.respuesta_correcta, 0, opciones.length - 1)) return "La actividad de video requiere una respuesta correcta válida.";
  }

  if (codigo === "cuestionario") {
    const opcionesConTexto = opciones.filter((opcion) => opcion.texto.trim().length > 0);
    if (opcionesConTexto.length < 2 || opcionesConTexto.length > 6) return "El cuestionario requiere entre 2 y 6 opciones no vacías.";
    if (opcionesConTexto.filter((opcion) => opcion.correcta).length !== 1) return "El cuestionario requiere exactamente una respuesta correcta.";
  }

  if (codigo === "verdadero_falso") {
    const afirmaciones = obtenerArreglo(configuracion.afirmaciones);
    const sonAfirmacionesValidas = afirmaciones.length >= 2 && afirmaciones.every(
      (afirmacion) => esRegistro(afirmacion) && esTextoNoVacio(afirmacion.texto) && typeof afirmacion.es_verdadero === "boolean",
    );
    if (!sonAfirmacionesValidas) return "Verdadero o falso requiere al menos dos afirmaciones con texto y valor booleano.";
  }

  if (codigo === "arrastrar_soltar") {
    const items = obtenerArreglo(configuracion.items);
    if (items.length < 2) return "Arrastrar y soltar requiere al menos dos items.";
    if (!esPermutacionCompleta(configuracion.orden_correcto, items.length)) return "Arrastrar y soltar requiere un orden válido.";
  }

  if (codigo === "cancion") {
    const letra = configuracion.letra;
    if (letra !== undefined && (!Array.isArray(letra) || !letra.every(esTextoNoVacio))) return "La canción requiere una letra con líneas textuales.";

    const acciones = configuracion.acciones;
    if (acciones !== undefined && (!Array.isArray(acciones) || !acciones.every(esTextoNoVacio))) return "La canción requiere acciones textuales.";
  }

  return null;
}
