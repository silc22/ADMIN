import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getPresupuestos = () => {
  return axios.get(`${API_URL}/presupuestos`);
};

export const crearPresupuesto = (data) => {
  return axios.post(`${API_URL}/presupuestos`, data);
};

// Para editar o eliminar, podrías exportar también:
// export const actualizarPresupuesto = (id, data) => axios.put(`${API_URL}/presupuestos/${id}`, data);
// export const eliminarPresupuesto = (id) => axios.delete(`${API_URL}/presupuestos/${id}`);
