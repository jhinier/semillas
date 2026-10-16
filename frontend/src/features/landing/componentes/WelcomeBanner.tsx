import { useState, useEffect } from "react";
import { X } from "lucide-react";
import logoOriginal from "@/assets/images/logos/Logo_original.webp";

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the banner in this session
    const hasSeenBanner = sessionStorage.getItem("hasSeenWelcomeBanner");
    
    if (!hasSeenBanner) {
      setIsRendered(true);
      // Pequeño retraso para la animación de entrada
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("hasSeenWelcomeBanner", "true");
    // Esperar a que termine la animación de salida para removerlo del DOM
    setTimeout(() => setIsRendered(false), 500);
  };

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 p-4 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div 
        className={`relative bg-white rounded-[2rem] overflow-hidden shadow-2xl w-full max-w-lg transition-transform duration-500 flex flex-col items-center p-8 sm:p-12 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
        }`}
      >
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors z-10"
          aria-label="Cerrar banner"
        >
          <X className="size-6" />
        </button>

        <img 
          src={logoOriginal} 
          alt="Semillas Logo" 
          className="w-48 sm:w-64 mb-8 drop-shadow-sm animate-in fade-in zoom-in duration-700 delay-100" 
        />

        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 text-center mb-4 leading-tight tracking-tight">
          Bienvenido a <span className="text-green-600">Semillas</span>
        </h2>
        
        <p className="text-slate-500 text-center text-lg leading-relaxed mb-6">
          Explora un mundo de aprendizaje divertido, gana puntos de experiencia, desbloquea insignias y crece paso a paso en la Palabra.
        </p>
        
        <p className="text-sm font-semibold tracking-widest text-green-600 uppercase opacity-80">
          Dios te ama
        </p>
      </div>
    </div>
  );
}
