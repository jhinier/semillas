import { BookOpen, CheckCircle, Flame } from "lucide-react";
import type { ReactNode } from "react";

export interface ResumenTemasCardProps {
  totales: number;
  completados: number;
  enProgreso: number;
  variante?: "card" | "inline";
}

interface MetricaResumen {
  titulo: string;
  tituloCorto: string;
  valor: number;
  icono: ReactNode;
  fondoIcono: string;
  textoIcono: string;
}

function ItemResumen({ titulo, tituloCorto, valor, icono, fondoIcono, textoIcono, compacto, }: MetricaResumen & { compacto?: boolean }) {
  return (
    <div
      className={
        compacto
          ? "flex min-w-0 flex-1 items-center gap-2.5 px-2 py-2"
          : "flex min-w-0 flex-1 flex-col items-center gap-2 px-3 text-center sm:px-4"
      }
    >
      <div
        className={
          compacto
            ? "flex size-9 shrink-0 items-center justify-center rounded-xl"
            : "flex size-12 items-center justify-center rounded-full shadow-inner sm:size-14"
        }
        style={{ backgroundColor: fondoIcono }}
      >
        <span className={textoIcono}>{icono}</span>
      </div>

      <div className={compacto ? "min-w-0" : "contents"}>
        <strong
          className={
            compacto
              ? "block text-lg font-black leading-none text-slate-900"
              : "text-[1.65rem] font-black leading-none text-slate-900 sm:text-[1.85rem]"
          }
        >
          {valor}
        </strong>
        <span
          className={
            compacto
              ? "mt-1 block truncate text-[0.65rem] font-extrabold leading-none text-slate-500"
              : "text-[0.72rem] font-extrabold leading-tight text-slate-500 sm:text-[0.8rem]"
          }
        >
          {compacto ? tituloCorto : titulo}
        </span>
      </div>
    </div>
  );
}

export function ResumenTemasCard({
  totales,
  completados,
  enProgreso,
  variante = "card",
}: ResumenTemasCardProps) {
  const metricas: MetricaResumen[] = [
    {
      titulo: "Temas totales",
      tituloCorto: "Temas",
      valor: totales,
      icono: <BookOpen className="size-5" strokeWidth={2.4} />,
      fondoIcono: "#efe3ff",
      textoIcono: "text-violet-600",
    },
    {
      titulo: "Completados",
      tituloCorto: "Completados",
      valor: completados,
      icono: <CheckCircle className="size-5" strokeWidth={2.4} />,
      fondoIcono: "#ddf8e7",
      textoIcono: "text-green-700",
    },
    {
      titulo: "En progreso",
      tituloCorto: "En progreso",
      valor: enProgreso,
      icono: <Flame className="size-5" strokeWidth={2.4} />,
      fondoIcono: "#eaf2ff",
      textoIcono: "text-blue-600",
    },
  ];

  if (variante === "inline") {
    return (
      <div className="grid grid-cols-3 divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.05)]">
        {metricas.map((metrica) => (
          <ItemResumen key={metrica.titulo} {...metrica} compacto />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="m-0 w-full text-left text-[1.12rem] font-extrabold leading-none tracking-[-0.01em] text-slate-800">
          Resumen de temas
        </h3>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white py-3">
        {metricas.map((metrica) => (
          <ItemResumen key={metrica.titulo} {...metrica} />
        ))}
      </div>
    </div>
  );
}
