import { useEffect, useState } from "react";
import { useInstalarPWA } from "@/shared/hooks/use-instalar-pwa";
import { esIOS, estaInstaladaComoPWA } from "@/shared/utils/pwa";
import {
  Download,
  Share,
  Plus,
  X,
  Sprout,
  Sparkles,
  Shield,
  Zap,
  CloudOff,
  Home,
  Info,
} from "lucide-react";
import { Boton } from "./boton";
import { toast } from "sonner";
const jesusParabolasImg = "/landing-hero.webp";

export function SugerenciaInstalacionPWA() {
  const { disponible, instalar } = useInstalarPWA();
  const [mostrar, setMostrar] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);

  useEffect(() => {
    // No mostrar en la landing page
    if (window.location.pathname === "/") {
      setMostrar(false);
      return;
    }

    // No mostrar en escritorio — el prompt es para móvil
    const esEscritorioOTabletGrande = window.matchMedia("(min-width: 768px)").matches;
    if (esEscritorioOTabletGrande) {
      return;
    }

    // No mostrar si ya está instalada
    if (estaInstaladaComoPWA()) {
      return;
    }

    // No mostrar si ya se descartó en esta sesión
    const descartada = sessionStorage.getItem("semillas-pwa-install-dismissed") === "true";
    if (descartada) {
      return;
    }

    // Detectar si es iOS
    const ios = esIOS();
    setEsDispositivoIOS(ios);

    // Mostrar siempre en móvil para iOS, o cuando `disponible` sea true en otros sistemas
    if (ios) {
      const timer = setTimeout(() => setMostrar(true), 1500);
      return () => clearTimeout(timer);
    } else if (disponible) {
      const timer = setTimeout(() => setMostrar(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [disponible]);

  const handleDismiss = () => {
    sessionStorage.setItem("semillas-pwa-install-dismissed", "true");
    setMostrar(false);
  };

  const handleInstall = async () => {
    if (esDispositivoIOS) {
      toast.info("Para instalar en iOS, sigue las instrucciones en pantalla.");
      return;
    }
    const outcome = await instalar();
    if (outcome === "aceptada") {
      setMostrar(false);
    }
  };

  if (!mostrar) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[#F7F4EC] overflow-y-auto flex flex-col font-sans text-slate-800"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-header-title"
    >
      {/* 1. Header de la PWA */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-[#2E9E5B] text-white p-1.5 rounded-xl flex items-center justify-center">
            <Sprout size={20} />
          </div>
          <span className="text-xl font-black text-green-950 tracking-tight">Semillas</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Avatar del usuario con nivel 7 */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-400 bg-orange-100 overflow-hidden flex items-center justify-center">
              <span className="text-xl">👦</span>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#2E9E5B] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full border border-white flex items-center justify-center">
              7
            </span>
          </div>
          {/* Botón de cerrar */}
          <button
            onClick={handleDismiss}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition"
            aria-label="Cerrar instalador"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* 2. Contenido Principal */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-5 py-6 space-y-6 pb-24">
        {/* Banner Principal */}
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1
              id="pwa-header-title"
              className="text-3xl font-black text-slate-900 tracking-tight leading-tight"
            >
              Instala Semillas y <br />
              <span className="text-[#6C3AED]">aprende sin conexión 🌱</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Instala la app en tu dispositivo y descarga lecciones para aprender en cualquier lugar.
            </p>
          </div>

          {/* Smartphone Mockup en CSS */}
          <div className="relative w-44 h-40 bg-[#E0F2FE] rounded-3xl flex items-center justify-center overflow-hidden shrink-0 border border-sky-100">
            <div className="w-24 h-36 bg-slate-900 rounded-2xl p-1 shadow-md relative flex flex-col justify-between">
              <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto my-1" />
              <div className="flex-1 bg-[#2E9E5B] rounded-xl flex flex-col items-center justify-center p-2 text-white relative">
                <Sprout size={32} />
                <span className="text-[10px] font-black tracking-tight mt-1">Semillas</span>
              </div>
              <div className="w-3 h-3 bg-slate-800 rounded-full mx-auto my-1" />
            </div>
            {/* Círculo púrpura con flecha de descarga */}
            <span className="absolute bottom-2 right-4 bg-[#6C3AED] text-white p-2.5 rounded-full shadow-lg border border-white flex items-center justify-center">
              <Download size={18} />
            </span>
          </div>
        </section>

        {/* 3. Sección "Cómo agregar Semillas a tu pantalla de inicio" */}
        <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-base font-black text-slate-900">
            Cómo agregar Semillas a tu pantalla de inicio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Paso 1 */}
            <div className="flex flex-col items-center text-center space-y-2.5 relative">
              <span className="absolute top-0 left-4 md:left-8 bg-[#6C3AED] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                1
              </span>
              <div className="bg-violet-50 text-[#6C3AED] w-14 h-14 rounded-full flex items-center justify-center">
                <Share size={24} />
              </div>
              <strong className="text-sm font-black text-slate-800">Toca Compartir</strong>
              <p className="text-xs text-slate-500 leading-normal max-w-[150px]">
                Presiona el botón Compartir en el menú de tu navegador.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col items-center text-center space-y-2.5 relative">
              <span className="absolute top-0 left-4 md:left-8 bg-[#6C3AED] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                2
              </span>
              <div className="bg-violet-50 text-[#6C3AED] w-14 h-14 rounded-full flex items-center justify-center">
                <Plus size={24} />
              </div>
              <strong className="text-sm font-black text-slate-800">Elige "Agregar a inicio"</strong>
              <p className="text-xs text-slate-500 leading-normal max-w-[150px]">
                Selecciona la opción "Agregar a pantalla de inicio".
              </p>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col items-center text-center space-y-2.5 relative">
              <span className="absolute top-0 left-4 md:left-8 bg-[#6C3AED] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                3
              </span>
              <div className="bg-emerald-50 text-[#2E9E5B] w-14 h-14 rounded-full flex items-center justify-center relative">
                <Sprout size={24} />
                <span className="absolute -top-1 -right-1 text-amber-400">✨</span>
              </div>
              <strong className="text-sm font-black text-slate-800">¡Listo!</strong>
              <p className="text-xs text-slate-500 leading-normal max-w-[150px]">
                Semillas aparecerá en tu pantalla de inicio como una app.
              </p>
            </div>
          </div>

          {/* Banner de seguridad */}
          <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3 flex items-center gap-3 text-xs text-[#6C3AED] mt-4">
            <Shield size={18} className="shrink-0" />
            <span className="font-bold">Es seguro, rápido y no ocupa mucho espacio.</span>
          </div>
        </section>

        {/* 4. Sección "Disfruta de todas las ventajas" */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-slate-900">Disfruta de todas las ventajas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ventaja 1 */}
            <div className="bg-[#F0FDF4] border border-emerald-100 rounded-3xl p-5 flex items-center gap-4">
              <div className="bg-[#2E9E5B] text-white p-3 rounded-2xl shrink-0">
                <Zap size={20} />
              </div>
              <div className="space-y-0.5">
                <strong className="text-sm font-black text-slate-800">Acceso rápido</strong>
                <p className="text-xs text-slate-500 leading-snug">
                  Abre Semillas desde tu pantalla de inicio con un solo toque.
                </p>
              </div>
            </div>

            {/* Ventaja 2 */}
            <div className="bg-[#F5F3FF] border border-violet-100 rounded-3xl p-5 flex items-center gap-4">
              <div className="bg-[#6C3AED] text-white p-3 rounded-2xl shrink-0">
                <CloudOff size={20} />
              </div>
              <div className="space-y-0.5">
                <strong className="text-sm font-black text-slate-800">Uso offline</strong>
                <p className="text-xs text-slate-500 leading-snug">
                  Descarga lecciones y continúa aprendiendo aún sin internet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Sección "Descargar lección para offline" */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-slate-900">Descargar lección para offline</h2>
              <Info size={14} className="text-slate-400" />
            </div>
            <button
              onClick={() => toast.info("Podrás explorar el catálogo completo una vez instalado.")}
              className="text-xs font-bold text-blue-500 hover:text-blue-600 transition"
            >
              Ver todas
            </button>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <img
                src={jesusParabolasImg}
                alt="Jesús enseñando con parábolas"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shrink-0"
              />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
                  Senda del Hijo
                </span>
                <strong className="text-sm font-black text-slate-800 truncate block">
                  Jesús enseña con parábolas
                </strong>
                <span className="text-[11px] text-slate-400 block">
                  📖 Lección 3 de 24 · 🕒 12 min
                </span>
                <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                  Descubre cómo Jesús usó historias sencillas para enseñar verdades profundas.
                </p>
              </div>
            </div>

            <button
              onClick={() => toast.success("Lección añadida a la cola de descargas.")}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-3 rounded-full transition shrink-0"
              aria-label="Descargar lección"
            >
              <Download size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* 6. Barra de Acciones Fija en el Fondo */}
      <footer className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-10 flex gap-3 max-w-2xl w-full mx-auto">
        <button
          onClick={handleInstall}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 text-xs transition bg-white"
        >
          <Home size={16} />
          <div className="text-left leading-tight">
            <span className="block font-black text-slate-900">Agregar a pantalla de inicio</span>
            <span className="text-[9px] text-slate-400 block font-normal">Instala Semillas como app</span>
          </div>
        </button>

        <button
          onClick={() => {
            toast.success("Lección descargada para uso offline.");
            handleDismiss();
          }}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#6C3AED] hover:bg-[#6C3AED]/90 text-white font-bold py-3.5 text-xs transition shadow-md"
        >
          <Download size={16} />
          <div className="text-left leading-tight">
            <span className="block font-black">Descargar ahora</span>
            <span className="text-[9px] text-violet-200 block font-normal">Guardar lección para offline</span>
          </div>
        </button>
      </footer>
    </div>
  );
}
