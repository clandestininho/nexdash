import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Layers, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  Check, 
  Search, 
  Clock, 
  Activity, 
  Bot, 
  Zap, 
  ChevronRight, 
  MessageCircle,
  Eye,
  AlertCircle,
  Send,
  Phone,
  User,
  Shield,
  CornerDownLeft,
  X,
  Volume2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { apiFetch } from '../lib/api';
import { socket } from '../lib/socket';
import { playBeep, playNotification } from '../lib/sound';
import { getStageColor, getStageLabel } from '../lib/stages';
import { cn, formatRelativeTime, formatPhone } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

export default function WhatsAppPage({ activeTab: initialActiveTab = 'conversas' }) {
  const activeUserObj = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }, []);
  const activeUserName = activeUserObj?.name || 'Gleison';
  const activeUserInitials = activeUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'GL';

  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [quickMessages, setQuickMessages] = useState(() => {
    const stored = localStorage.getItem('dgflow_quick_messages');
    if (stored) return JSON.parse(stored);
    return [
      { id: '1', title: '👋 Apresentação', content: 'Olá! Sou o assistente da nossa equipe. Como posso te ajudar hoje?' },
      { id: '2', title: '📝 Link de Cadastro', content: 'Perfeito! Para prosseguirmos, por favor preencha seus dados de cadastro no link a seguir: {{LINK_CADASTRO}}' },
      { id: '3', title: '💰 Proposta Comercial', content: 'Olá! Acabei de enviar sua proposta comercial para o seu e-mail. Vamos agendar uma breve chamada para alinhar os detalhes?' },
      { id: '4', title: '💳 Dados Pix', content: 'Aqui estão os dados para pagamento via PIX: Chave CNPJ: 12.345.678/0001-99 (Nexdash CRM).' }
    ];
  });

  const getDynamicLink = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || '1';
    return `${window.location.origin}/register-lead?user=${userId}`;
  };

  const processMessagePlaceholder = (content) => {
    return content.replace(/{{LINK_CADASTRO}}/g, getDynamicLink());
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChip, setFilterChip] = useState('todas'); // 'todas' | 'ativas' | 'sem_atendente' etc.
  
  // AI Suggestion Assistant state
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showAiBox, setShowAiBox] = useState(false);

  // Settings & Automations CRUD state
  const [settings, setSettings] = useState({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  const [subTabAutomacoes, setSubTabAutomacoes] = useState('automacoes'); // 'automacoes' | 'atividade'
  const [selectedPipeIdAutomacoes, setSelectedPipeIdAutomacoes] = useState('principal');
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [automacoesFilter, setAutomacoesFilter] = useState('todas');

  const [isTestingKey, setIsTestingKey] = useState(null); // 'gemini' | 'anthropic' | null
  const [testResults, setTestResults] = useState({ gemini: null, anthropic: null });

  const handleTestApiKey = async (provider) => {
    setIsTestingKey(provider);
    setTestResults(prev => ({ ...prev, [provider]: null }));
    
    try {
      const key = provider === 'gemini' ? settings.gemini_api_key : settings.anthropic_api_key;
      const res = await apiFetch('/api/settings/test-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key })
      });
      if (res.ok) {
        setTestResults(prev => ({ ...prev, [provider]: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, [provider]: 'error' }));
      }
    } catch (err) {
      console.error('[WhatsAppPage] API test error:', err);
      setTestResults(prev => ({ ...prev, [provider]: 'error' }));
    } finally {
      setIsTestingKey(null);
    }
  };

  const parsedPipelines = React.useMemo(() => {
    if (settings && settings.dgflow_custom_pipelines) {
      try {
        return JSON.parse(settings.dgflow_custom_pipelines);
      } catch (err) {
        console.error('Error parsing custom pipelines in WhatsAppPage:', err);
      }
    }
    return [
      {
        id: 'principal',
        name: 'Pipeline Principal',
        stages: [
          { id: 'novo-lead', label: 'Novo Lead' },
          { id: 'qualificando', label: 'Qualificando' },
          { id: 'proposta-enviada', label: 'Proposta Enviada' },
          { id: 'negociando', label: 'Em Negociação' },
          { id: 'fechado', label: 'Fechado' },
          { id: 'perdido', label: 'Perdido' }
        ]
      }
    ];
  }, [settings]);

  // Groups State
  const [groups, setGroups] = useState([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // Attendants State
  const [attendants, setAttendants] = useState([]);
  
  useEffect(() => {
    const loadAttendants = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.team_members) {
            const list = JSON.parse(data.team_members);
            const mapped = list.map(m => ({
              id: m.id,
              name: m.name,
              role: m.role,
              initials: m.avatar || m.name.slice(0, 2).toUpperCase(),
              activeChats: m.status === 'Ativo' ? 12 : 0,
              sentMessages: m.status === 'Ativo' ? 154 : 0,
              session: m.status === 'Ativo' ? 'Sessão Conectada 🟢' : 'Inativo 🔴'
            }));
            setAttendants(mapped);
          } else {
            // Default active proprietor fallback
            const name = activeUserName;
            const initials = activeUserInitials;
            setAttendants([
              { id: '1', name: name, role: 'Proprietário', initials: initials, activeChats: 0, sentMessages: 0, session: 'WhatsApp da equipe' }
            ]);
          }
        }
      } catch (err) {
        console.error('[WhatsAppPage] Error fetching team attendants:', err);
      }
    };
    loadAttendants();

    // Sincronize automatically on Equipe page changes
    const syncTeam = (e) => {
      const list = e.detail;
      if (Array.isArray(list)) {
        const mapped = list.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          initials: m.avatar || m.name.slice(0, 2).toUpperCase(),
          activeChats: m.status === 'Ativo' ? 12 : 0,
          sentMessages: m.status === 'Ativo' ? 154 : 0,
          session: m.status === 'Ativo' ? 'Sessão Conectada 🟢' : 'Inativo 🔴'
        }));
        setAttendants(mapped);
      }
    };
    window.addEventListener('team_members_updated', syncTeam);
    return () => window.removeEventListener('team_members_updated', syncTeam);
  }, [activeUserName, activeUserInitials]);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [selectedAgentForActivity, setSelectedAgentForActivity] = useState(null);
  const [agentMetrics, setAgentMetrics] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);
  const [isLoadingAgentActivity, setIsLoadingAgentActivity] = useState(false);

  const handleViewAgentActivity = async (agent) => {
    setSelectedAgentForActivity(agent);
    setIsLoadingAgentActivity(true);
    try {
      const metricsRes = await apiFetch('/api/metrics');
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setAgentMetrics(metricsData);
      }
      const logsRes = await apiFetch('/api/log');
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAgentLogs(Array.isArray(logsData) ? logsData.filter(l => l.was_manual === 1) : []);
      }
    } catch (err) {
      console.error('[WhatsAppPage] Error loading agent activity:', err);
    } finally {
      setIsLoadingAgentActivity(false);
    }
  };

  const messagesEndRef = useRef(null);

  // Synchronize initial active tab from route props
  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  // Fetch unique conversations on mount or tab change
  const fetchConversations = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const res = await apiFetch('/api/whatsapp/chats');
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('[WhatsAppPage] Failed to fetch conversations:', err);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'conversas') {
      fetchConversations();
    }
  }, [activeTab, fetchConversations]);

  // Fetch log activity when activity subtab is toggled
  useEffect(() => {
    if (activeTab === 'automacoes' && subTabAutomacoes === 'atividade') {
      const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
          const res = await apiFetch('/api/log');
          if (res.ok) {
            const data = await res.json();
            setLogs(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('[WhatsAppPage] Failed to load activity logs:', err);
        } finally {
          setIsLoadingLogs(false);
        }
      };
      fetchLogs();
    }
  }, [activeTab, subTabAutomacoes]);

  // Fetch groups when groups tab is mounted
  const fetchGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const res = await apiFetch('/api/whatsapp/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('[WhatsAppPage] Failed to load groups:', err);
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'grupos') {
      fetchGroups();
    }
  }, [activeTab, fetchGroups]);

  // Load automation settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('[WhatsAppPage] Error loading settings:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'automacoes') {
      fetchSettings();
    }
  }, [activeTab, fetchSettings]);

  // Fetch messages when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        setAiSuggestion('');
        setShowAiBox(false);
        try {
          const res = await apiFetch(`/api/contacts/${selectedContact.id}/messages`);
          if (res.ok) {
            const data = await res.json();
            setChatMessages(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('[WhatsAppPage] Error loading messages:', err);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      fetchMessages();
    } else {
      setChatMessages([]);
    }
  }, [selectedContact]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoadingMessages]);

  // Sockets real-time triggers listener
  useEffect(() => {
    const handleNewMessage = (msg) => {
      // 1. If currently chatting with this contact, append the message
      if (selectedContact && String(msg.contact_id) === String(selectedContact.id)) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      // Play premium synthesized notification tone for new incoming WhatsApp messages!
      if (msg.from_me !== 1) {
        playNotification();
      }

      // 2. Update conversations list dynamically (last message, activity) and move to top
      setConversations((prev) => {
        const index = prev.findIndex((c) => String(c.id) === String(msg.contact_id));
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            last_message: msg.content,
            last_activity: msg.timestamp || new Date().toISOString()
          };
          const item = updated.splice(index, 1)[0];
          return [item, ...updated];
        } else {
          // If new contact, background fetch chats to register cleanly
          fetchConversations();
          return prev;
        }
      });
    };

    const handleContactUpdated = (updatedContact) => {
      // Update contact CRM stages or detail properties dynamically
      setConversations((prev) => {
        return prev.map((c) => String(c.id) === String(updatedContact.id) ? { ...c, ...updatedContact } : c);
      });

      if (selectedContact && String(selectedContact.id) === String(updatedContact.id)) {
        setSelectedContact((prev) => ({ ...prev, ...updatedContact }));
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('contact:updated', handleContactUpdated);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('contact:updated', handleContactUpdated);
    };
  }, [selectedContact, fetchConversations]);

  // Send manual message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!msgInput.trim() || !selectedContact || isSending) return;

    const textToSend = msgInput;
    setMsgInput(''); // clear immediately for smooth UX
    setIsSending(true);

    try {
      const res = await apiFetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid: selectedContact.id, text: textToSend })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao enviar mensagem.');
        setMsgInput(textToSend); // restore on failure
      }
    } catch (err) {
      console.error('[WhatsAppPage] Error manual sending:', err);
      alert('Falha ao enviar mensagem pelo celular.');
      setMsgInput(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  // Generate AI Suggestion (Gemini or Claude)
  const handleAiSuggest = async () => {
    if (!selectedContact || isAiSuggesting) return;
    setIsAiSuggesting(true);
    setAiSuggestion('');
    setShowAiBox(true);

    try {
      const res = await apiFetch('/api/whatsapp/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid: selectedContact.id })
      });

      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data.suggestion || 'Não foi possível gerar uma sugestão de IA.');
      } else {
        const err = await res.json();
        setAiSuggestion(`Erro: ${err.error || 'Falha ao obter recomendação.'}`);
      }
    } catch (err) {
      console.error('[WhatsAppPage] AI suggestion failed:', err);
      setAiSuggestion('Falha ao conectar com o serviço de IA.');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  // Update Settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    setSaveFeedback(null);

    try {
      const res = await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSaveFeedback('success');
      } else {
        setSaveFeedback('error');
      }
    } catch (err) {
      console.error('[WhatsAppPage] Error saving settings:', err);
      setSaveFeedback('error');
    } finally {
      setIsSavingSettings(false);
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Add dynamic initials colors for contact avatars
  const getInitialsColor = (name) => {
    const colors = [
      'bg-red-500/20 text-red-400 border-red-500/30',
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-pink-500/20 text-pink-400 border-pink-500/30',
    ];
    let sum = 0;
    for (let i = 0; i < (name || '').length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  // Filter conversations list on search and filter chips
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterChip === 'todas') return true;
    if (filterChip === 'ativas') return c.current_stage !== 'entregue' && c.current_stage !== 'perdido';
    if (filterChip === 'sem_atendente') return true; // mock filter behavior or extend DB schema later
    if (filterChip === 'resolvidas') return c.current_stage === 'entregue';
    return c.current_stage === filterChip;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 text-zinc-100 font-body">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {activeTab === 'conversas' && <MessageSquare className="h-6 w-6 text-[#e13a40]" />}
            {activeTab === 'atendentes' && <Users className="h-6 w-6 text-[#e13a40]" />}
            {activeTab === 'automacoes' && <Settings className="h-6 w-6 text-[#e13a40]" />}
            {activeTab === 'grupos' && <Layers className="h-6 w-6 text-[#e13a40]" />}
            {activeTab === 'conversas' && 'Painel de Atendimento'}
            {activeTab === 'atendentes' && 'Gestão de Atendentes'}
            {activeTab === 'automacoes' && 'Configurações & Automações'}
            {activeTab === 'grupos' && 'Monitor de Grupos'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {activeTab === 'conversas' && 'Central integrada de chats em tempo real com classificador de IA.'}
            {activeTab === 'atendentes' && 'Configure atendentes do time e distribua as conversas automaticamente.'}
            {activeTab === 'automacoes' && 'Configure regras, gatilhos de palavras-chave por estágio e provedores de IA.'}
            {activeTab === 'grupos' && 'Acompanhe grupos participantes do seu WhatsApp e monitore novos leads.'}
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-3">
          {activeTab === 'conversas' && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Disponível</span>
              </div>
            </>
          )}

          {activeTab === 'atendentes' && (
            <button 
              onClick={() => setShowAddAgentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white transition-all shadow-lg shadow-[#e13a40]/10"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar atendente</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-[#1f1f23] overflow-x-auto pb-1.5 scrollbar-none">
        {[
          { id: 'conversas', label: 'Conversas', icon: MessageSquare },
          { id: 'atendentes', label: 'Atendentes', icon: Users },
          { id: 'automacoes', label: 'Automações', icon: Settings },
          { id: 'grupos', label: 'Monitor de Grupos', icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all shrink-0 rounded-t-md ${
                isActive
                  ? 'border-[#e13a40] text-white bg-zinc-900/30'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-950/40'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#e13a40]' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="mt-4">
        
        {/* PANEL: CONVERSAS (Rich Split-pane Live Chat Console) */}
        {activeTab === 'conversas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[680px]">
            
            {/* Sidebar list (4 cols) */}
            <div className="lg:col-span-4 bg-[#0c0c0e] border border-[#1f1f23] rounded-2xl flex flex-col overflow-hidden h-full">
              
              {/* Sidebar Header: Search + Filter Chips */}
              <div className="p-4 border-b border-[#1f1f23] space-y-3 bg-[#08080a]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar contatos..."
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#e13a40] outline-none transition-colors"
                  />
                </div>

                {/* Filter chip selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {[
                    { id: 'todas', label: 'Todas' },
                    { id: 'ativas', label: 'Ativas' },
                    { id: 'sem_atendente', label: 'Sem atendente' },
                    { id: 'novo-lead', label: 'Novos' },
                    { id: 'fechado', label: 'Fechados' },
                    { id: 'resolvidas', label: 'Resolvidas' }
                  ].map((chip) => {
                    const isActive = filterChip === chip.id;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setFilterChip(chip.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all shrink-0 uppercase tracking-wide",
                          isActive
                            ? "bg-[#e13a40]/15 border-[#e13a40] text-white shadow-[0_0_10px_rgba(255,72,61,0.08)]"
                            : "bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-white"
                        )}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contacts List Body */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {isLoadingChats ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-6 w-6 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((c) => {
                    const isSelected = selectedContact && selectedContact.id === c.id;
                    const initials = (c.name || 'S').slice(0, 2).toUpperCase();
                    const stageColor = getStageColor(c.current_stage) || '#9E9E9E';

                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedContact(c)}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-xl transition-all border text-left",
                          isSelected
                            ? "bg-[#e13a40]/10 border-[#e13a40]/40 shadow-sm"
                            : "bg-transparent border-transparent hover:bg-zinc-900/40 hover:border-zinc-900"
                        )}
                      >
                        {/* Avatar */}
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs border flex-shrink-0 relative",
                          getInitialsColor(c.name || c.phone)
                        )}>
                          {initials}
                          {/* Live Status indicator */}
                          <span 
                            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0c0c0e]"
                            style={{ backgroundColor: stageColor }}
                            title={getStageLabel(c.current_stage)}
                          />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={cn(
                              "text-xs font-bold truncate",
                              isSelected ? "text-white" : "text-zinc-200"
                            )}>
                              {c.name || formatPhone(c.phone)}
                            </h4>
                            <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                              {c.last_activity ? formatRelativeTime(c.last_activity).replace('atrás', '').trim() : ''}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 truncate line-clamp-1 leading-normal font-body">
                            {c.last_message || 'Nenhuma mensagem trocada.'}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span 
                              className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider font-mono border"
                              style={{ 
                                color: stageColor, 
                                borderColor: `${stageColor}30`,
                                backgroundColor: `${stageColor}08`
                              }}
                            >
                              {getStageLabel(c.current_stage)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-zinc-700" />
                    </div>
                    <p className="text-xs text-zinc-500 font-body">Nenhuma conversa encontrada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Pane (8 cols) */}
            <div className="lg:col-span-8 bg-[#0c0c0e] border border-[#1f1f23] rounded-2xl flex flex-col overflow-hidden h-full relative">
              {selectedContact ? (
                <>
                  {/* Chat Console Header */}
                  <div className="p-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#08080a] z-10">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs border",
                        getInitialsColor(selectedContact.name)
                      )}>
                        {selectedContact.name?.slice(0, 2).toUpperCase() || 'S'}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white leading-none">
                          {selectedContact.name || 'Contato'}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-1.5">
                          <Phone className="h-2.5 w-2.5 text-zinc-600" />
                          {formatPhone(selectedContact.phone)}
                        </p>
                      </div>
                    </div>

                    {/* Header Action Tools */}
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono border"
                        style={{ 
                          color: getStageColor(selectedContact.current_stage), 
                          borderColor: `${getStageColor(selectedContact.current_stage)}35`,
                          backgroundColor: `${getStageColor(selectedContact.current_stage)}10`
                        }}
                      >
                        {getStageLabel(selectedContact.current_stage)}
                      </span>

                      {/* IA Suggestion Trigger */}
                      <button
                        onClick={handleAiSuggest}
                        disabled={isAiSuggesting}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-200",
                          isAiSuggesting
                            ? "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-[#e13a40]/10 border-[#e13a40]/30 hover:border-[#e13a40]/60 text-red-400 hover:text-red-300 hover:bg-[#e13a40]/15"
                        )}
                        title="Perguntar ao Copiloto de IA o que responder"
                      >
                        <Sparkles className={cn("h-3.5 w-3.5", isAiSuggesting && "animate-spin text-zinc-500")} />
                        <span>{isAiSuggesting ? 'Pensando...' : 'IA Sugerir'}</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Recommendation Box Slider */}
                  {showAiBox && (
                    <div className="bg-gradient-to-r from-zinc-950 to-[#0e0a0a] border-b border-[#e13a40]/25 p-4 animate-slide-down relative">
                      <button 
                        onClick={() => setShowAiBox(false)}
                        className="absolute right-3 top-3 p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex gap-2">
                        <Sparkles className="h-4 w-4 text-[#e13a40] mt-0.5 flex-shrink-0 animate-pulse" />
                        <div className="flex-1 space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Sugestão do Copiloto de IA</span>
                            {isAiSuggesting ? (
                              <div className="flex items-center gap-2 py-2 text-xs text-zinc-400 italic">
                                <div className="h-3 w-3 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
                                <span>Analisando histórico de mensagens e redigindo resposta...</span>
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-200 mt-1 italic font-body leading-relaxed border-l-2 border-[#e13a40]/40 pl-3 bg-black/30 p-2 rounded">
                                "{aiSuggestion}"
                              </p>
                            )}
                          </div>

                          {!isAiSuggesting && aiSuggestion && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setMsgInput(aiSuggestion);
                                  setShowAiBox(false);
                                }}
                                className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-200"
                              >
                                Usar no Campo
                              </button>
                              <button
                                onClick={async () => {
                                  setMsgInput(aiSuggestion);
                                  setShowAiBox(false);
                                  // Auto send
                                  setTimeout(async () => {
                                    await apiFetch('/api/whatsapp/send', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ jid: selectedContact.id, text: aiSuggestion })
                                    });
                                  }, 50);
                                  setMsgInput('');
                                }}
                                className="px-3 py-1.5 rounded bg-[#e13a40] hover:bg-[#c52f34] text-[10px] font-bold text-white flex items-center gap-1 shadow-md shadow-[#e13a40]/10"
                              >
                                Enviar Direto
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Messages Bubble Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0c] scrollbar-thin">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center py-20 h-full">
                        <div className="h-6 w-6 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : chatMessages.length > 0 ? (
                      chatMessages.map((msg) => {
                        const isMe = msg.from_me === 1;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex flex-col max-w-[75%] rounded-2xl py-2 px-3.5 text-xs shadow-sm leading-relaxed break-words whitespace-pre-wrap transition-all duration-150 font-medium",
                              isMe
                                ? "bg-[#e13a40]/20 border border-[#e13a40]/30 text-red-100 self-end rounded-tr-none ml-auto shadow-[0_0_12px_rgba(255,72,61,0.03)]"
                                : "bg-[#18181b] border border-zinc-800 text-zinc-200 self-start rounded-tl-none mr-auto"
                            )}
                          >
                            <p className="font-body text-zinc-100 selection:bg-[#e13a40]/40">{msg.content}</p>
                            <span className={cn(
                              "text-[9px] mt-1 font-body self-end block text-right",
                              isMe ? "text-red-300/60" : "text-zinc-500"
                            )}>
                              {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                        <MessageCircle className="h-8 w-8 text-zinc-600" />
                        <p className="text-xs text-zinc-500 font-body">Nenhuma mensagem recente registrada no CRM.</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Bottom form */}
                  <form 
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-[#1f1f23] bg-[#0c0c0e] flex items-center gap-3 relative"
                  >
                    {/* Quick Messages Flyout Popover */}
                    {showQuickMessages && (
                      <div className="absolute bottom-16 left-4 right-4 bg-[#121212] border border-[#1f1f1f] rounded-2xl p-4 shadow-2xl z-50 max-h-60 overflow-y-auto space-y-3 animate-fade-in text-left">
                        <div className="flex items-center justify-between pb-2 border-b border-[#1f1f1f]">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">⚡ Mensagens Rápidas</span>
                          <button 
                            type="button"
                            onClick={() => setShowQuickMessages(false)}
                            className="text-zinc-500 hover:text-white text-xs font-bold"
                          >
                            Fechar
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {quickMessages.map((qm) => {
                            const parsedContent = processMessagePlaceholder(qm.content);
                            return (
                              <div key={qm.id} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between gap-2 text-xs">
                                <div>
                                  <span className="font-bold text-white block mb-0.5">{qm.title}</span>
                                  <p className="text-zinc-400 text-[10px] line-clamp-2">{parsedContent}</p>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMsgInput(parsedContent);
                                      setShowQuickMessages(false);
                                    }}
                                    className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold rounded text-zinc-200"
                                  >
                                    Usar no Campo
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setShowQuickMessages(false);
                                      setIsSending(true);
                                      try {
                                        await apiFetch('/api/whatsapp/send-message', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            jid: selectedContact.id,
                                            message: parsedContent
                                          })
                                        });
                                        setChatMessages(prev => [
                                          ...prev,
                                          {
                                            id: 'msg-' + Date.now(),
                                            contact_id: selectedContact.id,
                                            content: parsedContent,
                                            from_me: 1,
                                            timestamp: new Date().toISOString()
                                          }
                                        ]);
                                      } catch (err) {
                                        console.error('Erro ao enviar direto:', err);
                                      } finally {
                                        setIsSending(false);
                                      }
                                    }}
                                    className="px-2 py-1 bg-[#e13a40] hover:bg-[#c52f34] text-[10px] font-bold rounded text-white"
                                  >
                                    Enviar Direto
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowQuickMessages(!showQuickMessages)}
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center border text-zinc-400 hover:text-white transition-all shadow-md active:scale-95 flex-shrink-0 bg-zinc-900 border-zinc-800"
                      )}
                      title="Mensagens Rápidas"
                    >
                      <Zap className="h-4 w-4 text-amber-500" />
                    </button>

                    <input
                      type="text"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      placeholder={isSending ? "Enviando..." : "Digite sua mensagem..."}
                      disabled={isSending}
                      className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-[#e13a40]/80 outline-none transition-colors"
                    />

                    <button
                      type="submit"
                      disabled={isSending || !msgInput.trim()}
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center text-white transition-all shadow-md active:scale-95 flex-shrink-0",
                        msgInput.trim() 
                          ? "bg-[#e13a40] hover:bg-[#c52f34] shadow-[#e13a40]/10 cursor-pointer" 
                          : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                      )}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </>
              ) : (
                /* No selected contact empty screen */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#09090b]">
                  {/* Glowing background circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#e13a40]/5 blur-[80px] pointer-events-none" />

                  <div className="h-16 w-16 rounded-3xl bg-zinc-950 border border-zinc-900 flex items-center justify-center relative shadow-inner mb-4">
                    <MessageSquare className="h-8 w-8 text-[#e13a40] animate-pulse" />
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#09090b]" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">Console de Atendimento Integrado</h3>
                  <p className="text-xs text-zinc-500 font-body max-w-xs mx-auto mt-2 leading-relaxed">
                    Selecione uma das conversas ativas listadas à esquerda para abrir a janela de bate-papo, gerar respostas com IA e interagir com o cliente.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* PANEL: ATENDENTES */}
        {activeTab === 'atendentes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Render Attendant Cards */}
              {attendants.map((agent) => (
                <Card key={agent.id} className="bg-[#0c0c0e] border-[#1f1f23] text-white">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-[#e13a40] flex items-center justify-center font-bold text-white text-xs">
                        {agent.initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{agent.name}</h3>
                        <p className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 inline-block font-mono mt-1">
                          {agent.role}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-900" />

                    <div className="space-y-2 text-xs font-body text-zinc-400">
                      <div className="flex justify-between">
                        <span>Conversas Ativas</span>
                        <strong className="text-white font-mono">{agent.activeChats}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Mensagens Enviadas</span>
                        <strong className="text-white font-mono">{agent.sentMessages}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessão de Serviço</span>
                        <span className="text-emerald-400 font-medium">{agent.session}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleViewAgentActivity(agent)}
                        className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Atividade</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add agent trigger card */}
              <button
                onClick={() => setShowAddAgentModal(true)}
                className="rounded-2xl border-2 border-dashed border-zinc-900 hover:border-[#e13a40]/50 bg-zinc-950/20 hover:bg-[#e13a40]/5 p-6 flex flex-col items-center justify-center text-center space-y-3 transition-all cursor-pointer min-h-[220px]"
              >
                <div className="h-10 w-10 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-zinc-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Adicionar Atendente</h3>
                  <p className="text-[10px] text-zinc-500 font-body max-w-xs mx-auto mt-1 leading-relaxed">
                    Compartilhe a carga de atendimento com outros membros do time.
                  </p>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* PANEL: AUTOMACÕES (Keywords & AI Settings CRUD Panel) */}
        {activeTab === 'automacoes' && (
          <div className="space-y-6">
            
            {/* Header sub-tabs: Automações vs Atividade */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-900 max-w-xs">
              <button
                onClick={() => setSubTabAutomacoes('automacoes')}
                className={cn(
                  "flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all",
                  subTabAutomacoes === 'automacoes' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                Automações
              </button>
              <button
                onClick={() => setSubTabAutomacoes('atividade')}
                className={cn(
                  "flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all",
                  subTabAutomacoes === 'atividade' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                Atividade
              </button>
            </div>

            {subTabAutomacoes === 'automacoes' ? (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Funnel pipeline selector cards */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wide">Funis de Atendimento</label>
                  <p className="text-[10px] text-zinc-500 font-body block leading-relaxed -mt-1.5">
                    Selecione um funil para configurar as automações de inteligência artificial ou palavras-chave das etapas.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {parsedPipelines.map(pipe => {
                      const isSelected = selectedPipeIdAutomacoes === pipe.id;
                      return (
                        <div
                          key={pipe.id}
                          onClick={() => setSelectedPipeIdAutomacoes(pipe.id)}
                          className={cn(
                            "p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[90px] select-none",
                            isSelected 
                              ? "bg-[#161619] border-[#e13a40] shadow-glow" 
                              : "bg-[#0c0c0e] border-[#1f1f23] hover:border-zinc-800"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs font-bold", isSelected ? "text-white" : "text-zinc-400")}>{pipe.name}</span>
                            {pipe.id === 'principal' ? (
                              <span className="text-[9px] bg-[#e13a40]/10 text-[#e13a40] border border-[#e13a40]/20 rounded px-1.5 py-0.5 font-extrabold uppercase">IA Ativa</span>
                            ) : (
                              <span className="text-[9px] bg-zinc-900 text-zinc-500 border border-zinc-800 rounded px-1.5 py-0.5 font-extrabold uppercase">Manual</span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-550 mt-2 font-medium">
                            {pipe.stages?.length || 0} etapas configuradas
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedPipeIdAutomacoes === 'principal' ? (
                  <>
                    {/* 1. Global AI Parameters Configuration */}
                    <Card className="bg-[#0c0c0e] border-[#1f1f23]">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                          <Bot className="h-4 w-4 text-[#e13a40]" />
                          Configuração Geral de IA
                        </CardTitle>
                        <CardDescription className="text-zinc-500 text-xs">
                          Selecione o provedor de Inteligência Artificial e a sensibilidade do autopilot.
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          
                          {/* AI Provider selector */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wide">Provedor de IA</label>
                            <select
                              value={settings.ai_provider || 'gemini'}
                              onChange={(e) => handleSettingChange('ai_provider', e.target.value)}
                              className="w-full h-10 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-white focus:border-[#e13a40] outline-none cursor-pointer"
                            >
                              <option value="gemini">Google Gemini 1.5 Flash (Gratuito)</option>
                              <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                            </select>
                          </div>

                          {/* Confidence Threshold */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wide">Confiança Mínima ({Math.round(parseFloat(settings.min_confidence || '0.85') * 100)}%)</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="0.5"
                                max="0.95"
                                step="0.05"
                                value={settings.min_confidence || '0.85'}
                                onChange={(e) => handleSettingChange('min_confidence', e.target.value)}
                                className="flex-1 accent-[#e13a40] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* Cooldown Timer */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wide">Frequência / Cooldown (Minutos)</label>
                            <input
                              type="number"
                              min="1"
                              max="180"
                              value={settings.cooldown_minutes || '30'}
                              onChange={(e) => handleSettingChange('cooldown_minutes', e.target.value)}
                              className="w-full h-10 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-white focus:border-[#e13a40] outline-none"
                            />
                          </div>

                        </div>
                      </CardContent>
                    </Card>

                    {/* 1.5. AI Auto-Responder Chatbot Configuration */}
                    <Card className="bg-[#0c0c0e] border-[#1f1f23]">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                          <Sparkles className="h-4 w-4 text-[#e13a40] animate-pulse-soft" />
                          🤖 Agente de Resposta Automática (Chatbot Ativo)
                        </CardTitle>
                        <CardDescription className="text-zinc-500 text-xs">
                          Permita que o Agente de IA responda as mensagens dos seus clientes no WhatsApp simulando um atendente humano.
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-white block">Status do Auto-Responder</span>
                            <span className="text-[10px] text-zinc-550 block leading-relaxed">
                              Se ativado, a IA responderá de forma inteligente todas as conversas novas que entrarem em contato no WhatsApp.
                            </span>
                          </div>
                          
                          {/* Interactive Switch */}
                          <button
                            type="button"
                            onClick={() => handleSettingChange('ai_responder_enabled', settings.ai_responder_enabled === 'true' ? 'false' : 'true')}
                            className={cn(
                              "w-12 h-6 rounded-full p-1 transition-all duration-200 outline-none flex items-center shrink-0 cursor-pointer",
                              settings.ai_responder_enabled === 'true' ? 'bg-[#e13a40]' : 'bg-zinc-800'
                            )}
                          >
                            <span className={cn(
                              "h-4 w-4 rounded-full bg-white transition-all shadow-md transform",
                              settings.ai_responder_enabled === 'true' ? 'translate-x-6' : 'translate-x-0'
                            )} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                          {/* Responding Delay (seconds) */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wide">
                              Atraso na Resposta ({settings.ai_responder_delay || '4'} segundos)
                            </label>
                            <p className="text-[10px] text-zinc-550 font-body block leading-relaxed pb-1">
                              Tempo em que a IA simula o status de <strong>"digitando..."</strong> no WhatsApp antes de disparar a resposta. Torna a conversa mais natural.
                            </p>
                            <div className="flex items-center gap-3">
                              <input
                                type="range"
                                min="2"
                                max="15"
                                step="1"
                                value={settings.ai_responder_delay || '4'}
                                onChange={(e) => handleSettingChange('ai_responder_delay', e.target.value)}
                                className="flex-1 accent-[#e13a40] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* AI Instructions (Business Manual / FAQ) */}
                          <div className="space-y-2 pt-1">
                            <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wide">
                              Manual de Atendimento da Empresa (FAQ / Instruções)
                            </label>
                            <p className="text-[10px] text-zinc-550 font-body block leading-relaxed">
                              Escreva o FAQ, preços de serviços, horários e termos da sua empresa. A IA responderá com base estritamente nestas instruções.
                            </p>
                            <textarea
                              rows={12}
                              value={settings.ai_responder_instructions || ''}
                              onChange={(e) => handleSettingChange('ai_responder_instructions', e.target.value)}
                              placeholder="Digite aqui as regras de negócio da sua empresa..."
                              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-xs text-white focus:border-[#e13a40] outline-none font-body leading-relaxed"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. AI API Keys Card */}
                    <Card className="bg-[#0c0c0e] border-[#1f1f23]">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                          <Shield className="h-4 w-4 text-emerald-400" />
                          Chaves de API (Inteligência Artificial)
                        </CardTitle>
                        <CardDescription className="text-zinc-500 text-xs">
                          Insira suas chaves de API para habilitar as automações de classificação e respostas inteligentes do copiloto.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Gemini Key Input */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wide">Chave Google Gemini API</label>
                              <a 
                                href="https://aistudio.google.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-0.5"
                              >
                                Pegar chave gratuita ↗
                              </a>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="password"
                                value={settings.gemini_api_key || ''}
                                onChange={(e) => handleSettingChange('gemini_api_key', e.target.value)}
                                placeholder="AIzaSy..."
                                className="flex-1 h-10 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-white focus:border-[#e13a40] outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleTestApiKey('gemini')}
                                disabled={isTestingKey}
                                className="px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-[10px] font-bold hover:bg-zinc-900 text-zinc-300 cursor-pointer"
                              >
                                {isTestingKey === 'gemini' ? 'Testando...' : 'Testar'}
                              </button>
                            </div>
                            {testResults.gemini === 'success' && (
                              <p className="text-[10px] text-emerald-400 font-bold">✓ Conectado com sucesso!</p>
                            )}
                            {testResults.gemini === 'error' && (
                              <p className="text-[10px] text-rose-500 font-bold">✗ Chave inválida ou sem cota.</p>
                            )}
                          </div>

                          {/* Claude Key Input */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wide">Chave Anthropic Claude API</label>
                              <a 
                                href="https://console.anthropic.com/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-0.5"
                              >
                                Pegar chave ↗
                              </a>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="password"
                                value={settings.anthropic_api_key || ''}
                                onChange={(e) => handleSettingChange('anthropic_api_key', e.target.value)}
                                placeholder="sk-ant-..."
                                className="flex-1 h-10 rounded-lg border border-zinc-900 bg-zinc-950 px-3 text-xs text-white focus:border-[#e13a40] outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleTestApiKey('anthropic')}
                                disabled={isTestingKey}
                                className="px-3 rounded-lg border border-zinc-900 bg-zinc-950 text-[10px] font-bold hover:bg-zinc-900 text-zinc-300 cursor-pointer"
                              >
                                {isTestingKey === 'anthropic' ? 'Testando...' : 'Testar'}
                              </button>
                            </div>
                            {testResults.anthropic === 'success' && (
                              <p className="text-[10px] text-emerald-400 font-bold">✓ Conectado com sucesso!</p>
                            )}
                            {testResults.anthropic === 'error' && (
                              <p className="text-[10px] text-rose-500 font-bold">✗ Chave inválida ou sem cota.</p>
                            )}
                          </div>

                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. Keywords per CRM stage triggers */}
                    <Card className="bg-[#0c0c0e] border-[#1f1f23]">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Palavras-chave de Triagem por Estágio
                        </CardTitle>
                        <CardDescription className="text-zinc-500 text-xs">
                          Defina palavras e frases separadas por vírgula. Quando trocadas na conversa, o classificador usará como gatilho para atualizar a etapa do lead no funil.
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {[
                            { key: 'keywords_novo-lead', label: '1. Novo Lead (Primeiro Contato)', desc: 'portfolio, orcamento, preco, disponibilidade...' },
                            { key: 'keywords_qualificando', label: '2. Qualificando (Detalhamento)', desc: 'casamento, aniversario, ensaio, data, local...' },
                            { key: 'keywords_proposta-enviada', label: '3. Proposta Enviada', desc: 'pdf, anexo, proposta enviada, tabela...' },
                            { key: 'keywords_negociando', label: '4. Negociando', desc: 'desconto, negociar, prazo, parcelar, tá caro...' },
                            { key: 'keywords_fechado', label: '5. Fechado (Contrato/Pix)', desc: 'fechado, contrato, pix, comprovante, fechamos...' },
                            { key: 'keywords_em-producao', label: '6. Em Produção (Edição)', desc: 'andamento, progresso, previa, fotos prontas...' },
                            { key: 'keywords_entregue', label: '7. Entregue', desc: 'recebido, baixado, link, amei, incriveis...' },
                            { key: 'keywords_perdido', label: '8. Perdido (Cancelado)', desc: 'desisti, fechei com outro, nao vou fazer...' }
                          ].map((item) => (
                            <div key={item.key} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900/60 space-y-2">
                              <label className="text-[11px] font-bold text-zinc-300 block tracking-wide">{item.label}</label>
                              <textarea
                                rows="2"
                                value={settings[item.key] || ''}
                                onChange={(e) => handleSettingChange(item.key, e.target.value)}
                                placeholder={item.desc}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#e13a40] outline-none font-body leading-relaxed"
                              />
                            </div>
                          ))}

                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    {/* Warning / Info card for Manual Funnel */}
                    <Card className="bg-[#0c0c0e] border-[#1f1f23]">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          Funil 100% Manual
                        </CardTitle>
                        <CardDescription className="text-zinc-550 text-xs font-body">
                          O chatbot de resposta automática e a triagem de IA estão desativados para o funil "{parsedPipelines.find(p => p.id === selectedPipeIdAutomacoes)?.name || ''}".
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-xs text-zinc-400 leading-relaxed font-body">
                        As etapas deste funil são geridas manualmente pelos atendentes por meio do Kanban ou no detalhe do contato. A IA não interferirá no andamento dos contatos neste funil.
                      </CardContent>
                    </Card>

                    {/* Keywords per stage triggers for custom pipeline */}
                    <Card className="bg-[#0c0c0e] border-[#1f1f23]">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                          <Zap className="h-4 w-4 text-amber-500" />
                          Palavras-chave de Referência por Estágio
                        </CardTitle>
                        <CardDescription className="text-zinc-550 text-xs">
                          Adicione palavras ou expressões de referência para este estágio do funil customizado.
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(parsedPipelines.find(p => p.id === selectedPipeIdAutomacoes)?.stages || []).map((stage) => {
                            const itemKey = `keywords_${stage.id}`;
                            return (
                              <div key={stage.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900/60 space-y-2">
                                <label className="text-[11px] font-bold text-zinc-300 block tracking-wide">{stage.label}</label>
                                <textarea
                                  rows="2"
                                  value={settings[itemKey] || ''}
                                  onChange={(e) => handleSettingChange(itemKey, e.target.value)}
                                  placeholder="palavras, chaves..."
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#e13a40] outline-none font-body leading-relaxed"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Save button and status feedback */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-6 py-2.5 text-xs font-semibold rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white transition-all shadow-md shadow-[#e13a40]/10 flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingSettings ? (
                      <>
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <span>Salvar Configurações</span>
                    )}
                  </button>

                  {saveFeedback === 'success' && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in font-bold">
                      ✓ Configurações salvas e aplicadas com sucesso!
                    </span>
                  )}
                  {saveFeedback === 'error' && (
                    <span className="text-xs text-rose-500 flex items-center gap-1 animate-fade-in font-bold">
                      ✗ Falha técnica ao salvar no banco de dados.
                    </span>
                  )}
                </div>

              </form>
            ) : (
              /* SUBTAB: ATIVIDADE (AI Logs Timeline) */
              <Card className="bg-[#0c0c0e] border-[#1f1f23]">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                    <Activity className="h-4 w-4 text-[#e13a40]" />
                    Histórico de Triagem Automática por IA
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    Logs das transições de funil executadas autonomamente pelo copiloto de IA com base nas mensagens do WhatsApp.
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {isLoadingLogs ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="h-6 w-6 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : logs.length > 0 ? (
                    <div className="relative border-l border-zinc-900 pl-4 ml-2 space-y-6 py-2">
                      {logs.map((log) => {
                        const oldStageColor = getStageColor(log.previous_stage) || '#555';
                        const newStageColor = getStageColor(log.new_stage) || '#e13a40';
                        return (
                          <div key={log.id} className="relative group">
                            {/* Dot indicator */}
                            <span 
                              className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#0c0c0e] shadow-sm transition-transform duration-200"
                              style={{ backgroundColor: newStageColor }}
                            />
                            
                            <div className="space-y-1.5">
                              {/* Metadata */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <strong className="text-xs text-white">{log.contact_name || log.contact_id}</strong>
                                <span className="text-[10px] text-zinc-500 font-medium">•</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded font-mono border" style={{ color: oldStageColor, borderColor: `${oldStageColor}25`, backgroundColor: `${oldStageColor}08` }}>
                                  {getStageLabel(log.previous_stage) || 'Entrada'}
                                </span>
                                <ChevronRight className="h-3 w-3 text-zinc-600" />
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded font-mono border" style={{ color: newStageColor, borderColor: `${newStageColor}25`, backgroundColor: `${newStageColor}08` }}>
                                  {getStageLabel(log.new_stage)}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-medium">•</span>
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-bold font-mono px-1 rounded">
                                  {Math.round(parseFloat(log.confidence || '1') * 100)}% Confiança
                                </span>
                                {log.was_manual === 1 && (
                                  <span className="text-[9px] bg-[#e13a40]/15 text-red-200 border border-[#e13a40]/25 rounded font-bold px-1 font-mono">
                                    Manual
                                  </span>
                                )}
                              </div>

                              {/* Reason */}
                              {log.reason && (
                                <p className="text-xs text-zinc-300 font-body leading-relaxed bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900 max-w-3xl">
                                  {log.reason}
                                </p>
                              )}

                              <span className="text-[9.5px] font-semibold text-zinc-500 uppercase tracking-wider block font-mono">
                                {formatRelativeTime(log.created_at)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 opacity-60">
                      <Activity className="h-8 w-8 text-zinc-700" />
                      <p className="text-xs text-zinc-500 font-body">Nenhuma transição registrada no histórico de logs.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {/* PANEL: MONITOR DE GRUPOS */}
        {activeTab === 'grupos' && (
          <div className="space-y-6">
            <Card className="bg-[#0c0c0e] border-[#1f1f23]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
                    <Layers className="h-4 w-4 text-[#e13a40]" />
                    Grupos Participantes Ativos
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    Lista de grupos que você participa no celular sincronizados automaticamente via WhatsApp socket.
                  </CardDescription>
                </div>
                <button
                  onClick={fetchGroups}
                  disabled={isLoadingGroups}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[10px] font-bold text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Activity className={cn("h-3.5 w-3.5 text-zinc-400", isLoadingGroups && "animate-spin")} />
                  <span>Sincronizar</span>
                </button>
              </CardHeader>
              
              <CardContent className="pt-2">
                {isLoadingGroups ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="h-6 w-6 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : groups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                      <div 
                        key={group.id}
                        className="bg-zinc-950 border border-zinc-900 hover:border-[#e13a40]/30 hover:shadow-[0_0_12px_rgba(225,58,64,0.06)] p-4 rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-200"
                      >
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-white leading-normal truncate">{group.subject}</h4>
                          <p className="text-[10px] text-zinc-500 font-mono select-all truncate">{group.id}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-body">
                            <Users className="h-3.5 w-3.5 text-zinc-500" />
                            <span>{group.size} membros</span>
                          </div>

                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold border border-emerald-500/20 uppercase tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Ativo</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-zinc-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Nenhum grupo ativo encontrado</h4>
                      <p className="text-[10px] text-zinc-500 font-body max-w-xs mx-auto mt-1 leading-relaxed">
                        Conecte seu celular para que o CRM possa carregar os grupos participantes do WhatsApp.
                      </p>
                    </div>
                    <button
                      onClick={fetchGroups}
                      className="mt-2 px-4 py-2 text-xs font-semibold bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
                    >
                      Buscar Grupos Ativos
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>

      {/* ADICIONAR ATENDENTE MODAL */}
      {showAddAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in p-4">
          <div 
            className="w-full max-w-md bg-[#0c0c0e] border border-[#1f1f23] rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button 
              onClick={() => setShowAddAgentModal(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900/60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                Adicionar atendente do WhatsApp
              </h2>
              <p className="text-xs text-zinc-500 font-body leading-relaxed">
                Promova membros existentes do time como atendentes do WhatsApp.
              </p>
            </div>

            {/* Available members container */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Membros Disponíveis
              </span>
              
              {/* Member row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-600 to-[#e13a40] flex items-center justify-center font-bold text-white text-xs">
                    {activeUserInitials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{activeUserName}</h4>
                    <p className="text-[10px] text-zinc-500 font-body mt-1">Proprietário</p>
                  </div>
                </div>

                {/* Option selection triggers */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(`${activeUserName} já está configurado como Atendente Geral do WhatsApp da Equipe!`);
                      setShowAddAgentModal(false);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-[#e13a40]/30 hover:bg-[#e13a40]/5 text-[10px] font-bold text-zinc-200 transition-all cursor-pointer"
                  >
                    WhatsApp da equipe
                  </button>
                </div>
              </div>
            </div>

            {/* Cancel button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowAddAgentModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ATIVIDADE DO ATENDENTE MODAL */}
      {selectedAgentForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in p-4">
          <div 
            className="w-full max-w-lg bg-[#0c0c0e] border border-[#1f1f23] rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button 
              onClick={() => setSelectedAgentForActivity(null)}
              className="absolute right-4 top-4 p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900/60 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-[#e13a40] flex items-center justify-center font-bold text-white text-xs">
                {selectedAgentForActivity.initials}
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Atividade de {selectedAgentForActivity.name}
                </h2>
                <p className="text-xs text-zinc-500 font-body leading-none mt-1">
                  Painel de auditoria de operações manuais no WhatsApp CRM.
                </p>
              </div>
            </div>

            {isLoadingAgentActivity ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Attendant Metrics grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Ações Manuais', val: agentMetrics?.manualOverrides || 0, color: 'border-l-[#e13a40]' },
                    { label: 'Leads Fechados', val: agentMetrics?.conversionsToday || 0, color: 'border-l-emerald-500' },
                    { label: 'Chats Ativos', val: agentMetrics?.activeConversationsToday || 0, color: 'border-l-blue-500' }
                  ].map((stat, i) => (
                    <div key={i} className={`p-3 rounded-xl bg-zinc-950 border border-zinc-900 border-l-2 ${stat.color}`}>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">{stat.label}</span>
                      <strong className="text-base font-mono text-white mt-0.5 block">{stat.val}</strong>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Attendant manual actions timeline */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Histórico de Alterações Manuais
                  </span>

                  <div className="max-h-60 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                    {agentLogs.length > 0 ? (
                      agentLogs.map((log) => {
                        const oldColor = getStageColor(log.previous_stage) || '#555';
                        const newColor = getStageColor(log.new_stage) || '#e13a40';
                        return (
                          <div key={log.id} className="p-3 bg-zinc-950 border border-zinc-900/60 rounded-xl space-y-2">
                            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                              <span className="text-white font-bold">{log.contact_name || log.contact_id}</span>
                              <span className="text-zinc-600 font-semibold">•</span>
                              <span className="px-1 py-0.2 rounded border font-mono text-[9px] font-bold" style={{ color: oldColor, borderColor: `${oldColor}25`, backgroundColor: `${oldColor}05` }}>
                                {getStageLabel(log.previous_stage) || 'Entrada'}
                              </span>
                              <ChevronRight className="h-2.5 w-2.5 text-zinc-600" />
                              <span className="px-1 py-0.2 rounded border font-mono text-[9px] font-bold" style={{ color: newColor, borderColor: `${newColor}25`, backgroundColor: `${newColor}05` }}>
                                {getStageLabel(log.new_stage)}
                              </span>
                            </div>
                            
                            {log.reason && (
                              <p className="text-xs text-zinc-300 font-body leading-relaxed bg-zinc-900/40 p-2 rounded border border-zinc-900/60">
                                {log.reason}
                              </p>
                            )}

                            <span className="text-[9px] text-zinc-500 font-mono block text-right font-medium">
                              {formatRelativeTime(log.created_at)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-10 text-center flex flex-col items-center justify-center space-y-2 opacity-50">
                        <Activity className="h-6 w-6 text-zinc-700" />
                        <p className="text-xs text-zinc-500 font-body">Nenhuma alteração manual feita por este atendente.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAgentForActivity(null)}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                Fechar Painel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
