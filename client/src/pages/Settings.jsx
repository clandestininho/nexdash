import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Trash2, 
  Plus, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  Tags,
  User,
  Sliders,
  Link2,
  Lock,
  Compass,
  CreditCard,
  Bell,
  Smartphone,
  Share2,
  Settings as SettingsIcon,
  Upload,
  Bot,
  Zap,
  Layers,
  HelpCircle,
  Activity,
  Folder,
  ArrowRight,
  Globe,
  SlidersHorizontal,
  Workflow,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Calendar,
  Pencil,
  Palette,
  RotateCcw,
  CheckCircle2,
  Rocket,
  PlusCircle,
  Minus,
  Video,
  FileText,
  MessageCircle,
  GripVertical,
  Mail,
  Compass as CompassIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { apiFetch, apiUpload } from '../lib/api';
import { compressImage } from '../lib/imageCompressor';

const TABS = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'aparencia', label: 'Aparência', icon: Compass },
  { id: 'atualizacoes', label: 'Atualizações', icon: Activity },
  { id: 'assinatura', label: 'Assinatura', icon: CreditCard },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'automacoes', label: 'Automações', icon: Sliders },
  { id: 'integracoes', label: 'Integrações', icon: Share2 },
  { id: 'conteudos', label: 'Conteúdos', icon: Folder }
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('perfil');

  // PERFIL Tab states
  const [nome, setNome] = useState('Gleison');
  const [empresa, setEmpresa] = useState('Nexfy');
  const [telefone, setTelefone] = useState('+55 (18) 99705-3072');
  const [cnpjCpf, setCnpjCpf] = useState('000.000.000-00');
  const [endereco, setEndereco] = useState('Endereço');
  const [numero, setNumero] = useState('123');
  const [bairro, setBairro] = useState('Bairro');
  const [cidade, setCidade] = useState('Cidade');
  const [estado, setEstado] = useState('Estado');
  const [cep, setCep] = useState('CEP / Código Postal');
  const [pais, setPais] = useState('BR');
  const [moeda, setMoeda] = useState('BRL');
  const [idioma, setIdioma] = useState('pt-BR');
  const [email, setEmail] = useState('gleisonsax@gmail.com');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Payment integration states
  const [asaasKey, setAsaasKey] = useState('');
  const [mercadopagoKey, setMercadopagoKey] = useState('');
  const [stripeKey, setStripeKey] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // SECURITY (Segurança Card inside Perfil) states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // APARÊNCIA Tab states
  const [faviconUrl, setFaviconUrl] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('padrao'); // padrao, midnight, amoled, etc.

  // Portal customize states
  const [portalBrandName, setPortalBrandName] = useState('Nexfy');
  const [portalButtonColor, setPortalButtonColor] = useState('#7c3aed');
  const [portalTextColor, setPortalTextColor] = useState('#ffffff');
  const [portalBgColor, setPortalBgColor] = useState('#1a1a2e');
  const [portalToggles, setPortalToggles] = useState({
    criarTarefas: false,
    editarTarefas: false,
    mostrarRelatorio: false,
    permitirSolicitacoes: false
  });

  // MOBILE Tab states
  const [selectedMobileItems, setSelectedMobileItems] = useState([
    'dashboard', 'pipelines', 'financeiro', 'orcamentos'
  ]);

  // NOTIFICAÇÕES Tab states
  const [pushNotificationsActive, setPushNotificationsActive] = useState(false);
  const [dailySummaryActive, setDailySummaryActive] = useState(false);
  const [notifToggles, setNotifToggles] = useState({
    conteudoAtribuido: true,
    mudancaStatus: true,
    feedbackComentario: true,
    tarefaAtribuida: true,
    comentariosTarefas: true
  });

  // AUTOMACÕES (Automações de Tarefas) states
  const [automacoesActiveTab, setAutomacoesActiveTab] = useState('projetos'); // projetos, tarefas, notificacoes, whatsapp, recorrentes, atalhos
  const [automacoesProjetos, setAutomacoesProjetos] = useState({
    colunasPadrao: 'always_move', // always_move, ask_before
    colunasPersonalizadas: 'ask_before',
    concluirAoConcluirTodas: false,
    reabrirAoReverter: false
  });

  // Status feedback
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'success' | 'error'

  const [currentUser, setCurrentUser] = useState(null);
  const [isTestLoading, setIsTestLoading] = useState(false);

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

  // CONTEÚDOS Tab states
  const [linearWorkflow, setLinearWorkflow] = useState(false);
  const [requireInternalReview, setRequireInternalReview] = useState(false);
  
  // Default stages matching Screenshot 1
  const [stages, setStages] = useState([
    { id: '1', name: 'Planejamento', icon: 'ClipboardList', color: '#3b82f6', trigger: 'Rascunho', role: '-- sem função --', sla: '24' },
    { id: '2', name: 'Copy', icon: 'Pencil', color: '#06b6d4', trigger: 'Rascunho', role: '-- sem função --', sla: '48' },
    { id: '3', name: 'Design', icon: 'Palette', color: '#a855f7', trigger: 'Rascunho', role: '-- sem função --', sla: '48' },
    { id: '4', name: 'Aprovação', icon: 'Eye', color: '#f97316', trigger: 'Aguardando aprovação cliente', role: '-- sem função --', sla: '72' },
    { id: '5', name: 'Revisão', icon: 'RotateCcw', color: '#e13a40', trigger: 'Revisão (auto ao pedir revisão)', role: '-- sem função --', sla: '24', isRevisao: true },
    { id: '6', name: 'Aprovado', icon: 'CheckCircle2', color: '#10b981', trigger: 'Aprovado (auto ao aprovar)', role: '-- sem função --', sla: '0', isAprovado: true },
    { id: '7', name: 'Publicação', icon: 'Rocket', color: '#06b6d4', trigger: 'Publicado', role: '-- sem função --', sla: '24' }
  ]);

  // Stage roles/functions
  const [customRoles, setCustomRoles] = useState([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleIcon, setNewRoleIcon] = useState('Sparkles');
  const [newRoleColor, setNewRoleColor] = useState('#a855f7');

  // Custom Content Types
  const [contentTypes, setContentTypes] = useState([
    { id: 'ct-1', name: 'Feed (post)', fields: '0 campo(s) - social', icon: 'FileText', color: '#a855f7' },
    { id: 'ct-2', name: 'Reels', fields: '0 campo(s) - social', icon: 'Video', color: '#ec4899' },
    { id: 'ct-3', name: 'Stories', fields: '0 campo(s) - social', icon: 'Compass', color: '#eab308' },
    { id: 'ct-4', name: 'Carrossel', fields: '0 campo(s) - social', icon: 'Layers', color: '#06b6d4' },
    { id: 'ct-5', name: 'Artigo / Blog', fields: '0 campo(s) - text', icon: 'FileText', color: '#10b981' },
    { id: 'ct-6', name: 'Branding', fields: '0 campo(s) - design', icon: 'Palette', color: '#e13a40' },
    { id: 'ct-7', name: 'Apresentação', fields: '0 campo(s) - design', icon: 'Layers', color: '#3b82f6' },
    { id: 'ct-8', name: 'Foto', fields: '0 campo(s) - design', icon: 'Eye', color: '#06b6d4' },
    { id: 'ct-9', name: 'Landing page', fields: '0 campo(s) - design', icon: 'Globe', color: '#84cc16' },
    { id: 'ct-10', name: 'E-mail marketing', fields: '0 campo(s) - text', icon: 'Mail', color: '#a855f7' }
  ]);

  // Load all settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRes = await apiFetch('/api/settings');
        const settings = await settingsRes.json();

        if (settings.profile_nome) setNome(settings.profile_nome);
        if (settings.profile_empresa) setEmpresa(settings.profile_empresa);
        if (settings.profile_telefone) setTelefone(settings.profile_telefone);
        if (settings.profile_cnpj_cpf) setCnpjCpf(settings.profile_cnpj_cpf);
        if (settings.profile_endereco) setEndereco(settings.profile_endereco);
        if (settings.profile_numero) setNumero(settings.profile_numero);
        if (settings.profile_bairro) setBairro(settings.profile_bairro);
        if (settings.profile_cidade) setCidade(settings.profile_cidade);
        if (settings.profile_estado) setEstado(settings.profile_estado);
        if (settings.profile_cep) setCep(settings.profile_cep);
        if (settings.profile_pais) setPais(settings.profile_pais);
        if (settings.profile_moeda) setMoeda(settings.profile_moeda);
        if (settings.profile_idioma) setIdioma(settings.profile_idioma);
        if (settings.profile_email) setEmail(settings.profile_email);
        if (settings.profile_avatar) setAvatarPreview(settings.profile_avatar);
        if (settings.asaas_api_key) setAsaasKey(settings.asaas_api_key);
        if (settings.mercadopago_api_key) setMercadopagoKey(settings.mercadopago_api_key);
        if (settings.stripe_api_key) setStripeKey(settings.stripe_api_key);
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      }
    };

    fetchSettings();
  }, []);

  // Save Settings
  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const body = {
        profile_nome: nome,
        profile_empresa: empresa,
        profile_telefone: telefone,
        profile_cnpj_cpf: cnpjCpf,
        profile_endereco: endereco,
        profile_numero: numero,
        profile_bairro: bairro,
        profile_cidade: cidade,
        profile_estado: estado,
        profile_cep: cep,
        profile_pais: pais,
        profile_moeda: moeda,
        profile_idioma: idioma,
        profile_email: email,
        profile_avatar: avatarPreview || '',
        asaas_api_key: asaasKey,
        mercadopago_api_key: mercadopagoKey,
        stripe_api_key: stripeKey,
      };

      await apiFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setSaveStatus('success');
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSaveStatus('saving');
        // Compress image to 400x400 for profile avatar at 80% quality
        const compressedBlob = await compressImage(file, 400, 400, 0.8);
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        
        // Upload to server
        const res = await apiUpload('/api/settings/upload', compressedFile);
        const data = await res.json();
        if (data.success && data.url) {
          setAvatarPreview(data.url);
          setSaveStatus('success');
        } else {
          throw new Error('Falha no upload do arquivo.');
        }
      } catch (err) {
        console.error('[Settings] Error uploading avatar:', err);
        alert('Erro ao fazer upload da imagem: ' + err.message);
        setSaveStatus('error');
      }
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  const handleToggleMobileItem = (id) => {
    setSelectedMobileItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 text-zinc-100">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-[#e13a40]" />
            Configurações
          </h1>
          <p className="text-sm text-zinc-400 font-body mt-1">
            Personalize sua experiência no DGFlow
          </p>
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e13a40] text-white font-bold text-xs hover:bg-[#c52f34] transition-all shadow-lg shadow-[#e13a40]/15 disabled:opacity-50"
        >
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : saveStatus === 'success' ? (
            <>
              <Check className="h-4 w-4" />
              <span>Salvo!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Salvar Alterações</span>
            </>
          )}
        </button>
      </div>

      {/* Horizontal Tabs Navigation (Screenshot 1) */}
      <div className="flex items-center gap-1 border-b border-[#1f1f23] overflow-x-auto pb-1.5 scrollbar-none">
        {TABS.map((tab) => {
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
      <div className="mt-4 transition-all">
        
        {/* PANEL: PERFIL (Screenshot 1 of settings) */}
        {activeTab === 'perfil' && (
          <div className="space-y-6">
            
            {/* Top Row: Info cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Avatar & Basic Prefs */}
              <div className="space-y-6">
                <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
                  <CardContent className="pt-6 text-center space-y-4">
                    <span className="text-[10px] text-zinc-500 font-semibold tracking-wider block text-left">FOTO DE PERFIL</span>
                    <div className="relative mx-auto h-24 w-24 rounded-full overflow-hidden border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-[#e13a40]">{nome.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-center">
                      <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 text-xs font-semibold cursor-pointer transition-all">
                        <span>Fazer Upload</span>
                        <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                      </label>
                    </div>
                    <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
                      PNG, JPG até 5MB. Você poderá ajustar o recorte, rotação e cor de fundo (PNG).
                    </p>
                  </CardContent>
                </Card>

                {/* Idioma Select */}
                <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
                  <CardContent className="pt-6 space-y-4">
                    <span className="text-[10px] text-zinc-500 font-semibold tracking-wider block">IDIOMA</span>
                    <div className="space-y-1">
                      <select
                        value={idioma}
                        onChange={(e) => setIdioma(e.target.value)}
                        className="w-full bg-zinc-950 text-white text-xs rounded-lg border border-zinc-900 p-2.5 focus:border-[#e13a40] outline-none font-semibold"
                      >
                        <option value="pt-BR">Português 🇧🇷</option>
                        <option value="en-US">English 🇺🇸</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center & Right Column: Details forms */}
              <div className="lg:col-span-2">
                <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-[#e13a40]" />
                      <div>
                        <h3 className="text-sm font-bold text-white">Perfil</h3>
                        <p className="text-[10px] text-zinc-500 font-body">Informações pessoais e profissionais</p>
                      </div>
                    </div>

                    {/* Email display box */}
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#e13a40]/10 flex items-center justify-center text-[#e13a40]">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-semibold tracking-wide">EMAIL DA CONTA</span>
                        <strong className="text-xs text-zinc-300 font-mono mt-0.5">{email}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Nome Completo *</label>
                        <Input
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          placeholder="Nome"
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Nome da Empresa</label>
                        <Input
                          value={empresa}
                          onChange={(e) => setEmpresa(e.target.value)}
                          placeholder="Empresa"
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Telefone *</label>
                        <Input
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          placeholder="+55 (00) 00000-0000"
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">CPF/CNPJ *</label>
                        <Input
                          value={cnpjCpf}
                          onChange={(e) => setCnpjCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Endereço *</label>
                        <Input
                          value={endereco}
                          onChange={(e) => setEndereco(e.target.value)}
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Número *</label>
                        <Input
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Bairro</label>
                        <Input
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Cidade *</label>
                        <Input
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">Estado *</label>
                        <Input
                          value={estado}
                          onChange={(e) => setEstado(e.target.value)}
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-semibold uppercase">CEP *</label>
                        <Input
                          value={cep}
                          onChange={(e) => setCep(e.target.value)}
                          className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase">Pais *</label>
                      <Input
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                      />
                    </div>

                    {/* Moeda Section */}
                    <div className="h-px bg-zinc-900 my-4" />
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-[#e13a40]" />
                        <div>
                          <h3 className="text-sm font-bold">Moeda</h3>
                          <p className="text-[10px] text-zinc-500 font-body">Moeda padrão para exibição de valores no sistema</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <select
                          value={moeda}
                          onChange={(e) => setMoeda(e.target.value)}
                          className="w-full bg-zinc-950 text-white text-xs rounded-lg border border-zinc-900 p-2.5 focus:border-[#e13a40] outline-none font-semibold"
                        >
                          <option value="BRL">R$ BRL - Real Brasileiro</option>
                          <option value="USD">$ USD - Dólar Americano</option>
                        </select>
                        <p className="text-[10px] text-zinc-500 font-body flex items-center gap-1.5">
                          <span>💡 Moeda detectada automaticamente pelo pais selecionado</span>
                        </p>
                      </div>
                    </div>

                    {/* Buttons row */}
                    <div className="pt-4 flex gap-3 border-t border-zinc-900">
                      <button
                        onClick={handleSave}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-white text-xs font-bold transition-all text-center"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => alert("Tour reiniciado!")}
                        className="py-2.5 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold transition-all text-center"
                      >
                        Reiniciar Tour
                      </button>
                    </div>

                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Meus Links Card (Screenshot 1 & 6 style) */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-[#e13a40]" />
                  <div>
                    <h3 className="text-sm font-bold">Meus Links</h3>
                    <p className="text-[10px] text-zinc-500 font-body">Altere os slugs das suas páginas públicas</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
                    <span>Portfólio /p/</span>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                      <button onClick={() => alert('Copiado!')} className="p-1 hover:text-white"><Link2 className="h-3 w-3" /></button>
                      <button onClick={() => window.open('/proposal/nexfy')} className="p-1 hover:text-white"><Compass className="h-3 w-3" /></button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="bg-zinc-950 text-zinc-500 text-xs px-3 py-2 rounded-l-lg border border-r-0 border-zinc-900 font-mono select-none">
                      dgflow.com.br/p/
                    </span>
                    <input
                      type="text"
                      value="nexfy"
                      disabled
                      className="bg-zinc-950 text-zinc-300 text-xs px-3 py-2 rounded-r-lg border border-zinc-900 outline-none flex-1 font-mono font-bold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segurança Change Password Card */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#e13a40]" />
                  <div>
                    <h3 className="text-sm font-bold">Segurança</h3>
                    <p className="text-[10px] text-zinc-500 font-body">Proteção da sua conta</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Alterar Senha</span>
                  <p className="text-[10px] text-zinc-500 font-body">Digite sua senha atual e a nova senha para alterá-la.</p>
                  
                  <div className="space-y-3 max-w-xl">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase">Senha atual</label>
                      <Input
                        type="password"
                        placeholder="Senha atual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase">Nova senha</label>
                      <Input
                        type="password"
                        placeholder="Nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 font-semibold uppercase">Confirmar nova senha</label>
                      <Input
                        type="password"
                        placeholder="Confirmar nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                      />
                    </div>
                    <button
                      onClick={() => alert('Senha alterada!')}
                      className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold transition-all text-center"
                    >
                      Atualizar Senha
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* PANEL: APARÊNCIA (Screenshot 7 grid) */}
        {activeTab === 'aparencia' && (
          <div className="space-y-6">
            
            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              
              {/* Option 1: Aparência do Sistema */}
              <button
                onClick={() => setShowThemeModal(true)}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-[#e13a40]/50 text-left transition-all hover:bg-zinc-950/20 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e13a40] transition-colors">Aparência do Sistema</h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Tema, cores e tipografia da plataforma</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              {/* Option 2: Portal do Cliente */}
              <button
                onClick={() => setShowPortalModal(true)}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-[#e13a40]/50 text-left transition-all hover:bg-zinc-950/20 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e13a40] transition-colors">Portal do Cliente</h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Logo, cores, login e mensagens do portal</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              {/* Option 3: Briefings */}
              <button
                onClick={() => alert('Configurações de briefings abertas...')}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-[#e13a40]/50 text-left transition-all hover:bg-zinc-950/20 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#e13a40]/10 flex items-center justify-center text-[#e13a40]">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e13a40] transition-colors">Briefings</h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Tema, cores e logo da página pública de briefing</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              {/* Option 4: Orçamentos / Checkout */}
              <button
                onClick={() => alert('Orçamentos customizer aberto...')}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-[#e13a40]/50 text-left transition-all hover:bg-zinc-950/20 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e13a40] transition-colors">Orçamentos / Checkout</h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Cores, banner e textos da página de aprovação</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              {/* Option 5: Página Pública (Portfólio) */}
              <button
                onClick={() => alert('Página pública customizer aberto...')}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-[#e13a40]/50 text-left transition-all hover:bg-zinc-950/20 group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e13a40] transition-colors">Página Pública (Portfólio)</h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Estilo, blocos e SEO do portfólio</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              {/* Option 6: Link da Bio (Highlighted in red card style) */}
              <button
                onClick={() => alert('Link da Bio customizer aberto...')}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#e13a40]/5 border border-[#e13a40] text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#e13a40]/15 flex items-center justify-center text-[#e13a40]">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e13a40] transition-colors">Link da Bio</h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Tema, SEO e branding da bio</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#e13a40] group-hover:text-white transition-colors" />
              </button>

              {/* Option 7: Página de Agendamento */}
              <button
                onClick={() => alert('Agendamento settings abertas...')}
                className="flex items-center justify-between p-5 rounded-2xl bg-[#0c0c0e] border border-[#1f1f23] hover:border-[#e13a40]/50 text-left transition-all hover:bg-zinc-950/20 group md:col-span-2"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#e13a40] transition-colors">Página de Agendamento</h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Marca, horários e mensagens da página de agendamento</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

            </div>

            {/* Favicon Global Card (Screenshot 7 style) */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#e13a40]" />
                  <div>
                    <h3 className="text-sm font-bold">Favicon Global</h3>
                    <p className="text-[10px] text-zinc-500 font-body">
                      Ícone exibido na aba do navegador em páginas públicas (orçamentos, contratos, briefings, checkout, agendamento, portais). Recomendado: imagem quadrada 64x64px.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">URL OU UPLOAD</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://... ou faça upload"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      className="bg-zinc-950 text-white text-xs px-3 py-2 rounded-xl border border-zinc-900 outline-none flex-1"
                    />
                    <button
                      onClick={() => alert('Fazendo upload...')}
                      className="py-2.5 px-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meus Links copy */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-[#e13a40]" />
                  <div>
                    <h3 className="text-sm font-bold">Meus Links</h3>
                    <p className="text-[10px] text-zinc-500 font-body">Altere os slugs das suas páginas públicas</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
                    <span>Portfólio /p/</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-zinc-950 text-zinc-500 text-xs px-3 py-2 rounded-l-lg border border-zinc-900 font-mono">
                      dgflow.com.br/p/
                    </span>
                    <input
                      type="text"
                      value="nexfy"
                      disabled
                      className="bg-zinc-950 text-zinc-300 text-xs px-3 py-2 rounded-r-lg border border-zinc-900 outline-none flex-1 font-mono font-bold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* PANEL: ATUALIZAÇÕES */}
        {activeTab === 'atualizacoes' && (
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#e13a40]" />
                <div>
                  <h3 className="text-sm font-bold">Registro de Atualizações</h3>
                  <p className="text-[10px] text-zinc-500 font-body">Changelog oficial da plataforma DGFlow</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { ver: 'v2.4.0', date: 'Hoje', desc: 'Lançamento do visual premium dark-mode, com painéis unificados de WhatsApp, fluxos de automações de tarefas, atalhos de bio, e customizações completas de portal cliente.' },
                  { ver: 'v2.3.5', date: 'Há 3 dias', desc: 'Melhorias de desempenho no motor de IA Google Gemini, com maior precisão e menor latência na interpretação de mensagens do WhatsApp.' },
                  { ver: 'v2.3.0', date: 'Há 1 semana', desc: 'Implementação de geração automática de propostas baseadas em SQLite e assinaturas interativas eletrônicas direct-copy link.' }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white bg-[#e13a40]/10 px-2 py-0.5 rounded border border-[#e13a40]/20 font-mono">{item.ver}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{item.date}</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-body leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PANEL: ASSINATURA */}
        {activeTab === 'assinatura' && (
          <div className="space-y-6 text-left">
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#e13a40]/10 flex items-center justify-center text-[#e13a40] border border-[#e13a40]/20">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Faturamento & Assinatura</h3>
                    <p className="text-[10px] text-zinc-500 font-body">Gerencie seus planos de pagamento e simulações de trial</p>
                  </div>
                </div>

                {/* Plan status display */}
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Plano Atual</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-base font-extrabold text-white">
                        {currentUser?.plan === 'next' ? '🚀 Plano NEXT (Completo)' : 
                         currentUser?.plan === 'pro' ? '⭐ Plano Pro' : 
                         currentUser?.plan === 'basico' ? '💼 Plano Básico' : 
                         '⏳ Período de Testes (7 Dias)'}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-1 md:border-l md:border-zinc-900 md:pl-6">
                    <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Status do Período de Teste</span>
                    <span className="text-xs text-zinc-350 font-medium font-mono">
                      {(() => {
                        if (currentUser?.plan !== 'trial') return 'Ativo e Liberado via Assinatura';
                        const trialEndsAt = currentUser?.trial_ends_at 
                          ? new Date(currentUser.trial_ends_at.replace(' ', 'T'))
                          : new Date(new Date(currentUser?.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
                        const now = new Date();
                        if (now > trialEndsAt) {
                          return '❌ Expirado - Funcionalidades Bloqueadas';
                        }
                        const diffMs = trialEndsAt.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                        return `✅ Ativo - Restam ${diffDays} dias (${trialEndsAt.toLocaleDateString('pt-BR')})`;
                      })()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-start">
                  <button
                    onClick={() => window.dispatchEvent(new Event('open_pricing_modal'))}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold text-xs shadow-lg shadow-[#e13a40]/20 transition-all cursor-pointer"
                  >
                    <span>Alterar Plano de Assinatura</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* SaaS Developer Simulation Sandbox */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-[#e13a40]" />
              <CardContent className="pt-6 space-y-6">
                
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <SlidersHorizontal className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-orange-500">⚙️ Console de Teste SaaS</h4>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Ferramentas de simulação local para homologação jurídica de cobranças e bloqueios</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-zinc-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Expirar test button */}
                    <div className="p-4 rounded-xl bg-red-950/15 border border-red-900/30 space-y-3">
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-red-400">Simular Expiração de Teste</h5>
                        <p className="text-[9px] text-zinc-550 leading-relaxed">
                          Altera a data de expiração do trial para 8 dias atrás, forçando o bloqueio imediato do CRM (cadeados nas páginas).
                        </p>
                      </div>
                      <button
                        disabled={isTestLoading}
                        onClick={async () => {
                          setIsTestLoading(true);
                          try {
                            const token = localStorage.getItem('token');
                            
                            // Reset plan to trial first
                            await apiFetch('/api/auth/subscribe', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ plan: 'trial' })
                            });

                            // Manipulate date to past
                            const res = await apiFetch('/api/auth/testing/manipulate-trial', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ days: -8 })
                            });
                            
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);

                            localStorage.setItem('user', JSON.stringify(data.user));
                            window.dispatchEvent(new Event('user_plan_updated'));
                            alert("Sucesso! Período de testes expirado localmente. Todas as páginas restritas foram trancadas com cadeados.");
                          } catch (e) {
                            alert("Erro ao expirar teste: " + e.message);
                          } finally {
                            setIsTestLoading(false);
                          }
                        }}
                        className="py-2 px-3 w-full rounded-lg bg-red-900 hover:bg-red-800 text-white text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer shadow"
                      >
                        {isTestLoading ? 'Processando...' : 'Forçar Expiração (-8 Dias)'}
                      </button>
                    </div>

                    {/* Renovar test button */}
                    <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-900/30 space-y-3">
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-emerald-400">Renovar / Resetar Teste Grátis</h5>
                        <p className="text-[9px] text-zinc-550 leading-relaxed">
                          Reseta o seu plano para "Trial" e estende a expiração para +7 dias a partir de hoje, destravando o sistema inteiro.
                        </p>
                      </div>
                      <button
                        disabled={isTestLoading}
                        onClick={async () => {
                          setIsTestLoading(true);
                          try {
                            const token = localStorage.getItem('token');
                            
                            await apiFetch('/api/auth/subscribe', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ plan: 'trial' })
                            });

                            const res = await apiFetch('/api/auth/testing/manipulate-trial', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ days: 7 })
                            });

                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);

                            localStorage.setItem('user', JSON.stringify(data.user));
                            window.dispatchEvent(new Event('user_plan_updated'));
                            alert("Sucesso! Período de testes renovado por mais 7 dias. CRM totalmente desbloqueado.");
                          } catch (e) {
                            alert("Erro ao renovar teste: " + e.message);
                          } finally {
                            setIsTestLoading(false);
                          }
                        }}
                        className="py-2 px-3 w-full rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer shadow"
                      >
                        {isTestLoading ? 'Processando...' : 'Renovar Teste (+7 Dias)'}
                      </button>
                    </div>

                  </div>

                  {/* Immediate Switcher Dropdown */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11.5px] font-bold text-white block">Alterar Plano Instantaneamente</span>
                      <span className="text-[9px] text-zinc-550 font-body">Mude a assinatura ativa do usuário atual no banco de dados SQLite</span>
                    </div>
                    
                    <select
                      value={currentUser?.plan || 'trial'}
                      onChange={async (e) => {
                        const targetPlan = e.target.value;
                        setIsTestLoading(true);
                        try {
                          const token = localStorage.getItem('token');
                          const res = await apiFetch('/api/auth/subscribe', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ plan: targetPlan })
                          });
                          
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error);

                          localStorage.setItem('user', JSON.stringify(data.user));
                          window.dispatchEvent(new Event('user_plan_updated'));
                          alert(`Plano alterado para ${targetPlan === 'basico' ? 'Plano Básico' : targetPlan === 'pro' ? 'Plano Pro' : targetPlan === 'next' ? 'Plano NEXT' : 'Período de Testes'} com sucesso!`);
                        } catch (err) {
                          alert(`Erro ao mudar plano: ${err.message}`);
                        } finally {
                          setIsTestLoading(false);
                        }
                      }}
                      disabled={isTestLoading}
                      className="bg-zinc-900 text-white text-xs rounded-lg border border-zinc-800 p-2 font-bold outline-none cursor-pointer focus:border-orange-500 h-9"
                    >
                      <option value="trial">Período de Testes (Trial)</option>
                      <option value="basico">Plano Básico</option>
                      <option value="pro">Plano Pro</option>
                      <option value="next">Plano NEXT (Completo)</option>
                    </select>
                  </div>

                </div>

              </CardContent>
            </Card>
          </div>
        )}

        {/* PANEL: MOBILE (Screenshot 2 of new items!) */}
        {activeTab === 'mobile' && (
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardContent className="pt-6 space-y-6">
              
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-[#e13a40]/10 flex items-center justify-center text-[#e13a40] border border-[#e13a40]/20">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Menu Mobile Flutuante</h3>
                  <p className="text-[10px] text-zinc-500 font-body">Escolha até 4 atalhos para aparecer no menu inferior do mobile</p>
                </div>
              </div>

              {/* Selection Status */}
              <div className="space-y-4 pt-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  Atalhos selecionados ({selectedMobileItems.length}/4)
                </span>
                
                {/* 11 layout selector cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: Compass },
                    { id: 'clientes', label: 'Clientes', icon: User },
                    { id: 'pipelines', label: 'Pipelines', icon: Layers },
                    { id: 'tarefas', label: 'Tarefas', icon: SlidersHorizontal },
                    { id: 'agenda', label: 'Agenda', icon: Sliders },
                    { id: 'kanban', label: 'Kanban de Projetos', icon: User },
                    { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
                    { id: 'servicos', label: 'Serviços', icon: SlidersHorizontal },
                    { id: 'orcamentos', label: 'Orçamentos', icon: CreditCard },
                    { id: 'paginas', label: 'Páginas', icon: Globe },
                    { id: 'configuracoes', label: 'Configurações', icon: SettingsIcon }
                  ].map((item) => {
                    const isSelected = selectedMobileItems.includes(item.id);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggleMobileItem(item.id)}
                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 min-h-[90px] ${
                          isSelected
                            ? 'border-[#e13a40] bg-[#e13a40]/5 text-[#e13a40] shadow-[0_0_15px_rgba(255,72,61,0.1)]'
                            : 'border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warning box */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 text-[10px] font-body leading-relaxed">
                💡 <strong className="text-zinc-300">Aviso:</strong> Selecione as páginas que você mais acessa para ter acesso rápido no mobile. O menu aparecerá fixo na parte inferior da tela.
              </div>

              {/* Save */}
              <div className="pt-2">
                <button
                  onClick={() => alert('Mobile menu configurado!')}
                  className="w-full py-3 px-6 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-lg shadow-[#e13a40]/15 text-center"
                >
                  Salvar
                </button>
              </div>

            </CardContent>
          </Card>
        )}

        {/* PANEL: NOTIFICAÇÕES (Screenshot 3 of new items!) */}
        {activeTab === 'notificacoes' && (
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardContent className="pt-6 space-y-6">
              
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Resumo Diário</h3>
                  <p className="text-[10px] text-zinc-500 font-body">Receba um resumo diário com tarefas pendentes e faturamento do dia</p>
                </div>
              </div>

              {/* Push disabled warning card */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Notificações push desativadas</h4>
                    <p className="text-[10px] text-zinc-500 font-body mt-0.5">Ative para receber notificações push</p>
                  </div>
                </div>
                <button
                  onClick={() => setPushNotificationsActive(true)}
                  className="px-4 py-1.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white transition-all shadow-sm"
                >
                  Ativar
                </button>
              </div>

              {/* Main toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-900">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Ativar resumo diário</h4>
                  <p className="text-[10px] text-zinc-500 font-body">Receba um resumo com tarefas para hoje e quanto faturou</p>
                </div>
                <button
                  onClick={() => setDailySummaryActive(!dailySummaryActive)}
                  className={`w-10 h-5 rounded-full transition-all relative ${
                    dailySummaryActive ? 'bg-[#e13a40]' : 'bg-zinc-800'
                  }`}
                >
                  <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                    dailySummaryActive ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {/* Notification types toggles list */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Tipos de notificação</span>
                <p className="text-[10px] text-zinc-500 font-body">Escolha quais eventos disparam notificações para você.</p>
                
                <div className="space-y-2">
                  {[
                    { id: 'conteudoAtribuido', label: 'Conteúdo atribuído a mim', desc: 'Quando alguém te define como responsável por um conteúdo.' },
                    { id: 'mudancaStatus', label: 'Mudança de status em meus conteúdos', desc: 'Avanço de etapa, aprovação, agendamento, publicação.' },
                    { id: 'feedbackComentario', label: 'Feedback/comentário em meus conteúdos', desc: 'Cliente solicitou revisão ou comentou.' },
                    { id: 'tarefaAtribuida', label: 'Tarefa atribuída a mim', desc: 'Quando você é responsável por uma nova tarefa.' },
                    { id: 'comentariosTarefas', label: 'Comentários em minhas tarefas', desc: 'Alguém comentou em uma tarefa sua.' }
                  ].map((notif) => {
                    const isVal = notifToggles[notif.id];
                    return (
                      <div key={notif.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-white">{notif.label}</h5>
                          <p className="text-[10px] text-zinc-500 font-body">{notif.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifToggles((prev) => ({ ...prev, [notif.id]: !isVal }))}
                          className={`w-10 h-5 rounded-full transition-all relative ${
                            isVal ? 'bg-[#e13a40]' : 'bg-zinc-800'
                          }`}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                            isVal ? 'right-0.5' : 'left-0.5'
                          }`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* What you receive card */}
              <div className="p-4 rounded-xl border border-[#e13a40]/20 bg-[#e13a40]/5 text-xs font-body space-y-2.5">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider block">O que você receberá:</span>
                <div className="space-y-1.5 text-zinc-400 text-xs">
                  <p>📋 Quantidade de tarefas pendentes para o dia</p>
                  <p>💰 Quanto faturou no dia anterior</p>
                  <p>📊 Resumo rápido de leads e orçamentos</p>
                </div>
              </div>

              {/* Save btn */}
              <div className="pt-2">
                <button
                  onClick={() => alert('Notificações salvas!')}
                  className="w-full py-3 px-6 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-lg shadow-[#e13a40]/15 text-center"
                >
                  Salvar Configurações
                </button>
              </div>

            </CardContent>
          </Card>
        )}

        {/* PANEL: AUTOMACÕES (Screenshot 4 of new items!) */}
        {activeTab === 'automacoes' && (
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardContent className="pt-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Automações de Tarefas</h3>
                    <p className="text-[10px] text-zinc-500 font-body">Personalize movimentos, notificações, WhatsApp e atalhos</p>
                  </div>
                </div>
                
                <button
                  onClick={() => alert('Restaurado para os padrões')}
                  className="py-1.5 px-3 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
                >
                  Restaurar padrões
                </button>
              </div>

              {/* Split layout: Submenus left vs Forms right */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                
                {/* Left column list */}
                <div className="space-y-1">
                  {[
                    { id: 'projetos', label: 'Projetos', badge: null },
                    { id: 'tarefas', label: 'Tarefas', badge: null },
                    { id: 'notificacoes', label: 'Notificações', badge: null },
                    { id: 'whatsapp', label: 'WhatsApp', badge: 'Novo' },
                    { id: 'recorrentes', label: 'Recorrentes', badge: null },
                    { id: 'atalhos', label: 'Atalhos', badge: null }
                  ].map((subTab) => {
                    const isActive = automacoesActiveTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => setAutomacoesActiveTab(subTab.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-zinc-950 text-white font-bold'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <span>{subTab.label}</span>
                        {subTab.badge && (
                          <span className="text-[9px] font-bold text-white bg-[#e13a40] px-1.5 py-0.2 rounded font-mono">
                            {subTab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right forms column (Automações de Projetos panel) */}
                <div className="md:col-span-3 space-y-6">
                  
                  {automacoesActiveTab === 'projetos' ? (
                    <div className="space-y-5 p-5 rounded-2xl bg-zinc-950/40 border border-zinc-900">
                      
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#e13a40]/10 flex items-center justify-center text-[#e13a40]">
                          <Folder className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">Movimento automático de projetos</h4>
                          <p className="text-[9px] text-zinc-500 font-body">Quando uma tarefa muda de coluna, o projeto pode acompanhar</p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-2">
                        {/* Dropdown 1 */}
                        <div className="flex justify-between items-center gap-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Colunas padrão</span>
                            <span className="text-[10px] text-zinc-500 font-body">Comportamento ao mover tarefas em projetos com colunas padrão</span>
                          </div>
                          <select
                            value={automacoesProjetos.colunasPadrao}
                            onChange={(e) => setAutomacoesProjetos({ ...automacoesProjetos, colunasPadrao: e.target.value })}
                            className="bg-zinc-950 text-white text-xs rounded-lg border border-zinc-800 p-2 font-semibold outline-none focus:border-[#e13a40]"
                          >
                            <option value="always_move">Sempre mover</option>
                            <option value="ask_before">Perguntar antes</option>
                          </select>
                        </div>

                        {/* Dropdown 2 */}
                        <div className="flex justify-between items-center gap-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Colunas personalizadas</span>
                            <span className="text-[10px] text-zinc-500 font-body">Quando o projeto tem colunas customizadas</span>
                          </div>
                          <select
                            value={automacoesProjetos.colunasPersonalizadas}
                            onChange={(e) => setAutomacoesProjetos({ ...automacoesProjetos, colunasPersonalizadas: e.target.value })}
                            className="bg-zinc-950 text-white text-xs rounded-lg border border-zinc-800 p-2 font-semibold outline-none focus:border-[#e13a40]"
                          >
                            <option value="always_move">Sempre mover</option>
                            <option value="ask_before">Perguntar antes</option>
                          </select>
                        </div>

                        {/* Toggle 1 */}
                        <div className="flex items-center justify-between py-2 border-t border-zinc-900">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Concluir projeto ao concluir todas as tarefas</span>
                            <span className="text-[10px] text-zinc-500 font-body">Marca o projeto como concluído quando a última tarefa for finalizada</span>
                          </div>
                          <button
                            onClick={() => setAutomacoesProjetos({ ...automacoesProjetos, concluirAoConcluirTodas: !automacoesProjetos.concluirAoConcluirTodas })}
                            className={`w-10 h-5 rounded-full transition-all relative ${
                              automacoesProjetos.concluirAoConcluirTodas ? 'bg-[#e13a40]' : 'bg-zinc-850'
                            }`}
                          >
                            <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                              automacoesProjetos.concluirAoConcluirTodas ? 'right-0.5' : 'left-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Toggle 2 */}
                        <div className="flex items-center justify-between py-2 border-t border-zinc-900">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-white block">Reabrir projeto ao reverter tarefa</span>
                            <span className="text-[10px] text-zinc-500 font-body">Se uma tarefa voltar de uma coluna concluída, o projeto reabre</span>
                          </div>
                          <button
                            onClick={() => setAutomacoesProjetos({ ...automacoesProjetos, reabrirAoReverter: !automacoesProjetos.reabrirAoReverter })}
                            className={`w-10 h-5 rounded-full transition-all relative ${
                              automacoesProjetos.reabrirAoReverter ? 'bg-[#e13a40]' : 'bg-zinc-850'
                            }`}
                          >
                            <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                              automacoesProjetos.reabrirAoReverter ? 'right-0.5' : 'left-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Dropdown 3 collapsible placeholder */}
                        <div className="py-2.5 border-t border-zinc-900 flex justify-between items-center text-xs font-bold text-zinc-400 cursor-pointer hover:text-white transition-all">
                          <span>Mapeamento avançado: coluna → status do projeto</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-zinc-500 font-body bg-zinc-950/20 border border-dashed border-zinc-900 rounded-2xl">
                      Módulo de {automacoesActiveTab} configurado automaticamente.
                    </div>
                  )}

                </div>

              </div>

            </CardContent>
          </Card>
        )}

        {/* PANEL: INTEGRAÇÕES (Screenshot 5 of new items!) */}
        {activeTab === 'integracoes' && (
          <div className="space-y-6">
            
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-6">
                
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-[#e13a40]" />
                  <span>Integrações</span>
                </h3>

                {/* 15 large integration cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { id: 'gcal', label: 'Google Calendar', icon: Calendar, connected: false },
                    { id: 'asaas', label: 'Asaas', icon: CreditCard, connected: !!asaasKey },
                    { id: 'abacate', label: 'AbacatePay', icon: CreditCard, connected: false, emBreve: true },
                    { id: 'mercado', label: 'Mercado Pago', icon: CreditCard, connected: !!mercadopagoKey },
                    { id: 'inter', label: 'Banco Inter', icon: CreditCard, connected: false, emBreve: true },
                    { id: 'meta', label: 'Meta Pixel', icon: Globe, connected: false, emBreve: true },
                    { id: 'webhooks', label: 'Webhooks', icon: Workflow, connected: true },
                    { id: 'agenda', label: 'Agendamento', icon: Sliders, connected: true },
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, connected: false },
                    { id: 'stripe', label: 'Stripe', icon: CreditCard, connected: !!stripeKey },
                    { id: 'gdrive', label: 'Google Drive', icon: Folder, connected: false },
                    { id: 'figma', label: 'Figma', icon: Compass, connected: false, emBreve: true },
                    { id: 'slack', label: 'Slack', icon: MessageCircle, connected: false, emBreve: true },
                    { id: 'zapier', label: 'Zapier', icon: SlidersHorizontal, connected: false, emBreve: true },
                    { id: 'behance', label: 'Behance', icon: Compass, connected: false, emBreve: true }
                  ].map((app) => {
                    const Icon = app.icon;
                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          if (app.id === 'asaas' || app.id === 'mercado' || app.id === 'stripe') {
                            setSelectedIntegration(app.id);
                          }
                        }}
                        className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 relative min-h-[105px] cursor-pointer ${
                          app.connected
                            ? 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400'
                            : 'border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {/* Connected green outline check */}
                        {app.connected && (
                          <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center p-0.5 animate-pulse-soft">
                            <Check className="h-2 w-2" />
                          </span>
                        )}

                        {/* Em breve badge */}
                        {app.emBreve && (
                          <span className="absolute top-1 right-1 text-[7px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded font-mono select-none">
                            Em breve
                          </span>
                        )}

                        <Icon className="h-5 w-5" />
                        <span className="text-[9px] font-semibold tracking-tight leading-none">{app.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Suggestion banner at the bottom */}
                <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950/40 text-center space-y-4">
                  <h4 className="text-xs font-bold text-white">Não encontrou a integração que precisa?</h4>
                  <p className="text-[10px] text-zinc-500 font-body">Envie sua sugestão e nossa equipe avaliará para futuras versões.</p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => alert('Sugestão enviada!')}
                      className="py-1.5 px-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
                    >
                      Sugerir Integração
                    </button>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Modal de Integração de Pagamento */}
            {selectedIntegration && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
                <div className="bg-[#0c0c0e] border border-[#1f1f23] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
                  <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#e13a40]" />
                      Configurar {selectedIntegration === 'asaas' ? 'Asaas' : selectedIntegration === 'mercado' ? 'Mercado Pago' : 'Stripe'}
                    </h4>
                    <button
                      onClick={() => setSelectedIntegration(null)}
                      className="text-zinc-500 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-xl space-y-2 select-text">
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-body">
                        {selectedIntegration === 'asaas' && 'Asaas é uma das principais plataformas de cobrança do Brasil. Insira seu Token de API de produção para habilitar cobranças via PIX reais.'}
                        {selectedIntegration === 'mercado' && 'Mercado Pago permite receber pagamentos de forma instantânea via PIX e cartão. Insira seu Access Token de produção.'}
                        {selectedIntegration === 'stripe' && 'Stripe é a maior plataforma de pagamentos do mundo, excelente para cartões de crédito. Insira sua Secret Key (sk_live_...).'}
                      </p>
                    </div>

                    {/* API Key / Token input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        {selectedIntegration === 'asaas' ? 'Chave / Token de Acesso Asaas' : selectedIntegration === 'mercado' ? 'Access Token Mercado Pago' : 'Secret Key Stripe'}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={
                            selectedIntegration === 'asaas' 
                              ? asaasKey 
                              : selectedIntegration === 'mercado' 
                                ? mercadopagoKey 
                                : stripeKey
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (selectedIntegration === 'asaas') setAsaasKey(val);
                            else if (selectedIntegration === 'mercado') setMercadopagoKey(val);
                            else if (selectedIntegration === 'stripe') setStripeKey(val);
                          }}
                          placeholder={selectedIntegration === 'stripe' ? 'sk_live_...' : 'Insira o token de API da sua conta'}
                          className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-10 font-mono transition-all pr-10"
                        />
                      </div>
                    </div>

                    {/* Webhook Configuration Guide */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                        URL de Webhook (Configure no seu Painel)
                      </label>
                      <p className="text-[9px] text-zinc-550 font-body leading-snug">
                        Copie esta URL e cole na área de webhooks do seu gateway para notificar o NEXDASH em tempo real quando receber pagamentos.
                      </p>
                      <div className="flex gap-2 items-center select-text">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}/api/payments/webhook/${currentUser?.id || '1'}`}
                          className="flex-1 bg-[#101014]/55 border border-zinc-900 text-[10px] rounded-lg p-2.5 text-zinc-400 outline-none font-mono h-9 select-all"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/api/payments/webhook/${currentUser?.id || '1'}`);
                            alert('URL copiada para a área de transferência!');
                          }}
                          className="px-3 h-9 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all shrink-0 select-none"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-950/40 border-t border-zinc-900 flex justify-between gap-3">
                    <button
                      onClick={() => {
                        if (selectedIntegration === 'asaas') setAsaasKey('');
                        else if (selectedIntegration === 'mercado') setMercadopagoKey('');
                        else if (selectedIntegration === 'stripe') setStripeKey('');
                        setSelectedIntegration(null);
                        setTimeout(() => handleSave(), 100);
                      }}
                      className="px-4 py-2 border border-zinc-900 hover:border-red-500/20 bg-zinc-950 text-red-400 hover:bg-red-500/5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Remover
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedIntegration(null)}
                        className="px-4 py-2 border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIntegration(null);
                          setTimeout(() => handleSave(), 100);
                        }}
                        className="px-5 py-2 bg-[#e13a40] hover:bg-[#c92f35] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-[#e13a40]/10"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* PANEL: CONTEÚDOS */}
        {activeTab === 'conteudos' && (
          <div className="space-y-6">
            
            {/* Card 1: Fluxo de Produção de Conteúdos */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Workflow className="h-5 w-5 text-[#e13a40]" />
                      <span>Fluxo de Produção de Conteúdos</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-1">
                      Defina as etapas pelas quais cada conteúdo passa. É <strong className="text-zinc-300">obrigatório</strong> marcar uma etapa como <span className="text-emerald-400 font-semibold">Aprovado</span> e outra como <span className="text-rose-400 font-semibold">Revisão</span> — elas são acionadas automaticamente pelo portal do cliente. Você pode renomeá-las à vontade.
                    </p>
                    <a href="#tempos" className="text-[9px] text-[#e13a40] hover:underline font-semibold block mt-1">Ver tempos por etapa →</a>
                  </div>
                  
                  <button
                    onClick={() => {
                      const newId = (stages.length + 1).toString();
                      setStages([...stages, { id: newId, name: 'Nova Etapa', icon: 'Sparkles', color: '#a855f7', trigger: 'Rascunho', role: '-- sem função --', sla: '24' }]);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-white hover:bg-zinc-800 transition-all shrink-0 self-start sm:self-center"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Novo fluxo</span>
                  </button>
                </div>

                {/* Workflow options */}
                <div className="space-y-4 pt-2 border-t border-zinc-900">
                  
                  {/* Option 1 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={linearWorkflow}
                      onChange={(e) => setLinearWorkflow(e.target.checked)}
                      className="mt-1 accent-[#e13a40] h-4 w-4 bg-zinc-950 border border-zinc-800 rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">Workflow linear (travar etapas)</span>
                      <span className="text-[10px] text-zinc-500 font-body mt-0.5 leading-normal">
                        Quando ativo, cada etapa precisa ser concluída (botão "Concluir etapa") antes de avançar. O responsável pela próxima etapa pode pedir desbloqueio.
                      </span>
                    </div>
                  </label>

                  {/* Option 2 */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={requireInternalReview}
                      onChange={(e) => setRequireInternalReview(e.target.checked)}
                      className="mt-1 accent-[#e13a40] h-4 w-4 bg-zinc-950 border border-zinc-800 rounded"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white group-hover:text-zinc-200 transition-colors">Exigir revisão interna antes da aprovação do cliente</span>
                      <span className="text-[10px] text-zinc-500 font-body mt-0.5 leading-normal">
                        Quando ativa, uma etapa "Revisão Interna" é inserida automaticamente antes de "Aprovação". Um membro da equipe (com a função "Revisor interno" ou atribuído à etapa) confere o conteúdo antes de enviá-lo ao portal do cliente. Pode ser sobrescrito por conteúdo.
                      </span>
                    </div>
                  </label>

                </div>

                {/* Alert banner green */}
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Etapas de Aprovado e Revisão definidas — o portal do cliente moverá os cards automaticamente.</span>
                </div>

                {/* Preview steps dot line */}
                <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 space-y-4">
                  <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase block">Pré-visualização</span>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 py-2 relative">
                    {/* Connecting line */}
                    <div className="absolute top-8 left-6 right-6 h-0.5 bg-zinc-900 z-0 hidden sm:block" />
                    
                    {stages.map((stg, index) => {
                      const colors = {
                        '#3b82f6': 'bg-blue-500 text-blue-500',
                        '#06b6d4': 'bg-cyan-500 text-cyan-500',
                        '#a855f7': 'bg-purple-500 text-purple-500',
                        '#f97316': 'bg-orange-500 text-orange-500',
                        '#e13a40': 'bg-[#e13a40] text-[#e13a40]',
                        '#10b981': 'bg-emerald-500 text-emerald-500'
                      };
                      const colorClass = colors[stg.color] || 'bg-zinc-700 text-zinc-400';
                      
                      return (
                        <div key={stg.id} className="flex flex-col items-center gap-2 z-10 shrink-0 mx-auto sm:mx-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 border-zinc-900 bg-zinc-950`}>
                            <span style={{ color: stg.color }}>
                              {stg.id}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-300">{stg.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stages List Grid */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Grade de Etapas</span>
                  
                  <div className="space-y-2">
                    {stages.map((stg, i) => (
                      <div key={stg.id} className="flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-900">
                        {/* Grip */}
                        <div className="flex items-center gap-2 shrink-0">
                          <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab active:cursor-grabbing" />
                          <span className="text-[10px] font-mono text-zinc-600 font-bold">#{i + 1}</span>
                        </div>

                        {/* Name input */}
                        <input
                          type="text"
                          value={stg.name}
                          onChange={(e) => {
                            const newStages = [...stages];
                            newStages[i].name = e.target.value;
                            setStages(newStages);
                          }}
                          className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:border-[#e13a40] outline-none flex-1"
                        />

                        {/* Icon Dropdown */}
                        <select
                          value={stg.icon}
                          onChange={(e) => {
                            const newStages = [...stages];
                            newStages[i].icon = e.target.value;
                            setStages(newStages);
                          }}
                          className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#e13a40] font-semibold shrink-0"
                        >
                          <option value="ClipboardList">ClipboardList (Lista)</option>
                          <option value="Pencil">Pencil (Redação)</option>
                          <option value="Palette">Palette (Design)</option>
                          <option value="Eye">Eye (Revisão)</option>
                          <option value="RotateCcw">RotateCcw (Revisão)</option>
                          <option value="CheckCircle2">CheckCircle (Aprovado)</option>
                          <option value="Rocket">Rocket (Lançamento)</option>
                          <option value="Sparkles">Sparkles (Ações)</option>
                        </select>

                        {/* Color Picker dropdown/dots */}
                        <div className="flex items-center gap-1.5 shrink-0 px-2 bg-zinc-900 border border-zinc-800 py-1.5 rounded-lg">
                          {['#3b82f6', '#06b6d4', '#a855f7', '#f97316', '#e13a40', '#10b981'].map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                const newStages = [...stages];
                                newStages[i].color = color;
                                setStages(newStages);
                              }}
                              className={`h-4.5 w-4.5 rounded-full border transition-all ${
                                stg.color === color ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {/* Trigger selection dropdown */}
                        <select
                          value={stg.trigger}
                          onChange={(e) => {
                            const newStages = [...stages];
                            newStages[i].trigger = e.target.value;
                            setStages(newStages);
                          }}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#e13a40] font-semibold flex-1"
                        >
                          <option value="Rascunho">Rascunho</option>
                          <option value="Aguardando aprovação cliente">Aguardando aprovação cliente</option>
                          <option value="Revisão (auto ao pedir revisão)">Revisão (auto ao pedir revisão)</option>
                          <option value="Aprovado (auto ao aprovar)">Aprovado (auto ao aprovar)</option>
                          <option value="Publicado">Publicado</option>
                        </select>

                        {/* Responsible Role Dropdown */}
                        <select
                          value={stg.role}
                          onChange={(e) => {
                            const newStages = [...stages];
                            newStages[i].role = e.target.value;
                            setStages(newStages);
                          }}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#e13a40] font-semibold shrink-0"
                        >
                          <option value="-- sem função --">-- sem função --</option>
                          <option value="Planejamento">Planejamento</option>
                          <option value="Copywriter">Copywriter</option>
                          <option value="Designer">Designer</option>
                          <option value="Revisor">Revisor</option>
                        </select>

                        {/* SLA Input */}
                        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 shrink-0">
                          <input
                            type="number"
                            value={stg.sla}
                            onChange={(e) => {
                              const newStages = [...stages];
                              newStages[i].sla = e.target.value;
                              setStages(newStages);
                            }}
                            className="bg-transparent text-white text-xs font-bold font-mono w-8 outline-none text-center"
                          />
                          <span className="text-[10px] text-zinc-500 font-semibold uppercase select-none">h</span>
                        </div>

                        {/* Delete button (non-deletable for approved & review triggers standard rules) */}
                        <button
                          onClick={() => {
                            if (stg.isRevisao || stg.isAprovado) {
                              alert("Esta etapa é obrigatória para o portal e não pode ser removida.");
                              return;
                            }
                            setStages(stages.filter(s => s.id !== stg.id));
                          }}
                          className={`p-1.5 rounded-lg border border-zinc-800 hover:border-rose-500/30 hover:text-rose-500 text-zinc-500 transition-colors shrink-0`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions row */}
                  <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-900 mt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newId = (stages.length + 1).toString();
                          setStages([...stages, { id: newId, name: 'Nova Etapa', icon: 'Sparkles', color: '#a855f7', trigger: 'Rascunho', role: '-- sem função --', sla: '24' }]);
                        }}
                        className="py-1.5 px-3 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Adicionar etapa</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Deseja redefinir para o fluxo original?")) {
                            setStages([
                              { id: '1', name: 'Planejamento', icon: 'ClipboardList', color: '#3b82f6', trigger: 'Rascunho', role: '-- sem função --', sla: '24' },
                              { id: '2', name: 'Copy', icon: 'Pencil', color: '#06b6d4', trigger: 'Rascunho', role: '-- sem função --', sla: '48' },
                              { id: '3', name: 'Design', icon: 'Palette', color: '#a855f7', trigger: 'Rascunho', role: '-- sem função --', sla: '48' },
                              { id: '4', name: 'Aprovação', icon: 'Eye', color: '#f97316', trigger: 'Aguardando aprovação cliente', role: '-- sem função --', sla: '72' },
                              { id: '5', name: 'Revisão', icon: 'RotateCcw', color: '#e13a40', trigger: 'Revisão (auto ao pedir revisão)', role: '-- sem função --', sla: '24', isRevisao: true },
                              { id: '6', name: 'Aprovado', icon: 'CheckCircle2', color: '#10b981', trigger: 'Aprovado (auto ao aprovar)', role: '-- sem função --', sla: '0', isAprovado: true },
                              { id: '7', name: 'Publicação', icon: 'Rocket', color: '#06b6d4', trigger: 'Publicado', role: '-- sem função --', sla: '24' }
                            ]);
                          }
                        }}
                        className="py-1.5 px-3 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 text-xs font-semibold transition-all"
                      >
                        Restaurar padrão
                      </button>
                    </div>

                    <button
                      onClick={() => alert("Fluxo de Conteúdo Salvo!")}
                      className="py-2 px-5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-md shadow-[#e13a40]/15 transition-all text-center self-end sm:self-center"
                    >
                      Salvar
                    </button>
                  </div>

                </div>

              </CardContent>
            </Card>

            {/* Card 2: Funções de etapa */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-6">
                
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tags className="h-5 w-5 text-[#e13a40]" />
                    <span>Funções de etapa</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-body mt-1">
                    As funções aparecem no seletor "Função responsável" de cada etapa e nas funções por membro. Você pode criar funções personalizadas além das padrão.
                  </p>
                </div>

                {/* Standard non-editable list */}
                <div className="space-y-2.5">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Padrão (não editáveis)</span>
                  
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Planejamento', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                      { name: 'Copy / Redação', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
                      { name: 'Design', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                      { name: 'Video / Edição', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
                      { name: 'Revisor interno', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                      { name: 'Revisão', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                      { name: 'Aprovação', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                      { name: 'Publicação', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' }
                    ].map((role) => (
                      <span key={role.name} className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border flex items-center gap-1 ${role.color}`}>
                        <Check className="h-2.5 w-2.5 shrink-0" />
                        <span>{role.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Custom roles list */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Personalizadas</span>
                  
                  {customRoles.length === 0 ? (
                    <p className="text-[9px] text-zinc-600 font-body italic">Nenhuma função personalizada ainda.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {customRoles.map((role, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold rounded-lg border border-zinc-800 bg-zinc-950 text-white" style={{ borderColor: role.color + '20' }}>
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: role.color }} />
                          <span>{role.name}</span>
                          <button
                            onClick={() => setCustomRoles(customRoles.filter((_, i) => i !== idx))}
                            className="text-zinc-500 hover:text-rose-500 ml-1 font-mono text-[9px]"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add role inline form */}
                <div className="pt-4 border-t border-zinc-900 space-y-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Adicionar nova função</span>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* input */}
                    <input
                      type="text"
                      placeholder="Ex: Tráfego pago"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-white text-xs font-semibold rounded-lg px-3 py-1.5 flex-1 focus:border-[#e13a40] outline-none"
                    />

                    {/* color picker buttons */}
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-lg shrink-0">
                      {['#3b82f6', '#06b6d4', '#a855f7', '#f97316', '#e13a40', '#10b981'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewRoleColor(c)}
                          className={`h-4.5 w-4.5 rounded-full border transition-all ${
                            newRoleColor === c ? 'border-white scale-110' : 'border-transparent opacity-65'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    {/* Add button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRoleName) return;
                        setCustomRoles([...customRoles, { name: newRoleName, color: newRoleColor }]);
                        setNewRoleName('');
                      }}
                      className="py-1.5 px-4 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-md shadow-[#e13a40]/10 transition-all flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Card 3: Tipos de conteúdo */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="pt-6 space-y-6">
                
                {/* Header card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Folder className="h-5 w-5 text-[#e13a40]" />
                      <span>Tipos de conteúdo</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-body mt-1">
                      Defina tipos próprios para outros profissionais (podcast, e-mail, peça gráfica...) com ícone, fluxo e campos do entregável.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const newType = prompt("Digite o nome do novo tipo:");
                      if (newType) {
                        setContentTypes([...contentTypes, {
                          id: 'ct-' + Date.now(),
                          name: newType,
                          fields: '0 campo(s) - custom',
                          icon: 'Sparkles',
                          color: '#3b82f6'
                        }]);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-md shadow-[#e13a40]/15 transition-all shrink-0 self-start sm:self-center"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Novo tipo</span>
                  </button>
                </div>

                {/* System standard badges */}
                <div className="space-y-2.5 pt-2 border-t border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Padrão do Sistema</span>
                  
                  <div className="flex flex-wrap gap-2">
                    {['Feed (post)', 'Reels', 'Stories', 'Carrossel', 'Artigo / Blog', 'Branding', 'Apresentação', 'Foto', 'Landing page', 'E-mail marketing'].map((t) => (
                      <span key={t} className="px-2.5 py-1 text-[9px] font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-2">
                        <span>{t}</span>
                        <span className="text-[8px] font-mono text-zinc-600 bg-zinc-950 border border-zinc-900 px-1 py-0.2 rounded uppercase">padrão</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Custom content grid (10 items) */}
                <div className="space-y-3 pt-2 border-t border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Personalizados</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3">
                    {contentTypes.map((ct) => (
                      <div key={ct.id} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="h-8.5 w-8.5 rounded-lg flex items-center justify-center border border-zinc-900 bg-zinc-900/30" style={{ color: ct.color }}>
                            {ct.icon === 'FileText' ? <FileText className="h-4.5 w-4.5" /> : 
                             ct.icon === 'Video' ? <Video className="h-4.5 w-4.5" /> : 
                             ct.icon === 'Compass' ? <Compass className="h-4.5 w-4.5" /> : 
                             ct.icon === 'Layers' ? <Layers className="h-4.5 w-4.5" /> : 
                             ct.icon === 'Palette' ? <Palette className="h-4.5 w-4.5" /> : 
                             ct.icon === 'Eye' ? <Eye className="h-4.5 w-4.5" /> : 
                             ct.icon === 'Globe' ? <Globe className="h-4.5 w-4.5" /> : 
                             ct.icon === 'Mail' ? <Mail className="h-4.5 w-4.5" /> : 
                             <Sparkles className="h-4.5 w-4.5" />}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">{ct.name}</span>
                            <span className="text-[9px] text-zinc-500 font-mono mt-0.5">{ct.fields}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              const newN = prompt("Novo nome para " + ct.name + ":", ct.name);
                              if (newN) {
                                setContentTypes(contentTypes.map(c => c.id === ct.id ? { ...c, name: newN } : c));
                              }
                            }}
                            className="p-1.5 rounded-lg border border-zinc-900 hover:border-zinc-800 hover:text-[#e13a40] text-zinc-500 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setContentTypes(contentTypes.filter(c => c.id !== ct.id))}
                            className="p-1.5 rounded-lg border border-zinc-900 hover:border-rose-500/30 hover:text-rose-500 text-zinc-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

          </div>
        )}

      </div>

      {/* APARÊNCIA DO SISTEMA MODAL (Screenshot 8 Theme selector style) */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div 
            className="w-full max-w-2xl bg-[#0c0c0e] border border-[#1f1f23] rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button 
              onClick={() => setShowThemeModal(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900/60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#e13a40]" />
                <span>Aparência</span>
              </h2>
              <p className="text-xs text-zinc-500 font-body">
                Personalize as cores do sistema
              </p>
            </div>

            {/* Themes wrapper */}
            <div className="space-y-5 overflow-y-auto max-h-[420px] pr-1.5 scrollbar-thin">
              
              {/* Dark themes row */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">🌙 Temas escuros</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'padrao', label: 'Padrão', desc: 'Escuro com vermelho vibrante', colors: ['#e13a40', '#000000'] },
                    { id: 'midnight', label: 'Midnight', desc: 'Ultra escuro com azul profundo', colors: ['#3b82f6', '#09090b'] },
                    { id: 'amoled', label: 'AMOLED', desc: 'Preto puro com rosa', colors: ['#ec4899', '#000000'] },
                    { id: 'black_blue', label: 'Black & Blue', desc: 'Preto puro com azul elétrico', colors: ['#00d2ff', '#000000'] },
                    { id: 'black_green', label: 'Black & Green', desc: 'Preto puro com verde neon', colors: ['#10b981', '#000000'] },
                    { id: 'black_purple', label: 'Black & Purple', desc: 'Preto puro com roxo vibrante', colors: ['#a855f7', '#000000'] },
                    { id: 'emerald', label: 'Emerald', desc: 'Escuro com verde esmeralda', colors: ['#10b981', '#064e3b'] },
                    { id: 'ocean', label: 'Ocean', desc: 'Escuro com ciano oceano', colors: ['#06b6d4', '#083344'] },
                    { id: 'purple_rain', label: 'Purple Rain', desc: 'Escuro com roxo intenso', colors: ['#8b5cf6', '#000000'] },
                    { id: 'personalizado', label: 'Personalizado', desc: 'Escolha sua cor', colors: ['#e2e8f0', '#0f172a'] }
                  ].map((theme) => {
                    const isSel = selectedTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          isSel
                            ? 'border-[#e13a40] bg-[#e13a40]/5 text-white shadow-[0_0_15px_rgba(255,72,61,0.1)]'
                            : 'border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {/* Selector checkmark */}
                        {isSel && (
                          <span className="absolute top-2 right-2 h-3.5 w-3.5 rounded-full bg-[#e13a40] text-white flex items-center justify-center p-0.5">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.colors[0] }} />
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.colors[1] }} />
                        </div>
                        <h4 className="text-[10px] font-bold text-white leading-none">{theme.label}</h4>
                        <p className="text-[9px] text-zinc-500 font-body mt-1.5 leading-tight">{theme.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Light themes row */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">☀️ Temas claros</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'monocromatico', label: 'Monocromático', desc: 'Preto e branco, claro', colors: ['#ffffff', '#000000'] },
                    { id: 'rosa_claro', label: 'Rosa Claro', desc: 'Claro com rosa vibrante', colors: ['#ec4899', '#ffffff'] },
                    { id: 'azul_claro', label: 'Azul Claro', desc: 'Claro com azul suave', colors: ['#3b82f6', '#ffffff'] }
                  ].map((theme) => {
                    const isSel = selectedTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          isSel
                            ? 'border-[#e13a40] bg-[#e13a40]/5 text-white'
                            : 'border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isSel && (
                          <span className="absolute top-2 right-2 h-3.5 w-3.5 rounded-full bg-[#e13a40] text-white flex items-center justify-center p-0.5">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.colors[0] }} />
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.colors[1] }} />
                        </div>
                        <h4 className="text-[10px] font-bold text-white leading-none">{theme.label}</h4>
                        <p className="text-[9px] text-zinc-500 font-body mt-1.5 leading-tight">{theme.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Cancel and Save */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowThemeModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowThemeModal(false)}
                className="px-4 py-2 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-md shadow-[#e13a40]/10 transition-all"
              >
                Salvar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PORTAL DO CLIENTE CUSTOMIZATION MODAL (Screenshots 9 & 10 style) */}
      {showPortalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div 
            className="w-full max-w-xl bg-[#0c0c0e] border border-[#1f1f23] rounded-2xl overflow-hidden shadow-2xl relative p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button 
              onClick={() => setShowPortalModal(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-900/60"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <User className="h-5 w-5 text-[#e13a40]" />
                <span>Personalizar Portal do Cliente</span>
              </h2>
              <p className="text-xs text-zinc-500 font-body">
                Estas configurações se aplicam a todos os clientes que acessam seu portal de aprovações.
              </p>
            </div>

            {/* Main content wrapper */}
            <div className="space-y-5 overflow-y-auto max-h-[400px] pr-1.5 scrollbar-thin">
              
              {/* Preview card (Screenshot 9) */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
                <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase block">Pré-visualização</span>
                
                <div className="flex justify-between items-center p-3 rounded-lg border border-zinc-900 bg-zinc-900/20">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{portalBrandName}</span>
                    <span className="text-[9px] text-zinc-500 font-body">Portal de Aprovações</span>
                  </div>
                  
                  {/* Styled Entrar button */}
                  <button 
                    style={{ backgroundColor: portalButtonColor, color: portalTextColor }}
                    className="px-3.5 py-1 text-[10px] font-bold rounded-lg transition-all"
                  >
                    Entrar
                  </button>
                </div>
              </div>

              {/* Identidade Visual Form */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">🎨 Identidade Visual</span>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase">Nome da empresa / marca</label>
                  <Input
                    value={portalBrandName}
                    onChange={(e) => setPortalBrandName(e.target.value)}
                    placeholder="Nexfy"
                    className="bg-zinc-950 border-zinc-900 text-white text-xs py-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase block">Logo da empresa</label>
                  <button
                    onClick={() => alert('Fazer upload da logo...')}
                    className="py-2 px-3 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1.5"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Enviar logo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Cor do botão</label>
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded border border-zinc-800" style={{ backgroundColor: portalButtonColor }} />
                      <Input
                        value={portalButtonColor}
                        onChange={(e) => setPortalButtonColor(e.target.value)}
                        className="bg-zinc-950 border-zinc-900 text-white text-xs py-1 flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-semibold uppercase">Cor texto botão</label>
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 rounded border border-zinc-800" style={{ backgroundColor: portalTextColor }} />
                      <Input
                        value={portalTextColor}
                        onChange={(e) => setPortalTextColor(e.target.value)}
                        className="bg-zinc-950 border-zinc-900 text-white text-xs py-1 flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Login background image */}
              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">🖼️ Tela de Login</span>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase block">Imagem de fundo</label>
                  <button
                    onClick={() => alert('Fazer upload do fundo...')}
                    className="py-2 px-3 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1.5"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Enviar imagem</span>
                  </button>
                  <p className="text-[8px] text-zinc-500 font-body">Desktop: 1920x1080px • Mobile: 1080x1920px (a imagem será ajustada automaticamente)</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase">Cor de fundo (caso sem imagem)</label>
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded border border-zinc-800" style={{ backgroundColor: portalBgColor }} />
                    <Input
                      value={portalBgColor}
                      onChange={(e) => setPortalBgColor(e.target.value)}
                      className="bg-zinc-950 border-zinc-900 text-white text-xs py-1 flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Permissões do Cliente toggle list (Screenshot 10) */}
              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">🛡️ Permissões do Cliente</span>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Criar tarefas</h4>
                      <p className="text-[9px] text-zinc-500 font-body">Clientes podem criar novas tarefas</p>
                    </div>
                    <button
                      onClick={() => setPortalToggles((prev) => ({ ...prev, criarTarefas: !prev.criarTarefas }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        portalToggles.criarTarefas ? 'bg-[#e13a40]' : 'bg-zinc-800'
                      }`}
                    >
                      <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                        portalToggles.criarTarefas ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Editar tarefas</h4>
                      <p className="text-[9px] text-zinc-500 font-body">Clientes podem editar tarefas existentes</p>
                    </div>
                    <button
                      onClick={() => setPortalToggles((prev) => ({ ...prev, editarTarefas: !prev.editarTarefas }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        portalToggles.editarTarefas ? 'bg-[#e13a40]' : 'bg-zinc-800'
                      }`}
                    >
                      <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                        portalToggles.editarTarefas ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Solicitações de Serviço (Screenshot 10) */}
              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">📦 Solicitações de Serviço</span>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Mostrar aba "Relatório"</h4>
                      <p className="text-[9px] text-zinc-500 font-body">Exibe relatório mensal dos conteúdos produzidos no portal do cliente.</p>
                    </div>
                    <button
                      onClick={() => setPortalToggles((prev) => ({ ...prev, mostrarRelatorio: !prev.mostrarRelatorio }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        portalToggles.mostrarRelatorio ? 'bg-[#e13a40]' : 'bg-zinc-800'
                      }`}
                    >
                      <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                        portalToggles.mostrarRelatorio ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">Permitir solicitações</h4>
                      <p className="text-[9px] text-zinc-500 font-body">Clientes podem solicitar serviços/orçamentos</p>
                    </div>
                    <button
                      onClick={() => setPortalToggles((prev) => ({ ...prev, permitirSolicitacoes: !prev.permitirSolicitacoes }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        portalToggles.permitirSolicitacoes ? 'bg-[#e13a40]' : 'bg-zinc-800'
                      }`}
                    >
                      <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                        portalToggles.permitirSolicitacoes ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Cancel and Save (Screenshot 10 style) */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-900">
              <button
                onClick={() => alert('Pré-visualização do portal ativada!')}
                className="p-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                title="Pré-visualizar portal"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPortalModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowPortalModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-md shadow-[#e13a40]/10 transition-all"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
