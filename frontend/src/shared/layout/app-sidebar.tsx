import { Link } from "@tanstack/react-router";

import { Boton } from "@/componentes/ui/boton";
import { Card } from "@/componentes/ui/card-base";
import logoImg from "@/assets/images/logos/Logotipo.webp";


type AppSidebarProps = {
  activePage: string;
  isOffline: boolean;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  variant?: "app" | "admin";
  /** Si true, muestra badge rojo en el ítem Insignias */
  logrosBadge?: boolean;
};

type SidebarItem = {
  to: string;
  label: string;
  icon: string;
  match: (path: string) => boolean;
  badge?: boolean;
};

const items: SidebarItem[] = [
  {
    to: "/app",
    label: "Inicio",
    icon: "fa-house",
    match: (path) => path === "/app" || path === "/app/",
  },
  { to: "/app/temas", label: "Mis temas", icon: "fa-book-open", match: (path) => path.includes("/temas") },
  { to: "/app/clubes", label: "Clubes", icon: "fa-users", match: (path) => path.includes("/clubes") },
  { to: "/app/logros", label: "Insignias", icon: "fa-medal", match: (path) => path.includes("/logros") },
  { to: "/app/perfil", label: "Perfil", icon: "fa-user", match: (path) => path.includes("/perfil") },
  { to: "/app/descargas", label: "Descargas", icon: "fa-download", match: (path) => path.includes("/descargas") },
];

const adminItems: SidebarItem[] = [
  { to: "/admin", label: "Dashboard", icon: "fa-house", match: (path) => path === "/admin" },
  { to: "/admin/temas", label: "Temas", icon: "fa-leaf", match: (path) => path.includes("/admin/temas") },
  { to: "/admin/actividades", label: "Actividades", icon: "fa-pen-to-square", match: (path) => path.includes("/admin/actividades") },
  { to: "/admin/usuarios", label: "Usuarios", icon: "fa-user-group", match: (path) => path.includes("/admin/usuarios") },
  { to: "/admin/logros", label: "Logros", icon: "fa-medal", match: (path) => path.includes("/admin/logros") },
  { to: "/admin/clubes", label: "Clubes", icon: "fa-people-group", match: (path) => path.includes("/admin/clubes") },
  { to: "/admin/medios", label: "Medios", icon: "fa-photo-film", match: (path) => path.includes("/admin/medios") },
  { to: "/admin/revision", label: "Revisión", icon: "fa-shield", match: (path) => path.includes("/admin/revision") },
  { to: "/admin/reportes", label: "Reportes", icon: "fa-chart-simple", match: (path) => path.includes("/admin/reportes") },
  { to: "/admin/ajustes", label: "Ajustes", icon: "fa-gear", match: (path) => path.includes("/admin/ajustes") },
];

type SidebarSection = {
  titulo?: string;
  items: SidebarItem[];
};

export function obtenerSeccionesSidebar(variant: "app" | "admin"): SidebarSection[] {
  return variant === "admin" ? [{ titulo: "Administración", items: adminItems }] : [{ items }];
}

export function AppSidebar({
  activePage,
  isOffline,
  isOpen,
  onClose,
  onLogout,
  variant = "app",
  logrosBadge = false,
}: AppSidebarProps) {
  // Inyectar badge en el ítem de Insignias si corresponde
  const secciones = obtenerSeccionesSidebar(variant).map((seccion) => ({
    ...seccion,
    items: seccion.items.map((item) =>
      item.to === "/app/logros" ? { ...item, badge: logrosBadge } : item
    ),
  }));

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú principal"
        className={`fixed inset-0 z-[100] border-0 bg-black/45 p-0 transition-opacity duration-300 ease-out motion-reduce:transition-none md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`app-sidebar fixed left-0 top-0 z-[110] flex h-[100dvh] w-[280px] max-w-[82vw] flex-col overflow-y-auto overscroll-contain border-r px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1.25rem)] shadow-2xl transition-[transform,opacity] duration-300 ease-out will-change-transform motion-reduce:transition-none md:sticky md:flex md:w-[88px] md:shrink-0 md:translate-x-0 md:overflow-visible md:px-3 md:py-5 md:opacity-100 md:shadow-none xl:w-[248px] xl:px-4 ${
          variant === "admin"
            ? "border-[#e7ebf2] bg-white"
            : "border-slate-200 bg-white"
        } ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 md:translate-x-0 md:opacity-100"
        }`}
      >
        <div className="flex min-h-12 items-center justify-center gap-2.5 py-1 xl:justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Semillas" className="h-10 w-10 shrink-0 object-contain" />
            <span className={`hidden text-[1.55rem] font-black leading-none xl:inline ${variant === "admin" ? "text-violet-600" : "text-primario"}`}>Semillas</span>
          </div>
          <Boton
            type="button"
            variante="texto"
            tamano="icono"
            className="ml-auto rounded-full md:hidden"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </Boton>
        </div>

        <p className="mb-6 ml-[50px] hidden max-w-[150px] text-[11px] font-semibold leading-snug text-neutro xl:block">
          Crecer en la Palabra, vivir su verdad
        </p>

        <nav className="flex flex-1 flex-col gap-4" aria-label={variant === "admin" ? "Navegación administrativa" : "Navegación principal"}>
          {secciones.map((seccion) => (
            <div key={seccion.titulo ?? "principal"} className="flex flex-col gap-1.5">
              {seccion.titulo ? (
                <p className={`hidden px-1 text-[10px] font-black uppercase tracking-[0.18em] xl:block ${variant === "admin" ? "text-slate-400" : "text-neutro/50"}`}>
                  {seccion.titulo}
                </p>
              ) : null}

              {seccion.items.map((item) => {
                const activo = item.match(activePage);
                return (
                  <Link
                    key={item.to}
                    to={item.to as any}
                    onClick={onClose}
                    title={item.label}
                    aria-label={item.label}
                    aria-current={activo ? "page" : undefined}
                    className={`group relative flex min-h-12 items-center justify-center gap-3 rounded-2xl px-3 text-[13px] font-semibold transition-all xl:justify-start xl:px-3.5 ${
                      activo
                        ? variant === "admin"
                          ? "bg-violet-50 text-violet-700 shadow-[inset_0_0_0_1px_rgba(95,54,232,.12)]"
                          : "bg-primario-palido text-primario shadow-[inset_0_0_0_1px_rgba(67,160,71,.12)]"
                        : variant === "admin"
                          ? "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          : "text-neutro hover:bg-slate-100 hover:text-neutro-oscuro-max"
                    }`}
                  >
                    <span className="relative">
                      <i className={`fa-solid ${item.icon} w-5 text-center text-[16px]`} aria-hidden="true" />
                      {item.badge && (
                        <span
                          className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"
                          aria-label="Tienes logros por reclamar"
                        />
                      )}
                    </span>
                    <span className="hidden xl:inline">{item.label}</span>
                    {activo ? <span className={`absolute left-0 h-6 w-1 rounded-r-full xl:-left-1 ${variant === "admin" ? "bg-violet-600" : "bg-primario"}`} aria-hidden="true" /> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          {isOffline ? (
            <Card sombra="sm" className={`hidden p-3 xl:block ${variant === "admin" ? "bg-slate-50 border-slate-200" : ""}`}>
              <div className={`mb-1.5 flex items-center gap-2 text-xs font-bold ${variant === "admin" ? "text-slate-700" : "text-neutro-oscuro-max"}`}>
                <i className="fa-solid fa-cloud-arrow-up text-primario" aria-hidden="true" />
                Sin conexión
              </div>
              <p className={`text-[11px] leading-normal ${variant === "admin" ? "text-slate-500" : "text-neutro"}`}>
                Tu progreso se sincronizará cuando vuelva internet.
              </p>
            </Card>
          ) : null}

          <Boton
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="h-11 w-full justify-center gap-2 rounded-2xl bg-violet-600 px-3 text-xs font-bold text-white shadow-none hover:bg-violet-700"
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            <span className="hidden xl:inline">Cerrar sesión</span>
          </Boton>
        </div>
      </aside>
    </>
  );
}
