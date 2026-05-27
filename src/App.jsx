import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Wrench, Shield } from 'lucide-react';
import Landing from './pages/landing/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Activate from './pages/auth/Activate';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Checkout from './pages/auth/Checkout';
import NotFound from './pages/auth/NotFound';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Home from './pages/dashboard/Home';
import Vault from './pages/dashboard/Vault';
import BreachMonitor from './pages/dashboard/BreachMonitor';
import ThreatLog from './pages/dashboard/ThreatLog';
import Devices from './pages/dashboard/Devices';
import VPN from './pages/dashboard/VPN';
import FileScanner from './pages/dashboard/FileScanner';
import Backup from './pages/dashboard/Backup';
import SecurityScan from './pages/dashboard/SecurityScan';
import Settings from './pages/dashboard/Settings';
import PricingPlans from './pages/dashboard/PricingPlans';
import Upgrade from './pages/dashboard/Upgrade';
import AIAssistant from './pages/ai/AIAssistant';
import Spinner from './components/ui/Spinner';
import { API_BASE_URL } from './utils/constants';

function MaintenancePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench size={40} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Under Maintenance</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">HDM Vault is currently undergoing scheduled maintenance. We'll be back shortly.</p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <Shield size={14} /> HDM Vault
        </div>
      </div>
    </div>
  );
}

function MaintenanceWrapper({ children }) {
  const [maintenance, setMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/content/site-info`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.maintenanceMode) setMaintenance(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950"><Spinner size="lg" /></div>;
  if (maintenance) return <MaintenancePage />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MaintenanceWrapper><Landing /></MaintenanceWrapper>} />
      <Route path="/login" element={<MaintenanceWrapper><Login /></MaintenanceWrapper>} />
      <Route path="/register" element={<MaintenanceWrapper><Register /></MaintenanceWrapper>} />
      <Route path="/activate" element={<MaintenanceWrapper><Activate /></MaintenanceWrapper>} />
      <Route path="/forgot-password" element={<MaintenanceWrapper><ForgotPassword /></MaintenanceWrapper>} />
      <Route path="/reset-password" element={<MaintenanceWrapper><ResetPassword /></MaintenanceWrapper>} />
      <Route path="/verify-email" element={<MaintenanceWrapper><VerifyEmail /></MaintenanceWrapper>} />
      <Route path="/checkout" element={<MaintenanceWrapper><Checkout /></MaintenanceWrapper>} />

      <Route path="/dashboard" element={
        <MaintenanceWrapper>
          <ProtectedRoute><DashboardLayout /></ProtectedRoute>
        </MaintenanceWrapper>
      }>
        <Route index element={<Home />} />
        <Route path="vault" element={<Vault />} />
        <Route path="breaches" element={<BreachMonitor />} />
        <Route path="threats" element={<ThreatLog />} />
        <Route path="devices" element={<Devices />} />
        <Route path="vpn" element={<VPN />} />
        <Route path="scanner" element={<FileScanner />} />
        <Route path="backup" element={<Backup />} />
        <Route path="security" element={<SecurityScan />} />
        <Route path="settings" element={<Settings />} />
        <Route path="pricing" element={<PricingPlans />} />
        <Route path="upgrade" element={<Upgrade />} />
        <Route path="ai" element={<AIAssistant />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}