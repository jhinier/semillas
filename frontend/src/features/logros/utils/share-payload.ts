export type ShareBadgeInput = {
  nombreInsignia: string;
  xp: number;
};

export type ShareBadgePayload = {
  title: string;
  text: string;
};

/** Construye un mensaje compartible sin identidad, franja, club ni URL privada. */
export function crearPayloadCompartirInsignia(input: ShareBadgeInput): ShareBadgePayload {
  const nombre = input.nombreInsignia.trim().slice(0, 120);
  const xp = Math.max(0, Math.floor(input.xp));
  return {
    title: "Insignia obtenida en Semillas",
    text: `¡Obtuve la insignia "${nombre}" en Semillas y gané +${xp} XP! 🌱`,
  };
}
