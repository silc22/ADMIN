# Presupuestos CRUD

This project is split into a backend built with Express and MongoDB and a React frontend. The root `package.json` provides a `dev` script that runs both parts concurrently.

## Prerequisites

- **Node.js** version 18 or higher
- **MongoDB** (local or a remote connection string)

## Installation

1. Install root dependencies (for the dev script):
   ```bash
   npm install
   ```
2. Install backend and frontend packages:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

## Configuration

Create a `.env` file inside `backend` and provide at least the following variables:

```bash
MONGODB_URI=mongodb://localhost:27017/presupuestos_db
JWT_SECRET=your-secret-key
# Optional
JWT_EXPIRES_IN=1d
PORT=5000
```

## Running in development

From the project root run:

```bash
npm run dev
```

This starts the API with `nodemon` and the React app simultaneously.

## Project structure

- **backend** – Express server, routes and models for the API. Handles file uploads in the `uploads` folder.
- **frontend** – React application styled with Tailwind CSS located in `frontend/src`.

