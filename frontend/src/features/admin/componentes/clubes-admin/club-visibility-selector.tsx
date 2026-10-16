import { Section } from "@/componentes/ui/section";
import { Stack } from "@/componentes/ui/stack";

interface ClubVisibilidades {
  todos: boolean;
  semillitas: boolean;
  guardianes: boolean;
  corazones: boolean;
  jovenes: boolean;
}

interface ClubVisibilitySelectorProps {
  clubVisibilities: ClubVisibilidades;
  onClubVisibilitiesChange: React.Dispatch<React.SetStateAction<ClubVisibilidades>>;
}

interface ClubItemProps {
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
  nombre: string;
  descripcion: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ClubItem({
  icon,
  iconBgColor,
  iconTextColor,
  nombre,
  descripcion,
  checked,
  onChange,
}: ClubItemProps) {
  return (
    <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full ${iconBgColor} ${iconTextColor} flex items-center justify-center shrink-0`}
        >
          <i className={`fa-solid ${icon} text-xs`} />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-800 text-[12.5px]">{nombre}</span>
          <span className="text-[10px] text-slate-400 font-bold mt-0.5">{descripcion}</span>
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded-md border-slate-300 text-green-600 focus:ring-green-600 w-4.5 h-4.5 cursor-pointer"
      />
    </label>
  );
}

export function ClubVisibilitySelector({
  clubVisibilities,
  onClubVisibilitiesChange,
}: ClubVisibilitySelectorProps) {
  const handleTodosChange = (checked: boolean) => {
    onClubVisibilitiesChange({
      todos: checked,
      semillitas: checked,
      guardianes: checked,
      corazones: checked,
      jovenes: checked,
    });
  };

  const handleIndividualChange = (
    key: keyof Omit<ClubVisibilidades, "todos">,
    checked: boolean
  ) => {
    onClubVisibilitiesChange({
      ...clubVisibilities,
      [key]: checked,
      todos: false,
    });
  };

  return (
    <Section variante="white" padding="lg">
      <Stack gap={4}>
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base">
            Visibilidad por clubes
          </h3>
          <p className="text-[12px] text-slate-400 mt-1 font-medium">
            Selecciona en que clubes estara disponible este tema.
          </p>
        </div>

        <Stack gap={2.5}>
          <ClubItem
            icon="fa-users"
            iconBgColor="bg-slate-100"
            iconTextColor="text-slate-500"
            nombre="Todos los clubes"
            descripcion="Visible en todos los clubes"
            checked={clubVisibilities.todos}
            onChange={handleTodosChange}
          />

          <ClubItem
            icon="fa-leaf"
            iconBgColor="bg-green-50"
            iconTextColor="text-green-600"
            nombre="Semillitas de Luz"
            descripcion="Club 8-10 anos"
            checked={clubVisibilities.semillitas}
            onChange={(checked) => handleIndividualChange("semillitas", checked)}
          />

          <ClubItem
            icon="fa-feather"
            iconBgColor="bg-blue-50"
            iconTextColor="text-blue-500"
            nombre="Guardianes de Paz"
            descripcion="Club 8-10 anos"
            checked={clubVisibilities.guardianes}
            onChange={(checked) => handleIndividualChange("guardianes", checked)}
          />

          <ClubItem
            icon="fa-heart"
            iconBgColor="bg-red-50"
            iconTextColor="text-red-500"
            nombre="Corazones Valientes"
            descripcion="Club 11-13 anos"
            checked={clubVisibilities.corazones}
            onChange={(checked) => handleIndividualChange("corazones", checked)}
          />

          <ClubItem
            icon="fa-mountain"
            iconBgColor="bg-teal-50"
            iconTextColor="text-teal-600"
            nombre="Jovenes en Mision"
            descripcion="Club 14+ anos"
            checked={clubVisibilities.jovenes}
            onChange={(checked) => handleIndividualChange("jovenes", checked)}
          />
        </Stack>

        <div className="mt-2 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 text-green-600">
          <i className="fa-solid fa-leaf text-xs shrink-0" />
          <span className="text-[11px] font-bold leading-relaxed">
            Puedes cambiar la visibilidad mas tarde desde la configuracion del tema.
          </span>
        </div>
      </Stack>
    </Section>
  );
}

export type { ClubVisibilidades };
