import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDataChangeEvent, getAdminSales } from "./data/adminData";
import { getCatalogChangeEvent, products as catalogProducts } from "./data/catalog";

export function ProductsBestSellers() {
  const [sales, setSales] = useState(() => getAdminSales());
  const [products, setProducts] = useState(() => catalogProducts);

  useEffect(() => {
    const refreshSales = () => setSales(getAdminSales());
    const refreshCatalog = () => setProducts(catalogProducts);
    window.addEventListener(getAdminDataChangeEvent(), refreshSales);
    window.addEventListener(getCatalogChangeEvent(), refreshCatalog);
    return () => {
      window.removeEventListener(getAdminDataChangeEvent(), refreshSales);
      window.removeEventListener(getCatalogChangeEvent(), refreshCatalog);
    };
  }, []);

  const bestSellers = useMemo(() => {
    const quantities = new Map();
    sales.filter((sale) => sale.estado === "Pagada").forEach((sale) => {
      sale.items.forEach((item) => quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity));
    });
    return [...quantities.entries()]
      .map(([productId, quantity]) => ({ product: products.find((item) => item.id === productId), quantity }))
      .filter(({ product }) => product)
      .sort((first, second) => second.quantity - first.quantity)
      .slice(0, 6);
  }, [products, sales]);

  return (
    <div className="flex-1 border border-border-gray p-2.5 rounded-[10px] flex flex-col gap-2.5 min-h-0">
      <div className="w-full border bg-surface-alt border-border-gray rounded-xl p-1 flex flex-row justify-between items-center">
        Productos más vendidos
        <Link to="/sales" aria-label="Ver ventas" title="Ver ventas">
          <svg className="size-5 md:size-6 ">
            <use xlinkHref="/sprite.svg#right" />
          </svg>
        </Link>
      </div> 
      <div className="h-full flex flex-col gap-1 overflow-y-auto scrollbar p-2 max-h-[22rem]">
        {bestSellers.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">Aún no hay ventas.</p> : 
          bestSellers.map(({ product, quantity }, index) => 
            <Link key={product.id} to={`/products?search=${encodeURIComponent(product.nombre)}`} 
              className="flex items-center justify-between gap-3 border-b border-gray-200 py-3 group text-sm px-2.5 transition-all duration-300 
                hover:bg-white/60 rounded-1xl">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center bg-gray-100 text-xs font-semibold rounded-xl shadow-md group-hover:shadow-none">{index + 1}</span>
                  <span className="truncate font-medium">{product.nombre}</span>
                </span>
                <span className="shrink-0 text-gray-600">{quantity} un.</span>
            </Link>
          )
        }
      </div>
    </div>
  )
}