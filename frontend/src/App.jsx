import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrganizerPasswordReset from './pages/auth/OrganizerPasswordReset';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import EventCreation from './pages/organizer/EventCreation';
import EventDetails from './pages/organizer/EventDetails';
import ParticipantProfile from './pages/participant/ParticipantProfile';
import ParticipantDashboard from './pages/participant/ParticipantDashboard';
import ParticipantEventDetails from './pages/participant/ParticipantEventDetails';
import ParticipantMyEvents from './pages/participant/ParticipantMyEvents';
import ParticipantLayout from './components/layout/ParticipantLayout';
import TeamDashboard from './pages/participant/TeamDashboard';


// Temporary placeholder components for Dashboards
const Unauthorized = () => <div className="p-10 text-xl font-bold text-red-600 text-center">Unauthorized Access</div>;




function App() {
  const { userInfo } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen bg-light text-dark font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={userInfo ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={userInfo ? <Navigate to="/" /> : <Register />} />
          <Route path="/organizer/reset-password" element={userInfo ? <Navigate to="/" /> : <OrganizerPasswordReset />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root Redirect based on role */}
          <Route path="/" element={
            !userInfo ? <Navigate to="/login" /> :
              userInfo.role === 'Admin' ? <Navigate to="/admin" /> :
                userInfo.role === 'Organizer' ? <Navigate to="/organizer" /> :
                  <Navigate to="/dashboard" />
          } />

          {/* Participant Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Participant']} />}>
            <Route element={<ParticipantLayout />}>
              <Route path="/dashboard" element={<ParticipantDashboard />} />
              <Route path="/participant/profile" element={<ParticipantProfile />} />
              <Route path="/participant/events/:id" element={<ParticipantEventDetails />} />
              <Route path="/participant/my-events" element={<ParticipantMyEvents />} />
              <Route path="/participant/teams/:id" element={<TeamDashboard />} />
            </Route>
          </Route>

          {/* Organizer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Organizer']} />}>
            <Route path="/organizer" element={<OrganizerDashboard />} />
            <Route path="/organizer/events/new" element={<EventCreation />} />
            <Route path="/organizer/events/:id" element={<EventDetails />} />

          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
