import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { token, usuario, cargando } = useContext(AuthContext);

  if (cargando) return <p>Cargando…</p>;

  if (!token || !usuario || usuario.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
