import { useCallback, useEffect, useRef, useState } from "react";
import { demoUser, getCurrentUser, loginDemoUser } from "../data/catalog";
import { AuthModalContext } from "./AuthModalContext";

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(demoUser.email);
  const [password, setPassword] = useState(demoUser.password);
  const [error, setError] = useState("");
  const pendingAction = useRef(null);

  const requestLogin = useCallback((action = {}) => {
    if (getCurrentUser()) {
      action.onSuccess?.();
      return;
    }

    pendingAction.current = action;
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setError("");
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    const action = pendingAction.current;
    pendingAction.current = null;
    setIsOpen(false);
    action?.onCancel?.();
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = loginDemoUser(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    const action = pendingAction.current;
    pendingAction.current = null;
    setIsOpen(false);
    action?.onSuccess?.();
  };

  return (
    <AuthModalContext.Provider value={{ requestLogin }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="login-title" className="w-full max-w-md bg-white p-6 shadow-2xl sm:p-8 rounded-1xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">MiKet Store</p>
                <h2 id="login-title" className="mt-1 text-2xl font-bold">Iniciar sesión</h2>
                <p className="mt-1 text-sm text-gray-600">Solo empleados</p>
              </div>
              <button type="button" aria-label="Cerrar ventana de inicio de sesión" onClick={closeModal} className="size-9 flex justify-center items-center hover:scale-105 hover:border hover:border-gray-300 text-xl leading-none hover:bg-gray-100 rounded-full">
                <svg className="size-5">
                  <use xlinkHref="/sprite.svg#xmark" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="modal-login-email">
                Correo electrónico
                <input id="modal-login-email" type="email" autoComplete="username" autoFocus required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-800" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="modal-login-password">
                Contraseña
                <input id="modal-login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-800" />
              </label>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button type="submit" className="mt-1 w-full px-4 py-3 font-semibold border rounded-1xl border-border-gray hover:bg-gray-100 hover:scale-105">Iniciar sesión</button>
            </form>
          </section>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}
