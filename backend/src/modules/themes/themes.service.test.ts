import { describe, expect, it, mock } from "bun:test";
import { crearThemesService } from "./themes.service";

describe("themes.service / crearPaqueteOffline", () => {
  it("arma un paquete offline, firma medios privados y registra la descarga", async () => {
    const listarRecursosPorIds = mock(async (ids: string[]) =>
      ids.map((id) => ({
        id,
        tipo: id.includes("audio") ? "audio" : "imagen",
        titulo: `Recurso ${id}`,
        urlPublica: `https://cdn.example.com/${id}.bin`,
        bucketAlmacenamiento: "media",
        claveAlmacenamiento: `private/${id}.bin`,
        tipoMime: id.includes("audio") ? "audio/mpeg" : "image/png",
        tamanoBytes: 1024,
        anchoPx: 800,
        altoPx: 600,
        duracionSeg: null,
        textoAlternativo: `Alt ${id}`,
        activo: true,
      }))
    );

    const registrarDescargaOffline = mock(async () => undefined);
    const guardarPaqueteOffline = mock(async () => ({ id: "paquete-1" }));

    const themes = {
      obtenerGrupoEdadUsuario: mock(async () => "grupo-edad-1"),
      temaDisponibleParaGrupo: mock(async () => true),
      obtenerTemaPublico: mock(async () => ({
        tema: {
          id: "tema-1",
          sendaId: "senda-1",
          titulo: "Noé",
          slug: "noe",
          objetivo: "Objetivo",
          resumen: "Resumen",
          portadaRecursoId: "recurso-portada",
          estado: "publicado",
          versionBiblicaId: null,
          xpRecompensa: 100,
          minutosEstimados: 15,
          versionContenido: 3,
          publicadoEn: new Date("2026-01-01T00:00:00.000Z"),
          creadoEn: new Date("2026-01-01T00:00:00.000Z"),
          actualizadoEn: new Date("2026-01-01T00:00:00.000Z"),
        },
        senda: {
          id: "senda-1",
          codigo: "padre",
          nombre: "Padre",
          descripcion: null,
          colorHex: "#123456",
          nombreIcono: null,
          orden: 1,
        },
        portada: {
          id: "recurso-portada",
          tipo: "imagen",
          urlPublica: "https://cdn.example.com/portada.png",
          titulo: "Portada",
          textoAlternativo: "Portada",
          tipoMime: "image/png",
          tamanoBytes: 2048,
          duracionSeg: null,
          anchoPx: 1200,
          altoPx: 800,
          bucketAlmacenamiento: "media",
          claveAlmacenamiento: "private/portada.png",
          activo: true,
        },
      })),
      listarPasosTema: mock(async () => [
        {
          paso: {
            id: "paso-1",
            temaId: "tema-1",
            tipoPasoId: "tipo-1",
            orden: 1,
            obligatorio: true,
          },
          tipoPaso: {
            id: "tipo-1",
            codigo: "conectar",
            nombre: "Conectar",
            descripcion: null,
            colorHex: "#abcdef",
            orden: 1,
          },
          contenidos: [
            {
              id: "contenido-1",
              pasoId: "paso-1",
              grupoEdadId: "grupo-edad-1",
              titulo: "Contenido",
              cuerpo: "Cuerpo",
              instruccionCorta: null,
              recursoId: "recurso-imagen",
              recursoAudioId: "recurso-audio",
              datosExtra: { imagenRecursoId: "recurso-extra" },
            },
          ],
          preguntas: [],
        },
      ]),
      listarActividadesTema: mock(async () => [
        {
          actividad: {
            id: "actividad-1",
            temaId: "tema-1",
            pasoId: "paso-1",
            grupoEdadId: "grupo-edad-1",
            tipoActividadId: "tipo-quiz",
            titulo: "Quiz",
            consigna: "Responde",
            orden: 1,
            xpRecompensa: 15,
            dificultad: "facil",
            limiteTiempoSeg: null,
            obligatorio: true,
            retroalimentacion: null,
            configuracion: { imagenRecursoId: "recurso-config" },
            creadoEn: new Date("2026-01-01T00:00:00.000Z"),
            actualizadoEn: new Date("2026-01-01T00:00:00.000Z"),
          },
          tipoActividad: {
            id: "tipo-quiz",
            codigo: "cuestionario",
            nombre: "Quiz",
            descripcion: null,
            esJuego: false,
            activo: true,
            creadoEn: new Date("2026-01-01T00:00:00.000Z"),
          },
          opciones: [],
        },
      ]),
      listarRecursosPorIds,
      obtenerPaqueteOffline: mock(async () => null),
      guardarPaqueteOffline,
      registrarDescargaOffline,
    } as const;

    const service = crearThemesService({
      themes: themes as never,
      crearSupabaseAdmin: () => ({
        storage: {
          from() {
            return {
              createSignedUrl: async (clave: string) => ({
                data: { signedUrl: `https://signed.example.com/${clave}` },
                error: null,
              }),
            };
          },
        },
      } as never),
    });

    const paquete = await service.crearPaqueteOffline(
      {
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      } as never,
      "usuario-1",
      "tema-1",
      "grupo-edad-1"
    );

    expect(paquete).not.toBeNull();
    expect(paquete?.paquete_id).toBe("paquete-1");
    expect(paquete?.tema.id).toBe("tema-1");
    expect(paquete?.medios.length).toBeGreaterThan(0);
    expect(paquete?.medios[0].url_descarga).toContain("signed.example.com");
    expect(listarRecursosPorIds).toHaveBeenCalled();
    expect(guardarPaqueteOffline).toHaveBeenCalledTimes(1);
    expect(registrarDescargaOffline).toHaveBeenCalledWith("usuario-1", "paquete-1");
  });
});
