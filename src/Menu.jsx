import { Link, useLocation } from "react-router-dom";
import { ProtectedLink } from "./auth/ProtectedLink";

const matchesPath = (pathname, paths) => paths.includes(pathname);

const mobileItemClass = (active) =>
  `size-10 md:size-12 rounded-1xl transition-all duration-300 text-gray-950 hover:bg-accent hover:shadow-md hover:scale-105 ${active ? "bg-accent shadow-md" : "bg-surface"}`;

export function Menu() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isProducts = matchesPath(pathname, ["/products", "/productos"]);
  const isCategories = matchesPath(pathname, ["/categories", "/categorias"]);
  const isSales = matchesPath(pathname, ["/sales", "/ventas"]);
  const isInventory = pathname === "/inventory";
  const isUsers = matchesPath(pathname, ["/users", "/usuarios"]);
  const isOrders = matchesPath(pathname, ["/orders", "/pedidos"]);

  return (
    <div className="h-full w-full flex flex-row lg:flex-col justify-center items-end lg:justify-start">

      <section className="lg:hidden w-full max-w-3xl border-b-2 pb-2.5 border-b-gray-400 px-3.5 flex flex-row justify-evenly items-center">

        <article className={mobileItemClass(isHome)}>
          <Link to="/" aria-label="Inicio" title="Inicio" className="h-full w-full flex justify-center items-center">
            <svg className="size-5 md:size-6 ">
              <use xlinkHref="/sprite.svg#house" />
            </svg>
          </Link>
        </article>

        <article className={mobileItemClass(isProducts)}>
          <Link to="/products" aria-label="Productos" title="Productos" className="h-full w-full flex justify-center items-center">
            <svg className="size-5 md:size-6 ">
              <use xlinkHref="/sprite.svg#tags" />
            </svg>
          </Link>
        </article>

        <article className={mobileItemClass(isCategories)}>
          <Link to="/categories" aria-label="Categorías" title="Categorías" className="h-full w-full flex justify-center items-center">
            <svg className="size-5 md:size-6 ">
              <use xlinkHref="/sprite.svg#categories" />
            </svg>
          </Link>
        </article>

        <article className={mobileItemClass(isSales)}>
          <ProtectedLink to="/sales" aria-label="Ventas" title="Ventas" className="h-full w-full flex justify-center items-center rounded-full">
            <div className="h-full w-full flex justify-center items-center">
              <svg className="size-5 md:size-6 ">
                <use xlinkHref="/sprite.svg#shop" />
              </svg>
            </div>
          </ProtectedLink>
        </article>

        <article className={mobileItemClass(isInventory)}>
          <ProtectedLink to="/inventory" aria-label="Inventario" title="Inventario" className="h-full w-full rounded-full flex justify-center items-center">
            <div className="h-full w-full flex justify-center items-center">
              <svg className="size-5 md:size-6 ">
                <use xlinkHref="/sprite.svg#inventory" />
              </svg>
            </div>
          </ProtectedLink>
        </article>

        <article className={mobileItemClass(isUsers)}>
          <ProtectedLink to="/users" aria-label="Usuarios" title="Usuarios" className="h-full w-full flex justify-center items-center">
            <div className="h-full w-full flex justify-center items-center">
              <svg className="size-5 md:size-6 ">
                <use xlinkHref="/sprite.svg#users" />
              </svg>
            </div>
          </ProtectedLink>
        </article>

        <article className={mobileItemClass(isOrders)}>
          <Link to="/orders" aria-label="Pedidos" title="Pedidos" className="h-full w-full flex justify-center items-center">
            <div className="h-full w-full flex justify-center items-center">
              <svg className="size-5 md:size-6 ">
                <use xlinkHref="/sprite.svg#orders" />
              </svg>
            </div>
          </Link>
        </article>

      </section>

      <div className="hidden lg:block w-full h-full">
        <section className="w-full h-full border-r-2 border-r-gray-400 flex flex-col gap-2.5 items-end p-3.5">

          <div className="w-full p-2 hover:scale-102">
            <Link to="/" className="h-full w-full flex flex-row group gap-2.5 items-center justify-end">
              <span className={`flex-1 h-full rounded-1xl flex justify-end group-hover:px-4 items-center transition-all duration-300 
                group-hover:bg-surface ${isHome ? "bg-surface px-4 font-bold" : ""}`}>Inicio</span>
              <article className={`bg-surface h-full w-full flex justify-center items-center size-10 md:size-12 rounded-1xl transition-all duration-300 text-gray-950
                group-hover:bg-accent hover:scale-105 ${isHome ? "bg-accent font-bold" : ""}`}>
                <svg className="size-7">
                  <use xlinkHref="/sprite.svg#house" />
                </svg>
              </article>
            </Link>
          </div>

          <div className="w-full p-2 hover:scale-102">
            <Link to="/products" className="h-full w-full flex flex-row group gap-2.5 items-center justify-end">
              <span className={`flex-1 h-full rounded-1xl flex justify-end group-hover:px-4 items-center transition-all duration-300 
                group-hover:bg-surface ${isProducts ? "bg-surface px-4 font-bold" : ""}`}>Productos</span>
              <article className={`bg-surface h-full w-full flex justify-center items-center size-10 md:size-12 rounded-1xl transition-all duration-300 text-gray-950
                group-hover:bg-accent hover:scale-105 ${isProducts ? "bg-accent" : ""}`}>
                <svg className="size-7">
                  <use xlinkHref="/sprite.svg#tags" />
                </svg>
              </article>
            </Link>
          </div>

          <div className="w-full p-2 hover:scale-102">
            <Link to="/categories" className="h-full w-full flex flex-row group gap-2.5 items-center justify-end">
              <span className={`flex-1 h-full rounded-1xl flex justify-end group-hover:px-4 items-center transition-all duration-300 
                group-hover:bg-surface ${isCategories ? "bg-surface px-4 font-bold" : ""}`}>Categorias</span>
              <article className={`bg-surface h-full w-full flex justify-center items-center size-10 md:size-12 rounded-1xl transition-all duration-300 text-gray-950
                group-hover:bg-accent hover:scale-105 ${isCategories ? "bg-accent" : ""}`}>
                <svg className="size-7">
                  <use xlinkHref="/sprite.svg#categories" />
                </svg>
              </article>
            </Link>
          </div>

          <div className="w-full p-2 hover:scale-102">
            <Link to="/sales" className="h-full w-full flex flex-row group gap-2.5 items-center justify-end">
              <span className={`flex-1 h-full rounded-1xl flex justify-end group-hover:px-4 items-center transition-all duration-300 
                group-hover:bg-surface ${isSales ? "bg-surface px-4 font-bold" : ""}`}>Ventas</span>
              <article className={`bg-surface h-full w-full flex justify-center items-center size-10 md:size-12 rounded-1xl transition-all duration-300 text-gray-950
                group-hover:bg-accent hover:scale-105 ${isSales ? "bg-accent" : ""}`}>
                <svg className="size-7">
                  <use xlinkHref="/sprite.svg#shop" />
                </svg>
              </article>
            </Link>
          </div>

          <div className="w-full p-2 hover:scale-102">
            <Link to="/inventory" className="h-full w-full flex flex-row group gap-2.5 items-center justify-end">
              <span className={`flex-1 h-full rounded-1xl flex justify-end group-hover:px-4 items-center transition-all duration-300 
                group-hover:bg-surface ${isInventory ? "bg-surface px-4 font-bold" : ""}`}>Inventario</span>
              <article className={`bg-surface h-full w-full flex justify-center items-center size-10 md:size-12 rounded-1xl transition-all duration-300 text-gray-950
                group-hover:bg-accent hover:scale-105 ${isInventory ? "bg-accent" : ""}`}>
                <svg className="size-7">
                  <use xlinkHref="/sprite.svg#inventory" />
                </svg>
              </article>
            </Link>
          </div>

          <div className="w-full p-2 hover:scale-102">
            <Link to="/users" className="h-full w-full flex flex-row group gap-2.5 items-center justify-end">
              <span className={`flex-1 h-full rounded-1xl flex justify-end group-hover:px-4 items-center transition-all duration-300 
                group-hover:bg-surface ${isUsers ? "bg-surface px-4 font-bold" : ""}`}>Usuarios</span>
              <article className={`bg-surface h-full w-full flex justify-center items-center size-10 md:size-12 rounded-1xl transition-all duration-300 text-gray-950
                group-hover:bg-accent hover:scale-105 ${isUsers ? "bg-accent" : ""}`}>
                <svg className="size-7">
                  <use xlinkHref="/sprite.svg#users" />
                </svg>
              </article>
            </Link>
          </div>

          <div className="w-full p-2 hover:scale-102">
            <Link to="/orders" className="h-full w-full flex flex-row group gap-2.5 items-center justify-end">
              <span className={`flex-1 h-full rounded-1xl flex justify-end group-hover:px-4 items-center transition-all duration-300 
                group-hover:bg-surface ${isOrders ? "bg-surface px-4 font-bold" : ""}`}>Pedidos</span>
              <article className={`bg-surface h-full w-full flex justify-center items-center size-10 md:size-12 rounded-1xl transition-all duration-300 text-gray-950
              group-hover:bg-accent hover:scale-105 ${isOrders ? "bg-accent" : ""}`}>
                <svg className="size-7">
                  <use xlinkHref="/sprite.svg#orders" />
                </svg>
              </article>
            </Link>
          </div>

        </section>
      </div>
    </div>
  );
}
