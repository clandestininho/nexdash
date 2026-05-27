import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertTriangle, 
  Palette, 
  Grid, 
  Globe, 
  UserPlus, 
  Play, 
  Trash2, 
  Eye, 
  Image as ImageIcon,
  Sliders,
  FileText,
  MousePointerClick,
  Calendar,
  Users,
  BarChart2,
  Settings as SettingsIcon,
  Link as LinkIcon,
  Sparkles,
  CalendarDays,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Identidade Visual Premium - Nexfy',
    category: 'Branding',
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    externalLink: 'https://behance.net/nexfy',
    description: 'Estudo de branding completo, incluindo logotipo responsivo, manual de marca completo de 80 páginas, tipografia exclusiva e assets para redes sociais.'
  }
];

const INITIAL_MEETING_TYPES = [
  {
    id: 'meet-1',
    name: 'Reunião de 30 minutos',
    slug: 'reuniao-30',
    duration: '30',
    desc: 'Breve alinhamento de escopo e objetivos do projeto.',
    color: '#3b82f6'
  }
];

export default function Pages() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [projects, setProjects] = useState([]);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form fields for new project
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('');
  const [projVideoUrl, setProjVideoUrl] = useState('');
  const [projImageUrl, setProjImageUrl] = useState('');
  const [projExternalLink, setProjExternalLink] = useState('');
  const [projDescription, setProjDescription] = useState('');

  // Page Customization States (Theme colors & settings)
  const [primaryColor, setPrimaryColor] = useState('#e13a40');
  const [heroTitle, setHeroTitle] = useState('Nexfy');
  const [heroSubtitle, setHeroSubtitle] = useState('Transformando ideias em realidade');
  const [layoutName, setLayoutName] = useState('Hoverton PRO');
  const [customDomain, setCustomDomain] = useState('dgflow.com.br/p/nexfy');
  const [leadCaptureConfigured, setLeadCaptureConfigured] = useState(false);

  // --- TAB: AGENDAMENTO (SCHEDULING) STATES ---
  const [schedSubTab, setSchedSubTab] = useState('configs'); // configs, meeting-types, availability
  const [schedSlug, setSchedSlug] = useState('nexfy');
  const [schedMinHours, setSchedMinHours] = useState('24');
  const [schedMaxDays, setSchedMaxDays] = useState('60');
  const [schedPipeline, setSchedPipeline] = useState('none');
  const [schedPipelineStage, setSchedPipelineStage] = useState('first');
  const [schedWelcomeMsg, setSchedWelcomeMsg] = useState('Olá! Escolha o melhor horário para nossa conversa.');
  const [schedConfirmMsg, setSchedConfirmMsg] = useState('Reunião confirmada! Você receberá um e-mail com os detalhes.');
  
  // Meeting types list
  const [meetingTypes, setMeetingTypes] = useState(INITIAL_MEETING_TYPES);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  
  // New meeting form fields
  const [meetName, setMeetName] = useState('');
  const [meetSlug, setMeetSlug] = useState('');
  const [meetDuration, setMeetDuration] = useState('30');
  const [meetDesc, setMeetDesc] = useState('');
  const [meetColor, setMeetColor] = useState('#3b82f6'); // default blue
  
  const circularColors = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f97316', // orange
    '#10b981', // green
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#eab308'  // yellow
  ];

  useEffect(() => {
    const stored = localStorage.getItem('dgflow_portfolio_projects');
    if (stored) {
      setProjects(JSON.parse(stored));
    } else {
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem('dgflow_portfolio_projects', JSON.stringify(INITIAL_PROJECTS));
    }

    const storedMeetings = localStorage.getItem('dgflow_meeting_types');
    if (storedMeetings) {
      setMeetingTypes(JSON.parse(storedMeetings));
    } else {
      setMeetingTypes(INITIAL_MEETING_TYPES);
      localStorage.setItem('dgflow_meeting_types', JSON.stringify(INITIAL_MEETING_TYPES));
    }
  }, []);

  const saveProjects = (updatedList) => {
    setProjects(updatedList);
    localStorage.setItem('dgflow_portfolio_projects', JSON.stringify(updatedList));
  };

  const saveMeetings = (updatedList) => {
    setMeetingTypes(updatedList);
    localStorage.setItem('dgflow_meeting_types', JSON.stringify(updatedList));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projTitle) return;

    const newItem = {
      id: 'proj-' + Date.now(),
      title: projTitle,
      category: projCategory || 'Geral',
      videoUrl: projVideoUrl,
      imageUrl: projImageUrl || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=600&auto=format&fit=crop',
      externalLink: projExternalLink,
      description: projDescription
    };

    const updated = [newItem, ...projects];
    saveProjects(updated);
    setIsNewItemModalOpen(false);

    // Reset fields
    setProjTitle('');
    setProjCategory('');
    setProjVideoUrl('');
    setProjImageUrl('');
    setProjExternalLink('');
    setProjDescription('');
  };

  const handleDeleteProject = (id) => {
    if (confirm("Remover este item do portfólio?")) {
      saveProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleConfigureLeadCapture = () => {
    setLeadCaptureConfigured(true);
    alert("Formulário de captura integrado ao seu pipeline de Kanban com sucesso!");
  };

  const handleSaveMeetingType = (e) => {
    e.preventDefault();
    if (!meetName) return;

    const newMeet = {
      id: 'meet-' + Date.now(),
      name: meetName,
      slug: meetSlug || meetName.toLowerCase().replace(/\s+/g, '-'),
      duration: meetDuration,
      desc: meetDesc,
      color: meetColor
    };

    const updated = [...meetingTypes, newMeet];
    saveMeetings(updated);
    setIsNewMeetingModalOpen(false);

    // Reset fields
    setMeetName('');
    setMeetSlug('');
    setMeetDuration('30');
    setMeetDesc('');
    setMeetColor('#3b82f6');
  };

  const handleDeleteMeeting = (id) => {
    if (confirm("Remover este tipo de reunião?")) {
      saveMeetings(meetingTypes.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Upper Navigation & Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
              <FolderKanban className="h-6 w-6 text-[#e13a40]" />
              Portfólio & Páginas
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-body">
              Gerencie sua página pública, link da bio, catálogo de projetos e atração de leads.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/visual-editor')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e13a40]/20 bg-[#e13a40]/5 text-[#e13a40] hover:bg-[#e13a40]/10 text-xs font-semibold transition-all shadow-sm shadow-[#e13a40]/5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Abrir Editor Visual</span>
            </button>
            <button
              onClick={() => setIsNewItemModalOpen(true)}
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
              Novo Item
            </button>
          </div>
        </div>

        {/* Tab Row (styled exactly like dgflow) */}
        <div className="flex items-center gap-1 border-b border-[#1f1f23] pb-px overflow-x-auto scrollbar-none">
          {[
            { id: 'portfolio', label: 'Portfólio' },
            { id: 'public-page', label: 'Página Pública' },
            { id: 'bio-link', label: 'Link da Bio' },
            { id: 'forms', label: 'Formulários' },
            { id: 'scheduling', label: 'Agendamento' },
            { id: 'configs', label: 'Configurações' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-[#e13a40] text-white bg-zinc-950/20' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PORTFOLIO TAB */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          
          {projects.length === 0 ? (
            <div className="border-2 border-dashed border-[#1f1f23] rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-zinc-950/20">
              <div 
                onClick={() => setIsNewItemModalOpen(true)}
                className="h-14 w-14 rounded-full bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center cursor-pointer hover:scale-105 hover:bg-[#e13a40]/20 transition-all text-[#e13a40] mb-4"
              >
                <Plus className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Nenhum projeto cadastrado</h3>
              <p className="text-zinc-500 text-xs max-w-sm mb-6 leading-relaxed">
                Comece adicionando seus projetos para construir um portfólio incrível e impressionar seus clientes corporativos.
              </p>
              <button
                onClick={() => setIsNewItemModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold text-xs shadow-md shadow-[#e13a40]/10 transition-all"
              >
                Adicionar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(proj => (
                <div 
                  key={proj.id}
                  className="rounded-xl border border-[#1f1f23] bg-[#0c0c0e] overflow-hidden group hover:border-zinc-800 transition-all flex flex-col h-full"
                >
                  {/* Visual thumbnail area */}
                  <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                    {proj.imageUrl ? (
                      <img 
                        src={proj.imageUrl} 
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    
                    {proj.videoUrl && (
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Play className="h-2.5 w-2.5 text-[#e13a40] fill-[#e13a40]" />
                        Vídeo
                      </span>
                    )}

                    <span className="absolute bottom-3 left-3 bg-[#e13a40]/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                      {proj.category}
                    </span>
                  </div>

                  {/* Body description */}
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-[#e13a40] transition-colors leading-tight">
                      {proj.title}
                    </h3>
                    <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-3">
                      {proj.description || 'Nenhuma descrição fornecida.'}
                    </p>
                  </div>

                  {/* Action footer */}
                  <div className="p-3 bg-zinc-950/40 border-t border-[#1f1f23] flex items-center justify-between text-xs">
                    {proj.externalLink ? (
                      <a
                        href={proj.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Ver online</span>
                      </a>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setProjTitle(proj.title);
                          setProjCategory(proj.category);
                          setProjVideoUrl(proj.videoUrl);
                          setProjImageUrl(proj.imageUrl);
                          setProjExternalLink(proj.externalLink);
                          setProjDescription(proj.description);
                          handleDeleteProject(proj.id);
                          setIsNewItemModalOpen(true);
                        }}
                        className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
                        title="Editar"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 rounded text-zinc-500 hover:text-rose-500 hover:bg-zinc-900 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* PUBLIC PAGE TAB */}
      {activeTab === 'public-page' && (
        <div className="space-y-6">
          
          {/* Subdomain config block */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-[#1f1f23] bg-[#0c0c0e]">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Endereço da sua Página</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-zinc-300 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900 font-semibold">
                  {customDomain}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                  title="Copiar Link"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => navigate('/visual-editor')}
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                  title="Abrir Editor Visual"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Publicado
              </span>
            </div>
          </div>

          {/* Lead Capture Warning Alert */}
          {!leadCaptureConfigured && (
            <div className="flex items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200">
              <div className="flex items-start md:items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 md:mt-0" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Captura de leads não configurada</h4>
                  <p className="text-zinc-400 text-[10px] leading-relaxed">
                    Seu formulário de contato da página pública não está conectado a um pipeline do CRM. Conecte agora para receber e triar leads automaticamente.
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfigureLeadCapture}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] shadow-sm uppercase tracking-wider shrink-0 transition-colors"
              >
                Configurar
              </button>
            </div>
          )}

          {/* Grid Settings Panels (clicking Cores/Layout redirects to VisualEditor!) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Color Config */}
            <div 
              onClick={() => navigate('/visual-editor')}
              className="p-4 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] hover:border-zinc-800 cursor-pointer transition-all flex items-center gap-3 group"
            >
              <div className="h-10 w-10 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40] group-hover:scale-105 transition-all">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-normal">Cores</h4>
                <p className="text-[10px] text-zinc-500 leading-normal">Tema visual</p>
              </div>
            </div>

            {/* Layout Config */}
            <div 
              onClick={() => navigate('/visual-editor')}
              className="p-4 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] hover:border-zinc-800 cursor-pointer transition-all flex items-center gap-3 group"
            >
              <div className="h-10 w-10 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40] group-hover:scale-105 transition-all">
                <Grid className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-normal">Layout</h4>
                <p className="text-[10px] text-zinc-500 leading-normal">{layoutName}</p>
              </div>
            </div>

            {/* Domain Config */}
            <div 
              onClick={() => {
                const dom = prompt("Configure seu domínio próprio corporativo:", customDomain);
                if (dom) setCustomDomain(dom);
              }}
              className="p-4 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] hover:border-zinc-800 cursor-pointer transition-all flex items-center gap-3 group"
            >
              <div className="h-10 w-10 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40] group-hover:scale-105 transition-all">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-normal">Domínio</h4>
                <p className="text-[10px] text-zinc-500 leading-normal">Personalizado</p>
              </div>
            </div>

            {/* Lead Capture Config */}
            <div 
              onClick={handleConfigureLeadCapture}
              className="p-4 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] hover:border-zinc-800 cursor-pointer transition-all flex items-center gap-3 group"
            >
              <div className="h-10 w-10 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40] group-hover:scale-105 transition-all">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-normal">Captura de Leads</h4>
                <p className="text-[10px] text-zinc-500 leading-normal">Formulário integrado</p>
              </div>
            </div>

          </div>

          {/* Premium Dynamic Live Page Mockup / Preview */}
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white overflow-hidden">
            <CardHeader className="border-b border-[#1f1f23] pb-3 bg-zinc-950/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">Visualização da Página Pública</CardTitle>
                <CardDescription className="text-zinc-500 text-[10px]">Prévia em tempo real das alterações do seu portfólio público.</CardDescription>
              </div>

              {/* Dynamic inline customize input fields */}
              <div className="flex items-center gap-3">
                <input 
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Nome do Estúdio"
                  className="bg-[#101014] text-[10px] border border-zinc-850 px-2 py-1 rounded text-white focus:border-[#e13a40] w-24 outline-none font-bold"
                  title="Alterar Título da Hero"
                />
                <input 
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Subtítulo da Hero"
                  className="bg-[#101014] text-[10px] border border-zinc-850 px-2 py-1 rounded text-white focus:border-[#e13a40] w-48 outline-none font-bold"
                  title="Alterar Subtítulo da Hero"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 bg-zinc-950/60">
              
              {/* Browser Mockup Wrapper */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-2xl">
                
                {/* Browser Tab Header bar */}
                <div className="bg-[#0c0c0e] border-b border-zinc-900 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/85" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/85" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/85" />
                  </div>

                  <div className="flex-1 max-w-md mx-auto relative flex items-center justify-center">
                    <div className="w-full bg-[#101014] border border-zinc-900 rounded-md py-1 px-8 text-center text-[10px] text-zinc-400 font-mono select-none">
                      {customDomain}
                    </div>
                    <Globe className="h-3 w-3 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="w-10 shrink-0" />
                </div>

                {/* Simulated Webpage Body with custom gradients and lights */}
                <div className="relative bg-[#09090b] min-h-[380px] p-8 overflow-hidden font-body text-zinc-100 flex flex-col justify-between">
                  
                  {/* Blurry Colorful Ambient Lights */}
                  <div className="absolute top-[-80px] left-[-60px] h-48 w-48 rounded-full bg-[#e13a40]/15 blur-[80px]" />
                  <div className="absolute bottom-[-60px] right-[-60px] h-48 w-48 rounded-full bg-amber-500/10 blur-[80px]" />

                  {/* Simulated Nav */}
                  <div className="relative flex items-center justify-between border-b border-zinc-900/60 pb-3 mb-6">
                    <span className="font-extrabold text-sm tracking-wider text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                      {heroTitle.toUpperCase()}
                    </span>

                    <button className="px-3 py-1 rounded bg-[#e13a40]/10 border border-[#e13a40]/30 text-white text-[9px] font-bold uppercase transition-all hover:bg-[#e13a40]/20">
                      Contato
                    </button>
                  </div>

                  {/* Simulated Hero Grid Layout */}
                  <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 items-center flex-1 py-4">
                    
                    {/* Left content */}
                    <div className="md:col-span-3 space-y-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-extrabold text-[#e13a40] tracking-widest uppercase block bg-[#e13a40]/10 px-2 py-0.5 rounded border border-[#e13a40]/10 w-fit">
                          ESTÚDIO DESIGN CREATIVE
                        </span>
                        <h1 className="text-2xl font-black text-white leading-tight tracking-tight max-w-sm">
                          {heroSubtitle}
                        </h1>
                        <p className="text-zinc-500 text-[10px] leading-relaxed max-w-xs">
                          Criamos marcas fortes que geram desejo, elevam seu preço e dominam o mercado com design sob medida.
                        </p>
                      </div>

                      <button className="px-4 py-2 rounded-lg bg-[#e13a40] text-white text-[10px] font-extrabold shadow-lg shadow-[#e13a40]/20 flex items-center gap-1 uppercase tracking-wider transition-all hover:scale-102">
                        <span>Iniciar Projeto</span>
                        <MousePointerClick className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Right hero image mockup */}
                    <div className="md:col-span-2 aspect-[4/3] rounded-xl border border-zinc-800 bg-[#0c0c0e] flex items-center justify-center p-6 text-zinc-500 font-bold text-[10px] uppercase tracking-widest relative overflow-hidden group select-none">
                      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 to-zinc-900" />
                      <div className="relative text-center space-y-1">
                        <ImageIcon className="h-5 w-5 text-zinc-600 mx-auto" />
                        <span className="block text-zinc-400">Imagem Hero</span>
                        <span className="block text-[8px] text-zinc-600 font-mono lowercase">1200 x 900px</span>
                      </div>
                    </div>

                  </div>

                  {/* Simulated Services Section Below */}
                  <div className="relative mt-8 pt-8 border-t border-zinc-900/60">
                    <div className="text-center space-y-1 mb-6">
                      <h2 className="text-xs font-black uppercase text-white tracking-widest">Serviços</h2>
                      <p className="text-[9px] text-zinc-500 leading-normal">Soluções completas para transformar sua marca corporativa</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { title: 'Identidade Visual', price: 'R$ 2.500' },
                        { title: 'Landing Page Premium', price: 'R$ 3.000' },
                        { title: 'Manual de Marca', price: 'R$ 1.200' }
                      ].map((srv, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-zinc-900 bg-[#0c0c0e] space-y-2">
                          <span className="text-[9px] font-bold text-white block">{srv.title}</span>
                          <span className="text-[8px] text-zinc-500 leading-normal block">Seus serviços aparecerão aqui detalhados.</span>
                          <span className="text-[10px] font-bold text-[#e13a40] font-mono block">{srv.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </CardContent>
          </Card>

        </div>
      )}

      {/* --- TAB: AGENDAMENTO (HIGH FIDELITY SCREENSHOT 1 & 2) --- */}
      {activeTab === 'scheduling' && (
        <div className="space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-[#1f1f23] bg-[#0c0c0e]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40]">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-white">Agendamento Online</h2>
                <p className="text-zinc-500 text-[10px] leading-normal">Configure sua página de agendamento estilo Calendly integrada ao WhatsApp.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/agendar/${schedSlug}`);
                  alert("Link de agendamento copiado para a área de transferência!");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-350 hover:text-white text-xs font-semibold"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Link</span>
              </button>
              <button 
                onClick={() => alert(`Visualizando página pública em: /agendar/${schedSlug}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-350 hover:text-white text-xs font-semibold"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Visualizar</span>
              </button>
            </div>
          </div>

          {/* Subtabs for scheduling page */}
          <div className="flex items-center gap-1 border-b border-[#1f1f23] pb-px">
            {[
              { id: 'configs', label: '⚙ Configurações' },
              { id: 'meeting-types', label: '🎥 Tipos de Reunião' },
              { id: 'availability', label: '📅 Disponibilidade' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSchedSubTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  schedSubTab === tab.id 
                    ? 'border-[#e13a40] text-white' 
                    : 'border-transparent text-zinc-550 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sched Subtab Configurações (Screenshot 1) */}
          {schedSubTab === 'configs' && (
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="p-6 space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left column */}
                  <div className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Slug da página *</label>
                      <div className="flex items-center">
                        <span className="bg-[#101014] text-xs px-3 py-2 rounded-l-lg border border-zinc-800 border-r-0 text-zinc-500 font-mono">
                          /agendar/
                        </span>
                        <Input 
                          value={schedSlug}
                          onChange={(e) => setSchedSlug(e.target.value)}
                          className="bg-[#101014] border-zinc-800 text-white rounded-r-lg rounded-l-none text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Máximo de dias no futuro</label>
                      <Input 
                        type="number"
                        value={schedMaxDays}
                        onChange={(e) => setSchedMaxDays(e.target.value)}
                        className="bg-[#101014] border-zinc-800 text-white text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Etapa inicial do pipeline</label>
                      <select 
                        value={schedPipelineStage}
                        onChange={(e) => setSchedPipelineStage(e.target.value)}
                        className="w-full bg-[#101014] text-xs border border-zinc-800 p-2.5 rounded-lg text-zinc-300 outline-none focus:border-[#e13a40]"
                      >
                        <option value="first">Primeira etapa (padrão)</option>
                        <option value="briefing">Briefing Enviado</option>
                        <option value="call">Call Agendada</option>
                      </select>
                    </div>

                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Antecedência mínima (horas)</label>
                      <Input 
                        type="number"
                        value={schedMinHours}
                        onChange={(e) => setSchedMinHours(e.target.value)}
                        className="bg-[#101014] border-zinc-800 text-white text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-zinc-400 font-semibold">Pipeline para novos leads</label>
                      <select 
                        value={schedPipeline}
                        onChange={(e) => setSchedPipeline(e.target.value)}
                        className="w-full bg-[#101014] text-xs border border-zinc-800 p-2.5 rounded-lg text-zinc-300 outline-none focus:border-[#e13a40]"
                      >
                        <option value="none">Nenhum (padrão)</option>
                        <option value="sales">Vendas Corporativas</option>
                        <option value="whatsapp">Triagem Automática WhatsApp</option>
                      </select>
                    </div>

                  </div>

                </div>

                {/* Textareas */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Mensagem de boas-vindas</label>
                  <textarea 
                    rows="2"
                    value={schedWelcomeMsg}
                    onChange={(e) => setSchedWelcomeMsg(e.target.value)}
                    className="w-full bg-[#101014] text-xs border border-zinc-800 rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Mensagem de confirmação</label>
                  <textarea 
                    rows="2"
                    value={schedConfirmMsg}
                    onChange={(e) => setSchedConfirmMsg(e.target.value)}
                    className="w-full bg-[#101014] text-xs border border-zinc-800 rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40]"
                  />
                </div>

                {/* Footer action button */}
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => alert("Configurações de agendamento online salvas!")}
                    className="px-5 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold text-xs shadow-md shadow-[#e13a40]/10 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>

              </CardContent>
            </Card>
          )}

          {/* Sched Subtab Tipos de Reunião (Screenshot 2) */}
          {schedSubTab === 'meeting-types' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tipos de Reunião Disponíveis</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Gerencie os tipos de sessões de vídeo-chamada que o seu lead pode agendar.</p>
                </div>
                <button 
                  onClick={() => setIsNewMeetingModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white text-xs font-semibold shadow-md shadow-[#e13a40]/5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo Tipo</span>
                </button>
              </div>

              {meetingTypes.length === 0 ? (
                <div className="p-10 border border-[#1f1f23] rounded-xl text-center text-zinc-500 text-xs">
                  Nenhum tipo de reunião cadastrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meetingTypes.map(meet => (
                    <div 
                      key={meet.id}
                      className="p-4 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] flex items-center justify-between gap-4 group hover:border-zinc-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-white"
                          style={{ backgroundColor: meet.color || '#3b82f6' }}
                        >
                          <Play className="h-3.5 w-3.5 fill-white" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {meet.name}
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-zinc-950 border border-zinc-900 text-zinc-400 rounded">
                              {meet.duration} min
                            </span>
                          </h4>
                          <p className="text-zinc-500 text-[10px] leading-normal">{meet.desc || 'Sem descrição'}</p>
                          <span className="font-mono text-[9px] text-zinc-650 block">/agendar/{schedSlug}/{meet.slug}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteMeeting(meet.id)}
                        className="text-zinc-500 hover:text-rose-500 p-2 hover:bg-zinc-900 rounded shrink-0 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Sched Subtab Disponibilidade */}
          {schedSubTab === 'availability' && (
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Grade Horária de Atendimento</h4>
                <p className="text-[10px] text-zinc-500">Configure os horários de segunda a sexta que você deseja deixar disponível para chamadas com clientes corporativos.</p>
                
                <div className="space-y-2 pt-2 text-xs">
                  {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'].map(day => (
                    <div key={day} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border border-zinc-900">
                      <span className="font-semibold text-white">{day}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 font-mono">09:00 - 12:00</span>
                        <span className="text-[10px] text-zinc-500 font-mono">14:00 - 18:00</span>
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">Ativo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}


      {/* --- TAB: CONFIGURAÇÕES (HIGH FIDELITY SCREENSHOT 4) --- */}
      {activeTab === 'configs' && (
        <div className="space-y-6">
          
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 font-display">
              <SettingsIcon className="h-6 w-6 text-[#e13a40]" />
              Configurações
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5 font-body">Personalize conexões de API, pixels, domínio e badge de marca.</p>
          </div>

          {/* MAIN SETTINGS CARDS (Screenshot 4) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: Links Padrão */}
            <div 
              onClick={() => alert("Redirecionando para central de Slugs & URLs públicas.")}
              className="p-5 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] hover:border-zinc-800 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="h-11 w-11 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40] group-hover:scale-105 transition-all shrink-0">
                <LinkIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider leading-normal">Links Padrão</h3>
                <p className="text-[10px] text-zinc-550 leading-relaxed">Gerencie seus slugs corporativos e configure URLs públicas curtas de Bio.</p>
              </div>
            </div>

            {/* Card 2: Domínio Próprio */}
            <div 
              onClick={() => {
                const dom = prompt("Insira seu domínio próprio corporativo (ex: seuprovedor.com.br):", customDomain);
                if (dom) setCustomDomain(dom);
              }}
              className="p-5 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] hover:border-zinc-800 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="h-11 w-11 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40] group-hover:scale-105 transition-all shrink-0">
                <Globe className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider leading-normal">Domínio Próprio</h3>
                <p className="text-[10px] text-zinc-550 leading-relaxed">Conecte seu domínio personalizado com apontamento CNAME DNS estático na DGFlow.</p>
              </div>
            </div>

            {/* Card 3: Pixels e Rastreamento */}
            <div 
              onClick={() => alert("Redirecionando para Pixels & Rastreamento em Integrações.")}
              className="p-5 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] hover:border-zinc-800 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="h-11 w-11 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40] group-hover:scale-105 transition-all shrink-0">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider leading-normal flex items-center gap-1.5">
                  <span>Pixels e Rastreamento</span>
                  <span className="text-[8px] font-black text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1 rounded uppercase">Meta</span>
                </h3>
                <p className="text-[10px] text-zinc-550 leading-relaxed">Meta Pixel, Google Analytics. <span className="text-[#e13a40] font-bold group-hover:underline">Ver em Integrações →</span></p>
              </div>
            </div>

            {/* Card 4: Marca / Branding */}
            <div 
              onClick={() => alert("Marca / Branding customizável.")}
              className="p-5 rounded-xl border border-[#1f1f23] bg-[#0c0c0e] hover:border-zinc-800 cursor-pointer transition-all flex items-start gap-4 group"
            >
              <div className="h-11 w-11 rounded-lg bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center text-[#e13a40] group-hover:scale-105 transition-all shrink-0">
                <Palette className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider leading-normal">Marca / Branding</h3>
                <p className="text-[10px] text-zinc-550 leading-relaxed">Oculte o badge de powered by dgflow, e personalize com sua marca própria corporativa.</p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* DUMMY INFO TABS */}
      {['bio-link', 'forms'].includes(activeTab) && (
        <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
          <CardContent className="p-8 text-center space-y-3">
            <Sliders className="h-8 w-8 text-[#e13a40] mx-auto animate-pulse" />
            <h3 className="text-sm font-bold capitalize">Módulo de {activeTab.replace('-', ' ')} em Desenvolvimento</h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto leading-relaxed">
              Esta aba está sendo estruturada para integrar com sua automação de agendamentos e estatísticas avançadas do WhatsApp.
            </p>
          </CardContent>
        </Card>
      )}

      {/* MODAL: NOVO ITEM DO PORTFÓLIO (HIGH FIDELITY SCREENSHOT 4) */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-6 shadow-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsNewItemModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-lg"
            >
              ×
            </button>

            <h2 className="text-base font-bold text-white mb-1">Novo Item do Portfólio</h2>
            <p className="text-zinc-500 text-xs mb-6">Crie um card de projeto rico em detalhes visuais e links externos.</p>

            <form onSubmit={handleSaveProject} className="space-y-4">
              
              {/* Image upload simulator */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold flex items-center justify-between">
                  <span>Imagem Principal *</span>
                  <span className="text-[10px] text-zinc-600 font-mono font-normal">1200x900px (4:3)</span>
                </label>
                
                <div 
                  onClick={() => {
                    const url = prompt("Insira a URL de uma imagem para o portfólio:", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop");
                    if (url) setProjImageUrl(url);
                  }}
                  className="border border-dashed border-[#1f1f23] rounded-xl p-6 bg-zinc-950/40 hover:bg-zinc-950/70 hover:border-zinc-800 transition-all text-center cursor-pointer space-y-2 flex flex-col items-center"
                >
                  {projImageUrl ? (
                    <div className="relative w-full aspect-video rounded overflow-hidden">
                      <img src={projImageUrl} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setProjImageUrl(''); }} 
                        className="absolute top-2 right-2 bg-black/70 text-white font-bold p-1 rounded text-[9px] hover:bg-red-500"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6 text-zinc-600" />
                      <div>
                        <span className="text-xs text-zinc-300 font-semibold block">Clique para fazer upload</span>
                        <span className="text-[9px] text-zinc-500 block">PNG, JPG até 5MB (auto-convertido para WebP)</span>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-[9px] text-zinc-500 leading-normal mt-1">
                  Usada como capa quando não há vídeo, ou como thumbnail antes do vídeo carregar.
                </p>
              </div>

              {/* Video URL */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">URL do Vídeo (YouTube, Vimeo ou Panda Video)</label>
                <Input
                  value={projVideoUrl}
                  onChange={(e) => setProjVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/... ou Panda"
                  className="bg-[#101014] border-zinc-800 text-white text-xs"
                />
                <p className="text-[9px] text-zinc-500 leading-normal">
                  Cole o link do vídeo. Se preenchido, o card exibirá o player ao abrir.
                </p>
              </div>

              {/* Title & Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Título do Projeto *</label>
                  <Input
                    required
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="Ex: Identidade Visual Premium"
                    className="bg-[#101014] border-zinc-800 text-white text-xs"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Categoria</label>
                  <Input
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    placeholder="Ex: Branding"
                    className="bg-[#101014] border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              {/* External Link */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Link Externo</label>
                <Input
                  value={projExternalLink}
                  onChange={(e) => setProjExternalLink(e.target.value)}
                  placeholder="https://behance.net/..."
                  className="bg-[#101014] border-zinc-800 text-white text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Descrição</label>
                <textarea
                  rows="3"
                  value={projDescription}
                  onChange={(e) => setProjDescription(e.target.value)}
                  placeholder="Descreva o projeto, cliente e principais entregas..."
                  className="w-full bg-[#101014] text-xs border border-zinc-800 rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40] min-h-[60px]"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-[#1f1f23] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold"
                >
                  Salvar Projeto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NOVO TIPO DE REUNIÃO (HIGH FIDELITY SCREENSHOT 2) --- */}
      {isNewMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-6 shadow-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsNewMeetingModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-lg"
            >
              ×
            </button>

            <h2 className="text-base font-bold text-white mb-1">Novo Tipo de Reunião</h2>
            <p className="text-zinc-500 text-xs mb-6">Crie e configure uma nova grade de agendamento em vídeo.</p>

            <form onSubmit={handleSaveMeetingType} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Nome *</label>
                <Input 
                  required
                  value={meetName}
                  onChange={(e) => setMeetName(e.target.value)}
                  placeholder="Reunião de 30 minutos"
                  className="bg-[#101014] border-zinc-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Slug *</label>
                <Input 
                  required
                  value={meetSlug}
                  onChange={(e) => setMeetSlug(e.target.value)}
                  placeholder="reuniao-30"
                  className="bg-[#101014] border-zinc-800 text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Duração (minutos)</label>
                <select 
                  value={meetDuration}
                  onChange={(e) => setMeetDuration(e.target.value)}
                  className="w-full bg-[#101014] text-xs border border-zinc-800 p-2.5 rounded-lg text-zinc-300 outline-none focus:border-[#e13a40] font-semibold"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Descrição</label>
                <textarea 
                  rows="3"
                  value={meetDesc}
                  onChange={(e) => setMeetDesc(e.target.value)}
                  placeholder="Uma breve descrição deste tipo de reunião..."
                  className="w-full bg-[#101014] text-xs border border-zinc-800 rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40]"
                />
              </div>

              {/* Color Circular selectors (Screenshot 2) */}
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-semibold">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {circularColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setMeetColor(color)}
                      className="h-6 w-6 rounded-full border-2 cursor-pointer transition-all hover:scale-110"
                      style={{ 
                        backgroundColor: color,
                        borderColor: meetColor === color ? '#ffffff' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#1f1f23] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold"
                >
                  Salvar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
