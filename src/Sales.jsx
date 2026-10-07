import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getAdminAddresses, getAdminDataChangeEvent, getAdminSales, saveAdminSales } from "./data/adminData";

const formatPrice = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
}).format(value || 0);

const formatDate = (value) => value ? new Date(value).toLocaleString("es-CO") : "Pendiente";

export function Sales() {
  const [sales, setSales] = useState(() => getAdminSales());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [addresses] = useState(() => getAdminAddresses());
  const selectedAddress = addresses.find((address) => address.id === selectedSale?.domicilio?.id_direccion);

  useEffect(() => {
    const refreshSales = () => setSales(getAdminSales());
    window.addEventListener(getAdminDataChangeEvent(), refreshSales);
    return () => window.removeEventListener(getAdminDataChangeEvent(), refreshSales);
  }, []);

  const filteredSales = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return sales.filter((sale) => {
      const matchesTerm = `${sale.id} ${sale.cliente} ${sale.id_usuario}`.toLocaleLowerCase().includes(term);
      return matchesTerm && (!statusFilter || sale.estado === statusFilter);
    });
  }, [query, sales, statusFilter]);

  const updateSale = (saleId, update) => {
    const nextSales = sales.map((sale) => sale.id === saleId ? { ...sale, ...update } : sale);
    saveAdminSales(nextSales);
    setSales(nextSales);
    setSelectedSale(nextSales.find((sale) => sale.id === saleId) || null);
  };

  const registerPayment = (sale) => {
    updateSale(sale.id, { estado: "Pagada", fecha_pago: new Date().toISOString() });
  };

  const updateDelivery = (sale, estado) => {
    if (!sale.domicilio) return;
    const now = new Date().toISOString();
    const domicilio = {
      ...sale.domicilio,
      estado,
      fecha_salida: estado === "En tránsito" ? sale.domicilio.fecha_salida || now : sale.domicilio.fecha_salida,
      fecha_entrega: estado === "Entregado" ? now : sale.domicilio.fecha_entrega,
    };
    updateSale(sale.id, { domicilio });
  };

  const issueDemoInvoice = (sale) => {
    const now = new Date().toISOString();
    const invoice = {
      id: `FE-${sale.id}`,
      id_venta: sale.id,
      numero_factura: String(Date.now()).slice(-6),
      prefijo: "MK",
      fecha_emision: now,
      estado: "Pendiente de validación",
      cufe: `CUFE-DEMO-${sale.id}`,
      fecha_validacion: "",
    };
    updateSale(sale.id, { requiere_factura_electronica: true, factura: invoice });
  };

  const paidCount = sales.filter((sale) => sale.estado === "Pagada").length;
  const pendingCount = sales.filter((sale) => sale.estado === "En espera").length;
  const deliveryCount = sales.filter((sale) => sale.requiere_domicilio).length;

  return (
    <section className="mx-auto w-full">
      <section className="w-full h-max md:h-20 p-2.5 overflow-hidden border shadow-md bg-surface-alt border-border-gray rounded-3xl flex flex-row justify-between items-center">
        <article className="rounded-1xl size-10 md:size-14 flex justify-center items-center shadow-md bg-accent">
          <svg className="size-7">
            <use xlinkHref="/sprite.svg#shop" />
          </svg>
        </article>
        <span className="flex-1 px-2 font-bold">Ventas</span>
        <div className="flex flex-wrap gap-1 md:gap-2 justify-end w-min sm:w-max">
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} 
            placeholder="Venta o cliente" aria-label="Buscar ventas" className="min-w-40 max-w-20 text-[12px] md:text-[16px] border border-gray-300 bg-white p-1 md:px-3 md:py-2 rounded-xl" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado de venta" 
            className="border border-gray-300 bg-white p-1 md:px-3 md:py-2 rounded-xl text-[12px] md:text-[16px]">
            <option value="">Todos los estados</option>
            <option value="En espera">En espera</option>
            <option value="Pagada">Pagada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <Link to="/pos" 
            className="bg-primary rounded-xl shadow-md transition-all text-[12px] md:text-[16px] duration-300 hover:scale-105 hover:bg-primary/60 
              p-1 md:px-4 md:py-2 font-semibold text-white">Registrar venta
          </Link>
        </div>
      </section>

      <div className="mb-2 sm:mb-5 grid grid-cols-3 gap-2 sm:gap-4 border-y border-gray-300 py-2 sm:py-4">
        <div><p className="text-[12px] sm:text-sm text-gray-500">Ventas registradas</p><strong className="text-[16px] sm:text-xl">{sales.length}</strong></div>
        <div><p className="text-[12px] sm:text-sm text-gray-500">Pagadas / en espera</p><strong className="text-[16px] sm:text-xl">{paidCount} / {pendingCount}</strong></div>
        <div><p className="text-[12px] sm:text-sm text-gray-500">Con domicilio</p><strong className="text-[16px] sm:text-xl">{deliveryCount}</strong></div>
      </div>

      <div className="overflow-x-auto border-y border-gray-300">
        <table className="w-full min-w-[950px] text-left text-[12px] sm:text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="p-1.5 sm:px-3 sm:py-3">Venta</th>
              <th className="p-1.5 sm:px-3 sm:py-3">Cliente</th>
              <th className="p-1.5 sm:px-3 sm:py-3">Tipo</th>
              <th className="p-1.5 sm:px-3 sm:py-3">Fecha</th>
              <th className="p-1.5 sm:px-3 sm:py-3">Pago</th>
              <th className="p-1.5 sm:px-3 sm:py-3">Domicilio</th>
              <th className="p-1.5 sm:px-3 sm:py-3">Total</th>
              <th className="p-1.5 sm:px-3 sm:py-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                <td className="p-1.5 sm:px-3 sm:py-3 font-semibold">{sale.id}</td>
                <td className="p-1.5 sm:px-3 sm:py-3">{sale.cliente}</td>
                <td className="p-1.5 sm:px-3 sm:py-3">{sale.tipo_venta}</td>
                <td className="p-1.5 sm:px-3 sm:py-3">{formatDate(sale.fecha_venta)}</td>
                <td className={`p-1.5 sm:px-3 sm:py-3 ${sale.estado === "En espera" ? "text-amber-800" : "text-emerald-800"}`}>{sale.estado}</td>
                <td className="p-1.5 sm:px-3 sm:py-3">{sale.domicilio?.estado || "No requerido"}</td>
                <td className="p-1.5 sm:px-3 sm:py-3 font-semibold">{formatPrice(sale.total)}</td>
                <td className="p-1.5 sm:px-3 sm:py-3">
                  <button type="button" onClick={() => setSelectedSale(sale)} className="text-blue-800 underline">
                    <svg className="size-7">
                      <use xlinkHref="/sprite.svg#seemore" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && <tr><td colSpan="8" className="px-3 py-10 text-center text-gray-600">No se encontraron ventas.</td></tr>}
          </tbody>
        </table>
      </div>

      {selectedSale && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6" 
          onClick={(event) => { if (event.target === event.currentTarget) setSelectedSale(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="sale-detail-title" 
            className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7 rounded-3xl">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
              <div>
                <p className="text-sm text-gray-500">{selectedSale.tipo_venta} · {selectedSale.estado}</p>
                <h2 id="sale-detail-title" className="text-xl font-bold">Venta {selectedSale.id}</h2>
                <p className="text-sm text-gray-600">{selectedSale.cliente} · {formatDate(selectedSale.fecha_venta)}</p>
              </div>
              <button type="button" onClick={() => setSelectedSale(null)} className="border border-gray-400 px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 
                hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cerrar</button>
            </header>

            <section className="py-5">
              <h3 className="mb-3 font-semibold">Productos vendidos</h3>
              <div className="overflow-x-auto border-y border-gray-200">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-2">Producto</th>
                      <th className="py-2">Cantidad</th>
                      <th className="py-2">Precio unitario</th>
                      <th className="py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedSale.items.map((item) => 
                      <tr key={`${selectedSale.id}-${item.productId}`}>
                        <td className="py-3">{item.nombre}</td>
                        <td className="py-3">{item.quantity}</td>
                        <td className="py-3">{formatPrice(item.precio)}</td>
                        <td className="py-3">{formatPrice(item.subtotal ?? item.precio * item.quantity)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="py-3 text-right">Total de la venta</th>
                      <th className="py-3">{formatPrice(selectedSale.total)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            <section className="grid gap-5 border-t border-gray-200 py-5 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Pago</h3>
                <p className="text-sm">Estado: 
                  <strong>{selectedSale.estado}</strong>
                </p>
                <p className="mt-1 text-sm">Método(s): {(selectedSale.metodos_pago || []).join(" + ") || "Sin registrar"}</p>
                <p className="mt-1 text-sm">Fecha de venta: {formatDate(selectedSale.fecha_venta)}</p>
                <p className="mt-1 text-sm">Fecha de pago: {formatDate(selectedSale.fecha_pago)}</p>
                {selectedSale.estado === "En espera" && 
                  <button type="button" onClick={() => registerPayment(selectedSale)} 
                  className="mt-3 px-3 py-2 text-sm font-semibold text-white">Registrar pago</button>}
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Factura electrónica</h3>
                <p className="text-sm">{selectedSale.requiere_factura_electronica ? 
                  selectedSale.factura ? "Factura registrada" : "Solicitada, pendiente de emisión" : "No requerida"}
                </p>
                {selectedSale.requiere_factura_electronica && !selectedSale.factura && 
                <button type="button" onClick={() => issueDemoInvoice(selectedSale)} 
                  className="mt-3 border border-gray-400 px-3 py-2 text-sm">Emitir factura de demostración
                </button>}{selectedSale.factura && 
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-[700px] border-y border-gray-200 text-left text-xs">
                    <thead className="bg-slate-100 uppercase text-gray-500">
                      <tr>
                        <th className="p-2">ID</th>
                        <th className="p-2">ID venta</th>
                        <th className="p-2">Número</th>
                        <th className="p-2">Prefijo</th>
                        <th className="p-2">Emisión</th>
                        <th className="p-2">Estado</th>
                        <th className="p-2">CUFE</th>
                        <th className="p-2">Validación</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2">{selectedSale.factura.id}</td>
                        <td className="p-2">{selectedSale.factura.id_venta}</td>
                        <td className="p-2">{selectedSale.factura.numero_factura}</td>
                        <td className="p-2">{selectedSale.factura.prefijo}</td>
                        <td className="p-2">{formatDate(selectedSale.factura.fecha_emision)}</td>
                        <td className="p-2">{selectedSale.factura.estado}</td>
                        <td className="p-2">{selectedSale.factura.cufe}</td>
                        <td className="p-2">{formatDate(selectedSale.factura.fecha_validacion)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>}
              </div>
            </section>

            <section className="border-t border-gray-200 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Pedido a domicilio</h3>
                  <p className="text-sm text-gray-600">
                    {selectedSale.requiere_domicilio ? selectedAddress ? 
                      `${selectedAddress.tipo_de_via} ${selectedAddress.numero_de_via}, ${selectedAddress.numero_de_vivienda}${selectedAddress.complemento ? `, 
                      ${selectedAddress.complemento}` : ""}, ${selectedAddress.barrio}, ${selectedAddress.localidad}, ${selectedAddress.ciudad}` : 
                      `Dirección registrada: ${selectedSale.domicilio?.id_direccion || "No asignada"}` : "No requerido"}
                  </p>
                </div>
                  {selectedSale.domicilio && 
                    <select aria-label="Estado del domicilio" value={selectedSale.domicilio.estado} 
                      onChange={(event) => updateDelivery(selectedSale, event.target.value)} 
                      className="border border-gray-300 bg-white px-3 py-2 text-sm rounded-1xl">
                      <option>Pendiente</option>
                      <option>En preparación</option>
                      <option>En tránsito</option>
                      <option>Entregado</option>
                      <option>Cancelado</option>
                    </select>
                  }
              </div>
              {selectedSale.domicilio && 
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p>ID pedido: {selectedSale.domicilio.id}</p>
                  <p>ID venta: {selectedSale.domicilio.id_venta}</p>
                  <p>ID dirección: {selectedSale.domicilio.id_direccion || "No asignada"}</p>
                  <p>Precio domicilio: {formatPrice(selectedSale.domicilio.precio)}</p>
                  <p>Fecha de salida: {formatDate(selectedSale.domicilio.fecha_salida)}</p>
                  <p>Fecha de entrega: {formatDate(selectedSale.domicilio.fecha_entrega)}</p>
                </div>
              }
            </section>
          </section>
        </div>,
        document.body,
      )}
    </section>
  );
}