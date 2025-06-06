import { useNavigate } from 'react-router-dom';
import { eliminarPresupuesto } from '../api/presupuestoApi';
import { Eye, Edit3, Trash2 } from 'lucide-react';

function BudgetItem({ presupuesto, onEliminar }) {
  const navigate = useNavigate();
  const { _id, identifier, titulo, cliente, descripcion, importe, estado, fechaCreacion, archivo } = presupuesto;
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
    navigate(`/presupuestos/editar/${_id}`);
  };

  // Navegar a página de detalle
  const handleDetalle = () => {
    navigate(`/presupuestos/${_id}`);
  };

  // Construir base de la URL (o usar env var)
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const textoCorto = descripcion
  ? (descripcion.length > 50
      ? descripcion.slice(0, 50) + ' + '
      : descripcion)
  : '';

  return (
    <tr className="hover:bg-gray-600 border">
      {/* 1. Número de Presupuesto */}
      <td className="truncate border px-4 py-2 ">
        {identifier} 
      </td>

      <td className="truncate border px-4 py-2">
        {titulo ? `${titulo}` : ''}
      </td>

      {/* 2. Cliente */}
      <td className="truncate border px-4 py-2">
        {cliente}
      </td>

      {/* 3. Descripción */}
      <td className="truncate border px-4 py-2">
        {textoCorto}
      </td>

      {/* 4. Archivo */}
      <td className="truncate border px-4 py-2 text-center">
        {archivo && archivo.url ? (
          <a
            href={`${baseURL}${archivo.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-100 underline text-sm"
          >
            {archivo.originalName || 'Ver archivo'}
          </a>
        ) : (
          <span className="text-gray-300 text-sm">Sin archivo</span>
        )}
      </td>

      {/* 5. Importe */}
      <td className="truncate border px-4 py-2 text-center">
        {importe.toFixed(2)}
      </td>

      {/* 6. Estado */}
      <td className="truncate border px-2 py-2 text-center">
        <span
          className={`
            px-1 py-1 rounded text-sm font-semibold flex flex-col
            ${estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' : ''}
            ${estado === 'aprobado' ? 'bg-green-200 text-green-800' : ''}
            ${estado === 'rechazado' ? 'bg-red-200 text-red-800' : ''}
          `}
        >
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </span>
      </td>

      {/* 7. F. de Creación */}
      <td className="truncate border px-4 py-2 text-center">{fecha}</td>

      {/* 8. Acciones (Editar / Eliminar) */}
      <td className="border px-4 py-2 text-center space-x-2">
         {/* Detalle */}
        <button
          onClick={handleDetalle}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Detalle"
        >
          <Eye className="w-5 h-5 text-green-500 dark:text-green-400" />
        </button>
        {/* Editar */}
        <button
          onClick={handleEditar}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Editar"
        >
          <Edit3 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        </button>
        {/* Eliminar */}
        <button
          onClick={handleEliminar}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Eliminar"
        >
          <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
        </button>
      </td>
    </tr>
  );
}

export default BudgetItem;
