import { useState } from "react";
import type { CrearRetoInput } from "@/features/clubes/hooks/use-clubes-page";
import { Boton } from "@/componentes/ui/boton";
import { Modal } from "./Modal";

interface CrearRetoModalProps {
  pending: boolean;
  onClose: () => void;
  onSubmit: (data: CrearRetoInput) => void;
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function CrearRetoModal({ pending, onClose, onSubmit }: CrearRetoModalProps) {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 86400000);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [metric, setMetric] = useState<CrearRetoInput["codigo_metrica"]>("actividades_completadas");
  const [goal, setGoal] = useState(10);
  const [xp, setXp] = useState(100);
  const [start, setStart] = useState(toDateInput(today));
  const [end, setEnd] = useState(toDateInput(nextWeek));

  return (
    <Modal title="Nuevo reto cooperativo" subtitle="El progreso se calcula con eventos reales del servidor." onClose={onClose}>
      <form
        className="club-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            codigo_metrica: metric,
            valor_objetivo: goal,
            xp_reto: xp,
            fecha_inicio: new Date(`${start}T00:00:00`).toISOString(),
            fecha_fin: new Date(`${end}T23:59:59`).toISOString(),
          });
        }}
      >
        <label>
          Nombre
          <input
            autoFocus
            value={nombre}
            minLength={3}
            maxLength={120}
            required
            placeholder="Ej. 20 actividades esta semana"
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>
        <label>
          Descripción
          <textarea
            value={descripcion}
            maxLength={300}
            rows={3}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </label>
        <div className="club-form__grid">
          <label>
            Métrica
            <select value={metric} onChange={(e) => setMetric(e.target.value as CrearRetoInput["codigo_metrica"])}>
              <option value="actividades_completadas">Actividades completadas</option>
              <option value="temas_completados">Temas completados</option>
              <option value="xp_grupal">XP grupal</option>
            </select>
          </label>
          <label>
            Meta
            <input type="number" min={1} value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
          </label>
        </div>
        <div className="club-form__grid">
          <label>
            Inicio
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label>
            Fin
            <input type="date" min={start} value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        <label>
          Premio XP
          <input type="number" min={0} max={10000} value={xp} onChange={(e) => setXp(Number(e.target.value))} />
        </label>
        <div className="club-modal__actions">
          <Boton variante="secundario" onClick={onClose}>Cancelar</Boton>
          <Boton
            type="submit"
            cargando={pending}
            disabled={nombre.trim().length < 3 || goal < 1 || !start || !end}
          >
            Crear reto
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
