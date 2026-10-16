import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

export const instanciaI18n = i18n.use(initReactI18next).init({
  resources,
  lng: "es",
  fallbackLng: "es",
  defaultNS: "common",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
