import * as React from "react";
import { Heart, Sprout, Users } from "lucide-react";
import { Boton } from "@/componentes/ui/boton";

interface Logro {
  text: string;
  desc: string;
  time: string;
  color: string;
  icono: React.ReactNode;
}

const logros: Logro[] = [
  {
    text: '¡Obtuviste la insignia "Buen Pastor"!',
    desc: 'Completaste la senda "Dios cuida de mí".',
    time: "Hoy, 10:25 a.m.",
    color: "#6C3AED",
    icono: <Users />,
  },
  {
    text: '¡Obtuviste la insignia "Paz en mi corazón"!',
    desc: 'Completaste la senda "Paz en mi corazón".',
    time: "Ayer, 4:30 p.m.",
    color: "#3D8BD4",
    icono: <Heart />,
  },
  {
    text: '¡Obtuviste la insignia "Crecí en la fe"!',
    desc: "Completaste 5 sendas en cualquier saga.",
    time: "May 10, 11:00 a.m.",
    color: "#2E9E5B",
    icono: <Sprout />,
  },
];

export const HistorialLogros: React.FC = () => {
  return (
    <section className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold text-green-950">Historial de logros recientes</h3>
        <Boton variante="texto" tamano="pequeno" type="button" className="!text-violet-600 hover:underline">Ver todo</Boton>
      </div>
      <div className="flex flex-col gap-4">
        {logros.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span
                className="flex items-center justify-center rounded-full size-8 text-white flex-shrink-0"
                style={{ backgroundColor: item.color }}
              >
                {React.cloneElement(item.icono as React.ReactElement<{ className?: string }>, { className: "size-4 stroke-[2.5]" })}
              </span>
              <div>
                <h5 className="text-xs font-extrabold text-slate-800">{item.text}</h5>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.desc}</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">{item.time}</span>
          </div>
        ))}
      </div>
      <Boton variante="texto" tamano="pequeno" type="button" className="!text-violet-600 hover:underline mt-2 self-center">Ver más logros</Boton>
    </section>
  );
};
