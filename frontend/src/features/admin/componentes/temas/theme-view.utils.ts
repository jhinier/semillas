export function formatElapsed(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `hace ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays}d`;
  } catch {
    return "—";
  }
}

export function formatearFechaTema(fecha?: string | null) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatearFechaHoraTema(fecha?: string | null) {
  if (!fecha) return "—";

  return new Date(fecha).toLocaleString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function obtenerEstadoTema(estado: string) {
  const estadoNormalizado = estado.trim().toLowerCase();

  switch (estadoNormalizado) {
    case "publicado":
      return {
        etiqueta: "Publicado",
        clase: "border-emerald-200 bg-emerald-50 text-emerald-700",
        punto: "bg-emerald-500",
        fondoHero: "from-emerald-950 via-emerald-900 to-green-950",
        brillo: "bg-emerald-400/20",
      };
    case "revision":
      return {
        etiqueta: "En revisión",
        clase: "border-amber-200 bg-amber-50 text-amber-700",
        punto: "bg-amber-500",
        fondoHero: "from-amber-950 via-amber-900 to-green-950",
        brillo: "bg-amber-400/20",
      };
    case "archivado":
      return {
        etiqueta: "Archivado",
        clase: "border-slate-200 bg-slate-100 text-slate-600",
        punto: "bg-slate-400",
        fondoHero: "from-slate-950 via-slate-800 to-green-950",
        brillo: "bg-slate-400/20",
      };
    default:
      return {
        etiqueta: "Borrador",
        clase: "border-sky-200 bg-sky-50 text-sky-700",
        punto: "bg-sky-500",
        fondoHero: "from-sky-950 via-sky-900 to-green-950",
        brillo: "bg-sky-400/20",
      };
  }
}

export type AccionPasoPendiente = {
  paso: 1 | 2 | 3 | 4;
  label: string;
};

export type CompletitudResumen = {
  criterios?: Array<{ codigo: string; completo: boolean; detalle?: string | null }>;
  errores_publicacion?: Array<{ codigo: string; mensaje?: string | null }>;
} | null | undefined;

/** Indica si el Paso 1 (datos base + cita y texto del versículo clave) está completo según la validación de publicación. */
export function esPaso1CompletoPublicacion(completitud?: CompletitudResumen, themeExists = true): boolean {
  if (!themeExists || !completitud) return false;
  const criterios = completitud.criterios ?? [];
  const criteriosIncompletos = new Set(criterios.filter((c) => !c.completo).map((c) => c.codigo));
  const codigosError = new Set((completitud.errores_publicacion ?? []).map((e) => e.codigo));
  const detallePublicacion = criterios.find((c) => c.codigo === "publicacion")?.detalle ?? "";

  if (
    criteriosIncompletos.has("informacion") ||
    criteriosIncompletos.has("ficha_base") ||
    criteriosIncompletos.has("publico") ||
    criteriosIncompletos.has("configuracion")
  ) {
    return false;
  }

  return !(
    codigosError.has("VERSICULO_REQUERIDO") ||
    codigosError.has("REFERENCIA_BIBLICA_REQUERIDA") ||
    codigosError.has("TITULO_REQUERIDO") ||
    codigosError.has("OBJETIVO_REQUERIDO") ||
    codigosError.has("SENDA_REQUERIDA") ||
    codigosError.has("FRANJA_REQUERIDA") ||
    codigosError.has("VERSION_BIBLICA_REQUERIDA") ||
    /VERSICULO_REQUERIDO|REFERENCIA_BIBLICA_REQUERIDA|TITULO_REQUERIDO|OBJETIVO_REQUERIDO|SENDA_REQUERIDA|FRANJA_REQUERIDA|vers[ií]culo/i.test(
      detallePublicacion,
    )
  );
}

/** Limita la lista de franjas del catálogo a las edades realmente elegidas para el tema en Paso 1. */
export function resolverFranjasDelTema<
  TCatalogo extends { id: string; nombre?: string | null },
>(
  catalogo: TCatalogo[] | undefined,
  gruposTema?: Array<{ id: string; codigo?: string; nombre?: string } | string> | null,
  idsAdicionalesConContenido: Iterable<string> = [],
): TCatalogo[] {
  const baseCatalogo = catalogo ?? [];
  const temaLista = (gruposTema ?? [])
    .map((g) => (typeof g === "string" ? { id: g, nombre: g } : g))
    .filter((g): g is { id: string; codigo?: string; nombre?: string } => Boolean(g?.id));

  if (temaLista.length === 0) {
    return baseCatalogo;
  }

  const permitidos = new Set<string>(temaLista.map((g) => g.id));
  for (const extraId of idsAdicionalesConContenido) {
    if (extraId) permitidos.add(extraId);
  }

  const filtradas = baseCatalogo.filter((item) => permitidos.has(item.id));
  for (const raw of temaLista) {
    if (!filtradas.some((item) => item.id === raw.id)) {
      filtradas.push(raw as unknown as TCatalogo);
    }
  }
  return filtradas;
}

/** Determina únicamente los pasos que tienen criterios o errores reales pendientes para publicar. */
export function obtenerAccionesPendientesPublicacion(
  completitud?: CompletitudResumen,
): AccionPasoPendiente[] {
  const criterios = completitud?.criterios ?? [];
  const criteriosIncompletos = new Set(criterios.filter((c) => !c.completo).map((c) => c.codigo));
  const codigosError = new Set((completitud?.errores_publicacion ?? []).map((e) => e.codigo));
  const detallePublicacion = criterios.find((c) => c.codigo === "publicacion")?.detalle ?? "";

  const acciones: AccionPasoPendiente[] = [];

  const paso1Pendiente = Boolean(completitud) && !esPaso1CompletoPublicacion(completitud, true);

  const paso2Pendiente =
    criteriosIncompletos.has("portada") ||
    codigosError.has("PORTADA_REQUERIDA") ||
    /PORTADA_REQUERIDA|portada/i.test(detallePublicacion);

  const paso3Pendiente =
    criteriosIncompletos.has("crecer") ||
    criteriosIncompletos.has("contenido_crecer") ||
    Array.from(codigosError).some((c) => c.startsWith("CRECER_")) ||
    /CRECER_/i.test(detallePublicacion);

  const paso4Pendiente =
    criteriosIncompletos.has("actividades") ||
    codigosError.has("ACTIVIDAD_REQUERIDA") ||
    /ACTIVIDAD_REQUERIDA/i.test(detallePublicacion);

  if (paso1Pendiente) acciones.push({ paso: 1, label: "Revisar Paso 1 (Datos y versículo)" });
  if (paso2Pendiente) acciones.push({ paso: 2, label: "Revisar Paso 2 (Portada)" });
  if (paso3Pendiente) acciones.push({ paso: 3, label: "Revisar Paso 3 (CRECER)" });
  if (paso4Pendiente) acciones.push({ paso: 4, label: "Revisar Paso 4 (Actividades)" });

  if (acciones.length === 0 && criteriosIncompletos.size > 0) {
    acciones.push({ paso: 1, label: "Revisar Paso 1 (Datos y versículo)" });
  }

  return acciones;
}

export type CampoPendientePaso1 = {
  id: string;
  seccion: "general" | "versiculo";
  etiqueta: string;
  mensajeToast: string;
};

/** Evalúa qué campos obligatorios del Paso 1 faltan completar al entrar o editar. */
export function validarCamposObligatoriosPaso1(input: {
  titulo: string;
  senda_ids: string[];
  senda_id: string;
  version_biblica_id?: string;
  resumen?: string;
  objetivo: string;
  grupo_edad_ids: string[];
  libro_id: number;
  capitulo: number;
  versiculo: number;
  versiculo_texto: string;
}) {
  const tituloLimpio = input.titulo.trim();
  const sendasCount = input.senda_ids.length || (input.senda_id ? 1 : 0);
  const versionBiblicaInvalida =
    input.version_biblica_id !== undefined && !input.version_biblica_id.trim();
  const resumenLimpio = input.resumen?.trim() ?? "";
  const resumenInvalido =
    input.resumen !== undefined && resumenLimpio.length < 10;
  const objetivoLimpio = input.objetivo.trim();
  const versiculoTextoLimpio = input.versiculo_texto.trim();
  const libroNum = Number(input.libro_id);
  const capituloNum = Number(input.capitulo);
  const versiculoNum = Number(input.versiculo);

  const tituloInvalido = tituloLimpio.length < 3;
  const sendaInvalida = sendasCount === 0;
  const objetivoInvalido = objetivoLimpio.length < 10;
  const edadesInvalidas = input.grupo_edad_ids.length === 0;
  const libroInvalido =
    !Number.isInteger(libroNum) || libroNum < 1 || libroNum > 66;
  const capituloInvalido =
    !Number.isInteger(capituloNum) || capituloNum < 1 || capituloNum > 150;
  const versiculoNumInvalido =
    !Number.isInteger(versiculoNum) || versiculoNum < 1 || versiculoNum > 176;
  const versiculoTextoInvalido = versiculoTextoLimpio.length < 3;

  const pendientesGeneral: CampoPendientePaso1[] = [];
  if (tituloInvalido) {
    pendientesGeneral.push({
      id: "tema-titulo",
      seccion: "general",
      etiqueta: "Título del tema (mín. 3 letras)",
      mensajeToast: "título (mínimo 3 letras)",
    });
  }
  if (sendaInvalida) {
    pendientesGeneral.push({
      id: "tema-sendas",
      seccion: "general",
      etiqueta: "Al menos una senda",
      mensajeToast: "al menos una senda",
    });
  }
  if (edadesInvalidas) {
    pendientesGeneral.push({
      id: "tema-edades",
      seccion: "general",
      etiqueta: "Franjas de edad (CRECER y Actividades)",
      mensajeToast: "al menos una franja de edad",
    });
  }
  if (versionBiblicaInvalida) {
    pendientesGeneral.push({
      id: "tema-version",
      seccion: "general",
      etiqueta: "Versión de la Biblia",
      mensajeToast: "versión de la Biblia",
    });
  }
  if (resumenInvalido) {
    pendientesGeneral.push({
      id: "tema-resumen",
      seccion: "general",
      etiqueta: "Resumen breve (mín. 10 letras)",
      mensajeToast: "resumen corto (mínimo 10 letras)",
    });
  }
  if (objetivoInvalido) {
    pendientesGeneral.push({
      id: "tema-objetivo",
      seccion: "general",
      etiqueta: "Objetivo de aprendizaje (mín. 10 letras)",
      mensajeToast: "objetivo de aprendizaje (mínimo 10 letras)",
    });
  }

  const pendientesVersiculo: CampoPendientePaso1[] = [];
  if (libroInvalido) {
    pendientesVersiculo.push({
      id: "tema-libro",
      seccion: "versiculo",
      etiqueta: "Libro de la Biblia",
      mensajeToast: "libro de la Biblia",
    });
  }
  if (capituloInvalido) {
    pendientesVersiculo.push({
      id: "tema-capitulo",
      seccion: "versiculo",
      etiqueta: "Capítulo válido (1–150)",
      mensajeToast: "capítulo válido",
    });
  }
  if (versiculoNumInvalido) {
    pendientesVersiculo.push({
      id: "tema-versiculo",
      seccion: "versiculo",
      etiqueta: "Número de versículo (1–176)",
      mensajeToast: "número de versículo válido",
    });
  }
  if (versiculoTextoInvalido) {
    pendientesVersiculo.push({
      id: "tema-versiculo-texto",
      seccion: "versiculo",
      etiqueta: "Versículo clave (mín. 3 letras)",
      mensajeToast: "texto completo del versículo clave (mínimo 3 letras)",
    });
  }

  const pendientes = [...pendientesGeneral, ...pendientesVersiculo];

  return {
    tituloInvalido,
    sendaInvalida,
    versionBiblicaInvalida,
    resumenInvalido,
    objetivoInvalido,
    edadesInvalidas,
    libroInvalido,
    capituloInvalido,
    versiculoNumInvalido,
    versiculoTextoInvalido,
    tituloLargo: tituloLimpio.length,
    resumenLargo: resumenLimpio.length,
    objetivoLargo: objetivoLimpio.length,
    versiculoTextoLargo: versiculoTextoLimpio.length,
    pendientesGeneral,
    pendientesVersiculo,
    pendientes,
    esValido: pendientes.length === 0,
  };
}
