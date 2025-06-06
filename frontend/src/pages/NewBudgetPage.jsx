import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BudgetForm from '../components/BudgetForm';
import { crearPresupuesto } from '../api/presupuestoApi';

function NewBudgetPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState([]); // Para errores del backend
  const navigate = useNavigate();

  const handleCrear = async (datos, file) => {
    setIsSubmitting(true);
    setApiErrors([]);
    try {
      await crearPresupuesto(datos, file);
      navigate('/');
    } catch (error) {
      console.error(error);
      // Si el backend devolvió { errors: [...] }, lo mostramos
      if (error.response && error.response.data.errors) {
        setApiErrors(error.response.data.errors.map((e) => e.msg || e));
      } else {
        setApiErrors(['Error inesperado del servidor.']);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 mt-48  md:mt-20">
      <h2 className="text-2xl font-bold mb-4">Nuevo Presupuesto</h2>

      {/* Mostrar errores de backend */}
      {apiErrors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <ul className="list-disc pl-5 space-y-1">
            {apiErrors.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <BudgetForm onSubmit={handleCrear} isSubmitting={isSubmitting} />
    </div>
  );
}

export default NewBudgetPage;
