import apiClient from './axiosConfig';


export const getPresupuestos = ({
  q = '',
  page = 1,
  limit = 10,
  estado,
  cliente,
  minImporte,
  maxImporte,
  fechaDesde,
  fechaHasta
} = {}) => {
  const params = {};
  if (q && q.trim() !== '') {
    params.q = q.trim();
  }
  if (estado && estado.trim() !== '') {
    params.estado = estado.trim();
  }
  if (cliente && cliente.trim() !== '') {
    params.cliente = cliente.trim();
  }
  if (minImporte !== undefined && minImporte !== null && minImporte !== '') {
    params.minImporte = minImporte;
  }
  if (maxImporte !== undefined && maxImporte !== null && maxImporte !== '') {
    params.maxImporte = maxImporte;
  }
  if (fechaDesde && fechaDesde.trim() !== '') {
    params.fechaDesde = fechaDesde.trim();
  }
  if (fechaHasta && fechaHasta.trim() !== '') {
    params.fechaHasta = fechaHasta.trim();
  }
  params.page = page;
  params.limit = limit;
   
  return apiClient.get('/presupuestos', { params });
};

export const getResumenPresupuestos = (params) => {
  return apiClient.get('/presupuestos/summary', { params });
};

export const getPresupuestoPorId = (id) => {
  return apiClient.get(`/presupuestos/${id}`);
};

export const crearPresupuesto = (data, file) => {
  // Construir FormData
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('cliente', data.cliente);
  formData.append('descripcion', data.descripcion);
  formData.append('importe', data.importe);
  formData.append('estado', data.estado);
  if (file) {
    formData.append('archivo', file); // “archivo” coincide con upload.single('archivo')
  }
   return apiClient.post('/presupuestos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const actualizarPresupuesto = (id, data, file) => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('cliente', data.cliente);
  formData.append('descripcion', data.descripcion);
  formData.append('importe', data.importe);
  formData.append('estado', data.estado);
  if (file) {
    formData.append('archivo', file);
  }
  // Siempre enviar el flag removeFile (true/false)
  formData.append('removeFile', data.removeFile ? 'true' : 'false');

  return apiClient.put(`/presupuestos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const eliminarPresupuesto = (id) => {
  return apiClient.delete(`/presupuestos/${id}`);
};