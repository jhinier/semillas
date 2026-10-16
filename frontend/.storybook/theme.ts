import { create } from "storybook/theming/create";

export default create({
  base: "light",
  brandTitle: "🌱 Semillas - Sistema de Diseño",
  brandUrl: "/",
  brandTarget: "_self",

  // Colores principales de Semillas
  colorPrimary: "#2E9E5B",      // Verde Brote
  colorSecondary: "#6C3AED",    // Morado/Violeta principal

  // Estructura y UI
  appBg: "#F7F4EC",             // Crema Fondo
  appContentBg: "#FFFFFF",
  appBorderColor: "#E2E8F0",
  appBorderRadius: 16,          // Bordes muy redondeados consistentes con la marca

  // Tipografía
  fontBase: '"Nunito", "Inter", "system-ui", sans-serif',
  fontCode: '"JetBrains Mono", "Fira Code", monospace',

  // Colores de texto
  textColor: "#1E293B",
  textInverseColor: "#FFFFFF",
  textMutedColor: "#64748B",

  // Toolbar
  barTextColor: "#64748B",
  barSelectedColor: "#2E9E5B",  // Verde Brote
  barBg: "#FFFFFF",
});
