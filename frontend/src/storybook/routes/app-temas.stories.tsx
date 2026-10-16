import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { CardLeccion } from "@/componentes/ui/card-leccion";
import { TemasTabsFilter } from "@/features/themes/componentes/temas-tabs-filter";
import { TemasSearchBar } from "@/features/themes/componentes/temas-search-bar";
import { ResumenTemasCard } from "@/features/themes/componentes/resumen-temas-card";
import { ContinuarAprendiendoCard } from "@/features/themes/componentes/continuar-aprendiendo-card";
import { SendaFilterRow } from "@/features/themes/componentes/senda-filter-row";

const temas = [
  { id: "t-1", titulo: "El Amor de Dios", descripcion: "Aprende sobre el amor infinito de Dios", duracion: "20 min", xp: 50, progreso: 75, favorito: false, slug: "amor-de-dios", estado: "porDefecto" as const, senda: "padre" as const, imagenUrl: "https://picsum.photos/seed/tema1/400/200" },
  { id: "t-2", titulo: "La Creación", descripcion: "Dios creó el mundo en 6 días", duracion: "15 min", xp: 40, progreso: 100, favorito: true, slug: "creacion", estado: "completada" as const, senda: "hijo" as const, imagenUrl: "https://picsum.photos/seed/tema2/400/200" },
  { id: "t-3", titulo: "El Espíritu Santo", descripcion: "Conoce al Espíritu Santo", duracion: "25 min", xp: 60, progreso: 0, favorito: false, slug: "espiritu-santo", estado: "porDefecto" as const, senda: "espiritu" as const, imagenUrl: "https://picsum.photos/seed/tema3/400/200" },
];

function TemasPageStory() {
  return (
    <StoryRouter initialPath="/app/temas">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 w-full font-sans text-left p-4">
        <div className="flex flex-col min-w-0 gap-4">
          <SendaFilterRow searchSenda={undefined} onSendaChange={() => {}} />
          <TemasTabsFilter activo="todos" onChange={() => {}} />
          <TemasSearchBar valor="" onChange={() => {}} />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {temas.map((tema) => (
              <CardLeccion
                key={tema.id}
                titulo={tema.titulo}
                descripcion={tema.descripcion}
                duracion={tema.duracion}
                xp={tema.xp}
                progreso={tema.progreso}
                favorito={tema.favorito}
                imagenUrl={tema.imagenUrl}
                estado={tema.estado}
                mostrarSendaBadge
                onFavorito={() => {}}
                onAccion={() => {}}
                senda={tema.senda}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <ResumenTemasCard totales={18} completados={7} enProgreso={3} />
          <ContinuarAprendiendoCard
            tema={{ id: "t-1", titulo: "El Amor de Dios", descripcion: "Aprende sobre el amor infinito de Dios", progreso: 75, senda: "padre", duracion: "20 min", xp: 50, favorito: false, imagenUrl: null, estado: "enProgreso" }}
            onContinuar={() => {}}
          />
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/App/Temas",
  component: TemasPageStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TemasPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
