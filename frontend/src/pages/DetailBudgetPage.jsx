// src/pages/DetailBudgetPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPresupuestoPorId } from '../api/presupuestoApi';
import axios from 'axios';

export default function DetailBudgetPage() {
  const { id } = useParams();
  const [presupuesto, setPresupuesto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailDest, setEmailDest] = useState('');
  const [sending, setSending] = useState(false);


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

  const handleSendEmail = async () => {
    if (!emailDest.trim()) return alert('Introduce un email');
    try {
      setSending(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/presupuestos/${id}/email`,
        { to: emailDest },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Email enviado ✅');
    } catch (err) {
      console.error(err);
      alert('Error al enviar email');
    } finally {
      setSending(false);
    }
  };
  // Formatear fecha a dd/mm/yyyy
  const fechaFormateada = new Date(presupuesto.fechaCreacion).toLocaleDateString('es-ES');

  return (
    <div className="rounded max-w-lg mx-auto p-4 mt-48 md:mt-20 border border-gray-600 dark:border-gray-100 ">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Detalle de Presupuesto #{presupuesto.identifier}
      </h2>

      <div className="space-y-3 ">
        {/* Título (opcional) */}
        {presupuesto.titulo && (
          <p className='border-b p-2'>
            <span className="font-medium">Título: </span>
            <span>{presupuesto.titulo}</span>
          </p>
        )}

        <p className='border-b p-2'>
          <span className="font-medium">Cliente: </span>
          <span>{presupuesto.cliente}</span>
        </p>

        {presupuesto.descripcion && (
          <div className="rounded max-h-50 p-2 break-words whitespace-normal dark:bg-gray-100 dark:text-black">

          <p >
            <span className="font-medium">Descripción: </span>
          </p>
          <p>
            <span > {presupuesto.descripcion}</span>
          </p>
          </div>
        )}

        <p>
          <span className="font-medium p-2">Importe: </span>
          <span>
            € {presupuesto.importe.toLocaleString('es-ES', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </span>
        </p>

        <p className='p-2'>
          <span className="font-medium">Estado: </span>
          <span className="capitalize">{presupuesto.estado}</span>
        </p>

        <p>
          <span className="font-medium p-2">Fecha de creación: </span>
          <span>{fechaFormateada}</span>
        </p>

        {/* Si existe archivo adjunto, mostrar enlace de descarga */}
        {presupuesto.archivo && presupuesto.archivo.url && (
          <div>
            <span className="font-medium p-2">Archivo adjunto: </span>
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
          to={`/presupuestos/editar/${presupuesto._id}`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Editar
        </Link>
        <Link
          to="/presupuestos"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          ← Volver
        </Link>
        <button
          onClick={() =>
          window.open(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/presupuestos/${id}/pdf`,
            '_blank'
            )
            }
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Descargar PDF
        </button>
      </div>
      
      {/* Form para enviar por email */}
      <div className="mt-6 space-y-2">
        <input
          type="email"
          placeholder="Email destinatario"
          value={emailDest}
          onChange={(e) => setEmailDest(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          onClick={handleSendEmail}
          disabled={sending}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {sending ? 'Enviando…' : 'Enviar por Email'}
        </button>
      </div>
    </div>
  );
}
