// src/components/BudgetList.jsx
import { useEffect, useState, useCallback } from 'react';
import { getPresupuestos } from '../api/presupuestoApi';
import BudgetItem from './BudgetItem';

function BudgetList() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10); // elementos por página (puedes hacerlo dinámico si quieres)
  const [totalPages, setTotalPages] = useState(1);


  // --- Función que consulta la API, recibiendo opcionalmente un texto de búsqueda ---
  const fetchPresupuestos = useCallback(
    async (q = '', page = 1) => {
      try {
        setError(null);
        setCargando(true)
        setBuscando(true);

        const respuesta = await getPresupuestos({
          q,
          page,
          limit: perPage
        });

        setPresupuestos(respuesta.data.data);
        setTotalPages(respuesta.data.pagination.totalPages);
      } catch (err) {
        console.error(err);
        setError('Error al cargar presupuestos');
        setPresupuestos([]);
        setTotalPages(1);
      } finally {
        setCargando(false)
        setBuscando(false);
      }
    },
    [perPage] // sólo cambia si cambia perPage
  );

  // 2) Usamos el useEffect incluyendo fetchPresupuestos en dependencias
  useEffect(() => {
    fetchPresupuestos(searchTerm, currentPage);
  }, [searchTerm, currentPage, fetchPresupuestos]);


  // Manejador para el formulario de búsqueda
  const handleBuscar = (e) => {
    e.preventDefault();
    // Cuando cambie la búsqueda, volvemos a la página 1
    setCurrentPage(1);
  };

  const handleLimpiar = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Mover a página anterior
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

   // Mover a página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div>
      {/* --------------------------------------------------------- */}
      {/* 1) Formulario de busqueda */}
      <form onSubmit={handleBuscar} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar presupuesto por título, cliente, descripción o estado…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={buscando}
          className="px-4 py-2 bg-btn-primary text-white rounded disabled:opacity-50"
        >
          {buscando ? 'Buscando…' : 'Buscar'}
        </button>
        {searchTerm.trim() && (
          <button
            type="button"
            onClick={handleLimpiar}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* --------------------------------------------------------- */}
      {/* 2) Mensajes de carga/​error */}
      {cargando && !buscando && <p>Cargando presupuestos…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* --------------------------------------------------------- */}
      {/* 3) Mostrar lista filtrada (o vacía si no hay resultados) */}
      {!cargando && presupuestos.length === 0 && (
        <p>No se encontraron presupuestos {searchTerm.trim() ? `para “${searchTerm}”` : ''}.</p>
      )}
      {!cargando && presupuestos.length > 0 && (
        <div>
          {presupuestos.map((presupuesto) => (
            <BudgetItem
              key={presupuesto._id}
              presupuesto={presupuesto}
              onEliminar={() => fetchPresupuestos(searchTerm, currentPage)}
            />
          ))}
        </div>
      )}
      {/* Controles de paginación */}
      {!cargando && presupuestos.length > 0 && (
        <div className="mt-6 flex justify-center items-center space-x-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-btn-primary text-white hover:bg-btn-primary/90'
            }`}
          >
            Anterior
          </button>

          <span className="text-gray-700">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-btn-primary text-white hover:bg-btn-primary/90'
            }`}
          >
            Siguiente
          </button>
      </div>
      )}
    </div>
  );
}

export default BudgetList;
