import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Smartphone, X, Loader2 } from 'lucide-react';
import { useWhatsAppStatus } from './hooks/useSocket';
import Sidebar from './components/Sidebar';
import Kanban from './pages/Kanban';
import Connect from './pages/Connect';
import Log from './pages/Log';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

// New premium page imports
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Agenda from './pages/Agenda';
import Services from './pages/Services';
import Proposals from './pages/Proposals';
import Pages from './pages/Pages';
import ProposalView from './pages/ProposalView';
import VisualEditor from './pages/VisualEditor';
import Equipe from './pages/Equipe';
import WhatsAppPage from './pages/WhatsAppPage';
import NewSaleModal from './components/NewSaleModal';
import Header from './components/Header';

// Dedicated customized pages
import Clientes from './pages/Clientes';
import AIPage from './pages/AIPage';
import TasksPage from './pages/TasksPage';
import Briefings from './pages/Briefings';
import RegisterLeadPublic from './pages/RegisterLeadPublic';
import RequestContractDataPublic from './pages/RequestContractDataPublic';
import Onboarding from './pages/Onboarding';
import Aprendizagem from './pages/Aprendizagem';
import logo from './logo.png';

// SaaS Admin imports
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminDashboard from './pages/AdminDashboard';

import { apiFetch } from './lib/api';
import PricingModal from './components/PricingModal';
import PaywallLock from './components/PaywallLock';
import { isRouteLocked } from './lib/plans';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Protected Admin Guard
function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const isGleison = user?.email === 'gleison@nexdash.com' || user?.email === 'isabelaluisag@gmail.com';
    const hasAdminWord = user?.email?.toLowerCase().includes('admin');
    const isAdminRole = user?.role === 'admin';

    if (isAdminRole || isGleison || hasAdminWord) {
      return children;
    }
  } catch {}

  // Redirect standard clients back to CRM main screen
  return <Navigate to="/" replace />;
}

// Dedicated isolated admin portal layout
function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#070708] text-zinc-100 font-body">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen flex flex-col bg-[#070708]">
        <AdminHeader />
        <div className="p-8 flex-1 bg-[#070708]">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/subscribers" element={<AdminDashboard />} />
            <Route path="/automations" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AppLayout() {
  const { status } = useWhatsAppStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOnboardingPending, setIsOnboardingPending] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail);
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  // Check onboarding completed state from API settings
  useEffect(() => {
    const checkOnboarding = async () => {
      const cached = localStorage.getItem('onboarding_completed');
      if (cached === 'true') {
        setIsOnboardingPending(false);
      }

      try {
        const res = await apiFetch('/api/settings/onboarding-status');
        const data = await res.json();
        if (data && data.onboarding_completed === true) {
          localStorage.setItem('onboarding_completed', 'true');
          setIsOnboardingPending(false);
          
          // Background load full settings for avatar/logo display
          const settingsRes = await apiFetch('/api/settings');
          const settingsData = await settingsRes.json();
          setUserSettings(settingsData);
        } else {
          localStorage.removeItem('onboarding_completed');
          setIsOnboardingPending(true);
        }
      } catch (err) {
        console.error('[App:Onboarding] Error checking onboarding status:', err);
        if (cached === 'true') {
          setIsOnboardingPending(false);
          try {
            const settingsRes = await apiFetch('/api/settings');
            const settingsData = await settingsRes.json();
            setUserSettings(settingsData);
          } catch {}
        } else {
          setIsOnboardingPending(true);
        }
      }
    };
    checkOnboarding();
  }, []);

  // Load user details and subscribe to plan updates
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setCurrentUser(storedUser);
      } catch {}
    };
    loadUser();
    window.addEventListener('user_plan_updated', loadUser);
    return () => window.removeEventListener('user_plan_updated', loadUser);
  }, []);

  // Check WhatsApp status on mount and show banner if not connected
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiFetch('/api/whatsapp/status');
        const data = await res.json();
        if (data.status !== 'connected' && !bannerDismissed) {
          setShowBanner(true);
        }
      } catch (err) {
        if (!bannerDismissed) {
          setShowBanner(true);
        }
      }
    };

    checkStatus();
  }, [bannerDismissed]);

  // Hide banner when connected
  useEffect(() => {
    if (status === 'connected') {
      setShowBanner(false);
    }
  }, [status]);

  const handleDismissBanner = () => {
    setShowBanner(false);
    setBannerDismissed(true);
  };

  // Helper to dynamically intercept locked paths
  const guard = (element, path) => {
    return isRouteLocked(path, currentUser) ? <PaywallLock path={path} /> : element;
  };

  if (isOnboardingPending === null) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center text-zinc-400 font-body">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#e13a40]" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">Carregando NEXDASH...</span>
        </div>
      </div>
    );
  }

  if (isOnboardingPending) {
    return (
      <Onboarding 
        onComplete={() => {
          localStorage.setItem('onboarding_completed', 'true');
          setIsOnboardingPending(false);
          apiFetch('/api/settings')
            .then(res => res.json())
            .then(data => setUserSettings(data))
            .catch(() => {});
        }} 
      />
    );
  }

  return (
    <div className={`flex min-h-screen font-body transition-all duration-200 ${theme === 'light' ? 'light-theme bg-[#f4f4f7] text-[#1f2937]' : 'bg-[#0a0a0a] text-zinc-100'}`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Global Sale Modals Chooser */}
      <NewSaleModal />

      {/* Global SaaS Pricing modal picker */}
      <PricingModal />

      {/* Main Content */}
      <main className={`flex-1 ml-64 min-h-screen flex flex-col relative overflow-hidden transition-all duration-200 ${theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#0a0a0a]'}`}>
        {/* Dynamic Brand Logo Watermark inside CRM */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <img 
            src={(userSettings && (userSettings.watermark_logo || userSettings.profile_avatar || userSettings.onboarding_logo)) || logo} 
            alt="CRM Brand Watermark" 
            className="w-[75vh] h-[75vh] max-w-[700px] max-h-[700px] object-contain brightness-0 invert opacity-[0.055] pointer-events-none select-none" 
          />
        </div>
        {/* Global Header */}
        <Header />

        {/* Connection Banner */}
        {showBanner && status !== 'connected' && (
          <div className="bg-[#e13a40]/10 border-b border-[#e13a40]/20 px-6 py-2.5 flex items-center justify-between animate-fade-in z-30">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-[#e13a40]" />
              <span className="text-sm text-zinc-300 font-body">
                WhatsApp não conectado.{' '}
                <a
                  href="/connect"
                  className="text-[#e13a40] font-medium hover:underline"
                >
                  Conectar agora →
                </a>
              </span>
            </div>
            <button
              onClick={handleDismissBanner}
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Page Content */}
        <div className="p-6 flex-1 bg-transparent z-10">
          <Routes>
            {/* Core / Legacy routes */}
            <Route path="/" element={guard(<Clientes />, '/')} />
            <Route path="/connect" element={guard(<Connect />, '/connect')} />
            <Route path="/log" element={guard(<Log />, '/log')} />
            <Route path="/settings" element={guard(<Settings />, '/settings')} />
            <Route path="/aprendizagem" element={guard(<Aprendizagem />, '/aprendizagem')} />

            {/* New premium routes */}
            <Route path="/dashboard" element={guard(<Dashboard />, '/dashboard')} />
            <Route path="/finance" element={guard(<Finance />, '/finance')} />
            <Route path="/agenda" element={guard(<Agenda />, '/agenda')} />
            <Route path="/services" element={guard(<Services />, '/services')} />
            <Route path="/orçamentos" element={guard(<Proposals />, '/orçamentos')} />
            <Route path="/pages" element={guard(<Pages />, '/pages')} />
            <Route path="/visual-editor" element={guard(<VisualEditor />, '/visual-editor')} />
            
            {/* New dgflow layout routes */}
            <Route path="/equipe" element={guard(<Equipe />, '/equipe')} />
            <Route path="/whatsapp/conversas" element={guard(<WhatsAppPage activeTab="conversas" />, '/whatsapp/conversas')} />
            <Route path="/whatsapp/atendentes" element={guard(<WhatsAppPage activeTab="atendentes" />, '/whatsapp/atendentes')} />
            <Route path="/whatsapp/automacoes" element={guard(<WhatsAppPage activeTab="automacoes" />, '/whatsapp/automacoes')} />
            <Route path="/whatsapp/grupos" element={guard(<WhatsAppPage activeTab="grupos" />, '/whatsapp/grupos')} />

            {/* Dedicated custom pages for pipelines, AI, tasks and briefings */}
            <Route path="/pipelines" element={guard(<Kanban />, '/pipelines')} />
            <Route path="/ai/*" element={guard(<AIPage />, '/ai')} />
            <Route path="/tasks/*" element={guard(<TasksPage />, '/tasks')} />
            <Route path="/briefings" element={guard(<Briefings />, '/briefings')} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth screens */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public client proposal approval view */}
        <Route path="/proposal/:id" element={<ProposalView />} />

        {/* Public lead self-registration view */}
        <Route path="/register-lead" element={<RegisterLeadPublic />} />

        {/* Public contract request details form */}
        <Route path="/request-contract/:userId/:contactId" element={<RequestContractDataPublic />} />

        {/* Isolated secure admin sub-site */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        />

        {/* Isolated secure tenant portal */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
