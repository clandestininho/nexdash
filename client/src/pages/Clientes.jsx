import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  MessageSquare, 
  ShieldAlert, 
  DollarSign, 
  Eye, 
  Plus, 
  FileText, 
  Play, 
  Copy, 
  MoreVertical, 
  Check, 
  X, 
  Building, 
  Globe, 
  Tag, 
  Calendar,
  Sparkles,
  ChevronDown,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Settings
} from 'lucide-react';
import { STAGES, STAGE_ORDER, getStageLabel, getStageColor } from '../lib/stages';
import { useSocket } from '../hooks/useSocket';
import ClassificationBadge from '../components/ClassificationBadge';
import ContactDetailPanel from '../components/ContactDetailPanel';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { apiFetch } from '../lib/api';
import { formatPhone, formatRelativeTime } from '../lib/utils';
import { playBeep, playBell, playNotification } from '../lib/sound';

export default function Clientes() {
  const [contacts, setContacts] = useState([]);
  const [userSettings, setUserSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('todos');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [contactHistory, setContactHistory] = useState([]);
  const [contactsSubTab, setContactsSubTab] = useState('leads'); // 'leads' or 'clientes'

  
  // Registration Modal State
  const [isCadastrarModalOpen, setIsCadastrarModalOpen] = useState(false);
  
  // Form States
  const [formPais, setFormPais] = useState('Brasil');
  const [isLinkConfigModalOpen, setIsLinkConfigModalOpen] = useState(false);
  const [leadConfig, setLeadConfig] = useState({
    doc: true,
    cep: true,
    project_interest: true,
    notes: true
  });
  const [formPipeline, setFormPipeline] = useState('novo');
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formDoc, setFormDoc] = useState('');
  const [formCep, setFormCep] = useState('');
  const [formEndereço, setFormEndereço] = useState('');
  const [formNumero, setFormNumero] = useState('');
  const [formComplemento, setFormComplemento] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formCidade, setFormCidade] = useState('');
  const [formEstado, setFormEstado] = useState('');
  const [formInteresse, setFormInteresse] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formValorEstimado, setFormValorEstimado] = useState('');
  const [formIssRetido, setFormIssRetido] = useState(false);
  const [formAliquotaIss, setFormAliquotaIss] = useState(2.0);
  const [formObs, setFormObs] = useState('');
  const [isQueryingCnpj, setIsQueryingCnpj] = useState(false);

  // Custom high-fidelity state additions
  const [editingContactId, setEditingContactId] = useState(null);
  const [formRenewalDate, setFormRenewalDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Fetch contacts flat and merge local overrides
  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/contacts');
      const data = await res.json();
      const stagesData = data.stages || {};
      
      // Flatten
      const flat = [];
      Object.keys(stagesData).forEach((stageId) => {
        flat.push(...(stagesData[stageId] || []));
      });
      
      // Load local contacts override from localStorage to keep custom fields persistently active!
      const stored = localStorage.getItem('dgflow_local_contacts');
      const locals = stored ? JSON.parse(stored) : [];
      
      const mergedMap = new Map();
      flat.forEach(c => {
        // Merge flat list with overrides if present
        const localOver = locals.find(l => String(l.id) === String(c.id) || String(l.phone) === String(c.phone));
        if (localOver) {
          mergedMap.set(c.id, { ...c, ...localOver });
        } else {
          mergedMap.set(c.id, c);
        }
      });
      
      // Add other locals created in frontend
      locals.forEach(c => {
        if (!mergedMap.has(c.id)) {
          mergedMap.set(c.id, c);
        }
      });
      
      const mergedList = Array.from(mergedMap.values());
      mergedList.sort((a, b) => new Date(b.last_activity || Date.now()) - new Date(a.last_activity || Date.now()));
      
      setContacts(mergedList);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      // Fallback
      const stored = localStorage.getItem('dgflow_local_contacts');
      if (stored) {
        setContacts(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Load lead customizer fields configuration from API settings table
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await apiFetch('/api/settings');
        const data = await res.json();
        setUserSettings(data);
        if (data && data.lead_custom_fields) {
          setLeadConfig(JSON.parse(data.lead_custom_fields));
        }
      } catch (err) {
        console.error('Erro ao carregar configurações do link:', err);
      }
    };
    loadConfig();
  }, []);

  // Automatic CEP (Postal Code) lookup side-effect
  useEffect(() => {
    if (formPais !== 'Brasil') return;
    const cleaned = formCep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      const lookupCep = async () => {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setFormEndereço(data.logradouro || '');
            setFormBairro(data.bairro || '');
            setFormCidade(data.localidade || '');
            setFormEstado(data.uf || '');
          }
        } catch (err) {
          console.error('Erro na consulta de CEP:', err);
        }
      };
      lookupCep();
    }
  }, [formCep]);

  // Real-time socket updates
  const handleContactUpdate = useCallback((updatedContact) => {
    if (!updatedContact || !updatedContact.id) return;
    
    let isTransitionToClosed = false;
    let isNewLead = false;

    setContacts((prev) => {
      const next = [...prev];
      const idx = next.findIndex((c) => String(c.id) === String(updatedContact.id));
      if (idx !== -1) {
        const oldContact = next[idx];
        if (oldContact.current_stage !== 'fechado' && updatedContact.current_stage === 'fechado') {
          isTransitionToClosed = true;
        }
        next[idx] = { ...next[idx], ...updatedContact };
      } else {
        isNewLead = true;
        next.unshift(updatedContact);
      }
      return next.sort((a, b) => new Date(b.last_activity || Date.now()) - new Date(a.last_activity || Date.now()));
    });

    // Play beautiful browser-synthesized Web Audio tones entirely via JS code!
    if (isTransitionToClosed) {
      playBell(); // Play closed sale chime!
    } else if (isNewLead) {
      playNotification(); // Play arpeggio for new lead
    } else {
      playBeep(); // Short tone for ordinary updates
    }

    setSelectedContact((prev) => {
      if (prev && String(prev.id) === String(updatedContact.id)) {
        return { ...prev, ...updatedContact };
      }
      return prev;
    });
  }, []);

  useSocket('contact:updated', handleContactUpdate);

  // Open detail panel
  const handleViewDetails = useCallback(async (contact) => {
    setSelectedContact(contact);
    setDetailPanelOpen(true);
    setContactHistory([]);

    try {
      const res = await apiFetch(`/api/contacts/${contact.id}/history`);
      const data = await res.json();
      setContactHistory(Array.isArray(data) ? data : data.history || []);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setDetailPanelOpen(false);
    setTimeout(() => {
      setSelectedContact(null);
      setContactHistory([]);
    }, 300);
  }, []);

  // Copy Self-Registration Link
  const handleCopyLink = () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || '1';
    const link = `${window.location.origin}/register-lead?user=${userId}`;
    navigator.clipboard.writeText(link);
    alert('Link de auto-cadastro copiado com sucesso! Você pode enviá-lo para seus novos leads.');
  };

  const handleSaveLeadConfig = async (config) => {
    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_custom_fields: JSON.stringify(config)
        })
      });
      alert('Configuração do link de cadastro salva com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configuração do link:', err);
      alert('Erro ao salvar configuração.');
    }
  };

  // Real CNPJ API Lookup connecting to public Receita Federal databases
  const handleCnpjLookup = async () => {
    const cleaned = formDoc.replace(/\D/g, '');
    if (!cleaned) {
      alert('Por favor, informe o CNPJ antes de buscar.');
      return;
    }
    if (cleaned.length !== 14) {
      alert('CNPJ deve conter 14 dígitos.');
      return;
    }
    
    setIsQueryingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleaned}`);
      if (!response.ok) {
        throw new Error('Empresa não encontrada ou limite de requisições excedido.');
      }
      const data = await response.json();
      
      // Auto-populate form states with real government data
      setFormNome(data.razao_social || data.nome_fantasia || '');
      setFormCep(data.cep || '');
      setFormEndereço(data.logradouro || '');
      setFormNumero(data.numero || '');
      setFormComplemento(data.complemento || '');
      setFormBairro(data.bairro || '');
      setFormCidade(data.municipio || '');
      setFormEstado(data.uf || '');
      
      if (data.cnae_fiscal_descricao) {
        setFormInteresse(data.cnae_fiscal_descricao);
      }
      
      setFormObs(`Dados comerciais importados da Receita Federal em tempo real via CNPJ.`);
    } catch (err) {
      console.error('Erro na consulta CNPJ:', err);
      alert(err.message || 'Erro ao consultar CNPJ na base da Receita Federal.');
    } finally {
      setIsQueryingCnpj(false);
    }
  };

  // Handle lead registration or editing form submit
  const handleRegisterLead = async (e) => {
    e.preventDefault();
    if (!formNome || !formEmail) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    const contactId = editingContactId || 'cli-' + Date.now();
    const existing = contacts.find(c => c.id === contactId);

    const leadData = {
      id: contactId,
      name: formNome,
      phone: formTelefone || '+5581999999999',
      email: formEmail,
      current_stage: formPipeline,
      project_value: formValorEstimado ? parseFloat(formValorEstimado) : 0.0,
      renewal_date: formRenewalDate,
      confidence: existing?.confidence || 0.95,
      last_message: formObs || existing?.last_message || 'Lead registrado no CRM.',
      last_activity: new Date().toISOString(),
      created_at: existing?.created_at || new Date().toISOString(),
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      iss_retido: formIssRetido,
      doc: formDoc,
      cep: formCep,
      endereço: formEndereço,
      numero: formNumero,
      complemento: formComplemento,
      bairro: formBairro,
      cidade: formCidade,
      estado: formEstado,
      project_interest: formInteresse,
      profile_pic: existing?.profile_pic || null,
      pais: formPais || 'Brasil'
    };

    // Save to local storage
    const stored = localStorage.getItem('dgflow_local_contacts');
    const locals = stored ? JSON.parse(stored) : [];
    const idx = locals.findIndex(c => c.id === contactId);
    if (idx !== -1) {
      locals[idx] = leadData;
    } else {
      locals.unshift(leadData);
    }
    localStorage.setItem('dgflow_local_contacts', JSON.stringify(locals));

    // Update state
    setContacts(prev => {
      const filtered = prev.filter(c => c.id !== contactId);
      filtered.unshift(leadData);
      return filtered.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));
    });

    // Try to sync with server in background
    try {
      await apiFetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formNome,
          phone: formTelefone || '5581999999999',
          current_stage: formPipeline,
          project_value: formValorEstimado ? parseFloat(formValorEstimado) : 0.0
        })
      });
    } catch (err) {
      console.warn('Falha ao sincronizar com backend:', err.message);
    }

    setIsCadastrarModalOpen(false);
    setEditingContactId(null);

    // Reset Form Fields
    setFormNome('');
    setFormEmail('');
    setFormTelefone('');
    setFormDoc('');
    setFormCep('');
    setFormEndereço('');
    setFormNumero('');
    setFormComplemento('');
    setFormBairro('');
    setFormCidade('');
    setFormEstado('');
    setFormInteresse('');
    setFormTags('');
    setFormValorEstimado('');
    setFormIssRetido(false);
    setFormObs('');
    setFormRenewalDate(new Date().toISOString().split('T')[0]);
    setFormPais('Brasil');
  };

  // Edit action
  const handleEdit = (contact) => {
    setEditingContactId(contact.id);
    setFormNome(contact.name || '');
    setFormEmail(contact.email || '');
    setFormTelefone(contact.phone || '');
    setFormPipeline(contact.current_stage || 'novo');
    setFormValorEstimado(contact.project_value || '');
    setFormRenewalDate(contact.renewal_date || new Date().toISOString().split('T')[0]);
    setFormDoc(contact.doc || '');
    setFormCep(contact.cep || '');
    setFormEndereço(contact.endereço || '');
    setFormNumero(contact.numero || '');
    setFormComplemento(contact.complemento || '');
    setFormBairro(contact.bairro || '');
    setFormCidade(contact.cidade || '');
    setFormEstado(contact.estado || '');
    setFormInteresse(contact.project_interest || '');
    setFormTags(contact.tags ? contact.tags.join(', ') : '');
    setFormIssRetido(contact.iss_retido || false);
    setFormObs(contact.last_message || '');
    setFormPais(contact.pais || 'Brasil');
    
    setIsCadastrarModalOpen(true);
  };

  // Archive action
  const handleArchive = (id) => {
    if (window.confirm('Deseja arquivar este cliente? Você poderá localizá-lo ativando a opção "Mostrar arquivados".')) {
      const stored = localStorage.getItem('dgflow_local_contacts');
      const locals = stored ? JSON.parse(stored) : [];
      const idx = locals.findIndex(c => c.id === id);
      if (idx !== -1) {
        locals[idx].archived = true;
        locals[idx].last_activity = new Date().toISOString();
      } else {
        const sContact = contacts.find(c => c.id === id);
        if (sContact) {
          locals.push({ ...sContact, archived: true, last_activity: new Date().toISOString() });
        }
      }
      localStorage.setItem('dgflow_local_contacts', JSON.stringify(locals));
      fetchContacts();
    }
  };

  // Restore action
  const handleRestore = (id) => {
    const stored = localStorage.getItem('dgflow_local_contacts');
    const locals = stored ? JSON.parse(stored) : [];
    const idx = locals.findIndex(c => c.id === id);
    if (idx !== -1) {
      locals[idx].archived = false;
      locals[idx].last_activity = new Date().toISOString();
      localStorage.setItem('dgflow_local_contacts', JSON.stringify(locals));
      fetchContacts();
    }
  };

  // Delete action (permanent)
  const handleDeletePermanent = (id) => {
    if (window.confirm('Tem certeza de que deseja EXCLUIR PERMANENTEMENTE este cliente? Esta ação não pode ser desfeita.')) {
      const stored = localStorage.getItem('dgflow_local_contacts');
      const locals = stored ? JSON.parse(stored) : [];
      const updatedLocals = locals.filter(c => c.id !== id);
      localStorage.setItem('dgflow_local_contacts', JSON.stringify(updatedLocals));
      setContacts(prev => prev.filter(c => c.id !== id));
      
      // Attempt backend delete if it exists
      apiFetch(`/api/contacts/${id}`, { method: 'DELETE' }).catch(() => {});
    }
  };

  // Filtered contacts list mapping showArchived status
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Archive filter
      const isArchived = c.archived === true;
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;

      const nameMatch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
      const lastMsgMatch = (c.last_message || '').toLowerCase().includes(searchQuery.toLowerCase());
      const emailMatch = (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSearch = nameMatch || phoneMatch || lastMsgMatch || emailMatch;
      
      // Filter by Leads vs Clientes tab
      const isCliente = c.current_stage === 'fechado';
      if (contactsSubTab === 'leads' && isCliente) return false;
      if (contactsSubTab === 'clientes' && !isCliente) return false;

      const matchesStage = stageFilter === 'todos' || c.current_stage === stageFilter;
      
      return matchesSearch && matchesStage;
    });
  }, [contacts, searchQuery, stageFilter, showArchived, contactsSubTab]);

  // Calculate metrics based on active contacts (not archived)
  const activeContacts = useMemo(() => {
    return contacts.filter(c => c.archived !== true);
  }, [contacts]);

  const totalClientsCount = activeContacts.length;

  const novosEsteMes = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return activeContacts.filter(c => {
      const date = new Date(c.created_at || c.last_activity || Date.now());
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
  }, [activeContacts]);

  // Adjust pass-due renewal date to automatically roll forward to next month's payment date!
  const getAdjustedRenewalDate = useCallback((dateString) => {
    if (!dateString) return null;
    let renewalDate = new Date(dateString + 'T12:00:00'); // Prevent timezone offset
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Auto-update to next month if passed
    while (renewalDate < today) {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }
    return renewalDate;
  }, []);

  const isRenewalSoon = useCallback((dateString) => {
    const adjusted = getAdjustedRenewalDate(dateString);
    if (!adjusted) return false;
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return adjusted >= now && adjusted <= thirtyDaysFromNow;
  }, [getAdjustedRenewalDate]);

  const renovacoesProximas = useMemo(() => {
    return activeContacts.filter(c => {
      if (!c.renewal_date) return false;
      return isRenewalSoon(c.renewal_date);
    }).length;
  }, [activeContacts, isRenewalSoon]);

  const totalValue = activeContacts.reduce((sum, c) => sum + (parseFloat(c.project_value) || 0), 0);

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in font-body">
      
      {/* Top Header & Header Actions matching DGFlow perfect specifications */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#e13a40] tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-zinc-400 font-body mt-1">
            Gerencie todos os seus clientes cadastrados
          </p>
        </div>

        {/* Dynamic header buttons matching DGFlow */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Grid/List View Toggle matching print */}
          <div className="flex items-center bg-[#121212] border border-[#1f1f1f] rounded-lg p-1 mr-1">
            <button 
              type="button"
              className="p-1 rounded bg-[#1a1a1a] text-white"
              title="Visualização em Grade"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button 
              type="button"
              className="p-1 rounded text-zinc-600 hover:text-white"
              title="Visualização em Lista"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => alert('Assista ao vídeo tutorial sobre como gerenciar e fechar mais leads usando o funil do CRM.')}
            className="gap-1.5 text-xs bg-[#121212] border-[#1f1f1f] text-zinc-400 hover:text-white font-body"
          >
            <Play className="h-3.5 w-3.5 text-[#e13a40]" />
            <span>Tutorial</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyLink} 
            className="gap-1.5 text-xs bg-[#121212] border-[#1f1f1f] text-zinc-400 hover:text-white font-body"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Link de Cadastro</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsLinkConfigModalOpen(true)} 
            className="gap-1.5 text-xs bg-[#121212] border-[#1f1f1f] text-zinc-400 hover:text-white font-body"
          >
            <Settings className="h-3.5 w-3.5 text-[#e13a40]" />
            <span>Configurar Link</span>
          </Button>

          <button
            onClick={() => {
              setEditingContactId(null);
              setFormNome('');
              setFormEmail('');
              setFormTelefone('');
              setFormDoc('');
              setFormCep('');
              setFormEndereço('');
              setFormNumero('');
              setFormComplemento('');
              setFormBairro('');
              setFormCidade('');
              setFormEstado('');
              setFormInteresse('');
              setFormTags('');
              setFormValorEstimado('');
              setFormIssRetido(false);
              setFormObs('');
              setFormRenewalDate(new Date().toISOString().split('T')[0]);
              setIsCadastrarModalOpen(true);
            }} 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-primary text-white font-semibold shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-300 h-10 px-4 py-2 gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="lucide lucide-plus w-4 h-4"
            >
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Cadastrar Cliente
          </button>
        </div>
      </div>

      {/* Row 2: Search Input and Toggle bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Buscar por nome, email, empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#0a0a0a] border-[#1f1f1f] text-zinc-100 placeholder-zinc-400 text-sm focus:border-[#e13a40] h-10 w-full"
          />
        </div>

        {/* Mostrar arquivados Toggle Switch inside its own clean wrapper card */}
        <div className="flex items-center justify-between md:justify-end gap-3 px-4 h-10 rounded-lg border border-[#1f1f1f] bg-[#121212]/50 text-sm text-zinc-200 font-semibold select-none shrink-0 w-full md:w-auto">
          <span className="flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>Mostrar arquivados</span>
          </span>
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              showArchived ? 'bg-[#e13a40]' : 'bg-[#27272a]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                showArchived ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Metrics Row matching the DGFlow UI exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total de Clientes */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 shadow-sm">
          <span className="text-sm text-zinc-300 font-bold font-body">Total de Clientes</span>
          <p className="text-3xl font-extrabold text-white font-mono mt-2">{totalClientsCount}</p>
        </div>

        {/* Novos este Mês */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 shadow-sm">
          <span className="text-sm text-zinc-300 font-bold font-body">Novos este Mês</span>
          <p className="text-3xl font-extrabold text-white font-mono mt-2">{novosEsteMes}</p>
        </div>

        {/* Renovações próximas */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-sm text-zinc-300 font-bold font-body">Renovações próximas</span>
            <p className="text-3xl font-extrabold text-white font-mono mt-2">{renovacoesProximas}</p>
          </div>
          <span className="text-xs text-zinc-400 font-semibold font-body mt-1 block">nos próximos 30 dias</span>
        </div>

        {/* Valor Estimado Total */}
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-sm text-zinc-300 font-bold font-body">Valor Estimado Total</span>
            <p className="text-2xl font-extrabold text-white font-mono mt-2">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: userSettings?.profile_moeda || 'BRL' }).format(totalValue)}
            </p>
          </div>
          <span className="text-xs text-zinc-400 font-semibold font-body mt-1 block">valor mensal total</span>
        </div>

      </div>

      {/* Leads / Clientes Sub-Tabs Navigation */}
      <div className="flex border-b border-[#1f1f1f] gap-6 pt-2">
        <button
          onClick={() => setContactsSubTab('leads')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            contactsSubTab === 'leads'
              ? 'border-[#e13a40] text-[#e13a40]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Leads</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            contactsSubTab === 'leads'
              ? 'bg-[#e13a40] text-white shadow-[0_0_8px_rgba(225,58,64,0.3)]'
              : 'bg-[#1a1a1a] text-zinc-400'
          }`}>
            {contacts.filter(c => c.archived !== true && c.current_stage !== 'fechado').length}
          </span>
        </button>
        <button
          onClick={() => setContactsSubTab('clientes')}
          className={`pb-3 text-sm font-bold tracking-wide transition-all border-b-2 flex items-center gap-2 ${
            contactsSubTab === 'clientes'
              ? 'border-[#e13a40] text-[#e13a40]'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>Clientes</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            contactsSubTab === 'clientes'
              ? 'bg-[#e13a40] text-white shadow-[0_0_8px_rgba(225,58,64,0.3)]'
              : 'bg-[#1a1a1a] text-zinc-400'
          }`}>
            {contacts.filter(c => c.archived !== true && c.current_stage === 'fechado').length}
          </span>
        </button>
      </div>

      {/* Clientes Card-based Grid Database Layout (DGFlow visual clone) */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32 bg-[#121212] border border-[#1f1f1f] rounded-xl shadow-md">
          <div className="text-center space-y-3">
            <div className="h-8 w-8 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-body">Carregando carteira de leads…</p>
          </div>
        </div>
      ) : filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => {
            const sColor = getStageColor(contact.current_stage) || '#e13a40';
            const initials = (contact.name || '?')
              .split(' ')
              .slice(0, 2)
              .map((w) => w[0])
              .join('')
              .toUpperCase();

            // Automatic roll-forward for visual calculation
            const adjustedDate = getAdjustedRenewalDate(contact.renewal_date);

            return (
              <div 
                key={contact.id} 
                className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-800 transition-colors shadow-sm relative group overflow-hidden"
              >
                {/* Visual Gradient Corner lights */}
                <div 
                  className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl opacity-5 blur-[15px] rounded-full pointer-events-none"
                  style={{ backgroundImage: `radial-gradient(circle, ${sColor} 0%, transparent 100%)` }}
                />

                {/* Clickable Card Body area to view client details! */}
                <div 
                  onClick={() => handleViewDetails(contact)}
                  className="space-y-3.5 cursor-pointer group/card flex-1"
                  title="Clique para ver detalhes do cliente"
                >
                  {/* Top Row: Avatar & Metadata */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm uppercase">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight group-hover/card:text-[#e13a40] transition-colors">
                        {contact.name || 'Sem nome'}
                      </h4>
                      {contact.project_interest && (
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block mt-0.5">
                          {contact.project_interest}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact properties list grid */}
                  <div className="space-y-1.5 pt-1 text-sm text-zinc-300 font-body">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-[#e13a40]" />
                      <span className="text-zinc-200 truncate font-mono text-xs">{contact.email || 'Não cadastrado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#e13a40]" />
                      <span className="text-zinc-200 font-mono text-xs">{formatPhone(contact.phone)}</span>
                    </div>
                    
                    {contact.renewal_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#e13a40]" />
                        <span className="text-zinc-200 text-xs">
                          Renovação: <strong className="text-white font-mono">{adjustedDate?.toLocaleDateString('pt-BR')}</strong>
                        </span>
                        {isRenewalSoon(contact.renewal_date) && (
                          <span className="h-2 w-2 rounded-full bg-[#e13a40] animate-pulse" title="Renovação próxima!" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions matching print exactly */}
                <div className="flex items-center justify-between border-t border-[#1f1f1f]/60 pt-4 mt-2">
                  {showArchived ? (
                    <>
                      <button 
                        onClick={() => handleRestore(contact.id)}
                        className="p-1 rounded text-emerald-500 hover:text-emerald-400 hover:bg-zinc-900 transition-colors flex items-center gap-1 text-xs font-bold font-body"
                        title="Desarquivar Cliente"
                      >
                        <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" />
                        <span>Restaurar</span>
                      </button>
                      <button 
                        onClick={() => handleDeletePermanent(contact.id)}
                        className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-zinc-900/50 transition-colors flex items-center gap-1 text-xs font-bold font-body"
                        title="Excluir Permanentemente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Excluir</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleEdit(contact)}
                        className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                        title="Editar Cliente"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleArchive(contact.id)}
                        className="p-1.5 rounded text-red-500 hover:text-red-400 hover:bg-zinc-900/50 transition-colors"
                        title="Arquivar Cliente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-[#121212] border border-[#1f1f1f] rounded-xl text-center shadow-sm">
          <ShieldAlert className="h-10 w-10 text-zinc-700 mb-3" />
          <h3 className="font-semibold text-zinc-300 text-sm">Nenhum lead encontrado</h3>
          <p className="text-xs text-zinc-500 max-w-sm font-body mt-1 leading-relaxed">
            Nenhum contato coincide com a busca ou estágio selecionados. Tente limpar os filtros.
          </p>
        </div>
      )}

      {/* Slide-out detail panel */}
      <ContactDetailPanel
        contact={selectedContact}
        history={contactHistory}
        visible={detailPanelOpen}
        onClose={handleClosePanel}
      />

      {/* MODAL: CADASTRAR CLIENTE (DGFlow exact modal clone) */}
      {isCadastrarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden h-[90vh] max-h-[700px] flex flex-col">
            
            {/* Top Close */}
            <button 
              onClick={() => setIsCadastrarModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="shrink-0 pb-4 border-b border-[#1f1f1f]">
              <h2 className="text-base font-bold text-white mb-0.5 flex items-center gap-1.5">
                <Users className="h-5 w-5 text-[#e13a40]" />
                Cadastrar Novo Cliente
              </h2>
              <p className="text-zinc-400 text-xs md:text-sm font-semibold">Crie um lead qualificado na pipeline e configure dados fiscais e cadastrais.</p>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleRegisterLead} className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 scrollbar-thin">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Funnel Stage Selector */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">Pipeline / Etapa Funil</label>
                  <select 
                    value={formPipeline}
                    onChange={(e) => setFormPipeline(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] font-semibold h-9"
                  >
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                {/* Valor Estimado Input */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">Valor Estimado (R$)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="R$ 3.500,00"
                    value={formValorEstimado}
                    onChange={(e) => setFormValorEstimado(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-2 font-mono font-semibold h-9"
                  />
                </div>

                {/* Data de Renovação Date Input */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">Data de Renovação</label>
                  <Input 
                    type="date"
                    value={formRenewalDate}
                    onChange={(e) => setFormRenewalDate(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-2 font-mono font-semibold h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Customer name */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">Nome Cliente ou Empresa *</label>
                  <Input 
                    required
                    placeholder="Marina Sousa LTDA"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-2"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">E-mail de Contato *</label>
                  <Input 
                    required
                    type="email"
                    placeholder="marina@empresa.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* País */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">País</label>
                  <select
                    value={formPais}
                    onChange={(e) => {
                      const selectedPais = e.target.value;
                      setFormPais(selectedPais);
                      setFormDoc('');
                      setFormCep('');
                    }}
                    className="w-full bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#1f1f1f] focus:ring-1 focus:ring-[#e13a40]/50 p-2.5 outline-none font-semibold h-10 cursor-pointer"
                  >
                    <option value="Brasil">🇧🇷 Brasil</option>
                    <option value="Portugal">🇵🇹 Portugal</option>
                    <option value="Outro">🌐 Outro</option>
                  </select>
                </div>

                {/* Telephone */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">WhatsApp / Celular</label>
                  <div className="flex gap-2">
                    <span className="bg-[#1a1a1a] border border-[#1f1f1f] text-sm text-zinc-200 p-2.5 rounded-lg select-none font-bold">
                      {formPais === 'Brasil' ? '🇧🇷 +55' : formPais === 'Portugal' ? '🇵🇹 +351' : '🌐 +'}
                    </span>
                    <Input 
                      placeholder={formPais === 'Brasil' ? '(81) 99887-7665' : formPais === 'Portugal' ? '912 345 678' : 'Número completo'}
                      value={formTelefone}
                      onChange={(e) => setFormTelefone(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-2 flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Document ID */}
                <div className="space-y-1 col-span-2">
                  <label className="text-xs text-zinc-350 font-bold uppercase">
                    {formPais === 'Brasil' ? 'CPF ou CNPJ' : formPais === 'Portugal' ? 'NIF (Contribuinte)' : 'Documento (VAT / Tax ID)'}
                  </label>
                  <div className="flex gap-1.5">
                    <Input 
                      placeholder={formPais === 'Brasil' ? '00.000.000/0001-00' : formPais === 'Portugal' ? '123 456 789' : 'ID do Documento'}
                      value={formDoc}
                      onChange={(e) => setFormDoc(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-2 flex-1 font-mono"
                    />
                    {formPais === 'Brasil' && (
                      <button
                        type="button"
                        onClick={handleCnpjLookup}
                        disabled={isQueryingCnpj}
                        className="px-3 rounded-lg border border-[#1f1f1f] bg-[#1a1a1a] hover:bg-[#25252b] text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center gap-1 active:scale-95"
                      >
                        {isQueryingCnpj ? 'Consultando...' : 'Buscar Dados'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Address sub-grid fields */}
              <div className="p-3 rounded-xl bg-[#1a1a1a]/30 border border-[#1f1f1f] space-y-3.5">
                <span className="text-xs text-[#e13a40] font-bold uppercase tracking-wider block">
                  {formPais === 'Brasil' ? 'Endereço Comercial' : formPais === 'Portugal' ? 'Morada Comercial' : 'Morada / Endereço'}
                </span>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs text-zinc-350 font-bold uppercase">
                      {formPais === 'Brasil' ? 'Endereço / Logradouro' : formPais === 'Portugal' ? 'Morada / Rua' : 'Morada'}
                    </label>
                    <Input 
                      placeholder={formPais === 'Brasil' ? 'Avenida Paulista' : formPais === 'Portugal' ? 'Rua das Flores, nº 10' : 'Endereço'}
                      value={formEndereço}
                      onChange={(e) => setFormEndereço(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-350 font-bold uppercase">Número</label>
                    <Input 
                      placeholder="100"
                      value={formNumero}
                      onChange={(e) => setFormNumero(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-350 font-bold uppercase">
                      {formPais === 'Brasil' ? 'CEP' : 'Código Postal'}
                    </label>
                    <Input 
                      placeholder={formPais === 'Brasil' ? '01311-100' : formPais === 'Portugal' ? '1000-001' : 'Postal / ZIP'}
                      value={formCep}
                      onChange={(e) => setFormCep(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs text-zinc-350 font-bold uppercase">Complemento</label>
                    <Input 
                      placeholder="Bloco A, Sala 42"
                      value={formComplemento}
                      onChange={(e) => setFormComplemento(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-350 font-bold uppercase">
                      {formPais === 'Brasil' ? 'Bairro' : formPais === 'Portugal' ? 'Localidade / Freguesia' : 'Bairro / Região'}
                    </label>
                    <Input 
                      placeholder={formPais === 'Brasil' ? 'Centro' : formPais === 'Portugal' ? 'Chiado' : 'Bairro'}
                      value={formBairro}
                      onChange={(e) => setFormBairro(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-350 font-bold uppercase">
                      {formPais === 'Brasil' ? 'Cidade/UF' : formPais === 'Portugal' ? 'Concelho' : 'Cidade'}
                    </label>
                    <Input 
                      placeholder={formPais === 'Brasil' ? 'Recife - PE' : 'Cidade'}
                      value={`${formCidade}${formEstado ? ' - ' + formEstado : ''}`}
                      onChange={(e) => {
                        const split = e.target.value.split('-');
                        setFormCidade(split[0] ? split[0].trim() : '');
                        if (split[1]) setFormEstado(split[1].trim());
                      }}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Interest area */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">Projeto / Interesse Principal</label>
                  <Input 
                    placeholder="Desenvolvimento de Landing Page"
                    value={formInteresse}
                    onChange={(e) => setFormInteresse(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-2"
                  />
                </div>

                {/* Tag markers */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-350 font-bold uppercase">Tags Marcadoras (Separadas por vírgula)</label>
                  <Input 
                    placeholder="Premium, Design, Recorrente"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-2 font-body"
                  />
                </div>
              </div>

              {/* Tax triggers accordions */}
              <div className="p-3.5 rounded-xl bg-[#1a1a1a]/50 border border-[#1f1f1f] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Retenção de ISS pelo tomador</span>
                    <span className="text-xs text-zinc-400 font-medium">Marque se o ISS será retido diretamente na fonte do faturamento</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={formIssRetido}
                    onChange={(e) => setFormIssRetido(e.target.checked)}
                    className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                  />
                </div>

                {formIssRetido && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-xs text-zinc-350 font-bold uppercase">Alíquota ISS (%)</label>
                    <Input 
                      type="number" 
                      step="0.1"
                      value={formAliquotaIss}
                      onChange={(e) => setFormAliquotaIss(parseFloat(e.target.value))}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-sm py-1.5 w-32 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Internal observations */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-350 font-bold uppercase">Observações Internas (opcional)</label>
                <textarea
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  placeholder="Ex: Lead vindo do formulário de contato do site corporativo principal..."
                  rows="3"
                  className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-2.5 text-sm text-white focus:border-[#e13a40] outline-none"
                />
              </div>

            </form>

            {/* Footer triggers */}
            <div className="shrink-0 pt-4 border-t border-[#1f1f1f] flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsCadastrarModalOpen(false)}
                className="py-2.5 px-5 rounded-xl border border-[#1f1f1f] text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-body font-semibold"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleRegisterLead}
                className="py-2.5 px-6 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-all font-body"
              >
                <span>Salvar Contato</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ──── MODAL CONFIGURAÇÃO DO LINK DE CADASTRO ──── */}
      {isLinkConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden flex flex-col">
            
            <button 
              onClick={() => setIsLinkConfigModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pb-4 border-b border-[#1f1f1f]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#e13a40]" />
                Campos do Link de Cadastro
              </h2>
              <p className="text-[11px] text-zinc-500 mt-1">Marque quais informações você deseja coletar dos seus clientes no formulário público.</p>
            </div>

            <div className="py-5 space-y-4 text-xs">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a]/55 border border-[#1f1f1f] cursor-pointer hover:bg-zinc-900 transition-colors">
                <input 
                  type="checkbox"
                  checked={leadConfig.doc}
                  onChange={(e) => setLeadConfig({ ...leadConfig, doc: e.target.checked })}
                  className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Coletar CPF/CNPJ ou NIF</span>
                  <span className="text-[10px] text-zinc-400">Exibe o campo de identificação fiscal correspondente ao país</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a]/55 border border-[#1f1f1f] cursor-pointer hover:bg-zinc-900 transition-colors">
                <input 
                  type="checkbox"
                  checked={leadConfig.cep}
                  onChange={(e) => setLeadConfig({ ...leadConfig, cep: e.target.checked })}
                  className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Coletar Endereço Completo</span>
                  <span className="text-[10px] text-zinc-400">Exibe CEP/Código Postal, Rua, Bairro, Cidade e Estado</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a]/55 border border-[#1f1f1f] cursor-pointer hover:bg-zinc-900 transition-colors">
                <input 
                  type="checkbox"
                  checked={leadConfig.project_interest}
                  onChange={(e) => setLeadConfig({ ...leadConfig, project_interest: e.target.checked })}
                  className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Coletar Projeto / Serviço de Interesse</span>
                  <span className="text-[10px] text-zinc-400">Exibe campo de interesse comercial</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a1a]/55 border border-[#1f1f1f] cursor-pointer hover:bg-zinc-900 transition-colors">
                <input 
                  type="checkbox"
                  checked={leadConfig.notes}
                  onChange={(e) => setLeadConfig({ ...leadConfig, notes: e.target.checked })}
                  className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Coletar Observações Adicionais</span>
                  <span className="text-[10px] text-zinc-400">Exibe caixa de texto multilinha para comentários</span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-[#1f1f1f] flex justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsLinkConfigModalOpen(false)}
                className="py-2 px-4 rounded-lg bg-zinc-900 border border-[#1f1f1f] text-zinc-400 hover:text-white font-semibold transition-all h-9"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  await handleSaveLeadConfig(leadConfig);
                  setIsLinkConfigModalOpen(false);
                }}
                className="py-2 px-5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold transition-all shadow-md h-9"
              >
                Salvar Configurações
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
