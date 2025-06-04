import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { token, cargando } = useContext(AuthContext);

  if (cargando) {
    // Mientras validamos el token (llamada a /auth/me), podemos mostrar “Cargando…”.
    return <p>Cargando…</p>;
  }

  // Si no hay token, redirigimos a /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token válido, renderizamos el componente “hijo”
  return children;
}

export default PrivateRoute;
