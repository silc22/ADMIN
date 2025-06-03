import React, { useEffect, useState } from 'react';
import { getPresupuestos } from '../api/presupuestoApi';
import BudgetItem from './BudgetItem';

function BudgetList() {
  const [presupuestos, setPresupuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPresupuestos();
  }, []);

  const fetchPresupuestos = async () => {
    try {
      const respuesta = await getPresupuestos();
      setPresupuestos(respuesta.data);
      setCargando(false);
    } catch (err) {
      console.error(err);
      setError('Error al cargar presupuestos');
      setCargando(false);
    }
  };

  if (cargando) return <p>Cargando presupuestos…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {presupuestos.length === 0 ? (
        <p>No hay presupuestos registrados.</p>
      ) : (
        presupuestos.map(presupuesto => (
          <BudgetItem key={presupuesto._id} presupuesto={presupuesto} />
        ))
      )}
    </div>
  );
}

export default BudgetList;
