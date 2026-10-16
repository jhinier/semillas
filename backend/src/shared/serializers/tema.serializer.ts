export type FilaTema = {
  id: string;
  senda_id: string;
  titulo: string;
  slug: string;
  objetivo: string;
  resumen: string | null;
  portada_recurso_id: string | null;
  estado: string;
  version_biblica_id: string | null;
  xp_recompensa: number;
  minutos_estimados: number;
  version_contenido: number;
  publicado_en: string | null;
  senda_codigo?: string | null;
  senda_nombre?: string | null;
  senda_color_hex?: string | null;
  portada_recurso?: {
    id: string;
    tipo: string;
    url_publica: string;
    texto_alternativo: string | null;
    titulo: string | null;
    tipo_mime: string | null;
    tamano_bytes: number | null;
    duracion_seg: number | null;
    ancho_px: number | null;
    alto_px: number | null;
  } | null;
};

export type FilaTemaDetalle = FilaTema & {
  senda?: {
    id: string;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    color_hex: string;
    nombre_icono: string | null;
    orden: number;
  } | null;
  portada_recurso?: {
    id: string;
    tipo: string;
    url_publica: string;
    texto_alternativo: string | null;
    titulo: string | null;
    tipo_mime: string | null;
    tamano_bytes: number | null;
    duracion_seg: number | null;
    ancho_px: number | null;
    alto_px: number | null;
  } | null;
  versiculo_clave?: {
    id: string;
    tema_id: string;
    texto: string;
    libro_id: number;
    capitulo: number;
    versiculo: number;
  } | null;
  referencias_biblicas?: Array<{
    id: string;
    tema_id: string;
    libro_id: number;
    capitulo: number;
    versiculo_inicio: number;
    versiculo_fin: number;
    principal: boolean;
  }> | null;
};

function serializarSenda(senda: NonNullable<FilaTemaDetalle["senda"]>) {
  return {
    id: senda.id,
    codigo: senda.codigo,
    nombre: senda.nombre,
    descripcion: senda.descripcion,
    color_hex: senda.color_hex,
    nombre_icono: senda.nombre_icono,
    orden: senda.orden
  };
}

function serializarRecursoMultimedia(recurso: NonNullable<FilaTemaDetalle["portada_recurso"]>) {
  return {
    id: recurso.id,
    tipo: recurso.tipo,
    url_publica: recurso.url_publica,
    texto_alternativo: recurso.texto_alternativo,
    titulo: recurso.titulo,
    tipo_mime: recurso.tipo_mime,
    tamano_bytes: recurso.tamano_bytes,
    duracion_seg: recurso.duracion_seg,
    ancho_px: recurso.ancho_px,
    alto_px: recurso.alto_px
  };
}

function serializarVersiculoClave(versiculoClave: NonNullable<FilaTemaDetalle["versiculo_clave"]>) {
  return {
    id: versiculoClave.id,
    tema_id: versiculoClave.tema_id,
    texto: versiculoClave.texto,
    libro_id: versiculoClave.libro_id,
    capitulo: versiculoClave.capitulo,
    versiculo: versiculoClave.versiculo
  };
}

function serializarReferenciaBiblica(referenciaBiblica: NonNullable<FilaTemaDetalle["referencias_biblicas"]>[number]) {
  return {
    id: referenciaBiblica.id,
    tema_id: referenciaBiblica.tema_id,
    libro_id: referenciaBiblica.libro_id,
    capitulo: referenciaBiblica.capitulo,
    versiculo_inicio: referenciaBiblica.versiculo_inicio,
    versiculo_fin: referenciaBiblica.versiculo_fin,
    principal: referenciaBiblica.principal
  };
}

export function serializarTema(fila: FilaTema) {
  const senda =
    fila.senda_codigo || fila.senda_nombre
      ? {
          id: fila.senda_id,
          codigo: fila.senda_codigo ?? "",
          nombre: fila.senda_nombre ?? "",
          color_hex: fila.senda_color_hex ?? null
        }
      : null;

  return {
    id: fila.id,
    senda_id: fila.senda_id,
    titulo: fila.titulo,
    slug: fila.slug,
    objetivo: fila.objetivo,
    resumen: fila.resumen,
    portada_recurso_id: fila.portada_recurso_id,
    portada_recurso: fila.portada_recurso ?? null,
    estado: fila.estado,
    version_biblica_id: fila.version_biblica_id,
    xp_recompensa: fila.xp_recompensa,
    minutos_estimados: fila.minutos_estimados,
    version_contenido: fila.version_contenido,
    publicado_en: fila.publicado_en,
    senda
  };
}

export function serializarTemaDetalle(fila: FilaTemaDetalle) {
  const referenciasBiblicas = (fila.referencias_biblicas ?? []).map(serializarReferenciaBiblica);

  return {
    ...serializarTema(fila),
    senda: fila.senda ? serializarSenda(fila.senda) : null,
    portada_recurso: fila.portada_recurso ? serializarRecursoMultimedia(fila.portada_recurso) : null,
    versiculo_clave: fila.versiculo_clave ? serializarVersiculoClave(fila.versiculo_clave) : null,
    referencia_biblica: referenciasBiblicas.find((referencia) => referencia.principal) ?? referenciasBiblicas[0] ?? null
  };
}