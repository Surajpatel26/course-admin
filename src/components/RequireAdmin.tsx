import { Navigate } from 'react-router-dom';
import { getAdminUser, getAdminToken } from '../lib/auth';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const token = getAdminToken();
  const user = getAdminUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

