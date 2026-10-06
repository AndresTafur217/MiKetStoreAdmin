import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";
import { getAdminAddresses, getAdminDataChangeEvent, getAdminSales, getAdminUsers, recordInventoryMovements, saveAdminSales } from "./data/adminData";
import { products as catalogProducts, saveCatalogProducts } from "./data/catalog";

const paymentOptions = ["Efectivo", "PSE", "Transferencia bancaria", "Tarjeta débito o crédito", "Consignación bancaria"];

const formatPrice = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
}).format(value || 0);

const formatDate = (value) => value ? new Date(value).toLocaleString("es-CO") : "Pendiente";

export function Sales() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sales, setSales] = useState(() => getAdminSales());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [registerOpen, setRegisterOpen] = useState(() => searchParams.get("register") === "1");
  const [addresses] = useState(() => getAdminAddresses());
  const [saleForm, setSaleForm] = useState({ numero_documento: "", productId: String(catalogProducts[0]?.id || ""), quantity: "1", 
    estado: "Pagada", requiere_domicilio: false, requiere_factura_electronica: false, metodos_pago: ["Efectivo"] });
  const registeredCustomer = getAdminUsers().find((user) => user.numero_documento === saleForm.numero_documento.trim());
  const defaultAddress = addresses.find((address) => address.id_usuario === registeredCustomer?.id && address.predeterminada);
  const selectedAddress = addresses.find((address) => address.id === selectedSale?.domicilio?.id_direccion);

  useEffect(() => {
    if (searchParams.get("register") !== "1") return;
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.delete("register");
      return nextParams;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

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

  const registerPhysicalSale = (event) => {
    event.preventDefault();
    const product = catalogProducts.find((item) => item.id === Number(saleForm.productId));
    const quantity = Number(saleForm.quantity);
    if (!product || quantity < 1 || quantity > product.stock || saleForm.metodos_pago.length === 0) return;
    if (saleForm.requiere_domicilio && (!registeredCustomer || !defaultAddress)) return;

    const now = new Date().toISOString();
    const id = `VTA-${Date.now()}`;
    const subtotal = product.precio * quantity;
    const deliveryPrice = saleForm.requiere_domicilio ? 35000 : 0;
    const factura = saleForm.requiere_factura_electronica ? {
      id: `FE-${id}`,
      id_venta: id,
      numero_factura: String(Date.now()).slice(-6),
      prefijo: "MK",
      fecha_emision: now,
      estado: "Pendiente de validación",
      cufe: `CUFE-DEMO-${id}`,
      fecha_validacion: "",
    } : null;
    const sale = {
      id,
      id_usuario: registeredCustomer?.id || "",
      id_comprador: registeredCustomer?.id || "",
      id_vendedor: "USR-002",
      cliente: registeredCustomer ? `${registeredCustomer.nombre} ${registeredCustomer.apellidos}` : "Cliente de mostrador",
      items: [{ productId: product.id, nombre: product.nombre, quantity, precio: product.precio, subtotal }],
      total: subtotal + deliveryPrice,
      estado: saleForm.estado,
      tipo_venta: "Física",
      metodos_pago: saleForm.metodos_pago,
      fecha_venta: now,
      fecha_pago: saleForm.estado === "Pagada" ? now : "",
      requiere_domicilio: Boolean(saleForm.requiere_domicilio),
      servicio_domicilio: Boolean(saleForm.requiere_domicilio),
      requiere_factura_electronica: Boolean(saleForm.requiere_factura_electronica),
      factura,
      domicilio: saleForm.requiere_domicilio ? {
        id: `PED-${id}`,
        id_venta: id,
        id_direccion: defaultAddress.id,
        precio: deliveryPrice,
        estado: "Pendiente",
        fecha_salida: "",
        fecha_entrega: "",
      } : null,
    };
    const nextSales = [sale, ...sales];
    saveAdminSales(nextSales);
    setSales(nextSales);
    const nextProducts = catalogProducts.map((item) => {
      if (item.id !== product.id) return item;
      const stock = item.stock - quantity;
      return { ...item, stock, estado: stock === 0 ? "agotado" : stock <= 5 ? "casi agotado" : "disponible" };
    });
    saveCatalogProducts(nextProducts);
    recordInventoryMovements([{
      id_producto: product.id,
      id_referencia: id,
      tipo: "Salida por venta",
      unidades: quantity,
      id_usuario: "USR-002",
    }]);
    setSaleForm({ numero_documento: "", productId: String(catalogProducts[0]?.id || ""), quantity: "1", 
      estado: "Pagada", requiere_domicilio: false, requiere_factura_electronica: false, metodos_pago: ["Efectivo"] });
    setRegisterOpen(false);
  };

  const paidCount = sales.filter((sale) => sale.estado === "Pagada").length;
  const pendingCount = sales.filter((sale) => sale.estado === "En espera").length;
  const deliveryCount = sales.filter((sale) => sale.requiere_domicilio).length;

  return (
    <section className="mx-auto w-full max-w-7xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Operación de tienda</p>
          <h1 className="text-2xl font-bold">Ventas</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} 
            placeholder="Venta o cliente" aria-label="Buscar ventas" className="min-w-48 border border-gray-300 bg-white px-3 py-2 rounded-xl" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado de venta" 
            className="border border-gray-300 bg-white px-3 py-2 rounded-xl">
            <option value="">Todos los estados</option>
            <option value="En espera">En espera</option>
            <option value="Pagada">Pagada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <button type="button" onClick={() => setRegisterOpen(true)} 
            className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
              px-4 py-2 font-semibold text-white">Registrar venta física</button>
        </div>
      </header>

      <div className="mb-5 grid grid-cols-1 gap-4 border-y border-gray-300 py-4 sm:grid-cols-3">
        <div><p className="text-sm text-gray-500">Ventas registradas</p><strong className="text-xl">{sales.length}</strong></div>
        <div><p className="text-sm text-gray-500">Pagadas / en espera</p><strong className="text-xl">{paidCount} / {pendingCount}</strong></div>
        <div><p className="text-sm text-gray-500">Con domicilio</p><strong className="text-xl">{deliveryCount}</strong></div>
      </div>

      <div className="overflow-x-auto border-y border-gray-300">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-3">Venta</th>
              <th className="px-3 py-3">Cliente</th>
              <th className="px-3 py-3">Tipo</th>
              <th className="px-3 py-3">Fecha</th>
              <th className="px-3 py-3">Pago</th>
              <th className="px-3 py-3">Domicilio</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-3 py-3 font-semibold">{sale.id}</td>
                <td className="px-3 py-3">{sale.cliente}</td>
                <td className="px-3 py-3">{sale.tipo_venta}</td>
                <td className="px-3 py-3">{formatDate(sale.fecha_venta)}</td>
                <td className={`px-3 py-3 ${sale.estado === "En espera" ? "text-amber-800" : "text-emerald-800"}`}>{sale.estado}</td>
                <td className="px-3 py-3">{sale.domicilio?.estado || "No requerido"}</td>
                <td className="px-3 py-3 font-semibold">{formatPrice(sale.total)}</td>
                <td className="px-3 py-3"><button type="button" onClick={() => setSelectedSale(sale)} className="text-blue-800 underline">Ver venta</button></td>
              </tr>
            ))}
            {filteredSales.length === 0 && <tr><td colSpan="8" className="px-3 py-10 text-center text-gray-600">No se encontraron ventas.</td></tr>}
          </tbody>
        </table>
      </div>

      {registerOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6" 
          onClick={(event) => { if (event.target === event.currentTarget) setRegisterOpen(false); }}>
          <form onSubmit={registerPhysicalSale} className="max-h-[92dvh] rounded-3xl w-full max-w-2xl space-y-4 overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
            <div>
              <p className="text-sm text-gray-500">Punto de venta</p>
              <h2 className="text-xl font-bold">Registrar venta</h2>
            </div>
            <label className="block text-sm font-medium">Cédula del cliente
              <input required={saleForm.requiere_domicilio} value={saleForm.numero_documento} 
                onChange={(event) => setSaleForm({ ...saleForm, numero_documento: event.target.value })} 
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <p className="text-sm text-gray-600">
              {registeredCustomer ? `Cliente: ${registeredCustomer.nombre} ${registeredCustomer.apellidos}` : 
                saleForm.numero_documento ? "No hay un usuario registrado con ese documento; la venta quedará como cliente de mostrador." : 
                "Ingresa la cédula para asociar la venta con un usuario existente."}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Producto
                <select required value={saleForm.productId} onChange={(event) => setSaleForm({ ...saleForm, productId: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 bg-white p-2">{catalogProducts.map((product) => <option key={product.id} 
                  value={product.id}>{product.nombre} · {formatPrice(product.precio)}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Cantidad
                <input required min="1" max={catalogProducts.find((product) => product.id === Number(saleForm.productId))?.stock || 1} 
                  type="number" value={saleForm.quantity} onChange={(event) => setSaleForm({ ...saleForm, quantity: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2" />
              </label>
              <label className="text-sm font-medium">Estado del pago
                <select value={saleForm.estado} onChange={(event) => setSaleForm({ ...saleForm, estado: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 bg-white p-2">
                  <option>Pagada</option>
                  <option>En espera</option>
                </select>
              </label>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold">Medios de pago (combinables)</legend>
              {paymentOptions.map((method) => 
                <label key={method} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={saleForm.metodos_pago.includes(method)} 
                    onChange={() => setSaleForm({ ...saleForm, metodos_pago: saleForm.metodos_pago.includes(method) ? 
                    saleForm.metodos_pago.filter((item) => item !== method) : [...saleForm.metodos_pago, method] })} />{method}
                </label>)}
            </fieldset>
            <label className="flex items-center gap-2 border-y border-gray-200 py-3 text-sm">
              <input type="checkbox" checked={saleForm.requiere_domicilio} 
                onChange={(event) => setSaleForm({ ...saleForm, requiere_domicilio: event.target.checked })} />Solicita domicilio (+{formatPrice(35000)})
            </label>
            {saleForm.requiere_domicilio && <p className="text-sm text-gray-600">
              {defaultAddress ? 
                `Dirección predeterminada: 
                ${defaultAddress.tipo_de_via} 
                ${defaultAddress.numero_de_via}, 
                ${defaultAddress.numero_de_vivienda}, 
                ${defaultAddress.barrio}, 
                ${defaultAddress.ciudad}.` : 
                registeredCustomer ? <>Este cliente no tiene dirección predeterminada.</> : 
                "Busca un usuario por cédula para consultar su dirección predeterminada."} 
                {registeredCustomer && !defaultAddress && <Link to="/perfil" className="underline">Abrir perfil web</Link>}</p>}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={saleForm.requiere_factura_electronica} 
                onChange={(event) => setSaleForm({ ...saleForm, requiere_factura_electronica: event.target.checked })} />
                Requiere factura electrónica de demostración
            </label>
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setRegisterOpen(false)} 
                className="border border-gray-400 px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 
                hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
              <button type="submit" disabled={saleForm.metodos_pago.length === 0 || (saleForm.requiere_domicilio && 
                (!registeredCustomer || !defaultAddress)) || Number(saleForm.quantity) > (
                  catalogProducts.find((product) => product.id === Number(saleForm.productId))?.stock || 0)} 
                  className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 px-4 py-2 font-semibold text-white disabled:opacity-50">Guardar venta</button>
            </div>
          </form>
        </div>,
        document.body,
      )}

      {selectedSale && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6" 
          onClick={(event) => { if (event.target === event.currentTarget) setSelectedSale(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="sale-detail-title" 
            className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4">
              <div>
                <p className="text-sm text-gray-500">{selectedSale.tipo_venta} · {selectedSale.estado}</p>
                <h2 id="sale-detail-title" className="text-xl font-bold">Venta {selectedSale.id}</h2>
                <p className="text-sm text-gray-600">{selectedSale.cliente} · {formatDate(selectedSale.fecha_venta)}</p>
              </div>
              <button type="button" onClick={() => setSelectedSale(null)} className="border border-gray-300 px-3 py-2">Cerrar</button>
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
                  className="mt-3 bg-store-items px-3 py-2 text-sm font-semibold text-white">Registrar pago</button>}
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
                      className="border border-gray-300 bg-white px-3 py-2 text-sm">
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