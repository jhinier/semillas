import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, Mail, ArrowLeft, LoaderCircle } from "lucide-react";
import { supabase } from "@/shared/auth/supabase";
import { toast } from "sonner";
import logoImg from "@/assets/images/logos/Logotipo.webp";
import "../estilos.css";
import "./login.css";

export const Route = createFileRoute("/recuperar-contrasena")({
  component: RecuperarContrasenaPage,
});

function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Por favor, ingresa tu correo electrónico.");
      return;
    }

    setIsPending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/restablecer-contrasena`,
      });

      if (error) {
        toast.error(error.message || "No se pudo enviar el correo de recuperación.");
      } else {
        toast.success("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
        void navigate({ to: "/login", search: { redirect: "/onboarding" } });
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado.");
    } finally {
      setIsPending(false);
    }
  };

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
          <section className="login-panel login-panel--form max-w-md w-full bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="login-welcome mb-6">
              <span className="login-welcome__eyebrow font-bold text-verde-brote uppercase tracking-wider text-xs">
                Seguridad de tu cuenta
              </span>
              <h1 className="text-xl md:text-2xl font-black text-green-950 mt-1">
                Recuperar Contraseña
              </h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Ingresa tu correo registrado y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-xs font-bold text-slate-500">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-verde-brote bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-verde-brote hover:bg-verde-brote/90 text-white font-bold py-3.5 text-sm shadow-sm transition mt-2"
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="animate-spin" size={16} />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar instrucciones</span>
                )}
              </button>

              <div className="flex justify-center mt-4">
                <Link
                  to="/login"
                  search={{ redirect: "/onboarding" }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-green-950 transition"
                >
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}
