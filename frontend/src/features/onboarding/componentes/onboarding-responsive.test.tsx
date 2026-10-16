import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { AvatarSelector } from "./AvatarSelector";
import { GrupoEdadCard } from "./GrupoEdadCard";
import { FormNavigation } from "./FormNavigation";
import { OnboardingFooter } from "./OnboardingFooter";
import { OnboardingTopbar } from "./OnboardingTopbar";
import { ProfilePreview } from "./ProfilePreview";

describe("onboarding responsive layout", () => {
  it("expone clases para una estructura móvil compacta", () => {
    const html = renderToStaticMarkup(
      <OnboardingTopbar onHelpClick={() => undefined} />,
    );

    expect(html).toContain("onboarding-topbar");
    expect(html).toContain("onboarding-brand");
    expect(html).toContain("onboarding-help-button");
  });

  it("usa una grilla de avatares adaptativa", () => {
    const html = renderToStaticMarkup(
      <AvatarSelector selectedAvatar={3} onSelect={() => undefined} />,
    );

    expect(html).toContain("customize-avatar-grid");
    expect(html).toContain("customize-avatar-option");
  });

  it("presenta el preview como una card secundaria", () => {
    const html = renderToStaticMarkup(
      <ProfilePreview selectedAvatar={2} nickname="Ana" />,
    );

    expect(html).toContain("customize-preview");
    expect(html).toContain("customize-preview__card");
  });

  it("mantiene la navegación como una barra de acciones táctil", () => {
    const html = renderToStaticMarkup(
      <FormNavigation onBack={() => undefined} onFinish={() => undefined} isEnabled isLoading={false} />,
    );

    expect(html).toContain("customize-actions");
    expect(html).toContain("customize-actions__back");
    expect(html).toContain("customize-actions__finish");
  });

  it("reduce el texto del CTA del onboarding a un solo mensaje", () => {
    const html = renderToStaticMarkup(
      <OnboardingFooter deshabilitado onContinuar={() => undefined} />,
    );

    expect(html).toContain("Selecciona una opción");
    expect(html).not.toContain("Perfecto, puedes continuar");
  });

  it("expande las tarjetas de franja de edad en móvil", () => {
    const html = renderToStaticMarkup(
      <GrupoEdadCard
        grupo={{
          id: "semillas",
          codigo: "semillas",
          nombre: "Semillas",
          edad_minima: 5,
          edad_maxima: 8,
          descripcion: "Descubre a Dios.",
          imagen_url: null,
          orden: 1,
        }}
        seleccionado={false}
        onSelect={() => undefined}
      />,
    );

    expect(html).toContain("onboarding-age-card");
  });

  it("muestra la semántica y jerarquía nuevas de la selección de edad", () => {
    const html = renderToStaticMarkup(
      <GrupoEdadCard
        grupo={{
          id: "exploradores",
          codigo: "exploradores",
          nombre: "Exploradores",
          edad_minima: 9,
          edad_maxima: 12,
          descripcion: "Aprende más de Dios y entiende su Palabra.",
          imagen_url: null,
          orden: 2,
        }}
        seleccionado
        onSelect={() => undefined}
      />,
    );

    expect(html).toContain('class="onboarding-age-card is-selected"');
    expect(html).toContain('type="radio"');
    expect(html).toContain("onboarding-age-card__check");
    expect(html).toContain("Exploradores");
    expect(html).toContain("9–12 años");
  });
});
