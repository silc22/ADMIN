// src/components/BudgetForm.jsx
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

function BudgetForm({ onSubmit, isSubmitting, initialData = null }) {
  // Inicialmente, si no hay initialData definimos todos los estados vacíos
  const [titulo, setTitulo] = useState('');
  const [cliente, setCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [importe, setImporte] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [file, setFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  
  const [errors, setErrors] = useState({
  titulo: '',
  cliente: '',
  descripcion: '',
  importe: '',
  estado: '',
  archivo: ''
});

  // Este useEffect solo corre si initialData es un objeto con datos
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTitulo(initialData.titulo || '');
      setCliente(initialData.cliente || '');
      setDescripcion(initialData.descripcion || '');
      setImporte(initialData.importe !== undefined ? initialData.importe : '');
      setEstado(initialData.estado || 'pendiente');
      setFile(null);
      setRemoveFile(false);
       setErrors({
        titulo: '',
        cliente: '',
        descripcion: '',
        importe: '',
        estado: '',
        archivo: ''
      });
    }
    // Solo se dispara cuando initialData cambia (p. ej. al cargar los datos desde el backend)
  }, [initialData]);

  // Validadores
  const validators = {
    titulo: (value) => {
      // Si no escribe nada, sigue siendo válido
    if (!value || value.trim() === '') return '';
    if (value.trim().length < 2) return 'El título debe tener al menos 2 caracteres.';
    if (value.trim().length > 100) return 'El título no puede superar 100 caracteres.';
    return '';
    },
    cliente: (value) => {
      if (!value || !value.trim()) return 'El cliente es obligatorio.';
      if (value.trim().length < 3) return 'El cliente debe tener al menos 3 caracteres.';
      return '';
    },
    descripcion: (value) => {
      if (!value) return '';
      if (value.length > 500) return 'La descripción no puede superar 500 caracteres.';
      return '';
    },
    importe: (value) => {
      if (value === '' || value === null) return 'El importe es obligatorio.';
      const num = Number(value);
      if (isNaN(num)) return 'El importe debe ser un número válido.';
      if (num < 0) return 'El importe no puede ser negativo.';
      return '';
    },
    estado: (value) => {
      const opciones = ['pendiente', 'aprobado', 'rechazado'];
      if (!opciones.includes(value)) return 'Estado inválido.';
      return '';
    },
    archivo: (fileObj) => {
      if (!fileObj) return '';
      const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowed.includes(fileObj.type)) {
        return 'Sólo se permiten PDF, JPG o PNG.';
      }
      const maxBytes = 5 * 1024 * 1024;
      if (fileObj.size > maxBytes) {
        return 'El archivo supera 5 MB.';
      }
      return '';
    }
  };

  // Manejadores de cambio de cada campo (validan en tiempo real)
  const handleTituloChange = (e) => {
    const value = e.target.value;
    setTitulo(value);
    setErrors((prev) => ({
      ...prev,
      titulo: validators.titulo(value)
    }));
  };

  const handleClienteChange = (e) => {
    const value = e.target.value;
    setCliente(value);
    setErrors((prev) => ({
      ...prev,
      cliente: validators.cliente(value)
    }));
  };

  const handleDescripcionChange = (e) => {
    const value = e.target.value;
    setDescripcion(value);
    setErrors((prev) => ({
      ...prev,
      descripcion: validators.descripcion(value)
    }));
  };

  const handleImporteChange = (e) => {
    const value = e.target.value;
    setImporte(value);
    setErrors((prev) => ({
      ...prev,
      importe: validators.importe(value)
    }));
  };

  const handleEstadoChange = (e) => {
    const value = e.target.value;
    setEstado(value);
    setErrors((prev) => ({
      ...prev,
      estado: validators.estado(value)
    }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0] || null;
    setFile(selected);
    setErrors((prev) => ({
      ...prev,
      archivo: validators.archivo(selected)
    }));
    if (selected) setRemoveFile(false);
  };

  const handleRemoveFileChange = (e) => {
    const checked = e.target.checked;
    setRemoveFile(checked);
    if (checked) {
      setFile(null);
      setErrors((prev) => ({ ...prev, archivo: '' }));
    }
  };


  const manejarSubmit = (e) => {
    e.preventDefault();

    // Validar todos los campos de nuevo
    const newErrors = {
      titulo: validators.titulo(titulo),
      cliente: validators.cliente(cliente),
      descripcion: validators.descripcion(descripcion),
      importe: validators.importe(importe),
      estado: validators.estado(estado),
      archivo: validators.archivo(file)
    };
    setErrors(newErrors);

    // Comprobar si hay algún error no vacío
    const hayErrores = Object.values(newErrors).some((msg) => msg !== '');
    if (hayErrores) {
      // Si hay al menos un mensaje de error, no enviar
      return;
    }

    if (!cliente.trim() || importe === '' || importe < 0 ) {
      alert('El título, el cliente y el importe (>=0) son obligatorios');
      return;
    }
     // Construir objeto a enviar
    const data = {
      titulo: titulo || '',
      cliente,
      descripcion,
      importe: Number(importe),
      estado,
      removeFile
    };
    onSubmit(data, file);
  };

   return (
    <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
      
      {/* TITULO */}
      <div>
        <label className="block font-medium mb-1">Título (opcional):</label>
        <input
          type="text"
          value={titulo}
          onChange={handleTituloChange}
          className={`w-full border px-3 py-2 rounded ${
            errors.titulo ? 'border-red-500' : ''
          }`}
          placeholder="Si lo dejas vacío, aparecerá solo el número"
        />
        {errors.titulo && (
          <p className="text-red-600 text-sm mt-1">{errors.titulo}</p>
        )}
      </div>

      {/* CLIENTE */}
      <div>
        <label className="block font-medium mb-1">Cliente:</label>
        <input
          type="text"
          value={cliente}
          onChange={handleClienteChange}
          style={{ width: '100%', padding: '0.5rem' }}
          className={`w-full border px-3 py-2 rounded ${
            errors.cliente ? 'border-red-500' : ''
          }`}
          placeholder="Nombre del cliente"
        />
        {errors.cliente && (
          <p className="text-red-600 text-sm mt-1">{errors.cliente}</p>
        )}
      </div>

      {/* DESCRIPCIÓN */}
      <div>
        <label className="block font-medium mb-1">Descripción:</label>
        <textarea
          value={descripcion}
          onChange={handleDescripcionChange}
          rows={3}
          className={`w-full border px-3 py-2 rounded ${
            errors.descripcion ? 'border-red-500' : ''
          }`}
          placeholder="Descripción breve (hasta 500 caracteres)"
        />
        {errors.descripcion && (
          <p className="text-red-600 text-sm mt-1">{errors.descripcion}</p>
        )}
      </div>

      {/* importe */}
      <div>
        <label className="block font-medium mb-1">importe (€):</label>
        <input
          type="number"
          value={importe}
          onChange={handleImporteChange }
          className={`w-full border px-3 py-2 rounded ${
            errors.importe ? 'border-red-500' : ''
          }`}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        {errors.importe && (
          <p className="text-red-600 text-sm mt-1">{errors.importe}</p>
        )}
      </div>

      {/* ESTADO */}
      <div>
        <label className="block font-medium mb-1">Estado:</label>
        <select
          value={estado}
          onChange={handleEstadoChange}
          className={`w-full border px-3 py-2 rounded ${
            errors.estado ? 'border-red-500' : ''
          }`}
        >
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        {errors.estado && (
          <p className="text-red-600 text-sm mt-1">{errors.estado}</p>
        )}
      </div>

      {/* ARCHIVO */}
       <div>
        <label className="block font-medium mb-1">Archivo adjunto (opcional):</label>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          disabled={removeFile}
          className={`w-full ${errors.archivo ? 'border-red-500' : ''}`}
        />
        {errors.archivo && (
          <p className="text-red-600 text-sm mt-1">{errors.archivo}</p>
        )}
        {initialData && initialData.archivo && initialData.archivo.url && (
          <div className="mt-2">
            <p>
              Archivo actual:{' '}
              <a
                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${initialData.archivo.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {initialData.archivo.originalName || 'Descargar'}
              </a>
            </p>
            <label className="inline-flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                checked={removeFile}
                onChange={handleRemoveFileChange}
                className="form-checkbox"
              />
              <span>Eliminar archivo actual</span>
            </label>
          </div>
        )}
      </div>

      {/* BOTÓN SUBMIT */}
       <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded-md"
        >
          {isSubmitting ? 'Guardando…' : 'Guardar Presupuesto'}
        </button>
        <Link 
          to="/presupuestos"
          className="px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white rounded-md text-center"
        >
          ← Volver
        </Link>
       </div>
      

    </form>
  );
}

export default BudgetForm;
