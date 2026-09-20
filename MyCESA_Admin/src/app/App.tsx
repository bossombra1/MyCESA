import { BrowserRouter, Routes, Route } from 'react-router';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Evenements from './pages/Evenements';
import Etudiants from './pages/Etudiants';
import Professeurs from './pages/Professeurs';
import Classes from './pages/Classes';
import Filieres from './pages/Filieres';
import Cycles from './pages/Cycles';
import Matieres from './pages/Matieres';
import EmploisDuTemps from './pages/EmploisDuTemps';
import Notes from './pages/Notes';
import Absences from './pages/Absences';
import Paiements from './pages/Paiements';
import Notifications from './pages/Notifications';
import Utilisateurs from './pages/Utilisateurs';
import Salles from './pages/Salles';
import Configuration from './pages/Configuration';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/filieres" element={<Filieres />} />
            <Route path="/cycles" element={<Cycles />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/matieres" element={<Matieres />} />
            <Route path="/emplois-du-temps" element={<EmploisDuTemps />} />
            <Route path="/etudiants" element={<Etudiants />} />
            <Route path="/professeurs" element={<Professeurs />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/absences" element={<Absences />} />
            <Route path="/paiements" element={<Paiements />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/salles" element={<Salles />} />
            <Route path="/configuration" element={<Configuration />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
