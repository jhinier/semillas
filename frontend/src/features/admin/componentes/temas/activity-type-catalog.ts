import {
  BookOpenCheck,
  CircleHelp,
  GitCompareArrows,
  Grid3X3,
  Headphones,
  Layers3,
  ListOrdered,
  Music2,
  Puzzle,
  Route,
  Scissors,
  ShieldCheck,
  Video,
  type LucideIcon,
} from "lucide-react";

export type ActivityTypeCategory = "preguntas" | "memoria" | "multimedia" | "experiencia";

export type ActivityTypeDefinition = {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: ActivityTypeCategory;
  icono: LucideIcon;
  tono: "violeta" | "azul" | "verde" | "naranja" | "rosa" | "cian";
  requiereOpciones: boolean;
};

export const ACTIVITY_TYPE_DEFINITIONS: ActivityTypeDefinition[] = [
  { codigo: "cuestionario", nombre: "Quiz", descripcion: "Pregunta con respuestas y una opción correcta.", categoria: "preguntas", icono: CircleHelp, tono: "violeta", requiereOpciones: true },
  { codigo: "verdadero_falso", nombre: "Verdadero o falso", descripcion: "Serie de afirmaciones para evaluar comprensión.", categoria: "preguntas", icono: ShieldCheck, tono: "verde", requiereOpciones: false },
  { codigo: "completar_versiculo", nombre: "Completar versículo", descripcion: "Completa palabras faltantes dentro de una frase.", categoria: "preguntas", icono: BookOpenCheck, tono: "azul", requiereOpciones: false },
  { codigo: "relacionar_pares", nombre: "Relacionar conceptos", descripcion: "Une conceptos con sus definiciones o respuestas.", categoria: "preguntas", icono: GitCompareArrows, tono: "cian", requiereOpciones: false },
  { codigo: "tarjetas_memoria", nombre: "Flashcards", descripcion: "Tarjetas breves para memorizar ideas clave.", categoria: "memoria", icono: Layers3, tono: "naranja", requiereOpciones: false },
  { codigo: "sopa_letras", nombre: "Sopa de letras", descripcion: "Encuentra palabras bíblicas dentro de una cuadrícula.", categoria: "memoria", icono: Grid3X3, tono: "violeta", requiereOpciones: false },
  { codigo: "arrastrar_soltar", nombre: "Ordenar elementos", descripcion: "Organiza pasos o elementos en la secuencia correcta.", categoria: "memoria", icono: ListOrdered, tono: "azul", requiereOpciones: false },
  { codigo: "rompecabezas", nombre: "Rompecabezas", descripcion: "Reconstruye una imagen por piezas.", categoria: "memoria", icono: Puzzle, tono: "naranja", requiereOpciones: false },
  { codigo: "aventura_decisiones", nombre: "Aventura", descripcion: "Recorre escenas y toma decisiones guiadas.", categoria: "experiencia", icono: Route, tono: "rosa", requiereOpciones: false },
  { codigo: "manualidad", nombre: "Manualidad", descripcion: "Actividad práctica con materiales y pasos.", categoria: "experiencia", icono: Scissors, tono: "verde", requiereOpciones: false },
  { codigo: "actividad_audio", nombre: "Audio", descripcion: "Escucha un recurso y responde o reflexiona.", categoria: "multimedia", icono: Headphones, tono: "cian", requiereOpciones: false },
  { codigo: "actividad_video", nombre: "Video", descripcion: "Observa un video y completa una experiencia guiada.", categoria: "multimedia", icono: Video, tono: "rosa", requiereOpciones: false },
  { codigo: "cancion", nombre: "Canción", descripcion: "Combina audio, letra y acciones participativas.", categoria: "multimedia", icono: Music2, tono: "naranja", requiereOpciones: false },
];

const DEFINITION_BY_CODE = new Map(ACTIVITY_TYPE_DEFINITIONS.map((definition) => [definition.codigo, definition]));

export function getActivityTypeDefinition(codigo?: string | null): ActivityTypeDefinition {
  return DEFINITION_BY_CODE.get(codigo ?? "") ?? {
    codigo: codigo || "actividad",
    nombre: "Actividad",
    descripcion: "Experiencia interactiva personalizada.",
    categoria: "experiencia",
    icono: Puzzle,
    tono: "violeta",
    requiereOpciones: false,
  };
}

export function activityStatusFromTheme(themeStatus?: string | null) {
  if (themeStatus === "publicado") return "publicada" as const;
  if (themeStatus === "revision") return "revision" as const;
  return "borrador" as const;
}
