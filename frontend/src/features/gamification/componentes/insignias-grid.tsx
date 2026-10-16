import * as React from "react";
import {
  BookOpen,
  Compass,
  Crown,
  Flame,
  Heart,
  Mountain,
  Smile,
  Sprout,
  Trophy,
  Users,
} from "lucide-react";
import { InsigniaEscudo } from "./insignia-escudo";
import { Boton } from "@/componentes/ui/boton";

interface Insignia {
  titulo: string;
  subtitulo: string;
  obtenida: boolean;
  colorPrincipal: string;
  colorSecundario: string;
  icono: React.ReactNode;
}

const insignias: Insignia[] = [
  {
    titulo: "Buen Pastor",
    subtitulo: "Obtenida",
    obtenida: true,
    colorPrincipal: "#6C3AED",
    colorSecundario: "#5B30C8",
    icono: <Users />,
  },
  {
    titulo: "Paz en mi corazón",
    subtitulo: "Obtenida",
    obtenida: true,
    colorPrincipal: "#3D8BD4",
    colorSecundario: "#2563EB",
    icono: <Heart />,
  },
  {
    titulo: "Crecí en la fe",
    subtitulo: "Obtenida",
    obtenida: true,
    colorPrincipal: "#2E9E5B",
    colorSecundario: "#16A34A",
    icono: <Sprout />,
  },
  {
    titulo: "Buscador",
    subtitulo: "Obtenida",
    obtenida: true,
    colorPrincipal: "#2563EB",
    colorSecundario: "#1E4D82",
    icono: <BookOpen />,
  },
  {
    titulo: "Primeros pasos",
    subtitulo: "Obtenida",
    obtenida: true,
    colorPrincipal: "#16A34A",
    colorSecundario: "#123B2C",
    icono: <Compass />,
  },
  {
    titulo: "La oración",
    subtitulo: "Bloqueada",
    obtenida: false,
    colorPrincipal: "#94A3B8",
    colorSecundario: "#64748B",
    icono: <Flame />,
  },
  {
    titulo: "Amigo fiel",
    subtitulo: "Bloqueada",
    obtenida: false,
    colorPrincipal: "#94A3B8",
    colorSecundario: "#64748B",
    icono: <Smile />,
  },
  {
    titulo: "Líder servidor",
    subtitulo: "Bloqueada",
    obtenida: false,
    colorPrincipal: "#94A3B8",
    colorSecundario: "#64748B",
    icono: <Crown />,
  },
  {
    titulo: "Fe inquebrantable",
    subtitulo: "Bloqueada",
    obtenida: false,
    colorPrincipal: "#94A3B8",
    colorSecundario: "#64748B",
    icono: <Mountain />,
  },
  {
    titulo: "Campeón en Cristo",
    subtitulo: "Bloqueada",
    obtenida: false,
    colorPrincipal: "#94A3B8",
    colorSecundario: "#64748B",
    icono: <Trophy />,
  },
];

export const InsigniasGrid: React.FC = () => {
  return (
    <section className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-3">
        <h3 className="text-sm font-extrabold text-[#123B2C]">Mis insignias</h3>
        <Boton variante="texto" tamano="pequeno" clase="!text-xs !text-[#6C3AED] !font-bold hover:underline">Ver todas</Boton>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {insignias.map((insignia) => (
          <InsigniaEscudo
            key={insignia.titulo}
            titulo={insignia.titulo}
            subtitulo={insignia.subtitulo}
            obtenida={insignia.obtenida}
            colorPrincipal={insignia.colorPrincipal}
            colorSecundario={insignia.colorSecundario}
            icono={insignia.icono}
          />
        ))}
      </div>
    </section>
  );
};
