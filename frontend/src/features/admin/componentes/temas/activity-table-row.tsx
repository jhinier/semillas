import { useNavigate } from "@tanstack/react-router";
import { BadgeEstado } from "@/componentes/ui/badge-estado";
import { FILA_HOVER_CLS } from "../dashboard/admin.helpers";
import { MenuAccionesActividad } from "./activity-menu-actions";
import type { ActivityTableRow } from "./admin-activities-table";

interface FilaActividadProps {
  act: ActivityTableRow;
  navigate: ReturnType<typeof useNavigate>;
  onEliminar: () => void;
}

export function FilaActividad({ act, navigate, onEliminar }: FilaActividadProps) {
  const sendaColor = act.sendaColor;

  return (
    <tr className={FILA_HOVER_CLS}>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${act.tipoBadgeBg} flex items-center justify-center shrink-0`}
          >
            <i className={`fa-solid ${act.tipoIcon} text-xs ${act.tipoIconColor}`} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-slate-800 text-xs truncate group-hover:text-green-600 transition-colors sm:text-sm">
              {act.titulo}
            </span>
            <span className="text-xs text-slate-400 truncate mt-0.5">
              {act.consigna}
            </span>
          </div>
        </div>
      </td>

      <td className="py-4 px-4 font-bold text-slate-700 text-xs">
        {act.tipoNombre}
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full ${sendaColor.bg} flex items-center justify-center shrink-0`}
          >
            <i className={`fa-solid ${sendaColor.icon} text-[9px] ${sendaColor.text}`} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-600 text-xs whitespace-nowrap">
              {act.temaNombre}
            </span>
            <span className="text-[10px] text-slate-400">{act.franjaEdad}</span>
          </div>
        </div>
      </td>

      <td className="py-4 px-2 text-center font-black text-green-600 text-xs whitespace-nowrap">
        {act.xpText}
      </td>

      <td className="py-4 px-4 text-center whitespace-nowrap">
        <BadgeEstado estado={act.estado} />
      </td>

      <td className="py-4 px-4 text-slate-400 font-bold text-xs whitespace-nowrap">
        {act.fechaCreacion}
      </td>

      <td className="py-4 px-4 text-right">
        <MenuAccionesActividad navigate={navigate} act={act} onEliminar={onEliminar} />
      </td>
    </tr>
  );
}
