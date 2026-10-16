import { peticion } from "../../shared/api/api";
import type { Actividad, Paso, Tema } from "../../shared/api/api";
import {
  listarTemasLocalesComoApi,
  obtenerActividadesLocalesPorTema,
  obtenerPasosLocalesPorTema,
  obtenerPortadaLocal,
  obtenerTemaLocalPorServerId,
} from "@/lib/offline/offline-read";

export async function obtenerTemas(params?: { senda_id?: string }) {
  const busqueda = new URLSearchParams();
  if (params?.senda_id) busqueda.set("senda_id", params.senda_id);
  const query = busqueda.toString();

  if (!navigator.onLine) {
    const locales = await listarTemasLocalesComoApi();
    return params?.senda_id ? locales.filter((tema) => tema.senda_id === params.senda_id) : locales;
  }

  try {
    return await peticion<Tema[]>(`/temas${query ? `?${query}` : ""}`, { autenticar: false });
  } catch (error) {
    const locales = await listarTemasLocalesComoApi();
    if (locales.length > 0) return locales;
    throw error;
  }
}

export async function obtenerTema(idTema: string) {
  if (!navigator.onLine) {
    const local = await obtenerTemaLocalPorServerId(idTema);
    if (!local) throw new Error("Este tema no está descargado para usarlo sin conexión.");
    return local;
  }

  try {
    return await peticion<Tema>(`/temas/${idTema}`, { autenticar: false });
  } catch (error) {
    const local = await obtenerTemaLocalPorServerId(idTema);
    if (local) return local;
    throw error;
  }
}

export async function obtenerUrlPortadaTema(idTema: string) {
  const local = await obtenerPortadaLocal(idTema);
  if (!navigator.onLine && local) return { url: local, expira_en_segundos: 0 };

  try {
    return await peticion<{ url: string; expira_en_segundos: number }>(
      `/temas/${idTema}/portada`,
      { autenticar: false },
    );
  } catch (error) {
    if (local) return { url: local, expira_en_segundos: 0 };
    throw error;
  }
}

export async function obtenerPasos(idTema: string, idGrupoEdad?: string) {
  const busqueda = new URLSearchParams();
  if (idGrupoEdad) busqueda.set("grupo_edad_id", idGrupoEdad);
  const query = busqueda.toString();

  if (!navigator.onLine) {
    const locales = await obtenerPasosLocalesPorTema(idTema);
    if (locales.length === 0) throw new Error("Los pasos de este tema no están disponibles sin conexión.");
    return locales;
  }

  try {
    return await peticion<Paso[]>(`/temas/${idTema}/pasos${query ? `?${query}` : ""}`, {
      autenticar: false,
    });
  } catch (error) {
    const locales = await obtenerPasosLocalesPorTema(idTema);
    if (locales.length > 0) return locales;
    throw error;
  }
}

export async function obtenerActividades(idTema: string, idGrupoEdad?: string) {
  const busqueda = new URLSearchParams();
  if (idGrupoEdad) busqueda.set("grupo_edad_id", idGrupoEdad);
  const query = busqueda.toString();

  if (!navigator.onLine) {
    const locales = await obtenerActividadesLocalesPorTema(idTema);
    return locales;
  }

  try {
    const actividadesFiltradas = await peticion<Actividad[]>(
      `/temas/${idTema}/actividades${query ? `?${query}` : ""}`,
      { autenticar: false },
    );
    if (actividadesFiltradas.length > 0) return actividadesFiltradas;
    if (idGrupoEdad) {
      const todas = await peticion<Actividad[]>(`/temas/${idTema}/actividades`, {
        autenticar: false,
      });
      if (todas.length > 0) return todas;
    }
    return actividadesFiltradas;
  } catch (error) {
    const locales = await obtenerActividadesLocalesPorTema(idTema);
    if (locales.length > 0) return locales;
    throw error;
  }
}
