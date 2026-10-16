import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Actividad } from "@/shared/api/api";
import { QuizActividad } from "@/componentes/actividades/QuizActividad";
import { VerdaderoFalsoActividad } from "@/componentes/actividades/VerdaderoFalsoActividad";
import { RelacionarParesActividad } from "@/componentes/actividades/RelacionarParesActividad";
import { ManualidadActividad } from "@/componentes/actividades/ManualidadActividad";
import { Flashcards } from "@/componentes/actividades/Flashcards";
import { SopaLetrasActividad } from "@/componentes/actividades/SopaLetrasActividad";
import { Rompecabezas } from "@/componentes/actividades/Rompecabezas";
import { ActividadAudio } from "@/componentes/actividades/ActividadAudio";
import { ActividadCancion } from "@/componentes/actividades/ActividadCancion";
import { ActividadVideo } from "@/componentes/actividades/ActividadVideo";
import { AventuraDecisiones } from "@/componentes/actividades/AventuraDecisiones";
import { ArrastrarSoltar } from "@/componentes/actividades/ArrastrarSoltar";
import { CompletarVersiculo } from "@/componentes/actividades/CompletarVersiculo";
import { OpcionMultipleServidor } from "@/features/crecer/componentes/opcion-multiple-servidor";

const meta = {
  title: "Componentes/Actividades/Todas",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<null>;

export default meta;
type Story = StoryObj<typeof meta>;

function crearActividad(
  codigo: string,
  tipoCodigo: string,
  nombre: string,
  titulo: string,
  consigna: string,
  configuracion: Record<string, unknown>,
  opciones: Actividad["opciones"] = [],
): Actividad {
  return {
    id: `story-${codigo}`,
    tema_id: "tema-storybook",
    paso_id: null,
    grupo_edad_id: "grupo-exploradores",
    tipo_actividad_id: `tipo-${codigo}`,
    titulo,
    consigna,
    orden: 1,
    xp_recompensa: 25,
    dificultad: "facil",
    limite_tiempo_seg: null,
    obligatorio: true,
    retroalimentacion: "¡Muy bien! Completaste la actividad.",
    configuracion,
    tipo_actividad: {
      id: `tipo-${codigo}`,
      codigo: tipoCodigo,
      nombre,
      descripcion: consigna,
      es_juego: true,
      activo: true,
      creado_en: "2026-07-10T00:00:00.000Z",
    },
    opciones,
  };
}

const completar = () => undefined;

function ActividadCard({
  actividad,
  badge,
}: {
  actividad: Actividad;
  badge: string;
}) {
  const { tipo_actividad } = actividad;
  const codigo = tipo_actividad?.codigo ?? "";
  const nombre = tipo_actividad?.nombre ?? "Actividad";

  const contenido = (() => {
    if (actividad.opciones.length > 0) {
      return <OpcionMultipleServidor actividad={actividad} />;
    }
    switch (codigo) {
      case "cuestionario":
        return <QuizActividad actividad={actividad as any} onComplete={completar} />;
      case "verdadero_falso":
        return <VerdaderoFalsoActividad actividad={actividad as any} onComplete={completar} />;
      case "relacionar_pares":
        return <RelacionarParesActividad actividad={actividad as any} onComplete={completar} />;
      case "sopa_letras":
        return <SopaLetrasActividad actividad={actividad as any} onComplete={completar} />;
      case "tarjetas_memoria":
        return <Flashcards actividad={actividad as any} onComplete={completar} />;
      case "rompecabezas": {
        const config = actividad.configuracion || {};
        const imgUrl =
          (config.imagen as string) || "/src/assets/images/Ilustraciones/Tema1.webp";
        return (
          <Rompecabezas
            imagen={imgUrl}
            filas={(config.filas as number) || 3}
            columnas={(config.columnas as number) || 3}
            retroalimentacion={actividad.retroalimentacion ?? undefined}
            onComplete={() => completar()}
          />
        );
      }
      case "manualidad":
        return <ManualidadActividad actividad={actividad as any} onComplete={completar} />;
      case "completar_versiculo":
        return <CompletarVersiculo actividad={actividad as any} onComplete={completar} />;
      case "aventura_decisiones":
        return <AventuraDecisiones actividad={actividad as any} onComplete={completar} />;
      case "arrastrar_soltar":
        return <ArrastrarSoltar actividad={actividad as any} onComplete={completar} />;
      case "actividad_audio":
        return <ActividadAudio actividad={actividad as any} onComplete={completar} />;
      case "actividad_video":
      case "video":
        return <ActividadVideo actividad={actividad as any} onComplete={completar} />;
      case "cancion":
        return <ActividadCancion actividad={actividad as any} onComplete={completar} />;
      default:
        return (
          <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800">Actividad no soportada: {codigo}</p>
          </div>
        );
    }
  })();

  return (
    <div className="w-full bg-slate-50/50 p-4 sm:p-8 rounded-3xl border border-slate-100 shadow-inner">
      <div className="mb-6 flex flex-col items-center">
        <div className="w-full text-left mb-2">
          <span
            className={`${badge} px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest`}
          >
            {nombre}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-700 text-center">{actividad.titulo}</h2>
        <p className="text-slate-500 mt-2 text-center">{actividad.consigna}</p>
      </div>
      {contenido}
    </div>
  );
}

export const TodasLasActividades: Story = {
  render: () => {
    const actividades = [
      {
        actividad: crearActividad(
          "cuestionario",
          "cuestionario",
          "Quiz bíblico",
          "Quiz bíblico",
          "Selecciona una respuesta para cada pregunta.",
          {
            preguntas: [
              {
                pregunta: "¿Cuál es un fruto del Espíritu?",
                opciones: ["Amor", "Orgullo", "Envidia", "Egoísmo"],
                respuesta_correcta: 0,
              },
              {
                pregunta: "¿Qué nos enseña la parábola del buen samaritano?",
                opciones: ["Ignorar", "Compartir", "Ayudar al prójimo"],
                respuesta_correcta: 2,
              },
            ],
          },
        ),
        badge: "bg-emerald-100 text-emerald-700",
      },
      {
        actividad: crearActividad(
          "verdadero_falso",
          "verdadero_falso",
          "Verdadero o falso",
          "Verdadero o falso",
          "Lee cada afirmación y elige la respuesta correcta.",
          {
            afirmaciones: [
              { texto: "Jesús enseñó a amar al prójimo.", es_verdadero: true },
              { texto: "La bondad solo se practica con amigos.", es_verdadero: false },
            ],
          },
        ),
        badge: "bg-blue-100 text-blue-700",
      },
      {
        actividad: crearActividad(
          "relacionar_pares",
          "relacionar_pares",
          "Relacionar pares",
          "Relaciona los conceptos",
          "Une cada fruto con su significado.",
          {
            pares: [
              { izquierda: "Amor", derecha: "Tratar con bondad" },
              { izquierda: "Paz", derecha: "Confiar en Dios" },
              { izquierda: "Gozo", derecha: "Alegría que viene de Dios" },
            ],
          },
        ),
        badge: "bg-violet-100 text-violet-700",
      },
      {
        actividad: crearActividad(
          "sopa_letras",
          "sopa_letras",
          "Sopa de letras",
          "Sopa de letras",
          "Encuentra las palabras escondidas.",
          { filas: 8, columnas: 8, palabras: ["AMOR", "PAZ", "GOZO", "FE"] },
        ),
        badge: "bg-amber-100 text-amber-700",
      },
      {
        actividad: crearActividad(
          "tarjetas_memoria",
          "tarjetas_memoria",
          "Memoria bíblica",
          "Memoria bíblica",
          "Encuentra las parejas iguales.",
          {
            pares: [
              { id: 1, texto: "Amor" },
              { id: 2, texto: "Gozo" },
              { id: 3, texto: "Paz" },
              { id: 4, texto: "Bondad" },
            ],
          },
        ),
        badge: "bg-rose-100 text-rose-700",
      },
      {
        actividad: crearActividad(
          "rompecabezas",
          "rompecabezas",
          "Rompecabezas",
          "Rompecabezas",
          "Arma la imagen.",
          {
            imagen: "/src/assets/images/Ilustraciones/Tema1.webp",
            filas: 3,
            columnas: 3,
          },
        ),
        badge: "bg-cyan-100 text-cyan-700",
      },
      {
        actividad: crearActividad(
          "manualidad",
          "manualidad",
          "Manualidad",
          "Manos que comparten amor",
          "Prepara los materiales y sigue los pasos.",
          {
            materiales: ["Cartulina", "Colores", "Tijeras sin punta", "Pegamento"],
            pasos: [
              "Dibuja un corazón grande en la cartulina.",
              "Escribe dentro una acción de amor.",
              "Decóralo y compártelo con tu familia.",
            ],
          },
        ),
        badge: "bg-pink-100 text-pink-700",
      },
      {
        actividad: crearActividad(
          "completar_versiculo",
          "completar_versiculo",
          "Completar versículo",
          "Completa el versículo",
          "Elige la palabra correcta.",
          {
            frase: "Ama a tu ____ como a ti mismo.",
            respuesta: "prójimo",
            opciones: ["prójimo", "enemigo", "amigo", "familiar"],
          },
        ),
        badge: "bg-indigo-100 text-indigo-700",
      },
      {
        actividad: crearActividad(
          "aventura_decisiones",
          "aventura_decisiones",
          "Aventura decisiones",
          "La decisión correcta",
          "Elige sabiamente.",
          {
            escenas: [
              {
                descripcion: "Un niño necesita ayuda. ¿Qué haces?",
                opciones: [
                  { texto: "Lo ignoro y sigo mi camino", correcta: false },
                  { texto: "Lo ayudo porque Jesús nos enseña a amar", correcta: true },
                ],
              },
            ],
          },
        ),
        badge: "bg-red-100 text-red-700",
      },
      {
        actividad: crearActividad(
          "arrastrar_soltar",
          "arrastrar_soltar",
          "Ordenar pasos",
          "Ordena los pasos",
          "Arrastra para poner en orden.",
          {
            items: ["Orar", "Escuchar", "Obedecer", "Agradecer"],
            orden_correcto: [0, 1, 2, 3],
          },
        ),
        badge: "bg-teal-100 text-teal-700",
      },
      {
        actividad: crearActividad(
          "actividad_audio",
          "actividad_audio",
          "Audio",
          "Escucha el audio",
          "Escucha y responde.",
          {
            audio_url: "",
            pregunta: "¿Qué aprendemos de este audio?",
            opciones: ["A ser valientes", "A compartir", "A orar"],
          },
        ),
        badge: "bg-sky-100 text-sky-700",
      },
      {
        actividad: crearActividad(
          "actividad_video",
          "actividad_video",
          "Video",
          "Mira el video",
          "Observa y aprende.",
          {
            video_url: "",
            pregunta: "¿Qué pasó en el video?",
            opciones: ["Jesús sanó", "Jesús teachó", "Jesús caminó"],
          },
        ),
        badge: "bg-orange-100 text-orange-700",
      },
      {
        actividad: crearActividad(
          "cancion",
          "cancion",
          "Canción",
          "Canta con nosotros",
          "Sigue la letra y canta.",
          {
            letra: ["Jesús me ama", "esto lo sé", "porque la Biblia", "asi lo dice"],
            acciones: ["Cantar", "Aplaudir", "Danzar"],
            audio_url: "",
          },
        ),
        badge: "bg-lime-100 text-lime-700",
      },
    ];

    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Todas las actividades</h1>
          <p className="text-slate-500 mt-1">
            {actividades.length} actividades · Scroll para ver todas
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {actividades.map(({ actividad, badge }) => (
            <div key={actividad.id} className="flex flex-col">
              <ActividadCard actividad={actividad} badge={badge} />
            </div>
          ))}
        </div>
      </div>
    );
  },
};
