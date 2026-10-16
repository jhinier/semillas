import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowLeft, ArrowRight, BookOpenCheck, Check, Clock3, Play, Sparkles } from "lucide-react";
import { StoryRouter } from "@/storybook/story-router";
import { FASES_CRECER } from "@/features/crecer/crecer-fases";
import "@/routes/theme-detail.css";

function TemaDetalleStory() {
  return (
    <StoryRouter initialPath="/app/temas/tema-amor">
      <div className="min-h-screen bg-[#f7f9fc] p-4 sm:p-8">
        <div className="theme-detail mx-auto max-w-[1420px]">
          <button className="theme-detail__back" type="button">
            <ArrowLeft aria-hidden="true" /> Mis temas
          </button>
          <section className="theme-detail__hero">
            <div className="theme-detail__media">
              <img src="https://picsum.photos/seed/tema-amor/900/900" alt="Jonás y la ballena" />
            </div>
            <div className="theme-detail__intro">
              <span className="theme-detail__senda text-blue-600 bg-blue-50">
                <span className="bg-blue-500" /> Senda del Padre
              </span>
              <h1>El Amor de Dios</h1>
              <p className="theme-detail__summary">
                Un recorrido tierno y alegre para recordar que el amor de Dios es grande, fiel y cercano.
              </p>
              <div className="theme-detail__stats">
                <span><Sparkles /> 150 XP</span>
                <span><Clock3 /> 20 min</span>
                <span><BookOpenCheck /> 6 pasos</span>
              </div>
              <div className="theme-detail__progress-card">
                <div><strong>Tu progreso</strong><span>33%</span></div>
                <div className="theme-detail__progress-track"><span style={{ width: "33%" }} /></div>
                <small>Retoma desde el último paso guardado.</small>
              </div>
              <div className="theme-detail__actions">
                <button className="theme-detail__primary" type="button">
                  <Play fill="currentColor" /> Continuar lección <ArrowRight />
                </button>
              </div>
            </div>
          </section>
          <section className="theme-detail__journey">
            <div className="theme-detail__section-heading">
              <div><span>METODOLOGÍA CRECER</span><h2>Tu recorrido en seis pasos</h2></div>
              <p>Lee, participa y aplica cada enseñanza antes de recibir tu recompensa.</p>
            </div>
            <ol className="theme-detail__steps">
              {FASES_CRECER.map((fase, index) => (
                <li key={fase.codigo} className={index < 2 ? "is-complete" : index === 2 ? "is-current" : ""}>
                  <span className="theme-detail__step-number">{index < 2 ? <Check /> : fase.numero}</span>
                  <div><strong>{fase.nombre}</strong><p>{fase.descripcion}</p></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/App/TemaDetalle",
  component: TemaDetalleStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TemaDetalleStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
