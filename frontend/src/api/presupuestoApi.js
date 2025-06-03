import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getPresupuestos = (query = '') => {
  const url = query && query.trim() !== ''
    ? `${API_URL}/presupuestos?q=${encodeURIComponent(query.trim())}`
    : `${API_URL}/presupuestos`;
  return axios.get(url);
};

export const crearPresupuesto = (data) => {
  return axios.post(`${API_URL}/presupuestos`, data);
};

// --------------------------------------------------
// Nueva función: eliminar un presupuesto por ID
export const eliminarPresupuesto = (id) => {
  return axios.delete(`${API_URL}/presupuestos/${id}`);
};

// Nueva función: actualizar un presupuesto por ID
export const actualizarPresupuesto = (id, data) => {
  return axios.put(`${API_URL}/presupuestos/${id}`, data);
};

