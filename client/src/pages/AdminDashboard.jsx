import React, { useState, useEffect } from 'react';
import NumberFlow from '@number-flow/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Smartphone,
  Mail,
  Edit2,
  Cpu,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Play,
  Shield,
  Trash2,
  Calendar,
  X,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, subscribers, automations
  
  // Loading & Error States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [submittingSweep, setSubmittingSweep] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null); // { type: 'success'|'error', text: '' }

  // SaaS Telemetry State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubscribers: 0,
    estimatedMRR: 0,
    planCounts: { trial: 0, basico: 0, pro: 0, next: 0 },
    trials: { active: 0, expired: 0, total: 0 },
    averageTicket: 0
  });

  // User Directory State
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  // Automation Logs State
  const [automationLogs, setAutomationLogs] = useState({
    lastRun: null,
    totalAlertsSent: 0,
    history: []
  });

  // Subscriber Editor Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'trial',
    trial_ends_at: '',
    amount_paid: 0,
    billing_cycle: 'monthly',
    role: 'user'
  });

  const [provForm, setProvForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'trial'
  });
  const [provLoading, setProvLoading] = useState(false);

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    if (!provForm.name || !provForm.email) {
      showFeedback('error', 'Nome e E-mail são obrigatórios.');
      return;
    }

    try {
      setProvLoading(true);
      showFeedback('info', 'Provisionando cliente no banco de dados Master...');
      
      const res = await apiFetch('/api/admin/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        const emailStatus = data.notifications.email.sent ? 'E-mail enviado' : 'E-mail falhou';
        let waStatus = 'WhatsApp ignorado';
        if (data.notifications.whatsapp.status === 'sent') waStatus = 'WhatsApp enviado';
        else if (data.notifications.whatsapp.status === 'no_admin_connection') waStatus = 'WhatsApp pendente (Admin desconectado)';
        else if (data.notifications.whatsapp.status === 'failed') waStatus = 'WhatsApp falhou';

        showFeedback('success', `Cliente provisionado! (${emailStatus} | ${waStatus})`);
        
        setProvForm({ name: '', email: '', phone: '', plan: 'trial' });
        loadUsers();
        loadStats();
      } else {
        showFeedback('error', data.error || 'Erro no provisionamento.');
      }
    } catch (err) {
      showFeedback('error', 'Erro ao conectar ao servidor.');
    } finally {
      setProvLoading(false);
    }
  };

  const handleResendWelcome = async (userId) => {
    try {
      showFeedback('info', 'Reenviando credenciais de acesso...');
      const res = await apiFetch('/api/admin/resend-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok) {
        const emailStatus = data.notifications.email.sent ? 'E-mail enviado' : 'E-mail falhou';
        let waStatus = 'WhatsApp ignorado';
        if (data.notifications.whatsapp.status === 'sent') waStatus = 'WhatsApp enviado';
        else if (data.notifications.whatsapp.status === 'no_admin_connection') waStatus = 'WhatsApp pendente (Admin desconectado)';

        showFeedback('success', `Credenciais reenviadas! (${emailStatus} | ${waStatus})`);
      } else {
        showFeedback('error', data.error || 'Erro ao reenviar credenciais.');
      }
    } catch (err) {
      showFeedback('error', 'Erro ao conectar ao servidor.');
    }
  };

  // Load telemetry data from server
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const res = await apiFetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('[AdminStats] Failed to load statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load subscribers data
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await apiFetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('[AdminUsers] Failed to load subscribers:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load background automation daemon logs
  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await apiFetch('/api/admin/automation-logs');
      if (res.ok) {
        const data = await res.json();
        setAutomationLogs(data);
      }
    } catch (err) {
      console.error('[AdminLogs] Failed to load automation logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers();
    loadLogs();
  }, []);

  // Show dynamic banner feedback
  const showFeedback = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  // Trigger manual sweep on the server
  const handleTriggerSweep = async () => {
    try {
      setSubmittingSweep(true);
      const res = await apiFetch('/api/admin/trigger-sweep', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setAutomationLogs(data.logs);
        showFeedback('success', data.message || 'Varredura automática disparada com sucesso!');
        loadStats();
        loadUsers();
      } else {
        showFeedback('error', data.error || 'Falha ao processar varredura.');
      }
    } catch (err) {
      showFeedback('error', 'Erro na conexão com o servidor.');
    } finally {
      setSubmittingSweep(false);
    }
  };

  // Send manual reminder (WhatsApp or Email)
  const handleSendReminder = async (userId, type) => {
    try {
      showFeedback('info', `Disparando lembrete de ${type === 'whatsapp' ? 'WhatsApp' : 'E-mail'}...`);
      const res = await apiFetch('/api/admin/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', data.message || 'Lembrete enviado com sucesso!');
        loadUsers();
        loadStats();
        loadLogs();
      } else {
        showFeedback('error', data.error || 'Erro ao enviar lembrete.');
      }
    } catch (err) {
      showFeedback('error', 'Falha ao processar requisição.');
    }
  };

  // Open Edit Subscriber Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      plan: user.plan || 'trial',
      trial_ends_at: user.trial_ends_at ? user.trial_ends_at.replace(' ', 'T') : '',
      amount_paid: user.amount_paid || 0,
      billing_cycle: user.billing_cycle || 'monthly',
      role: user.role || 'user'
    });
    setIsEditing(true);
  };

  // Save edited subscriber details
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      // Format trial ends string back to SQLite space format
      const formattedDate = editForm.trial_ends_at
        ? editForm.trial_ends_at.replace('T', ' ').substring(0, 19)
        : null;

      const submitData = {
        ...editForm,
        trial_ends_at: formattedDate
      };

      const res = await apiFetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      const data = await res.json();
      if (res.ok) {
        showFeedback('success', 'Assinante atualizado com sucesso!');
        setIsEditing(false);
        setSelectedUser(null);
        loadUsers();
        loadStats();
      } else {
        showFeedback('error', data.error || 'Falha ao salvar alterações.');
      }
    } catch (err) {
      showFeedback('error', 'Falha ao processar requisição.');
    }
  };

  // Filter and search user directory list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlan = planFilter === 'all' ? true : u.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  // Calculate user trial days remaining helper
  const getTrialRemainingLabel = (user) => {
    if (!user.trial_ends_at) return { text: 'Sem data', color: 'text-zinc-500' };

    const expirationDate = new Date(user.trial_ends_at.replace(' ', 'T'));
    const now = new Date();
    const msDiff = expirationDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

    if (user.plan !== 'trial') {
      return { 
        text: `Expira em ${expirationDate.toLocaleDateString('pt-BR')}`, 
        color: daysDiff < 3 ? 'text-amber-400 font-bold' : 'text-zinc-400' 
      };
    }

    if (daysDiff < 0) {
      return { text: `Expirado há ${Math.abs(daysDiff)} dias`, color: 'text-rose-500 font-bold' };
    } else if (daysDiff === 0) {
      return { text: 'Expira hoje!', color: 'text-amber-400 font-black animate-pulse' };
    } else if (daysDiff === 1) {
      return { text: 'Expira amanhã!', color: 'text-amber-500 font-bold' };
    } else {
      return { text: `${daysDiff} dias restantes`, color: 'text-emerald-400 font-semibold' };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Upper Alerts Banner feedback */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-3 w-80 backdrop-blur-md transition-all ${
              alertMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
                : alertMsg.type === 'info'
                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
                : 'bg-rose-950/80 border-rose-500/30 text-rose-400'
            }`}
          >
            {alertMsg.type === 'success' ? (
              <CheckCircle className="h-5 w-5 shrink-0" />
            ) : alertMsg.type === 'info' ? (
              <Cpu className="h-5 w-5 shrink-0 animate-spin" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SaaS KPI Indicators Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Paid Subscribers */}
        <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] p-6 shadow-sm group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-[#e13a40]/5 rounded-full blur-[30px] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-zinc-450 uppercase font-body">Assinantes Pagos</span>
            <div className="p-2 rounded-lg bg-[#e13a40]/10 text-[#e13a40]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight leading-none font-body">
              {loadingStats ? (
                '...'
              ) : (
                <NumberFlow value={stats.totalSubscribers} />
              )}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">clientes ativos</span>
          </div>
          <div className="mt-2 text-xs text-zinc-350 font-semibold font-body flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">100%</span> convertidos via PIX/Cartão
          </div>
        </div>

        {/* KPI 2: Estimated MRR */}
        <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] p-6 shadow-sm group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-[30px] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-zinc-450 uppercase font-body">Faturamento Estimado</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-sm font-bold text-zinc-400">R$</span>
            <span className="text-3xl font-black text-white tracking-tight leading-none font-body">
              {loadingStats ? (
                '...'
              ) : (
                <NumberFlow value={stats.estimatedMRR} />
              )}
            </span>
            <span className="text-xs text-zinc-400 font-semibold font-semibold">/mês</span>
          </div>
          <div className="mt-2 text-xs text-zinc-350 font-semibold font-body flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            Receita recorrente atual (MRR)
          </div>
        </div>

        {/* KPI 3: Trial Accounts active */}
        <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] p-6 shadow-sm group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full blur-[30px] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-zinc-450 uppercase font-body">Testes Ativos</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight leading-none font-body">
              {loadingStats ? (
                '...'
              ) : (
                <NumberFlow value={stats.trials.active} />
              )}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">
              de {loadingStats ? '...' : stats.trials.total} totais
            </span>
          </div>
          <div className="mt-2 text-xs text-zinc-350 font-semibold font-body flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[#ff483d] font-bold">{loadingStats ? '0' : stats.trials.expired} expirados</span> aguardando aviso
          </div>
        </div>

        {/* KPI 4: Ticket Average */}
        <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] p-6 shadow-sm group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-[30px] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-zinc-450 uppercase font-body">Ticket Médio</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-sm font-bold text-zinc-400">R$</span>
            <span className="text-3xl font-black text-white tracking-tight leading-none font-body">
              {loadingStats ? (
                '...'
              ) : (
                <NumberFlow value={stats.averageTicket} />
              )}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">/assinante</span>
          </div>
          <div className="mt-2 text-xs text-zinc-350 font-semibold font-body flex items-center gap-1.5">
            Calculado sobre assinantes pagos
          </div>
        </div>

      </section>

      {/* Tabs Menu Navigation */}
      <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-px">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-all select-none border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#e13a40] text-white'
                : 'border-transparent text-zinc-450 hover:text-zinc-300'
            }`}
          >
            Visão Geral SaaS
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-all select-none border-b-2 ${
              activeTab === 'subscribers'
                ? 'border-[#e13a40] text-white'
                : 'border-transparent text-zinc-450 hover:text-zinc-300'
            }`}
          >
            Gestão de Assinantes ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-all select-none border-b-2 ${
              activeTab === 'automations'
                ? 'border-[#e13a40] text-white'
                : 'border-transparent text-zinc-450 hover:text-zinc-300'
            }`}
          >
            Logs de Automações
          </button>
        </div>

        {/* Global manual refresh button */}
        <button
          onClick={async () => {
            showFeedback('info', 'Sincronizando dados administrativos...');
            await Promise.all([loadStats(), loadUsers(), loadLogs()]);
            showFeedback('success', 'Painel atualizado com sucesso!');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-[#0e0e11] hover:bg-zinc-900 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-wider transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5 animate-pulse-soft" />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* Dynamic Tab Contents */}
      <main className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column: Plan breakdown & MRR charts */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Plan Distribution Stats visual card */}
              <div className="rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] p-6 shadow-sm">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Distribuição de Planos da Base
                </h3>
                <p className="text-xs text-zinc-500 mt-1 mb-6">
                  Quantidade total de usuários cadastrados nos planos Básico, Pro, NEXT e Trial.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Trial */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between h-28">
                    <span className="text-xs font-extrabold text-zinc-400 uppercase">Testes (Trial)</span>
                    <div>
                      <span className="text-2xl font-black text-white">{stats.planCounts.trial || 0}</span>
                      <span className="text-xs text-zinc-300 block mt-1">contas em avaliação</span>
                    </div>
                  </div>
                  {/* Básico */}
                  <div className="p-4 rounded-xl bg-[#e13a40]/5 border border-[#e13a40]/10 flex flex-col justify-between h-28">
                    <span className="text-xs font-extrabold text-[#e13a40] uppercase">Plano Básico</span>
                    <div>
                      <span className="text-2xl font-black text-white">{stats.planCounts.basico || 0}</span>
                      <span className="text-xs text-zinc-300 block mt-1">R$ 49/mês ativos</span>
                    </div>
                  </div>
                  {/* Pro */}
                  <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/10 flex flex-col justify-between h-28">
                    <span className="text-xs font-extrabold text-pink-400 uppercase">Plano Pro</span>
                    <div>
                      <span className="text-2xl font-black text-white">{stats.planCounts.pro || 0}</span>
                      <span className="text-xs text-zinc-300 block mt-1">R$ 99/mês ativos</span>
                    </div>
                  </div>
                  {/* NEXT */}
                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col justify-between h-28">
                    <span className="text-xs font-extrabold text-cyan-400 uppercase font-black tracking-wide">Plano NEXT</span>
                    <div>
                      <span className="text-2xl font-black text-white">{stats.planCounts.next || 0}</span>
                      <span className="text-xs text-zinc-300 block mt-1 font-bold text-cyan-400">R$ 199/mês ativos</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar visual graph */}
                <div className="mt-8 space-y-2">
                  <div className="flex justify-between text-xs font-extrabold text-zinc-300 uppercase tracking-wider">
                    <span>Taxa de Conversão de Base Pago</span>
                    <span>
                      {stats.totalUsers > 0 
                        ? Math.round((stats.totalSubscribers / stats.totalUsers) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-[#e13a40] transition-all duration-500"
                      style={{ 
                        width: `${stats.totalUsers > 0 ? (stats.totalSubscribers / stats.totalUsers) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400 font-bold">
                    <span>{stats.totalSubscribers} Assinantes Pagando</span>
                    <span>{stats.totalUsers} Usuários Totais</span>
                  </div>
                </div>

              </div>

              {/* Dynamic instruction alert card */}
              <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0e0e11] flex items-start gap-4">
                <div className="p-3 bg-[#e13a40]/10 text-[#e13a40] rounded-xl shrink-0">
                  <Cpu className="h-6 w-6 shrink-0" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Sistema de Alertas por WhatsApp e E-mail
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Você pode enviar lembretes manuais de renovação de plano para os seus usuários diretamente na aba <strong>Gestão de Assinantes</strong>. O disparo manuais utiliza o WhatsApp conectado no seu perfil de administrador. Se preferir, a automação em background realiza varreduras automáticas a cada 24 horas notificando os expirados.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Automation Daemon Control Status */}
            <div className="space-y-8">
              
              <div className="rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Daemon de Automação
                  </h3>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="space-y-4">
                  
                  {/* Status Item */}
                  <div className="flex justify-between items-center py-3 border-b border-zinc-900 text-sm">
                    <span className="text-zinc-400 font-semibold">Status do Serviço</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded">
                      Ativo & Online
                    </span>
                  </div>

                  {/* Frequency Item */}
                  <div className="flex justify-between items-center py-3 border-b border-zinc-900 text-sm">
                    <span className="text-zinc-400 font-semibold">Frequência de Varredura</span>
                    <span className="text-zinc-200 font-bold">A cada 24 horas</span>
                  </div>

                  {/* Last execution timestamp */}
                  <div className="flex justify-between items-center py-3 border-b border-zinc-900 text-sm">
                    <span className="text-zinc-400 font-semibold">Última Execução</span>
                    <span className="text-zinc-200 font-semibold truncate max-w-[160px]">
                      {automationLogs.lastRun 
                        ? new Date(automationLogs.lastRun).toLocaleString('pt-BR') 
                        : 'Nunca executou'}
                    </span>
                  </div>

                  {/* Total alerts triggered automatically */}
                  <div className="flex justify-between items-center py-3 border-b border-zinc-900 text-sm">
                    <span className="text-zinc-400 font-semibold">Alertas Automáticos</span>
                    <span className="text-cyan-400 font-bold bg-cyan-950/50 border border-cyan-500/20 px-2.5 py-0.5 rounded text-xs">
                      {automationLogs.totalAlertsSent || 0} enviados
                    </span>
                  </div>

                </div>

                {/* Actions: trigger sweep manual */}
                <div className="mt-8">
                  <button
                    onClick={handleTriggerSweep}
                    disabled={submittingSweep}
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-[#e13a40] to-orange-600 hover:from-[#ff483d] hover:to-orange-500 flex items-center justify-center gap-2 text-xs font-bold text-white uppercase tracking-wider transition-all disabled:opacity-40"
                  >
                    {submittingSweep ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-white" />
                        <span>Processando Varredura...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 text-white" />
                        <span>Disparar Varredura Manual</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-zinc-400 text-center mt-2 font-medium">
                    Analisa toda a base SQLite e dispara alertas para expirações &lt;= 48h imediatamente.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            
            {/* Form de Provisionamento Manual */}
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] p-6 shadow-sm relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#e13a40]/5 rounded-full blur-[40px] pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#e13a40]/10 text-[#e13a40] rounded-xl">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Provisionar Novo Cliente (Manual)
                  </h3>
                  <p className="text-xs text-zinc-450 mt-0.5 font-body">
                    Cadastre um cliente que comprou via WhatsApp ou pessoalmente. O acesso é liberado de imediato e as credenciais enviadas automaticamente.
                  </p>
                </div>
              </div>

              <form onSubmit={handleProvisionUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Nome */}
                <div className="space-y-1.5 font-body">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Amanda Costa"
                    value={provForm.name}
                    onChange={(e) => setProvForm({ ...provForm, name: e.target.value })}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 outline-none focus:border-[#e13a40] transition-all"
                    required
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-1.5 font-body">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: amanda@empresa.com"
                    value={provForm.email}
                    onChange={(e) => setProvForm({ ...provForm, email: e.target.value })}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 outline-none focus:border-[#e13a40] transition-all"
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div className="space-y-1.5 font-body">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                    WhatsApp (DDI + DDD + Num)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5511999998888"
                    value={provForm.phone}
                    onChange={(e) => setProvForm({ ...provForm, phone: e.target.value })}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-650 outline-none focus:border-[#e13a40] transition-all"
                  />
                </div>

                {/* Seletor de Plano & Botão */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 font-body">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                      Plano Comercial
                    </label>
                    <select
                      value={provForm.plan}
                      onChange={(e) => setProvForm({ ...provForm, plan: e.target.value })}
                      className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-2 py-2 text-xs text-white outline-none focus:border-[#e13a40] transition-all cursor-pointer h-[36px] font-bold"
                    >
                      <option value="trial">Trial (7 Dias)</option>
                      <option value="basico">Básico (R$49)</option>
                      <option value="pro">Pro (R$99)</option>
                      <option value="next">NEXT (R$199)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={provLoading}
                    className="h-[36px] rounded-xl bg-gradient-to-r from-[#e13a40] to-orange-600 hover:from-[#ff483d] hover:to-orange-500 text-[10px] font-black text-white uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-lg shadow-[#e13a40]/10 cursor-pointer"
                  >
                    {provLoading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5 shrink-0" />
                        <span>Provisionar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* subscribers list card */}
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] overflow-hidden shadow-sm">
            
            {/* Header controls: Search & filter */}
            <div className="p-6 border-b border-[#1f1f1f] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0e0e11]/60">
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-550" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#121214] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-300 placeholder-zinc-550 outline-none focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 transition-all font-body"
                />
              </div>

              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
                <span className="text-sm text-zinc-400 font-bold uppercase tracking-wider hidden sm:inline">Filtrar por plano:</span>
                
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-semibold outline-none focus:border-[#e13a40] transition-all cursor-pointer font-body"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="trial">Testes (Trial)</option>
                  <option value="basico">Plano Básico</option>
                  <option value="pro">Plano Pro</option>
                  <option value="next">Plano NEXT</option>
                </select>
              </div>

            </div>

            {/* Subscribers Table directory */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1f1f1f] bg-[#09090b]/40 text-xs font-extrabold text-zinc-400 uppercase tracking-wider font-body select-none">
                    <th className="py-4 px-6">Nome / Cadastro</th>
                    <th className="py-4 px-6">E-mail / Telefone</th>
                    <th className="py-4 px-6">Plano Ativo</th>
                    <th className="py-4 px-6">Tempo Restante / Vencimento</th>
                    <th className="py-4 px-6">Mensalidade</th>
                    <th className="py-4 px-6 text-center">Alertas Recentes</th>
                    <th className="py-4 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18181b] text-xs font-medium text-zinc-300">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-zinc-550 font-bold">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#e13a40]" />
                        <span className="block mt-2">Carregando diretório de assinantes...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-zinc-550 font-bold">
                        <Users className="h-8 w-8 mx-auto text-zinc-650 mb-2" />
                        Nenhum assinante encontrado para o filtro selecionado.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const expDetails = getTrialRemainingLabel(user);
                      
                      return (
                        <tr 
                          key={user.id}
                          className="hover:bg-[#121214]/30 transition-all duration-150"
                        >
                          {/* Name and Signup Date */}
                          <td className="py-4.5 px-6">
                            <div className="flex flex-col min-w-[120px]">
                              <span className="font-bold text-white text-xs">{user.name || 'Sem nome'}</span>
                              <span className="text-xs text-zinc-400 mt-1">
                                Criado em {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                              </span>
                            </div>
                          </td>

                          {/* Email and Phone */}
                          <td className="py-4.5 px-6">
                            <div className="flex flex-col min-w-[160px]">
                              <span className="text-zinc-300 font-semibold">{user.email}</span>
                              <span className="text-xs text-zinc-400 font-medium mt-1 flex items-center gap-1.5">
                                <Smartphone className="h-3.5 w-3.5 text-zinc-500" />
                                {user.phone || 'Sem telefone'}
                              </span>
                            </div>
                          </td>

                          {/* Plan Capsule Badge */}
                          <td className="py-4.5 px-6">
                            {user.plan === 'next' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 uppercase tracking-wider">
                                NEXT
                              </span>
                            ) : user.plan === 'pro' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-pink-950/60 border border-pink-500/20 text-pink-400 uppercase tracking-wider">
                                Pro
                              </span>
                            ) : user.plan === 'basico' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#e13a40]/10 border border-[#e13a40]/20 text-[#e13a40] uppercase tracking-wider">
                                Básico
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase tracking-wider">
                                Teste (Trial)
                              </span>
                            )}
                          </td>

                          {/* Days remaining count */}
                          <td className="py-4.5 px-6">
                            <div className="flex flex-col">
                              <span className={`text-xs ${expDetails.color}`}>
                                {expDetails.text}
                              </span>
                              {user.trial_ends_at && (
                                <span className="text-xs text-zinc-450 mt-1">
                                  Vence em {new Date(user.trial_ends_at.replace(' ', 'T')).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Month Paid amount */}
                          <td className="py-4.5 px-6 font-bold text-white">
                            {user.plan === 'trial' ? (
                              <span className="text-zinc-400 text-xs font-semibold uppercase">Grátis</span>
                            ) : (
                              `R$ ${user.amount_paid || 0}`
                            )}
                          </td>

                          {/* Last Reminded Date / Warn Status */}
                          <td className="py-4.5 px-6 text-center">
                            {user.last_reminded_at ? (
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                                  Remetido
                                </span>
                                <span className="text-xs text-zinc-450 font-semibold mt-1">
                                  {new Date(user.last_reminded_at.replace(' ', 'T')).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-zinc-450 text-xs font-semibold">—</span>
                            )}
                          </td>

                          {/* Subscriber Actions column */}
                          <td className="py-4.5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit details */}
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-700 transition-all"
                                title="Editar dados da assinatura"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              {/* Reenviar credenciais de boas-vindas */}
                              <button
                                onClick={() => handleResendWelcome(user.id)}
                                className="p-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 transition-all"
                                title="Reenviar e-mail e WhatsApp de boas-vindas"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>

                              {/* Manual WhatsApp alert */}
                              <button
                                onClick={() => handleSendReminder(user.id, 'whatsapp')}
                                disabled={!user.phone}
                                className={`p-2 rounded-lg border transition-all ${
                                  user.phone
                                    ? 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400'
                                    : 'bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed'
                                }`}
                                title={user.phone ? 'Enviar lembrete via WhatsApp' : 'Sem telefone cadastrado'}
                              >
                                <Smartphone className="h-3.5 w-3.5" />
                              </button>

                              {/* Manual Email alert */}
                              <button
                                onClick={() => handleSendReminder(user.id, 'email')}
                                className="p-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 transition-all"
                                title="Enviar boleto por e-mail"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

        {activeTab === 'automations' && (
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#0c0c0e] p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Histórico de Alertas Automáticos
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Visualização cronológica das mensagens de cobrança despachadas pelo Daemon de varredura.
              </p>
            </div>

            {loadingLogs ? (
              <div className="py-12 text-center text-zinc-400 font-bold">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#e13a40] mb-2" />
                Carregando logs do daemon...
              </div>
            ) : !automationLogs.history || automationLogs.history.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-xl">
                <Cpu className="h-8 w-8 mx-auto text-zinc-650 mb-2" />
                <span className="block font-bold">Nenhum alerta disparado pelo robô ainda.</span>
                <span className="block text-xs text-zinc-400 mt-1">As varreduras agendadas rodam a cada 24h ou sob demanda.</span>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Logs Listing timeline style */}
                <div className="relative border-l border-zinc-850 ml-3 space-y-6">
                  {automationLogs.history.map((log, idx) => (
                    <div key={idx} className="relative pl-6 group">
                      
                      {/* Timeline dot */}
                      <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-cyan-500 border-2 border-[#0a0a0c] group-hover:scale-115 transition-transform" />

                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-4xl">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{log.userName}</span>
                            <span className="text-xs text-zinc-300">({log.userEmail})</span>
                          </div>
                          <p className="text-xs text-zinc-400 font-medium">
                            Plano: <strong className="text-zinc-200">{log.plan.toUpperCase()}</strong> | 
                            Expiração: {new Date(log.expirationDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* WhatsApp Channel status */}
                          {log.whatsappSent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                              WhatsApp OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-zinc-950 text-zinc-400 border border-zinc-850">
                              Simulado
                            </span>
                          )}

                          {/* Email Status */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/20">
                            E-mail OK
                          </span>

                          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider pl-2">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      {/* Editor Modal Subscriber popup */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[500px] bg-[#0c0c0e] border border-[#1f1f1f] rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#e13a40]/5 rounded-full blur-[40px] pointer-events-none" />

              {/* Close */}
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-[#1a1a1c] transition-all"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#e13a40]/10 text-[#e13a40] rounded-xl">
                  <Edit2 className="h-5 w-5 shrink-0" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Editar Cadastro de Assinante
                  </h3>
                  <p className="text-xs text-zinc-450 mt-1">
                    Modifique planos, valores e datas de vencimento de testes.
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveUser} className="space-y-4">
                
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#e13a40] transition-all font-body"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                      Privilégio
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e13a40] transition-all cursor-pointer font-body"
                    >
                      <option value="user">Usuário (User)</option>
                      <option value="admin">Administrador (Admin)</option>
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                    E-mail de Acesso
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#e13a40] transition-all font-body"
                    required
                    disabled
                  />
                </div>

                {/* Phone & Amount Paid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                      WhatsApp (DDI+DDD+Num)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 5511999998888"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-650 outline-none focus:border-[#e13a40] transition-all font-body"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                      Valor Mensalidade (R$)
                    </label>
                    <input
                      type="number"
                      value={editForm.amount_paid}
                      onChange={(e) => setEditForm({ ...editForm, amount_paid: Number(e.target.value) })}
                      className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e13a40] transition-all font-body"
                      min="0"
                    />
                  </div>
                </div>

                {/* Plan picker & Billing Cycle */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                      Plano Comercial
                    </label>
                    <select
                      value={editForm.plan}
                      onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                      className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e13a40] transition-all cursor-pointer font-body"
                    >
                      <option value="trial">Avaliação (Trial)</option>
                      <option value="basico">Plano Básico</option>
                      <option value="pro">Plano Pro</option>
                      <option value="next">Plano NEXT</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 pl-0.5">
                      Ciclo de Cobrança
                    </label>
                    <select
                      value={editForm.billing_cycle}
                      onChange={(e) => setEditForm({ ...editForm, billing_cycle: e.target.value })}
                      className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#e13a40] transition-all cursor-pointer font-body"
                    >
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                </div>

                {/* Expiration date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#e13a40] pl-0.5 flex items-center gap-1.5 font-bold">
                    <Calendar className="h-3.5 w-3.5" />
                    Data de Expiração / Vencimento
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.trial_ends_at}
                    onChange={(e) => setEditForm({ ...editForm, trial_ends_at: e.target.value })}
                    className="w-full bg-[#121214] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-all cursor-pointer font-body"
                  />
                </div>

                {/* Submit button */}
                <div className="flex gap-3 pt-4 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-10 rounded-xl border border-zinc-800 bg-[#0e0e11] hover:bg-zinc-900 text-xs font-bold text-zinc-450 hover:text-white uppercase tracking-wider transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#e13a40] to-orange-600 hover:from-[#ff483d] hover:to-orange-500 text-xs font-bold text-white uppercase tracking-wider transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
