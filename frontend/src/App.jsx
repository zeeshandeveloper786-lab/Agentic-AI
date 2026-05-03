import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import CreateAgent from './pages/CreateAgent';
import AgentDetails from './pages/AgentDetails';
import Docs from './pages/Docs';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingBar from './components/LoadingBar';
import ScrollToTop from './components/ScrollToTop';

const AppContent = () => {
  const { fetchMe } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, [setTheme]);

  // Hide footer on chat/details page
  const hideFooter = location.pathname.startsWith('/agents/');

  return (
    <div className="min-h-screen bg-background light:bg-background-light text-foreground light:text-foreground-light selection:bg-accent-primary selection:text-white relative transition-colors duration-300 overflow-x-hidden">
      <LoadingBar />
      <div className="bg-mesh" />
      <div className="bg-grid" />
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/docs" element={<Docs />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/agents/create" element={
            <ProtectedRoute>
              <CreateAgent />
            </ProtectedRoute>
          } />

          <Route path="/agents/:id" element={
            <ProtectedRoute>
              <AgentDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
