import * as React from "react";
import {
  Book,
  BookOpen,
  Check,
  Download,
  Gamepad2,
  Home,
  Settings,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { Boton } from "@/componentes/ui/boton";
import { unirClases } from "@/lib/utilidades";

interface ElementoMenu {
  id: string;
  etiqueta: string;
  icono: React.ReactNode;
}

const elementosMenu: ElementoMenu[] = [
  { id: "Inicio", etiqueta: "Inicio", icono: <Home className="size-4.5" /> },
  { id: "Sendas", etiqueta: "Sendas", icono: <BookOpen className="size-4.5" /> },
  { id: "Mis Temas", etiqueta: "Mis Temas", icono: <Book className="size-4.5" /> },
  { id: "Actividades", etiqueta: "Actividades", icono: <Gamepad2 className="size-4.5" /> },
  { id: "Clubes", etiqueta: "Clubes", icono: <Users className="size-4.5" /> },
  { id: "Logros", etiqueta: "Logros", icono: <Trophy className="size-4.5" /> },
  { id: "Perfil", etiqueta: "Perfil", icono: <User className="size-4.5" /> },
  { id: "Descargas", etiqueta: "Descargas", icono: <Download className="size-4.5" /> },
  { id: "Ajustes", etiqueta: "Ajustes", icono: <Settings className="size-4.5" /> },
];

export interface PropiedadesSidebarIzquierdo {
  seccionActiva: string;
  onCambiarSeccion: (id: string) => void;
}

export const SidebarIzquierdo: React.FC<PropiedadesSidebarIzquierdo> = ({
  seccionActiva,
  onCambiarSeccion,
}) => {
  return (
    <aside className="w-[240px] bg-white border-r border-[#E2E8F0] p-5 flex flex-col justify-between flex-shrink-0">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br from-[#16A34A] to-[#2E9E5B]">
            🌱
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#123B2C] leading-none">Semillas</h2>
            <span className="text-[10px] text-gray-400 font-bold">Crecer en la Palabra, vivir Su verdad</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {elementosMenu.map((item) => {
            const esActivo = item.id === seccionActiva;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onCambiarSeccion(item.id)}
                className={unirClases(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left",
                  esActivo ? "bg-[#FAF5FF] text-[#6C3AED]" : "bg-transparent text-[#64748B]"
                )}
              >
                <span className={esActivo ? "text-[#6C3AED]" : "text-[#94A3B8]"}>{item.icono}</span>
                <span>{item.etiqueta}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <div className="p-3.5 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center size-5.5 rounded-full bg-[#E8F8EE]">
              <Check className="size-3 text-[#2E9E5B] stroke-[3]" />
            </span>
            <div>
              <h4 className="text-[11px] font-extrabold text-[#123B2C] leading-none">Sincronizado</h4>
              <p className="text-[9px] text-[#64748B] font-bold mt-0.5">Todo actualizado</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-bold">
            <span>Hace 2 minutos</span>
            <Boton variante="texto" tamano="pequeno" type="button" className="!text-[#6C3AED] hover:underline">Ver detalles</Boton>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-1">
          <div
            className="w-9 h-9 rounded-full bg-[#FFFBEB] border border-[#F4B740]/30 flex items-center justify-center text-lg overflow-hidden flex-shrink-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80')",
              backgroundSize: "cover",
            }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-gray-800 truncate leading-none">Semillero</h4>
            <span className="text-[9px] text-gray-400 font-bold block mt-0.5">Explorador • Nivel 7</span>
            <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-[#6C3AED] rounded-full" style={{ width: "72%" }} />
            </div>
            <span className="text-[8px] text-[#6C3AED] font-extrabold mt-0.5 block">1,250 XP</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
