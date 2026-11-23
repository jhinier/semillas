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

  it("al actualizarActividad cambiando el tipo valida contra el nuevo tipo_actividad_id y sincroniza cuestionario", async () => {
    let insertedOpciones: any[] = [];
    let updatedActividad: Record<string, unknown> | null = null;
    let tipoConsultado = "";

    const makeChain = (table: string) => {
      let mode: "select" | "insert" | "update" | "delete" = "select";
      let payload: any = null;
      const chain: any = {
        select: () => chain,
        insert: (rows: any) => {
          mode = "insert";
          payload = rows;
          if (table === "opcion_actividad") insertedOpciones = rows;
          return Promise.resolve({ error: null });
        },
        update: (vals: any) => {
          mode = "update";
          payload = vals;
          if (table === "actividad") updatedActividad = vals;
          return chain;
        },
        delete: () => {
          mode = "delete";
          return chain;
        },
        eq: (_col: string, val: unknown) => {
          if (table === "tipo_actividad") tipoConsultado = String(val);
          if (mode === "delete") return Promise.resolve({ error: null });
          if (mode === "select" && table === "opcion_actividad") {
            return Promise.resolve({ data: [], error: null });
          }
          return chain;
        },
        single: async () => {
          if (table === "tipo_actividad") {
            return {
              data: { codigo: tipoConsultado === "tipo-quiz-nuevo" ? "cuestionario" : "verdadero_falso" },
              error: null,
            };
          }
          if (table === "actividad" && mode === "select") {
            return { data: { tipo_actividad_id: "tipo-vf-viejo" }, error: null };
          }
          if (table === "actividad" && mode === "update") {
            return { data: { id: "act-1", ...payload }, error: null };
          }
          return { data: null, error: null };
        },
      };
      return chain;
    };

    const repositorio = crearAdminRepository({
      supabase: { from: makeChain } as unknown as SupabaseClient<Database>,
    });

    await repositorio.actualizarActividad("act-1", {
      tipo_actividad_id: "tipo-quiz-nuevo",
      configuracion: { opciones: [{ texto: "Vieja", correcta: true }, { texto: "Vieja 2", correcta: false }] },
      opciones: [
        { etiqueta: "A", texto: "Respuesta real A", correcta: false, orden: 1 },
        { etiqueta: "B", texto: "Respuesta real B", correcta: true, orden: 2 },
      ],
    });

    expect(tipoConsultado).toBe("tipo-quiz-nuevo");
    expect((updatedActividad as any)?.configuracion).toEqual({
      tipo: "cuestionario",
      opciones: [
        { texto: "Respuesta real A", correcta: false },
        { texto: "Respuesta real B", correcta: true },
      ],
    });
    expect(insertedOpciones).toHaveLength(2);
    expect(insertedOpciones[1].texto).toBe("Respuesta real B");
  });

  it("duplicarTema copia tambien el versiculo_clave del tema origen", async () => {
    const copiedVerses: Record<string, unknown>[] = [];
    const makeChain = (table: string) => {
      let mode: "select" | "insert" = "select";
      const chain: any = {
        select: () => chain,
        insert: (rows: any) => {
          mode = "insert";
          if (table === "versiculo_clave") copiedVerses.push(rows as Record<string, unknown>);
          if (table === "tema") {
            return {
              select: () => ({
                single: async () => ({ data: { id: "tema-copia", ...rows }, error: null }),
              }),
            };
          }
          return Promise.resolve({ error: null });
        },
        eq: () => chain,
        order: () => {
          if (table === "paso_tema" || table === "actividad") {
            return Promise.resolve({ data: [], error: null });
          }
          return chain;
        },
        maybeSingle: async () => {
          if (table === "versiculo_clave" && mode === "select") {
            return {
              data: { libro_id: 43, capitulo: 3, versiculo: 16, texto: "Porque de tal manera amó Dios al mundo." },
              error: null,
            };
          }
          return { data: null, error: null };
        },
        single: async () => {
          if (table === "tema") {
            return {
              data: {
                id: "tema-orig",
                senda_id: "senda-1",
                titulo: "Origen",
                slug: "origen",
                objetivo: "Objetivo largo de diez letras",
                resumen: "Resumen largo de diez letras",
                version_biblica_id: "ver-1",
                grupos_edad: [],
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
      };
      if (table === "referencia_biblica") {
        chain.eq = () => Promise.resolve({ data: [], error: null });
      }
      return chain;
    };

    const repositorio = crearAdminRepository({
      supabase: { from: makeChain } as unknown as SupabaseClient<Database>,
    });

    await repositorio.duplicarTema("tema-orig", { id: "admin-1", role: "administrador", displayName: "Admin" });
    expect(copiedVerses[0]).toEqual({
      tema_id: "tema-copia",
      libro_id: 43,
      capitulo: 3,
      versiculo: 16,
      texto: "Porque de tal manera amó Dios al mundo.",
    });
  });

  it("obtenerEstudioTema verifica solo las franjas seleccionadas en Paso 1 e ignora contenidos de otras franjas", async () => {
    const makeChain = (table: string) => {
      const chain: any = {
        select: () => chain,
        eq: () => {
          if (table === "tema_grupo_edad") {
            return Promise.resolve({
              data: [
                {
                  grupo_edad_id: "exp",
                  grupo_edad: { id: "exp", codigo: "exploradores", nombre: "Exploradores" },
                },
              ],
              error: null,
            });
          }
          if (table === "actividad") {
            return {
              order: () => ({
                range: () =>
                  Promise.resolve({
                    data: [
                      {
                        id: "act-sem",
                        tema_id: "tema-1",
                        grupo_edad_id: "sem",
                        titulo: "Actividad antigua",
                        consigna: "Consigna",
                        configuracion: {},
                        opciones: [],
                        tipo_actividad: { id: "t1", codigo: "cuestionario", nombre: "Quiz" },
                      },
                    ],
                    count: 1,
                    error: null,
                  }),
              }),
              then: (resolve: (val: any) => void) =>
                resolve({
                  data: [
                    {
                      id: "act-sem",
                      tema_id: "tema-1",
                      grupo_edad_id: "sem",
                      titulo: "Actividad antigua",
                      consigna: "Consigna",
                      configuracion: {},
                      opciones: [],
                      tipo_actividad: { id: "t1", codigo: "cuestionario", nombre: "Quiz" },
                    },
                  ],
                  error: null,
                }),
            };
          }
          return chain;
        },
        order: () => {
          if (table === "paso_tema") {
            return Promise.resolve({
              data: [
                {
                  id: "p1",
                  orden: 1,
                  tipo_paso: { id: "tp1", codigo: "conectar", nombre: "Conectar" },
                  contenidos: [
                    {
                      id: "c-sem",
                      grupo_edad_id: "sem",
                      titulo: "Contenido de otra franja",
                      cuerpo: "Texto largo de otra franja no seleccionada",
                    },
                  ],
                  preguntas: [],
                },
              ],
              error: null,
            });
          }
          return chain;
        },
        range: () => chain,
        limit: () => Promise.resolve({ data: [], error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => {
          if (table === "tema") {
            return {
              data: {
                id: "tema-1",
                senda_id: "senda-1",
                titulo: "Rut y Noemi",
                slug: "rut-y-noemi",
                objetivo: "Objetivo válido de más de diez letras",
                resumen: "Resumen válido de más de diez letras",
                version_biblica_id: "ver-1",
                estado: "borrador",
                minutos_estimados: 20,
                xp_recompensa: 100,
                grupos_edad: [
                  { grupo_edad: { id: "exp", codigo: "exploradores", nombre: "Exploradores" } },
                ],
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
      };
      return chain;
    };

    const repositorio = crearAdminRepository({
      supabase: { from: makeChain } as unknown as SupabaseClient<Database>,
    });

    const estudio = await repositorio.obtenerEstudioTema("tema-1");
    expect(estudio.completitud.franjas_detalle).toHaveLength(1);
    expect(estudio.completitud.franjas_detalle[0]?.grupo_edad_id).toBe("exp");
    expect(estudio.completitud.estadisticas.grupos_edad).toBe(1);
    expect(estudio.completitud.estadisticas.contenidos_esperados).toBe(6);
    expect(estudio.completitud.estadisticas.contenidos_creados).toBe(0);
    expect(estudio.completitud.estadisticas.actividades).toBe(0);
  });
});
