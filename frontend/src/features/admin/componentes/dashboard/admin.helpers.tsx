import { Boton } from "@/componentes/ui/boton";

type SendaIconConfig = {
  icon: string;
  color: string;
};

export const getSendaIcon = (s: string, icono?: string): SendaIconConfig => {
  if (icono === "fa-crown") return { icon: "fa-crown", color: "text-blue-500 bg-blue-100" };
  if (icono === "fa-heart") return { icon: "fa-heart", color: "text-violet-600 bg-violet-100" };
  if (icono === "fa-flame") return { icon: "fa-flame", color: "text-orange-500 bg-orange-100" };
  const lower = s.toLowerCase();
  if (lower.includes("padre")) return { icon: "fa-crown", color: "text-blue-500 bg-blue-100" };
  if (lower.includes("hijo")) return { icon: "fa-heart", color: "text-violet-600 bg-violet-100" };
  if (lower.includes("espíritu") || lower.includes("espiritu")) return { icon: "fa-flame", color: "text-orange-500 bg-orange-100" };
  return { icon: "fa-star", color: "text-teal-600 bg-teal-100" };
};

const BOTON_ACCION_CLS = "w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer";

type BotonAccionProps = {
  onClick?: () => void;
  title: string;
  icon: string;
  className?: string;
};

export function BotonAccion({ onClick, title, icon, className = BOTON_ACCION_CLS }: BotonAccionProps) {
  return (
    <Boton type="button" onClick={onClick} title={title} aria-label={title} className={className} variante="texto" tamano="iconoPequeno">
      <i className={`fa-solid ${icon} text-xs`} aria-hidden="true" />
    </Boton>
  );
}

const CELDA_CHECKBOX_CLS = "py-4 px-2 text-center";

export const CheckboxCell = ({ stopPropagation = true, ariaLabel }: { stopPropagation?: boolean; ariaLabel: string }) => (
  <td className={CELDA_CHECKBOX_CLS} onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}>
    <input type="checkbox" aria-label={ariaLabel} className="rounded border-slate-300 text-green-600 focus:ring-green-600 cursor-pointer" />
  </td>
);

export const FILA_HOVER_CLS = "hover:bg-slate-50/40 transition-colors group cursor-pointer";
