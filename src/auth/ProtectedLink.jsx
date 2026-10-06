import { Link, useNavigate } from "react-router-dom";
import { useAuthModal } from "./AuthModalContext";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function ProtectedLink({ to, onClick, children, ...props }) {
  const user = useCurrentUser();
  const { requestLogin } = useAuthModal();
  const navigate = useNavigate();

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || user) return;
    event.preventDefault();
    requestLogin({ onSuccess: () => navigate(to) });
  };

  return <Link to={to} onClick={handleClick} {...props}>{children}</Link>;
}