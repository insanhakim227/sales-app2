
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

export default function ProtectedRoute({ roles }) {
  const { user, token, loading, initializing } = useContext(AuthContext);

  // Tampilkan loading jika context masih loading/initializing
  if (loading || initializing) return <div>Loading session...</div>;

  // Setelah context siap, baru cek autentikasi
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}
