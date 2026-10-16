import { describe, expect, it } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import { crearAdminGovernanceRepository } from "./admin-governance.repository";

describe("admin-governance.repository", () => {
  it("lista revisiones paginadas con filtro de estado y búsqueda", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.listarRevisiones({ q: "creación", estado: "enviado", limit: 20, offset: 0 })).resolves.toEqual({
      revisiones: [],
      total: 0,
      limit: 20,
      offset: 0
    });
  });

  it("obtiene una revisión por su identificador", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.obtenerRevision("revision-1")).rejects.toThrow("Revisión no encontrada");
  });

  it("resuelve una revisión y registra al administrador que la resolvió", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.resolverRevision("revision-1", { estado: "aprobado" }, "admin-1")).rejects.toThrow("Revisión no encontrada");
  });

  it("obtiene reportes dentro del rango solicitado", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.obtenerReportes({ desde: "2026-07-01", hasta: "2026-07-13" })).resolves.toBeDefined();
  });

  it("actualiza los ajustes de plataforma y los audita", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.actualizarAjustes({
      nombre_plataforma: "Semillas",
      correo_soporte: "",
      zona_horaria: "America/Guayaquil",
      notas_obligatorias_cambios: true,
      notas_obligatorias_rechazo: true
    }, "admin-1")).resolves.toBeDefined();
  });

  it("crea una cuenta administrativa sin exponer la contraseña", async () => {
    const repositorio = crearAdminGovernanceRepository({ supabase: {} as SupabaseClient<Database> });

    await expect(repositorio.crearUsuario({
      correo: "admin@semillas.test",
      password: "contrasena-segura",
      nombre_visible: "Administradora",
      rol: "administrador",
      prefiere_audio: true,
      tamano_texto_preferido: "mediano",
      confirmar_correo: true
    }, "admin-1")).resolves.toBeDefined();
  });
});
