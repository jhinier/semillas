import * as React from "react";
import { Award, Flame, Star, Trophy } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { BarraProgreso } from "@/componentes/ui/barra-progreso";
import { EscudoEstadistica } from "./escudo-estadistica";

interface TarjetaEstadisticaProps {
  etiqueta: string;
  valor: string;
  subtitulo: string;
  colorSubtitulo: string;
  icono?: React.ReactNode;
  hijos?: React.ReactNode;
}

function TarjetaEstadistica({ etiqueta, valor, subtitulo, colorSubtitulo, icono, hijos }: TarjetaEstadisticaProps) {
  return (
    <Card sombra="sm" className="p-4 flex items-start gap-3">
      {icono}
      <div className="flex-1">
        <span className="text-[10px] text-slate-400 font-extrabold block uppercase leading-none mb-1">{etiqueta}</span>
        <h3 className="text-lg font-black text-slate-800 leading-none">{valor}</h3>
        <p className={`text-[11px] font-bold mt-1 ${colorSubtitulo}`}>{subtitulo}</p>
        {hijos && <div className="mt-3">{hijos}</div>}
      </div>
    </Card>
  );
}

export const TarjetasEstadisticas: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <TarjetaEstadistica
        etiqueta="Nivel actual"
        valor="7"
        subtitulo="Explorador"
        colorSubtitulo="text-violet-600"
        icono={
          <EscudoEstadistica
            colorBg="linear-gradient(135deg, #6C3AED, #5B30C8)"
            colorBorder="#FAF5FF"
            icono={<Trophy className="size-5 text-white" />}
          />
        }
        hijos={
          <>
            <BarraProgreso valor={550} maximo={1000} mostrarEtiquetas={false} color="morado" />
            <span className="text-[9px] text-slate-400 font-bold mt-1 block">550 XP para el nivel 8</span>
          </>
        }
      />

      <TarjetaEstadistica
        etiqueta="XP total"
        valor="1,250"
        subtitulo="Experiencia acumulada"
        colorSubtitulo="text-slate-500"
        icono={
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-blue-500 to-blue-700">
            <Star className="size-6 text-white fill-white" />
          </div>
        }
      />

      <TarjetaEstadistica
        etiqueta="Racha actual"
        valor="12 días"
        subtitulo="¡Sigue así!"
        colorSubtitulo="text-orange-500"
        icono={
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-orange-500 to-orange-700">
            <Flame className="size-6 text-white fill-white" />
          </div>
        }
        hijos={
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <span
                key={d}
                className="size-3.5 rounded-full flex items-center justify-center text-white text-[8px] font-bold bg-orange-500"
              >
                ✓
              </span>
            ))}
            <span className="size-3.5 rounded-full border border-slate-300 bg-white" />
          </div>
        }
      />

      <TarjetaEstadistica
        etiqueta="Insignias"
        valor="8 / 16"
        subtitulo="50% completado"
        colorSubtitulo="text-green-600"
        icono={
          <EscudoEstadistica
            colorBg="linear-gradient(135deg, #2E9E5B, #123B2C)"
            colorBorder="#F0FDF4"
            icono={<Award className="size-5 text-white" />}
          />
        }
        hijos={
          <BarraProgreso valor={8} maximo={16} mostrarEtiquetas={false} color="verde" />
        }
      />
    </div>
  );
};
