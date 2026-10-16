import type { ComponentType } from "react";
import { Boton } from "@/componentes/ui/boton";

type ActionButtonProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
};

export function ActionButton({ icon: Icon, label, onClick }: ActionButtonProps) {
  return (
    <Boton
      type="button"
      onClick={onClick}
      variante="contorno"
      clase="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:border-[#2E9E5B]/40 hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-[#2E9E5B]" />
      {label}
    </Boton>
  );
}
