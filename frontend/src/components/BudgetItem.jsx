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

  // Construir base de la URL (o usar env var)
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  return (
    <div>
      <div className ="py-2 px-2 bg-white rounded-md shadow-md space-y-2 sm:py-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-6" >
      <h3 className="text-xl font-semibold">
        {identifier} {titulo ? `- ${titulo}` : ''}
      </h3>
      <p><strong>Cliente:</strong> {cliente}</p>
      <p>{descripcion}</p>
      <p><strong>importe:</strong> € {importe.toFixed(2)}</p>
      <p><strong>Estado:</strong> {estado}</p>
      <p><small>Creado el: {fecha}</small></p>

      {archivo && archivo.url && (
        <div style={{ marginTop: '0.5rem' }}>
          {archivo.mimeType.startsWith('image/') ? (
            // Miniatura
            <img
              src={`${baseURL}${archivo.url}`}
              alt={archivo.originalName}
              style={{ maxWidth: '150px', maxHeight: '100px', display: 'block', marginBottom: '0.5rem' }}
            />
          ) : null}

          {/* Enlace de descarga */}
          <p>
            <strong>Adjunto:</strong>{' '}
            <a
              href={`${baseURL}${archivo.url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {archivo.originalName || 'Descargar archivo'}
            </a>
          </p>
        </div>
      )}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleEditar}
          className ="mt-4 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-700 text-white"
          style={{
            cursor: 'pointer'
          }}
        >
          Editar
        </button>
        <button
          onClick={handleEliminar}
          className ="mt-4 px-4 py-2 rounded-md bg-red-500 hover:bg-red-700 text-white"
          style={{
            cursor: 'pointer'
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
    </div>
  );
}

export default BudgetItem;
