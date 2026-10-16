import { describe, expect, it } from "bun:test";

import { obtenerSeccionesSidebar } from "./app-sidebar";

describe("obtenerSeccionesSidebar", () => {
  it("solo expone navegación base en modo app", () => {
    const secciones = obtenerSeccionesSidebar("app");
    const principal = secciones[0]!;

    expect(secciones).toHaveLength(1);
    expect(principal.items[0]!.label).toBe("Inicio");
  });

  it("agrega navegación de administración en modo admin", () => {
    const secciones = obtenerSeccionesSidebar("admin");
    const admin = secciones[0]!;

    expect(secciones).toHaveLength(1);
    expect(admin.titulo).toBe("Administración");
    expect(admin.items[0]!.label).toBe("Dashboard");
    expect(admin.items.some((item) => item.to === "/admin/sendas")).toBe(false);
  });
});
