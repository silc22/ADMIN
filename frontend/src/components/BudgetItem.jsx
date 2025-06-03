// frontend/src/components/BudgetItem.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { eliminarPresupuesto } from '../api/presupuestoApi';

function BudgetItem({ presupuesto, onEliminar }) {
  const navigate = useNavigate();
  const { _id, titulo, cliente, descripcion, monto, estado, fechaCreacion, archivo } = presupuesto;
  const fecha = new Date(fechaCreacion).toLocaleDateString('es-ES');

  // Función que se ejecuta al pulsar "Eliminar"
   const handleEliminar = async () => {
    const confirmacion = window.confirm('¿Está seguro de que desea eliminar este presupuesto?');
    if (!confirmacion) return;
    try {
      await eliminarPresupuesto(_id);
      if (onEliminar) onEliminar();
    } catch (error) {
      console.error(error);
      alert('Hubo un error al eliminar el presupuesto');
    }
  };

  // Función para ir a la página de edición
  const handleEditar = () => {
    navigate(`/editar-presupuesto/${_id}`);
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h3>{titulo}</h3>
      <p><strong>Cliente:</strong> {cliente}</p>
      <p>{descripcion}</p>
      <p><strong>Monto:</strong> € {monto.toFixed(2)}</p>
      <p><strong>Estado:</strong> {estado}</p>
      <p><small>Creado el: {fecha}</small></p>

      {/* Si existe un archivo adjunto, mostrar enlace */}
      {archivo && archivo.url && (
        <p>
          <strong>Adjunto:</strong>{' '}
          <a
            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${archivo.url}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {archivo.originalName || 'Descargar archivo'}
          </a>
        </p>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleEditar}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Editar
        </button>

        <button
          onClick={handleEliminar}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: '#dc3545',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default BudgetItem;
