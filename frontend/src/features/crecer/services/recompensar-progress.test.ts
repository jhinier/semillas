import { describe, expect, it } from "bun:test";
import { completarTema } from "./recompensar-progress";

describe("completarTema", () => {
  it("no registra nada hasta invocarse y envía tema_completado al confirmar", async () => {
    const eventosEnviados: unknown[] = [];
    const registrar = async (eventos: unknown[]) => {
      eventosEnviados.push(eventos);
    };

    expect(eventosEnviados).toEqual([]);

    await completarTema(
      "550e8400-e29b-41d4-a716-446655440010",
      "550e8400-e29b-41d4-a716-446655440020",
      registrar,
    );

    expect(eventosEnviados).toHaveLength(1);
    expect(eventosEnviados[0]).toMatchObject([
      {
        tipo_evento: "tema_completado",
        tema_id: "550e8400-e29b-41d4-a716-446655440010",
        paso_id: "550e8400-e29b-41d4-a716-446655440020",
      },
    ]);
  });

  it("propaga el error de sincronización para permitir el reintento", async () => {
    const error = new Error("Sin conexión");

    await expect(
      completarTema("550e8400-e29b-41d4-a716-446655440010", undefined, async () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });
});
