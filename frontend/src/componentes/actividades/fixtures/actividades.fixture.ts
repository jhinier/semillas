import type { Actividad } from "../../../shared/api/schemas/temas.schema";

export const quizActividadFixture: Actividad = {
  id: "quiz-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-quiz",
  titulo: "Quiz sobre la Creación",
  consigna: "¿Cuánto sabes sobre la creación del mundo?",
  orden: 1,
  xp_recompensa: 20,
  dificultad: "facil",
  limite_tiempo_seg: null,
  obligatorio: true,
  retroalimentacion: "¡Muy bien! Has respondido correctamente todas las preguntas.",
  configuracion: {
    preguntas: [
      {
        pregunta: "¿En cuántos días creó Dios el mundo?",
        opciones: ["Cinco días", "Seis días", "Siete días", "Ocho días"],
        respuesta_correcta: 1,
      },
      {
        pregunta: "¿Qué creó Dios en el primer día?",
        opciones: ["Las plantas", "La luz", "Los animales", "El sol y la luna"],
        respuesta_correcta: 1,
      },
      {
        pregunta: "¿Quién creó al ser humano?",
        opciones: ["Dios", "Los ángeles", "La naturaleza", "Nadie"],
        respuesta_correcta: 0,
      },
    ],
  },
  opciones: [],
};

export const flashcardActividadFixture: Actividad = {
  id: "flash-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-flash",
  titulo: "Flashcards de Frutos del Espíritu",
  consigna: "Relaciona cada fruto con su significado.",
  orden: 2,
  xp_recompensa: 15,
  dificultad: "medio",
  limite_tiempo_seg: null,
  obligatorio: false,
  retroalimentacion: "¡Excelente! Has emparejado todos los frutos.",
  configuracion: {
    pares: [
      { id: 1, texto: "Amor" },
      { id: 2, texto: "Alegría" },
      { id: 3, texto: "Paz" },
      { id: 4, texto: "Paciencia" },
    ],
  },
  opciones: [],
};

export const completarVersiculoActividadFixture: Actividad = {
  id: "versiculo-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-versiculo",
  titulo: "Completa el versículo",
  consigna: "Completa el versículo con la palabra correcta.",
  orden: 3,
  xp_recompensa: 10,
  dificultad: "facil",
  limite_tiempo_seg: null,
  obligatorio: false,
  retroalimentacion: "¡Perfecto! Conoces muy bien la Biblia.",
  configuracion: {
    versoCompletar: "Porque tanto amó Dios al mundo que dio a su hijo unigénito, para que todo el que cree en él no se pierda, sino que tenga vida eterna.",
    palabraOculta: "unigénito",
    opciones: [
      { id: "a", texto: "unigénito", esCorrecta: true },
      { id: "b", texto: "amado", esCorrecta: false },
      { id: "c", texto: "unico", esCorrecta: false },
      { id: "d", texto: "grande", esCorrecta: false },
    ],
  },
  opciones: [],
};

export const relacionarConceptosActividadFixture: Actividad = {
  id: "relacionar-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-relacionar",
  titulo: "Relacionar conceptos",
  consigna: "Relaciona cada concepto con su definición correcta.",
  orden: 4,
  xp_recompensa: 15,
  dificultad: "medio",
  limite_tiempo_seg: null,
  obligatorio: false,
  retroalimentacion: "¡Muy bien! Has relacionado todos los conceptos correctamente.",
  configuracion: {
    pares: [
      { concepto: "Fe", definicion: "Creer en lo que no vemos" },
      { concepto: "Esperanza", definicion: "Esperar con confianza lo que Dios prometió" },
      { concepto: "Amor", definicion: "El mayor de los frutos del Espíritu" },
    ],
  },
  opciones: [],
};

export const verdaderoFalsoActividadFixture: Actividad = {
  id: "vf-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-vf",
  titulo: "Verdadero o Falso",
  consigna: "Indica si cada afirmación es verdadera o falsa.",
  orden: 5,
  xp_recompensa: 10,
  dificultad: "facil",
  limite_tiempo_seg: null,
  obligatorio: false,
  retroalimentacion: "¡Sigue practicando!",
  configuracion: {
    afirmaciones: [
      { texto: "Dios creó el mundo en siete días", correcta: true },
      { texto: "El hombre fue creado antes que los animales", correcta: true },
      { texto: "Dios creó a Adán de la tierra", correcta: false },
      { texto: "Eva fue creada de la costilla de Adán", correcta: true },
    ],
  },
  opciones: [],
};

export const actividadAudioFixture: Actividad = {
  id: "audio-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-audio",
  titulo: "Escucha y Aprende",
  consigna: "Escucha el audio y responde la pregunta.",
  orden: 6,
  xp_recompensa: 15,
  dificultad: "medio",
  limite_tiempo_seg: null,
  obligatorio: false,
  retroalimentacion: "¡Buena escucha!",
  configuracion: {
    audio: "/audios/creacion.mp3",
    pregunta: "¿De qué trata el audio?",
    opciones: [
      { id: "a", texto: "La creación del mundo", esCorrecta: true },
      { id: "b", texto: "El diluvio universal", esCorrecta: false },
      { id: "c", texto: "El exilio de Adán", esCorrecta: false },
    ],
    quizOpciones: [],
  },
  opciones: [],
};

export const rompecabezasActividadFixture: Actividad = {
  id: "romp-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-rompecabezas",
  titulo: "Arma el Rompecabezas",
  consigna: "Arma la imagen arrastrando las piezas a su lugar.",
  orden: 7,
  xp_recompensa: 10,
  dificultad: "dificil",
  limite_tiempo_seg: 120,
  obligatorio: false,
  retroalimentacion: "¡Lo lograste!",
  configuracion: {
    imagen: "/images/creacion.jpg",
    filas: 3,
    columnas: 3,
  },
  opciones: [],
};

export const arrastrarSoltarActividadFixture: Actividad = {
  id: "arrastrar-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-arrastrar",
  titulo: "Ordena los Días",
  consigna: "Arrastra los días de la creación en el orden correcto.",
  orden: 8,
  xp_recompensa: 15,
  dificultad: "medio",
  limite_tiempo_seg: null,
  obligatorio: false,
  retroalimentacion: "¡Excelente! Ordenaste los días correctamente.",
  configuracion: {
    elementos: ["Luz", "Cielo", "Tierra", "Sol y luna", "Animales", "Seres vivos"],
    ordenCorrecto: ["Luz", "Cielo", "Tierra", "Sol y luna", "Animales", "Seres vivos"],
  },
  opciones: [],
};

export const actividadCancionFixture: Actividad = {
  id: "cancion-001",
  tema_id: "tema-001",
  paso_id: "paso-001",
  grupo_edad_id: "grupo-001",
  tipo_actividad_id: "tipo-cancion",
  titulo: "Cantemos al Señor",
  consigna: "Escucha la canción y completa la letra.",
  orden: 9,
  xp_recompensa: 10,
  dificultad: "facil",
  limite_tiempo_seg: null,
  obligatorio: false,
  retroalimentacion: "¡Qué bien cantas!",
  configuracion: {
    audio: "/audios/creacion.mp3",
    letra: "Dios creó todo con amor,\ncon palabras y con valor,\nla luz, el cielo, el mar,\ntodo vino delingular.",
  },
  opciones: [],
};
