import type { HTMLAttributes, ReactNode } from "react";
import { Book, Download, Flame } from "lucide-react";
import { unirClases } from "@/lib/utilidades";
import { Card } from "./card-base";

export interface TonoTarjetaMetrica {
  fondoIcono: string;
  colorSubtexto: string;
}

export interface TarjetaMetricaCompactaProps extends HTMLAttributes<HTMLDivElement> {
  titulo: ReactNode;
  valor: ReactNode;
  subtexto: ReactNode;
  icono?: ReactNode;
  etiquetaIcono?: ReactNode;
  tono?: TonoTarjetaMetrica;
  alineacion?: "izquierda" | "centrada";
  clase?: string;
}

export interface PropiedadesCardMetrica {
  titulo: string;
  valor: string | number;
  subtexto: string;
  tipo: "xp" | "racha" | "lecciones" | "offline";
  clase?: string;
}

export function TarjetaMetricaCompacta({
  titulo,
  valor,
  subtexto,
  icono,
  etiquetaIcono,
  tono,
  alineacion = "izquierda",
  clase,
  ...propiedades
}: TarjetaMetricaCompactaProps) {
  const esCentrada = alineacion === "centrada";

  return (
    <Card
      sombra="sm"
      hoverEffect="none"
      clase={unirClases(
        "w-full bg-white",
        esCentrada ? "p-5 sm:p-6" : "min-h-[168px] p-5 sm:p-6",
        clase,
      )}
      {...propiedades}
    >
      {esCentrada ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div
            className={unirClases(
              "flex h-14 w-14 items-center justify-center rounded-full text-base font-extrabold text-white shadow-inner sm:h-16 sm:w-16 sm:text-lg",
              tono?.fondoIcono ? `bg-[${tono.fondoIcono}]` : ""
            )}
          >
            {etiquetaIcono ?? icono}
          </div>
          <div className="mt-3 min-w-0">
            <span className="mb-1 block text-[10px] font-extrabold uppercase leading-none tracking-wide text-slate-400 md:text-xs">
              {titulo}
            </span>
            <h3 className="text-[clamp(1.65rem,2.1vw,2.3rem)] font-black leading-none text-slate-900">{valor}</h3>
            <p className={unirClases("mt-2 text-xs font-semibold leading-snug", tono?.colorSubtexto ?? "text-slate-400")}>
              {subtexto}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col justify-between gap-3">
          <div className="text-center">
            <span className="mb-1 block text-[10px] font-extrabold uppercase leading-none tracking-wide text-slate-400 md:text-xs">
              {titulo}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={unirClases(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white shadow-inner sm:h-14 sm:w-14 sm:text-base",
                tono?.fondoIcono ? `bg-[${tono.fondoIcono}]` : ""
              )}
            >
              {etiquetaIcono ?? icono}
            </div>

            <div className="min-w-0">
              <h3 className="text-[clamp(1.7rem,2.2vw,2.4rem)] font-black leading-none text-slate-900">{valor}</h3>
              <p className={unirClases("mt-1.5 max-w-[10ch] text-xs font-semibold leading-tight", tono?.colorSubtexto ?? "text-slate-400")}>
                {subtexto}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export function CardMetrica({
  titulo,
  valor,
  subtexto,
  tipo,
  clase,
}: PropiedadesCardMetrica) {
  const configs = {
    xp: {
      gradiente: "linear-gradient(135deg, #2E9E5B, #16A34A)",
      icono: null,
      subColor: "text-[#2E9E5B]",
    },
    racha: {
      gradiente: "linear-gradient(135deg, #6C3AED, #5B30C8)",
      icono: <Flame className="size-5 text-white fill-white" />,
      subColor: "text-[#6C3AED]",
    },
    lecciones: {
      gradiente: "linear-gradient(135deg, #F4B740, #D97706)",
      icono: <Book className="size-5 text-white" />,
      subColor: "text-[#D97706]",
    },
    offline: {
      gradiente: "linear-gradient(135deg, #3D8BD4, #2563EB)",
      icono: <Download className="size-5 text-white" />,
      subColor: "text-[#3D8BD4]",
    },
  };

  const config = configs[tipo] || configs.xp;

  return (
    <TarjetaMetricaCompacta
      titulo={titulo}
      valor={valor}
      subtexto={subtexto}
      icono={config.icono}
      etiquetaIcono={tipo === "xp" ? "XP" : undefined}
      tono={{ fondoIcono: config.gradiente, colorSubtexto: config.subColor }}
      clase={clase}
    />
  );
}

