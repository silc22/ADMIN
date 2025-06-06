import { useState } from 'react';

export default function ThemeToggle() {
  const [modoOscuro, setModoOscuro] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    if (modoOscuro) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setModoOscuro(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setModoOscuro(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
    >
      {modoOscuro ? 'Modo Claro' : 'Modo Oscuro'}
    </button>
  );
}
