import * as React from "react";
import { Bell } from "lucide-react";
import { unirClases } from "@/lib/utilidades";

export interface PropiedadesCampanaBadge extends React.HTMLAttributes<HTMLDivElement> {
  conteo: number;
  clase?: string;
}

export const CampanaBadge: React.FC<PropiedadesCampanaBadge> = ({
  conteo,
  clase,
  className,
  ...propiedades
}) => {
  return (
    <div
      className={unirClases(
        "relative inline-flex items-center justify-center size-9 rounded-full border bg-violet-50 border-violet-200/40",
        className,
        clase
      )}
      {...propiedades}
    >
      <Bell className="size-4.5 text-violet-600 stroke-[2.5]" />
      {conteo > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
          {conteo}
        </span>
      )}
    </div>
  );
};
