import { describe, expect, it } from "bun:test";
import {
  actualizarClubAdminSchema,
  agregarMiembroAdminSchema,
  crearClubAdminSchema,
} from "./admin-clubs.schemas";

const UUID = "00000000-0000-4000-8000-000000000001";

describe("schemas administrativos de clubes", () => {
  it("valida la creación con un responsable inicial", () => {
    expect(crearClubAdminSchema.parse({
      nombre: "Exploradores de la Fe",
      descripcion: "Club de prueba",
      lider_usuario_id: UUID,
    })).toEqual({
      nombre: "Exploradores de la Fe",
      descripcion: "Club de prueba",
      lider_usuario_id: UUID,
    });
  });

  it("rechaza una actualización vacía", () => {
    expect(actualizarClubAdminSchema.safeParse({}).success).toBe(false);
  });

  it("valida el usuario que se agregará como miembro", () => {
    expect(agregarMiembroAdminSchema.parse({ usuario_id: UUID })).toEqual({ usuario_id: UUID });
  });
});
