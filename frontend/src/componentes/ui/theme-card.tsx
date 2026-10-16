import { ArrowRight } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Card } from "./card-base";
import { type ColorDisenoKey } from "./chip";
import { ThemeCardImageSection } from "./theme-card-image-section";
import {
  BarraProgreso,
  BadgeSinConexion,
  BotonEstado,
} from "./theme-card-status";
import {
  TemaMetadatos,
  TemaSendaEtiqueta,
  TemaTituloDescripcion,
} from "./theme-card-content";
import { unirClases } from "@/lib/utilidades";
import { obtenerClasesSenda } from "@/features/themes/utils";

export type ThemeCardVariant = "default" | "compact";
export type ThemeCardMobileLayout = "tarjeta" | "lista";

export type ThemeCardState =
  | "porDefecto"
  | "enProgreso"
  | "completada"
  | "descargada"
  | "bloqueada"
  | "error";

export interface ThemeCardProps {
  titulo: string;
  descripcion: string;
  senda: string;
  duracion?: string;
  xp?: number;
  progreso?: number;
  favorito?: boolean;
  imagenUrl?: string;
  estado?: ThemeCardState;
  variante?: ThemeCardVariant;
  layoutMovil?: ThemeCardMobileLayout;
  mostrarSendaBadge?: boolean;
  onFavorito?: () => void;
  onAccion?: () => void;
  clase?: string;
}

export function ThemeCard({
  estado = "porDefecto",
  variante = "default",
  layoutMovil = "tarjeta",
  senda,
  titulo,
  descripcion,
  duracion,
  xp,
  progreso = 0,
  favorito = false,
  imagenUrl,
  onFavorito,
  onAccion,
  mostrarSendaBadge = true,
  clase,
}: ThemeCardProps) {
  const esBloqueada = estado === "bloqueada";
  const esError = estado === "error";
  const esCompacta = variante === "compact";
  const { esPadre, esHijo, esEspiritu, texto: claseSenda, relleno: claseRellenoBarra } = obtenerClasesSenda(senda);
  const esInteractiva = Boolean(onAccion) && !esBloqueada && !esError;
  const colorSenda: ColorDisenoKey = esPadre ? "amarillo" : esHijo ? "azul" : esEspiritu ? "verde" : "gris";

  const contenedorTecla = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (!esInteractiva) return;

    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      onAccion?.();
    }
  };

  return (
    <Card
      sombra="sm"
      hoverEffect={esInteractiva ? "elevate" : "none"}
      clase={unirClases(
        "theme-card group flex w-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition-all duration-200",
        layoutMovil === "lista" && "theme-card--mobile-list",
        esInteractiva && "cursor-pointer",
        esBloqueada && "opacity-75",
        clase,
      )}
      style={{ opacity: esBloqueada ? 0.75 : 1 }}
      onClick={esInteractiva ? onAccion : undefined}
      onKeyDown={contenedorTecla}
      role={esInteractiva ? "button" : undefined}
      tabIndex={esInteractiva ? 0 : undefined}
    >
      <ThemeCardImageSection
        esError={esError}
        esBloqueada={esBloqueada}
        esPadre={esPadre}
        esHijo={esHijo}
        esEspiritu={esEspiritu}
        imagenUrl={imagenUrl}
        titulo={titulo}
        colorSenda={colorSenda}
        senda={senda}
        mostrarSendaBadge={mostrarSendaBadge}
        favorito={favorito}
        onFavorito={onFavorito}
        esCompacta={esCompacta}
      />

      <div className={unirClases("theme-card__body flex flex-1 flex-col justify-between text-left", esCompacta ? "p-4 sm:p-[18px]" : "p-4 sm:p-5")}>
        <div className={unirClases("theme-card__content flex flex-col", esCompacta ? "gap-2" : "gap-2.5")}>
          <TemaSendaEtiqueta claseSenda={claseSenda} senda={senda} />

          <TemaTituloDescripcion
            titulo={titulo}
            descripcion={descripcion}
            esCompacta={esCompacta}
          />

          <TemaMetadatos duracion={duracion} xp={xp} />
        </div>

        <div className={unirClases("theme-card__footer mt-5 flex flex-col gap-3", esCompacta && "mt-4")}>
          {!esError && !esBloqueada && (
            <BarraProgreso progreso={progreso} claseRellenoBarra={claseRellenoBarra} />
          )}

          <BadgeSinConexion visible={estado === "descargada"} />

          <BotonEstado estado={estado} />
        </div>
      </div>
    </Card>
  );
}
