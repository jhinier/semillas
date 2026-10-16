import { describe, expect, it } from "bun:test";
import { serializarMiembroClub, serializarRankingClub } from "./clubs.mapper";

const fila = {
  club_id: "club-interno",
  usuario_id: "usuario-interno",
  token_publico: "550e8400-e29b-41d4-a716-446655440000",
  rol_miembro: "miembro",
  unido_en: new Date("2026-07-01T00:00:00.000Z"),
  apodo: "Semillero",
  correo: "privado@example.com",
  edad: 11,
  nombre_visible: "Nombre real",
  clave_avatar: "2",
  url_avatar: null,
  xp_total: 10,
  xp_semana: 3,
  actividades_semana: 1,
  numero_ranking: 1,
};

describe("serializadores públicos de clubes", () => {
  it("no exponen PII ni IDs internos de miembros", () => {
    const miembro = serializarMiembroClub({ ...fila, es_actual: false });
    const ranking = serializarRankingClub({ ...fila, es_actual: false });

    expect(miembro).not.toHaveProperty("club_id");
    expect(miembro).not.toHaveProperty("usuario_id");
    expect(miembro).not.toHaveProperty("correo");
    expect(miembro).not.toHaveProperty("edad");
    expect(miembro).not.toHaveProperty("nombre_visible");
    expect(miembro.miembro_token).toBe(fila.token_publico);
    expect(ranking).not.toHaveProperty("usuario_id");
  });
});
