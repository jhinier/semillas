import { describe, expect, it } from "bun:test";
import type { AppBindings } from "../../config/env";
import type { DbClient } from "../../db/client";
import { crearModuloThemes } from "./themes.routes";

const env: AppBindings["Bindings"] = {
  APP_ENV: "test",
  CORS_BASE_DOMAIN: "localhost",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "anon-key-de-prueba",
  SUPABASE_SERVICE_ROLE_KEY: "service-key-de-prueba"
};

function crearDbMock() {
  const listados = [
    {
      tema: {
        id: "550e8400-e29b-41d4-a716-446655440011",
        titulo: "La creación del mundo",
        slug: "la-creacion-del-mundo",
        resumen: "Dios creo todo",
        objetivo: "Aprender sobre la creación",
        estado: "publicado",
        xpRecompensa: 100,
        minutosEstimados: 10,
        versionContenido: 1,
        publicadoEn: new Date("2026-01-01T00:00:00.000Z"),
        sendaId: "senda-padre",
        portadaRecursoId: "recurso-1"
      },
      senda: {
        id: "senda-padre",
        nombre: "Senda del Padre",
        codigo: "padre",
        colorHex: "#3D8BD4"
      },
      portada: {
        id: "recurso-1",
        tipo: "imagen",
        urlPublica: "https://example.supabase.co/storage/v1/object/public/media/imagen/recurso-1.png",
        textoAlternativo: "Creación",
        tipoMime: "image/png",
        tamanoBytes: 102400,
        duracionSeg: null,
        anchoPx: 1280,
        altoPx: 720,
        bucketAlmacenamiento: "media",
        claveAlmacenamiento: "imagen/portadas/la-creacion-del-mundo.png",
        activo: true
      }
    }
  ];

  const detalle = listados[0];

  const pasos = [
    {
      paso: {
        id: "paso-1",
        temaId: "tema-1",
        tipoPasoId: "tipo-1",
        orden: 1,
        obligatorio: true
      },
      tipoPaso: {
        id: "tipo-1",
        codigo: "conectar",
        nombre: "Conectar",
        orden: 1,
        colorHex: "#123456"
      }
    }
  ];

  const actividades = [
    {
      actividad: {
        id: "act-1",
        temaId: "tema-1",
        pasoId: null,
        grupoEdadId: "grupo-1",
        tipoActividadId: "tipo-quiz",
        titulo: "Actividad 1",
        consigna: "Contesta",
        orden: 1,
        xpRecompensa: 10,
        dificultad: "facil",
        limiteTiempoSeg: null,
        obligatorio: true,
        retroalimentacion: null,
        configuracion: {},
        creadoEn: new Date(),
        actualizadoEn: new Date()
      },
      tipoActividad: {
        id: "tipo-quiz",
        codigo: "quiz",
        nombre: "Quiz",
        descripcion: null,
        esJuego: false,
        activo: true,
        creadoEn: new Date()
      },
      opciones: []
    }
  ];

  let queryIndex = 0;

  return {
    select(consulta?: Record<string, unknown>) {
      const claves = Object.keys(consulta ?? {}).join(",");

      return {
        from() {
          return {
            leftJoin() {
              return this;
            },
            where() {
              return {
                orderBy: async () => {
                  queryIndex += 1;

                  if (claves.includes("tema") && claves.includes("senda") && claves.includes("portada")) {
                    return listados;
                  }

                  if (claves.includes("estado") && claves.includes("portada")) {
                    return [detalle];
                  }

                  if (claves.includes("paso") && claves.includes("tipoPaso")) {
                    return pasos;
                  }

                  if (claves.includes("actividad") && claves.includes("tipoActividad")) {
                    return actividades;
                  }

                  return [];
                },
                limit: async () => {
                  if (claves.includes("tema") && claves.includes("senda") && claves.includes("portada")) {
                    return [detalle];
                  }

                  if (claves.includes("estado") && claves.includes("portada")) {
                    return [{ estado: "publicado", portada: detalle.portada }];
                  }

                  return [];
                }
              };
            }
          };
        }
      };
    }
  } as unknown as DbClient;
}

describe("themes.routes", () => {
  it("devuelve el listado de temas publicados y la portada firmada", async () => {
    const db = crearDbMock();
    const app = crearModuloThemes({
      db,
      createSupabaseAdmin: () => ({
        storage: {
          from() {
            return {
              createSignedUrl: async () => ({
                data: { signedUrl: "https://signed.example.com/portada.png?token=abc123" },
                error: null
              })
            };
          }
        }
      } as never)
    });

    const listado = await app.fetch(new Request("http://localhost/"), env);
    const cuerpoListado = (await listado.json()) as { exito: true; datos: Array<{ id: string; senda: { codigo: string } | null }> };

    expect(listado.status).toBe(200);
    expect(cuerpoListado.datos).toHaveLength(1);
    expect(cuerpoListado.datos[0].senda?.codigo).toBe("padre");

    const portada = await app.fetch(new Request("http://localhost/550e8400-e29b-41d4-a716-446655440011/portada"), env);
    const cuerpoPortada = (await portada.json()) as { exito: true; datos: { url: string; expira_en_segundos: number } };

    expect(portada.status).toBe(200);
    expect(cuerpoPortada.datos.url).toContain("token=abc123");
    expect(cuerpoPortada.datos.expira_en_segundos).toBe(300);
  });
});
