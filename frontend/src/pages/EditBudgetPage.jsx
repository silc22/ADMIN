import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BudgetForm from '../components/BudgetForm';
import { getPresupuestoPorId, actualizarPresupuesto } from '../api/presupuestoApi';

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
      } catch (error) {
        console.error(error);
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
    } catch (error) {
      console.error(error);
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
    <div className="max-w-lg mx-auto p-4 mt-48 md:mt-20">
      <h2 className="text-2xl font-bold mb-4">Editar Presupuesto</h2>
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
