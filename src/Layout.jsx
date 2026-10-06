import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "./Menu";
import { ProtectedLink } from "./auth/ProtectedLink";
import { useCurrentUser } from "./hooks/useCurrentUser";

export function Layout() {
  const user = useCurrentUser();
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <div className="max-w-dvw h-dvh flex flex-col overflow-hidden bg-background">

      <section className="h-22 sm:h-25 md:h-35 p-5 flex flex-row gap-5 justify-between items-center bg-primary-dark">
        <article className="h-full w-20 md:w-30 lg:w-50 flex justify-center items-center">
          <svg className="h-full" aria-hidden="true">
            <use xlinkHref="/sprite.svg#miketicon" />
          </svg>
        </article>
        <article className="flex-1 capitalize font-bold lg:text-2xl text-surface">Panel Administrativo</article>
        <section className="flex flex-row justify-evenly items-center transition-all duration-300">
          <article className="mx-2.5 flex flex-col">
            <span className="font-bold text-[14px] lg:text-3xl">Andres Tafur</span>
            <label className="text-[12px] lg:text-xl">Administrador</label>
          </article>
          <ProtectedLink to="/perfil" aria-label={user ? "Abrir perfil" : "Iniciar sesión"} title={user ? "Abrir perfil" : "Iniciar sesión"} className="size-12 md:size-18  border-gray-400 rounded-full">
            <div className="h-full w-full flex justify-center items-center rounded-full 
              text-surface-alt transition-transform ease-in-out hover:scale-105 hover:bg-surface hover:text-text-primary">
              <svg className="size-6.5 md:size-12">
                <use xlinkHref={user ? "/sprite.svg#person" : "/sprite.svg#login"} />
              </svg>
            </div>
          </ProtectedLink>
        </section>
      </section>
      <div className="max-w-dvw h-dvh flex flex-col lg:flex-row overflow-hidden">
        <section className="h-17 lg:w-50 xl:w-75 md:h-20 lg:h-full bg-background z-50 overflow-hidden">
          <Menu />
        </section>
        <section className={`min-h-0 max-h-full flex-1 px-2.5 pb-2.5 z-10 ${isHome ? "overflow-hidden" : "overflow-y-auto scrollbar"}`}>
            <section className="w-full p-5 rounded-b-6xl">
              <Outlet />
            </section>
        </section>
      </div>
    </div>
  );
}