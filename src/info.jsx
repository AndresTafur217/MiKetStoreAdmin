import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDataChangeEvent, getAdminSales, getAdminUsers } from "./data/adminData";

const formatPrice = (value) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

export function Info() {
  const [summary, setSummary] = useState({ salesCount: 0, salesAmount: 0, customers: 0 });

  useEffect(() => {
    const refreshSummary = () => {
      const today = new Date().toLocaleDateString("es-CO");
      const todaySales = getAdminSales().filter((sale) => sale.estado === "Pagada" && new Date(sale.fecha_venta).toLocaleDateString("es-CO") === today);
      const customers = getAdminUsers().filter((user) => user.id_rol === "cliente" && user.estado === "Activo");
      setSummary({ salesCount: todaySales.length, salesAmount: todaySales.reduce((total, sale) => total + sale.total, 0), customers: customers.length });
    };
    refreshSummary();
    window.addEventListener(getAdminDataChangeEvent(), refreshSummary);
    return () => window.removeEventListener(getAdminDataChangeEvent(), refreshSummary);
  }, []);

  return (
    <div className="dashboard-row flex flex-row gap-2.5 lg:gap-5">
      <section className="ventas flex-1 xl:flex-2 border capitalize border-gray-300 bg-white p-2.5 lg:p-5 rounded-[20px] flex flex-row gap-3 items-center justify-evenly">
        <article className="font-bold text-[20px] hover:scale-110 transition-all ease-in-out hover:shadow-md size-20 text-gray-500 bg-gray-100 rounded-full flex flex-row gap-2.5 items-center justify-center">
          <svg className="size-5 md:size-9 ">
            <use xlinkHref="/sprite.svg#chartbar" />
          </svg>
        </article>
        <div className="flex flex-col gap-1.5 items-center justify-center">
          <article className="capitalice">ventas hoy</article>
          <div className="flex flex-row gap-3 items-center justify-between">
            <article className="p-1 flex flex-col gap-1">
              <div className="font-bold text-[22px] rounded-[10px]" id="sales-today-count">{summary.salesCount}</div>
              <span className="text-[10px]">transacciones del dia</span>
            </article>
            <article className="p-1 flex flex-col gap-1">
              <div className="font-bold text-[22px]" id="sales-today-amount">{formatPrice(summary.salesAmount)}</div>
              <span className="text-[10px]">total ingresos</span>
            </article>
          </div>
        </div>
      </section>
      <section className="clientes flex-1 border capitalize border-gray-300 bg-white p-2.5 lg:p-5 rounded-[20px] flex flex-row gap-2.5 items-center justify-evenly">
        <article className="font-bold text-[20px] hover:scale-110 transition-all ease-in-out hover:shadow-md size-20 text-gray-500 bg-gray-100 rounded-full flex flex-row gap-2.5 items-center justify-center">
          <svg className="size-5 md:size-9 ">
            <use xlinkHref="/sprite.svg#users" />
          </svg>
        </article>
        <div className="flex flex-row gap-2.5 items-center justify-center">
          <article className="flex flex-col flex-1 max-w-25 max-h-25 items-center justify-center p-2.5 text-right rounded-[10px] aspect-square">
            <div className="capitalize">clientes</div>
            <div className="font-bold text-[22px]" id="users-registered">{summary.customers}</div>
          </article>
        </div>
      </section>
      <section className="acciones-rapidas flex-3 xl:flex-2 capitalize rounded-[20px] flex flex-col gap-2.5 items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 size-full gap-2.5 items-center justify-center font-semibold">
          <Link to="/pos" className="cursor-pointer hover:bg-mist-300 hover:text-mist-900 transition-all ease-in-out border border-gray-300 px-2.5 bg-cyan-600 text-white size-full shadow-md rounded-[20px] overflow-hidden flex flex-col justify-between col-span-1 row-span-2">
            <div className="size-full flex justify-center items-center capitalize p-1 text-[14px]">registrar venta</div>
          </Link>
          <Link to="/products" className="cursor-pointer hover:bg-mist-300 transition-all ease-in-out border border-gray-300 px-2.5 size-full shadow-md rounded-[20px] overflow-hidden flex flex-col justify-between">
            <div className="size-full flex justify-center items-center capitalize p-1 text-[14px]">agregar producto</div>
          </Link>
          <Link to="/products" className="cursor-pointer hover:bg-mist-300 transition-all ease-in-out border border-gray-300 px-2.5 size-full shadow-md rounded-[20px] overflow-hidden flex flex-col justify-between">
            <div className="size-full flex justify-center items-center capitalize p-1 text-[14px]">revisar inventario</div>
          </Link>
          <Link to="/users" className="cursor-pointer hover:bg-mist-300 transition-all ease-in-out border border-gray-300 px-2.5 size-full shadow-md rounded-[20px] overflow-hidden flex flex-row justify-between">
            <div className="size-full flex justify-center items-center capitalize p-1 text-[14px]">agregar empleado</div>
          </Link>
          <Link to="/categories" className="cursor-pointer hover:bg-mist-300 transition-all ease-in-out border border-gray-300 px-2.5 size-full shadow-md rounded-[20px] overflow-hidden flex flex-col justify-between">
            <div className="size-full flex justify-center items-center capitalize p-1 text-[14px]">ver categorías</div>
          </Link>
        </div>
      </section>
    </div>
  );
}