import avatar1Img from "@/assets/images/avatars/Avatar 1.webp";
import avatar2Img from "@/assets/images/avatars/Avatar 2.webp";
import avatar3Img from "@/assets/images/avatars/Avatar 3.webp";
import avatar4Img from "@/assets/images/avatars/Avatar 4.webp";
import avatar5Img from "@/assets/images/avatars/Avatar 5.webp";
import avatar6Img from "@/assets/images/avatars/Avatar 6.webp";
import avatar7Img from "@/assets/images/avatars/Avatar 7.webp";
import avatar8Img from "@/assets/images/avatars/Avatar 8.webp";
import avatar9Img from "@/assets/images/avatars/Avatar 9.webp";
import avatar10Img from "@/assets/images/avatars/Avatar 10.webp";

export const MAPA_AVATARES: Record<string, string> = {
  "1": avatar1Img,
  "2": avatar2Img,
  "3": avatar3Img,
  "4": avatar4Img,
  "5": avatar5Img,
  "6": avatar6Img,
  "7": avatar7Img,
  "8": avatar8Img,
  "9": avatar9Img,
  "10": avatar10Img,
};

const ES_URL_VALIDA = /^(https?:\/\/|data:|blob:|\/)/i;

export const resolverAvatar = (valor?: string | null): string => {
  if (!valor) return MAPA_AVATARES["1"] as string;
  if (MAPA_AVATARES[valor]) return MAPA_AVATARES[valor] as string;
  if (ES_URL_VALIDA.test(valor)) return valor;
  return MAPA_AVATARES["1"] as string;
};
