import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import AuthPage from './pages/AuthPage';
import OrgLayout from './pages/dashboard/OrgLayout';
import InventoryPage from './pages/dashboard/InventoryPage';

import UserLayout from './pages/dashboard/UserLayout';
import UserHome from './pages/dashboard/UserHome';
import DonationPage from './pages/dashboard/DonationPage';
import FindBloodPage from './pages/dashboard/FindBloodPage';
import OrgDonations from './pages/dashboard/OrgDonations';
import OrgRequests from './pages/dashboard/OrgRequests';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) return <Navigate to="/" replace />;

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />; // Or unauthorized page
  }

  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="223193952931-oqqp2ejfdd1pskalqndmj48llkq07ftc.apps.googleusercontent.com">
      <AuthProvider>
        <InventoryProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AuthWrapper />} />

              {/* User Routes */}
              <Route
                path="/dashboard/user"
                element={
                  <ProtectedRoute allowedRole="ROLE_USER">
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<UserHome />} />
                <Route path="donate" element={<DonationPage />} />
                <Route path="find" element={<FindBloodPage />} />
                <Route path="history" element={<div className="text-white p-4">Activity History (Coming Soon)</div>} />
              </Route>

              {/* Organization Routes */}
              <Route
                path="/dashboard/org"
                element={
                  <ProtectedRoute allowedRole="ROLE_ORG">
                    <OrgLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="inventory" replace />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="donors" element={<OrgDonations />} />
                <Route path="requests" element={<OrgRequests />} />
              </Route>

            </Routes>
          </BrowserRouter>
        </InventoryProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

// Helper to redirect if already logged in
const AuthWrapper = () => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (user) {
    return <Navigate to={user.role === 'ROLE_USER' ? '/dashboard/user' : '/dashboard/org'} replace />;
  }

  return <AuthPage />;
};

export default App;
