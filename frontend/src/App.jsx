import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/shared/Unauthorized';
import NotFound from './pages/shared/NotFound';
import Profile from './pages/shared/Profile';
import TicketDetail from './pages/shared/TicketDetail';
import Notifications from './pages/shared/Notifications';
import MessagesInbox from './pages/shared/MessagesInbox';
import SavedResponses from './pages/shared/SavedResponses';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/Users';
import AdminResources from './pages/admin/Resources';
import AdminCategories from './pages/admin/Categories';
import AdminTickets from './pages/admin/Tickets';
import AdminMessages from './pages/admin/Messages';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminAuditLog from './pages/admin/AuditLog';

import AgentDashboard from './pages/agent/AgentDashboard';
import AgentMyTickets from './pages/agent/MyTickets';

import ClientDashboard from './pages/client/ClientDashboard';
import ClientMyResources from './pages/client/MyResources';
import ClientMyTickets from './pages/client/MyTickets';

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px' } }} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/app" element={<RoleRedirect />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="resources" element={<AdminResources />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="messages/:userId" element={<AdminMessages />} />
              <Route path="saved-responses" element={<SavedResponses />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="audit" element={<AdminAuditLog />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Agent */}
            <Route
              path="/agent"
              element={
                <ProtectedRoute roles={['agent']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AgentDashboard />} />
              <Route path="tickets" element={<AgentMyTickets />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="saved-responses" element={<SavedResponses />} />
              <Route path="messages" element={<MessagesInbox />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Client */}
            <Route
              path="/client"
              element={
                <ProtectedRoute roles={['client']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="tickets" element={<ClientMyTickets />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="resources" element={<ClientMyResources />} />
              <Route path="messages" element={<MessagesInbox />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
