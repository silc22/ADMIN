import React from 'react';

function BudgetItem({ presupuesto }) {
  const { titulo, descripcion, monto, fechaCreacion, estado, cliente } = presupuesto;
  const fecha = new Date(fechaCreacion).toLocaleDateString('es-ES');

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h3>{titulo}</h3>
      <p>{cliente}</p>
      <p>{descripcion}</p>
      <p><strong>Monto:</strong> € {monto.toFixed(2)}</p>
      <p><small>Creado el: {fecha}</small></p>
      <p><strong>Estado:</strong> {estado}</p>
      {/* En un futuro, botones para “Editar” o “Eliminar” */}
    </div>
  );
}

export default BudgetItem;
