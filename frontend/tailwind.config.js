/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // Aquí iremos luego a añadir tu paleta de colores
      colors: {
        // Colores base
        white: "#ffffff",
        black: "#000000",

        // Presupuestos: pendientes
        pending: {
          DEFAULT: "#ffe190",
          light: "#fff9eb"
        },
        // Presupuestos: rechazados
        rejected: {
          DEFAULT: "#eef0ff",
          light: "#a2a6f0"
        },
        // Presupuestos: aprobados
        approved: {
          DEFAULT: "#e7fdf6",
          light: "#73d8d1"
        },
        // Botones
        btn: {
          success: "#69e562",
          primary: "#4298f8",
          danger: "#dc3545"
        }
      }
    }
  },
  plugins: []
};

