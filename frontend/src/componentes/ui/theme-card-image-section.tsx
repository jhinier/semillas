import { Star } from "lucide-react";
import { Chip, type ColorDisenoKey } from "./chip";
import { IlustracionCard } from "./ilustraciones-card";
import { unirClases } from "@/lib/utilidades";

interface ThemeCardImageSectionProps {
  esError: boolean;
  esBloqueada: boolean;
  esPadre: boolean;
  esHijo: boolean;
  esEspiritu: boolean;
  imagenUrl?: string;
  titulo: string;
  colorSenda: ColorDisenoKey;
  senda: string;
  mostrarSendaBadge: boolean;
  favorito: boolean;
  onFavorito?: () => void;
  esCompacta: boolean;
}

export function ThemeCardImageSection({
  esError,
  esBloqueada,
  esPadre,
  esHijo,
  esEspiritu,
  imagenUrl,
  titulo,
  colorSenda,
senda,
  mostrarSendaBadge,
  favorito,
  onFavorito,
  esCompacta,
}: ThemeCardImageSectionProps) {
  return (
    <div className={unirClases("theme-card__media relative w-full flex-shrink-0 overflow-hidden bg-slate-50", esCompacta ? "h-[152px]" : "h-[176px]")}>
      <IlustracionCard
        esError={esError}
        esBloqueada={esBloqueada}
        esSendaPadre={esPadre}
        esSendaHijo={esHijo}
        esSendaEspiritu={esEspiritu}
        imagenUrl={imagenUrl}
        titulo={titulo}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent opacity-70" />

      {mostrarSendaBadge && !esError && (
        <div className="absolute left-3 top-3 z-10">
          <Chip color={colorSenda} forma="badgePildora" clase="!px-2.5 !py-1 text-[10px] shadow-sm">
            {senda}
          </Chip>
        </div>
      )}

      {!esError && !esBloqueada && onFavorito && (
        <button
          type="button"
          onClick={(evento) => {
            evento.stopPropagation();
            onFavorito();
          }}
          className="theme-card__favorite absolute right-3 top-3 flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-400 shadow-[0_4px_14px_rgba(15,23,42,0.15)] backdrop-blur-sm transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-2"
          aria-label={favorito ? `Quitar ${titulo} de favoritos` : `Agregar ${titulo} a favoritos`}
          aria-pressed={favorito}
        >
          <Star
            className={unirClases(
              "size-4 transition-colors",
              favorito ? "fill-amber-400 text-amber-400" : "text-slate-400",
            )}
          />
        </button>
      )}
    </div>
  );
}
