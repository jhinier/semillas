import { BookOpen, Coins, GraduationCap, Trophy } from "lucide-react";
import type { GamificacionMiRespuesta } from "../profile.api";

interface SeccionMetricasProps {
  gamificacion: GamificacionMiRespuesta | undefined;
  completados: { actividades: number; temas: number };
}

const items = [
  { id: "xp", label: "XP total", icon: Coins, tone: "green" },
  { id: "nivel", label: "Nivel", icon: GraduationCap, tone: "amber" },
  { id: "logros", label: "Insignias", icon: Trophy, tone: "coral" },
  { id: "temas", label: "Temas", icon: BookOpen, tone: "teal" },
] as const;

export function SeccionMetricas({ gamificacion, completados }: SeccionMetricasProps) {
  const nivel = gamificacion?.nivel;
  const values = {
    xp: { value: nivel?.xp_total ?? 0, helper: "Puntos acumulados" },
    nivel: { value: nivel?.numero_nivel ?? 1, helper: nivel?.nombre_nivel ?? "Brote" },
    logros: { value: gamificacion?.logros.length ?? 0, helper: "Obtenidas" },
    temas: { value: completados.temas, helper: "Completados" },
  };

  return (
    <section className="profile-metrics" aria-label="Resumen del progreso">
      {items.map(({ id, label, icon: Icon, tone }) => {
        const item = values[id];
        return (
          <article key={id} className="profile-metric-card">
            <span className={`profile-metric-card__icon is-${tone}`} aria-hidden="true">
              <Icon size={21} />
            </span>
            <div className="profile-metric-card__copy">
              <span className="profile-metric-card__label">{label}</span>
              <div className="profile-metric-card__value-row">
                <strong>{item.value}</strong>
                <small>{item.helper}</small>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
