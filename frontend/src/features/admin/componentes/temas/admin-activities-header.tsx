import { BookOpenCheck, Plus } from "lucide-react";
import { useState } from "react";
import { NuevaActividadDialog } from "./nueva-actividad-dialog";

export function AdminActivitiesHeader({ totalActividades, publicadas }: { totalActividades: number; publicadas: number }) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <div className="activity-library-header">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-950 text-emerald-100 shadow-lg shadow-emerald-950/15"><BookOpenCheck size={23} aria-hidden="true" /></div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Biblioteca editorial</span>
              <h2>Actividades</h2>
              <p>Diseña experiencias claras, por tema y franja, sin perder el contexto editorial.</p>
            </div>
          </div>
          <div className="flex items-center gap-3"><div className="activity-library-header__metric"><strong>{totalActividades}</strong><span>{publicadas} publicadas</span></div><button type="button" onClick={() => setShowDialog(true)} className="admin-primary-button"><Plus size={17} aria-hidden="true" /> Nueva actividad</button></div>
        </div>
      </div>

      {showDialog && <NuevaActividadDialog onClose={() => setShowDialog(false)} />}
    </>
  );
}
