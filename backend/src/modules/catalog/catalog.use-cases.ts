type CatalogRepository = ReturnType<typeof import("./catalog.repository").crearCatalogRepository>;

export function crearCasosUsoCatalogo(repositorio: CatalogRepository) {
  return {
    async listarGruposEtarios(supabaseUrl: string) {
      const baseUrlStorage = `${supabaseUrl}/storage/v1/object/public/imagenes/onboarding`;
      const grupos = await repositorio.listarGruposEtarios();

      return (grupos ?? []).map((grupo) => ({
        ...grupo,
        imagen_url: `${baseUrlStorage}/${grupo.codigo.toLowerCase()}.png`
      }));
    },

    listarTiposActividad() {
      return repositorio.listarTiposActividad();
    },

    listarLibrosBiblicos() {
      return repositorio.listarLibrosBiblicos().then((libros) =>
        (libros ?? []).map((libro) => ({
          codigo: String(libro.id),
          nombre: libro.nombre,
          orden: libro.orden,
          testamento_id: libro.testamento_id
        }))
      );
    },

    listarVersionesBiblicas() {
      return repositorio.listarVersionesBiblicas();
    },

    listarPasosCrecer() {
      return repositorio.listarPasosCrecer();
    }
  };
}
