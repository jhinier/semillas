import type { Meta, StoryObj } from "@storybook/react-vite";
import { StoryRouter } from "@/storybook/story-router";
import { Link } from "@tanstack/react-router";
import { Cloud } from "lucide-react";

const imgSrc = "https://picsum.photos/seed/recompensar/800/400";

function RRecompensarStory() {
  return (
    <StoryRouter initialPath="/app/R_recompensar/tema-amor">
      <div className="w-full min-h-screen bg-slate-50 pb-16 animate-in fade-in duration-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
          <Cloud size={200} className="absolute top-10 -left-40 text-amber-200" fill="currentColor" />
          <Cloud size={150} className="absolute top-40 -right-40 text-amber-300" fill="currentColor" />
        </div>
        <div className="w-full px-4 sm:px-8 pt-6 pb-10 flex flex-col gap-6 relative z-10">
          <div className="w-full h-[200px] sm:h-[280px] rounded-[2.5rem] overflow-hidden relative shadow-lg">
            <img src={imgSrc} alt="Fase Recompensar" className="w-full h-full object-cover object-top" />
            <div className="absolute bottom-4 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full">
              <span className="text-sm font-bold text-slate-700 tracking-wide uppercase">Recompensar</span>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-slate-100 min-h-[400px] flex flex-col items-center w-full">
            <div className="flex justify-start items-center w-full mb-8">
              <span className="bg-slate-100 text-slate-600 font-bold px-5 py-2 rounded-full text-sm uppercase tracking-wider">Fase 6</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full">
              <h2 className="text-4xl sm:text-5xl font-black text-amber-500 mb-6">¡Felicidades!</h2>
              <div className="flex flex-col items-center mb-8">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 mb-6 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.8)] border-4 border-amber-300 animate-bounce">
                  <span className="text-6xl text-amber-500 drop-shadow-lg">🏆</span>
                </div>
                <p className="text-2xl text-slate-700 font-bold mt-4">Has completado con éxito el tema:</p>
                <p className="text-3xl text-green-600 font-black mt-2">El Amor de Dios</p>
              </div>
            </div>
            <div className="w-full mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4 max-w-md mx-auto relative z-10">
              <Link to="/app/temas" className="w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-xl shadow-xl bg-amber-500 text-white">
                Continuar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StoryRouter>
  );
}

const meta = {
  title: "Pantallas/CRECER/R_recompensar",
  component: RRecompensarStory,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RRecompensarStory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Escritorio: Story = {};
export const MovilApp: Story = { globals: { viewport: { value: "movilApp", isRotated: false } } };
