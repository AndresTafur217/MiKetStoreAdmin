import { useEffect } from "react";
import { isEmployeeRole } from "../data/adminData";
import { logoutDemoUser } from "../data/catalog";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Login } from "../Login";

/** Bloquea toda la app hasta que inicie sesión un empleado. */
export function RequireEmployeeAuth({ children }) {
  const user = useCurrentUser();

  useEffect(() => {
    if (user && !isEmployeeRole(user.id_rol)) {
      logoutDemoUser();
    }
  }, [user]);

  if (!user || !isEmployeeRole(user.id_rol)) {
    return <Login />;
  }

  return children;
}
