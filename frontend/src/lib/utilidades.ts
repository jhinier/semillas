import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function unirClases(...clases: ClassValue[]) {
  return twMerge(clsx(clases));
}
