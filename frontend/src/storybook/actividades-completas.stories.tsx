import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Actividad } from "@/shared/api/api";
import { ActividadWrapper } from "@/features/crecer/componentes/actividad-wrapper";

const meta = {
  title: "Componentes/Actividades/Catálogo completo",
  component: ActividadWrapper,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-50 p-3 sm:p-8">
        <div className="mx-auto max-w-5xl"><Story /></div>
      </div>
    ),
  ],
} satisfies Meta<typeof ActividadWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

type CodigoActividad =
  | "cuestionario"
  | "verdadero_falso"
  | "relacionar_pares"
  | "manualidad"
  | "tarjetas_memoria"
  | "sopa_letras"
  | "rompecabezas";

function crearActividad(
  codigo: CodigoActividad,
  configuracion: Record<string, unknown>,
  titulo: string,
  consigna: string,
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
      codigo,
      nombre: titulo,
      descripcion: consigna,
      es_juego: true,
      activo: true,
      creado_en: "2026-07-10T00:00:00.000Z",
    },
    opciones: [],
  };
}

const completar = () => undefined;

export const VerdaderoOFalso: Story = {
  args: {
    actividad: crearActividad(
      "verdadero_falso",
      {
        afirmaciones: [
          { texto: "Jesús enseñó a amar al prójimo.", es_verdadero: true },
          { texto: "La bondad solo se practica con amigos.", es_verdadero: false },
        ],
      },
      "Verdadero o falso",
      "Lee cada afirmación y elige la respuesta correcta.",
    ),
    onComplete: completar,
  },
};

export const Quiz: Story = {
  args: {
    actividad: crearActividad(
      "cuestionario",
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
      "Quiz bíblico",
      "Selecciona una respuesta para cada pregunta.",
    ),
    onComplete: completar,
  },
};

export const RelacionarPares: Story = {
  args: {
    actividad: crearActividad(
      "relacionar_pares",
      {
        pares: [
          { izquierda: "Amor", derecha: "Tratar con bondad" },
          { izquierda: "Paz", derecha: "Confiar en Dios" },
          { izquierda: "Gozo", derecha: "Alegría que viene de Dios" },
        ],
      },
      "Relaciona los conceptos",
      "Une cada fruto con su significado.",
    ),
    onComplete: completar,
  },
};

export const SopaDeLetras: Story = {
  args: {
    actividad: crearActividad(
      "sopa_letras",
      { filas: 8, columnas: 8, palabras: ["AMOR", "PAZ", "GOZO", "FE"] },
      "Sopa de letras",
      "Encuentra las palabras escondidas.",
    ),
    onComplete: completar,
  },
};

export const TarjetasDeMemoria: Story = {
  args: {
    actividad: crearActividad(
      "tarjetas_memoria",
      {
        pares: [
          { id: 1, texto: "Amor" },
          { id: 2, texto: "Gozo" },
          { id: 3, texto: "Paz" },
          { id: 4, texto: "Bondad" },
        ],
      },
      "Memoria bíblica",
      "Encuentra las parejas iguales.",
    ),
    onComplete: completar,
  },
};

export const Manualidad: Story = {
  args: {
    actividad: crearActividad(
      "manualidad",
      {
        materiales: ["Cartulina", "Colores", "Tijeras sin punta", "Pegamento"],
        pasos: [
          "Dibuja un corazón grande en la cartulina.",
          "Escribe dentro una acción de amor.",
          "Decóralo y compártelo con tu familia.",
        ],
      },
      "Manos que comparten amor",
      "Prepara los materiales y sigue los pasos.",
    ),
    onComplete: completar,
  },
};

export const VistaMovil: Story = {
  ...VerdaderoOFalso,
  globals: { viewport: { value: "movilCompacto", isRotated: false } },
};
