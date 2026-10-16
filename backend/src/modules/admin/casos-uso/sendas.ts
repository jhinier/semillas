import type { z } from "zod";
import type { createSendaSchema, updateSendaSchema } from "../admin.schemas";

type AdminRepository = ReturnType<typeof import("../admin.repository").crearAdminRepository>;

export function crearCasosUsoSendas(repositorio: AdminRepository) {
  return {
    async listar() {
      const sendas = await repositorio.listarSendas();
      return sendas.map((s) => ({
        id: s.id,
        codigo: s.codigo,
        nombre: s.nombre,
        descripcion: s.descripcion,
        color_hex: s.colorHex,
        nombre_icono: s.nombreIcono,
        imagen_recurso_id: s.imagenRecursoId,
        orden: s.orden,
        activo: s.activo,
        creado_en: s.creadoEn.toISOString()
      }));
    },

    async crear(body: z.infer<typeof createSendaSchema>) {
      const senda = await repositorio.crearSenda(body);
      return {
        id: senda.id,
        codigo: senda.codigo,
        nombre: senda.nombre,
        descripcion: senda.descripcion,
        color_hex: senda.colorHex,
        nombre_icono: senda.nombreIcono,
        imagen_recurso_id: senda.imagenRecursoId,
        orden: senda.orden,
        activo: senda.activo,
        creado_en: senda.creadoEn.toISOString()
      };
    },

    async obtener(id: string) {
      const senda = await repositorio.obtenerSenda(id);
      return {
        id: senda.id,
        codigo: senda.codigo,
        nombre: senda.nombre,
        descripcion: senda.descripcion,
        color_hex: senda.colorHex,
        nombre_icono: senda.nombreIcono,
        imagen_recurso_id: senda.imagenRecursoId,
        orden: senda.orden,
        activo: senda.activo,
        creado_en: senda.creadoEn.toISOString()
      };
    },

    async actualizar(id: string, body: z.infer<typeof updateSendaSchema>) {
      const senda = await repositorio.actualizarSenda(id, body);
      return {
        id: senda.id,
        codigo: senda.codigo,
        nombre: senda.nombre,
        descripcion: senda.descripcion,
        color_hex: senda.colorHex,
        nombre_icono: senda.nombreIcono,
        imagen_recurso_id: senda.imagenRecursoId,
        orden: senda.orden,
        activo: senda.activo,
        creado_en: senda.creadoEn.toISOString()
      };
    }
  };
}
