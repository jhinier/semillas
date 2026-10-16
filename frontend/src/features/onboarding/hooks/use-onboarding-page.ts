import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { GrupoEdad } from "@/shared/api/api";
import { obtenerGruposEdad } from "@/features/catalog/catalog.api";
import imagenSemillas from "@/assets/images/Ilustraciones/Semilla.webp";
import imagenExploradores from "@/assets/images/Ilustraciones/Exploradores.webp";
import imagenEmbajadores from "@/assets/images/Ilustraciones/Embajadores.webp";

const imagenPorCodigo: Record<string, string> = {
  semillas: imagenSemillas,
  exploradores: imagenExploradores,
  embajadores: imagenEmbajadores,
};

export const fallbacksGrupoEdad: GrupoEdad[] = [
  {
    id: "semillas",
    codigo: "semillas",
    nombre: "Semillas",
    edad_minima: 5,
    edad_maxima: 8,
    descripcion: "Descubre a Dios a través de historias y actividades sencillas.",
    imagen_url: imagenSemillas,
    orden: 1,
  },
  {
    id: "exploradores",
    codigo: "exploradores",
    nombre: "Exploradores",
    edad_minima: 9,
    edad_maxima: 12,
    descripcion: "Aprende más de Dios y entiende su Palabra.",
    imagen_url: imagenExploradores,
    orden: 2,
  },
  {
    id: "embajadores",
    codigo: "embajadores",
    nombre: "Embajadores",
    edad_minima: 13,
    edad_maxima: 17,
    descripcion: "Profundiza en tu fe y vive con más propósito.",
    imagen_url: imagenEmbajadores,
    orden: 3,
  },
];

export function useOnboardingPage() {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const ageGroupsQuery = useQuery({
    queryKey: ["catalog", "age-groups"],
    queryFn: obtenerGruposEdad,
  });

  const data = useMemo(() => {
    if (ageGroupsQuery.data && ageGroupsQuery.data.length > 0) {
      return ageGroupsQuery.data.map((grupo) => ({
        ...grupo,
        imagen_url: grupo.imagen_url ?? imagenPorCodigo[grupo.codigo] ?? null,
      }));
    }

    return fallbacksGrupoEdad;
  }, [ageGroupsQuery.data]);

  useEffect(() => {
    const savedId = localStorage.getItem("onboarding_grupo_edad_id");
    if (savedId && data.some((grupo) => grupo.id === savedId)) {
      setSelectedGroupId(savedId);
    }
  }, [data]);

  const handleContinue = useCallback(() => {
    if (!selectedGroupId) return;

    localStorage.setItem("onboarding_grupo_edad_id", selectedGroupId);
    navigate({ to: "/onboarding/customize" as never });
  }, [selectedGroupId, navigate]);

  return {
    selectedGroupId,
    setSelectedGroupId,
    isHelpOpen,
    setIsHelpOpen,
    ageGroupsQuery,
    data,
    handleContinue,
  };
}
