interface CompletenessItem {
  label: string;
  done: boolean;
}

interface EditThemeCompletenessData {
  items: CompletenessItem[];
  percentage: number;
}

export function getCompletenessData(): EditThemeCompletenessData {
  return {
    items: [
      { label: "Información general", done: true },
      { label: "Portada", done: true },
      { label: "Configuración", done: true },
      { label: "Publicación", done: false },
    ],
    percentage: 85,
  };
}
