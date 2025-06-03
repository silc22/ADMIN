import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getPresupuestos = (query = '') => {
  const url = query && query.trim() !== ''
    ? `${API_URL}/presupuestos?q=${encodeURIComponent(query.trim())}`
    : `${API_URL}/presupuestos`;
  return axios.get(url);
};

export const getPresupuestoPorId = (id) => {
  return axios.get(`${API_URL}/presupuestos/${id}`);
};

export const crearPresupuesto = (data, file) => {
  // Construir FormData
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('cliente', data.cliente);
  formData.append('descripcion', data.descripcion);
  formData.append('monto', data.monto);
  formData.append('estado', data.estado);
  if (file) {
    formData.append('archivo', file); // “archivo” coincide con upload.single('archivo')
  }
  return axios.post(`${API_URL}/presupuestos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};


//Actualizar un presupuesto
// Ahora recibe data, file; data.removeFile indica si debe borrar el adjunto
export const actualizarPresupuesto = (id, data, file) => {
  const formData = new FormData();
  formData.append('titulo', data.titulo);
  formData.append('cliente', data.cliente);
  formData.append('descripcion', data.descripcion);
  formData.append('monto', data.monto);
  formData.append('estado', data.estado);
  if (file) {
    formData.append('archivo', file);
  }
  // Siempre enviar el flag removeFile (true/false)
  formData.append('removeFile', data.removeFile ? 'true' : 'false');

  return axios.put(`${API_URL}/presupuestos/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};


//  eliminar un presupuesto por ID
export const eliminarPresupuesto = (id) => {
  return axios.delete(`${API_URL}/presupuestos/${id}`);
};