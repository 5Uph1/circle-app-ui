import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { isTokenExpired } from "./tokenUtils";
import { logout } from "@/store/authSlice";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      dispatch(logout());
    }
  }, [token]);

  if (!token || isTokenExpired(token)) return <Navigate to="/login" replace />;

  return children;
}
