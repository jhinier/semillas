import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { Link } from "@tanstack/react-router";

const imgSrc = "https://picsum.photos/seed/ensenar/800/400";

const opciones = [
  { id: "e1", etiqueta: "A", texto: "Multiplicar los panes" },
  { id: "e2", etiqueta: "B", texto: "Sanar a los enfermos" },
  { id: "e3", etiqueta: "C", texto: "Resucitar a Lázaro" },
];

function EEnsenarStory() {
  return (
    <StoryRouter initialPath="/app/E_ensenar/tema-amor">
      <div className="w-full min-h-screen bg-slate-50 pb-16">
        <div className="w-full px-4 sm:px-8 pt-6 pb-10 flex flex-col gap-6">
          <div className="w-full h-[200px] sm:h-[280px] rounded-[2.5rem] overflow-hidden relative shadow-lg">
            <img src={imgSrc} alt="Fase Enseñar" className="w-full h-full object-cover object-top" />
            <div className="absolute bottom-4 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full">
              <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">Enseñar</span>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-slate-100 min-h-[500px] flex flex-col w-full">
            <div className="flex justify-start items-center mb-6">
              <span className="bg-slate-100 text-slate-600 font-bold px-5 py-2 rounded-full text-sm uppercase tracking-wider">Fase 3</span>
            </div>
            <div className="flex-1 flex flex-col w-full gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">Enseñar la Palabra</h2>
                <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
                  Dios nos ama con un amor perfecto. Este amor no cambia, no importa lo que hagamos. Su amor es eterno e inmutable.
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-2">¿Cuál de estos milagros mostró el amor de Jesús?</h3>
                <div className="flex flex-col gap-3 mt-4">
                  {opciones.map((op) => (
                    <div key={op.id} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-yellow-500 cursor-pointer transition-all">
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">{op.etiqueta}</span>
                      <span className="text-slate-700 font-medium">{op.texto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full mt-4 pt-6 border-t border-slate-100 flex flex-col gap-4">
              <Link to="/app/C_comprobar/$themeId" params={{ themeId: "tema-amor" }} className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-xl shadow-xl bg-yellow-500 text-white">
                Siguiente Fase
              </Link>
              <Link to="/app/R_relatar/$themeId" params={{ themeId: "tema-amor" }} className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-bold text-lg text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">
                Regresar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/CRECER/E_ensenar",
  component: EEnsenarStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EEnsenarStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
