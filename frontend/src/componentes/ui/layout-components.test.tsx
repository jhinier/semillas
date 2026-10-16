import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Section } from "./section";
import { Grid } from "./grid";
import { Stack } from "./stack";
import { FormField } from "./form-field";
import { PageHeader } from "./page-header";
import { StateView } from "./state-view";

describe("componentes de layout", () => {
  describe("Section", () => {
    it("renderiza children", () => {
      const html = renderToStaticMarkup(
        <Section>
          <p>Contenido</p>
        </Section>
      );
      expect(html).toContain("Contenido");
    });

    it("renderiza titulo y descripcion", () => {
      const html = renderToStaticMarkup(
        <Section titulo="Mi Sección" descripcion="Descripción de sección">
          <p>Contenido</p>
        </Section>
      );
      expect(html).toContain("Mi Sección");
      expect(html).toContain("Descripción de sección");
    });

    it("renderiza accion", () => {
      const html = renderToStaticMarkup(
        <Section titulo="Sección" accion={<button>Agregar</button>}>
          <p>Contenido</p>
        </Section>
      );
      expect(html).toContain("Agregar");
      expect(html).toContain("<button");
    });

    it("aplica variante white", () => {
      const html = renderToStaticMarkup(
        <Section variante="white">
          <p>Contenido</p>
        </Section>
      );
      expect(html).toContain("bg-white");
      expect(html).toContain("rounded-3xl");
    });

    it("aplica variante muted", () => {
      const html = renderToStaticMarkup(
        <Section variante="muted">
          <p>Contenido</p>
        </Section>
      );
      expect(html).toContain("bg-slate-50");
    });

    it("preserva atributos DOM", () => {
      const html = renderToStaticMarkup(
        <Section data-testid="seccion-test" aria-label="Sección de prueba">
          <p>Contenido</p>
        </Section>
      );
      expect(html).toContain('data-testid="seccion-test"');
      expect(html).toContain('aria-label="Sección de prueba"');
    });
  });

  describe("Grid", () => {
    it("renderiza children en grid", () => {
      const html = renderToStaticMarkup(
        <Grid columnas={2}>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      expect(html).toContain("grid");
      expect(html).toContain("grid-cols-2");
      expect(html).toContain("Item 1");
      expect(html).toContain("Item 2");
    });

    it("soporta columnas responsive", () => {
      const html = renderToStaticMarkup(
        <Grid columnas={{ base: 1, md: 2, lg: 3 }}>
          <div>Item</div>
        </Grid>
      );
      expect(html).toContain("grid-cols-1");
      expect(html).toContain("md:grid-cols-2");
      expect(html).toContain("lg:grid-cols-3");
    });

    it("aplica gap correctamente", () => {
      const html = renderToStaticMarkup(
        <Grid columnas={2} gap={6}>
          <div>Item</div>
        </Grid>
      );
      expect(html).toContain("gap-6");
    });

    it("aplica alineacion", () => {
      const html = renderToStaticMarkup(
        <Grid columnas={2} alineacion="center">
          <div>Item</div>
        </Grid>
      );
      expect(html).toContain("items-center");
    });
  });

  describe("Stack", () => {
    it("renderiza children en vertical por defecto", () => {
      const html = renderToStaticMarkup(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
      expect(html).toContain("flex-col");
      expect(html).toContain("Item 1");
      expect(html).toContain("Item 2");
    });

    it("soporta dirección horizontal", () => {
      const html = renderToStaticMarkup(
        <Stack direccion="horizontal">
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
      expect(html).toContain("flex-row");
    });

    it("aplica gap correctamente", () => {
      const html = renderToStaticMarkup(
        <Stack gap={8}>
          <div>Item</div>
        </Stack>
      );
      expect(html).toContain("gap-8");
    });

    it("soporta envolver", () => {
      const html = renderToStaticMarkup(
        <Stack envolver>
          <div>Item</div>
        </Stack>
      );
      expect(html).toContain("flex-wrap");
    });

    it("preserva atributos DOM", () => {
      const html = renderToStaticMarkup(
        <Stack data-testid="stack-test">
          <div>Item</div>
        </Stack>
      );
      expect(html).toContain('data-testid="stack-test"');
    });
  });

  describe("FormField", () => {
    it("renderiza label", () => {
      const html = renderToStaticMarkup(
        <FormField label="Nombre">
          <input type="text" />
        </FormField>
      );
      expect(html).toContain("Nombre");
    });

    it("muestra asterisco cuando es requerido", () => {
      const html = renderToStaticMarkup(
        <FormField label="Email" requerido>
          <input type="email" />
        </FormField>
      );
      expect(html).toContain("Email");
      expect(html).toContain('*');
    });

    it("muestra error cuando se proporciona", () => {
      const html = renderToStaticMarkup(
        <FormField label="Contraseña" error="Mínimo 8 caracteres">
          <input type="password" />
        </FormField>
      );
      expect(html).toContain("Mínimo 8 caracteres");
      expect(html).toContain('role="alert"');
    });

    it("muestra texto de ayuda cuando no hay error", () => {
      const html = renderToStaticMarkup(
        <FormField label="Búsqueda" textoAyuda="Escribe para filtrar">
          <input type="search" />
        </FormField>
      );
      expect(html).toContain("Escribe para filtrar");
    });

    it("no muestra ayuda cuando hay error", () => {
      const html = renderToStaticMarkup(
        <FormField label="Campo" error="Error" textoAyuda="Ayuda">
          <input />
        </FormField>
      );
      expect(html).toContain("Error");
      expect(html).not.toContain("Ayuda");
    });

    it("genera id consistente para accessibility", () => {
      const html = renderToStaticMarkup(
        <FormField label="Correo Electrónico">
          <input type="email" />
        </FormField>
      );
      expect(html).toContain("correo-electrónico");
    });
  });

  describe("PageHeader", () => {
    it("renderiza titulo", () => {
      const html = renderToStaticMarkup(
        <PageHeader titulo="Gestionar Temas" />
      );
      expect(html).toContain("Gestionar Temas");
    });

    it("renderiza descripcion", () => {
      const html = renderToStaticMarkup(
        <PageHeader titulo="Temas" descripcion="Administra el contenido" />
      );
      expect(html).toContain("Administra el contenido");
    });

    it("renderiza acciones", () => {
      const html = renderToStaticMarkup(
        <PageHeader titulo="Temas" acciones={<button>Nuevo</button>} />
      );
      expect(html).toContain("Nuevo");
    });

    it("renderiza children", () => {
      const html = renderToStaticMarkup(
        <PageHeader titulo="Temas">
          <div>Filtros</div>
        </PageHeader>
      );
      expect(html).toContain("Filtros");
    });
  });

  describe("StateView", () => {
    it("renderiza children cuando no hay estados", () => {
      const html = renderToStaticMarkup(
        <StateView>
          <p>Contenido</p>
        </StateView>
      );
      expect(html).toContain("Contenido");
    });

    it("muestra estado de carga", () => {
      const html = renderToStaticMarkup(
        <StateView cargando mensajeCarga="Cargando datos...">
          <p>Contenido</p>
        </StateView>
      );
      expect(html).toContain("Cargando datos...");
      expect(html).not.toContain("Contenido");
    });

    it("muestra estado de error", () => {
      const html = renderToStaticMarkup(
        <StateView error="Algo salió mal">
          <p>Contenido</p>
        </StateView>
      );
      expect(html).toContain("Algo salió mal");
      expect(html).not.toContain("Contenido");
    });

    it("muestra estado de error con objeto Error", () => {
      const html = renderToStaticMarkup(
        <StateView error={new Error("Error de red")}>
          <p>Contenido</p>
        </StateView>
      );
      expect(html).toContain("Error de red");
    });

    it("muestra estado vacío", () => {
      const html = renderToStaticMarkup(
        <StateView vacio mensajeVacio="No hay resultados">
          <p>Contenido</p>
        </StateView>
      );
      expect(html).toContain("No hay resultados");
      expect(html).not.toContain("Contenido");
    });

    it("muestra mensaje vacío por defecto", () => {
      const html = renderToStaticMarkup(
        <StateView vacio>
          <p>Contenido</p>
        </StateView>
      );
      expect(html).toContain("No hay información disponible.");
    });

    it("prioriza carga sobre error", () => {
      const html = renderToStaticMarkup(
        <StateView cargando error="Error">
          <p>Contenido</p>
        </StateView>
      );
      expect(html).toContain("animate-spin");
      expect(html).not.toContain("Error");
    });
  });
});
