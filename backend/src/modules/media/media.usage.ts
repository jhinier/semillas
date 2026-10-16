import type { FuenteUsoMedia } from "./media.repository";

export type UsoRecursoMedia = {
  tipo: "tema" | "senda" | "paso" | "actividad";
  entidad_id: string;
  titulo: string;
  contexto: string;
  tema_id: string | null;
  href: string;
};

function encontrarRutasConId(valor: unknown, id: string, ruta = ""): string[] {
  if (valor === id) return [ruta || "configuración"];
  if (Array.isArray(valor)) {
    return valor.flatMap((item, index) =>
      encontrarRutasConId(item, id, `${ruta}[${index}]`),
    );
  }
  if (valor && typeof valor === "object") {
    return Object.entries(valor as Record<string, unknown>).flatMap(([clave, item]) =>
      encontrarRutasConId(item, id, ruta ? `${ruta}.${clave}` : clave),
    );
  }
  return [];
}

export function construirUsosRecurso(
  id: string,
  fuentes: FuenteUsoMedia,
): UsoRecursoMedia[] {
  const usos: UsoRecursoMedia[] = [];
  const temasPorId = new Map(fuentes.temas.map((tema) => [tema.id, tema]));
  const pasosPorId = new Map(fuentes.pasos.map((paso) => [paso.id, paso]));
  const tiposPasoPorId = new Map(
    fuentes.tiposPaso.map((tipoPaso) => [tipoPaso.id, tipoPaso]),
  );

  for (const tema of fuentes.temas) {
    if (tema.portada_recurso_id !== id) continue;
    usos.push({
      tipo: "tema",
      entidad_id: tema.id,
      titulo: tema.titulo,
      contexto: "Portada del tema",
      tema_id: tema.id,
      href: `/admin/temas/${tema.id}/detalle`,
    });
  }

  for (const senda of fuentes.sendas) {
    if (senda.imagen_recurso_id !== id) continue;
    usos.push({
      tipo: "senda",
      entidad_id: senda.id,
      titulo: senda.nombre,
      contexto: "Imagen principal de la senda",
      tema_id: null,
      href: `/admin/sendas/${senda.id}/edit`,
    });
  }

  for (const contenido of fuentes.contenidos) {
    const paso = pasosPorId.get(contenido.paso_id);
    const tema = paso ? temasPorId.get(paso.tema_id) : null;
    const tipoPaso = paso ? tiposPasoPorId.get(paso.tipo_paso_id) : null;
    const base = {
      tipo: "paso" as const,
      entidad_id: contenido.id,
      titulo: tema?.titulo ?? contenido.titulo,
      tema_id: paso?.tema_id ?? null,
      href: paso?.tema_id
        ? `/admin/temas/${paso.tema_id}/crecer`
        : "/admin/temas",
    };

    if (contenido.recurso_id === id) {
      usos.push({
        ...base,
        contexto: `${tipoPaso?.nombre ?? "Paso CRECER"} · recurso visual`,
      });
    }
    if (contenido.recurso_audio_id === id) {
      usos.push({
        ...base,
        contexto: `${tipoPaso?.nombre ?? "Paso CRECER"} · recurso de audio`,
      });
    }

    const rutas = encontrarRutasConId(contenido.datos_extra, id);
    if (rutas.length) {
      usos.push({
        ...base,
        contexto: `${tipoPaso?.nombre ?? "Paso CRECER"} · contenido adicional (${rutas.join(", ")})`,
      });
    }
  }

  for (const actividad of fuentes.actividades) {
    const rutas = encontrarRutasConId(actividad.configuracion, id);
    if (!rutas.length) continue;
    usos.push({
      tipo: "actividad",
      entidad_id: actividad.id,
      titulo: actividad.titulo,
      contexto: `Configuración de actividad (${rutas.join(", ")})`,
      tema_id: actividad.tema_id,
      href: `/admin/temas/${actividad.tema_id}/activities`,
    });
  }

  return usos;
}
