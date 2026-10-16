import { describe, expect, it } from "bun:test";
import {
  createActivitySchema,
  ajustesSistemaSchema,
  createSendaSchema,
  createThemeSchema,
  reorderActivitiesSchema,
  resolveReviewSchema,
  submitReviewSchema,
  updateActivitySchema,
  updateSendaSchema,
  updateThemeSchema,
  upsertStepContentSchema
} from "./admin.schemas";

const temaId = "550e8400-e29b-41d4-a716-446655440000";
const grupoEdadId = "660e8400-e29b-41d4-a716-446655440000";
const pasoId = "770e8400-e29b-41d4-a716-446655440000";
const actividadId = "880e8400-e29b-41d4-a716-446655440000";

describe("admin.schemas", () => {
  it("acepta el DTO canónico en español para crear temas", () => {
    const resultado = createThemeSchema.safeParse({
      senda_id: temaId,
      titulo: "La creación",
      slug: "la-creacion",
      objetivo: "Que el niño entienda que Dios creó todo",
      resumen: "Historia de la creación",
      version_biblica_id: temaId,
      minutos_estimados: 10,
      xp_recompensa: 50,
      grupo_edad_ids: [grupoEdadId],
      portada_recurso_id: actividadId
    });

    expect(resultado.success).toBe(true);
  });

  it("acepta el DTO canónico en español para actualizar temas", () => {
    const resultado = updateThemeSchema.safeParse({
      senda_id: temaId,
      titulo: "La creación",
      slug: "la-creacion-actualizada",
      objetivo: "Que el niño entienda que Dios creó todo",
      resumen: "Historia de la creación",
      version_biblica_id: temaId,
      minutos_estimados: 12,
      xp_recompensa: 60,
      grupo_edad_ids: [grupoEdadId]
    });

    expect(resultado.success).toBe(true);
  });

  it("acepta el DTO canónico en español para crear contenido CRECER", () => {
    const resultado = upsertStepContentSchema.safeParse({
      tipo_paso_id: pasoId,
      grupo_edad_id: grupoEdadId,
      titulo: "Conectar",
      cuerpo: "Conecta con la historia bíblica",
      instruccion_corta: "Mira y escucha",
      recurso_id: actividadId,
      recurso_audio_id: temaId,
      datos_extra: { color: "verde", mostrar_versiculo: true },
      preguntas: [
        { pregunta: "¿Cómo has experimentado el amor de Dios?", orden: 1 }
      ]
    });

    expect(resultado.success).toBe(true);
  });

  it("acepta el DTO canónico en español para crear actividades", () => {
    const resultado = createActivitySchema.safeParse({
      tema_id: temaId,
      paso_id: pasoId,
      grupo_edad_id: grupoEdadId,
      tipo_actividad_id: actividadId,
      titulo: "Pregunta",
      consigna: "Selecciona la respuesta correcta",
      orden: 1,
      xp_recompensa: 10,
      limite_tiempo_seg: 30,
      dificultad: "facil",
      obligatorio: true,
      retroalimentacion: "Bien hecho",
      configuracion: { intentos: 3 },
      opciones: [
        {
          etiqueta: "A",
          texto: "Dios",
          correcta: true,
          orden: 1,
          retroalimentacion: "Correcto"
        }
      ]
    });

    expect(resultado.success).toBe(true);
  });

  it("acepta el DTO canónico en español para actualizar actividades", () => {
    const resultado = updateActivitySchema.safeParse({
      titulo: "Pregunta",
      consigna: "Selecciona la respuesta correcta",
      retroalimentacion: "Bien hecho",
      orden: 1,
      xp_recompensa: 10,
      limite_tiempo_seg: 30,
      dificultad: "facil",
      obligatorio: true,
      configuracion: { intentos: 3 },
      opciones: [
        {
          etiqueta: "A",
          texto: "Dios",
          correcta: true,
          orden: 1,
          retroalimentacion: "Correcto"
        }
      ]
    });

    expect(resultado.success).toBe(true);
  });
  it("valida el orden persistente de actividades", () => {
    const resultado = reorderActivitiesSchema.safeParse({
      actividad_ids: [actividadId, temaId]
    });

    expect(resultado.success).toBe(true);
  });

  it("valida el flujo de revisión editorial", () => {
    expect(submitReviewSchema.safeParse({ notas: "Listo para revisión" }).success).toBe(true);
    expect(resolveReviewSchema.safeParse({ estado: "aprobado", notas: "Contenido verificado" }).success).toBe(true);
    expect(resolveReviewSchema.safeParse({ estado: "publicado" }).success).toBe(false);
  });

  it("acepta una imagen de recurso válida al crear y actualizar una senda", () => {
    const entrada = {
      codigo: "padre",
      nombre: "Senda del Padre",
      color_hex: "#3D8BD4",
      orden: 1,
      imagen_recurso_id: "550e8400-e29b-41d4-a716-446655440099"
    };

    expect(createSendaSchema.safeParse(entrada).success).toBe(true);
    expect(updateSendaSchema.safeParse({ imagen_recurso_id: entrada.imagen_recurso_id }).success).toBe(true);
    expect(updateSendaSchema.safeParse({ imagen_recurso_id: "no-es-uuid" }).success).toBe(false);
  });

  it("acepta el DTO de ajustes del panel admin", () => {
    expect(ajustesSistemaSchema.safeParse({
      nombre_plataforma: "Semillas",
      correo_soporte: "soporte@semillas.org",
      zona_horaria: "America/Guayaquil",
      notas_obligatorias_cambios: true,
      notas_obligatorias_rechazo: true
    }).success).toBe(true);

    expect(ajustesSistemaSchema.safeParse({
      correo_soporte: ""
    }).success).toBe(false);
  });

});
