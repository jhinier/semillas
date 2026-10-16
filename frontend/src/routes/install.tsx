import { createFileRoute, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { esIOS, esSafariIOS, estaInstaladaComoPWA } from "@/shared/utils/pwa";
import { useInstalarPWA } from "@/shared/hooks/use-instalar-pwa";
import {
  Download,
  Share,
  Plus,
  X,
  Sprout,
  Shield,
  Zap,
  CloudOff,
  Home,
  ArrowRight,
  Check,
  Smartphone,
} from "lucide-react";
import { Boton } from "@/componentes/ui/boton";
import { toast } from "sonner";

export const Route = createFileRoute("/install")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/onboarding",
  }) as { redirect: string },
  beforeLoad: () => {
    if (estaInstaladaComoPWA()) {
      throw redirect({ to: "/app" });
    }
  },
  component: InstallPage,
});

export function InstallPage() {
  const search = Route.useSearch();
  const { disponible, instalar } = useInstalarPWA();
  const [mostrarIOS, setMostrarIOS] = useState(false);
  const [instalacionCompletada, setInstalacionCompletada] = useState(false);

  const isIOS = esIOS();
  const isSafariIOS = esSafariIOS();

  useEffect(() => {
    setMostrarIOS(isIOS);
  }, [isIOS]);

  useEffect(() => {
    const handler = () => {
      setInstalacionCompletada(true);
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      toast.info("Usa el botón Compartir en Safari para agregar a pantalla de inicio");
      return;
    }
    const outcome = await instalar();
    if (outcome === "aceptada") {
      setInstalacionCompletada(true);
    }
  };

  const handleContinuar = () => {
    window.location.assign(search.redirect);
  };

  if (instalacionCompletada) {
    return (
      <div className="min-h-screen bg-[#F7F4EC] flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-[#2E9E5B] rounded-full flex items-center justify-center mx-auto">
            <Check size={40} className="text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">¡Instalación completa!</h1>
            <p className="text-sm text-slate-500">
              Semillas se agregó a tu pantalla de inicio. Ábrela desde ahí para la mejor experiencia.
            </p>
          </div>
          <Boton onClick={handleContinuar} className="w-full">
            Continuar
            <ArrowRight size={18} />
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F7F4EC] flex flex-col font-sans text-slate-800"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-header-title"
    >
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-[#2E9E5B] text-white p-1.5 rounded-xl flex items-center justify-center">
            <Sprout size={20} />
          </div>
          <span className="text-xl font-black text-green-950 tracking-tight">Semillas</span>
        </div>
        <button
          onClick={handleContinuar}
          className="text-sm font-bold text-slate-500 hover:text-slate-700 transition"
          aria-label="Omitir instalación"
        >
          Omitir
        </button>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#E0F2FE] rounded-full flex items-center justify-center mx-auto">
            <Smartphone size={32} className="text-[#2E9E5B]" />
          </div>
          <h1 id="install-header-title" className="text-2xl font-black text-slate-900">
            Instala Semillas
          </h1>
          <p className="text-sm text-slate-500">
            Agrega la app a tu pantalla de inicio para acceso rápido y uso offline.
          </p>
        </div>

        {mostrarIOS ? (
          <IOSInstructions isSafari={isSafariIOS} />
        ) : (
          <AndroidInstructions disponible={disponible} onInstall={handleInstall} />
        )}

        <div className="space-y-3">
          <h2 className="text-base font-black text-slate-900">Beneficios</h2>
          <div className="space-y-3">
            <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-[#2E9E5B] text-white p-2 rounded-xl shrink-0">
                <Zap size={16} />
              </div>
              <div className="space-y-0.5">
                <strong className="text-sm font-black text-slate-800">Acceso rápido</strong>
                <p className="text-xs text-slate-500">Abre Semillas desde tu pantalla de inicio</p>
              </div>
            </div>
            <div className="bg-[#F5F3FF] border border-violet-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="bg-[#6C3AED] text-white p-2 rounded-xl shrink-0">
                <CloudOff size={16} />
              </div>
              <div className="space-y-0.5">
                <strong className="text-sm font-black text-slate-800">Sin conexión</strong>
                <p className="text-xs text-slate-500">Descarga lecciones y aprende offline</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs text-[#6C3AED]">
          <Shield size={18} className="shrink-0" />
          <span className="font-bold">Es seguro, gratuito y no ocupa mucho espacio.</span>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-10">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={handleContinuar}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 text-sm transition bg-white"
          >
            <span>Continuar sin instalar</span>
          </button>
          {!mostrarIOS && (
            <button
              onClick={handleInstall}
              disabled={!disponible}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#2E9E5B] hover:bg-[#2E9E5B]/90 disabled:bg-slate-300 text-white font-bold py-3.5 text-sm transition shadow-md"
            >
              <Download size={16} />
              <span>Instalar</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function IOSInstructions({ isSafari }: { isSafari: boolean }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
      <h2 className="text-base font-black text-slate-900">Para instalar en iPhone o iPad</h2>

      {!isSafari && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
          <strong>Importante:</strong> Usa Safari para instalar Semillas. Otros navegadores no permiten agregar apps a la pantalla de inicio.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-[#6C3AED] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-black">1</span>
          </div>
          <div className="space-y-1">
            <strong className="text-sm font-black text-slate-800">Abre Safari</strong>
            <p className="text-xs text-slate-500">Asegúrate de estar usando Safari (no Chrome ni Firefox)</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-[#6C3AED] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-black">2</span>
          </div>
          <div className="space-y-1">
            <strong className="text-sm font-black text-slate-800">Toca el botón Compartir</strong>
            <p className="text-xs text-slate-500">El botón con un cuadrado y una flecha hacia arriba</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-[#6C3AED] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-black">3</span>
          </div>
          <div className="space-y-1">
            <strong className="text-sm font-black text-slate-800">Selecciona "Agregar a inicio"</strong>
            <p className="text-xs text-slate-500">Desplázate hacia abajo hasta encontrar la opción</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 bg-[#2E9E5B] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-black">4</span>
          </div>
          <div className="space-y-1">
            <strong className="text-sm font-black text-slate-800">Toca "Agregar"</strong>
            <p className="text-xs text-slate-500">Semillas aparecerá en tu pantalla de inicio</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
        <Share size={18} className="text-slate-400 shrink-0" />
        <p className="text-xs text-slate-500">
          ¿No encuentras el botón Compartir? Desplázate hacia arriba en Safari para mostrar la barra de direcciones.
        </p>
      </div>
    </div>
  );
}

function AndroidInstructions({
  disponible,
  onInstall,
}: {
  disponible: boolean;
  onInstall: () => void;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
      <h2 className="text-base font-black text-slate-800">
        Para instalar en Android o Chromebook
      </h2>

      {disponible ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2E9E5B] rounded-full flex items-center justify-center shrink-0">
              <Download size={24} className="text-white" />
            </div>
            <div className="space-y-1">
              <strong className="text-sm font-black text-slate-800">Instala desde el navegador</strong>
              <p className="text-xs text-slate-500">Toca el botón "Instalar" en la parte inferior de la pantalla</p>
            </div>
          </div>

          <Boton onClick={onInstall} className="w-full gap-2">
            <Download size={18} />
            Instalar Semillas
          </Boton>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-slate-50 rounded-xl p-4 text-center space-y-2">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
              <Smartphone size={20} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-600">
              Ya puedes usar Semillas. Si quieres instalarla después, busca el ícono de menú{" "}
              <span className="inline-flex items-center gap-1">
                <Plus size={14} /> (⋮)
              </span>{" "}
              en tu navegador.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 text-xs text-slate-500">
        <Shield size={14} className="shrink-0 mt-0.5" />
        <span>La app se instalará desde Google Play o directamente desde el navegador, según tu dispositivo.</span>
      </div>
    </div>
  );
}
