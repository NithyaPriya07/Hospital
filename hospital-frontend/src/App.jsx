import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import DoctorDashboard from './pages/DoctorDashboard';
import PrescriptionForm from './pages/PrescriptionForm';
import BillingPage from './pages/BillingPage';
import AdminConsole from './pages/AdminConsole';

function HomeRedirect() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin" replace />;

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient Protected Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/bills"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <BillingPage />
          </ProtectedRoute>
        }
      />

      {/* Doctor Protected Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescribe/:apptId"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <PrescriptionForm />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminConsole />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
