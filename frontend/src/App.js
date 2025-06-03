// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewBudgetPage from './pages/NewBudgetPage';

function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', background: '#f0f0f0' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Inicio</Link>
        <Link to="/nuevo-presupuesto">Nuevo Presupuesto</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nuevo-presupuesto" element={<NewBudgetPage />} />
        {/* Podrías añadir rutas para editar, ver detalle, etc. */}
      </Routes>
    </Router>
  );
}

export default App;

