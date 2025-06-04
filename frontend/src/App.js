import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {useContext} from 'react';
import HomePage from './pages/HomePage';
import NewBudgetPage from './pages/NewBudgetPage';
import EditBudgetPage from './pages/EditBudgetPage'; 
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './context/AuthContext';

function App() {
  const { token, logout, usuario } = useContext(AuthContext);


 return (
    <Router>
      <nav className="bg-gray-100 p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">Presupuestos</Link>
        <div className="flex items-center space-x-4">
          {token ? (
            <>
              <span className="text-gray-700">Hola, {usuario?.nombre || usuario?.email}</span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1 bg-btn-primary text-white rounded hover:bg-btn-primary/90">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="px-3 py-1 bg-btn-success text-white rounded hover:bg-btn-success/90">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Rutas protegidas: crear y editar presupuestos */}
          <Route
            path="/presupuestos/nuevo"
            element={
              <PrivateRoute>
                <NewBudgetPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/presupuestos/editar/:id"
            element={
              <PrivateRoute>
                <EditBudgetPage />
              </PrivateRoute>
            }
          />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Ruta de fallback: si no coincide, redirigir a "/" */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;


