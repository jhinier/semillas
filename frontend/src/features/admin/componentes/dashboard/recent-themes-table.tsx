import { Boton } from "@/componentes/ui/boton";
import { AvatarTexto } from "@/componentes/ui/avatar-texto";
import { BadgeEstado } from "@/componentes/ui/badge-estado";
import { FilaTabla, TablaBase } from "@/componentes/ui/tabla-base";
import { PanelSeccionAdmin } from "@/componentes/ui/panel-seccion-admin";

export type RecentThemeItem = {
  id: string;
  titulo: string;
  senda: string;
  estado: "Borrador" | "En revisión" | "Publicado" | "Archivado" | string;
  editorNombre: string;
  editorAvatar: string; // URL or index
  fechaEdicion: string;
};

type RecentThemesTableProps = {
  temas: RecentThemeItem[];
  onVerTodos?: () => void;
  onEditarTema?: (id: string) => void;
};

export function RecentThemesTable({ temas, onVerTodos, onEditarTema }: RecentThemesTableProps) {
  const encabezados = [
    { contenido: "Título", className: "pl-2" },
    { contenido: "Senda" },
    { contenido: "Estado" },
    { contenido: "Última edición", className: "pr-2" },
  ];

  return (
    <PanelSeccionAdmin
      titulo="Temas recientes"
      descripcion="Últimos temas modificados o creados."
      accion={
        <Boton
          type="button"
          variante="contorno"
          tamano="pequeno"
          onClick={onVerTodos}
          className="h-9 rounded-xl border-slate-200 px-4 text-xs font-bold text-slate-600"
        >
          Ver todos
        </Boton>
      }
      footer={
        <Boton
          type="button"
          variante="texto"
          onClick={onVerTodos}
          className="inline-block select-none py-1 text-center text-xs font-extrabold text-primario transition-colors hover:text-primario-oscuro"
        >
          Ver todos los temas
        </Boton>
      }
    >
      <TablaBase
        encabezados={encabezados}
        contenedorClassName="max-h-[350px] pr-1"
        tablaClassName="text-sm"
        cuerpoClassName="divide-y divide-slate-50"
        estadoVacio="No hay temas recientes todavía."
      >
        {temas.map((tema) => (
          <FilaTabla
            key={tema.id}
            onActivate={onEditarTema ? () => onEditarTema(tema.id) : undefined}
            className="group border-b border-slate-50 text-sm text-neutro-oscuro-max hover:bg-slate-50/50"
          >
            <td className="max-w-[240px] truncate py-3.5 pl-2 font-bold">
              <div className="flex max-w-[240px] items-center gap-2 truncate">
                <span className="text-base text-green-600">🌱</span>
                <span className="truncate transition-colors group-hover:text-primario">{tema.titulo}</span>
              </div>
            </td>
            <td className="max-w-[140px] truncate py-3.5 font-medium text-neutro">{tema.senda}</td>
            <td className="py-3.5">
              <BadgeEstado estado={tema.estado} />
            </td>
            <td className="py-3.5 pr-2">
              <AvatarTexto
                src={tema.editorAvatar}
                alt={tema.editorNombre}
                titulo={tema.editorNombre}
                subtitulo={tema.fechaEdicion}
                className="gap-2"
                avatarClassName="h-6 w-6 rounded-full border border-slate-200"
                tituloClassName="text-xs font-extrabold leading-tight text-neutro-oscuro"
                subtituloClassName="mt-0.5 text-[10px] leading-none text-neutro"
              />
            </td>
          </FilaTabla>
        ))}
      </TablaBase>
    </PanelSeccionAdmin>
  );
}
