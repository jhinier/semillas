import { expect, test } from "bun:test";
import { crearPayloadCompartirInsignia } from "./share-payload";

test("comparte solo datos públicos de la insignia", () => {
  const payload = crearPayloadCompartirInsignia({ nombreInsignia: "Luz", xp: 25 });
  expect(payload).toEqual({
    title: "Insignia obtenida en Semillas",
    text: '¡Obtuve la insignia "Luz" en Semillas y gané +25 XP! 🌱',
  });
  expect(payload.text).not.toMatch(/@|usuario|edad|club|uuid|http/i);
});

test("normaliza XP negativo y limita nombres", () => {
  const payload = crearPayloadCompartirInsignia({ nombreInsignia: "  Luz  ", xp: -3.8 });
  expect(payload.text).toContain('"Luz"');
  expect(payload.text).toContain("+0 XP");
});
