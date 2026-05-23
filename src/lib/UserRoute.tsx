import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Navigate } from "react-router-dom";

export default function UserRoute({ children }: { children: React.ReactNode }) {
    const token = useSelector((state: RootState) => state.auth.token);

    if (token) return <Navigate to="/" replace />;

    return children;
}
