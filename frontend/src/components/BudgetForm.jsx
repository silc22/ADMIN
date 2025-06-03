import React, { useState } from 'react';

function BudgetForm({ onSubmit, isSubmitting, initialData = {} }) {
  const [titulo, setTitulo] = useState(initialData.titulo || '');
  const [cliente, setCliente] = useState(initialData.cliente || '');
  const [descripcion, setDescripcion] = useState(initialData.descripcion || '');
  const [monto, setMonto] = useState(initialData.monto || '');
  const [estado, setEstado] = useState(initialData.estado || 'pendiente');

  const manejarSubmit = (e) => {
    e.preventDefault();
    // Validar campos mínimos
    if (!titulo.trim() || !monto) {
      alert('El título, cliente y el monto son obligatorios');
      return;
    }
    const data = { titulo,  cliente, descripcion, monto: Number(monto), estado };
    onSubmit(data);
  };

  return (
    <form onSubmit={manejarSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label>Título:</label><br />
        <input
          type="text"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <div>
        <label>Cliente:</label><br />
        <input
          type="text"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <div>
        <label>Descripción:</label><br />
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <div>
        <label>Monto (€):</label><br />
        <input
          type="number"
          value={monto}
          onChange={e => setMonto(e.target.value)}
          required
          min="0"
          step="0.01"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      <div>
        <label>Estado:</label><br />
        <select value={estado} onChange={e => setEstado(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>

      <button type="submit" disabled={isSubmitting} style={{
        padding: '0.75rem',
        border: 'none',
        borderRadius: '4px',
        background: '#007bff',
        color: '#fff',
        cursor: isSubmitting ? 'not-allowed' : 'pointer'
      }}>
        {isSubmitting ? 'Guardando…' : 'Guardar Presupuesto'}
      </button>
    </form>
  );
}

export default BudgetForm;
