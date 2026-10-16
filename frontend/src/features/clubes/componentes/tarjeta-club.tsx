import { Copy, UserPlus, Share2, Shield, Edit2, Check } from "lucide-react";
import { Card } from "@/componentes/ui/card-base";
import { Boton } from "@/componentes/ui/boton";
import bannerKidsImg from "@/assets/images/Ilustraciones/Ninos 2.webp";

type PropsTarjetaClub = {
  nombre: string;
  descripcion: string;
  codigoInvitacion: string;
  miembros: number;
  onCopiarCodigo: () => void;
  onCompartirCodigo: () => void;
  onInvitar: () => void;
  onEditar?: () => void;
  copiado: boolean;
};

export function TarjetaClub({
  nombre,
  descripcion,
  codigoInvitacion,
  miembros,
  onCopiarCodigo,
  onCompartirCodigo,
  onInvitar,
  onEditar,
  copiado,
}: PropsTarjetaClub) {
  return (
    <Card sombra="sm" className="overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col items-stretch gap-5 md:flex-row md:items-center md:gap-6">
        <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-crema sm:h-48 md:w-[42%]">
          <img src={bannerKidsImg} alt={nombre} className="h-full w-full object-cover" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
          <div className="mb-1.5 flex min-w-0 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violeta-oscuro text-white lg:hidden" aria-hidden="true">
              <Shield size={20} className="fill-white/10" />
            </span>
            <h2 className="min-w-0 flex-1 truncate text-xl font-black text-indigo-950 sm:text-2xl">{nombre}</h2>
            {onEditar ? (
              <Boton
                variante="texto"
                tamano="iconoPequeno"
                onClick={onEditar}
                aria-label={`Editar club ${nombre}`}
                className="!min-h-11 !min-w-11 !rounded-full !p-1 !text-slate-400 hover:!bg-slate-100 hover:!text-slate-600"
              >
                <Edit2 size={16} />
              </Boton>
            ) : null}
          </div>
          <p className="mb-5 text-sm font-semibold leading-relaxed text-slate-400 sm:mb-6">{descripcion}</p>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-6">
            <div className="min-w-0">
              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Código de invitación</span>
              <div className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-1.5">
                <span className="min-w-0 flex-1 truncate text-sm font-black tracking-wide text-violeta-oscuro">{codigoInvitacion}</span>
                <Boton
                  variante="texto"
                  tamano="iconoPequeno"
                  onClick={onCopiarCodigo}
                  className="!min-h-10 !min-w-10 !shrink-0 !p-0 !text-violeta-oscuro hover:!text-violet-900"
                  title="Copiar código"
                  aria-label="Copiar código de invitación"
                >
                  {copiado ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </Boton>
              </div>
            </div>

            <div>
              <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Miembros</span>
              <div className="flex min-h-11 items-center gap-2 py-1.5">
                <i className="fa-solid fa-users text-sm text-slate-400" aria-hidden="true" />
                <span className="text-base font-black text-slate-700">{miembros}</span>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            <Boton
              variante="violetaContorno"
              tamano="pequeno"
              onClick={onCompartirCodigo}
              className="w-full rounded-2xl px-4 py-3 text-xs font-bold shadow-sm"
            >
              <Share2 size={14} />
              Compartir código
            </Boton>
            <Boton
              variante="violeta"
              tamano="pequeno"
              onClick={onInvitar}
              className="w-full rounded-2xl px-4 py-3 text-xs font-bold shadow-sm"
            >
              <UserPlus size={14} />
              Invitar
            </Boton>
          </div>
        </div>

        <div className="hidden size-16 shrink-0 items-center justify-center rounded-2xl bg-violeta-oscuro text-white shadow-sm lg:flex" aria-hidden="true">
          <Shield size={32} className="fill-white/10" />
        </div>
      </div>
    </Card>
  );
}
