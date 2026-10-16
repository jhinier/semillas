import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { StoryRouter } from "@/storybook/story-router";
import { LogrosTabsFilter, type CategoriaLogro } from "@/features/gamification/componentes/logros-tabs-filter";
import { InsigniaCardItem } from "@/features/gamification/componentes/insignia-card-item";
import { ProgresoXpWidget } from "@/features/gamification/componentes/progreso-xp-widget";
import { ProximaInsigniaWidget } from "@/features/gamification/componentes/proxima-insignia-widget";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";
import in2Img from "@/assets/images/Ilustraciones/in2.webp";
import "@/routes/app-logros.css";

const insigniasMock = [
  { codigo: "primera_leccion", nombre: "Primer paso", descripcion: "Completaste tu primera lección.", criterio: "Completa 1 tema", bono_xp: 20, obtenido: true, imagen: in1Img },
  { codigo: "racha_siete_dias", nombre: "Semilla constante", descripcion: "Mantén una racha de 7 días seguidos.", criterio: "7 días de racha", bono_xp: 50, obtenido: false, imagen: in2Img },
  { codigo: "explorador_palabra", nombre: "Explorador de la Palabra", descripcion: "Completa 10 actividades en total.", criterio: "Completa 10 actividades", bono_xp: 50, obtenido: false, imagen: in2Img },
];

function LogrosPageStory() {
  const [tab, setTab] = useState<CategoriaLogro>("todas");
  const obtenidas = insigniasMock.filter((insignia) => insignia.obtenido).length;
  const resumen = { total: insigniasMock.length, obtenidas, pendientes: insigniasMock.length - obtenidas };
  const filtered = tab === "obtenidas" ? insigniasMock.filter((i) => i.obtenido) : tab === "pendientes" ? insigniasMock.filter((i) => !i.obtenido) : insigniasMock;

  return (
    <StoryRouter initialPath="/app/logros">
      <div className="logros-page p-4">
        <div className="logros-layout">
          <section className="logros-main">
            <LogrosTabsFilter activo={tab} onChange={setTab} totales={resumen} />
            <div className="logros-grid">
              {filtered.map((insignia) => <InsigniaCardItem key={insignia.codigo} {...insignia} />)}
            </div>
          </section>
          <aside className="logros-aside">
            <ProgresoXpWidget xpTotal={80} numNivel={1} nombreNivel="Brote" xpRestantes={20} porcentaje={80} nombreSiguienteNivel="Raíz" />
            <ProximaInsigniaWidget nombre="Semilla constante" criterio="7 días de racha" bonoXp={50} />
          </aside>
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/App/Logros",
  component: LogrosPageStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LogrosPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
