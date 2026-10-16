import { describe, expect, it } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";

import type { Actividad } from "@/shared/api/api";
import { ActividadWrapper } from "./actividad-wrapper";

function crearActividad(codigo: string, opciones: Actividad["opciones"]): Actividad {
  return {
    id: "actividad-1",
    tema_id: "tema-1",
    paso_id: null,
    grupo_edad_id: "grupo-1",
    tipo_actividad_id: "tipo-1",
    titulo: "Escucha la lección",
    consigna: "Escucha con atención.",
    orden: 1,
    xp_recompensa: 10,
    dificultad: "facil",
    limite_tiempo_seg: null,
    obligatorio: true,
    retroalimentacion: null,
    configuracion: { audio_url: "https://media.example/leccion.mp3" },
    tipo_actividad: {
      id: "tipo-1",
      codigo,
      nombre: codigo,
      descripcion: null,
      es_juego: false,
      activo: true,
      creado_en: "2026-01-01T00:00:00.000Z",
    },
    opciones,
  };
}

function renderizarActividad(actividad: Actividad) {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <ActividadWrapper actividad={actividad} onComplete={() => undefined} />
    </QueryClientProvider>,
  );
}

describe("ActividadWrapper", () => {
  it("prioriza el reproductor de audio aunque existan opciones legadas", () => {
    const actividad = crearActividad("actividad_audio", [
      {
        id: "opcion-1",
        actividad_id: "actividad-1",
        etiqueta: "A",
        texto: "Dato legado",
        orden: 1,
      },
    ]);

    const html = renderizarActividad(actividad);

    expect(html).toContain("Actividad Audio");
    expect(html).toContain('src="https://media.example/leccion.mp3"');
  });

  it("usa el reproductor de opciones para cuestionarios con opciones", () => {
    const actividad = crearActividad("cuestionario", [
      {
        id: "opcion-1",
        actividad_id: "actividad-1",
        etiqueta: "A",
        texto: "Respuesta correcta",
        orden: 1,
        correcta: true,
      },
    ]);

    const html = renderizarActividad(actividad);

    expect(html).toContain("Respuesta correcta");
    expect(html).not.toContain("Actividad Audio");
  });

  it("selecciona el renderer canónico de video para un paquete offline", () => {
    const actividad = crearActividad("actividad_video", []);
    actividad.configuracion = { video_url: "https://media.example/leccion.mp4" };

    const html = renderizarActividad(actividad);

    expect(html).toContain("<video");
    expect(html).toContain("leccion.mp4");
  });
});
