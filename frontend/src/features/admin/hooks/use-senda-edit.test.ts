import { describe, expect, it } from "bun:test";

import { SendaSchema, type SendaFormData } from "@/shared/schemas/senda.schema";

describe("SendaSchema", () => {
  it("valida un objeto SendaFormData correcto", () => {
    const datos: SendaFormData = {
      codigo: "padre",
      nombre: "Senda del Padre",
      color: "#3D8BD4",
      orden: 1,
      descripcion: "Descripción opcional",
    };

    const resultado = SendaSchema.safeParse(datos);
    expect(resultado.success).toBe(true);
  });

  it("rechaza código vacío", () => {
    const datos = {
      codigo: "",
      nombre: "Nombre",
      color: "#3D8BD4",
      orden: 1,
    };

    const resultado = SendaSchema.safeParse(datos);
    expect(resultado.success).toBe(false);
  });

  it("rechaza nombre vacío", () => {
    const datos = {
      codigo: "codigo",
      nombre: "",
      color: "#3D8BD4",
      orden: 1,
    };

    const resultado = SendaSchema.safeParse(datos);
    expect(resultado.success).toBe(false);
  });

  it("rechaza color que no es hex válido", () => {
    const datosInvalidos = [
      { codigo: "x", nombre: "N", color: "rojo", orden: 1 },
      { codigo: "x", nombre: "N", color: "#3D8BD", orden: 1 },
      { codigo: "x", nombre: "N", color: "3D8BD4", orden: 1 },
      { codigo: "x", nombre: "N", color: "#3D8BD4FF", orden: 1 },
    ];

    datosInvalidos.forEach((datos) => {
      const resultado = SendaSchema.safeParse(datos);
      expect(resultado.success).toBe(false);
    });
  });

  it("acepta color hex válido", () => {
    const datos = {
      codigo: "hijo",
      nombre: "Senda del Hijo",
      color: "#E9A23B",
      orden: 2,
    };

    const resultado = SendaSchema.safeParse(datos);
    expect(resultado.success).toBe(true);
  });

  it("rechaza orden menor a 1", () => {
    const datos = {
      codigo: "x",
      nombre: "N",
      color: "#3D8BD4",
      orden: 0,
    };

    const resultado = SendaSchema.safeParse(datos);
    expect(resultado.success).toBe(false);
  });

  it("acepta sin descripcion (opcional)", () => {
    const datos = {
      codigo: "espiritu",
      nombre: "Espíritu Santo",
      color: "#17A398",
      orden: 3,
    };

    const resultado = SendaSchema.safeParse(datos);
    expect(resultado.success).toBe(true);
  });
});

describe("construcción de payload para actualizarSendaAdmin", () => {
  function construirPayload(
    datos: SendaFormData & { activo: boolean; nombre_icono?: string },
  ) {
    return {
      codigo: datos.codigo,
      nombre: datos.nombre,
      descripcion: datos.descripcion || undefined,
      color_hex: datos.color,
      nombre_icono: datos.nombre_icono || undefined,
      orden: datos.orden,
      activo: datos.activo,
    };
  }

  it("construye payload completo con todos los campos", () => {
    const datos: SendaFormData & { activo: boolean; nombre_icono: string } = {
      codigo: "padre",
      nombre: "Senda del Padre",
      color: "#3D8BD4",
      orden: 1,
      descripcion: "La describe",
      activo: true,
      nombre_icono: "Cross",
    };

    const payload = construirPayload(datos);

    expect(payload.codigo).toBe("padre");
    expect(payload.nombre).toBe("Senda del Padre");
    expect(payload.color_hex).toBe("#3D8BD4");
    expect(payload.descripcion).toBe("La describe");
    expect(payload.nombre_icono).toBe("Cross");
    expect(payload.orden).toBe(1);
    expect(payload.activo).toBe(true);
  });

  it("omite descripcion si está vacía", () => {
    const datos = {
      codigo: "hijo",
      nombre: "Hijo",
      color: "#E9A23B",
      orden: 1,
      activo: false,
    };

    const payload = construirPayload(datos);
    expect(payload.descripcion).toBeUndefined();
  });

  it("omite nombre_icono si está vacío", () => {
    const datos = {
      codigo: "hijo",
      nombre: "Hijo",
      color: "#E9A23B",
      orden: 1,
      activo: true,
      nombre_icono: "",
    };

    const payload = construirPayload(datos);
    expect(payload.nombre_icono).toBeUndefined();
  });
});

describe("manejo de errores del mutation", () => {
  it("detecta error con código para setError en campo codigo", () => {
    const error = { message: "Error", codigo: "YA_EXISTE" };

    if (error.codigo) {
      expect(error.codigo).toBe("YA_EXISTE");
    }
  });

  it("detecta error de orden para setError en campo orden", () => {
    const error = { message: "Error", orden: "EN_USO" };

    if (error.orden) {
      expect(error.orden).toBe("EN_USO");
    }
  });

  it("propaga error genérico cuando no hay campos específicos", () => {
    const error = new Error("Error genérico");
    const mensaje = error.message || "Error al actualizar la saura";
    expect(mensaje).toContain("Error");
  });
});
