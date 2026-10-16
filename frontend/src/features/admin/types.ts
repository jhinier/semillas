export interface OptionDraft {
  etiqueta: string;
  texto: string;
  correcta: boolean;
  orden: number;
}

export type ActivityDraft = {
  paso_id: string;
  grupo_edad_id: string;
  tipo_actividad_id: string;
  titulo: string;
  consigna: string;
  retroalimentacion: string;
  xp_recompensa: number;
  limite_tiempo_seg: number | null;
  dificultad: "facil" | "normal" | "dificil";
  obligatorio: boolean;
  configuracion: Record<string, unknown>;
  opciones: OptionDraft[];
};

export const defaultOptions: OptionDraft[] = ["A", "B", "C", "D"].map((label, index) => ({
  etiqueta: label,
  texto: "",
  correcta: index === 0,
  orden: index + 1,
}));

export const emptyDraft: ActivityDraft = {
  paso_id: "",
  grupo_edad_id: "",
  tipo_actividad_id: "",
  titulo: "",
  consigna: "",
  retroalimentacion: "",
  xp_recompensa: 10,
  limite_tiempo_seg: null,
  dificultad: "facil",
  obligatorio: true,
  configuracion: {},
  opciones: defaultOptions,
};

export function tieneContenidoEnBorrador(
  borrador: Pick<ActivityDraft, "titulo" | "consigna" | "configuracion" | "opciones">
) {
  return Boolean(
    borrador.titulo.trim() ||
      borrador.consigna.trim() ||
      Object.keys(borrador.configuracion).length ||
      borrador.opciones.some((opcion) => opcion.texto.trim())
  );
}

export function actualizarGrupoEdadDelBorrador(borrador: ActivityDraft, grupoEdadId: string): ActivityDraft {
  return { ...borrador, grupo_edad_id: grupoEdadId };
}

export function esObjetoPlano(valor: unknown): valor is Record<string, unknown> {
  if (typeof valor !== "object" || valor === null || Array.isArray(valor)) return false;
  const prototipo = Object.getPrototypeOf(valor);
  return prototipo === Object.prototype || prototipo === null;
}
