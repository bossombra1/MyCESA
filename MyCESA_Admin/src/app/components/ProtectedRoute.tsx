import { Navigate, Outlet, useLocation } from 'react-router';

export default function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  try {
    const parsedUser = JSON.parse(user);
    if (parsedUser.Id_ROLE !== 1 && parsedUser.Lib_Role !== 'Administrateur') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
