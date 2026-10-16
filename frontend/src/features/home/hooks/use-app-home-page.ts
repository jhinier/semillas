import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { obtenerMiPerfil } from "@/features/perfil/profile.api";
import { obtenerGamificacionPropia } from "@/features/gamification/gamification.api";
import in1Img from "@/assets/images/Ilustraciones/in1.webp";
import in2Img from "@/assets/images/Ilustraciones/in2.webp";

const VERSICULOS_DEL_DIA: Versiculo[] = [
  { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13" },
  { text: "Jehová es mi pastor; nada me faltará.", ref: "Salmos 23:1" },
  { text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehova, pensamientos de paz, y no de mal...", ref: "Jeremías 29:11" },
  { text: "Confía en Jehova con todo tu corazón, y no te apoyes en tu propia prudencia.", ref: "Proverbios 3:5" },
  { text: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.", ref: "Salmos 119:105" },
  { text: "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", ref: "Salmos 46:1" },
  { text: "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", ref: "Mateo 6:33" },
  { text: "El amor es paciente, es bondadoso. El amor no es envidioso ni jactancioso ni orgulloso.", ref: "1 Corintios 13:4" },
  { text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.", ref: "Mateo 11:28" },
  { text: "En el principio creó Dios los cielos y la tierra.", ref: "Génesis 1:1" },
];

export type Versiculo = { text: string; ref: string };

export function useAppHomePage() {
  const meQuery = useQuery({ queryKey: ["me"], queryFn: obtenerMiPerfil, staleTime: 1000 * 60 * 5 });
  const gamificationQuery = useQuery({ queryKey: ["gamification", "me"], queryFn: obtenerGamificacionPropia, staleTime: 1000 * 60 * 3 });
  const [verseOfTheDay, setVerseOfTheDay] = useState<Versiculo>(() => VERSICULOS_DEL_DIA[0]!);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const verseIndex = dayOfYear % VERSICULOS_DEL_DIA.length;
    setVerseOfTheDay(VERSICULOS_DEL_DIA[verseIndex]!);
  }, []);

  const insignias = useMemo(() => {
    const logros = gamificationQuery.data?.logros ?? [];
    return logros.map((l) => ({
      id: l.logro_id,
      nombre: l.logro?.nombre || "Insignia",
      imagenUrl: l.logro?.codigo === "primera_leccion" ? in1Img : in2Img,
    }));
  }, [gamificationQuery.data]);

  const nivel = gamificationQuery.data?.nivel;
  const nombreUsuario = meQuery.data?.perfil?.apodo || meQuery.data?.usuario?.nombre_visible || "Semillero";

  const progreso = {
    xpTotal: nivel?.xp_total ?? 0,
    numeroNivel: nivel?.numero_nivel ?? 1,
    nombreNivel: nivel?.nombre_nivel ?? "Nivel 1",
    totalInsignias: insignias.length,
  };

  return {
    meQuery,
    gamificationQuery,
    verseOfTheDay,
    insignias,
    progreso,
    nombreUsuario,
    isError: meQuery.isError || gamificationQuery.isError,
  };
}
