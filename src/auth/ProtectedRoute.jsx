import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthModal } from "./AuthModalContext";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function ProtectedRoute({ children }) {
  const user = useCurrentUser();
  const { requestLogin } = useAuthModal();
  const navigate = useNavigate();
  const hadSession = useRef(Boolean(user));

  useEffect(() => {
    if (!user && !hadSession.current) {
      requestLogin({ onCancel: () => navigate("/", { replace: true }) });
    }
    hadSession.current = Boolean(user);
  }, [navigate, requestLogin, user]);

  return user ? children : null;
}