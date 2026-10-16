import { Clock3, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";

export type UserStats = {
  total: number;
  activos: number;
  pendientes: number;
  bloqueados: number;
  administradores: number;
  padres: number;
};

export function AdminUsersSummary({ stats }: { stats: UserStats }) {
  const items = [
    {
      label: "Usuarios",
      value: stats.total,
      helper: `${stats.padres} padres o tutores`,
      icon: Users,
    },
    {
      label: "Activos",
      value: stats.activos,
      helper: stats.total ? `${Math.round((stats.activos / stats.total) * 100)}% del total` : "Sin usuarios",
      icon: UserCheck,
    },
    {
      label: "Invitaciones pendientes",
      value: stats.pendientes,
      helper: "Aún no iniciaron sesión",
      icon: Clock3,
    },
    {
      label: "Acceso bloqueado",
      value: stats.bloqueados,
      helper: `${stats.administradores} administradores`,
      icon: UserX,
    },
  ];

  return (
    <section className="admin-users-metrics" aria-label="Resumen de usuarios">
      {items.map((item) => (
        <article key={item.label} className="admin-users-metric">
          <span className="admin-users-metric__icon" aria-hidden="true">
            <item.icon size={19} strokeWidth={2} />
          </span>
          <div>
            <p>{item.label}</p>
            <strong>{item.value.toLocaleString("es-EC")}</strong>
            <small>{item.helper}</small>
          </div>
        </article>
      ))}
      <span className="sr-only">
        <ShieldCheck /> {stats.administradores} administradores
      </span>
    </section>
  );
}
