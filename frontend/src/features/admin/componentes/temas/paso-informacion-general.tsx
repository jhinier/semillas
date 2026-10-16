import type { UseFormRegister } from "react-hook-form";
import type { CrearTemaSolicitud } from "../../admin.api";
import type { Senda, GrupoEdad } from "@/shared/api/api";
import { Input } from "@/componentes/ui/input-base";
import { SelectFiltro } from "@/componentes/ui/select-filtro";
import { Section } from "@/componentes/ui/section";
import { Grid } from "@/componentes/ui/grid";
import { Stack } from "@/componentes/ui/stack";
import { FormField } from "@/componentes/ui/form-field";
import { TagInput } from "./TagInput";
import { ClubVisibilitySelector, type ClubVisibilidades } from "../clubes-admin/club-visibility-selector";
import { CoverImageUpload } from "./cover-image-upload";

interface PasoInformacionGeneralProps {
  register: UseFormRegister<CrearTemaSolicitud>;
  sendas?: Senda[];
  gruposEdad?: GrupoEdad[];
  bibleVersions?: Array<{
    id: string;
    codigo: string;
    nombre: string;
    dominio_publico: boolean;
  }>;
  liveTitle: string;
  tagsInput: string;
  onTagsInputChange: (value: string) => void;
  tagsList: string[];
  onAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (idx: number) => void;
  clubVisibilities: ClubVisibilidades;
  onClubVisibilitiesChange: React.Dispatch<React.SetStateAction<ClubVisibilidades>>;
  onSlugManualEdit?: () => void;
}

export function PasoInformacionGeneral({
  register,
  sendas,
  gruposEdad,
  bibleVersions,
  liveTitle,
  tagsInput,
  onTagsInputChange,
  tagsList,
  onAddTag,
  onRemoveTag,
  clubVisibilities,
  onClubVisibilitiesChange,
  onSlugManualEdit,
}: PasoInformacionGeneralProps) {
  return (
    <>
      <Section
        variante="white"
        padding="md"
        titulo="Información del tema"
        descripcion="Completa los datos básicos para crear el nuevo tema."
      >
        <Stack gap={5}>
          <Grid columnas={{ base: 1, md: 2 }} gap={4}>
            <FormField label="Título del tema" requerido>
              <div className="relative">
                <Input
                  {...register("titulo", { required: true })}
                  maxLength={100}
                  placeholder="Ej. Dios cuida de mi"
                  className="pr-12 text-[13px] font-semibold !text-slate-800 placeholder:!text-slate-400 focus:!border-[#2e9e5b] focus:!ring-[#2e9e5b]/10"
                />
                <span className="absolute right-3 bottom-2.5 text-[10px] text-slate-400 font-bold">
                  {liveTitle.length === 16 ? 0 : liveTitle.length}/100
                </span>
              </div>
            </FormField>

            <FormField
              label="Slug (identificador)"
              requerido
              textoAyuda="Se usará en la URL. Solo minúsculas, números y guiones."
            >
              <Input
                {...register("slug", { required: true })}
                onFocus={() => onSlugManualEdit?.()}
                placeholder="ej. dios-cuida-de-mi"
                className="text-[13px] font-semibold !text-slate-800 placeholder:!text-slate-400 focus:!border-[#2e9e5b] focus:!ring-[#2e9e5b]/10"
              />
            </FormField>
          </Grid>

          <Grid columnas={{ base: 1, md: 2 }} gap={4}>
            <FormField label="Senda" requerido>
              <SelectFiltro
                opciones={sendas ?? []}
                placeholder="Selecciona una senda"
                etiquetaAria="Seleccionar senda"
                variante="cuadrado"
                {...register("senda_id", { required: true })}
              />
            </FormField>

            <FormField label="Franja de edad" requerido>
              <div className="flex flex-wrap gap-2 mt-1">
                {gruposEdad?.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:border-[#2e9e5b]/40 transition-colors cursor-pointer has-[:checked]:border-[#2e9e5b] has-[:checked]:bg-[#eefcf4]">
                    <input
                      type="checkbox"
                      value={g.id}
                      {...register("grupo_edad_ids", { required: true })}
                      className="rounded border-slate-300 text-[#2e9e5b] focus:ring-[#2e9e5b] cursor-pointer"
                    />
                    {g.nombre} ({g.edad_minima}-{g.edad_maxima} años)
                  </label>
                ))}
              </div>
            </FormField>
          </Grid>

          <Grid columnas={{ base: 1, md: 2 }} gap={4}>
            <FormField label="Objetivo del tema" requerido>
              <div className="relative">
                <textarea
                  {...register("objetivo", { required: true })}
                  maxLength={200}
                  rows={3}
                  placeholder="Ej. Que los niños comprendan que Dios siempre cuida de ellos."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:border-[#2e9e5b] focus:outline-hidden focus:ring-2 focus:ring-[#2e9e5b]/10 transition-all resize-none"
                />
                <span className="absolute right-3 bottom-2.5 text-[10px] text-slate-400 font-bold">
                  0/200
                </span>
              </div>
            </FormField>

            <FormField label="Resumen" requerido>
              <div className="relative">
                <textarea
                  {...register("resumen", { required: true })}
                  maxLength={400}
                  rows={3}
                  placeholder="Breve descripción del tema y lo que aprenderán los niños."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:border-[#2e9e5b] focus:outline-hidden focus:ring-2 focus:ring-[#2e9e5b]/10 transition-all resize-none"
                />
                <span className="absolute right-3 bottom-2.5 text-[10px] text-slate-400 font-bold">
                  0/400
                </span>
              </div>
            </FormField>
          </Grid>

          <Grid columnas={{ base: 1, md: 3 }} gap={4}>
            <FormField label="Duración estimada" requerido>
              <div className="relative flex items-center">
                <input
                  type="number"
                  {...register("minutos_estimados", { required: true })}
                  className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 focus:border-[#2e9e5b] focus:outline-hidden transition-all"
                />
                <span className="absolute right-4 text-[11px] text-slate-400 font-bold">minutos</span>
              </div>
            </FormField>

            <FormField label="XP que otorga" requerido>
              <div className="relative flex items-center">
                <input
                  type="number"
                  {...register("xp_recompensa", { required: true })}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-800 focus:border-[#2e9e5b] focus:outline-hidden transition-all"
                />
                <span className="absolute right-4 text-[11px] text-slate-400 font-bold">XP</span>
              </div>
            </FormField>

            <FormField label="Versión bíblica" requerido>
              <SelectFiltro
                opciones={bibleVersions ?? []}
                placeholder="Selecciona una versión"
                etiquetaAria="Seleccionar versión bíblica"
                variante="cuadrado"
                {...register("version_biblica_id", { required: true })}
              />
            </FormField>
          </Grid>

          <CoverImageUpload />

          <TagInput
            tags={tagsList}
            onChange={() => {}}
            inputValue={tagsInput}
            onInputChange={onTagsInputChange}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
            helperText="Escribe una etiqueta y presiona Enter. Ejemplos: amor, fe, oracion, obediencia, gratitud"
          />
        </Stack>
      </Section>

      <ClubVisibilitySelector
        clubVisibilities={clubVisibilities}
        onClubVisibilitiesChange={onClubVisibilitiesChange}
      />
    </>
  );
}
