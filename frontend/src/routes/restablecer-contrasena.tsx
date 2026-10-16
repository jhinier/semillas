import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, Lock, ArrowLeft, LoaderCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/shared/auth/supabase";
import { toast } from "sonner";
import logoImg from "@/assets/images/logos/Logotipo.webp";
import "../estilos.css";
import "./login.css";

export const Route = createFileRoute("/restablecer-contrasena")({
  component: RestablecerContrasenaPage,
});

function RestablecerContrasenaPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setIsPending(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message || "No se pudo actualizar la contraseña.");
      } else {
        toast.success("¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.");
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
                Nueva Contraseña
              </span>
              <h1 className="text-xl md:text-2xl font-black text-green-950 mt-1">
                Restablecer Contraseña
              </h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Ingresa y confirma tu nueva contraseña de acceso.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Contraseña */}
              <div className="flex flex-col gap-1">
                <label htmlFor="pass" className="text-xs font-bold text-slate-500">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="pass"
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-verde-brote bg-slate-50"
                  />
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPass" className="text-xs font-bold text-slate-500">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    id="confirmPass"
                    type="password"
                    required
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Guardar contraseña</span>
                  </>
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
