import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Phone, 
  User, 
  FolderPlus, 
  X, 
  Users, 
  Play, 
  Mail, 
  Building, 
  Plus, 
  Search, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  Download, 
  Upload, 
  Check, 
  FileText,
  Webhook,
  Bot,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { STAGES } from '../lib/stages';
import { useSocket } from '../hooks/useSocket';
import KanbanBoard from '../components/KanbanBoard';
import ContactDetailPanel from '../components/ContactDetailPanel';
import { apiFetch } from '../lib/api';
import { formatPhone } from '../lib/utils';

export default function Kanban() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [contactHistory, setContactHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format date as 'DD/MM/YY'
  const formatDateYY = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  // View States
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [showArchived, setShowArchived] = useState(false);

  // Filters State for List view
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState('todas');
  const [pipelineFilter, setPipelineFilter] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals States
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isAutoLeadModalOpen, setIsAutoLeadModalOpen] = useState(false);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isNewCaptureModalOpen, setIsNewCaptureModalOpen] = useState(false);
  const [newCaptureForm, setNewCaptureForm] = useState({
    name: '',
    description: '',
    pipelineId: 'sem-pipeline',
    tags: []
  });
  const [currentTagInput, setCurrentTagInput] = useState('');

  // Pipelines State with dynamic localStorage mapping
  const [pipelines, setPipelines] = useState(() => {
    const stored = localStorage.getItem('dgflow_custom_pipelines');
    if (stored) return JSON.parse(stored);
    return [
      {
        id: 'principal',
        name: 'Pipeline Principal',
        stages: [
          { id: 'novo-lead', label: 'Novo Lead', color: '#7A8C6E' },
          { id: 'em-contato', label: 'Em Contato', color: '#4A90D9' },
          { id: 'proposta-enviada', label: 'Proposta Enviada', color: '#C9A84C' },
          { id: 'negociando', label: 'Em Negociação', color: '#D4842A' },
          { id: 'fechado', label: 'Fechado', color: '#4CAF50' },
          { id: 'perdido', label: 'Perdido', color: '#B05C3A' }
        ]
      }
    ];
  });
  
  const [selectedPipelineId, setSelectedPipelineId] = useState('principal');

  // New Lead Opportunity Form State
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    value: '',
    stage: 'novo-lead',
    pipelineId: 'principal'
  });

  // Webhooks State
  const [webhooks, setWebhooks] = useState(() => {
    const stored = localStorage.getItem('dgflow_webhooks');
    return stored ? JSON.parse(stored) : [];
  });

  // Auto-lead Settings State
  const [autoLeadSettings, setAutoLeadSettings] = useState(() => {
    const stored = localStorage.getItem('dgflow_autolead_settings');
    return stored ? JSON.parse(stored) : { active: false, pipelineId: 'principal', initialStage: 'novo-lead' };
  });

  // Custom Pipeline Builder Form State
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineStages, setNewPipelineStages] = useState([
    { id: 'novo-lead', label: 'Novo Lead', color: 'blue' },
    { id: 'primeiro-contato', label: 'Primeiro Contato', color: 'yellow' },
    { id: 'proposta-enviada', label: 'Proposta Enviada', color: 'purple' },
    { id: 'negociacao', label: 'Negociação', color: 'orange' },
    { id: 'fechado', label: 'Fechado', color: 'green' }
  ]);

  // Active pipeline object mapping stages
  const activePipeline = useMemo(() => {
    return pipelines.find(p => p.id === selectedPipelineId) || pipelines[0];
  }, [pipelines, selectedPipelineId]);

  // Load and merge local contacts override
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
      
      const stored = localStorage.getItem('dgflow_local_contacts');
      const locals = stored ? JSON.parse(stored) : [];
      
      const mergedMap = new Map();
      flat.forEach(c => {
        const localOver = locals.find(l => String(l.id) === String(c.id) || String(l.phone) === String(c.phone));
        if (localOver) {
          mergedMap.set(c.id, { ...c, ...localOver });
        } else {
          mergedMap.set(c.id, c);
        }
      });
      
      locals.forEach(c => {
        if (!mergedMap.has(c.id)) {
          mergedMap.set(c.id, c);
        }
      });
      
      setContacts(Array.from(mergedMap.values()));
    } catch (err) {
      console.error('Erro ao buscar contatos:', err);
      const stored = localStorage.getItem('dgflow_local_contacts');
      if (stored) setContacts(JSON.parse(stored));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Real-time socket sync
  const handleContactUpdate = useCallback((updatedContact) => {
    if (!updatedContact || !updatedContact.id) return;
    setContacts((prev) => {
      const next = [...prev];
      const idx = next.findIndex((c) => String(c.id) === String(updatedContact.id));
      if (idx !== -1) {
        next[idx] = { ...next[idx], ...updatedContact };
      } else {
        next.unshift(updatedContact);
      }
      return next;
    });
  }, []);

  useSocket('contact:updated', handleContactUpdate);

  // Group contacts by active pipeline stages for board
  const contactsByStage = useMemo(() => {
    const grouped = {};
    activePipeline.stages.forEach((stage) => {
      grouped[stage.id] = [];
    });

    contacts.forEach((c) => {
      // Exclude archived
      if (c.archived === true) return;
      
      // Match pipeline and stage
      const cPipeline = c.pipeline_id || 'principal';
      if (cPipeline === selectedPipelineId) {
        const stageId = c.current_stage || activePipeline.stages[0].id;
        if (grouped[stageId]) {
          grouped[stageId].push(c);
        }
      }
    });
    return grouped;
  }, [contacts, activePipeline, selectedPipelineId]);

  // Filtered contacts list for "Lista" view
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Archive filter
      const isArchived = c.archived === true;
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;

      // Search matching
      const nameMatch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
      const emailMatch = (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = nameMatch || phoneMatch || emailMatch;

      // Pipeline filter
      const cPipeline = c.pipeline_id || 'principal';
      const matchesPipeline = pipelineFilter === 'todos' || cPipeline === pipelineFilter;

      // Origin filter
      const cOrigin = c.origin || 'Desconhecido';
      const matchesOrigin = originFilter === 'todas' || cOrigin.toLowerCase() === originFilter.toLowerCase();

      // Date filters
      const date = new Date(c.created_at || c.last_activity || Date.now());
      let matchesFrom = true;
      if (dateFrom) {
        const fromLimit = new Date(dateFrom + 'T00:00:00');
        matchesFrom = date >= fromLimit;
      }
      let matchesTo = true;
      if (dateTo) {
        const toLimit = new Date(dateTo + 'T23:59:59');
        matchesTo = date <= toLimit;
      }

      return matchesSearch && matchesPipeline && matchesOrigin && matchesFrom && matchesTo;
    });
  }, [contacts, searchQuery, pipelineFilter, originFilter, dateFrom, dateTo, showArchived]);

  // List View Top Card Metrics
  const listTotalCount = filteredContacts.length;
  const listLeadsCount = filteredContacts.filter(c => c.current_stage !== 'fechado' && c.current_stage !== 'perdido' && c.current_stage !== 'entregue').length;
  const listClientsCount = filteredContacts.filter(c => c.current_stage === 'fechado' || c.current_stage === 'entregue').length;

  // Handle Drag-and-Drop Column movements
  const handleMoveContact = useCallback((contactId, newStageId) => {
    setContacts(prev => {
      const next = [...prev];
      const idx = next.findIndex(c => String(c.id) === String(contactId));
      if (idx !== -1) {
        next[idx] = { 
          ...next[idx], 
          current_stage: newStageId,
          last_activity: new Date().toISOString()
        };
        // Update Local Storage
        const stored = localStorage.getItem('dgflow_local_contacts');
        const locals = stored ? JSON.parse(stored) : [];
        const lIdx = locals.findIndex(c => String(c.id) === String(contactId));
        if (lIdx !== -1) {
          locals[lIdx].current_stage = newStageId;
          locals[lIdx].last_activity = new Date().toISOString();
        } else {
          locals.push(next[idx]);
        }
        localStorage.setItem('dgflow_local_contacts', JSON.stringify(locals));
      }
      return next;
    });
  }, []);

  // Open details
  const handleCardClick = useCallback(async (contact) => {
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

  // Opportunity submit creation form
  const handleCreateLeadSubmit = async (e) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    const contactId = 'cli-' + Date.now();
    const newContact = {
      id: contactId,
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email || '',
      current_stage: newLeadForm.stage,
      pipeline_id: newLeadForm.pipelineId,
      project_value: newLeadForm.value ? parseFloat(newLeadForm.value) : 0,
      origin: 'Formulário Site',
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      last_message: 'Lead registrado no pipeline.'
    };

    // Save locally
    const stored = localStorage.getItem('dgflow_local_contacts');
    const locals = stored ? JSON.parse(stored) : [];
    locals.unshift(newContact);
    localStorage.setItem('dgflow_local_contacts', JSON.stringify(locals));

    // Update state
    setContacts(prev => [newContact, ...prev]);

    // OPTIMISTIC SYNC
    try {
      await apiFetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLeadForm.name,
          phone: newLeadForm.phone,
          current_stage: newLeadForm.stage,
          project_value: newLeadForm.value ? parseFloat(newLeadForm.value) : 0
        })
      });
    } catch {}

    // Reset Form and close
    setNewLeadForm({
      name: '',
      email: '',
      phone: '',
      value: '',
      stage: activePipeline.stages[0].id,
      pipelineId: selectedPipelineId
    });
    setIsNewLeadModalOpen(false);
  };

  // Archive and permanent delete lists
  const handleArchiveLead = (id) => {
    if (window.confirm('Tem certeza de que deseja arquivar este lead?')) {
      const stored = localStorage.getItem('dgflow_local_contacts');
      const locals = stored ? JSON.parse(stored) : [];
      const idx = locals.findIndex(c => String(c.id) === String(id));
      if (idx !== -1) {
        locals[idx].archived = true;
        locals[idx].last_activity = new Date().toISOString();
      } else {
        const contact = contacts.find(c => String(c.id) === String(id));
        if (contact) locals.push({ ...contact, archived: true });
      }
      localStorage.setItem('dgflow_local_contacts', JSON.stringify(locals));
      fetchContacts();
    }
  };

  const handleRestoreLead = (id) => {
    const stored = localStorage.getItem('dgflow_local_contacts');
    const locals = stored ? JSON.parse(stored) : [];
    const idx = locals.findIndex(c => String(c.id) === String(id));
    if (idx !== -1) {
      locals[idx].archived = false;
      locals[idx].last_activity = new Date().toISOString();
      localStorage.setItem('dgflow_local_contacts', JSON.stringify(locals));
      fetchContacts();
    }
  };

  const handleDeletePermanent = (id) => {
    if (window.confirm('Excluir PERMANENTEMENTE este lead? Esta ação não pode ser desfeita.')) {
      const stored = localStorage.getItem('dgflow_local_contacts');
      const locals = stored ? JSON.parse(stored) : [];
      const updated = locals.filter(c => String(c.id) !== String(id));
      localStorage.setItem('dgflow_local_contacts', JSON.stringify(updated));
      fetchContacts();
    }
  };

  // Webhooks functions
  const handleCreateWebhook = () => {
    setIsWebhookModalOpen(false);
    setIsNewCaptureModalOpen(true);
  };

  const handleGenerateWebhookSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newCaptureForm.name) {
      alert('Por favor, preencha o Nome da captura.');
      return;
    }

    const newW = {
      id: 'webhook-' + Date.now(),
      name: newCaptureForm.name,
      description: newCaptureForm.description || '',
      pipelineId: newCaptureForm.pipelineId,
      tags: newCaptureForm.tags || [],
      endpoint: `${window.location.origin}/api/webhooks/capture/${Date.now()}`,
      created_at: formatDateYY(new Date())
    };

    const updated = [...webhooks, newW];
    setWebhooks(updated);
    localStorage.setItem('dgflow_webhooks', JSON.stringify(updated));

    // Reset Form & Close Capture Modal, return to Webhooks list
    setNewCaptureForm({
      name: '',
      description: '',
      pipelineId: 'sem-pipeline',
      tags: []
    });
    setCurrentTagInput('');
    setIsNewCaptureModalOpen(false);
    setIsWebhookModalOpen(true);
  };

  const handleDeleteWebhook = (id) => {
    if (window.confirm('Deseja excluir este webhook?')) {
      const updated = webhooks.filter(w => w.id !== id);
      setWebhooks(updated);
      localStorage.setItem('dgflow_webhooks', JSON.stringify(updated));
    }
  };

  // Auto-lead Settings save
  const handleSaveAutoLead = (active, pId, startCol) => {
    const settings = { active, pipelineId: pId, initialStage: startCol };
    setAutoLeadSettings(settings);
    localStorage.setItem('dgflow_autolead_settings', JSON.stringify(settings));
    setIsAutoLeadModalOpen(false);
  };

  // Custom pipelines functions
  const handleAddCustomStage = () => {
    setNewPipelineStages([
      ...newPipelineStages,
      { id: 'stage-' + Date.now(), label: 'Nova Etapa', color: 'blue' }
    ]);
  };

  const handleCreateCustomPipeline = () => {
    if (!newPipelineName) {
      alert('Por favor, informe o Nome do Pipeline.');
      return;
    }
    const newP = {
      id: 'pipe-' + Date.now(),
      name: newPipelineName,
      stages: newPipelineStages.map(s => ({
        id: s.id,
        label: s.label,
        color: s.color === 'blue' ? '#4A90D9' : s.color === 'yellow' ? '#C9A84C' : s.color === 'purple' ? '#9C27B0' : s.color === 'orange' ? '#D4842A' : s.color === 'green' ? '#4CAF50' : '#B05C3A'
      }))
    };

    const updated = [...pipelines, newP];
    setPipelines(updated);
    localStorage.setItem('dgflow_custom_pipelines', JSON.stringify(updated));
    
    // Switch to new pipeline
    setSelectedPipelineId(newP.id);
    
    // Reset states
    setNewPipelineName('');
    setIsPipelineModalOpen(false);
  };

  // Spreadsheets Import / Export
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "oportunidades_nexdash.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (Array.isArray(parsed)) {
          const stored = localStorage.getItem('dgflow_local_contacts');
          const locals = stored ? JSON.parse(stored) : [];
          // Merge
          const merged = [...parsed, ...locals];
          const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
          localStorage.setItem('dgflow_local_contacts', JSON.stringify(unique));
          alert('Importação concluída com sucesso!');
          fetchContacts();
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON. Certifique-se de que é válido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-zinc-100 font-body animate-fade-in">
      
      {/* Top Header Row matching prints exactly */}
      <div className="space-y-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-none">
            Leads & Clientes
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5 font-medium">
            Gerencie seu funil de vendas
          </p>
        </div>

        {/* Action Header Tabs/Buttons matching prints */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          
          {/* Todos os Leads Switcher */}
          <button
            onClick={() => setViewMode('list')}
            className={`gap-1.5 text-xs py-2 px-4 rounded-lg font-bold transition-all border ${
              viewMode === 'list' 
                ? 'bg-[#e13a40] text-white border-[#e13a40] shadow-md shadow-[#e13a40]/10' 
                : 'bg-[#121212] border-[#1f1f1f] text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5 inline mr-1" />
            <span>Todos os Leads</span>
          </button>

          {/* Tutorial */}
          <button
            onClick={() => alert('Tutorial: Arraste os cards para mover de etapas. Use a visualização de Lista para importar ou exportar leads comercialmente.')}
            className="gap-1.5 text-xs py-2 px-4 rounded-lg font-semibold bg-[#121212] border border-[#1f1f1f] text-zinc-400 hover:text-white flex items-center transition-all"
          >
            <Play className="h-3.5 w-3.5 text-[#e13a40] fill-current" />
            <span>Tutorial</span>
          </button>

          {/* Conectar Formulário */}
          <button
            onClick={() => setIsWebhookModalOpen(true)}
            className="gap-1.5 text-xs py-2 px-4 rounded-lg font-semibold bg-[#121212] border border-[#1f1f1f] text-zinc-400 hover:text-white flex items-center transition-all"
          >
            <Webhook className="h-3.5 w-3.5 text-[#e13a40]" />
            <span>Conectar Formulário</span>
          </button>

          {/* Auto-lead do WhatsApp */}
          <button
            onClick={() => setIsAutoLeadModalOpen(true)}
            className="gap-1.5 text-xs py-2 px-4 rounded-lg font-semibold bg-[#121212] border border-[#1f1f1f] text-zinc-400 hover:text-white flex items-center transition-all"
          >
            <Bot className="h-3.5 w-3.5 text-[#e13a40]" />
            <span>Auto-lead do WhatsApp</span>
          </button>

          {/* + Pipeline creator button */}
          <button
            onClick={() => setIsPipelineModalOpen(true)}
            className="text-xs p-2 rounded-lg font-bold bg-[#121212] border border-[#1f1f1f] text-zinc-400 hover:text-white transition-all flex items-center"
            title="Criar Novo Pipeline"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Spacer */}
          <span className="w-px h-5 bg-[#1f1f1f] mx-1" />

          {/* Importar planilha */}
          <label className="gap-1.5 text-xs py-2 px-4 rounded-lg font-semibold bg-[#121212] border border-[#1f1f1f] text-zinc-400 hover:text-white flex items-center cursor-pointer transition-all">
            <Upload className="h-3.5 w-3.5 text-emerald-500" />
            <span>Importar planilha</span>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>

          {/* + Novo Lead */}
          <button
            onClick={() => {
              setNewLeadForm(prev => ({ ...prev, stage: activePipeline.stages[0].id, pipelineId: selectedPipelineId }));
              setIsNewLeadModalOpen(true);
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
            Novo Lead
          </button>

          {/* Nova Negociação */}
          <button
            onClick={() => {
              setNewLeadForm(prev => ({ ...prev, stage: 'negociando', pipelineId: selectedPipelineId }));
              setIsNewLeadModalOpen(true);
            }}
            className="gap-1.5 text-xs py-2 px-4 rounded-lg font-semibold bg-[#121212] border border-[#1f1f1f] text-zinc-400 hover:text-white flex items-center transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 text-orange-500" />
            <span>Nova Negociação</span>
          </button>
        </div>
      </div>

      {/* Sub-header Options row */}
      <div className="flex items-center justify-between border-t border-[#1f1f1f] pt-4 mt-2 select-none">
        
        {/* Pipeline switch selector */}
        <div className="flex items-center gap-2">
          {pipelines.map(pipe => (
            <button
              key={pipe.id}
              onClick={() => {
                setSelectedPipelineId(pipe.id);
                setViewMode('kanban'); // return to kanban on switch
              }}
              className={`text-xs py-1.5 px-4.5 rounded-xl font-bold transition-all border ${
                selectedPipelineId === pipe.id && viewMode === 'kanban'
                  ? 'bg-[#1a1a1a] border-[#e13a40]/30 text-white font-extrabold'
                  : 'bg-transparent border-[#1f1f1f] text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {pipe.name}
            </button>
          ))}
        </div>

        {/* View Switches (Kanban vs Lista) & selections triggers */}
        <div className="flex items-center gap-4">
          
          {/* Action buttons inside sub-header */}
          {viewMode === 'kanban' && (
            <div className="flex items-center gap-2 text-xs">
              <button 
                onClick={() => alert('Modo de seleção ativado!')}
                className="py-1.5 px-3 rounded-lg border border-[#1f1f1f] bg-[#121212]/30 text-zinc-400 hover:text-white"
              >
                Selecionar
              </button>
              <button 
                onClick={() => alert('Cards contraídos com sucesso!')}
                className="py-1.5 px-3 rounded-lg border border-[#1f1f1f] bg-[#121212]/30 text-zinc-400 hover:text-white"
              >
                Contrair cards
              </button>
            </div>
          )}

          {/* Kanban / Lista Selector switches */}
          <div className="flex items-center bg-[#121212] border border-[#1f1f1f] rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`py-1 px-3.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-zinc-550 hover:text-white'
              }`}
            >
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`py-1 px-3.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-[#1a1a1a] text-white shadow-sm' : 'text-zinc-550 hover:text-white'
              }`}
            >
              <span>Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout Body */}
      {viewMode === 'kanban' ? (
        
        /* ──── KANBAN VIEW ──── */
        isLoading ? (
          <div className="flex items-center justify-center py-32 bg-[#121212] border border-[#1f1f1f] rounded-xl shadow-md">
            <div className="text-center space-y-3">
              <div className="h-8 w-8 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-500 font-body">Sincronizando pipeline comercial…</p>
            </div>
          </div>
        ) : (
          <KanbanBoard
            contactsByStage={contactsByStage}
            stages={activePipeline.stages}
            onCardClick={handleCardClick}
            onMoveContact={handleMoveContact}
            onAddCardClick={(stageId) => {
              setNewLeadForm(prev => ({ ...prev, stage: stageId, pipelineId: selectedPipelineId }));
              setIsNewLeadModalOpen(true);
            }}
          />
        )

      ) : (

        /* ──── LIST VIEW ("Todos os Leads") ──── */
        <div className="space-y-6 animate-fade-in select-none">
          
          {/* Top Row: List Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Total Card */}
            <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total</span>
              <p className="text-3xl font-extrabold text-white font-mono">{listTotalCount}</p>
            </div>

            {/* Leads Card */}
            <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Leads</span>
              <p className="text-3xl font-extrabold text-[#e13a40] font-mono">{listLeadsCount}</p>
            </div>

            {/* Clientes Card */}
            <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Clientes</span>
              <p className="text-3xl font-extrabold text-emerald-500 font-mono">{listClientsCount}</p>
            </div>

          </div>

          {/* Search, Filters, and List actions segment */}
          <div className="flex flex-col lg:flex-row items-center gap-4 bg-[#121212]/40 border border-[#1f1f1f] p-4 rounded-xl">
            
            {/* Left Search input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#1a1a1a] border border-[#1f1f1f] text-white placeholder-zinc-600 text-xs focus:border-[#e13a40] h-9 w-full rounded-lg outline-none font-medium"
              />
            </div>

            {/* Origin Dropdown */}
            <div className="w-full lg:w-40 shrink-0">
              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="w-full bg-[#1a1a1a] text-zinc-300 text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] font-semibold h-9"
              >
                <option value="todas">Todas origens</option>
                <option value="formulário site">Formulário Site</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="desconhecido">Desconhecido</option>
              </select>
            </div>

            {/* Pipeline Dropdown */}
            <div className="w-full lg:w-40 shrink-0">
              <select
                value={pipelineFilter}
                onChange={(e) => setPipelineFilter(e.target.value)}
                className="w-full bg-[#1a1a1a] text-zinc-300 text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] font-semibold h-9"
              >
                <option value="todos">Todos pipelines</option>
                {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Date limits */}
            <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 text-xs">
              <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg px-2 py-1 h-9">
                <span className="text-zinc-500 font-bold">De</span>
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                  className="bg-transparent border-none text-white font-mono focus:outline-none focus:ring-0 text-[11px]" 
                />
              </div>
              <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg px-2 py-1 h-9">
                <span className="text-zinc-500 font-bold">Até</span>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                  className="bg-transparent border-none text-white font-mono focus:outline-none focus:ring-0 text-[11px]" 
                />
              </div>
            </div>

            {/* Toggle showArchived */}
            <div className="flex items-center gap-2 border border-[#1f1f1f] px-3.5 rounded-lg h-9 bg-[#1a1a1a]/30 shrink-0 text-xs text-zinc-450 font-semibold select-none">
              <span>Mostrar arquivados</span>
              <button
                type="button"
                onClick={() => setShowArchived(!showArchived)}
                className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-250 outline-none ${
                  showArchived ? 'bg-[#e13a40]' : 'bg-[#27272a]'
                }`}
              >
                <span className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-250 ${showArchived ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            {/* Export data */}
            <button
              onClick={handleExportData}
              className="gap-1.5 text-xs py-2 px-4 rounded-lg font-semibold bg-[#1a1a1a] border border-[#1f1f1f] text-zinc-400 hover:text-white flex items-center justify-center shrink-0 h-9 transition-all active:scale-95"
              title="Exportar base de leads"
            >
              <Download className="h-3.5 w-3.5 text-[#e13a40]" />
              <span>Exportar</span>
            </button>

          </div>

          {/* List Table Grid Database */}
          {isLoading ? (
            <div className="py-20 text-center text-zinc-500 text-xs">Aguarde, carregando carteira…</div>
          ) : filteredContacts.length > 0 ? (
            <div className="border border-[#1f1f1f] bg-[#121212]/50 rounded-xl overflow-hidden shadow-md">
              <table className="w-full border-collapse text-left text-xs font-body">
                <thead>
                  <tr className="bg-[#121212] border-b border-[#1f1f1f] text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-3 px-4 w-12"><input type="checkbox" className="rounded bg-[#1a1a1a] border-[#1f1f1f] focus:ring-0 text-[#e13a40] cursor-pointer" /></th>
                    <th className="py-3 px-6">Nome / Identificação</th>
                    <th className="py-3 px-6">E-mail de Contato</th>
                    <th className="py-3 px-6">Origem</th>
                    <th className="py-3 px-6">Funil / Pipeline</th>
                    <th className="py-3 px-6">Última Atividade</th>
                    <th className="py-3 px-4 w-16 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]/60 text-zinc-350">
                  {filteredContacts.map(contact => {
                    const initials = (contact.name || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
                    const isClient = contact.current_stage === 'fechado' || contact.current_stage === 'entregue';
                    const pipeName = pipelines.find(p => p.id === (contact.pipeline_id || 'principal'))?.name || 'Pipeline Principal';
                    
                    return (
                      <tr 
                        key={contact.id} 
                        onClick={() => handleCardClick(contact)}
                        className="hover:bg-zinc-900/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded bg-[#1a1a1a] border-[#1f1f1f] focus:ring-0 text-[#e13a40] cursor-pointer" />
                        </td>
                        <td className="py-4 px-6 font-semibold text-white">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-xs uppercase">
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-150 group-hover:text-[#e13a40] transition-colors">{contact.name}</span>
                              <span className="text-[10px] text-zinc-550 mt-0.5">{formatPhone(contact.phone)}</span>
                            </div>
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ml-1.5 border tracking-wider select-none ${
                              isClient 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-[#e13a40]/10 text-[#e13a40] border-[#e13a40]/20'
                            }`}>
                              {isClient ? 'Cliente' : 'Lead'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-zinc-450">{contact.email || 'Não cadastrado'}</td>
                        <td className="py-4 px-6 text-zinc-450">{contact.origin || 'Desconhecido'}</td>
                        <td className="py-4 px-6 font-semibold text-zinc-350">{pipeName}</td>
                        <td className="py-4 px-6 font-mono text-[11px] text-zinc-450">
                          {formatDateYY(contact.created_at || contact.last_activity)}
                        </td>
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {showArchived ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => handleRestoreLead(contact.id)}
                                className="p-1 rounded text-emerald-500 hover:text-emerald-400 hover:bg-zinc-900 transition-colors"
                                title="Desarquivar Lead"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeletePermanent(contact.id)}
                                className="p-1 rounded text-red-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                                title="Excluir Permanentemente"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleArchiveLead(contact.id)}
                              className="p-1.5 rounded text-zinc-600 hover:text-white hover:bg-zinc-900/60 transition-colors"
                              title="Arquivar Lead"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-24 border border-dashed border-[#1f1f1f] text-center rounded-xl text-zinc-500 text-xs">
              Nenhum contato encontrado. Limpe os filtros ou importe leads.
            </div>
          )}

        </div>
      )}

      {/* ──── MODAL 1: NOVO LEAD / OPORTUNIDADE WIZARD ──── */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => setIsNewLeadModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pb-4 border-b border-[#1f1f1f] flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-[#e13a40]" />
              <h2 className="text-base font-bold text-white">Criar Nova Oportunidade</h2>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="space-y-4 py-4 overflow-y-auto pr-1 flex-1 scrollbar-thin">
              
              {/* Funnel pipeline target */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Funil de Vendas / Pipeline</label>
                <select
                  value={newLeadForm.pipelineId}
                  onChange={(e) => {
                    const newPipeId = e.target.value;
                    const pipe = pipelines.find(p => p.id === newPipeId) || pipelines[0];
                    setNewLeadForm(prev => ({ 
                      ...prev, 
                      pipelineId: newPipeId, 
                      stage: pipe.stages[0].id 
                    }));
                  }}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] font-semibold h-9"
                >
                  {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Coluna / Stage select */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Estágio Inicial</label>
                <select
                  value={newLeadForm.stage}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] font-semibold h-9"
                >
                  {(pipelines.find(p => p.id === newLeadForm.pipelineId) || activePipeline).stages.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Nome do Lead / Empresa *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Marina Sousa"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] h-9"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Telefone / WhatsApp *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: 5581999999999"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] h-9 font-mono"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">E-mail</label>
                <input 
                  type="email"
                  placeholder="Ex: marina@empresa.com"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] h-9 font-mono"
                />
              </div>

              {/* Estimated Value */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Valor da Oportunidade (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Ex: 5000.00"
                  value={newLeadForm.value}
                  onChange={(e) => setNewLeadForm(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] h-9 font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#1f1f1f] text-xs">
                <button
                  type="button"
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-[#1f1f1f] text-zinc-450 hover:text-white hover:bg-zinc-900 transition-all font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-white font-extrabold shadow-sm transition-all"
                >
                  Criar Lead
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ──── MODAL 2: WEBHOOKS DE CAPTURA MODAL (Print 3 clone) ──── */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            
            <button 
              onClick={() => setIsWebhookModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title */}
            <div className="pb-4 border-b border-[#1f1f1f] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white mb-0.5">Webhooks de Captura</h2>
                <p className="text-zinc-550 text-xs">Crie webhooks para conectar formulários externos ao seu CRM.</p>
              </div>
              
              {/* + Nova Captura button */}
              <button
                onClick={handleCreateWebhook}
                className="py-1.5 px-4 bg-[#e13a40] hover:bg-[#c52f34] text-xs text-white font-extrabold rounded-lg flex items-center gap-1.5 transition-all shadow-md active:scale-95 shadow-[#e13a40]/10"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Captura</span>
              </button>
            </div>

            {/* Webhooks list scroll */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1 scrollbar-thin">
              {webhooks.length > 0 ? (
                <div className="space-y-3">
                  {webhooks.map(wh => (
                    <div key={wh.id} className="p-4 rounded-xl bg-[#1a1a1a]/50 border border-[#1f1f1f] flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{wh.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500 block select-all truncate">{wh.endpoint}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(wh.endpoint);
                            alert('Webhook copiado para área de transferência!');
                          }}
                          className="px-2.5 py-1.5 rounded bg-zinc-900 border border-[#1f1f1f] hover:border-zinc-700 text-[10px] text-zinc-450 hover:text-white transition-all"
                        >
                          Copiar URL
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(wh.id)}
                          className="p-1.5 rounded text-red-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
                          title="Excluir Webhook"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state matching print 3 exactly */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg className="w-10 h-10 text-zinc-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <p className="text-xs text-zinc-500 font-semibold mb-3">Nenhum webhook criado ainda.</p>
                  
                  <button
                    onClick={handleCreateWebhook}
                    className="py-2 px-5 border border-[#1f1f1f] hover:border-zinc-700 bg-[#161619]/40 rounded-xl text-xs text-zinc-400 hover:text-white font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#e13a40]" />
                    <span>Criar primeiro webhook</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom fields description strictly cloning print 3 */}
            <div className="p-4 rounded-xl bg-[#171719]/40 border border-[#1f1f1f]/80 select-none text-[11px] leading-relaxed shrink-0">
              <span className="font-bold text-white block mb-2 uppercase text-[10px] tracking-wider text-zinc-450">Campos aceitos no formulário:</span>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono text-zinc-400">
                <div><strong className="text-white">name / nome</strong> — Nome *</div>
                <div><strong className="text-white">email</strong> — E-mail</div>
                <div><strong className="text-white">phone / telefone</strong> — Telefone</div>
                <div><strong className="text-white">company / empresa</strong> — Empresa</div>
                <div><strong className="text-white">project / servico</strong> — Projeto</div>
                <div><strong className="text-white">message / mensagem</strong> — Mensagem</div>
              </div>

              <span className="text-[10px] text-zinc-550 font-bold block mt-3 font-body">
                * Obrigatório. Aceita POST (JSON/form-data) e GET.
              </span>
            </div>

          </div>
        </div>
      )}

      {/* ──── MODAL 2.5: NOVA CAPTURA DE LEADS (Nova Captura Modal - Print upload clone) ──── */}
      {isNewCaptureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => {
                setIsNewCaptureModalOpen(false);
                setIsWebhookModalOpen(true);
              }}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="pb-4 border-b border-[#1f1f1f]">
              <h2 className="text-base font-bold text-white">Nova Captura de Leads</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleGenerateWebhookSubmit} className="space-y-4 py-4 overflow-y-auto pr-1 flex-1 scrollbar-thin text-xs">
              
              {/* Nome da Captura */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-300 font-bold">Nome da captura *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Formulário Site Principal, Landing Page Google Ads"
                  value={newCaptureForm.name}
                  onChange={(e) => setNewCaptureForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] h-9 font-semibold"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-300 font-bold">Descrição (opcional)</label>
                <input 
                  type="text"
                  placeholder="Ex: Formulário de contato da home do site"
                  value={newCaptureForm.description}
                  onChange={(e) => setNewCaptureForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] h-9 font-semibold"
                />
              </div>

              {/* Pipeline de destino */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-300 font-bold">Pipeline de destino</label>
                <select
                  value={newCaptureForm.pipelineId}
                  onChange={(e) => setNewCaptureForm(prev => ({ ...prev, pipelineId: e.target.value }))}
                  className="w-full bg-[#1a1a1a] text-zinc-300 text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] font-bold h-9 cursor-pointer"
                >
                  <option value="sem-pipeline">Sem pipeline (avisa o lead)</option>
                  {pipelines.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Warnings matching print exactly */}
              {newCaptureForm.pipelineId === 'sem-pipeline' && (
                <div className="flex gap-2 text-[10.5px] text-amber-500 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg select-none leading-relaxed">
                  <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    Sem pipeline selecionado, o lead será criado mas <strong className="text-amber-400 font-bold">não aparecerá em nenhum funil</strong>. Recomendamos escolher um pipeline.
                  </div>
                </div>
              )}

              {/* Tags automáticas */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-zinc-300 font-bold">Tags automáticas</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Ex: Site, Google Ads"
                    value={currentTagInput}
                    onChange={(e) => setCurrentTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (currentTagInput.trim()) {
                          setNewCaptureForm(prev => ({
                            ...prev,
                            tags: [...prev.tags, currentTagInput.trim()]
                          }));
                          setCurrentTagInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] h-9 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (currentTagInput.trim()) {
                        setNewCaptureForm(prev => ({
                          ...prev,
                          tags: [...prev.tags, currentTagInput.trim()]
                        }));
                        setCurrentTagInput('');
                      }
                    }}
                    className="px-3 rounded-lg bg-zinc-900 border border-[#1f1f1f] hover:border-zinc-700 text-white font-bold h-9 flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-4 w-4 text-zinc-400" />
                  </button>
                </div>

                {/* Display tags list */}
                {newCaptureForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {newCaptureForm.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-350 text-[10px] font-semibold">
                        <span>{tag}</span>
                        <button 
                          type="button"
                          onClick={() => setNewCaptureForm(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, idx) => idx !== tIdx)
                          }))}
                          className="text-zinc-500 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-zinc-500 block font-medium">
                  Essas tags serão adicionadas automaticamente em cada lead.
                </span>
              </div>

              {/* Footer Actions Row matches print exactly */}
              <div className="pt-4 border-t border-[#1f1f1f] flex items-center justify-between text-xs select-none">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewCaptureModalOpen(false);
                    setIsWebhookModalOpen(true);
                  }}
                  className="py-2 px-3.5 rounded-lg text-zinc-400 hover:text-white font-bold transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Voltar</span>
                </button>
                
                <button
                  type="submit"
                  className="py-2.5 px-5.5 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold transition-all shadow-md shadow-[#e13a40]/10 flex items-center gap-1.5 active:scale-95"
                >
                  <span>Gerar Webhook</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ──── MODAL 3: AUTO-LEAD DO WHATSAPP MODAL (Print 4 clone) ──── */}
      {isAutoLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden flex flex-col">
            
            <button 
              onClick={() => setIsAutoLeadModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title */}
            <div className="pb-4 border-b border-[#1f1f1f] space-y-1.5">
              <h2 className="text-base font-bold text-white">Auto-lead do WhatsApp</h2>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Toda nova conversa recebida no WhatsApp, cujo telefone ainda não esteja cadastrado, vira automaticamente um lead no pipeline escolhido.
              </p>
            </div>

            {/* Inputs body */}
            <div className="py-5 space-y-4 flex-1 text-xs">
              
              {/* Toggle creation active status */}
              <div className="flex items-center justify-between py-1 border-b border-[#1f1f1f]/50">
                <span className="font-semibold text-white">Ativar criação automática</span>
                <button
                  type="button"
                  onClick={() => setAutoLeadSettings(prev => ({ ...prev, active: !prev.active }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    autoLeadSettings.active ? 'bg-[#e13a40]' : 'bg-[#27272a]'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${autoLeadSettings.active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Pipeline Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pipeline</label>
                <select
                  value={autoLeadSettings.pipelineId}
                  onChange={(e) => {
                    const pipeId = e.target.value;
                    const pipe = pipelines.find(p => p.id === pipeId) || pipelines[0];
                    setAutoLeadSettings(prev => ({ 
                      ...prev, 
                      pipelineId: pipeId, 
                      initialStage: pipe.stages[0].id 
                    }));
                  }}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] font-semibold h-9"
                >
                  {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Stage Column Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Coluna inicial</label>
                <select
                  value={autoLeadSettings.initialStage}
                  onChange={(e) => setAutoLeadSettings(prev => ({ ...prev, initialStage: e.target.value }))}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40] font-semibold h-9"
                >
                  {(pipelines.find(p => p.id === autoLeadSettings.pipelineId) || activePipeline).stages.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Modal footer matches print 4 buttons color */}
            <div className="pt-4 border-t border-[#1f1f1f] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsAutoLeadModalOpen(false)}
                className="py-2 px-4 rounded-lg text-zinc-400 hover:text-white font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveAutoLead(autoLeadSettings.active, autoLeadSettings.pipelineId, autoLeadSettings.initialStage)}
                className="py-2 px-5.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold transition-all shadow-md"
              >
                Salvar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ──── MODAL 4: CRIAR NOVO PIPELINE DE CAPTAÇÃO MODAL (Print 5 clone) ──── */}
      {isPipelineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
            
            <button 
              onClick={() => setIsPipelineModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title */}
            <div className="pb-4 border-b border-[#1f1f1f] space-y-1">
              <h2 className="text-base font-bold text-white">Criar Novo Pipeline de Captação</h2>
            </div>

            {/* Form list scroll */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1 scrollbar-thin text-xs">
              
              {/* Pipeline Name input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nome do Pipeline</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Leads Instagram, Formulário Site..."
                  value={newPipelineName}
                  onChange={(e) => setNewPipelineName(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/50 p-2.5 outline-none font-semibold h-9 shadow-inner"
                />
              </div>

              {/* Stages List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Etapas do Funil</span>
                  
                  <button
                    type="button"
                    onClick={handleAddCustomStage}
                    className="text-[10px] font-bold text-[#e13a40] hover:underline flex items-center gap-1"
                  >
                    + Adicionar Etapa
                  </button>
                </div>

                <div className="space-y-2">
                  {newPipelineStages.map((stage, idx) => (
                    <div key={stage.id} className="flex items-center gap-2">
                      {/* Name input */}
                      <input 
                        type="text"
                        required
                        value={stage.label}
                        onChange={(e) => {
                          const updated = [...newPipelineStages];
                          updated[idx].label = e.target.value;
                          setNewPipelineStages(updated);
                        }}
                        className="flex-1 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] px-3 py-2 outline-none h-8 font-semibold"
                      />

                      {/* Color select dropdown matching print 5 */}
                      <select
                        value={stage.color}
                        onChange={(e) => {
                          const updated = [...newPipelineStages];
                          updated[idx].color = e.target.value;
                          setNewPipelineStages(updated);
                        }}
                        className="bg-[#1a1a1a] text-zinc-300 text-[11px] rounded-lg border border-[#1f1f1f] px-2 py-1 outline-none h-8 font-bold cursor-pointer w-24"
                      >
                        <option value="blue">blue</option>
                        <option value="yellow">yellow</option>
                        <option value="purple">purple</option>
                        <option value="orange">orange</option>
                        <option value="green">green</option>
                        <option value="red">red</option>
                      </select>

                      {/* Delete stage button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (newPipelineStages.length <= 2) {
                            alert('Um pipeline precisa de pelo menos duas etapas.');
                            return;
                          }
                          const updated = newPipelineStages.filter((_, sIdx) => sIdx !== idx);
                          setNewPipelineStages(updated);
                        }}
                        className="text-zinc-650 hover:text-white p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Cancel/Create footer matches print 5 colors */}
            <div className="pt-4 border-t border-[#1f1f1f] flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsPipelineModalOpen(false)}
                className="py-2.5 px-4 rounded-lg bg-zinc-900 border border-[#1f1f1f] text-zinc-400 hover:text-white font-semibold transition-all h-9"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleCreateCustomPipeline}
                className="py-2.5 px-5.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold transition-all shadow-md shadow-[#e13a40]/10 h-9"
              >
                Criar Pipeline
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Opportunity detail panel */}
      <ContactDetailPanel
        contact={selectedContact}
        history={contactHistory}
        visible={detailPanelOpen}
        onClose={handleClosePanel}
      />

    </div>
  );
}
