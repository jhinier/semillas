import { describe, expect, it } from "bun:test";
import { serializarActividad } from "./actividad.serializer";
import { serializarPerfil } from "./perfil.serializer";
import { serializarProgresoActividad, serializarProgresoTema, serializarNivelUsuario } from "./progreso.serializer";
import { serializarTema, serializarTemaDetalle } from "./tema.serializer";
import { serializarUsuario } from "./usuario.serializer";

describe("serializadores", () => {
  it("serializa usuario con claves exactas en español", () => {
    expect(
      serializarUsuario({
        id: "usuario-1",
        rol: "usuario",
        proveedor: "google",
        nombre_visible: "Semillero",
        correo: "semillero@ejemplo.com"
      })
    ).toEqual({
      id: "usuario-1",
      rol: "usuario",
      proveedor: "google",
      nombre_visible: "Semillero",
      correo: "semillero@ejemplo.com"
    });
  });

  it("serializa perfil con claves exactas en español", () => {
    expect(
      serializarPerfil({
        id: "perfil-1",
        usuario_id: "usuario-1",
        apodo: "Semillero",
        grupo_edad_id: "grupo-1",
        url_avatar: "https://cdn.ejemplo.com/avatar.png",
        clave_avatar: "semilla",
        prefiere_audio: true,
        tamano_texto_preferido: "medio"
      })
    ).toEqual({
      id: "perfil-1",
      usuario_id: "usuario-1",
      apodo: "Semillero",
      grupo_edad_id: "grupo-1",
      url_avatar: "https://cdn.ejemplo.com/avatar.png",
      clave_avatar: "semilla",
      prefiere_audio: true,
      tamano_texto_preferido: "medio"
    });
  });

  it("serializa tema con claves exactas en español", () => {
    expect(
      serializarTema({
        id: "tema-1",
        senda_id: "senda-1",
        titulo: "La creación",
        slug: "la-creacion",
        objetivo: "Entender que Dios creó todo",
        resumen: "Resumen",
        portada_recurso_id: "recurso-1",
        estado: "publicado",
        version_biblica_id: "biblia-1",
        xp_recompensa: 50,
        minutos_estimados: 15,
        version_contenido: 2,
        publicado_en: "2026-01-01T00:00:00.000Z"
      })
    ).toEqual({
      id: "tema-1",
      senda_id: "senda-1",
      titulo: "La creación",
      slug: "la-creacion",
      objetivo: "Entender que Dios creó todo",
      resumen: "Resumen",
      portada_recurso_id: "recurso-1",
      portada_recurso: null,
      estado: "publicado",
      version_biblica_id: "biblia-1",
      xp_recompensa: 50,
      minutos_estimados: 15,
      version_contenido: 2,
      publicado_en: "2026-01-01T00:00:00.000Z",
      senda: null
    });
  });

  it("serializa tema detallado con senda, portada, versiculo y referencia biblica", () => {
    expect(
      serializarTemaDetalle({
        id: "tema-1",
        senda_id: "senda-1",
        titulo: "La creación",
        slug: "la-creacion",
        objetivo: "Entender que Dios creó todo",
        resumen: "Resumen",
        portada_recurso_id: "recurso-1",
        estado: "publicado",
        version_biblica_id: "biblia-1",
        xp_recompensa: 50,
        minutos_estimados: 15,
        version_contenido: 2,
        publicado_en: "2026-01-01T00:00:00.000Z",
        senda: {
          id: "senda-1",
          codigo: "PADRE",
          nombre: "Senda del Padre",
          descripcion: "Senda del Padre Celestial",
          color_hex: "#3D8BD4",
          nombre_icono: "crown",
          orden: 1
        },
        portada_recurso: {
          id: "recurso-1",
          tipo: "imagen",
          url_publica: "https://cdn.ejemplo.com/portada.png",
          texto_alternativo: "Portada del tema",
          titulo: "Portada",
          tipo_mime: "image/png",
          tamano_bytes: 102400,
          duracion_seg: null,
          ancho_px: 1280,
          alto_px: 720
        },
        versiculo_clave: {
          id: "versiculo-1",
          tema_id: "tema-1",
          texto: "En el principio creo Dios los cielos y la tierra.",
          libro_id: 1,
          capitulo: 1,
          versiculo: 1
        },
        referencias_biblicas: [
          {
            id: "ref-1",
            tema_id: "tema-1",
            libro_id: 1,
            capitulo: 1,
            versiculo_inicio: 1,
            versiculo_fin: 3,
            principal: true
          }
        ]
      })
    ).toEqual({
      id: "tema-1",
      senda_id: "senda-1",
      titulo: "La creación",
      slug: "la-creacion",
      objetivo: "Entender que Dios creó todo",
      resumen: "Resumen",
      portada_recurso_id: "recurso-1",
      estado: "publicado",
      version_biblica_id: "biblia-1",
      xp_recompensa: 50,
      minutos_estimados: 15,
      version_contenido: 2,
      publicado_en: "2026-01-01T00:00:00.000Z",
      senda: {
        id: "senda-1",
        codigo: "PADRE",
        nombre: "Senda del Padre",
        descripcion: "Senda del Padre Celestial",
        color_hex: "#3D8BD4",
        nombre_icono: "crown",
        orden: 1
      },
      portada_recurso: {
        id: "recurso-1",
        tipo: "imagen",
        url_publica: "https://cdn.ejemplo.com/portada.png",
        texto_alternativo: "Portada del tema",
        titulo: "Portada",
        tipo_mime: "image/png",
        tamano_bytes: 102400,
        duracion_seg: null,
        ancho_px: 1280,
        alto_px: 720
      },
      versiculo_clave: {
        id: "versiculo-1",
        tema_id: "tema-1",
        texto: "En el principio creo Dios los cielos y la tierra.",
        libro_id: 1,
        capitulo: 1,
        versiculo: 1
      },
      referencia_biblica: {
        id: "ref-1",
        tema_id: "tema-1",
        libro_id: 1,
        capitulo: 1,
        versiculo_inicio: 1,
        versiculo_fin: 3,
        principal: true
      }
    });
  });

  it("serializa actividad con claves exactas en español", () => {
    expect(
      serializarActividad({
        id: "actividad-1",
        tema_id: "tema-1",
        paso_id: "paso-1",
        grupo_edad_id: "grupo-1",
        tipo_actividad_id: "tipo-1",
        titulo: "Pregunta",
        consigna: "Selecciona la respuesta",
        orden: 1,
        xp_recompensa: 10,
        dificultad: "facil",
        limite_tiempo_seg: 30,
        obligatorio: true,
        retroalimentacion: "Bien",
        configuracion: { intentos: 3 },
        creado_en: "2026-01-01T00:00:00.000Z",
        actualizado_en: "2026-01-02T00:00:00.000Z",
        tipo_actividad: {
          id: "tipo-1",
          codigo: "QUIZ",
          nombre: "Quiz",
          descripcion: "Pregunta de selección múltiple",
          es_juego: true,
          activo: true,
          creado_en: "2026-01-01T00:00:00.000Z"
        },
        opciones: [
          {
            id: "opcion-2",
            actividad_id: "actividad-1",
            etiqueta: "B",
            texto: "Jesús",
            correcta: false,
            orden: 2,
            retroalimentacion: null
          },
          {
            id: "opcion-1",
            actividad_id: "actividad-1",
            etiqueta: "A",
            texto: "Dios",
            correcta: true,
            orden: 1,
            retroalimentacion: "Correcto"
          }
        ]
      })
    ).toEqual({
      id: "actividad-1",
      tema_id: "tema-1",
      paso_id: "paso-1",
      grupo_edad_id: "grupo-1",
      tipo_actividad_id: "tipo-1",
      titulo: "Pregunta",
      consigna: "Selecciona la respuesta",
      orden: 1,
      xp_recompensa: 10,
      dificultad: "facil",
      limite_tiempo_seg: 30,
      obligatorio: true,
      retroalimentacion: "Bien",
      configuracion: { intentos: 3 },
      creado_en: "2026-01-01T00:00:00.000Z",
      actualizado_en: "2026-01-02T00:00:00.000Z",
      tipo_actividad: {
        id: "tipo-1",
        codigo: "QUIZ",
        nombre: "Quiz",
        descripcion: "Pregunta de selección múltiple",
        es_juego: true,
        activo: true,
        creado_en: "2026-01-01T00:00:00.000Z"
      },
      opciones: [
        {
          id: "opcion-1",
          actividad_id: "actividad-1",
          etiqueta: "A",
          texto: "Dios",
          orden: 1
        },
        {
          id: "opcion-2",
          actividad_id: "actividad-1",
          etiqueta: "B",
          texto: "Jesús",
          orden: 2
        }
      ]
    });
  });

  it("serializa progreso con claves exactas en español", () => {
    expect(
      serializarProgresoTema({
        usuario_id: "usuario-1",
        tema_id: "tema-1",
        estado: "en_progreso",
        porcentaje: 50,
        iniciado_en: "2026-01-01T00:00:00.000Z",
        completado_en: null,
        ultimo_paso_id: "paso-1",
        actualizado_en: "2026-01-02T00:00:00.000Z"
      })
    ).toEqual({
      usuario_id: "usuario-1",
      tema_id: "tema-1",
      estado: "en_progreso",
      porcentaje: 50,
      iniciado_en: "2026-01-01T00:00:00.000Z",
      completado_en: null,
      ultimo_paso_id: "paso-1",
      actualizado_en: "2026-01-02T00:00:00.000Z"
    });

    expect(
      serializarProgresoActividad({
        usuario_id: "usuario-1",
        actividad_id: "actividad-1",
        intentos: 2,
        mejor_puntaje: 100,
        completado: true,
        completado_en: "2026-01-02T00:00:00.000Z",
        actualizado_en: "2026-01-03T00:00:00.000Z"
      })
    ).toEqual({
      usuario_id: "usuario-1",
      actividad_id: "actividad-1",
      intentos: 2,
      mejor_puntaje: 100,
      completado: true,
      completado_en: "2026-01-02T00:00:00.000Z",
      actualizado_en: "2026-01-03T00:00:00.000Z"
    });
  });

  it("serializa el nivel del usuario con claves exactas en español", () => {
    expect(
      serializarNivelUsuario({
        usuario_id: "usuario-1",
        xp_total: 150,
        numero_nivel: 3,
        nombre_nivel: "Explorador"
      })
    ).toEqual({
      usuario_id: "usuario-1",
      xp_total: 150,
      numero_nivel: 3,
      nombre_nivel: "Explorador"
    });
  });
});
