import { describe, expect, it } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { crearAdminGovernanceRepository } from "./admin-governance.repository";

describe("admin-governance.repository", () => {
  it("lista revisiones paginadas con filtro de estado y búsqueda", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.listarRevisiones({ q: "creación", estado: "enviado", limit: 20, offset: 0 })).resolves.toEqual({
      revisiones: [],
      total: 0,
      limit: 20,
      offset: 0
    });
  });

  it("obtiene una revisión por su identificador", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.obtenerRevision("revision-1")).rejects.toThrow("Revisión no encontrada");
  });

  it("resuelve una revisión y registra al administrador que la resolvió", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.resolverRevision("revision-1", { estado: "aprobado" }, "admin-1")).rejects.toThrow("Revisión no encontrada");
  });

  it("obtiene reportes dentro del rango solicitado", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.obtenerReportes({ desde: "2026-07-01", hasta: "2026-07-13" })).resolves.toBeDefined();
  });

  it("actualiza los ajustes de plataforma y los audita", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.actualizarAjustes({
      nombre_plataforma: "Semillas",
      correo_soporte: "",
      zona_horaria: "America/Guayaquil",
      notas_obligatorias_cambios: true,
      notas_obligatorias_rechazo: true
    }, "admin-1")).resolves.toBeDefined();
  });

  it("crea una cuenta administrativa sin exponer la contraseña", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.crearUsuario({
      correo: "admin@semillas.test",
      password: "contrasena-segura",
      nombre_visible: "Administradora",
      rol: "administrador",
      prefiere_audio: true,
      tamano_texto_preferido: "mediano",
      confirmar_correo: true
    }, "admin-1")).resolves.toBeDefined();
  });

  it("usa revision_contenido como respaldo cuando v_admin_revisiones falla y filtra por texto", async () => {
    const supabaseMock = {
      from(tabla: string) {
        if (tabla === "v_admin_revisiones") {
          return {
            select() {
              return {
                or() { return this; },
                eq() { return this; },
                async range() {
                  return { data: null, count: null, error: { code: "42P01", message: "relation v_admin_revisiones does not exist" } };
                },
              };
            },
          };
        }
        return {
          select() {
            return {
              order() { return this; },
              eq() { return this; },
              async limit() {
                return {
                  data: [
                    {
                      id: "rev-1",
                      tema_id: "tema-1",
                      estado: "enviado",
                      notas: "Listo para revisar",
                      creado_en: "2026-11-15T10:00:00.000Z",
                      revisado_en: null,
                      tema: { titulo: "La Creación de Dios", senda: { nombre: "Senda del Padre" } },
                      enviado: { nombre_visible: "Mateo" },
                      revisado: null,
                    },
                    {
                      id: "rev-2",
                      tema_id: "tema-2",
                      estado: "enviado",
                      notas: "Otro tema",
                      creado_en: "2026-11-15T09:00:00.000Z",
                      revisado_en: null,
                      tema: { titulo: "El Buen Pastor", senda: { nombre: "Senda del Hijo" } },
                      enviado: { nombre_visible: "Ana" },
                      revisado: null,
                    },
                  ],
                  count: 2,
                  error: null,
                };
              },
            };
          },
        };
      },
    } as unknown as SupabaseClient<Database>;

    const repositorio = crearAdminGovernanceRepository({ supabase: supabaseMock });
    const resultado = await repositorio.listarRevisiones({ q: "creación", estado: "enviado", limit: 20, offset: 0 });
    expect(resultado.total).toBe(1);
    expect(resultado.revisiones[0]).toMatchObject({
      id: "rev-1",
      tema_id: "tema-1",
      titulo: "La Creación de Dios",
      senda: "Senda del Padre",
      enviado_por: "Mateo",
      notas_envio: "Listo para revisar",
    });
  });

  it("consulta columnas válidas en obtenerReportes y envuelve errores PostgREST como Error", async () => {
    const seleccionesPorTabla: Record<string, string> = {};
    const crearBuilder = (tabla: string, selectCols: string, resultadoFinal: Record<string, unknown>) => {
      seleccionesPorTabla[tabla] = selectCols;
      const builder: Record<string, unknown> = {
        eq() { return builder; },
        gte() { return builder; },
        lte() { return builder; },
        limit() { return Promise.resolve(resultadoFinal); },
        then(resolve: (val: unknown) => unknown) {
          return Promise.resolve(resultadoFinal).then(resolve);
        },
      };
      return builder;
    };

    const supabaseOk = {
      from(tabla: string) {
        return {
          select(cols: string) {
            if (tabla === "usuario_app" && cols === "rol") {
              return crearBuilder("usuario_app:rol", cols, {
                data: [{ rol: "administrador" }, { rol: "usuario" }, { rol: "usuario" }],
                error: null,
              });
            }
            if (tabla === "tema" && cols.includes("titulo")) {
              return crearBuilder("tema:estados", cols, {
                data: [{ id: "t-1", titulo: "El Amor de Dios", estado: "publicado" }],
                error: null,
              });
            }
            if (tabla === "evento_progreso") {
              return crearBuilder(tabla, cols, {
                data: [
                  { ocurrido_en_cliente: "2026-11-15T12:00:00.000Z", usuario_id: "u-1", tipo_evento: "tema_completado", tema_id: "t-1", correcta: true, xp_otorgada: 50 },
                ],
                error: null,
              });
            }
            return crearBuilder(tabla, cols, { count: 2, data: null, error: null });
          },
        };
      },
    } as unknown as SupabaseClient<Database>;

    const repoOk = crearAdminGovernanceRepository({ supabase: supabaseOk });
    const reporte = await repoOk.obtenerReportes({ desde: "2026-10-17", hasta: "2026-11-15" });
    expect(seleccionesPorTabla.progreso_actividad_usuario).toBe("actividad_id");
    expect(seleccionesPorTabla.progreso_tema_usuario).toBe("tema_id");
    expect(reporte.metricas).toMatchObject({
      usuarios_activos: 2,
      actividades_completadas: 2,
      temas_completados: 2,
      xp_otorgada: 50,
      precision_respuestas: 100,
    });
    expect(reporte.distribucion_roles).toEqual({ administrador: 1, usuario: 2 });

    const supabaseFail = {
      from() {
        return {
          select(cols: string) {
            return crearBuilder("fail", cols, { data: null, count: null, error: { code: "42703", message: "column missing" } });
          },
        };
      },
    } as unknown as SupabaseClient<Database>;

    const repoFail = crearAdminGovernanceRepository({ supabase: supabaseFail });
    await expect(repoFail.obtenerReportes({ desde: "2026-10-17", hasta: "2026-11-15" })).rejects.toBeInstanceOf(Error);
  });
});
