import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe, Mail, ArrowRight } from "lucide-react";
import logoImg from "@/assets/images/logos/Logotipo.webp";
import "../estilos.css";
import "./login.css";

export const Route = createFileRoute("/verificar-correo")({
  component: VerificarCorreoPage,
});

function VerificarCorreoPage() {
  return (
    <div className="login-page">
      <div className="login-shell">
        <header className="login-topbar" role="banner">
          <Link to="/" className="login-brand" aria-label="Ir al inicio de Semillas">
            <img src={logoImg} alt="Logo de Semillas" className="login-brand__img" width="56" height="56" />
            <div className="login-brand__text">
              <span className="login-brand__name">Semillas</span>
              <span className="login-brand__tagline">Crecer en la Palabra, vivir Su verdad</span>
            </div>
          </Link>

          <div className="login-lang" aria-label="Idioma actual: Español">
            <Globe size={20} aria-hidden="true" />
            <span className="login-lang__label login-lang__label--full">Español</span>
          </div>
        </header>

        <main className="login-main flex items-center justify-center py-10" id="main-content" role="main">
          <section className="login-panel login-panel--form max-w-md w-full bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4 animate-bounce">
              <Mail size={32} />
            </div>

            <span className="text-[10px] font-bold text-verde-brote uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
              ¡Casi listo!
            </span>

            <h1 className="text-xl md:text-2xl font-black text-green-950 mt-3">
              Verifica tu Correo
            </h1>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Hemos enviado un enlace de confirmación a tu dirección de correo electrónico. Por favor, revisa tu bandeja de entrada (y la carpeta de spam si es necesario) y haz clic en el enlace para activar tu cuenta.
            </p>

            <div className="w-full border-t border-slate-100 my-6" />

            <Link
              to="/login"
              search={{ redirect: "/onboarding" }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-verde-brote hover:bg-verde-brote/90 text-white font-bold py-3.5 text-sm shadow-sm transition"
            >
              <span>Ir al inicio de sesión</span>
              <ArrowRight size={16} />
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
