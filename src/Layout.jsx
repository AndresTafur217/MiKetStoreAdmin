import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu } from "./Menu";
import { ProtectedLink } from "./auth/ProtectedLink";
import { useCurrentUser } from "./hooks/useCurrentUser";

export function Layout() {
  const user = useCurrentUser();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchValue = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(searchValue);

  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  return (
    <div className="max-w-dvw h-dvh flex flex-col overflow-hidden bg-background">

      <section className="h-22 sm:h-25 md:h-35 p-5 flex flex-row gap-5 justify-between items-center bg-primary-dark">
        <article className="h-full w-20 md:w-30 lg:w-50 flex justify-center items-center">
          <svg className="h-full" aria-hidden="true">
            <use xlinkHref="/sprite.svg#miketicon" />
          </svg>
        </article>
        <article className="flex-1 capitalize font-bold lg:text-2xl text-surface">Panel Administrativo</article>
        <section className="flex justify-center items-center">
          <form onSubmit={handleSearch} role="search" className="bg-surface group flex items-center overflow-hidden rounded-full border border-gray-400 transition-colors duration-300 focus-within:border-blue-500 hover:border-blue-500">
            <input
              id="search"
              type="text"
              aria-label="Buscar productos"
              placeholder="Buscar productos"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="
                w-0 bg-transparent px-0 py-2 text-sm opacity-0 outline-none
                transition-all duration-300 ease-in-out motion-reduce:transition-none
                group-hover:w-40 group-hover:pl-3 group-hover:opacity-100
                group-focus-within:w-40 group-focus-within:pl-3 group-focus-within:opacity-100
                sm:group-hover:w-52 sm:group-focus-within:w-52
                md:group-hover:w-64 md:group-focus-within:w-64"
            />
            <button type="submit" aria-label="Buscar" title="Buscar" className="shrink-0 rounded-full p-2">
              <svg width="24" height="24" aria-hidden="true">
                <use xlinkHref="/sprite.svg#search" />
              </svg>
            </button>
          </form>
        </section>
        <section className="flex flex-row justify-evenly items-center transition-all duration-300">
          <article className="mx-2.5 flex flex-col">
            <span className="font-bold text-[14px] lg:text-xl">Andres Tafur</span>
            <label className="text-[12px] lg:text-xl">Administrador</label>
          </article>
          <ProtectedLink to="/perfil" aria-label={user ? "Abrir perfil" : "Iniciar sesión"} title={user ? "Abrir perfil" : "Iniciar sesión"} className="size-12 md:size-18  border-gray-400 rounded-full">
            <div className="h-full w-full flex justify-center items-center rounded-full bg-store-items 
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
        <section className={`min-h-0 max-h-full flex-1 px-2.5 pb-2.5 bg-store-bg2/70 z-10 ${isHome ? "overflow-hidden" : "overflow-y-auto scrollbar"}`}>
            <section className="w-full p-5 rounded-b-6xl">
              <Outlet />
            </section>
        </section>
      </div>
    </div>
  );
}