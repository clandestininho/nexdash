import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logo from '../logo.png';
import {
  LayoutDashboard,
  Users,
  GitFork,
  Bot,
  CheckSquare,
  Calendar,
  DollarSign,
  Briefcase,
  FileText,
  ClipboardList,
  Globe,
  ChevronDown,
  ChevronUp,
  LogOut,
  Sparkles,
  Plus,
  Radio,
  MessageSquare,
  GraduationCap,
  Settings,
  Shield,
  Layers,
  Lock,
  Rocket
} from 'lucide-react';
import { cn } from '../lib/utils';
import { socket, disconnectSocket } from '../lib/socket';
import { isRouteLocked, PLAN_DETAILS } from '../lib/plans';

export default function Sidebar() {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [userName, setUserName] = useState('Gleison');
  const [userEmail, setUserEmail] = useState('gleisonsax@gmail.com');
  
  // Sidebar menus toggles matching dgflow perfectly
  const [openMenus, setOpenMenus] = useState({
    aiAgents: true,
    tasks: true,
    whatsapp: true,
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Read user name & email
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setCurrentUser(storedUser);
          if (storedUser.name) setUserName(storedUser.name);
          if (storedUser.email) setUserEmail(storedUser.email);
        }
      } catch {}
    };

    loadUser();
    window.addEventListener('user_plan_updated', loadUser);

    const handleStatus = (data) => {
      setConnectionStatus(data.status || 'disconnected');
    };

    const handleConnected = () => {
      setConnectionStatus('connected');
    };

    const handleDisconnected = () => {
      setConnectionStatus('disconnected');
    };

    socket.on('whatsapp:status', handleStatus);
    socket.on('whatsapp:connected', handleConnected);
    socket.on('whatsapp:disconnected', handleDisconnected);

    return () => {
      socket.off('whatsapp:status', handleStatus);
      socket.off('whatsapp:connected', handleConnected);
      socket.off('whatsapp:disconnected', handleDisconnected);
      window.removeEventListener('user_plan_updated', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarding_completed');
    disconnectSocket();
    navigate('/login');
  };

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const getPlanLabel = () => {
    if (!currentUser) return 'Carregando...';
    const plan = currentUser.plan || 'trial';

    if (plan === 'next') return 'Plano NEXT';
    if (plan === 'pro') return 'Plano Pro';
    if (plan === 'basico') return 'Plano Básico';

    if (plan === 'trial') {
      const trialEndsAt = currentUser.trial_ends_at 
        ? new Date(currentUser.trial_ends_at.replace(' ', 'T'))
        : new Date(new Date(currentUser.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const now = new Date();
      if (now > trialEndsAt) {
        return 'Teste Expirado ⚠️';
      } else {
        const diffMs = trialEndsAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return `Teste: ${diffDays}d rest.`;
      }
    }
    return 'Trial';
  };

  const isConnected = connectionStatus === 'connected';

  // Helper for rendering navigation items
  const renderLink = (to, label, Icon, extra = null, isSubLink = false) => {
    const isLocked = isRouteLocked(to, currentUser);

    if (isSubLink) {
      return (
        <NavLink
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-body font-normal',
              isActive
                ? 'text-[#e13a40] font-semibold bg-[#1a1a1a]/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121212]/50'
            )
          }
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex items-center gap-1.5">
            <span>{label}</span>
            {isLocked && <Lock className="h-3 w-3 text-zinc-600 shrink-0" />}
          </span>
          {extra}
        </NavLink>
      );
    }

    return (
      <NavLink
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          cn(
            'flex items-center justify-between rounded-xl px-4 py-2 text-base font-body font-normal transition-all duration-200 group relative',
            isActive
              ? 'text-[#e13a40] font-semibold bg-[#1a1a1a]/30'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#121212]/30'
          )
        }
      >
        {({ isActive }) => (
          <>
            {/* Active Left Indicator Bar */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#e13a40] rounded-r-full" />
            )}
            <div className="flex items-center gap-3">
              <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-[#e13a40]" : "text-zinc-400 group-hover:text-[#e13a40]/70")} />
              <span className="flex items-center gap-1.5">
                <span>{label}</span>
                {isLocked && <Lock className="h-3.5 w-3.5 text-zinc-650 shrink-0" />}
              </span>
            </div>
            {extra}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#121212] border-r border-[#1f1f1f] text-zinc-300">
      
      {/* Brand Logo */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="NEXDASH Logo" className="h-6 w-6 object-contain drop-shadow-[0_0_10px_rgba(225,58,64,0.3)] animate-pulse-soft" />
          <span className="font-extrabold text-lg text-white tracking-tight font-sans">NEXDASH</span>
        </div>
        
        {/* Simple search placeholder icon */}
        <button className="p-1 text-zinc-500 hover:text-zinc-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
      </div>

      {/* Large Accent Venda Button */}
      <div className="px-4 py-2">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-new-sale-modal'))}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-[#e13a40]/20 transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Venda</span>
        </button>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
        
        {/* Main Section */}
        <div className="space-y-1">
          {renderLink('/dashboard', 'Dashboard', LayoutDashboard)}
          {renderLink('/', 'Clientes', Users)}
          {renderLink('/pipelines', 'Pipelines', GitFork)}
          {renderLink('/ai/designer', 'Ferramentas', Sparkles)}
        </div>

        {/* Agentes IA Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu('aiAgents')}
            className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider transition-colors duration-150"
          >
            <span>Agentes IA</span>
            {openMenus.aiAgents ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          
          {openMenus.aiAgents && (
            <div className="ml-4 pl-4 border-l border-[#1f1f1f] space-y-0.5 mt-0.5">
              {renderLink('/ai', 'Visão geral', Bot, null, true)}
              {renderLink('/ai/analista', 'Analista', Bot, <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1 py-0.2 rounded border border-orange-500/20">BETA</span>, true)}
              {renderLink('/ai/copywriter', 'Copywriter', Bot, <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1 py-0.2 rounded border border-orange-500/20">BETA</span>, true)}
              {renderLink('/ai/designer', 'Designer', Bot, <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1 py-0.2 rounded border border-orange-500/20">BETA</span>, true)}
            </div>
          )}
        </div>

        {/* Tarefas Section */}
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu('tasks')}
            className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider transition-colors duration-150"
          >
            <span>Tarefas</span>
            {openMenus.tasks ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          
          {openMenus.tasks && (
            <div className="ml-4 pl-4 border-l border-[#1f1f1f] space-y-0.5 mt-0.5">
              {renderLink('/tasks/board', 'Quadro', CheckSquare, null, true)}
              {renderLink('/tasks/content', 'Conteúdos', CheckSquare, <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1 py-0.2 rounded border border-orange-500/20">BETA</span>, true)}
            </div>
          )}
        </div>

        {/* Dynamic & Financial Section */}
        <div className="space-y-1 pt-1">
          <div className="text-xs font-semibold text-zinc-500 px-3 py-1.5 uppercase tracking-wider">
            Gestão & Vendas
          </div>
          {renderLink('/agenda', 'Agenda', Calendar)}
          {renderLink('/finance', 'Financeiro', DollarSign)}
          {renderLink('/services', 'Serviços', Briefcase)}
          {renderLink('/orçamentos', 'Orçamentos', FileText)}
          {renderLink('/briefings', 'Briefings', ClipboardList)}
          {renderLink('/pages', 'Páginas', Globe)}
          {renderLink('/equipe', 'Equipe', Users)}
        </div>

        {/* WhatsApp Submenu section matching Screenshot 3 */}
        <div className="space-y-1">
          <button
            onClick={() => toggleMenu('whatsapp')}
            className="w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider transition-colors duration-150"
          >
            <span>WhatsApp</span>
            {openMenus.whatsapp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          
          {openMenus.whatsapp && (
            <div className="ml-4 pl-4 border-l border-[#1f1f1f] space-y-0.5 mt-0.5">
              {renderLink('/whatsapp/conversas', 'Conversas', MessageSquare, null, true)}
              {renderLink('/whatsapp/atendentes', 'Atendentes', Users, null, true)}
              {renderLink('/whatsapp/automacoes', 'Automações', Settings, null, true)}
              {renderLink('/whatsapp/grupos', 'Monitor de Grupos', Layers, null, true)}
              {renderLink('/connect', 'Conexão Número', Radio, 
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"
                )} />, true
              )}
            </div>
          )}
        </div>

        {/* Technical/Connection Info */}
        <div className="space-y-1 pt-1">
          <div className="text-xs font-semibold text-zinc-500 px-3 py-1.5 uppercase tracking-wider">
            Sistema
          </div>
          {renderLink('/log', 'Log de Classificações', ClipboardList)}
          {renderLink('/settings?tab=aprendizagem', 'Aprendizagem', GraduationCap)}
          {renderLink('/settings', 'Configurações', Settings)}
        </div>

      </div>

      {/* Subscriptions Alert & Assinar Button */}
      <div className="px-4 py-2 border-t border-[#1f1f1f] bg-[#121212]/40 select-none">
        {currentUser?.plan === 'next' ? (
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#06b6d4] bg-[#06b6d4]/5 border border-[#06b6d4]/20 py-2.5 px-3 rounded-lg animate-pulse-soft">
            <Rocket className="h-3.5 w-3.5 fill-[#06b6d4]/10" />
            <span>ACESSO TOTAL LIBERADO</span>
          </div>
        ) : (
          <button 
            onClick={() => window.dispatchEvent(new Event('open_pricing_modal'))}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10 py-2.5 px-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{currentUser?.plan === 'trial' ? 'Assinar Plano' : 'Fazer Upgrade'}</span>
          </button>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="px-4 py-3 border-t border-[#1f1f1f] bg-[#0a0a0a] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#e13a40] to-orange-500 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
            {userName ? userName.slice(0, 2).toUpperCase() : 'GL'}
          </div>
          <div className="flex flex-col overflow-hidden" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
            <span className="text-xs font-semibold text-white truncate hover:underline">{userName}</span>
            <span className="text-[10px] text-zinc-500 truncate">{userEmail}</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          title="Sair da conta"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-all"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

    </aside>
  );
}
