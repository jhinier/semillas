import { CardMetrica } from "@/componentes/ui/card-metrica";

type StatItem = {
  label: string;
  value: string | number;
  changeText: string;
  tipo: "xp" | "racha" | "lecciones" | "offline";
};

type AdminStatsGridProps = {
  temasPublicados: number;
  usuariosActivos: number;
  actividadesCreadas: number;
  clubesActivos: number;
};

export function AdminStatsGrid({
  temasPublicados,
  usuariosActivos,
  actividadesCreadas,
  clubesActivos,
}: AdminStatsGridProps) {
  const stats: StatItem[] = [
    {
      label: "Temas publicados",
      value: temasPublicados,
      changeText: "12% vs. la semana pasada",
      tipo: "lecciones",
    },
    {
      label: "Usuarios activos",
      value: usuariosActivos.toLocaleString("es-EC"),
      changeText: "8% vs. la semana pasada",
      tipo: "offline",
    },
    {
      label: "Actividades creadas",
      value: actividadesCreadas,
      changeText: "15% vs. la semana pasada",
      tipo: "xp",
    },
    {
      label: "Clubes activos",
      value: clubesActivos,
      changeText: "9% vs. la semana pasada",
      tipo: "racha",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <CardMetrica
          key={stat.label}
          titulo={stat.label}
          valor={stat.value}
          subtexto={stat.changeText}
          tipo={stat.tipo}
        />
      ))}
    </div>
  );
}
