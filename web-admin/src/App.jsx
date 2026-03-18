import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EtudiantsPage from './pages/etudiants/EtudiantsPage';
import ProfsPage from './pages/professeurs/ProfsPage';
import ClassesPage from './pages/classes/ClassesPage';
import MatieresPage from './pages/matieres/MatieresPage';
import EmploiTempsPage from './pages/emploiTemps/EmploiTempsPage';
import NotesPage from './pages/notes/NotesPage';
import PaiementsPage from './pages/paiements/PaiementsPage';
import UtilisateursPage from './pages/utilisateurs/UtilisateursPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AbsencesPage from './pages/absences/AbsencesPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<LoginPage />} />

          {/* Routes protégées */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="etudiants" element={<EtudiantsPage />} />
            <Route path="profs" element={<ProfsPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="matieres" element={<MatieresPage />} />
            <Route path="emploi" element={<EmploiTempsPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="paiements" element={<PaiementsPage />} />
            <Route path="utilisateurs" element={<UtilisateursPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="absences" element={<AbsencesPage />} />
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#F0FDF4',
                color: '#166534',
                border: '1px solid #BBF7D0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: '500',
              },
              iconTheme: {
                primary: '#22C55E',
                secondary: '#FFFFFF',
              },
            },
            error: {
              style: {
                background: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FECACA',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: '500',
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
            loading: {
              style: {
                background: '#FFFFFF',
                color: '#374151',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '16px',
                borderRadius: '8px',
                fontWeight: '500',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
