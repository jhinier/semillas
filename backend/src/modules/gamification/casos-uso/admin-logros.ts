import type { AdminLogrosRepository } from "../admin-logros.repository";
import type {
  ActualizarLogroAdminEntrada,
  AdminLogrosListEntrada,
  CodigoCriterioLogro,
  CrearLogroAdminEntrada,
} from "../admin-logros.schemas";

export type AdminLogrosCasos = ReturnType<typeof crearCasosUsoAdminLogros>;

export function serializarLogroAdmin(fila: {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  urlIcono: string | null;
  bonoXp: number;
  codigoCriterio: string;
  valorCriterio: number | null;
  activo: boolean;
  creadoEn: Date;
  otorgados?: number;
}) {
  return {
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    url_icono: fila.urlIcono,
    bono_xp: fila.bonoXp,
    codigo_criterio: fila.codigoCriterio as CodigoCriterioLogro,
    valor_criterio: fila.valorCriterio,
    activo: fila.activo,
    creado_en: fila.creadoEn.toISOString(),
    otorgados: Number(fila.otorgados ?? 0),
  };
}

function error(mensaje: string, codigo: string, estado: number) {
  return { error: { mensaje, codigo, estado } } as const;
}

export function crearCasosUsoAdminLogros(repositorio: AdminLogrosRepository) {
  return {
    async listar(filtros: AdminLogrosListEntrada) {
      const activo = filtros.estado === "todos" ? undefined : filtros.estado === "activo";
      const resultado = await repositorio.listar({
        q: filtros.q,
        activo,
        criterio: filtros.criterio,
        limit: filtros.limit,
        offset: filtros.offset,
      });
      return {
        logros: resultado.filas.map(serializarLogroAdmin),
        meta: { total: resultado.total, limit: filtros.limit, offset: filtros.offset },
      };
    },

    async listarCatalogoOrdenado() {
      const filas = await repositorio.listarOrdenadoPorNombre({ activo: true });
      return filas.map((fila) => ({ id: fila.id, codigo: fila.codigo, nombre: fila.nombre }));
    },

    async obtenerDetalle(id: string) {
      const fila = await repositorio.obtener(id);
      if (!fila) return error("Logro no encontrado", "NOT_FOUND", 404);
      const otorgados = await repositorio.contarOtorgados(id);
      return { ...serializarLogroAdmin({ ...fila, otorgados }) };
    },

    async crear(entrada: CrearLogroAdminEntrada, administradorId: string) {
      const codigoNormalizado = entrada.codigo.toLowerCase();
      const existente = await repositorio.buscarPorCodigo(codigoNormalizado);
      if (existente) {
        return error("Ya existe un logro con ese código", "CODIGO_DUPLICADO", 409);
      }

      const fila = await repositorio.crear({
        codigo: codigoNormalizado,
        nombre: entrada.nombre,
        descripcion: entrada.descripcion?.trim() || null,
        urlIcono: entrada.url_icono?.trim() || null,
        bonoXp: entrada.bono_xp,
        codigoCriterio: entrada.codigo_criterio,
        valorCriterio: entrada.valor_criterio,
      });

      if (!fila) return error("No se pudo crear el logro", "INTERNAL_ERROR", 500);
      const otorgados = await repositorio.contarOtorgados(fila.id);
      void administradorId;
      return serializarLogroAdmin({ ...fila, otorgados });
    },

    async actualizar(id: string, entrada: ActualizarLogroAdminEntrada) {
      const actual = await repositorio.obtener(id);
      if (!actual) return error("Logro no encontrado", "NOT_FOUND", 404);

      const parcial: Parameters<typeof repositorio.actualizar>[1] = {};
      if (entrada.nombre !== undefined) parcial.nombre = entrada.nombre;
      if (entrada.descripcion !== undefined) parcial.descripcion = entrada.descripcion?.trim() || null;
      if (entrada.url_icono !== undefined) parcial.urlIcono = entrada.url_icono?.trim() || null;
      if (entrada.bono_xp !== undefined) parcial.bonoXp = entrada.bono_xp;
      if (entrada.codigo_criterio !== undefined) parcial.codigoCriterio = entrada.codigo_criterio;
      if (entrada.valor_criterio !== undefined) parcial.valorCriterio = entrada.valor_criterio;

      const fila = await repositorio.actualizar(id, parcial);
      if (!fila) return error("No se pudo actualizar el logro", "INTERNAL_ERROR", 500);
      const otorgados = await repositorio.contarOtorgados(fila.id);
      return serializarLogroAdmin({ ...fila, otorgados });
    },

    async archivar(id: string) {
      const actual = await repositorio.obtener(id);
      if (!actual) return error("Logro no encontrado", "NOT_FOUND", 404);
      if (!actual.activo) return { archived: true } as const;
      const fila = await repositorio.archivar(id);
      return fila ? { archived: true } : error("No se pudo archivar el logro", "INTERNAL_ERROR", 500);
    },

    async reactivar(id: string) {
      const actual = await repositorio.obtener(id);
      if (!actual) return error("Logro no encontrado", "NOT_FOUND", 404);
      if (actual.activo) return { reactivated: true } as const;
      const fila = await repositorio.reactivar(id);
      return fila ? { reactivated: true } : error("No se pudo reactivar el logro", "INTERNAL_ERROR", 500);
    },
  };
}
