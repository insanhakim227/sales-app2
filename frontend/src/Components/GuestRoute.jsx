import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const GuestRoute = ({ children }) => {
  const { user, initializing } = useContext(AuthContext);

  if (initializing) return <div>Loading session...</div>;
  if (user) {
    // Redirect sesuai role
    if (["ADMIN", "SUPERADMIN", "RESELLER", "KURIR"].includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
    // Default USER ke halaman utama
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;