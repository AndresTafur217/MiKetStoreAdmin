import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { checkoutCart, demoUser, getLocalCart, getLocalOrders, removeFromCart, updateCartQuantity } from "./data/catalog";
import { getAdminAddresses, getAdminUsers } from "./data/adminData";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useAuthModal } from "./auth/AuthModalContext";
import { SkeletonImage } from "./Skeletons";

const formatPrice = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
}).format(value);

const paymentMethods = [
  { id: "PSE", description: "Débito desde tu cuenta bancaria" },
  { id: "Transferencia bancaria", description: "Transferencia desde tu banco" },
  { id: "Tarjeta débito o crédito", description: "Pago simulado con tarjeta" },
  { id: "Consignación bancaria", description: "Consignación a una cuenta bancaria" },
];

export function Shoppings() {
  const user = useCurrentUser();
  const { requestLogin } = useAuthModal();
  const [cart, setCart] = useState(() => user ? getLocalCart(user.id) : []);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethodsSelected, setPaymentMethodsSelected] = useState(["PSE"]);
  const [deliveryRequired, setDeliveryRequired] = useState(false);
  const [invoiceRequired, setInvoiceRequired] = useState(false);
  const [deliveryAddressId, setDeliveryAddressId] = useState("");
  const [addresses, setAddresses] = useState(() => getAdminAddresses());
  const [paymentSecondsLeft, setPaymentSecondsLeft] = useState(60);
  const adminCustomer = getAdminUsers().find((item) => item.correo === user?.email);
  const customerAddresses = addresses.filter((address) => address.id_usuario === adminCustomer?.id);

  useEffect(() => {
    setCart(user ? getLocalCart(user.id) : []);
    setCompletedOrder(null);
    setAddresses(getAdminAddresses());
    setDeliveryAddressId("");
    if (!user) setIsCheckoutOpen(false);
  }, [user]);

  useEffect(() => {
    if (!user || completedOrder?.status !== "En espera del pago") return undefined;

    const updatePaymentStatus = () => {
      const secondsLeft = Math.max(0, Math.ceil((Date.parse(completedOrder.paymentDueAt) - Date.now()) / 1000));
      setPaymentSecondsLeft(secondsLeft);
      if (secondsLeft === 0) {
        const updatedOrder = getLocalOrders(user.id).find((order) => order.id === completedOrder.id);
        if (updatedOrder) setCompletedOrder(updatedOrder);
      }
    };

    updatePaymentStatus();
    const timer = window.setInterval(updatePaymentStatus, 1000);
    return () => window.clearInterval(timer);
  }, [completedOrder, user]);

  const refreshQuantity = (productId, quantity) => {
    setCart(updateCartQuantity(productId, quantity, user.id));
  };

  const removeProduct = (productId) => {
    setCart(removeFromCart(productId, user.id));
  };

  const confirmOrder = (userId) => {
    if (paymentMethodsSelected.length === 0 || (deliveryRequired && !deliveryAddressId)) return;
    const order = checkoutCart(userId, paymentMethodsSelected.join(" + "), {
      tipo_venta: "Virtual",
      metodos_pago: paymentMethodsSelected,
      requiere_domicilio: deliveryRequired,
      requiere_factura_electronica: invoiceRequired,
      id_direccion: deliveryAddressId,
      precio_domicilio: deliveryRequired ? 35000 : 0,
    });
    if (order) {
      setCompletedOrder(order);
      setPaymentSecondsLeft(60);
      setCart([]);
      setIsCheckoutOpen(false);
    }
  };

  const placeOrder = () => {
    if (!user) {
      requestLogin({ onSuccess: () => setIsCheckoutOpen(true) });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.producto.precio * item.quantity, 0);
  const deliveryPrice = deliveryRequired ? 35000 : 0;
  const total = subtotal + deliveryPrice;

  if (!user) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Carrito de compras</h1>
        <p className="text-gray-600">Inicia sesión para consultar tu carrito.</p>
        <Link to="/perfil" className="border border-gray-400 px-4 py-2 hover:bg-store-items2">Ir a mi cuenta</Link>
      </section>
    );
  }

  if (completedOrder) {
    const isPaid = completedOrder.status === "Pagado";
    const countdown = `${String(Math.floor(paymentSecondsLeft / 60)).padStart(2, "0")}:${String(paymentSecondsLeft % 60).padStart(2, "0")}`;

    return (
      <section className="mx-auto w-full max-w-2xl py-10">
        <div className="border-y border-gray-300 py-8 sm:px-8">
          <div className="flex items-center gap-3">
            <span className={`grid size-11 shrink-0 place-items-center rounded-full ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
              <svg className="size-6"><use xlinkHref={isPaid ? "/sprite.svg#check" : "/sprite.svg#history"} /></svg>
            </span>
            <div>
              <p className="text-sm font-semibold uppercase text-gray-500">{isPaid ? "Pago aprobado" : "Pago en proceso"}</p>
              <h1 className="text-2xl font-bold">{isPaid ? "Pedido pagado" : "Pedido en espera del pago"}</h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-gray-600">
            {isPaid
              ? "La simulación de pago finalizó correctamente. No se realizó ningún cobro real."
              : `Tu pago por ${completedOrder.paymentMethod} está en proceso. El pedido cambiará a pagado en ${countdown}. No se realizará ningún cobro real.`}
          </p>

          {!isPaid && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label="Procesamiento del pago" aria-valuemin={0} aria-valuemax={60} aria-valuenow={60 - paymentSecondsLeft}>
              <div className="h-full rounded-full bg-amber-500 transition-[width] duration-1000" style={{ width: `${((60 - paymentSecondsLeft) / 60) * 100}%` }} />
            </div>
          )}

          <dl className="mt-6 grid grid-cols-1 gap-4 border-y border-gray-200 py-4 text-sm sm:grid-cols-3">
            <div><dt className="text-gray-500">Pedido</dt><dd className="mt-1 font-semibold">{completedOrder.id}</dd></div>
            <div><dt className="text-gray-500">Medio de pago</dt><dd className="mt-1 font-semibold">{completedOrder.paymentMethod}</dd></div>
            <div><dt className="text-gray-500">Total</dt><dd className="mt-1 font-semibold">{formatPrice(completedOrder.total)}</dd></div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link to="/orders" className="bg-store-items px-4 py-2.5 font-semibold hover:bg-store-items2">Ver mis pedidos</Link>
            <Link to="/products" className="self-center text-sm underline">Seguir comprando</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Carrito de compras</h1>
          <p className="mt-1 text-sm text-gray-600">{cart.length} productos distintos</p>
        </div>
        <Link to="/products" className="text-sm underline">Seguir comprando</Link>
      </div>

      {cart.length === 0 ? (
        <div className="border-y border-gray-300 py-12 text-center">
          <p className="text-lg font-medium">Tu carrito está vacío</p>
          <p className="mt-2 text-sm text-gray-600">Añade productos del catálogo para preparar un pedido.</p>
          <Link to="/products" className="mt-5 inline-block border border-gray-400 px-4 py-2 hover:bg-store-items2">Explorar productos</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_19rem]">
          <div className="divide-y divide-gray-300 border-y border-gray-300">
            {cart.map(({ producto, quantity }) => (
              <article key={producto.id} className="grid grid-cols-[5rem_1fr] gap-4 py-4 sm:grid-cols-[7rem_1fr_auto]">
                <SkeletonImage
                  src={producto.imagenes[0]?.url}
                  alt={producto.imagenes[0]?.alt || producto.nombre}
                  className="aspect-square w-full"
                  imageClassName="object-cover"
                />
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <h2 className="font-semibold">{producto.nombre}</h2>
                  <p className="line-clamp-2 text-sm text-gray-600">{producto.descripcion}</p>
                  <button type="button" onClick={() => removeProduct(producto.id)} className="mt-1 w-fit text-sm text-red-700 underline">Quitar</button>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center">
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label={`Quitar una unidad de ${producto.nombre}`} disabled={quantity <= 1} onClick={() => refreshQuantity(producto.id, quantity - 1)} className="size-8 border border-gray-300 disabled:opacity-40">−</button>
                    <span className="min-w-6 text-center">{quantity}</span>
                    <button type="button" aria-label={`Añadir una unidad de ${producto.nombre}`} disabled={quantity >= producto.stock} onClick={() => refreshQuantity(producto.id, quantity + 1)} className="size-8 border border-gray-300 disabled:opacity-40">+</button>
                  </div>
                  <strong>{formatPrice(producto.precio * quantity)}</strong>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit border-y border-gray-300 py-4">
            <h2 className="text-lg font-semibold">Resumen</h2>
            <div className="mt-4 flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="mt-2 flex justify-between text-sm"><span>Envío</span><span>Gratis</span></div>
            <div className="mt-4 flex justify-between border-t border-gray-300 pt-4 text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
            <button type="button" onClick={placeOrder} className="mt-5 w-full bg-store-items px-4 py-3 font-semibold hover:bg-store-items2">Continuar al pago</button>
          </aside>
        </div>
      )}

      {isCheckoutOpen && createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsCheckoutOpen(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="payment-title" className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Checkout simulado</p>
                <h2 id="payment-title" className="mt-1 text-xl font-bold">Selecciona un medio de pago</h2>
              </div>
              <button type="button" aria-label="Cerrar selección de pago" onClick={() => setIsCheckoutOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-950">
                <svg className="size-4"><use xlinkHref="/sprite.svg#xmark" /></svg>
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              <p className="text-sm leading-5 text-gray-600">Elige cualquier opción para continuar. Es una demostración: no se solicitarán datos bancarios ni se hará un cobro real.</p>
              <label className="flex items-center gap-2 border-y border-gray-200 py-3 text-sm"><input type="checkbox" checked={deliveryRequired} onChange={(event) => setDeliveryRequired(event.target.checked)} className="size-4 accent-blue-700" />Requiere domicilio (+{formatPrice(35000)})</label>
              {deliveryRequired && <div className="space-y-2"><label className="block text-sm font-medium">Dirección de entrega<select required value={deliveryAddressId} onChange={(event) => setDeliveryAddressId(event.target.value)} className="mt-1 w-full border border-gray-300 bg-white p-2"><option value="">Selecciona una dirección guardada</option>{customerAddresses.map((address) => <option key={address.id} value={address.id}>{address.tipo_de_via} {address.numero_de_via}, {address.numero_de_vivienda} · {address.barrio}, {address.ciudad}{address.predeterminada ? " (predeterminada)" : ""}</option>)}</select></label>{customerAddresses.length === 0 && <p className="text-sm text-amber-800">No tienes direcciones registradas. <Link to="/perfil" className="underline">Agrega una en tu perfil</Link> y vuelve al carrito.</p>}</div>}
              <label className="flex items-center gap-2 border-b border-gray-200 pb-3 text-sm"><input type="checkbox" checked={invoiceRequired} onChange={(event) => setInvoiceRequired(event.target.checked)} className="size-4 accent-blue-700" />Solicitar factura electrónica</label>
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-semibold">Medios de pago (puedes combinar varios)</legend>
                {paymentMethods.map((method) => (
                  <label key={method.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${paymentMethodsSelected.includes(method.id) ? "border-blue-700 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="checkbox" value={method.id} checked={paymentMethodsSelected.includes(method.id)} onChange={() => setPaymentMethodsSelected((selected) => selected.includes(method.id) ? selected.filter((item) => item !== method.id) : [...selected, method.id])} className="mt-1 size-4 accent-blue-700" />
                    <span>
                      <span className="block text-sm font-semibold text-gray-900">{method.id}</span>
                      <span className="mt-0.5 block text-xs text-gray-600">{method.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="flex justify-between border-t border-gray-200 pt-4 font-semibold">
                <span>Total a pagar</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <footer className="grid grid-cols-1 gap-2 border-t border-gray-200 p-4 min-[420px]:grid-cols-2 sm:px-6">
              <button type="button" onClick={() => setIsCheckoutOpen(false)} className="min-h-12 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50">Volver al carrito</button>
              <button type="button" onClick={() => confirmOrder(user?.id || demoUser.id)} disabled={cart.length === 0 || paymentMethodsSelected.length === 0 || (deliveryRequired && !deliveryAddressId)} className="min-h-12 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">Pagar {formatPrice(total)}</button>
            </footer>
          </section>
        </div>,
        document.body,
      )}
    </section>
  );
}