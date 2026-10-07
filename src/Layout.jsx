import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "./Menu";
import { ProtectedLink } from "./auth/ProtectedLink";
import { getAdminRoles } from "./data/adminData";
import { useCurrentUser } from "./hooks/useCurrentUser";

export function Layout() {
  const user = useCurrentUser();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const roleName = getAdminRoles().find((role) => role.id === user?.id_rol)?.nombre || "Empleado";

  return (
    <div className="max-w-dvw h-dvh flex flex-col overflow-hidden bg-background">

      <section className="h-20 sm:h-25 md:h-35 p-5 flex flex-row gap-2 md:gap-5 justify-between items-center bg-primary-dark">
        <article className="h-full w-15 md:w-30 lg:w-50 flex justify-center items-center">
          <svg className="h-full" aria-hidden="true">
            <use xlinkHref="/sprite.svg#miketicon" />
          </svg>
        </article>
        <article className="flex-1 capitalize font-bold text-[14px] lg:text-2xl text-surface">Panel Administrativo</article>
        <section className="flex flex-row justify-evenly items-center transition-all duration-300">
          <article className="mx-2.5 flex flex-col">
            <span className="font-bold text-[12px] lg:text-3xl">{user?.nombre || "Empleado"}</span>
            <label className="text-[10px] lg:text-xl">{roleName}</label>
          </article>
          <ProtectedLink to="/perfil" aria-label="Abrir perfil" title="Abrir perfil" className="size-12 md:size-18  border-gray-400 rounded-full">
            <div className="h-full w-full flex justify-center items-center rounded-full 
              text-surface-alt transition-transform ease-in-out hover:scale-105 hover:bg-surface hover:text-text-primary">
              <svg className="size-6.5 md:size-12">
                <use xlinkHref="/sprite.svg#person" />
              </svg>
            </div>
          </ProtectedLink>
        </section>
      </section>
      <div className="max-w-dvw h-dvh flex flex-col lg:flex-row overflow-hidden">
        <section className="h-15 lg:w-50 xl:w-75 md:h-20 lg:h-full bg-background z-50 overflow-hidden">
          <Menu />
        </section>
        <section className={`min-h-0 max-h-full flex-1 px-2.5 pb-2.5 z-10 overflow-x-auto scrollbar`}>
            <section className="w-full p-2.5 lg:p-5 rounded-b-6xl">
              <Outlet />
            </section>
        </section>
      </div>
    </div>
  );
}
