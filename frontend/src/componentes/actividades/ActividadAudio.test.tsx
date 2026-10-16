import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import type { Actividad } from "../../shared/api/api";
import { ActividadAudio } from "./ActividadAudio";

function crearActividad(configuracion: Actividad["configuracion"]): Actividad {
  return {
    id: "actividad-audio-1",
    tema_id: "tema-1",
    paso_id: null,
    grupo_edad_id: "grupo-1",
    tipo_actividad_id: "tipo-audio",
    titulo: "Canto de gratitud",
    consigna: "Escucha la canción.",
    orden: 1,
    xp_recompensa: 10,
    dificultad: "facil",
    limite_tiempo_seg: null,
    obligatorio: true,
    retroalimentacion: null,
    configuracion,
    tipo_actividad: null,
    opciones: [],
  };
}

describe("ActividadAudio", () => {
  it("usa audio_url configurada cuando contiene una URL no vacía", () => {
    const html = renderToStaticMarkup(
      <ActividadAudio
        actividad={crearActividad({ audio_url: " https://media.example/canto.mp3 " })}
        onComplete={() => undefined}
      />,
    );

    expect(html).toContain('src="https://media.example/canto.mp3"');
    expect(html).not.toContain("SoundHelix-Song-1.mp3");
  });

  it("mantiene el audio demo como fallback cuando no hay una URL válida", () => {
    const html = renderToStaticMarkup(
      <ActividadAudio actividad={crearActividad({ audio_url: "   " })} onComplete={() => undefined} />,
    );

    expect(html).toContain("SoundHelix-Song-1.mp3");
  });
});
