import conectarImg from "@/assets/images/Ilustraciones/Conectar.webp";
import relatarImg from "@/assets/images/Ilustraciones/Relatar.webp";
import ensenarImg from "@/assets/images/Ilustraciones/Ensenar.webp";
import comprobarImg from "@/assets/images/Ilustraciones/Comprobar.webp";
import experimentarImg from "@/assets/images/Ilustraciones/Experimentar.webp";
import recompensarImg from "@/assets/images/Ilustraciones/Recompensa.webp";

export type CodigoFaseCrecer =
  | "conectar"
  | "relatar"
  | "ensenar"
  | "comprobar"
  | "experimentar"
  | "recompensar";

export type RutaFaseCrecer =
  | "/app/C_conectar/$themeId"
  | "/app/R_relatar/$themeId"
  | "/app/E_ensenar/$themeId"
  | "/app/C_comprobar/$themeId"
  | "/app/E_experimentar/$themeId"
  | "/app/R_recompensar/$themeId";

export interface FaseCrecerConfig {
  numero: number;
  codigo?: CodigoFaseCrecer;
  nombre: string;
  descripcion?: string;
  ruta?: RutaFaseCrecer;
  imagenSrc: string;
  colorAccent: string;
  colorSuave?: string;
  colorLoader?: string;
}

export const FASES_CRECER: readonly FaseCrecerConfig[] = [
  {
    numero: 1,
    codigo: "conectar",
    nombre: "Conectar",
    descripcion: "Relaciona el tema con tu vida y prepárate para aprender.",
    ruta: "/app/C_conectar/$themeId",
    imagenSrc: conectarImg,
    colorAccent: "#43a047",
    colorSuave: "#eaf7ec",
  },
  {
    numero: 2,
    codigo: "relatar",
    nombre: "Relatar",
    descripcion: "Descubre la historia bíblica y comprende su mensaje.",
    ruta: "/app/R_relatar/$themeId",
    imagenSrc: relatarImg,
    colorAccent: "#2563eb",
    colorSuave: "#eaf2ff",
  },
  {
    numero: 3,
    codigo: "ensenar",
    nombre: "Enseñar",
    descripcion: "Aprende la verdad central y cómo aplicarla.",
    ruta: "/app/E_ensenar/$themeId",
    imagenSrc: ensenarImg,
    colorAccent: "#eab308",
    colorSuave: "#fff8dc",
  },
  {
    numero: 4,
    codigo: "comprobar",
    nombre: "Comprobar",
    descripcion: "Pon a prueba lo aprendido con actividades y juegos.",
    ruta: "/app/C_comprobar/$themeId",
    imagenSrc: comprobarImg,
    colorAccent: "#7c3aed",
    colorSuave: "#f2ecff",
  },
  {
    numero: 5,
    codigo: "experimentar",
    nombre: "Experimentar",
    descripcion: "Lleva el aprendizaje a tu vida durante la semana.",
    ruta: "/app/E_experimentar/$themeId",
    imagenSrc: experimentarImg,
    colorAccent: "#ef4444",
    colorSuave: "#fff0f0",
  },
  {
    numero: 6,
    codigo: "recompensar",
    nombre: "Recompensar",
    descripcion: "Celebra tu avance y descubre lo que has conseguido.",
    ruta: "/app/R_recompensar/$themeId",
    imagenSrc: recompensarImg,
    colorAccent: "#f59e0b",
    colorSuave: "#fff6db",
  },
] as const;

export function obtenerFaseCrecer(codigo: CodigoFaseCrecer): FaseCrecerConfig {
  const fase = FASES_CRECER.find((item) => item.codigo === codigo);
  if (!fase) throw new Error(`Fase CRECER no encontrada: ${codigo}`);
  return fase;
}

export function obtenerRutaFase(codigo: string | null | undefined): RutaFaseCrecer {
  return FASES_CRECER.find((item) => item.codigo === codigo)?.ruta ?? "/app/C_conectar/$themeId";
}

export function esRutaModoLeccion(pathname: string): boolean {
  return FASES_CRECER.some((fase) =>
    fase.ruta ? pathname.startsWith(fase.ruta.replace("/$themeId", "")) : false,
  );
}
