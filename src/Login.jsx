import { useState } from "react";
import { demoUser, loginDemoUser } from "./data/catalog";

export function Login() {
  const [email, setEmail] = useState(demoUser.email);
  const [password, setPassword] = useState(demoUser.password);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = loginDemoUser(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
  };

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-primary-dark p-4">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <svg className="h-16 w-16" aria-hidden="true">
            <use xlinkHref="/sprite.svg#miketicon" />
          </svg>
          <div>
            <p className="text-sm text-gray-500">MiKet Store Admin</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-950">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-gray-600">Acceso exclusivo para empleados</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="login-email">
            Correo electrónico
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              autoFocus
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="login-password">
            Contraseña
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-gray-800"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            className="mt-1 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-primary/90"
          >
            Entrar al panel
          </button>
        </form>
      </section>
    </div>
  );
}
