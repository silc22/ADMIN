import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {useContext} from 'react';
import HomePage from './pages/HomePage';
import NewBudgetPage from './pages/NewBudgetPage';
import EditBudgetPage from './pages/EditBudgetPage'; 
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthContext } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import DetailBudgetPage from './pages/DetailBudgetPage';
import { LogOut } from 'lucide-react';

function App() {
  const { token,usuario, logout  } = useContext(AuthContext);


 return (
    <Router>
      <nav className="fixed w-full border-b-2 bg-gray-600 border-gray-600 p-4 drop-shadow-lg flex flex-col sm:flex-row sm:justify-between items-center space-y-2 sm:space-y-0">
        <Link to="/" className="font-bold text-xl pl-4">AD</Link>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {token ? (
            <>
              {/* Solo mostrar “Administración” si el rol es admin */}
              {usuario?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Administración
                </Link>
              )}

              <Link
                to="/presupuestos/nuevo"
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Nuevo Presupuesto
              </Link>

              <span className="pl-5">
                {usuario?.nombre || usuario?.email}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                 <LogOut />
              </button>
            </>
          ) : (
             <>
              <Link
                to="/login"
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />

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

          <Route 
            path="/presupuestos/:id" 
            element={<DetailBudgetPage />} 
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;


