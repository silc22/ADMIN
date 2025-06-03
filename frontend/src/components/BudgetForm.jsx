// src/components/BudgetForm.jsx
import React, { useState, useEffect } from 'react';

function BudgetForm({ onSubmit, isSubmitting, initialData = null }) {
  // Inicialmente, si no hay initialData definimos todos los estados vacíos
  const [titulo, setTitulo] = useState('');
  const [cliente, setCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [file, setFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);

  // Este useEffect solo corre si initialData es un objeto con datos
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTitulo(initialData.titulo || '');
      setCliente(initialData.cliente || '');
      setDescripcion(initialData.descripcion || '');
      setMonto(initialData.monto !== undefined ? initialData.monto : '');
      setEstado(initialData.estado || 'pendiente');
      setFile(null);
      setRemoveFile(false);
    }
    // Solo se dispara cuando initialData cambia (p. ej. al cargar los datos desde el backend)
  }, [initialData]);

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!titulo.trim() || !cliente.trim() || monto === '' || monto < 0) {
      alert('El título, el cliente y el monto (>=0) son obligatorios');
      return;
    }
    const data = { titulo, cliente, descripcion, monto: Number(monto), estado, removeFile };
    // Pasamos data y el objeto file (puede ser null)
    onSubmit(data, file);
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
        <select
          value={estado}
          onChange={e => setEstado(e.target.value)}
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
      </div>

      {/* Input de archivo */}
      <div>
        <label>Archivo adjunto (opcional):</label><br />
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={e => {
            setFile(e.target.files[0] || null);
            // Si selecciona un archivo nuevo, anulamos el removeFile
            if (e.target.files[0]) setRemoveFile(false);
          }}
          disabled={removeFile} // si marca “Eliminar”, deshabilita subir nuevo
        />
        {/* Enlace al archivo actual */}
        {initialData && initialData.archivo && initialData.archivo.url && (
          <>
            <p>
              Archivo actual:{' '}
              <a
                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${initialData.archivo.url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {initialData.archivo.originalName || 'Descargar'}
              </a>
            </p>
            {/* Checkbox para eliminar */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={removeFile}
                onChange={e => {
                  setRemoveFile(e.target.checked);
                  // Si decide eliminar, limpiar cualquier file seleccionado
                  if (e.target.checked) setFile(null);
                }}
              />
              Eliminar archivo actual
            </label>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '0.75rem',
          border: 'none',
          borderRadius: '4px',
          background: '#007bff',
          color: '#fff',
          cursor: isSubmitting ? 'not-allowed' : 'pointer'
        }}
      >
        {isSubmitting ? 'Guardando…' : 'Guardar Presupuesto'}
      </button>
    </form>
  );
}

export default BudgetForm;
