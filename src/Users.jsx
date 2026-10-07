import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  getAdminAddresses,
  getAdminDataChangeEvent,
  getAdminRoles,
  getAdminUsers,
  saveAdminAddresses,
  saveAdminRoles,
  saveAdminUsers,
} from "./data/adminData";

const tabs = ["Usuarios", "Roles", "Direcciones"];
const emptyUser = { nombre: "", apellidos: "", tipo_de_documento: "CC", numero_documento: "", fecha_de_nacimiento: "", id_rol: "cliente", correo: "", telefono: "", fecha_de_ingreso: new Date().toISOString().slice(0, 10), estado: "Activo" };
const emptyAddress = { id_usuario: "", ciudad: "", localidad: "", barrio: "", tipo_de_via: "Calle", numero_de_via: "", numero_de_vivienda: "", complemento: "", predeterminada: false };

export function Users() {
  const [activeTab, setActiveTab] = useState("Usuarios");
  const [users, setUsers] = useState(() => getAdminUsers());
  const [roles, setRoles] = useState(() => getAdminRoles());
  const [addresses, setAddresses] = useState(() => getAdminAddresses());
  const [query, setQuery] = useState("");
  const [userEditorOpen, setUserEditorOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [roleEditorOpen, setRoleEditorOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ nombre: "", salario: "", funciones: "" });
  const [addressEditorOpen, setAddressEditorOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);

  useEffect(() => {
    const refresh = () => {
      setUsers(getAdminUsers());
      setRoles(getAdminRoles());
      setAddresses(getAdminAddresses());
    };
    window.addEventListener(getAdminDataChangeEvent(), refresh);
    return () => window.removeEventListener(getAdminDataChangeEvent(), refresh);
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return users.filter((user) => `${user.nombre} ${user.apellidos} ${user.numero_documento} ${user.correo}`.toLocaleLowerCase().includes(term));
  }, [users, query]);

  const openUserEditor = (user = null) => {
    setEditingUser(user);
    setUserForm(user ? { ...user } : { ...emptyUser, fecha_de_ingreso: new Date().toISOString().slice(0, 10) });
    setVerified(!user);
    setEnteredCode("");
    setVerificationCode(user ? String(Math.floor(100000 + Math.random() * 900000)) : "");
    setUserEditorOpen(true);
  };

  const saveUser = (event) => {
    event.preventDefault();
    const user = {
      ...userForm,
      id: editingUser?.id || `USR-${Date.now()}`,
      contraseña_hash: editingUser?.contraseña_hash || "demo-hash-no-autenticable",
    };
    const nextUsers = editingUser ? users.map((item) => item.id === user.id ? user : item) : [user, ...users];
    saveAdminUsers(nextUsers);
    setUsers(nextUsers);
    setUserEditorOpen(false);
  };

  const toggleUserStatus = (user) => {
    const nextStatus = user.estado === "Activo" ? "Suspendido" : "Activo";
    openUserEditor({ ...user, estado: nextStatus });
  };

  const openRoleEditor = (role = null) => {
    setEditingRole(role);
    setRoleForm(role ? { nombre: role.nombre, salario: String(role.salario), funciones: role.funciones.join("\n") } : { nombre: "", salario: "", funciones: "" });
    setRoleEditorOpen(true);
  };

  const saveRole = (event) => {
    event.preventDefault();
    const role = { id: editingRole?.id || roleForm.nombre.trim().toLocaleLowerCase().replace(/\s+/g, "-"), nombre: roleForm.nombre.trim(), salario: Number(roleForm.salario), funciones: roleForm.funciones.split("\n").map((item) => item.trim()).filter(Boolean) };
    const nextRoles = editingRole ? roles.map((item) => item.id === role.id ? role : item) : [...roles, role];
    saveAdminRoles(nextRoles);
    setRoles(nextRoles);
    setRoleEditorOpen(false);
  };

  const deleteRole = (role) => {
    if (users.some((user) => user.id_rol === role.id)) {
      window.alert("No se puede eliminar un rol asignado a usuarios.");
      return;
    }
    if (!window.confirm(`¿Eliminar el rol ${role.nombre}?`)) return;
    const nextRoles = roles.filter((item) => item.id !== role.id);
    saveAdminRoles(nextRoles);
    setRoles(nextRoles);
  };

  const openAddressEditor = (address = null) => {
    setEditingAddress(address);
    setAddressForm(address ? { ...address } : { ...emptyAddress, id_usuario: users[0]?.id || "" });
    setAddressEditorOpen(true);
  };

  const saveAddress = (event) => {
    event.preventDefault();
    const address = { ...addressForm, id: editingAddress?.id || `DIR-${Date.now()}` };
    let nextAddresses = editingAddress ? addresses.map((item) => item.id === address.id ? address : item) : [...addresses, address];
    if (address.predeterminada) nextAddresses = nextAddresses.map((item) => item.id_usuario === address.id_usuario ? { ...item, predeterminada: item.id === address.id } : item);
    saveAdminAddresses(nextAddresses);
    setAddresses(nextAddresses);
    setAddressEditorOpen(false);
  };

  const deleteAddress = (address) => {
    if (!window.confirm("¿Eliminar esta dirección?")) return;
    const nextAddresses = addresses.filter((item) => item.id !== address.id);
    saveAdminAddresses(nextAddresses);
    setAddresses(nextAddresses);
  };

  return (
    <section className="mx-auto w-full flex flex-col gap-2.5 md:gap-5">
      <section className="w-full h-max lg:h-20 p-2.5 overflow-hidden border shadow-md bg-surface-alt border-border-gray rounded-3xl flex flex-row justify-between items-center">
        <article className="rounded-1xl size-10 lg:size-14 flex justify-center items-center shadow-md bg-accent">
          <svg className="size-7">
            <use xlinkHref="/sprite.svg#users" />
          </svg>
        </article>
        <span className="flex-1 px-2 font-bold transition-all duration-300">Usuarios</span>
        {activeTab === "Usuarios" &&
          <div className="flex flex-col gap-2 sm:flex-row">
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar" aria-label="Buscar usuarios"
              className="w-30 sm:min-w-56 border border-gray-300 bg-white p-1.5 md:px-3 md:py-2 rounded-2xl" />
            <button type="button" onClick={() => openUserEditor()}
              className="w-30 sm:min-w-56 bg-primary rounded-2xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
              p-1.5 md:px-4 md:py-2 font-semibold text-white">Agregar</button>
          </div>}
        {activeTab === "Roles" &&
          <button type="button" onClick={() => openRoleEditor()}
            className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
            px-2 py-1 md:px-4 md:py-2 font-semibold text-white">Agregar rol</button>}
        {activeTab === "Direcciones" &&
          <button type="button" onClick={() => openAddressEditor()}
            className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
            px-2 py-1 md:px-4 md:py-2 font-semibold text-white">Agregar dirección</button>}
      </section>

      <nav className="mb-2.5 md:mb-5 flex gap-2.5 md:gap-5 border-b border-gray-300" aria-label="Administración de usuarios">
        {tabs.map((tab) =>
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-1 pb-1.5 md:pb-3 text-sm font-semibold ${activeTab === tab ? "border-emerald-700 text-emerald-900" : "border-transparent text-gray-600 hover:text-gray-950"}`}>{tab}
          </button>
        )}
      </nav>

      {activeTab === "Usuarios" &&
        <div className="overflow-x-auto border-y border-gray-300">
          <table className="w-full min-w-[900px] text-left  text-[12px] md:text-sm">
            <thead className="bg-slate-100  text-[12px] md:text-xs uppercase text-gray-600">
              <tr>
                <th className="p-1.5 md:px-3 md:py-3">Usuario</th>
                <th className="p-1.5 md:px-3 md:py-3">Documento</th>
                <th className="p-1.5 md:px-3 md:py-3">Rol</th>
                <th className="p-1.5 md:px-3 md:py-3">Contacto</th>
                <th className="p-1.5 md:px-3 md:py-3">Ingreso</th>
                <th className="p-1.5 md:px-3 md:py-3">Estado</th>
                <th className="p-1.5 md:px-3 md:py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) =>
                <tr key={user.id}>
                  <td className="p-1.5 md:px-3 md:py-3">
                    <strong className="block">{user.nombre} {user.apellidos}</strong>
                    <span className="text-gray-500">{user.id}</span>
                  </td>
                  <td className="p-1.5 md:px-3 md:py-3">{user.tipo_de_documento} {user.numero_documento}</td>
                  <td className="p-1.5 md:px-3 md:py-3">{roles.find((role) => role.id === user.id_rol)?.nombre || user.id_rol}</td>
                  <td className="p-1.5 md:px-3 md:py-3">{user.correo}
                    <span className="block text-gray-500">{user.telefono}</span>
                  </td>
                  <td className="p-1.5 md:px-3 md:py-3">{user.fecha_de_ingreso}</td>
                  <td className="p-1.5 md:px-3 md:py-3">
                    <span className={user.estado === "Activo" ? "text-emerald-800" : "text-red-800"}>{user.estado}</span>
                  </td>
                  <td className="p-1.5 md:px-3 md:py-3">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => openUserEditor(user)} className="underline transition-all duration-300 
                        hover:scale-105 rounded-full hover:bg-black/50">
                        <svg className="size-7">
                          <use xlinkHref="/sprite.svg#edit" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => toggleUserStatus(user)} className="text-red-700 underline transition-all duration-300 
                        hover:scale-105 rounded-full hover:bg-red-700/50">
                        {user.estado === "Activo" ?
                          <svg className="size-7">
                            <use xlinkHref="/sprite.svg#userfail" />
                          </svg> :
                          <svg className="size-7">
                            <use xlinkHref="/sprite.svg#useractive" />
                          </svg>}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {filteredUsers.length === 0 &&
                <tr>
                  <td colSpan="7" className="px-3 py-10 text-center text-gray-600">No se encontraron usuarios.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>}

      {activeTab === "Roles" &&
        <div className="overflow-x-auto border-y border-gray-300">
          <table className="w-full min-w-[650px] text-left text-[12px] md:text-sm">
            <thead className="bg-slate-100 text-[12px] md:text-xs uppercase text-gray-600">
              <tr>
                <th className="p-1.5 md:px-3 md:py-3">Rol</th>
                <th className="p-1.5 md:px-3 md:py-3">Funciones</th>
                <th className="p-1.5 md:px-3 md:py-3">Salario mensual</th>
                <th className="p-1.5 md:px-3 md:py-3">Usuarios</th>
                <th className="p-1.5 md:px-3 md:py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {roles.map((role) =>
                <tr key={role.id}>
                  <td className="p-1.5 md:px-3 md:py-3 font-semibold">{role.nombre}</td>
                  <td className="p-1.5 md:px-3 md:py-3">{role.funciones.join(" · ")}</td>
                  <td className="p-1.5 md:px-3 md:py-3">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(role.salario)}</td>
                  <td className="p-1.5 md:px-3 md:py-3">{users.filter((user) => user.id_rol === role.id).length}</td>
                  <td className="p-1.5 md:px-3 md:py-3">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => openRoleEditor(role)} className="underline transition-all duration-300 
                        hover:scale-105 rounded-full hover:bg-black/50">
                        <svg className="size-7">
                          <use xlinkHref="/sprite.svg#edit" />
                        </svg>
                      </button>
                      <button type="button" onClick={() => deleteRole(role)} className="text-red-700 underline transition-all duration-300 
                        hover:scale-105 rounded-full hover:bg-red-700/50">
                        <svg className="size-7">
                          <use xlinkHref="/sprite.svg#delete" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      }

      {activeTab === "Direcciones" &&
        <>
          <p className="mb-3 text-[12px] md:text-sm text-gray-600">Las direcciones de entrega pertenecen al usuario; los clientes deben actualizar sus direcciones desde su cuenta web.</p>
          <div className="overflow-x-auto border-y border-gray-300">
            <table className="w-full min-w-[760px] text-left text-[12px] md:text-sm">
              <thead className="bg-slate-100 text-[12px] md:text-xs uppercase text-gray-600">
                <tr>
                  <th className="p-1.5 md:px-3 md:py-3">Usuario</th>
                  <th className="p-1.5 md:px-3 md:py-3">Dirección</th>
                  <th className="p-1.5 md:px-3 md:py-3">Ciudad</th>
                  <th className="p-1.5 md:px-3 md:py-3">Predeterminada</th>
                  <th className="p-1.5 md:px-3 md:py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {addresses.map((address) => {
                  const owner = users.find((user) => user.id === address.id_usuario);
                  return <tr key={address.id}>
                    <td className="p-1.5 md:px-3 md:py-3">{owner ? `${owner.nombre} ${owner.apellidos}` : address.id_usuario}</td>
                    <td className="p-1.5 md:px-3 md:py-3">
                      {address.tipo_de_via} {address.numero_de_via}, {address.numero_de_vivienda}
                      <span className="block text-gray-500">{address.barrio}, {address.localidad}</span>
                    </td>
                    <td className="p-1.5 md:px-3 md:py-3">{address.ciudad}</td>
                    <td className="p-1.5 md:px-3 md:py-3">{address.predeterminada ? "Sí" : "No"}</td>
                    <td className="p-1.5 md:px-3 md:py-3">
                      <div className="flex gap-3">
                        <button type="button" onClick={() => openAddressEditor(address)} className="underline transition-all duration-300 
                          hover:scale-105 rounded-full hover:bg-black/50">
                          <svg className="size-7">
                            <use xlinkHref="/sprite.svg#edit" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => deleteAddress(address)} className="text-red-700 underline transition-all duration-300 
                          hover:scale-105 rounded-full hover:bg-red-700/50">
                          <svg className="size-7">
                            <use xlinkHref="/sprite.svg#delete" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </>
      }

      {userEditorOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6"
          onClick={(event) => { if (event.target === event.currentTarget) setUserEditorOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-editor-title"
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7 rounded-3xl">
            <h2 id="user-editor-title" className="mb-4 text-xl font-bold">{editingUser ? "Editar usuario" : "Agregar usuario"}</h2>
            {editingUser && !verified ?
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Se generó un código de autorización de demostración para <strong>{editingUser.correo}</strong>. En producción se enviaría por correo.</p>
                <p className="border border-amber-300 bg-amber-50 p-3 text-sm">Código simulado: <strong className="font-mono tracking-widest">{verificationCode}</strong></p>
                <label className="block text-sm font-medium">Código de verificación
                  <input inputMode="numeric" value={enteredCode} onChange={(event) => setEnteredCode(event.target.value)}
                    className="mt-1 w-full border border-gray-300 p-2" />
                </label>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setUserEditorOpen(false)} className="border border-gray-400 px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 
                    hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
                  <button type="button" onClick={() => setVerified(enteredCode === verificationCode)}
                    className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                    px-4 py-2 font-semibold text-white">Verificar código</button>
                </div>
                {enteredCode && enteredCode !== verificationCode &&
                  <p role="alert" className="text-sm text-red-700">El código no coincide.</p>}
              </div> :
              <form onSubmit={saveUser} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[["nombre", "Nombre"], ["apellidos", "Apellidos"], ["numero_documento", "Número de documento"], ["correo", "Correo"], ["telefono", "Teléfono"]].map(([key, label]) =>
                    <label key={key} className="text-sm font-medium">{label}
                      <input required type={key === "correo" ? "email" : "text"} value={userForm[key] || ""} onChange={(event) => setUserForm({ ...userForm, [key]: event.target.value })}
                        className="mt-1 w-full border border-gray-300 p-2" />
                    </label>
                  )}
                  <label className="text-sm font-medium">Tipo de documento
                    <select value={userForm.tipo_de_documento} onChange={(event) => setUserForm({ ...userForm, tipo_de_documento: event.target.value })}
                      className="mt-1 w-full border border-gray-300 p-2">
                      <option>CC</option>
                      <option>CE</option>
                      <option>TI</option>
                      <option>Pasaporte</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">Fecha de nacimiento
                    <input type="date" value={userForm.fecha_de_nacimiento || ""} onChange={(event) => setUserForm({ ...userForm, fecha_de_nacimiento: event.target.value })}
                      className="mt-1 w-full border border-gray-300 p-2" />
                  </label>
                  <label className="text-sm font-medium">Rol
                    <select value={userForm.id_rol} onChange={(event) => setUserForm({ ...userForm, id_rol: event.target.value })}
                      className="mt-1 w-full border border-gray-300 p-2">
                      {roles.map((role) =>
                        <option key={role.id} value={role.id}>{role.nombre}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium">Fecha de ingreso
                    <input type="date" value={userForm.fecha_de_ingreso} onChange={(event) => setUserForm({ ...userForm, fecha_de_ingreso: event.target.value })}
                      className="mt-1 w-full border border-gray-300 p-2" />
                  </label>
                  {editingUser &&
                    <label className="text-sm font-medium">Estado
                      <select value={userForm.estado} onChange={(event) => setUserForm({ ...userForm, estado: event.target.value })}
                        className="mt-1 w-full border border-gray-300 p-2">
                        <option>Activo</option>
                        <option>Suspendido</option>
                        <option>Inactivo</option>
                      </select>
                    </label>
                  }
                </div>
                <p className="text-xs text-gray-500">La contraseña se conserva como hash de demostración y nunca se muestra en esta pantalla.</p>
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                  <button type="button" onClick={() => setUserEditorOpen(false)} className="border border-gray-400 px-2 py-1 md:px-4 md:py-2 rounded-xl hover:shadow-md transition-all duration-300 
                    hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
                  <button type="submit" className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                    px-2 py-1 md:px-4 md:py-2 font-semibold text-white">Guardar usuario</button>
                </div>
              </form>
            }
          </section>
        </div>, document.body
      )}

      {roleEditorOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
          onClick={(event) => { if (event.target === event.currentTarget) setRoleEditorOpen(false); }}>
          <form onSubmit={saveRole} className="w-full max-w-lg space-y-4 bg-white p-6 shadow-2xl rounded-3xl">
            <h2 className="text-xl font-bold">{editingRole ? "Editar rol" : "Nuevo rol"}</h2>
            <label className="block text-sm font-medium">Nombre
              <input required value={roleForm.nombre} onChange={(event) => setRoleForm({ ...roleForm, nombre: event.target.value })}
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <label className="block text-sm font-medium">Salario mensual COP
              <input required min="0" type="number" value={roleForm.salario} onChange={(event) => setRoleForm({ ...roleForm, salario: event.target.value })}
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <label className="block text-sm font-medium">Funciones, una por línea
              <textarea required rows="4" value={roleForm.funciones} onChange={(event) => setRoleForm({ ...roleForm, funciones: event.target.value })}
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setRoleEditorOpen(false)} className="border border-gray-400 px-2 py-1 md:px-4 md:py-2 rounded-xl hover:shadow-md transition-all duration-300 
                hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
              <button type="submit" className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                px-2 py-1 md:px-4 md:py-2 font-semibold text-white">Guardar rol</button>
            </div>
          </form>
        </div>, document.body
      )}

      {addressEditorOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
          onClick={(event) => { if (event.target === event.currentTarget) setAddressEditorOpen(false); }}>
          <form onSubmit={saveAddress} className="max-h-[90dvh] w-full max-w-xl space-y-3 overflow-y-auto bg-white p-6 shadow-2xl rounded-3xl">
            <h2 className="text-xl font-bold">{editingAddress ? "Editar dirección" : "Nueva dirección"}</h2>
            <label className="block text-sm font-medium">Usuario
              <select required value={addressForm.id_usuario} onChange={(event) => setAddressForm({ ...addressForm, id_usuario: event.target.value })}
                className="mt-1 w-full border border-gray-300 p-2">
                {users.map((user) =>
                  <option key={user.id} value={user.id}>{user.nombre} {user.apellidos}</option>)}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {[["ciudad", "Ciudad"], ["localidad", "Localidad"], ["barrio", "Barrio"], ["numero_de_via", "Número de vía"], ["numero_de_vivienda", "Número de vivienda"], ["complemento", "Complemento"]].map(([key, label]) =>
                <label key={key} className="text-sm font-medium">{label}
                  <input required={key !== "complemento"} value={addressForm[key] || ""} onChange={(event) => setAddressForm({ ...addressForm, [key]: event.target.value })}
                    className="mt-1 w-full border border-gray-300 p-2" />
                </label>
              )}
            </div>
            <label className="block text-sm font-medium">Tipo de vía
              <select value={addressForm.tipo_de_via} onChange={(event) => setAddressForm({ ...addressForm, tipo_de_via: event.target.value })}
                className="mt-1 w-full border border-gray-300 p-2">
                <option>Calle</option>
                <option>Carrera</option>
                <option>Avenida</option>
                <option>Diagonal</option>
                <option>Transversal</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(addressForm.predeterminada)} onChange={(event) => setAddressForm({ ...addressForm, predeterminada: event.target.checked })} />
              Dirección predeterminada
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setAddressEditorOpen(false)} className="border border-gray-400 px-2 py-1 md:px-4 md:py-2 rounded-xl hover:shadow-md transition-all duration-300 
                hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
              <button type="submit" className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                px-2 py-1 md:px-4 md:py-2 font-semibold text-white">Guardar dirección</button>
            </div>
          </form>
        </div>, document.body
      )}
    </section>
  );
}