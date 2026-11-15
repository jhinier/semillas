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
        className={`app-sidebar fixed left-0 top-0 z-[110] flex h-[100dvh] w-[280px] max-w-[82vw] flex-col overflow-hidden overscroll-contain border-r px-4 pb-[calc(env(safe-area-inset-bottom)+0.85rem)] pt-[calc(env(safe-area-inset-top)+0.85rem)] shadow-2xl transition-[transform,opacity] duration-300 ease-out will-change-transform motion-reduce:transition-none md:sticky md:top-0 md:flex md:w-[88px] md:shrink-0 md:translate-x-0 md:px-3 md:opacity-100 md:shadow-none lg:w-[236px] lg:px-3.5 xl:w-[248px] xl:px-4 ${
          variant === "admin"
            ? "md:py-2.5 border-[#e7ebf2] bg-white"
            : "md:py-3.5 border-slate-200 bg-white"
        } ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 md:translate-x-0 md:opacity-100"
        }`}
      >
        <div className={`flex shrink-0 items-center justify-center gap-2.5 lg:justify-between ${variant === "admin" ? "min-h-9 py-0" : "min-h-11 py-0.5"}`}>
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="Semillas" className={`${variant === "admin" ? "h-8 w-8" : "h-9 w-9"} shrink-0 object-contain`} />
            <span className={`hidden font-black leading-none lg:inline ${variant === "admin" ? "text-[1.35rem] text-violet-600" : "text-[1.45rem] text-primario"}`}>Semillas</span>
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

        <p className={`ml-[42px] hidden max-w-[165px] shrink-0 text-[10.5px] font-semibold leading-snug text-neutro lg:block ${variant === "admin" ? "mb-1.5" : "mb-3 ml-[46px] max-w-[155px] text-[11px]"}`}>
          Crecer en la Palabra, vivir su verdad
        </p>

        <nav
          className={`flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain ${variant === "admin" ? "gap-1 py-0.5 [scrollbar-width:thin]" : "gap-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}`}
          aria-label={variant === "admin" ? "Navegación administrativa" : "Navegación principal"}
        >
          {secciones.map((seccion) => (
            <div key={seccion.titulo ?? "principal"} className={`flex flex-col ${variant === "admin" ? "gap-0.5" : "gap-1"}`}>
              {seccion.titulo ? (
                <p className={`mb-0.5 hidden px-1 text-[10px] font-black uppercase tracking-[0.18em] lg:block ${variant === "admin" ? "text-slate-400" : "text-neutro/50"}`}>
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
                    className={`group relative flex ${variant === "admin" ? "min-h-[34px] py-1 rounded-xl text-[12.5px]" : "min-h-11 py-2 rounded-2xl text-[13px]"} items-center justify-center gap-3 px-3 font-semibold transition-all lg:justify-start lg:px-3.5 ${
                      activo
                        ? variant === "admin"
                          ? "bg-violet-50 text-violet-700 shadow-[inset_0_0_0_1px_rgba(95,54,232,.12)]"
                          : "bg-primario-palido text-primario shadow-[inset_0_0_0_1px_rgba(67,160,71,.12)]"
                        : variant === "admin"
                          ? "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                          : "text-neutro hover:bg-slate-100 hover:text-neutro-oscuro-max"
                    }`}
                  >
                    <span className="relative flex items-center justify-center">
                      <i className={`fa-solid ${item.icon} w-5 text-center ${variant === "admin" ? "text-[14px]" : "text-[15px]"}`} aria-hidden="true" />
                      {item.badge && (
                        <span
                          className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"
                          aria-label="Tienes logros por reclamar"
                        />
                      )}
                    </span>
                    <span className="hidden lg:inline">{item.label}</span>
                    {activo ? <span className={`absolute left-0 h-5 w-1 rounded-r-full lg:-left-1 ${variant === "admin" ? "bg-violet-600" : "bg-primario"}`} aria-hidden="true" /> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={`mt-auto flex shrink-0 flex-col border-t border-slate-100 ${variant === "admin" ? "gap-2 pt-2" : "gap-2.5 pt-2.5"}`}>
          {isOffline ? (
            <Card sombra="sm" className={`hidden p-3 lg:block ${variant === "admin" ? "bg-slate-50 border-slate-200" : ""}`}>
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
            className={`${variant === "admin" ? "h-9 rounded-xl" : "h-10 rounded-2xl"} w-full justify-center gap-2 bg-violet-600 px-3 text-xs font-bold text-white shadow-none hover:bg-violet-700`}
          >
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
            <span className="hidden lg:inline">Cerrar sesión</span>
          </Boton>
        </div>
      </aside>
    </>
  );
}
