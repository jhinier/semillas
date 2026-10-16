import { ThemeCard, type ThemeCardProps } from "./theme-card";

export type PropiedadesCardLeccion = ThemeCardProps;

export function CardLeccion(props: PropiedadesCardLeccion) {
  return <ThemeCard {...props} variante="default" />;
}
