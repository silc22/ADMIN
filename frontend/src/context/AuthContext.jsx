import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al montar, si hay token, intentar obtener datos de usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      if (token) {
        try {
          const res = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setUsuario(res.data.usuario);
        } catch (err) {
          console.error('Token inválido o expirado', err);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setCargando(false);
    };
    fetchUsuario();
  }, [token]);

  // Función para iniciar sesión: guardar token en state y localStorage
  const login = (nuevoToken) => {
    localStorage.setItem('token', nuevoToken);
    setToken(nuevoToken);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};
