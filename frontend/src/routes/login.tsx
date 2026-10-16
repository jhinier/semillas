import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { LoginFormCard } from "../features/auth/componentes/login-form-card";
import { LoginHeroPanel } from "../features/auth/componentes/login-hero-panel";
import { useLoginPage } from "../features/auth/hooks/use-login-page";
import logoImg from "@/assets/images/logos/Logotipo.webp";
import "../estilos.css";
import "./login.css";
import { BotonTemaToggle } from "@/componentes/ui/boton-tema-toggle";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/onboarding",
    ...(typeof search.reason === "string" ? { reason: search.reason } : {}),
  }) as { redirect: string; reason?: string },
  component: LoginPage,
});

export function obtenerMensajeRedireccionLogin(reason?: string) {
  if (reason === "backend_unavailable") {
    return {
      mensaje: "No pudimos verificar tu acceso porque el backend no respondió.",
      descripcion: "Revisa tu conexión o intenta de nuevo en unos minutos.",
    };
  }

  return null;
}

function LoginPage() {
  const search = Route.useSearch();
  const {
    tabActivo,
    setTabActivo,
    guestMutation,
    googleMutation,
    facebookMutation,
    facebookDisponible,
    googleDisponible,
    handleEmailSuccess,
  } = useLoginPage({
    redirectTo: search.redirect,
  });

  useEffect(() => {
    const notificacion = obtenerMensajeRedireccionLogin(search.reason);
    if (!notificacion) return;

    toast.error(notificacion.mensaje, { description: notificacion.descripcion });
  }, [search.reason]);

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

          <div className="flex items-center gap-2">
            <BotonTemaToggle />
            <div className="login-lang" aria-label="Idioma actual: Español">
              <Globe size={20} aria-hidden="true" />
              <span className="login-lang__label login-lang__label--full">Español</span>
              <span className="login-lang__label login-lang__label--compact" aria-hidden="true">ES</span>
            </div>
          </div>
        </header>

        <main className="login-main" id="main-content" role="main">
          <LoginFormCard
            onGoogleClick={() => googleMutation.mutate()}
            onFacebookClick={() => facebookMutation.mutate()}
            onGuestClick={() => guestMutation.mutate({ apodo: "Semillero" })}
            googlePending={googleMutation.isPending}
            facebookPending={facebookMutation.isPending}
            guestPending={guestMutation.isPending}
            guestError={guestMutation.isError}
            guestErrorMessage={guestMutation.error instanceof Error ? guestMutation.error.message : undefined}
            onEmailSuccess={handleEmailSuccess}
            tabActivo={tabActivo}
            onCambiarTab={setTabActivo}
            facebookDisponible={facebookDisponible}
            googleDisponible={googleDisponible}
          />
          <LoginHeroPanel />
        </main>
      </div>
    </div>
  );
}
