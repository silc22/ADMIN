// src/components/BudgetList.jsx
import React, { useEffect, useState } from 'react';
import { getPresupuestos } from '../api/presupuestoApi';
import BudgetItem from './BudgetItem';

function BudgetList() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Nuevo estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para saber si actualmente se está haciendo una búsqueda (opcional)
  const [buscando, setBuscando] = useState(false);

  // --- Función que consulta la API, recibiendo opcionalmente un texto de búsqueda ---
  const fetchPresupuestos = async (query = '') => {
    try {
      setError(null);
      if (query.trim() !== '') {
        setBuscando(true);
      } else {
        setCargando(true);
      }

      // Llamamos a la API pasándole la query como ?q=…
      const respuesta = await getPresupuestos(query);
      setPresupuestos(respuesta.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar presupuestos');
    } finally {
      setCargando(false);
      setBuscando(false);
    }
  };

  // Al montar el componente, cargamos sin filtro
  useEffect(() => {
    fetchPresupuestos();
  }, []);

  // Manejador para el formulario de búsqueda
  const handleBuscar = (e) => {
    e.preventDefault();
    // Disparamos la consulta con el término actual
    fetchPresupuestos(searchTerm);
  };

  return (
    <div>
      {/* --------------------------------------------------------- */}
      {/* 1) Formulario de búsqueda */}
      <form onSubmit={handleBuscar} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar presupuesto por título, cliente o descripción…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            width: '70%',
            marginRight: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.55rem 1rem',
            border: 'none',
            background: '#28a745',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {buscando ? 'Buscando…' : 'Buscar'}
        </button>
        {/* Botón para limpiar búsqueda y volver a todos */}
        {searchTerm.trim() !== '' && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              fetchPresupuestos(''); // recargar todos sin filtro
            }}
            style={{
              marginLeft: '0.5rem',
              padding: '0.55rem 1rem',
              border: 'none',
              background: '#6c757d',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Limpiar
          </button>
        )}
      </form>

      {/* --------------------------------------------------------- */}
      {/* 2) Mensajes de carga/​error */}
      {cargando && !buscando && <p>Cargando presupuestos…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --------------------------------------------------------- */}
      {/* 3) Mostrar lista filtrada (o vacía si no hay resultados) */}
      {!cargando && presupuestos.length === 0 && (
        <p>No se encontraron presupuestos {searchTerm.trim() ? `para “${searchTerm}”` : ''}.</p>
      )}
      {!cargando && presupuestos.length > 0 && (
        <div>
         {presupuestos.map((presupuesto) => (
          <BudgetItem
            key={presupuesto._id}
            presupuesto={presupuesto}
            onEliminar={() => {
              // Después de borrar, recargamos sin filtro actual
              // (o podrías recargar 'searchTerm' si quieres mantener la búsqueda activa).
              fetchPresupuestos(searchTerm);
            }}
          />
        ))}
        </div>
      )}
    </div>
  );
}

export default BudgetList;
