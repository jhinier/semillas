import { AvatarTexto } from "@/componentes/ui/avatar-texto";
import { BadgeEstado } from "@/componentes/ui/badge-estado";
import { FilaTabla } from "@/componentes/ui/tabla-base";
import { BotonAccion, getSendaIcon } from "../dashboard/admin.helpers";
import { MenuDesplegable } from "@/componentes/ui/menu-desplegable";
import type { TemaTableRow } from "./admin-themes-table.types";

type ThemeTableRowProps = {
  tema: TemaTableRow;
  isMenuAbierto: boolean;
  onAlternarMenu: () => void;
  onCerrarMenu: () => void;
  onEditar: () => void;
  onCRECER: () => void;
  onActivities: () => void;
  onPreview: () => void;
  onDetalle?: () => void;
  onPublicar?: () => void;
  onDespublicar?: () => void;
};

export function ThemeTableRow({
  tema,
  isMenuAbierto,
  onAlternarMenu,
  onCerrarMenu,
  onEditar,
  onCRECER,
  onActivities,
  onPreview,
  onDetalle,
  onPublicar,
  onDespublicar,
}: ThemeTableRowProps) {
  const sendaIconConfig = getSendaIcon(tema.sendaNombre, tema.sendaIcono);
  const estadoNormalizado = tema.estado.trim().toLowerCase();

  return (
    <FilaTabla
      key={tema.id}
      onActivate={() => onDetalle?.()}
      className="hover:bg-slate-50/30"
    >
      <td className="py-4 pl-6">
        <input
          type="checkbox"
          aria-label={`Seleccionar ${tema.titulo}`}
          className="rounded border-slate-300 text-primario focus:ring-primario"
        />
      </td>

      <td className="py-4 px-4">
        <button
          type="button"
          onClick={() => onDetalle?.()}
          className="text-left w-full"
        >
          <AvatarTexto
            src={tema.portadaUrl || "https://api.dicebear.com/7.x/identicon/svg?seed=Tema"}
            alt={tema.titulo}
            titulo={tema.titulo}
            subtitulo={tema.resumen || "Sin descripción..."}
            className="max-w-[220px]"
            avatarClassName="h-12 w-12 rounded-xl border border-slate-100 shadow-xs"
            contenidoClassName="max-w-[160px]"
            tituloClassName="font-extrabold leading-tight text-neutro-oscuro-max hover:text-primario transition-colors"
            subtituloClassName="mt-1 text-[11px] leading-snug text-neutro"
          />
        </button>
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full ${sendaIconConfig.color}`}
          >
            <i className={`fa-solid ${sendaIconConfig.icon} text-xs`} />
          </span>
          <span className="font-semibold text-neutro-oscuro">
            {tema.sendaNombre}
          </span>
        </div>
      </td>

      <td className="py-4 px-4 font-semibold whitespace-nowrap text-neutro">
        {tema.franjaEdad}
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <BadgeEstado estado={tema.estado} />
      </td>

      <td className="py-4 px-4 text-xs font-semibold whitespace-nowrap text-neutro">
        <div className="flex flex-col">
          <span>{tema.fechaEdicion}</span>
          {tema.horaEdicion ? (
            <span className="text-[10px] font-normal text-slate-400">
              {tema.horaEdicion}
            </span>
          ) : null}
        </div>
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <AvatarTexto
          src={tema.autorAvatar}
          alt={tema.autorNombre}
          titulo={tema.autorNombre}
          className="gap-2"
          avatarClassName="h-6 w-6 rounded-full border border-slate-200"
          tituloClassName="text-xs font-extrabold text-neutro-oscuro"
        />
      </td>

      <td className="relative py-4 pr-6 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1.5">
          <BotonAccion
            title="Vista previa"
            icon="fa-eye"
            onClick={onPreview}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          />

          <BotonAccion
            title="Ver detalle"
            icon="fa-file-lines"
            onClick={() => onDetalle?.()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-primario"
          />

          <BotonAccion
            title="Editar tema"
            icon="fa-pencil"
            onClick={onEditar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          />

          <MenuDesplegable
            items={[
              {
                label: "Editor CRECER",
                icono: "fa-bookmark",
                onClick: onCRECER,
              },
              { label: "Actividades", icono: "fa-gamepad", onClick: onActivities },
              ...(estadoNormalizado !== "publicado"
                ? [
                    {
                      label: "Publicar",
                      icono: "fa-cloud-arrow-up",
                      iconoColor: "text-green-600",
                      textoColor: "text-green-600",
                      onClick: () => onPublicar?.(),
                    },
                  ]
                : [
                    {
                      label: "Despublicar",
                      icono: "fa-cloud-arrow-down",
                      iconoColor: "text-orange-500",
                      textoColor: "text-orange-500",
                      onClick: () => onDespublicar?.(),
                    },
                  ]),
            ]}
            estaAbierto={isMenuAbierto}
            onAlternar={onAlternarMenu}
            onCerrar={onCerrarMenu}
          />
        </div>
      </td>
    </FilaTabla>
  );
}
