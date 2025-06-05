import { useNavigate } from 'react-router-dom';
import { eliminarPresupuesto } from '../api/presupuestoApi';

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
  ? (descripcion.length > 30
      ? descripcion.slice(0, 30) + '...'
      : descripcion)
  : '';

  return (
    <tr className="hover:bg-gray-200">
      {/* 1. Número de Presupuesto */}
      <td className="border px-4 py-2 ">
        {identifier} 
      </td>

      <td className="border px-4 py-2">
        {titulo ? `${titulo}` : ''}
      </td>

      {/* 2. Cliente */}
      <td className="border px-4 py-2">
        {cliente}
      </td>

      {/* 3. Descripción */}
      <td className="border px-4 py-2">
        {textoCorto}
      </td>

      {/* 4. Archivo */}
      <td className="border px-4 py-2 text-center">
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
      <td className="border px-4 py-2 text-center">
        {importe.toFixed(2)}
      </td>

      {/* 6. Estado */}
      <td className="border  px-2 py-2 text-center">
        <span
          className={`
            px-1 py-1 rounded-md text-sm font-semibold flex
            ${estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' : ''}
            ${estado === 'aprobado' ? 'bg-green-200 text-green-800' : ''}
            ${estado === 'rechazado' ? 'bg-red-200 text-red-800' : ''}
          `}
        >
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </span>
      </td>

      {/* 7. F. de Creación */}
      <td className="border px-4 py-2 text-center">{fecha}</td>

      {/* 8. Acciones (Editar / Eliminar) */}
      <td className="border px-4 py-2 text-center space-x-2">
        <button
          onClick={handleEditar}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
        >
          Editar
        </button>
        <button 
          onClick={handleDetalle} 
          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Detalle
        </button>
        <button
          onClick={handleEliminar}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}

export default BudgetItem;
