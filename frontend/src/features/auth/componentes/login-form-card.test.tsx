import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

process.env.VITE_API_URL = process.env.VITE_API_URL ?? "http://localhost";
process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "http://localhost";
process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? "test-anon-key";

const { LoginFormCard } = await import("./login-form-card");

describe("LoginFormCard", () => {
  it("renderiza tabs de redes sociales y correo", () => {
    const html = renderToStaticMarkup(
      <LoginFormCard
        onGoogleClick={() => undefined}
        onFacebookClick={() => undefined}
        onGuestClick={() => undefined}
        onEmailSuccess={() => undefined}
        tabActivo="social"
        onCambiarTab={() => undefined}
        facebookDisponible={false}
      />,
    );

    expect(html).toContain("Redes sociales");
    expect(html).toContain("Correo electrónico");
  });

  it("muestra opciones sociales cuando tabActivo es social", () => {
    const html = renderToStaticMarkup(
      <LoginFormCard
        onGoogleClick={() => undefined}
        onFacebookClick={() => undefined}
        onGuestClick={() => undefined}
        onEmailSuccess={() => undefined}
        tabActivo="social"
        onCambiarTab={() => undefined}
        facebookDisponible={true}
      />,
    );

    expect(html).toContain("Continuar con Google");
    expect(html).toContain("Continuar con Facebook");
  });

  it("muestra Facebook cuando está disponible", () => {
    const html = renderToStaticMarkup(
      <LoginFormCard
        onGoogleClick={() => undefined}
        onFacebookClick={() => undefined}
        onGuestClick={() => undefined}
        onEmailSuccess={() => undefined}
        tabActivo="social"
        onCambiarTab={() => undefined}
        facebookDisponible={true}
      />,
    );

    expect(html).toContain("Continuar con Facebook");
    expect(html).toContain("Continuar con Google");
  });

  it("muestra formulario de correo cuando tabActivo es email", () => {
    const html = renderToStaticMarkup(
      <LoginFormCard
        onGoogleClick={() => undefined}
        onFacebookClick={() => undefined}
        onGuestClick={() => undefined}
        onEmailSuccess={() => undefined}
        tabActivo="email"
        onCambiarTab={() => undefined}
        facebookDisponible={false}
      />,
    );

    expect(html).toContain("Iniciar sesión");
  });

  it("no incluye el botón de modo desarrollo", () => {
    const html = renderToStaticMarkup(
      <LoginFormCard
        onGoogleClick={() => undefined}
        onFacebookClick={() => undefined}
        onGuestClick={() => undefined}
        onEmailSuccess={() => undefined}
        tabActivo="social"
        onCambiarTab={() => undefined}
        facebookDisponible={false}
      />,
    );

    expect(html).not.toContain("Modo desarrollo");
    expect(html).not.toContain("admin de prueba");
  });

  it("muestra un eyebrow y tabs con semántica de segmented control", () => {
    const html = renderToStaticMarkup(
      <LoginFormCard
        onGoogleClick={() => undefined}
        onFacebookClick={() => undefined}
        onGuestClick={() => undefined}
        onEmailSuccess={() => undefined}
        tabActivo="social"
        onCambiarTab={() => undefined}
        facebookDisponible={false}
      />,
    );

    expect(html).toContain("Tu aventura comienza aquí");
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
  });

  it("incluye el mensaje compacto de privacidad para móvil", () => {
    const html = renderToStaticMarkup(
      <LoginFormCard
        onGoogleClick={() => undefined}
        onFacebookClick={() => undefined}
        onGuestClick={() => undefined}
        onEmailSuccess={() => undefined}
        tabActivo="social"
        onCambiarTab={() => undefined}
        facebookDisponible={false}
      />,
    );

    expect(html).toContain("login-mobile-privacy");
    expect(html).toContain("Tu información está protegida.");
  });

  it("incluye las tres características compactas en móvil", () => {
    const html = renderToStaticMarkup(
      <LoginFormCard
        onGoogleClick={() => undefined}
        onFacebookClick={() => undefined}
        onGuestClick={() => undefined}
        onEmailSuccess={() => undefined}
        tabActivo="social"
        onCambiarTab={() => undefined}
        facebookDisponible={false}
      />,
    );

    expect(html).toContain("login-mobile-highlights");
    expect(html).toContain("Contenido seguro");
    expect(html).toContain("Aprende jugando");
    expect(html).toContain("Basada en la Biblia");
  });
});
