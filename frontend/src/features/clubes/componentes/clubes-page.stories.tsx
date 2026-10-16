import type { Meta, StoryObj } from "@storybook/react-vite";
import { ClubHero, MiembrosClub, RankingClub, RetosClub } from "./clubes-page";
import type { Club, MiembroClub, MiembroRankingClub, RetoCooperativo } from "@/features/clubes/clubes.api";

const club: Club = {
  id: "club-1",
  nombre: "Semillas Riobamba",
  descripcion: "Una comunidad para crecer juntos en la Palabra y servir con alegría.",
  codigo_invitacion: "SEMBRA24",
  creado_por: "user-1",
  activo: true,
  creado_en: "2026-07-01T12:00:00.000Z",
  member_count: 12,
  rol_miembro: "lider",
};

const ranking: MiembroRankingClub[] = [
  {
    miembro_token: "550e8400-e29b-41d4-a716-446655440001",
    es_actual: true,
    rol_miembro: "lider",
    unido_en: "2026-07-01T12:00:00.000Z",
    apodo: "Andres",
    clave_avatar: "1",
    url_avatar: null,
    xp_total: 1280,
    xp_semana: 320,
    actividades_semana: 8,
    numero_ranking: 1,
  },
  {
    miembro_token: "550e8400-e29b-41d4-a716-446655440002",
    es_actual: false,
    rol_miembro: "miembro",
    unido_en: "2026-07-02T12:00:00.000Z",
    apodo: "Mía",
    clave_avatar: "2",
    url_avatar: null,
    xp_total: 1020,
    xp_semana: 250,
    actividades_semana: 6,
    numero_ranking: 2,
  },
];

const retos: RetoCooperativo[] = [
  {
    id: "reto-1",
    club_id: "club-1",
    nombre: "20 actividades en equipo",
    descripcion: "Completen actividades entre todos durante esta semana.",
    codigo_metrica: "actividades_completadas",
    valor_objetivo: 20,
    xp_reto: 100,
    fecha_inicio: "2026-07-06T00:00:00.000Z",
    fecha_fin: "2026-07-13T23:59:59.000Z",
    creado_por: "user-1",
    creado_en: "2026-07-06T00:00:00.000Z",
    progreso_actual: 12,
    mi_aporte: 3,
    porcentaje: 60,
    completado: false,
    recompensa_reclamada: false,
  },
];

const meta = {
  title: "Features/Clubes/Dashboard funcional",
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, background: "#f7f8fb", minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = {
  render: () => (
    <ClubHero club={club} members={12} role="lider" copied={false} onCopy={() => undefined} onShare={() => undefined} />
  ),
};

export const Ranking: Story = {
  render: () => <RankingClub ranking={ranking} loading={false} />,
};

export const Retos: Story = {
  render: () => <RetosClub retos={retos} loading={false} isLeader onCreate={() => undefined} />,
};

export const Miembros: Story = {
  render: () => (
    <MiembrosClub
      members={ranking as MiembroClub[]}
      isLeader
      pending={false}
      onRemove={() => undefined}
      onTransfer={() => undefined}
    />
  ),
};

export const Movil: Story = {
  globals: { viewport: { value: "movilApp", isRotated: false } },
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <ClubHero club={club} members={12} role="lider" copied={false} onCopy={() => undefined} onShare={() => undefined} />
      <RetosClub retos={retos} loading={false} isLeader onCreate={() => undefined} />
    </div>
  ),
};
