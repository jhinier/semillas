import { useState } from "react";
import { Boton } from "@/componentes/ui/boton";
import type { MiembroClub, CategoriaReporteClub } from "@/features/clubes/clubes.api";
import { Modal } from "./Modal";

const CATEGORIAS: Array<{ value: CategoriaReporteClub; label: string }> = [
  { value: "contenido_inapropiado", label: "Contenido inapropiado" },
  { value: "acoso", label: "Acoso o conducta dañina" },
  { value: "datos_personales", label: "Datos personales" },
  { value: "otro", label: "Otro" },
];

export function ReportarClubDialog({ miembro, pendiente, onClose, onSubmit }: {
  miembro: MiembroClub;
  pendiente: boolean;
  onClose: () => void;
  onSubmit: (datos: { miembro_token: string; categoria: CategoriaReporteClub; detalle?: string }) => void;
}) {
  const [categoria, setCategoria] = useState<CategoriaReporteClub>("otro");
  const [detalle, setDetalle] = useState("");

  return (
    <Modal title={`Reportar a ${miembro.apodo}`} subtitle="El equipo administrador revisará el reporte. No compartas datos personales." onClose={onClose}>
      <form className="club-form" onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ miembro_token: miembro.miembro_token, categoria, detalle: detalle.trim() || undefined });
      }}>
        <label>
          Motivo
          <select value={categoria} onChange={(event) => setCategoria(event.target.value as CategoriaReporteClub)}>
            {CATEGORIAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Detalle (opcional)
          <textarea value={detalle} maxLength={500} rows={4} placeholder="Describe brevemente lo ocurrido." onChange={(event) => setDetalle(event.target.value)} />
        </label>
        <div className="club-modal__actions">
          <Boton variante="secundario" type="button" onClick={onClose}>Cancelar</Boton>
          <Boton type="submit" cargando={pendiente}>Enviar reporte</Boton>
        </div>
      </form>
    </Modal>
  );
}
