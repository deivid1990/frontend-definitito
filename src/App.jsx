import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'

// --- PÁGINAS ---
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'

import Dashboard from './pages/Dashboard'
import Routines from './pages/Routines'
import Exercises from './pages/Exercises'
import History from './pages/History'
import TrainingSelfies from './pages/TrainingSelfies'
import AICoach from './pages/AICoach'
import Profile from './pages/Profile'
import WorkoutSession from './pages/WorkoutSession'

// ✅ NUEVO RF-06
import Stats from './pages/Stats'

import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>

          {/* ===== RUTAS PÚBLICAS ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ===== RUTAS PROTEGIDAS ===== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/rutinas" element={<Routines />} />
              <Route path="/biblioteca" element={<Exercises />} />
              <Route path="/historial" element={<History />} />
              <Route path="/progreso" element={<TrainingSelfies />} />

              {/* ===== RF-06 ESTADÍSTICAS ===== */}
              <Route path="/estadisticas" element={<Stats />} />

              <Route path="/coach" element={<AICoach />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/entrenar/:routineId" element={<WorkoutSession />} />
              <Route path="/entrenar/:routineId/:dayNumber" element={<WorkoutSession />} />
            </Route>
          </Route>

          {/* Ruta no encontrada */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
