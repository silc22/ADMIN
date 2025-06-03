import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BudgetForm from '../components/BudgetForm';
import { getPresupuestoPorId, actualizarPresupuesto } from '../api/presupuestoApi';
/*import axios from 'axios';*/

function EditBudgetPage() {
  const { id } = useParams();           // Obtenemos el ID de la URL
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
    useEffect(() => {
    const fetchPresupuesto = async () => {
      try {
        setError(null);
        setCargando(true);
        const respuesta = await getPresupuestoPorId(id);
        setInitialData(respuesta.data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar el presupuesto');
      } finally {
        setCargando(false);
      }
    };
    fetchPresupuesto();
  }, [id]);

  // Función que se pasará a BudgetForm para manejar el submit
  const handleActualizar = async (datos, file) => {
    try {
      setIsSubmitting(true);
      await actualizarPresupuesto(id, datos, file);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Hubo un error al actualizar el presupuesto');
      setIsSubmitting(false);
    }
  };

  if (cargando) {
    return <p>Cargando presupuesto…</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Editar Presupuesto</h2>
      {/* Pasamos initialData a BudgetForm para que pré-llene los campos */}
      {initialData ? (
        <BudgetForm
          initialData={initialData}
          onSubmit={handleActualizar}
          isSubmitting={isSubmitting}
        />
      ) : (
        <p>Presupuesto no encontrado.</p>
      )}
    </div>
  );
}

export default EditBudgetPage;
