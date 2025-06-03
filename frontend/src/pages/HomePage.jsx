import React from 'react';
import BudgetList from '../components/BudgetList';

function HomePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h1>Gestión de Presupuestos</h1>
      <BudgetList />
    </div>
  );
}

export default HomePage;
