import { Badge } from "@/componentes/ui/badge";

export type TipoMedia = "imagen" | "audio" | "video" | "documento";

type MediaTypeBadgeProps = {
  tipo: TipoMedia;
};

export function MediaTypeBadge({ tipo }: MediaTypeBadgeProps) {
  return <Badge color={getColorTipo(tipo)}>{getEtiquetaTipo(tipo)}</Badge>;
}

function getColorTipo(tipo: TipoMedia): "verde" | "morado" | "naranja" | "azul" {
  if (tipo === "imagen") return "verde";
  if (tipo === "audio") return "morado";
  if (tipo === "video") return "naranja";
  return "azul";
}

function getEtiquetaTipo(tipo: TipoMedia): string {
  if (tipo === "imagen") return "Imagen";
  if (tipo === "audio") return "Audio";
  if (tipo === "video") return "Video";
  return "Documento";
}
