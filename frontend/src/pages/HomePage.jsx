import React from 'react';
import BudgetList from '../components/BudgetList';

function HomePage() {
  return (
    <div class="bg-white dark:bg-gray-600">
      <h1 class="text-gray-600 dark:text-gray-200">Gestión de Presupuestos</h1>
      <BudgetList />
    </div>
  );
}

export default HomePage;
