// frontend/src/pages/RegisterPage.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function RegisterPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apiErrors, setApiErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErrors([]);

    // Validar en frontend que password y confirmPassword coincidan
    if (password !== confirmPassword) {
      setApiErrors(['Las contraseñas no coinciden.']);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/register`,
        { email, password, nombre }
      );
      login(res.data.token);
      navigate('/');
    } catch (error) {
      console.error('Error en registro:', error);
      if (error.response && error.response.data.errors) {
        setApiErrors(error.response.data.errors.map((e) => e.msg));
      } else {
        setApiErrors(['Error inesperado al registrar.']);
      }
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Crear Cuenta</h2>

      {apiErrors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <ul className="list-disc pl-5 space-y-1">
            {apiErrors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-medium mb-1">Nombre (opcional):</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="ejemplo@dominio.com"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="******"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Confirmar Contraseña:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="******"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 px-4 py-2 bg-btn-success text-white rounded hover:bg-btn-success/90 disabled:opacity-50"
        >
          {loading ? 'Registrando…' : 'Crear Cuenta'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-btn-primary underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
