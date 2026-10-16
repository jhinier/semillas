import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

process.env.VITE_API_URL ??= "http://localhost";
process.env.VITE_SUPABASE_URL ??= "https://example.supabase.co";
process.env.VITE_SUPABASE_ANON_KEY ??= "test-anon-key";

const { NarradorPaso } = await import("./narrador-paso");

describe("NarradorPaso", () => {
  it("no renderiza controles cuando el paso no tiene audio o está deshabilitado", () => {
    expect(renderToStaticMarkup(<NarradorPaso recursoAudioId={null} habilitado />)).toBe("");
    expect(renderToStaticMarkup(<NarradorPaso recursoAudioId="audio-1" habilitado={false} />)).toBe("");
  });

  it("renderiza controles accesibles y progreso para un audio disponible", () => {
    const html = renderToStaticMarkup(<NarradorPaso recursoAudioId="audio-1" habilitado />);

    expect(html).toContain('aria-label="Narración del paso"');
    expect(html).toContain('aria-label="Reproducir narración"');
    expect(html).toContain('aria-label="Reiniciar narración"');
    expect(html).toContain('aria-label="Progreso de la narración"');
    expect(html).toContain("Narración disponible");
    expect(html).toContain('preload="metadata"');
  });
});
