import type { ReactNode } from "react";

type PantallaEstadoProps = {
  icono: ReactNode;
  titulo: string;
  descripcion: string;
  acciones: ReactNode;
  tonoFondo?: "crema" | "blanco";
};

export function PantallaEstado({
  icono,
  titulo,
  descripcion,
  acciones,
  tonoFondo = "crema",
}: PantallaEstadoProps) {
  const fondo = tonoFondo === "crema" ? "bg-[#F7F4EC]" : "bg-slate-50";

  return (
    <main
      className={`flex min-h-screen items-center justify-center px-4 py-10 ${fondo}`}
      data-testid="pantalla-estado"
    >
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl bg-white p-8 text-center shadow-lg ring-1 ring-slate-100">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-verde-brote/10 text-verde-brote">
          {icono}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-slate-800">{titulo}</h1>
          <p className="text-sm leading-relaxed text-slate-500">{descripcion}</p>
        </div>
        <div className="flex w-full flex-col gap-2">{acciones}</div>
      </section>
    </main>
  );
}
