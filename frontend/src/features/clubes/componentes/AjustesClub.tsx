import { useState } from "react";
import { Edit3, LockKeyhole, RefreshCw, Trash2 } from "lucide-react";
import type { Club } from "@/features/clubes/clubes.api";
import type { CrearClubInput } from "@/features/clubes/hooks/use-clubes-page";
import { Boton } from "@/componentes/ui/boton";

interface AjustesClubProps {
  club: Club;
  pending: boolean;
  onUpdate: (data: CrearClubInput) => void;
  onRegenerate: () => void;
  onArchive: () => void;
}

export function AjustesClub({ club, pending, onUpdate, onRegenerate, onArchive }: AjustesClubProps) {
  const [nombre, setNombre] = useState(club.nombre);
  const [descripcion, setDescripcion] = useState(club.descripcion ?? "");
  return (
    <div className="club-settings-grid">
      <section className="club-section-card">
        <header>
          <div>
            <span className="clubes-eyebrow">Información</span>
            <h2>Editar club</h2>
            <p>Usa un nombre reconocible para tu grupo.</p>
          </div>
          <Edit3 size={30} />
        </header>
        <form
          className="club-form"
          onSubmit={(event) => {
            event.preventDefault();
            onUpdate({ nombre: nombre.trim(), descripcion: descripcion.trim() });
          }}
        >
          <label>
            Nombre del club
            <input value={nombre} maxLength={80} required minLength={3} onChange={(event) => setNombre(event.target.value)} />
          </label>
          <label>
            Descripción
            <textarea value={descripcion} maxLength={300} rows={4} onChange={(event) => setDescripcion(event.target.value)} />
          </label>
          <Boton type="submit" cargando={pending} disabled={nombre.trim().length < 3}>
            Guardar cambios
          </Boton>
        </form>
      </section>
      <section className="club-section-card club-danger-zone">
        <header>
          <div>
            <span className="clubes-eyebrow">Administración</span>
            <h2>Acceso y seguridad</h2>
            <p>Las acciones sensibles requieren confirmación.</p>
          </div>
          <LockKeyhole size={30} />
        </header>
        <div className="club-setting-action">
          <div>
            <strong>Renovar código</strong>
            <p>El código actual dejará de aceptar nuevos miembros.</p>
          </div>
          <Boton variante="violetaContorno" disabled={pending} onClick={onRegenerate} iconoIzquierdo={<RefreshCw size={16} />}>
            Renovar
          </Boton>
        </div>
        <div className="club-setting-action">
          <div>
            <strong>Archivar club</strong>
            <p>Solo es posible cuando no quedan otros miembros.</p>
          </div>
          <Boton variante="peligro" disabled={pending} onClick={onArchive} iconoIzquierdo={<Trash2 size={16} />}>
            Archivar
          </Boton>
        </div>
      </section>
    </div>
  );
}
