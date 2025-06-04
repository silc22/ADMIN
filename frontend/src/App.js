// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewBudgetPage from './pages/NewBudgetPage';
import EditBudgetPage from './pages/EditBudgetPage'; 

function App() {
  return (
    <Router>
      <nav className="bg-white dark:bg-gray-800 p-2">
        <Link to="/" class="text-gray-900 dark:text-white m-2">Inicio</Link>
        <Link to="/nuevo-presupuesto" class="text-gray-900 dark:text-white m-2">Nuevo Presupuesto</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nuevo-presupuesto" element={<NewBudgetPage />} />
        <Route path="/editar-presupuesto/:id" element={<EditBudgetPage />} /> 
        {/* Agregar nueva ruta */}
      </Routes>
    </Router>
  );
}

export default App;


