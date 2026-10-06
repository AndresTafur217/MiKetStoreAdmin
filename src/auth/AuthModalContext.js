import { createContext, useContext } from "react";

export const AuthModalContext = createContext(null);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error("useAuthModal debe usarse dentro de AuthModalProvider");
  return context;
}