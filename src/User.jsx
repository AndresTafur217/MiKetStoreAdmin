import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    getLocalCart,
    getLocalFavorites,
    getLocalOrders,
    logoutDemoUser,
} from "./data/catalog";
import { getAdminAddresses, getAdminDataChangeEvent, getAdminUsers, saveAdminAddresses, saveAdminUsers } from "./data/adminData";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useAuthModal } from "./auth/AuthModalContext";
import { Link, useNavigate } from "react-router-dom";

export function User() {
    const user = useCurrentUser();
    const { requestLogin } = useAuthModal();
    const navigate = useNavigate();
    const favoritesCount = user ? getLocalFavorites(user.id).length : 0;
    const cartCount = user ? getLocalCart(user.id).reduce((total, item) => total + item.quantity, 0) : 0;
    const ordersCount = user ? getLocalOrders(user.id).length : 0;
    const [users, setUsers] = useState(() => getAdminUsers());
    const [addresses, setAddresses] = useState(() => getAdminAddresses());
    const [addressEditorOpen, setAddressEditorOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({ ciudad: "", localidad: "", barrio: "", tipo_de_via: "Calle", numero_de_via: "", numero_de_vivienda: "", complemento: "", predeterminada: false });
    const adminUser = users.find((item) => item.correo === user?.email);
    const ownedAddresses = addresses.filter((address) => address.id_usuario === adminUser?.id);

    useEffect(() => {
        const refreshAccountData = () => {
            setUsers(getAdminUsers());
            setAddresses(getAdminAddresses());
        };
        window.addEventListener(getAdminDataChangeEvent(), refreshAccountData);
        return () => window.removeEventListener(getAdminDataChangeEvent(), refreshAccountData);
    }, []);

    const handleLogout = () => {
        logoutDemoUser();
        navigate("/", { replace: true });
    };

    const openAddressEditor = (address = null) => {
        setEditingAddress(address);
        setAddressForm(address ? { ...address } : { ciudad: "", localidad: "", barrio: "", tipo_de_via: "Calle", numero_de_via: "", numero_de_vivienda: "", complemento: "", predeterminada: ownedAddresses.length === 0 });
        setAddressEditorOpen(true);
    };

    const saveAddress = (event) => {
        event.preventDefault();
        const address = { ...addressForm, id: editingAddress?.id || `DIR-${Date.now()}`, id_usuario: adminUser.id };
        let nextAddresses = editingAddress
            ? addresses.map((item) => item.id === address.id ? address : item)
            : [...addresses, address];
        if (address.predeterminada) nextAddresses = nextAddresses.map((item) => item.id_usuario === address.id_usuario ? { ...item, predeterminada: item.id === address.id } : item);
        saveAdminAddresses(nextAddresses);
        setAddresses(nextAddresses);
        setAddressEditorOpen(false);
    };

    const deleteAddress = (address) => {
        if (!window.confirm("¿Eliminar esta dirección de tu cuenta?")) return;
        let nextAddresses = addresses.filter((item) => item.id !== address.id);
        if (address.predeterminada && nextAddresses.some((item) => item.id_usuario === address.id_usuario)) {
            const nextDefault = nextAddresses.find((item) => item.id_usuario === address.id_usuario);
            nextAddresses = nextAddresses.map((item) => item.id === nextDefault.id ? { ...item, predeterminada: true } : item);
        }
        saveAdminAddresses(nextAddresses);
        setAddresses(nextAddresses);
    };

    const changeAccountStatus = (estado) => {
        if (!adminUser || !window.confirm(estado === "Suspendido" ? "¿Suspender tu cuenta? Se cerrará la sesión." : "¿Eliminar definitivamente tu cuenta de demostración?")) return;
        if (estado === "Eliminado") {
            saveAdminUsers(users.filter((item) => item.id !== adminUser.id));
            saveAdminAddresses(addresses.filter((address) => address.id_usuario !== adminUser.id));
        } else {
            saveAdminUsers(users.map((item) => item.id === adminUser.id ? { ...item, estado } : item));
        }
        logoutDemoUser();
        navigate("/", { replace: true });
    };

    if (!user) {
        return (
            <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 py-16 text-center">
                <h1 className="text-2xl font-bold">Inicia sesión en tu cuenta</h1>
                <p className="max-w-md text-gray-600">Accede para consultar tus favoritos, carrito y pedidos.</p>
                <button type="button" onClick={() => requestLogin()} className="mt-2 bg-store-items px-4 py-2 font-semibold hover:bg-store-items2">Iniciar sesión</button>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-3xl py-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-300 pb-5">
                <div>
                    <p className="text-sm text-gray-500">Mi cuenta</p>
                    <h1 className="mt-1 text-2xl font-bold">{user.nombre}</h1>
                    <p className="mt-1">{user.email}</p>
                </div>
                <span className="border border-emerald-700 px-3 py-1 text-sm text-emerald-800">Sesión activa</span>
            </div>

            <dl className="grid gap-x-8 gap-y-4 border-b border-gray-300 py-5 sm:grid-cols-2">
                <div>
                    <dt className="text-sm text-gray-500">Nombre completo</dt>
                    <dd className="mt-1 font-medium">{user.nombre}</dd>
                </div>
                <div>
                    <dt className="text-sm text-gray-500">Correo electrónico</dt>
                    <dd className="mt-1 font-medium">{user.email}</dd>
                </div>
                <div>
                    <dt className="text-sm text-gray-500">Tipo de cuenta</dt>
                    <dd className="mt-1 font-medium">{adminUser?.estado || "Cliente"}</dd>
                </div>
            </dl>

            <div className="grid grid-cols-3 gap-3 py-5 text-center">
                <div className="border-y border-gray-300 py-3">
                    <strong className="block text-xl">{favoritesCount}</strong>
                    <span className="text-sm text-gray-600">Favoritos</span>
                </div>
                <div className="border-y border-gray-300 py-3">
                    <strong className="block text-xl">{cartCount}</strong>
                    <span className="text-sm text-gray-600">En el carrito</span>
                </div>
                <div className="border-y border-gray-300 py-3">
                    <strong className="block text-xl">{ordersCount}</strong>
                    <span className="text-sm text-gray-600">Pedidos</span>
                </div>
            </div>

            <section className="border-y border-gray-300 py-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Direcciones de entrega</h2><p className="text-sm text-gray-600">Administra aquí tus direcciones y selecciona la predeterminada.</p></div><button type="button" onClick={() => openAddressEditor()} className="border border-gray-400 px-3 py-2 text-sm">Agregar dirección</button></div>
                {ownedAddresses.length === 0 ? <p className="py-3 text-sm text-gray-600">Aún no tienes direcciones guardadas.</p> : <div className="divide-y divide-gray-200">{ownedAddresses.map((address) => <article key={address.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{address.tipo_de_via} {address.numero_de_via}, {address.numero_de_vivienda}{address.complemento ? ` · ${address.complemento}` : ""}</p><p className="text-sm text-gray-600">{address.barrio}, {address.localidad}, {address.ciudad}{address.predeterminada ? " · Predeterminada" : ""}</p></div><div className="flex gap-3 text-sm"><button type="button" onClick={() => openAddressEditor(address)} className="text-blue-800 underline">Editar</button><button type="button" onClick={() => deleteAddress(address)} className="text-red-700 underline">Eliminar</button></div></article>)}</div>}
            </section>

            <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={handleLogout} className="border border-gray-400 px-4 py-2 hover:bg-store-items2">Cerrar sesión</button><button type="button" onClick={() => changeAccountStatus("Suspendido")} className="border border-amber-700 px-4 py-2 text-amber-900">Suspender cuenta</button><button type="button" onClick={() => changeAccountStatus("Eliminado")} className="border border-red-700 px-4 py-2 text-red-800">Eliminar cuenta</button></div>
            <Link to="/" className="ml-4 text-sm underline">Volver a la tienda</Link>

            {addressEditorOpen && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" onClick={(event) => { if (event.target === event.currentTarget) setAddressEditorOpen(false); }}><form onSubmit={saveAddress} className="max-h-[90dvh] w-full max-w-xl space-y-3 overflow-y-auto bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold">{editingAddress ? "Editar dirección" : "Nueva dirección"}</h2><div className="grid gap-3 sm:grid-cols-2">{[["ciudad", "Ciudad"], ["localidad", "Localidad"], ["barrio", "Barrio"], ["numero_de_via", "Número de vía"], ["numero_de_vivienda", "Número de vivienda"], ["complemento", "Complemento"]].map(([key, label]) => <label key={key} className="text-sm font-medium">{label}<input required={key !== "complemento"} value={addressForm[key] || ""} onChange={(event) => setAddressForm({ ...addressForm, [key]: event.target.value })} className="mt-1 w-full border border-gray-300 p-2" /></label>)}</div><label className="block text-sm font-medium">Tipo de vía<select value={addressForm.tipo_de_via} onChange={(event) => setAddressForm({ ...addressForm, tipo_de_via: event.target.value })} className="mt-1 w-full border border-gray-300 p-2"><option>Calle</option><option>Carrera</option><option>Avenida</option><option>Diagonal</option><option>Transversal</option></select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(addressForm.predeterminada)} onChange={(event) => setAddressForm({ ...addressForm, predeterminada: event.target.checked })} />Usar como predeterminada</label><div className="flex justify-end gap-3"><button type="button" onClick={() => setAddressEditorOpen(false)} className="border border-gray-400 px-4 py-2">Cancelar</button><button type="submit" className="bg-store-items px-4 py-2 font-semibold text-white">Guardar dirección</button></div></form></div>, document.body)}
        </section>
    );
}