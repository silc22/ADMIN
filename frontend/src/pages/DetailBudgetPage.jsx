// src/pages/DetailBudgetPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPresupuestoPorId } from '../api/presupuestoApi';

export default function DetailBudgetPage() {
  const { id } = useParams();
  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base URL para descargas (ajusta según tu .env o la configuración real)
  const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        setLoading(true);
        setError(null);
        const resp = await getPresupuestoPorId(id);
        setPresupuesto(resp.data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el presupuesto');
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [id]);

  if (loading) {
    return <p className="p-4 text-gray-700">Cargando presupuesto…</p>;
  }

  if (error) {
    return <p className="p-4 text-red-600">{error}</p>;
  }

  if (!presupuesto) {
    return <p className="p-4 text-gray-700">Presupuesto no encontrado.</p>;
  }

  // Formatear fecha a dd/mm/yyyy
  const fechaFormateada = new Date(presupuesto.fechaCreacion).toLocaleDateString('es-ES');

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">
        Detalle de Presupuesto #{presupuesto.identifier}
      </h2>

      <div className="space-y-3">
        {/* Título (opcional) */}
        {presupuesto.titulo && (
          <p>
            <span className="font-medium">Título: </span>
            <span>{presupuesto.titulo}</span>
          </p>
        )}

        <p>
          <span className="font-medium">Cliente: </span>
          <span>{presupuesto.cliente}</span>
        </p>

        {presupuesto.descripcion && (
          <p>
            <span className="font-medium">Descripción: </span>
            <span>{presupuesto.descripcion}</span>
          </p>
        )}

        <p>
          <span className="font-medium">Importe: </span>
          <span>
            € {presupuesto.importe.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </p>

        <p>
          <span className="font-medium">Estado: </span>
          <span className="capitalize">{presupuesto.estado}</span>
        </p>

        <p>
          <span className="font-medium">Fecha de creación: </span>
          <span>{fechaFormateada}</span>
        </p>

        {/* Si existe archivo adjunto, mostrar enlace de descarga */}
        {presupuesto.archivo && presupuesto.archivo.url && (
          <div>
            <span className="font-medium">Archivo adjunto: </span>
            <a
              href={`${baseURL}${presupuesto.archivo.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {presupuesto.archivo.originalName || 'Descargar archivo'}
            </a>
          </div>
        )}
      </div>

      {/* Botones para volver o editar */}
      <div className="mt-6 flex gap-4">
        <Link
          to="/presupuestos"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          ← Volver
        </Link>
        <Link
          to={`/presupuestos/editar/${presupuesto._id}`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar
        </Link>
      </div>
    </div>
  );
}
