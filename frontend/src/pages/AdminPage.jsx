// frontend/src/pages/AdminPage.jsx
import { useEffect, useState } from 'react';
import apiClient from '../api/axiosConfig';

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsuarios = async () => {
    try {
      setError(null);
      const res = await apiClient.get('/users');
      setUsuarios(res.data.data); // recuerda que la API devuelve { data: usuarios }
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChangeRole = async (id, newRole) => {
    try {
      await apiClient.put(`/users/${id}/role`, { role: newRole });
      fetchUsuarios(); // recargar lista tras cambio
    } catch (err) {
      console.error('Error al actualizar rol:', err);
      alert('No se pudo actualizar el rol.');
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      fetchUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('No se pudo eliminar el usuario.');
    }
  };

  if (loading) return <p>Cargando usuarios…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 pt-16">
      <h2 className="text-2xl font-bold mb-4">Panel de Administrador</h2>

      {usuarios.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="dark:text-gray-600 bg-gray-200">
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Rol</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u._id} className="hover:bg-gray-100 hover:text-gray-600 text-center">
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1 ">{u.nombre || '—'}</td>
                <td className="border px-2 py-1 ">
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u._id, e.target.value)}
                    className="border rounded px-1 py-0.5"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="border px-2 py-1">
                  <button
                    onClick={() => handleEliminarUsuario(u._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

