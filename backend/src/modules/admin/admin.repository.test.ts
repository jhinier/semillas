import { describe, expect, it } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { DbClient } from "../../db/client";
import { crearAdminRepository } from "./admin.repository";

describe("admin.repository", () => {
  it("persiste imagen_recurso_id mediante la columna Drizzle al actualizar una senda", async () => {
    const imagenRecursoId = "550e8400-e29b-41d4-a716-446655440099";
    let datosActualizacion: Record<string, unknown> | null = null;

    const drizzle = {
      update: () => ({
        set: (datos: Record<string, unknown>) => {
          datosActualizacion = datos;

          return {
            where: () => ({
              returning: async () => [{
                id: "senda-1",
                codigo: "padre",
                nombre: "Senda del Padre",
                descripcion: null,
                colorHex: "#3D8BD4",
                nombreIcono: null,
                imagenRecursoId,
                orden: 1,
                activo: true,
                creadoEn: new Date("2026-07-12T00:00:00.000Z")
              }]
            })
          };
        }
      })
    } as unknown as DbClient;
    const repositorio = crearAdminRepository({
      supabase: {} as SupabaseClient<Database>,
      drizzle
    });

    const senda = await repositorio.actualizarSenda("senda-1", { imagen_recurso_id: imagenRecursoId });

    expect(datosActualizacion).toMatchObject({ imagenRecursoId });
    expect(senda.imagenRecursoId).toBe(imagenRecursoId);
  });
});
