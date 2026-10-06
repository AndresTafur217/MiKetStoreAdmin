import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAdminAddresses,
  getAdminDataChangeEvent,
  getAdminSales,
  getAdminUsers,
  recordInventoryMovements,
  saveAdminSales,
} from "./data/adminData";
import {
  categories as catalogCategories,
  getCatalogChangeEvent,
  products as catalogProducts,
  saveCatalogProducts,
} from "./data/catalog";
import { useCurrentUser } from "./hooks/useCurrentUser";

const paymentOptions = ["Efectivo", "PSE", "Transferencia bancaria", "Tarjeta débito o crédito", "Consignación bancaria"];

const formatPrice = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
}).format(value || 0);

const keypadKeys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", "0", "DEL"];

export function PointOfSale() {
  const user = useCurrentUser();
  const [products, setProducts] = useState(() => catalogProducts);
  const [categories] = useState(() => catalogCategories);
  const [users, setUsers] = useState(() => getAdminUsers());
  const [addresses, setAddresses] = useState(() => getAdminAddresses());
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [scanCode, setScanCode] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [step, setStep] = useState("customer");
  const [documentNumber, setDocumentNumber] = useState("");
  const [paymentMethods, setPaymentMethods] = useState(["Efectivo"]);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [cashReceived, setCashReceived] = useState("");
  const [paymentTarget, setPaymentTarget] = useState("Efectivo");
  const [paymentStatus, setPaymentStatus] = useState("Pagada");
  const [requiresDelivery, setRequiresDelivery] = useState(false);
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [addressId, setAddressId] = useState("");
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const refreshCatalog = () => setProducts(catalogProducts);
    const refreshCustomers = () => {
      setUsers(getAdminUsers());
      setAddresses(getAdminAddresses());
    };
    const refreshClock = () => setNow(new Date());
    window.addEventListener(getCatalogChangeEvent(), refreshCatalog);
    window.addEventListener(getAdminDataChangeEvent(), refreshCustomers);
    const timer = window.setInterval(refreshClock, 30_000);
    return () => {
      window.removeEventListener(getCatalogChangeEvent(), refreshCatalog);
      window.removeEventListener(getAdminDataChangeEvent(), refreshCustomers);
      window.clearInterval(timer);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return products.filter((product) => {
      const matchesQuery = !term || `${product.nombre} ${product.proveedor || ""} ${product.id}`.toLocaleLowerCase().includes(term);
      const matchesCategory = !categoryId || product.categorias?.some((category) => category.id === Number(categoryId));
      return matchesQuery && matchesCategory;
    });
  }, [categoryId, products, query]);

  const customer = users.find((item) => item.numero_documento === documentNumber.trim());
  const customerAddresses = addresses.filter((address) => address.id_usuario === customer?.id);
  const selectedAddress = customerAddresses.find((address) => address.id === addressId)
    || customerAddresses.find((address) => address.predeterminada);
  const subtotal = cart.reduce((total, item) => total + item.product.precio * item.quantity, 0);
  const deliveryPrice = requiresDelivery ? 35000 : 0;
  const total = subtotal + deliveryPrice;
  const nonCashTotal = paymentMethods.filter((method) => method !== "Efectivo")
    .reduce((amount, method) => amount + (Number(paymentAmounts[method]) || 0), 0);
  const cashDue = Math.max(0, total - nonCashTotal);
  const changeDue = paymentMethods.includes("Efectivo") ? Math.max(0, (Number(cashReceived) || 0) - cashDue) : 0;
  const paymentCovered = paymentMethods.length > 0 && nonCashTotal <= total
    && (paymentMethods.includes("Efectivo") ? (Number(cashReceived) || 0) >= cashDue : nonCashTotal === total);
  const employee = users.find((item) => item.correo === user?.email);
  const dateTime = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(now);

  const addProduct = (product) => {
    if (product.stock < 1) {
      setScanMessage("Producto agotado");
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing && existing.quantity >= product.stock) return current;
      return existing
        ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { product, quantity: 1 }];
    });
    setScanMessage(`${product.nombre} añadido`);
  };

  const scanProduct = () => {
    const code = scanCode.trim().toLocaleLowerCase();
    if (!code) return;
    const product = products.find((item) => String(item.id) === code
      || String(item.codigo_barras || "").toLocaleLowerCase() === code
      || item.nombre.toLocaleLowerCase() === code);
    if (!product) {
      setScanMessage("No se encontró un producto con ese código");
      return;
    }
    addProduct(product);
    setScanCode("");
  };

  const handleKeypad = (key) => {
    setScanMessage("");
    if (key === "C") setScanCode("");
    else if (key === "DEL") setScanCode((current) => current.slice(0, -1));
    else setScanCode((current) => `${current}${key}`);
  };

  const handleDocumentKeypad = (key) => {
    setMessage("");
    if (key === "C") setDocumentNumber("");
    else if (key === "DEL") setDocumentNumber((current) => current.slice(0, -1));
    else setDocumentNumber((current) => `${current}${key}`.replace(/\D/g, "").slice(0, 10));
  };

  const updateQuantity = (productId, quantity) => {
    const product = products.find((item) => item.id === productId);
    if (quantity > (product?.stock || 0)) return;
    setCart((current) => quantity < 1
      ? current.filter((item) => item.product.id !== productId)
      : current.map((item) => item.product.id === productId ? { ...item, quantity } : item));
  };

  const continueToProducts = () => {
    if (!documentNumber.trim()) {
      setMessage("Ingresa una cédula o elige continuar sin cédula.");
      return;
    }
    if (!customer) {
      setMessage("No encontramos ese documento. Corrígelo o continúa sin cédula.");
      return;
    }
    setStep("products");
    setMessage(customer ? `Cliente: ${customer.nombre} ${customer.apellidos}` : "Venta.");
  };

  const continueWithoutCustomer = () => {
    setDocumentNumber("");
    setAddressId("");
    setStep("products");
    setMessage("Venta.");
  };

  const totalizeSale = () => {
    if (cart.length === 0) {
      setMessage("Agrega al menos un producto antes de totalizar.");
      return;
    }
    if (requiresDelivery && (!customer || !selectedAddress)) {
      setMessage("Para el domicilio, ingresa la cédula de un cliente con dirección registrada.");
      return;
    }
    setMessage("");
    setStep("payment");
  };

  const togglePaymentMethod = (method) => {
    if (paymentMethods.includes(method)) {
      setPaymentMethods((current) => current.filter((item) => item !== method));
      setPaymentAmounts((current) => {
        const nextAmounts = { ...current };
        delete nextAmounts[method];
        return nextAmounts;
      });
      if (paymentTarget === method) setPaymentTarget(paymentMethods.find((item) => item !== method) || "Efectivo");
      return;
    }
    setPaymentMethods((current) => [...current, method]);
    setPaymentTarget(method);
  };

  const handlePaymentKeypad = (key) => {
    const currentValue = paymentTarget === "Efectivo" ? cashReceived : paymentAmounts[paymentTarget] || "";
    const nextValue = key === "C" ? "" : key === "DEL" ? currentValue.slice(0, -1) : `${currentValue}${key}`;
    if (paymentTarget === "Efectivo") setCashReceived(nextValue);
    else setPaymentAmounts((current) => ({ ...current, [paymentTarget]: nextValue }));
  };

  const registerSale = (event) => {
    event.preventDefault();
    if (cart.length === 0 || paymentMethods.length === 0 || (paymentStatus === "Pagada" && !paymentCovered)) return;
    if (documentNumber && !customer) {
      setMessage("Corrige el documento del cliente o continúa.");
      setStep("products");
      return;
    }
    if (requiresDelivery && (!customer || !selectedAddress)) {
      setMessage("Busca un cliente con dirección registrada antes de cobrar el domicilio.");
      return;
    }
    if (cart.some(({ product, quantity }) => quantity > products.find((item) => item.id === product.id)?.stock)) {
      setMessage("El stock cambió. Revisa las cantidades del carrito.");
      return;
    }

    const createdAt = new Date().toISOString();
    const id = `VTA-${Date.now()}`;
    const invoice = requiresInvoice ? {
      id: `FE-${id}`,
      id_venta: id,
      numero_factura: String(Date.now()).slice(-6),
      prefijo: "MK",
      fecha_emision: createdAt,
      estado: "Pendiente de validación",
      cufe: `CUFE-DEMO-${id}`,
      fecha_validacion: "",
    } : null;
    const sale = {
      id,
      id_usuario: customer?.id || "",
      id_comprador: customer?.id || "",
      id_vendedor: employee?.id || "USR-002",
      cliente: customer ? `${customer.nombre} ${customer.apellidos}` : "Cliente",
      items: cart.map(({ product, quantity }) => ({
        productId: product.id,
        nombre: product.nombre,
        quantity,
        precio: product.precio,
        subtotal: product.precio * quantity,
      })),
      total,
      estado: paymentStatus,
      tipo_venta: "Física",
      metodos_pago: paymentMethods,
      montos_pago: [
        ...(paymentMethods.includes("Efectivo") ? [{ metodo: "Efectivo", recibido: Number(cashReceived) || 0, aplicado: cashDue, cambio: changeDue }] : []),
        ...paymentMethods.filter((method) => method !== "Efectivo").map((method) => ({ metodo: method, aplicado: Number(paymentAmounts[method]) || 0 })),
      ],
      fecha_venta: createdAt,
      fecha_pago: paymentStatus === "Pagada" ? createdAt : "",
      requiere_domicilio: requiresDelivery,
      servicio_domicilio: requiresDelivery,
      requiere_factura_electronica: requiresInvoice,
      factura: invoice,
      domicilio: requiresDelivery ? {
        id: `PED-${id}`,
        id_venta: id,
        id_direccion: selectedAddress.id,
        precio: deliveryPrice,
        estado: "Pendiente",
        fecha_salida: "",
        fecha_entrega: "",
      } : null,
    };

    saveAdminSales([sale, ...getAdminSales()]);
    const quantitiesSold = new Map(cart.map(({ product, quantity }) => [product.id, quantity]));
    const nextProducts = products.map((product) => {
      const quantitySold = quantitiesSold.get(product.id) || 0;
      if (!quantitySold) return product;
      const stock = product.stock - quantitySold;
      return { ...product, stock, estado: stock === 0 ? "agotado" : stock <= 5 ? "casi agotado" : "disponible" };
    });
    saveCatalogProducts(nextProducts);
    recordInventoryMovements(cart.map(({ product, quantity }) => ({
      id_producto: product.id,
      id_referencia: id,
      tipo: "Salida por venta",
      unidades: quantity,
      id_usuario: employee?.id || "USR-002",
    })));
    setProducts(nextProducts);
    setCart([]);
    setDocumentNumber("");
    setAddressId("");
    setRequiresDelivery(false);
    setRequiresInvoice(false);
    setPaymentMethods(["Efectivo"]);
    setPaymentAmounts({});
    setCashReceived("");
    setPaymentTarget("Efectivo");
    setPaymentStatus("Pagada");
    setStep("customer");
    setMessage(`Venta ${id} registrada correctamente.`);
  };

  const renderHeader = () => (
    <section className="w-full h-20 p-2.5 overflow-hidden border shadow-md bg-surface-alt border-border-gray rounded-3xl flex flex-row items-center">
      <article className="rounded-1xl size-[56px] flex justify-center items-center shadow-md bg-surface">
        <svg className="size-7">
          <use xlinkHref="/sprite.svg#miketicon" />
        </svg>
      </article>
      <span className="flex-1 px-2 font-bold transition-all duration-300 text-2xl">Venta</span>
      <div className="grid grid-cols-2 gap-4 text-right text-sm w-max">
        <div><strong className="block">Fecha</strong>{dateTime}</div>
        <div><strong className="block">Usuario</strong>{employee?.nombre || user?.nombre || "Operador"}
          <span className="block text-xs text-gray-500">{employee?.id_rol || "Rol"}</span>
        </div>
      </div>
    </section>
  );

  const renderStepNavigation = () => (
    <nav aria-label="Pasos de venta" className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-2 text-center text-sm">
      {["Identificación", "Productos", "Pago"].map((label, index) => {
        const stepIndex = ["customer", "products", "payment"].indexOf(step);
        const isCurrent = index === stepIndex;
        const isComplete = index < stepIndex;
        return <span key={label} aria-current={isCurrent ? "step" : undefined} className={`border-b-2 px-2 py-1 font-semibold 
          ${isCurrent ? "border-primary text-primary-dark" :
            isComplete ? "border-emerald-600 text-emerald-800" : "border-gray-300 text-gray-500"}`}>
          {isComplete ? `✓ ${label}` : label}</span>;
      })}
    </nav>
  );

  if (step === "customer") {
    return (
      <section className="mx-auto flex w-full flex-col gap-5">
        {renderHeader()}
        {renderStepNavigation()}
        <section className="mx-auto w-full max-w-xl rounded-3xl border border-gray-300 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm text-gray-500">Punto de venta · Paso 1</p>
          <h2 className="mt-1 text-2xl font-bold">Identificación del cliente</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresa la cédula para asociar la venta.</p>
          <label className="mt-6 block text-sm font-semibold">Cédula del cliente
            <input autoFocus inputMode="numeric" pattern="[0-9]*" value={documentNumber} onChange={(event) => { setDocumentNumber(event.target.value.replace(/\D/g, "")); setMessage(""); }}
              placeholder="Solo números" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-4 text-xl" />
          </label>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {keypadKeys.map((key) =>
              <button key={key} type="button" onClick={() => handleDocumentKeypad(key)} className="min-h-12 rounded-xl bg-white text-xl font-bold shadow-sm 
                transition-transform hover:scale-[1.02]">{key}</button>)}
          </div>
          <div aria-live="polite" className="mt-3 min-h-6 text-sm">
            {customer ? <p className="text-emerald-800">Cliente: <strong>{customer.nombre} {customer.apellidos}</strong></p> : documentNumber ?
              <p className="text-amber-800">No encontramos un cliente con esa cédula.</p> : null}
            {message && <p className="text-amber-800">{message}</p>}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={continueToProducts} disabled={!customer} className="min-h-12 rounded-xl bg-primary 
              px-4 py-3 font-bold text-white disabled:opacity-40">Continuar</button>
            <button type="button" onClick={continueWithoutCustomer} className="min-h-12 rounded-xl border border-gray-300 px-4 py-3 
              font-semibold">Continuar sin cédula</button>
          </div>
        </section>
      </section>
    );
  }

  if (step === "payment") {
    return (
      <section className="mx-auto flex w-full flex-col gap-5">
        {renderHeader()}
        {renderStepNavigation()}
        <form onSubmit={registerSale} className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <section className="min-w-0 rounded-3xl border border-gray-300 bg-white p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Paso 3</p>
                <h2 className="text-2xl font-bold">Pago</h2>
              </div>
              <button type="button" onClick={() => setStep("products")} className="rounded-xl border border-gray-300 px-4 py-2 
                text-sm font-semibold">Volver</button>
            </div>
            <div className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
              {cart.map(({ product, quantity }) =>
                <div key={product.id} className="flex justify-between gap-4 py-3 text-sm">
                  <span>{product.nombre} × {quantity}</span><strong>{formatPrice(product.precio * quantity)}</strong>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="mt-1 flex justify-between text-sm"><span>Domicilio</span><span>{formatPrice(deliveryPrice)}</span></div>
            <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
              <strong className="text-lg">Total de la compra</strong><strong className="text-2xl">{formatPrice(total)}</strong>
            </div>
            {customer && <p className="mt-3 text-sm text-gray-600">Cliente: {customer.nombre} {customer.apellidos}</p>}
            {requiresDelivery && selectedAddress &&
              <p className="mt-1 text-sm text-gray-600">Domicilio: {selectedAddress.tipo_de_via} {selectedAddress.numero_de_via},
                {selectedAddress.numero_de_vivienda}, {selectedAddress.barrio}, {selectedAddress.ciudad}</p>}
            {message && <p role="alert" className="mt-3 text-sm text-amber-800">{message}</p>}
          </section>

          <section className="flex min-w-0 flex-col gap-4 rounded-3xl border border-gray-300 bg-slate-100 p-4 sm:p-5">
            <fieldset className="rounded-2xl bg-white p-4">
              <legend className="px-1 font-semibold">Métodos de pago</legend>
              <div className="grid grid-cols-2 gap-3">
                {paymentOptions.map((method) =>
                  <label key={method} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={paymentMethods.includes(method)} onChange={() => togglePaymentMethod(method)} />{method}
                  </label>
                )}
              </div>
              <select aria-label="Estado del pago" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}
                className="mt-4 w-full rounded-xl border border-gray-300 bg-white px-3 py-2">
                <option>Pagada</option>
                <option>En espera</option>
              </select>
            </fieldset>
            {paymentMethods.map((method) =>
              <label key={method} className={`block rounded-2xl border bg-white p-3 ${paymentTarget === method ? "border-primary" : "border-gray-200"}`}>
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{method === "Efectivo" ? "Dinero recibido" : method}</span>
                  {method !== "Efectivo" && <span className="text-xs text-gray-500">Seleccionado</span>}
                </span>
                <input aria-label={method === "Efectivo" ? "Dinero recibido en efectivo" : `Monto ${method}`} inputMode="numeric"
                  value={method === "Efectivo" ? cashReceived : paymentAmounts[method] || ""} onFocus={() => setPaymentTarget(method)}
                  onChange={(event) => {
                    const value = event.target.value.replace(/\D/g, "");
                    if (method === "Efectivo") setCashReceived(value);
                    else setPaymentAmounts((current) => ({ ...current, [method]: value }));
                  }}
                  placeholder="$ 0" className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-right text-lg font-bold" />
              </label>)}
            <div className="grid grid-cols-3 gap-2">
              {keypadKeys.map((key) =>
                <button key={key} type="button" onClick={() => handlePaymentKeypad(key)} className="min-h-11 rounded-xl bg-white text-lg 
                  font-bold shadow-sm">{key}</button>)}
            </div>
            <div className="rounded-2xl bg-white p-4">
              <div className="flex justify-between text-sm">
                <span>Falta por cubrir</span><strong>{formatPrice(cashDue)}</strong>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2">
                <strong>Cambio</strong><strong className="text-xl">{formatPrice(changeDue)}</strong>
              </div>
            </div>
            <button type="submit" disabled={cart.length === 0 || paymentMethods.length === 0 || (paymentStatus === "Pagada" && !paymentCovered)}
              className="min-h-14 rounded-xl bg-primary px-4 py-3 text-lg font-bold text-white disabled:opacity-40">Registrar compra ·
              {formatPrice(total)}</button>
          </section>
        </form>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col gap-2.5 justify-between items-center">
      {renderHeader()}
      {renderStepNavigation()}
      <div className="grid gap-4 xl:grid-cols-[minmax(235px,0.9fr)_minmax(300px,0.95fr)_minmax(320px,1.1fr)]">
        <section className="min-w-0 rounded-3xl border border-gray-300 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Productos</h2>
            <span className="text-sm text-gray-500">{filteredProducts.length}</span>
          </div>
          <input type="search" aria-label="Buscar producto" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre o proveedor" className="mb-2 w-full rounded-xl border border-gray-300 px-3 py-2" />
          <select aria-label="Filtrar por categoría" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}
            className="mb-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2">
            <option value="">Todas las categorías</option>
            {categories.map((category) =>
              <option key={category.id} value={category.id}>{category.nombre}
              </option>
            )}
          </select>
          <div className="max-h-[27rem] space-y-2 overflow-y-auto scrollbar pr-1">
            {filteredProducts.map((product) =>
              <button key={product.id} type="button" disabled={product.stock < 1} onClick={() => addProduct(product)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-left transition-colors 
                hover:border-primary hover:bg-primary/5 disabled:opacity-45">
                <span className="min-w-0">
                  <strong className="block truncate text-sm">{product.nombre}</strong>
                  <span className="text-xs text-gray-500">{product.codigo_barras || "Sin etiqueta"} · Stock: {product.stock}</span>
                </span>
                <span className="shrink-0 text-right text-sm font-semibold">{formatPrice(product.precio)}</span>
              </button>
            )}
            {filteredProducts.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No hay productos con esos filtros.</p>}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3 rounded-3xl border border-gray-300 bg-slate-100 p-4">
          <div className="relative grid min-h-44 place-items-center overflow-hidden rounded-2xl border border-gray-300 bg-white">
            {cameraActive && <div className="absolute inset-x-8 top-1/2 h-0.5 animate-pulse bg-rose-500" />}
            <div className="text-center">
              <svg className="mx-auto mb-2 size-10 text-gray-500">
                <use xlinkHref="/sprite.svg#search" />
              </svg>
              <p className="font-semibold">Lector / cámara</p>
              <p className="text-sm text-gray-500">{cameraActive ? "Cámara de demostración activa" : "Escáner listo"}</p>
            </div>
            <button type="button" onClick={() => setCameraActive((active) => !active)} className="absolute bottom-3 right-3 rounded-lg border 
              border-gray-300 bg-white px-3 py-1.5 text-sm">{cameraActive ? "Detener cámara" : "Activar cámara"}</button>
          </div>
          <form onSubmit={(event) => { event.preventDefault(); scanProduct(); }} className="flex gap-2">
            <input autoFocus aria-label="Código de barras o referencia" value={scanCode} onChange={(event) => setScanCode(event.target.value)}
              placeholder="Código de barras / referencia" className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2" />
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 font-semibold text-white">Leer</button>
          </form>
          <p aria-live="polite" className="min-h-5 text-center text-sm text-gray-600">{scanMessage || ""}</p>
          <div className="grid grid-cols-3 gap-2 border-t border-gray-400 pt-2">
            {keypadKeys.map((key) =>
              <button key={key} type="button" onClick={() => handleKeypad(key)} className="min-h-12 rounded-xl bg-white text-xl font-bold shadow-sm 
                transition-transform hover:scale-[1.02]">{key}</button>)}
            <button type="button" onClick={scanProduct} className="col-span-3 min-h-12 rounded-xl bg-white text-lg font-bold shadow-sm transition-transform 
              hover:scale-[1.01]">ENTER</button>
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-3 rounded-3xl border border-gray-300 bg-slate-100 p-3 sm:p-4">
          <h2 className="sr-only">Resumen y pago</h2>
          <div className="rounded-2xl bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold">Artículos</h3>
              <span className="text-sm text-gray-500">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="max-h-37 divide-y divide-gray-200 px-2 overflow-y-auto scrollbar">
              {cart.map(({ product, quantity }) =>
                <div key={product.id} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.nombre}</p>
                    <p className="text-xs text-gray-500">{formatPrice(product.precio)} c/u</p>
                  </div>
                  <button type="button" aria-label={`Quitar unidad de ${product.nombre}`} onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="grid size-8 place-items-center rounded-lg border bg-white">−</button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <button type="button" aria-label={`Agregar unidad de ${product.nombre}`} onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="grid size-8 place-items-center rounded-lg border bg-white">+</button>
                </div>
              )}
            </div>
            {cart.length === 0 && <p className="py-5 text-center text-sm text-gray-500">Aún no hay artículos.</p>}
          </div>

          <label className="block text-sm font-medium">Identificación del cliente
            <input inputMode="numeric" pattern="[0-9]*" value={documentNumber} onChange={(event) => {
              setDocumentNumber(event.target.value.replace(/\D/g, ""));
              setAddressId("");
            }} placeholder="Numero" className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2" />
          </label>
          {documentNumber &&
            <p className={`text-sm ${customer ? "text-emerald-800" : "text-amber-800"}`}>{customer ? `${customer.nombre} ${customer.apellidos}` :
              "No se encontró cliente con esa cédula."}</p>}
          <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm">
            <input type="checkbox" checked={requiresDelivery}
              onChange={(event) => { setRequiresDelivery(event.target.checked); setAddressId(""); }} />Servicio a domicilio (+{formatPrice(35000)})</label>
          {requiresDelivery &&
            <div className="space-y-1">
              <select aria-label="Dirección de entrega" value={addressId || selectedAddress?.id || ""} onChange={(event) => setAddressId(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2" disabled={!customer}>
                <option value="">Seleccionar dirección registrada</option>
                {customerAddresses.map((address) =>
                  <option key={address.id} value={address.id}>{address.tipo_de_via} {address.numero_de_via},
                    {address.numero_de_vivienda} · {address.barrio}{address.predeterminada ? " · predeterminada" : ""}
                  </option>)}
              </select>
              {customer && customerAddresses.length === 0 &&
                <p className="text-xs text-amber-800">El cliente debe agregar su dirección desde
                  <Link to="/perfil" className="underline">su perfil</Link>.
                </p>}
            </div>}
          <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm">
            <input type="checkbox" checked={requiresInvoice} onChange={(event) => setRequiresInvoice(event.target.checked)} />Factura electrónica
          </label>
          <div className="rounded-2xl bg-white p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span>Domicilio</span>
              <span>{formatPrice(deliveryPrice)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
              <strong className="text-lg">Total</strong>
              <strong className="text-2xl">{formatPrice(total)}</strong>
            </div>
            {message && <p aria-live="polite" className="mt-2 text-sm text-emerald-800">{message}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStep("customer")} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">Volver</button>
              <button type="button" onClick={totalizeSale} disabled={cart.length === 0 || (requiresDelivery && (!customer || !selectedAddress))}
                className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white disabled:opacity-40">Totalizar compra</button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}