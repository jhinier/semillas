import { describe, expect, it } from "bun:test";
import {
  bulkUserActionSchema,
  createChildUserSchema,
  inviteUserSchema,
  updateUserSchema,
} from "./admin.schemas";

const uuid = "550e8400-e29b-41d4-a716-446655440000";

describe("admin user schemas", () => {
  it("valida invitaciones por correo", () => {
    expect(inviteUserSchema.safeParse({
      correo: "familia@example.com",
      nombre_visible: "Familia Pérez",
      rol: "padre",
      club_id: uuid,
    }).success).toBe(true);

    expect(inviteUserSchema.safeParse({
      correo: "correo-invalido",
      nombre_visible: "Familia Pérez",
      rol: "padre",
    }).success).toBe(false);
  });

  it("requiere franja y apodo para registrar menores", () => {
    expect(createChildUserSchema.safeParse({
      nombre_visible: "Mateo Pérez",
      apodo: "Mateo",
      grupo_edad_id: uuid,
    }).success).toBe(true);

    expect(createChildUserSchema.safeParse({
      nombre_visible: "Mateo Pérez",
      apodo: "",
      grupo_edad_id: uuid,
    }).success).toBe(false);
  });

  it("impide actualizaciones vacías y valida acciones masivas", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(false);
    expect(updateUserSchema.safeParse({ activo: false }).success).toBe(true);
    expect(bulkUserActionSchema.safeParse({
      usuario_ids: [uuid],
      accion: "desactivar",
    }).success).toBe(true);
  });
});
