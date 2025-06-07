// src/components/BudgetList.jsx
import { useEffect, useState, useCallback } from 'react';
import { getPresupuestos, getResumenPresupuestos } from '../api/presupuestoApi';
import BudgetItem from './BudgetItem';

function BudgetList() {
  // ---------------------------------------
  // 1) Estados de lista y filtros “en crudo”
  // ---------------------------------------
  const [presupuestos, setPresupuestos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Estos estados guardan lo que el usuario está escribiendo/seleccionando.
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');
  const [importeMin, setImporteMin] = useState('');
  const [importeMax, setImporteMax] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // ---------------------------------------
  // 2) Paginación
  // ---------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ---------------------------------------
  // 3) Resumen (summary) de los últimos filtros aplicados
  // ---------------------------------------
  const [resumen, setResumen] = useState([]);

  // ---------------------------------------
  // 4) “lastParams” guarda los filtros efectivamente aplicados
  // ---------------------------------------
  const [lastParams, setLastParams] = useState({
    q: undefined,
    estado: undefined,
    cliente: undefined,
    minImporte: undefined,
    maxImporte: undefined,
    fechaDesde: undefined,
    fechaHasta: undefined,
    page: 1,
    limit: itemsPerPage
  });

  // ---------------------------------------
  // 5) Funciones que llaman a la API con un objeto “params”
  // ---------------------------------------
  const loadPresupuestos = useCallback(async (params) => {
    try {
      setError(null);
      setCargando(true);
      const respuesta = await getPresupuestos(params);
      setPresupuestos(respuesta.data.data);
      setTotalPages(respuesta.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
      setError('Error al cargar presupuestos');
      setPresupuestos([]);
      setTotalPages(1);
    } finally {
      setCargando(false);
    }
  }, []);

  const loadResumen = useCallback(async (params) => {
    try {
      const res = await getResumenPresupuestos(params);
      setResumen(res.data.summary);
    } catch (err) {
      console.error('Error al obtener resumen:', err);
      setResumen([]);
    }
  }, []);

  // ---------------------------------------
  // 6) useEffect: se ejecuta SÓLO cuando cambie currentPage
  // ---------------------------------------
  useEffect(() => {
    // Combino lastParams (filtros guardados) con la nueva página
    const paramsParaPage = {
      ...lastParams,
      page: currentPage,
      limit: itemsPerPage
    };
    loadPresupuestos(paramsParaPage);
    loadResumen(paramsParaPage);
    // eslint-disable-next-line 
  }, [currentPage, itemsPerPage, lastParams, loadPresupuestos, loadResumen]);

  // ---------------------------------------
  // 7) handleBuscar: al pulsar “Aplicar Filtros”
  // ---------------------------------------
  const handleBuscar = async (e) => {
    e.preventDefault();

    // Construyo el objeto con los filtros “en crudo”
    const newParams = {
      q: searchTerm.trim() || undefined,
      estado: estadoFilter || undefined,
      cliente: clienteFilter.trim() || undefined,
      minImporte: importeMin !== '' ? importeMin : undefined,
      maxImporte: importeMax !== '' ? importeMax : undefined,
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      page: 1,
      limit: itemsPerPage
    };

    try {
      setError(null);
      setCargando(true);

      // 7.1) Llamada inmediata a la API con newParams
      const respLista = await getPresupuestos(newParams);
      setPresupuestos(respLista.data.data);
      setTotalPages(respLista.data.pagination.totalPages);

      const respResumen = await getResumenPresupuestos(newParams);
      setResumen(respResumen.data.summary);

      // 7.2) Guardo esos parámetros como “lastParams” y me aseguro de página 1
      setLastParams(newParams);
      setCurrentPage(1);

    } catch (err) {
      console.error('Error al aplicar filtros:', err);
      setError('Error al cargar presupuestos con filtros');
      setPresupuestos([]);
      setTotalPages(1);
      setResumen([]);
    } finally {
      setCargando(false);
    }
  };

  // ---------------------------------------
  // 8) handleLimpiar: reset de filtros y recarga sin filtro
  // ---------------------------------------
  const handleLimpiar = () => {
    
    setSearchTerm('');
    setEstadoFilter('');
    setClienteFilter('');
    setImporteMin('');
    setImporteMax('');
    setFechaDesde('');
    setFechaHasta('');

    // Parametros vacíos (sin filtro)
    const emptyParams = {
      q: undefined,
      estado: undefined,
      cliente: undefined,
      minImporte: undefined,
      maxImporte: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
      page: 1,
      limit: itemsPerPage
    };
    setLastParams(emptyParams);
    setCurrentPage(1);

    // loadPresupuestos(emptyParams) y loadResumen(emptyParams)
    // serán invocados por el useEffect de currentPage = 1
  };

// 10) Cambiar “items por página”
  const handleItemsPerPageChange = (e) => {
    const nuevo = parseInt(e.target.value, 10);
    setItemsPerPage(nuevo);
    // Reiniciar a página 1 al cambiar tamaño
    setCurrentPage(1);
    // Actualizar lastParams con el nuevo limit
    setLastParams((prev) => ({ ...prev, limit: nuevo, page: 1 }));
  };

   // 11) Funciones de paginación: ir a página específica
  const goToPage = (num) => {
    if (num >= 1 && num <= totalPages) {
      setCurrentPage(num);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  // 12) Generar array de páginas [1, 2, 3, ..., totalPages]
  const pagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  // ---------------------------------------
  // 9) Renderizado
  // ---------------------------------------
  return (
    <div className='mt-44 md:m-0'>
      {/* 9.1) Formulario de filtros con botón “Aplicar Filtros” */}
      <form
        onSubmit={handleBuscar}
        className="mb-6 space-y-4 p-4  mt-4"
      >
        <h3 className="text-lg font-semibold mb-2">Filtros de Presupuestos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Buscar (texto)
            </label>
            <input
              type="text"
              placeholder="Cliente/Título/Descripción…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <input
              type="text"
              placeholder="Filtrar por cliente…"
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full border px-2 py-1 rounded "
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>

          {/* Importe Mínimo */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Importe Mínimo (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={importeMin}
              onChange={(e) => setImporteMin(e.target.value)}
              className="w-full border px-2 py-1 rounded"
              placeholder="0.00"
            />
          </div>

          {/* Importe Máximo */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Importe Máximo (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={importeMax}
              onChange={(e) => setImporteMax(e.target.value)}
              className="w-full border px-2 py-1 rounded"
              placeholder="0.00"
            />
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
        </div>

        {/* Botones “Aplicar Filtros” / “Limpiar Filtros” */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={handleLimpiar}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* 9.2) Panel de Resumen */}
      <div className="container mx-auto mb-6 p-4 rounded dark:bg-gray-600">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {resumen.map((r) => (
            <div key={r.estado} className="p-3 rounded">
              <p className={`
            font-semibold font-medium capitalize text-lg
            ${r.estado === 'pendiente' ? 'text-center rounded bg-yellow-200 text-yellow-800 dark:text-yellow-800' : ''}
            ${r.estado === 'aprobado' ? 'text-center rounded bg-green-200 text-green-800 dark:text-green-800' : ''}
            ${r.estado === 'rechazado' ? 'text-center rounded bg-red-200 text-red-800 dark:text-red-800' : ''}
              `}>{r.estado}</p>
              <p className="mt-1">{r.count} presupuesto(s)</p>
              <p className="">
                Total importe:{' '}
                <span className="font-semibold">
                 € {r.totalImporte.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2})}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 13.3) Selector “ítems por página” ===== */}
      <div className="mb-4 flex items-center gap-2">
               <select
          id="perPageSelect"
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border rounded px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* 9.3) Mensajes de carga / error */}
      {cargando && <p>Cargando datos…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* 9.4) Tabla de Presupuestos */}
      {!cargando && presupuestos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto md:table-fixed border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="w-16 border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Titulo</th>
                <th className="border px-4 py-2 text-left">Cliente</th>
                <th className="border px-4 py-2 text-left">Descripción</th>
                <th className="w-40 border px-4 py-2 text-center">Importe (€)</th>
                <th className="w-40 border px-4 py-2 text-center">Estado</th>
                <th className="w-40 border px-4 py-2 text-center">F. de Creación</th>
                <th className="w-44 border px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {presupuestos.map((p) => (
                <BudgetItem
                  key={p._id}
                  presupuesto={p}
                  onEliminar={() => {
                    const params = {
                      ...lastParams,
                      page: currentPage,
                      limit: itemsPerPage
                    };
                    loadPresupuestos(params);
                    loadResumen(params);
                    }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 9.5) Mensaje si lista vacía */}
      {!cargando && presupuestos.length === 0 && (
        <p className="mt-4 text-gray-600">
          No hay presupuestos que coincidan con los filtros.
        </p>
      )}

      {/* ===== 13.7) Controles de paginación dinámicos ===== */}
      {!cargando && presupuestos.length > 0 && (
        <div className="mt-6 flex flex-col items-center space-y-2">
          {/* Botones “Anterior” / “Siguiente” */}
          <div className="flex items-center space-x-4">
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

            <span >
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

          {/* Botones numerados de paginación */}
          <nav className="flex space-x-2">
            {pagesArray.map((num) => (
              <button
                key={num}
                onClick={() => goToPage(num)}
                className={`px-3 py-1 rounded ${
                  num === currentPage
                    ? 'bg-btn-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

export default BudgetList;
