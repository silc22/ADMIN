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
  const [itemsPerPage] = useState(10);
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
  }, [currentPage]);

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

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  // ---------------------------------------
  // 9) Renderizado
  // ---------------------------------------
  return (
    <div>
      {/* 9.1) Formulario de filtros con botón “Aplicar Filtros” */}
      <form
        onSubmit={handleBuscar}
        className="mb-6 space-y-4 bg-white p-4 rounded shadow"
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
              className="w-full border px-2 py-1 rounded"
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
            disabled={cargando}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {cargando ? 'Aplicando filtros…' : 'Aplicar Filtros'}
          </button>
          <button
            type="button"
            onClick={handleLimpiar}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Limpiar Filtros
          </button>
        </div>
      </form>

      {/* 9.2) Panel de Resumen */}
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Resumen por Estado</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {resumen.map((r) => (
            <div key={r.estado} className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium capitalize">{r.estado}</p>
              <p className="mt-1 text-lg font-bold">{r.count} presupuesto(s)</p>
              <p className="text-gray-700">
                Total importe:{' '}
                <span className="font-semibold">
                  {r.totalImporte.toFixed(2)} €
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 9.3) Mensajes de carga / error */}
      {cargando && <p>Cargando datos…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* 9.4) Tabla de Presupuestos */}
      {!cargando && presupuestos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="border px-4 py-2 text-left max-w-1">ID</th>
                <th className="border px-4 py-2 text-left">Titulo</th>
                <th className="border px-4 py-2 text-left">Cliente</th>
                <th className="border px-4 py-2 text-left">Descripción</th>
                <th className="border px-4 py-2 text-left">Archivo</th>
                <th className="border px-4 py-2 text-right">Importe (€)</th>
                <th className="border px-4 py-2 text-left">Estado</th>
                <th className="border px-4 py-2 text-left">F. de Creación</th>
                <th className="border px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {presupuestos.map((p) => (
                <BudgetItem
                key={p._id}
                presupuesto={p}
                onEliminar={() => {
                  // Si se elimina un presupuesto, recargo con los últimos filtros + misma página
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

      {/* 9.6) Paginación */}
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
