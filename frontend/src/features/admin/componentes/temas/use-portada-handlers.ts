import { type ChangeEvent, type RefObject } from "react";
import type { UseMutationResult } from "@tanstack/react-query";

interface PortadaHandlersProps {
  inputPortadaRef: RefObject<HTMLInputElement | null>;
  portadaMutation: UseMutationResult<unknown, Error, File | null, unknown>;
  titulo: string;
  temaTitulo?: string;
}

export function usePortadaHandlers({
  inputPortadaRef,
  portadaMutation,
  titulo,
  temaTitulo,
}: PortadaHandlersProps) {
  const handlePortadaInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!archivo) return;
    await portadaMutation.mutateAsync(archivo);
  };

  const handleAbrirSelectorPortada = () => {
    inputPortadaRef.current?.click();
  };

  const handleQuitarPortada = async () => {
    await portadaMutation.mutateAsync(null);
  };

  return {
    handlePortadaInput,
    handleAbrirSelectorPortada,
    handleQuitarPortada,
  };
}
