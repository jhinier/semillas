import { describe, expect, it } from "bun:test";
import { mapearPaqueteOfflineARegistros, construirRutaMediaOffline } from "./offline-package";

describe("offline-package", () => {
  it("convierte el paquete offline en registros locales listos para Dexie", () => {
    const resultado = mapearPaqueteOfflineARegistros({
      schema_version: 1,
      generado_en: "2026-07-11T00:00:00.000Z",
      grupo_edad_id: "grupo-edad-1",
      paquete_id: "paquete-1",
      tamano_bytes: 4096,
      tema: {
        id: "tema-1",
        senda_id: "senda-1",
        titulo: "Noé",
        slug: "noe",
        objetivo: "Objetivo",
        resumen: "Resumen",
        portada_recurso_id: "recurso-1",
        estado: "publicado",
        version_biblica_id: null,
        xp_recompensa: 100,
        minutos_estimados: 15,
        version_contenido: 3,
        publicado_en: "2026-07-11T00:00:00.000Z",
        creado_en: "2026-07-10T00:00:00.000Z",
        actualizado_en: "2026-07-11T00:00:00.000Z",
        senda: null,
        portada_recurso: null,
      },
      pasos: [
        {
          id: "paso-1",
          tema_id: "tema-1",
          orden: 1,
          obligatorio: true,
          tipo_paso: null,
          contenidos: [],
          preguntas: [],
        },
      ],
      actividades: [
        {
          id: "actividad-1",
          tema_id: "tema-1",
          paso_id: "paso-1",
          grupo_edad_id: "grupo-edad-1",
          tipo_actividad_id: "tipo-video",
          tipo_actividad: {
            id: "tipo-video",
            codigo: "actividad_video",
            nombre: "Video",
            descripcion: "Video guiado",
            es_juego: false,
            activo: true,
            creado_en: "2026-07-11T00:00:00.000Z",
          },
          titulo: "Observa",
          consigna: "Mira el video",
          orden: 1,
          xp_recompensa: 10,
          dificultad: "facil",
          limite_tiempo_seg: null,
          obligatorio: true,
          retroalimentacion: null,
          configuracion: { video_url: "https://example.com/video.mp4" },
          opciones: [],
          creado_en: "2026-07-11T00:00:00.000Z",
          actualizado_en: "2026-07-11T00:00:00.000Z",
        },
      ],
      medios: [
        {
          id: "recurso-1",
          tipo: "imagen",
          titulo: "Portada",
          url_descarga: "https://signed.example.com/portada.png",
          texto_alternativo: "Portada",
          tipo_mime: "image/png",
          tamano_bytes: 1024,
          duracion_seg: null,
          ancho_px: 800,
          alto_px: 600,
        },
      ],
    });

    expect(resultado.tema.localId).not.toBe("tema-1");
    expect(resultado.tema.localId).toMatch(/^[0-9a-f-]{36}$/);
    expect(resultado.tema.paqueteId).toBe("paquete-1");
    expect(resultado.pasos[0]!.temaLocalId).toBe(resultado.tema.localId);
    expect(resultado.medios[0]!.urlLocal).toBe(construirRutaMediaOffline("recurso-1"));
    expect(resultado.actividades[0]!.tipoActividadCodigo).toBe("actividad_video");
    expect(resultado.actividades[0]!.configuracion).toEqual({ video_url: "https://example.com/video.mp4" });
    expect(resultado.tamanoMB).toBeGreaterThan(0);
  });
});
