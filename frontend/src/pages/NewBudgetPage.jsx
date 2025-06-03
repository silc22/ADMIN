import { useState } from 'react';
import BudgetForm from '../components/BudgetForm';
import { crearPresupuesto } from '../api/presupuestoApi';
import { useNavigate } from 'react-router-dom';

function NewBudgetPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCrear = async (datos, file) => {
    setIsSubmitting(true);
    try {
      await crearPresupuesto(datos, file);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Hubo un error al crear el presupuesto');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Nuevo Presupuesto</h2>
      <BudgetForm onSubmit={handleCrear} isSubmitting={isSubmitting} />
    </div>
  );
}

export default NewBudgetPage;
