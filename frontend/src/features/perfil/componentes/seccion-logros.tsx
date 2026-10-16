import { ArrowRight, BookOpenCheck, Trophy } from "lucide-react";
import type { GamificacionMiRespuesta } from "../profile.api";

interface SeccionLogrosProps {
  logros: GamificacionMiRespuesta["logros"];
  totalActividades: number;
  onVerLogros: () => void;
  onEmpezar: () => void;
}

function formatearFecha(fecha: string) {
  try {
    return new Intl.DateTimeFormat("es-EC", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(fecha));
  } catch {
    return "Recientemente";
  }
}

export function SeccionLogros({
  logros,
  totalActividades,
  onVerLogros,
  onEmpezar,
}: SeccionLogrosProps) {
  return (
    <section className="profile-achievements-card">
      <div className="profile-section-heading">
        <div>
          <p className="profile-eyebrow">Actividad</p>
          <h2>Logros recientes</h2>
        </div>
        <button type="button" className="profile-link-button" onClick={onVerLogros}>
          Ver todos
          <ArrowRight size={17} aria-hidden="true" />
        </button>
      </div>

      {logros.length > 0 ? (
        <div className="profile-achievements-list">
          {logros.slice(0, 3).map((item) => (
            <article key={item.logro_id} className="profile-achievement-item">
              <span className="profile-achievement-item__icon" aria-hidden="true">
                {item.logro?.url_icono ? (
                  <img src={item.logro.url_icono} alt="" />
                ) : (
                  <Trophy size={22} />
                )}
              </span>
              <div className="profile-achievement-item__copy">
                <h3>{item.logro?.nombre ?? "Logro desbloqueado"}</h3>
                <p>
                  {item.logro?.descripcion ??
                    "Completaste una meta importante dentro de Semillas."}
                </p>
              </div>
              <time dateTime={item.ganado_en}>{formatearFecha(item.ganado_en)}</time>
            </article>
          ))}
        </div>
      ) : (
        <div className="profile-empty-achievements">
          <span className="profile-empty-achievements__icon" aria-hidden="true">
            <BookOpenCheck size={28} />
          </span>
          <div>
            <h3>Tu primera insignia está cerca</h3>
            <p>
              Has completado {totalActividades} actividades. Termina un tema para empezar a
              desbloquear logros.
            </p>
          </div>
          <button type="button" className="profile-primary-button" onClick={onEmpezar}>
            Elegir un tema
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
