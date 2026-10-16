export function EstadoVacio() {
  return (
    <td colSpan={8} className="py-16 text-center">
      <i className="fa-regular fa-rectangle-list text-slate-300 text-4xl mb-3 block" />
      <p className="font-bold text-slate-500 text-sm">
        No hay actividades creadas para este filtro
      </p>
    </td>
  );
}
