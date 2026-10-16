import { test, expect, describe } from "bun:test";
import { mapearActividadParaTabla, filtrarActividades, contarPorTipo, contarPorEstado } from "./actividades-table.helpers";
import { mapearTemaParaTabla, filtrarTemas, contarTemasPorEstado, getFranjaEdadText, getSendaInfo } from "./temas-table.helpers";
import type { ActividadAdmin } from "../admin.api";
import type { Tema, GrupoEdad } from "@/shared/api/api";

describe("actividades-table.helpers", () => {
  const mockActividad: ActividadAdmin = {
    id: "act-1",
    titulo: "Quiz sobre la creación",
    consigna: "¿Cuántos días duró la creación?",
    tipo_actividad_id: "tipo-1",
    tema_id: "tema-1",
    paso_id: "paso-1",
    grupo_edad_id: "grupo-1",
    xp_recompensa: 15,
    dificultad: "facil",
    obligatorio: true,
    creado_en: "2026-01-15T10:00:00Z",
    tipo_actividad: { id: "tipo-1", codigo: "quiz", nombre: "Quiz" },
    tema: { id: "tema-1", titulo: "La Creación", slug: "la-creacion", estado: "publicado", senda: { nombre: "Padre" } },
  } as ActividadAdmin;

  const mockAgeGroups: GrupoEdad[] = [{ id: "grupo-1", nombre: "Semillas (5-8)", codigo: "semillas", edad_minima: 5, edad_maxima: 8, descripcion: "", orden: 1 }];

  test("mapearActividadParaTabla convierte datos de BD a formato de tabla", () => {
    const resultado = mapearActividadParaTabla(mockActividad, mockAgeGroups);
    expect(resultado.id).toBe("act-1");
    expect(resultado.titulo).toBe("Quiz sobre la creación");
    expect(resultado.tipoCodigo).toBe("quiz");
    expect(resultado.temaNombre).toBe("La Creación");
    expect(resultado.xp).toBe(15);
    expect(resultado.estado).toBe("publicada");
  });

  test("filtrarActividades filtra por tab activo", () => {
    const actividades = [
      { ...mapearActividadParaTabla(mockActividad, mockAgeGroups), estado: "borrador" },
      { ...mapearActividadParaTabla({ ...mockActividad, id: "act-2", obligatorio: false }, mockAgeGroups), estado: "borrador" },
    ];
    const resultado = filtrarActividades(actividades, {
      activeTab: "publicada", searchValue: "", selectedSendaId: "", selectedTemaId: "",
      selectedAgeGroupId: "", sendasBase: [], temasBase: [], ageGroupsBase: mockAgeGroups,
    });
    expect(resultado.length).toBe(0);
  });

  test("contarPorTipo cuenta actividades por tipo", () => {
    const actividades = [
      mapearActividadParaTabla(mockActividad, mockAgeGroups),
      mapearActividadParaTabla({ ...mockActividad, id: "act-2", tipo_actividad: { id: "t2", codigo: "flashcard", nombre: "Flashcard" } }, mockAgeGroups),
    ];
    const stats = contarPorTipo(actividades);
    expect(stats.quiz).toBe(1);
    expect(stats.flashcards).toBe(1);
    expect(stats.todos).toBe(2);
  });

  test("contarPorEstado cuenta actividades por estado", () => {
    const actividades = [
      { ...mapearActividadParaTabla(mockActividad, mockAgeGroups), estado: "publicada" },
      { ...mapearActividadParaTabla({ ...mockActividad, id: "act-2" }, mockAgeGroups), estado: "borrador" },
    ];
    const stats = contarPorEstado(actividades);
    expect(stats.publicadas).toBe(1);
    expect(stats.borradores).toBe(1);
  });
});

describe("temas-table.helpers", () => {
  const mockTema = {
    id: "tema-1",
    titulo: "La Creación",
    resumen: "Dios creó el mundo",
    estado: "publicado",
    senda_id: "senda-1",
    senda: { id: "senda-1", nombre: "Padre", color_hex: "#3D8BD4", codigo: "padre" },
    grupos_edad: [{ id: "g1", nombre: "Semillas", codigo: "semillas", edad_minima: 5, edad_maxima: 8, descripcion: "", orden: 1 }],
    creado_por: { id: "user-1", nombre_visible: "Admin" },
    actualizado_en: "2026-01-15T10:00:00Z",
    publicado_en: "2026-01-16T10:00:00Z",
  } as unknown as Tema;

  test("getFranjaEdadText formatea franjas de edad", () => {
    expect(getFranjaEdadText(mockTema.grupos_edad)).toBe("5–8 años");
    expect(getFranjaEdadText(undefined)).toBe("");
  });

  test("getSendaInfo retorna senda del tema cuando existe", () => {
    const info = getSendaInfo(mockTema);
    expect(info.nombre).toBe("Padre");
    expect(info.colorHex).toBe("#3D8BD4");
  });

  test("getSendaInfo retorna senda por defecto cuando no hay senda ni lista", () => {
    const temaSinSenda = { ...mockTema, senda: null } as unknown as Tema;
    const info = getSendaInfo(temaSinSenda);
    expect(info.nombre).toBe("Sin senda");
  });

  test("mapearTemaParaTabla genera TableRow válido", () => {
    const resultado = mapearTemaParaTabla(mockTema, undefined, null);
    expect(resultado.id).toBe("tema-1");
    expect(resultado.titulo).toBe("La Creación");
    expect(resultado.sendaNombre).toBe("Padre");
    expect(resultado.estado).toBe("publicado");
  });

  test("filtrarTemas filtra por tab de estado", () => {
    const temas = [
      mapearTemaParaTabla(mockTema, undefined, null),
      mapearTemaParaTabla({ ...mockTema, id: "tema-2", estado: "borrador" } as Tema, undefined, null),
    ];
    const resultado = filtrarTemas(temas, {
      activeTab: "publicado", searchValue: "", selectedSendaId: "", selectedAgeGroupId: "",
      sendasData: undefined, ageGroupsData: undefined,
    });
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.estado).toBe("publicado");
  });

  test("contarTemasPorEstado cuenta por estado", () => {
    const temas = [
      mapearTemaParaTabla(mockTema, undefined, null),
      mapearTemaParaTabla({ ...mockTema, id: "tema-2", estado: "borrador" } as Tema, undefined, null),
    ];
    const stats = contarTemasPorEstado(temas);
    expect(stats.publicados).toBe(1);
    expect(stats.borradores).toBe(1);
    expect(stats.todos).toBe(2);
  });
});
