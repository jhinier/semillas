import { useState } from "react";
import type { CrearClubInput } from "@/features/clubes/hooks/use-clubes-page";
import { Boton } from "@/componentes/ui/boton";

interface CrearClubInlineProps {
  pending: boolean;
  onSubmit: (data: CrearClubInput) => void;
  onCancel: () => void;
}

export function CrearClubInline({ pending, onSubmit, onCancel }: CrearClubInlineProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  return (
    <form
      className="club-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ nombre: nombre.trim(), descripcion: descripcion.trim() });
      }}
    >
      <label>
        Nombre
        <input
          autoFocus
          value={nombre}
          minLength={3}
          maxLength={80}
          required
          placeholder="Ej. Semillas Riobamba"
          onChange={(e) => setNombre(e.target.value)}
        />
      </label>
      <label>
        Descripción
        <textarea
          value={descripcion}
          maxLength={300}
          rows={4}
          placeholder="¿Quiénes forman parte de este club?"
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </label>
      <div className="club-modal__actions">
        <Boton variante="secundario" onClick={onCancel}>Cancelar</Boton>
        <Boton type="submit" cargando={pending} disabled={nombre.trim().length < 3}>
          Crear club
        </Boton>
      </div>
    </form>
  );
}
