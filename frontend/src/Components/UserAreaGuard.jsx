import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function UserAreaGuard({ children }){
  const { user, token, loading, initializing } = useContext(AuthContext);
  if (loading || initializing) return <div>Loading session...</div>;
  // If not logged in or no user, allow public access to these pages
  if (!token || !user) return children;
  // If logged in but not a normal USER, send to dashboard (prevent ADMIN/SUPERADMIN from using USER-only area)
  if (user.role && user.role !== 'USER') return <Navigate to="/dashboard" replace />;
  return children;
}
