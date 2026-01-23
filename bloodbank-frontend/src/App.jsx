import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import AuthPage from './pages/AuthPage';
import OrgLayout from './pages/dashboard/OrgLayout';
import InventoryPage from './pages/dashboard/InventoryPage';

// Placeholder Dashboards
const UserDashboard = () => {
  const { logout, user } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Welcome, {user?.name} 👋</h1>
      <p className="text-neon-red mb-8">User Dashboard - Module 5 (Coming Soon)</p>
      <button onClick={logout} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg">Logout</button>
    </div>
  );
};

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
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

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
                <Route path="donors" element={<div className="text-white p-4">Donor Management (Module 6)</div>} />
                <Route path="requests" element={<div className="text-white p-4">Request Handling (Module 3)</div>} />
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
