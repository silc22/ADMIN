import apiClient from './axiosConfig';


export const getPresupuestos = ({ q = '', page = 1, limit = 10 } = {}) => {
  const params = {};
  if (q && q.trim() !== '') {
    params.q = q.trim();
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