import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLocalOrders } from "./data/catalog";
import { useCurrentUser } from "./hooks/useCurrentUser";

const formatPrice = (value) => new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
}).format(value);

export function Orders() {
    const user = useCurrentUser();
    const [orders, setOrders] = useState(() => user ? getLocalOrders(user.id) : []);

    useEffect(() => {
        if (!user) {
            setOrders([]);
            return undefined;
        }

        let timeoutId;
        const scheduleNextPaymentUpdate = (currentOrders) => {
            const dueTimes = currentOrders
                .filter((order) => order.status === "En espera del pago")
                .map((order) => Date.parse(order.paymentDueAt))
                .filter(Number.isFinite);
            if (dueTimes.length === 0) return;

            const nextDueAt = Math.min(...dueTimes);
            timeoutId = window.setTimeout(() => {
                const updatedOrders = getLocalOrders(user.id);
                setOrders(updatedOrders);
                scheduleNextPaymentUpdate(updatedOrders);
            }, Math.max(0, nextDueAt - Date.now()) + 25);
        };

        const currentOrders = getLocalOrders(user.id);
        setOrders(currentOrders);
        scheduleNextPaymentUpdate(currentOrders);
        return () => window.clearTimeout(timeoutId);
    }, [user]);

    if (!user) {
        return (
            <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
                <h1 className="text-2xl font-bold">Mis pedidos</h1>
                <p className="text-gray-600">Inicia sesión para consultar tus pedidos.</p>
                <Link to="/perfil" className="border border-gray-400 px-4 py-2">Ir a mi cuenta</Link>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full flex flex-col gap-5">
            <section className="w-full h-20 p-2.5 overflow-hidden border shadow-md bg-surface-alt border-border-gray rounded-3xl flex flex-row items-center">
                <article className="rounded-1xl size-[56px] flex justify-center items-center shadow-md bg-accent">
                <svg className="size-7">
                    <use xlinkHref="/sprite.svg#orders" />
                </svg>
                </article>
                <span className="flex-1 px-2 font-bold transition-all duration-300">Pedidos realizados</span>
            </section>
            {orders.length === 0 ? (
                <div className="border-y border-gray-300 py-12 text-center">
                    <p className="text-lg font-medium">Todavía no tienes pedidos</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-300 border-y border-gray-300">
                    {orders.map((order) => (
                        <article key={order.id} className="py-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="font-semibold">{order.id}</h2>
                                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString("es-CO")}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm ${order.status === "En espera del pago" ? "text-amber-700" : "text-emerald-700"}`}>{order.status}</span>
                                    {order.paymentMethod && <p className="text-xs text-gray-500">Pago: {order.paymentMethod}</p>}
                                    <p className="font-semibold">{formatPrice(order.total)}</p>
                                </div>
                            </div>
                            <ul className="mt-4 divide-y divide-gray-200">
                                {order.items.map((item) => (
                                    <li key={item.productId} className="flex justify-between gap-4 py-2 text-sm">
                                        <span>{item.nombre} × {item.quantity}</span>
                                        <span>{formatPrice(item.precio * item.quantity)}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}