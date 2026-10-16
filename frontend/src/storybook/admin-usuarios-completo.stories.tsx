import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import type { EstadoUsuarioAdmin, UsuarioAdmin } from "@/features/admin/admin.api";
import {
  AdminUsersFilters,
  AdminUsersSummary,
  AdminUsersTable,
} from "@/features/admin/componentes/usuarios";
import "@/routes/admin-users-studio.css";

const usuarios: UsuarioAdmin[] = [
  {
    id: "u1",
    nombre_visible: "María Luz",
    correo: "maria@example.com",
    activo: true,
    estado: "activo",
    rol: "usuario",
    proveedor: "correo",
    creado_en: "2026-07-01T10:00:00Z",
    actualizado_en: "2026-07-12T10:00:00Z",
    ultimo_login_en: "2026-07-12T14:20:00Z",
    perfil: { id: "p1", apodo: "María", avatar_url: null, clave_avatar: null, grupo_edad_id: "g1", prefiere_audio: true, tamano_texto_preferido: "mediano" },
    grupo_edad: { id: "g1", codigo: "semillas", nombre: "Semillas", edad_minima: 5, edad_maxima: 8 },
    clubes: [{ id: "c1", nombre: "Semillitas de Luz", rol_miembro: "miembro", unido_en: "2026-07-01T10:00:00Z" }],
    vinculos_familiares: 1,
    progreso: { xp_total: 2480, eventos: 37 },
  },
  {
    id: "u2",
    nombre_visible: "Familia Paz",
    correo: "familia@example.com",
    activo: true,
    estado: "pendiente",
    rol: "padre",
    proveedor: "correo",
    creado_en: "2026-07-10T10:00:00Z",
    actualizado_en: "2026-07-10T10:00:00Z",
    ultimo_login_en: null,
    perfil: null,
    grupo_edad: null,
    clubes: [],
    vinculos_familiares: 2,
    progreso: { xp_total: 0, eventos: 0 },
  },
];

const catalogos = {
  grupos_edad: [
    { id: "g1", codigo: "semillas", nombre: "Semillas", edad_minima: 5, edad_maxima: 8 },
    { id: "g2", codigo: "exploradores", nombre: "Exploradores", edad_minima: 9, edad_maxima: 12 },
  ],
  clubes: [{ id: "c1", nombre: "Semillitas de Luz", activo: true }],
  tutores: [{ id: "u2", nombre_visible: "Familia Paz", correo: "familia@example.com" }],
};

function VistaUsuarios({ estado = "datos" }: { estado?: "datos" | "cargando" | "vacio" | "error" }) {
  const [buscar, setBuscar] = useState("");
  const [rol, setRol] = useState("");
  const [franja, setFranja] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoUsuarioAdmin | "">("");
  const [club, setClub] = useState("");
  const [pagina, setPagina] = useState(1);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="admin-users-page mx-auto max-w-[1500px]">
        <AdminUsersSummary stats={{ total: 128, activos: 112, pendientes: 12, bloqueados: 4, administradores: 4, padres: 18 }} />
        <AdminUsersFilters
          searchValue={buscar}
          onSearchChange={setBuscar}
          selectedRol={rol}
          onRolChange={setRol}
          selectedFranja={franja}
          onFranjaChange={setFranja}
          selectedEstado={estadoFiltro}
          onEstadoChange={(value) => setEstadoFiltro(value as EstadoUsuarioAdmin | "")}
          selectedClub={club}
          onClubChange={setClub}
          catalogos={catalogos}
          tieneFiltros={Boolean(buscar || rol || franja || estadoFiltro || club)}
          onClear={() => {
            setBuscar("");
            setRol("");
            setFranja("");
            setEstadoFiltro("");
            setClub("");
          }}
        />
        <AdminUsersTable
          usuarios={estado === "vacio" ? [] : usuarios}
          totalResultados={estado === "vacio" ? 0 : 128}
          isLoading={estado === "cargando"}
          isError={estado === "error"}
          errorMensaje="No fue posible consultar los perfiles."
          onReintentar={() => undefined}
          paginaActual={pagina}
          porPagina={20}
          onCambiarPagina={setPagina}
          onCambiarPorPagina={() => undefined}
          seleccionados={seleccionados}
          todosSeleccionados={false}
          onToggleUsuario={(id) => setSeleccionados((actual) => {
            const siguiente = new Set(actual);
            if (siguiente.has(id)) siguiente.delete(id);
            else siguiente.add(id);
            return siguiente;
          })}
          onTogglePagina={() => undefined}
          onView={() => undefined}
          onEdit={() => undefined}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Pantallas/Administración/Usuarios",
  component: VistaUsuarios,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof VistaUsuarios>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Escritorio: Story = {};
export const Cargando: Story = { args: { estado: "cargando" } };
export const Vacio: Story = { args: { estado: "vacio" } };
export const Error: Story = { args: { estado: "error" } };
