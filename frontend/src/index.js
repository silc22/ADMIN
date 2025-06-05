import ReactDOM from 'react-dom/client';
import './index.css';  
import App from './App';
import { AuthProvider } from './context/AuthContext';

// 1) Detectar preferencia del usuario (puede ser de localStorage o del sistema)
const userPref = localStorage.getItem('theme'); // "light" u "dark"
const systemPrefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// 2) Decidir tema inicial
let isDark;
if (userPref === 'dark') {
    isDark = true;
} else if (userPref === 'light') {
    isDark = false;
} else {
    isDark = systemPrefDark;
}

// 3) Aplicar la clase "dark" al <html> si corresponde
if (isDark) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);

