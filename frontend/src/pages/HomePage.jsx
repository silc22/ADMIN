import BudgetList from '../components/BudgetList';

function HomePage() {
  return (
    <div className="b">
      <h1 className="text-gray-600 dark:text-gray-200">Gestión de Presupuestos</h1>
      <BudgetList />
    </div>
  );
}

export default HomePage;
