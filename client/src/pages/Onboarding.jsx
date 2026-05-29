import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  Globe, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Rocket, 
  Palette, 
  Search, 
  Plus, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layout as LayoutIcon,
  Link as LinkIcon,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { apiFetch, apiUpload } from '../lib/api';
import { compressImage } from '../lib/imageCompressor';
import logo from '../logo.png';

// Services Presets Database by Niche
const NICHE_PRESETS = {
  designer: {
    name: 'Designer / Diretor de Arte',
    services: [
      { id: 'des-1', title: 'Identidade Visual Completa', price: 3500.00, category: 'Design' },
      { id: 'des-2', title: 'Criação de Logotipo', price: 1500.00, category: 'Design' },
      { id: 'des-3', title: 'Manual de Identidade Visual', price: 1200.00, category: 'Design' },
      { id: 'des-4', title: 'Design de Embalagem', price: 2500.00, category: 'Design' },
      { id: 'des-5', title: 'Apresentação Institucional / Pitch', price: 1800.00, category: 'Design' },
      { id: 'des-6', title: 'Peças para Redes Sociais', price: 800.00, category: 'Design' }
    ]
  },
  social_media: {
    name: 'Social Media',
    services: [
      { id: 'sm-1', title: 'Planejamento de Conteúdo Mensal', price: 1800.00, category: 'Marketing' },
      { id: 'sm-2', title: 'Gestão Completa de Instagram', price: 2500.00, category: 'Marketing' },
      { id: 'sm-3', title: 'Produção de Reels/TikToks', price: 1200.00, category: 'Vídeo' },
      { id: 'sm-4', title: 'Criação de Stories Interativos', price: 600.00, category: 'Marketing' },
      { id: 'sm-5', title: 'Monitoramento e Relatórios', price: 500.00, category: 'Marketing' }
    ]
  },
  videomaker: {
    name: 'Videomaker / Editor de Vídeo',
    services: [
      { id: 'vm-1', title: 'Edição de Vídeo Institucional', price: 2000.00, category: 'Vídeo' },
      { id: 'vm-2', title: 'Captação e Edição de Eventos', price: 3500.00, category: 'Vídeo' },
      { id: 'vm-3', title: 'Edição de Reels / Shorts (Pacote)', price: 1000.00, category: 'Vídeo' },
      { id: 'vm-4', title: 'Vídeo de Vendas (VSL)', price: 1500.00, category: 'Vídeo' },
      { id: 'vm-5', title: 'Motion Graphics / Animação', price: 1800.00, category: 'Vídeo' }
    ]
  },
  gestor_trafego: {
    name: 'Gestor de Tráfego',
    services: [
      { id: 'gt-1', title: 'Configuração Inicial de Contas', price: 800.00, category: 'Marketing' },
      { id: 'gt-2', title: 'Gestão de Campanhas Mensais', price: 1500.00, category: 'Marketing' },
      { id: 'gt-3', title: 'Estruturação de Funil de Tráfego', price: 2500.00, category: 'Marketing' },
      { id: 'gt-4', title: 'Criação e Teste de Criativos', price: 1000.00, category: 'Marketing' },
      { id: 'gt-5', title: 'Auditoria de Contas de Anúncio', price: 600.00, category: 'Marketing' }
    ]
  },
  dev_web: {
    name: 'Desenvolvedor Web / Sites',
    services: [
      { id: 'web-1', title: 'Landing Page', price: 1800.00, category: 'Web' },
      { id: 'web-2', title: 'Site Institucional', price: 3500.00, category: 'Web' },
      { id: 'web-3', title: 'E-commerce', price: 5000.00, category: 'Web' },
      { id: 'web-4', title: 'Blog / Portal', price: 2500.00, category: 'Web' },
      { id: 'web-5', title: 'Manutenção Mensal', price: 500.00, category: 'Web' },
      { id: 'web-6', title: 'Otimização SEO', price: 800.00, category: 'Web' },
      { id: 'web-7', title: 'Integração com APIs', price: 1200.00, category: 'Web' },
      { id: 'web-8', title: 'Hospedagem + Suporte', price: 150.00, category: 'Web' }
    ]
  },
  fotografo: {
    name: 'Fotógrafo',
    services: [
      { id: 'foto-1', title: 'Ensaio Pessoal / Profissional', price: 800.00, category: 'Fotografia' },
      { id: 'foto-2', title: 'Fotografia de Eventos (por hora)', price: 350.00, category: 'Fotografia' },
      { id: 'foto-3', title: 'Fotografia de Produtos', price: 1200.00, category: 'Fotografia' },
      { id: 'foto-4', title: 'Cobertura Fotográfica Corporativa', price: 2000.00, category: 'Fotografia' },
      { id: 'foto-5', title: 'Edição e Tratamento de Imagens', price: 500.00, category: 'Fotografia' }
    ]
  },
  copywriter: {
    name: 'Copywriter / Redator',
    services: [
      { id: 'copy-1', title: 'Redação de Página de Vendas', price: 1500.00, category: 'Redação' },
      { id: 'copy-2', title: 'Sequência de E-mails de Lançamento', price: 1200.00, category: 'Redação' },
      { id: 'copy-3', title: 'Criação de Roteiros para Reels/VSL', price: 800.00, category: 'Redação' },
      { id: 'copy-4', title: 'Post para Blog / Artigos SEO', price: 400.00, category: 'Redação' },
      { id: 'copy-5', title: 'Copys para Anúncios de Tráfego', price: 600.00, category: 'Redação' }
    ]
  },
  agencia: {
    name: 'Agência / Marketing Digital',
    services: [
      { id: 'ag-1', title: 'Lançamento de Infoproduto', price: 8000.00, category: 'Marketing' },
      { id: 'ag-2', title: 'Assessoria de Marketing Mensal', price: 4000.00, category: 'Marketing' },
      { id: 'ag-3', title: 'Desenvolvimento de Funil de Vendas', price: 5000.00, category: 'Marketing' },
      { id: 'ag-4', title: 'Consultoria Estratégica Completa', price: 3000.00, category: 'Marketing' },
      { id: 'ag-5', title: 'Gestão de Marca e CRM', price: 2500.00, category: 'Marketing' }
    ]
  },
  outro: {
    name: 'Outro',
    services: [
      { id: 'ot-1', title: 'Consultoria de Negócios', price: 1500.00, category: 'Consultoria' },
      { id: 'ot-2', title: 'Configuração de Ferramentas CRM', price: 2000.00, category: 'Consultoria' },
      { id: 'ot-3', title: 'Suporte Operacional Remoto', price: 1000.00, category: 'Suporte' },
      { id: 'ot-4', title: 'Serviço Customizado Básico', price: 500.00, category: 'Outro' }
    ]
  }
};

const COLOR_PRESETS = [
  { id: 'rosa_roxo', label: 'Rosa & Roxo', primary: '#d946ef', secondary: '#8b5cf6' },
  { id: 'ciano_azul', label: 'Ciano & Azul', primary: '#06b6d4', secondary: '#3b82f6' },
  { id: 'laranja_amarelo', label: 'Laranja & Amarelo', primary: '#f97316', secondary: '#eab308' },
  { id: 'verde_ciano', label: 'Verde & Ciano', primary: '#10b981', secondary: '#06b6d4' },
  { id: 'roxo_rosa', label: 'Roxo & Rosa', primary: '#8b5cf6', secondary: '#ec4899' },
  { id: 'vermelho_laranja', label: 'Vermelho & Laranja', primary: '#ef4444', secondary: '#f97316' }
];

const SETUP_TIPS = [
  {
    text: "Configure seu perfil corretamente para que o atendente com inteligência artificial se comunique perfeitamente usando o nome da sua marca nas mensagens.",
    author: "Personalização de Perfil",
    role: "Etapa 1"
  },
  {
    text: "Selecione seus principais serviços para sugerirmos links de faturamento e propostas prontas que fecham negócios muito mais rápido.",
    author: "Portfólio de Serviços",
    role: "Etapa 2"
  },
  {
    text: "Defina sua identidade visual e cores customizadas em poucos cliques para ter uma página profissional de captura de leads alinhada com sua marca.",
    author: "Página Profissional",
    role: "Etapa 3"
  }
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState(null);
  const [activeTip, setActiveTip] = useState(0);
  const [uploadingField, setUploadingField] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    profile_pais: 'Brasil',
    profile_moeda: 'BRL',
    profile_nome: '',
    profile_empresa: '',
    profile_telefone: '',
    profile_cep: '',
    profile_cidade: '',
    profile_estado: '',
    profile_bairro: '',
    profile_endereco: '',
    profile_numero: '',
    profile_avatar: '',
    onboarding_nicho: '',
    onboarding_layout: 'classico',
    onboarding_cores: 'ciano_azul',
    onboarding_slug: '',
    onboarding_logo: '',
    onboarding_lead_pipeline: 'Pipeline Principal'
  });

  // Services selection
  const [selectedPresetIds, setSelectedPresetIds] = useState([]);
  const [customServices, setCustomServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Web');

  // Load user name on mount
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.name) {
        setFormData(prev => ({
          ...prev,
          profile_nome: storedUser.name
        }));
      }
    } catch {}
  }, []);

  // Onboarding setup tip slider rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTip(prev => (prev + 1) % SETUP_TIPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Update slug automatically from company name
  useEffect(() => {
    if (formData.profile_empresa && !formData.onboarding_slug) {
      const generatedSlug = formData.profile_empresa
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, onboarding_slug: generatedSlug }));
    }
  }, [formData.profile_empresa]);

  const STEP_PERCENTAGES = {
    1: '0% completo',
    2: '8% completo',
    3: '15% completo',
    4: '23% completo',
    5: '30% completo',
    6: '31% completo',
    7: '38% completo',
    8: '46% completo',
    9: '46% completo',
    10: '46% completo',
    11: '50% completo',
    12: '51% completo',
    13: '60% completo',
    14: '68% completo',
    15: '76% completo',
    16: '100% completo'
  };

  const handleCepSearch = async () => {
    const rawCep = formData.profile_cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      setCepError('CEP inválido. Deve conter 8 dígitos.');
      return;
    }
    setCepLoading(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado.');
      } else {
        setFormData(prev => ({
          ...prev,
          profile_cidade: data.localidade || '',
          profile_estado: data.uf || '',
          profile_bairro: data.bairro || '',
          profile_endereco: data.logradouro || ''
        }));
      }
    } catch (err) {
      setCepError('Erro ao buscar o CEP. Digite manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleLogoUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(field);
    try {
      // Compress the image to 400x400 for branding avatar/logo at 85% quality
      const compressedBlob = await compressImage(file, 400, 400, 0.85);
      const compressedFile = new File([compressedBlob], file.name || 'branding.jpg', {
        type: 'image/jpeg'
      });

      // Upload to server
      const res = await apiUpload('/api/settings/upload', compressedFile);
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({
          ...prev,
          [field]: data.url
        }));
      } else {
        throw new Error(data.error || 'Falha no upload do arquivo.');
      }
    } catch (err) {
      console.error('[Onboarding] Error uploading asset:', err);
      alert('Erro ao fazer upload da imagem: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handlePhoneChange = (val) => {
    setFormData(prev => ({ ...prev, profile_telefone: val }));
  };

  const handleAddCustomService = () => {
    if (!newServiceName) {
      alert('Por favor, informe o nome do serviço.');
      return;
    }
    const price = parseFloat(newServicePrice) || 0;
    const newSrv = {
      id: `custom-${Date.now()}`,
      title: newServiceName,
      price,
      category: newServiceCategory
    };
    setCustomServices(prev => [...prev, newSrv]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleRemoveCustomService = (id) => {
    setCustomServices(prev => prev.filter(s => s.id !== id));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const currentNichePreset = NICHE_PRESETS[formData.onboarding_nicho]?.services || [];
      const selectedPresets = currentNichePreset.filter(s => selectedPresetIds.includes(s.id));
      const allServices = [...selectedPresets, ...customServices];

      const savePayload = {
        profile_nome: formData.profile_nome,
        profile_empresa: formData.profile_empresa,
        profile_telefone: formData.profile_telefone,
        profile_cep: formData.profile_cep,
        profile_cidade: formData.profile_cidade,
        profile_estado: formData.profile_estado,
        profile_bairro: formData.profile_bairro,
        profile_endereco: formData.profile_endereco,
        profile_numero: formData.profile_numero,
        profile_pais: formData.profile_pais,
        profile_moeda: formData.profile_moeda,
        profile_avatar: formData.profile_avatar || formData.onboarding_logo,
        
        onboarding_nicho: formData.onboarding_nicho,
        onboarding_services: JSON.stringify(allServices),
        onboarding_layout: formData.onboarding_layout,
        onboarding_cores: formData.onboarding_cores,
        onboarding_slug: formData.onboarding_slug,
        onboarding_logo: formData.onboarding_logo || formData.profile_avatar,
        onboarding_lead_pipeline: formData.onboarding_lead_pipeline,
        
        onboarding_completed: 'true'
      };

      const res = await apiFetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify(savePayload)
      });

      if (!res.ok) {
        throw new Error('Falha ao salvar as configurações.');
      }

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao salvar seu perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const togglePresetService = (id) => {
    setSelectedPresetIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderProgressTrack = () => {
    const isPhase2 = step >= 6 && step <= 9;
    const isPhase3 = step >= 10;

    return (
      <div className="flex flex-col gap-3 w-full border-b border-zinc-800/80 pb-4 mb-4">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase font-mono">
          <span>Configuração de Perfil</span>
          <span className="text-[#e13a40]">{STEP_PERCENTAGES[step]}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Step 1 */}
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
            step > 5 
              ? 'bg-emerald-500 text-white' 
              : 'bg-[#e13a40] text-white shadow-[0_0_8px_rgba(225,58,64,0.3)]'
          }`}>
            {step > 5 ? <Check className="h-3 w-3" /> : <User className="h-3 w-3" />}
          </div>
          
          <div className={`h-px flex-1 transition-all duration-300 ${step > 5 ? 'bg-emerald-500' : 'bg-zinc-800'}`} />

          {/* Step 2 */}
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
            step > 9 
              ? 'bg-emerald-500 text-white' 
              : isPhase2
                ? 'bg-[#e13a40] text-white shadow-[0_0_8px_rgba(225,58,64,0.3)]'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
          }`}>
            {step > 9 ? <Check className="h-3 w-3" /> : <Briefcase className="h-3 w-3" />}
          </div>
          
          <div className={`h-px flex-1 transition-all duration-300 ${step > 9 ? 'bg-emerald-500' : 'bg-zinc-800'}`} />

          {/* Step 3 */}
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
            isPhase3 
              ? 'bg-[#e13a40] text-white shadow-[0_0_8px_rgba(225,58,64,0.3)]' 
              : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
          }`}>
            <Globe className="h-3 w-3" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f2f2f2] font-body lg:grid lg:grid-cols-2">
      
      {/* Dynamic Brand Logo Watermark */}
      {(formData.profile_avatar || formData.onboarding_logo) && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden animate-fade-in">
          <img 
            src={formData.profile_avatar || formData.onboarding_logo} 
            alt="Brand Watermark" 
            className="w-[45vh] h-[45vh] max-w-[400px] max-h-[400px] object-contain opacity-[0.015] pointer-events-none select-none" 
          />
        </div>
      )}
      
      {/* Left visual column - identical premium branding theme */}
      <div className="relative hidden h-full flex-col justify-between border-r border-[#1f1f1f] bg-gradient-to-br from-[#0c0c0e] via-[#050505] to-[#120a0b] p-12 lg:flex overflow-hidden">
        
        {/* Animated fluid paths flowing dynamically in background */}
        <div className="absolute inset-0 z-0">
          <FloatingPaths position={-1} />
          <FloatingPaths position={1} />
        </div>

        {/* Diagonal high-tech grid overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(225,58,64,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(225,58,64,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40 z-0" />

        {/* Bottom corner branding glow */}
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-[#e13a40]/10 blur-[120px] pointer-events-none" />

        {/* Branding header container */}
        <div className="z-10 flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#e13a40] to-[#ff483d] rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500" />
            <img 
              src={logo} 
              alt="NEXDASH Logo" 
              className="relative h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(225,58,64,0.4)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wider text-white">NEXDASH</span>
            <span className="text-[9px] font-bold tracking-widest text-[#e13a40] uppercase -mt-0.5">CRM INTELIGENTE</span>
          </div>
        </div>

        {/* Setup Tip Rotator */}
        <div className="z-10 mt-auto mb-10 max-w-lg">
          <div className="relative min-h-[160px] flex flex-col justify-end">
            <div className="absolute top-0 left-0 text-[#e13a40] opacity-25">
              <span className="text-7xl font-serif leading-none">&ldquo;</span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTip}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-4 relative z-10 pl-6"
              >
                <p className="text-lg font-medium leading-relaxed text-zinc-150 drop-shadow-sm font-body">
                  {SETUP_TIPS[activeTip].text}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-[#e13a40] to-transparent rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {SETUP_TIPS[activeTip].author}
                    </p>
                    <p className="text-xs text-[#e13a40] font-medium tracking-wide">
                      {SETUP_TIPS[activeTip].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Visual indicators */}
        <div className="z-10 flex gap-2">
          {SETUP_TIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTip(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeTip ? 'w-8 bg-[#e13a40]' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Column: Centered wizard card (identical layout size to login/register) */}
      <div className="relative flex flex-col justify-center items-center px-4 py-12 lg:px-16 min-h-screen overflow-y-auto w-full">
        
        {/* Glow ambient lights behind the card */}
        <div className="absolute inset-0 isolate pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#e13a40]/5 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[#ff483d]/3 blur-[100px]" />
        </div>

        <div className="w-full max-w-[420px] space-y-6 z-10 py-6">
          
          {/* Top Wizard Steps Track */}
          {renderProgressTrack()}

          {/* Form Step Body Content */}
          <div className="space-y-5">
            
            {/* STEP 1: Onde você está? */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">Onde você está? <Sparkles className="size-5 text-[#e13a40]" /></h2>
                  <p className="text-xs text-zinc-450 font-body">Defina a localização padrão e moeda dos seus orçamentos e faturamentos.</p>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">País</label>
                    <select 
                      value={formData.profile_pais} 
                      onChange={e => setFormData({ ...formData, profile_pais: e.target.value })}
                      className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all font-body"
                    >
                      <option value="Brasil">Brasil 🇧🇷</option>
                      <option value="Portugal">Portugal 🇵🇹</option>
                      <option value="Estados Unidos">Estados Unidos 🇺🇸</option>
                      <option value="Outro">Outro 🌐</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Moeda Padrão</label>
                    <select 
                      value={formData.profile_moeda} 
                      onChange={e => setFormData({ ...formData, profile_moeda: e.target.value })}
                      className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all font-body"
                    >
                      <option value="BRL">Real Brasileiro (R$)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dólar Americano ($)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Vamos começar */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Vamos começar!</h2>
                  <p className="text-xs text-zinc-450 font-body">Complete as informações básicas da sua conta.</p>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Seu Nome Completo</label>
                    <input 
                      type="text"
                      value={formData.profile_nome}
                      onChange={e => setFormData({ ...formData, profile_nome: e.target.value })}
                      placeholder="Seu nome completo"
                      className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all font-body"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Nome da sua Empresa</label>
                    <input 
                      type="text"
                      value={formData.profile_empresa}
                      onChange={e => setFormData({ ...formData, profile_empresa: e.target.value })}
                      placeholder="Ex: Cartola Cyber, Studio Criativo"
                      className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all font-body"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">WhatsApp Comercial</label>
                    <input 
                      type="text"
                      value={formData.profile_telefone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      placeholder="Ex: 5511999999999"
                      className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Seu endereço */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Seu Endereço</h2>
                  <p className="text-xs text-zinc-450 font-body">Facilite a geração automática de contratos de prestação de serviços.</p>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">CEP</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={formData.profile_cep}
                        onChange={e => setFormData({ ...formData, profile_cep: e.target.value })}
                        placeholder="00000-000"
                        className="flex-1 bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all font-mono"
                      />
                      <button 
                        type="button"
                        onClick={handleCepSearch}
                        disabled={cepLoading}
                        className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        {cepLoading ? <Loader2 className="h-4 w-4 animate-spin text-[#e13a40]" /> : <Search className="h-4 w-4" />}
                      </button>
                    </div>
                    {cepError && <span className="text-[10px] text-red-500 font-medium">{cepError}</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Rua / Av.</label>
                      <input 
                        type="text"
                        value={formData.profile_endereco}
                        onChange={e => setFormData({ ...formData, profile_endereco: e.target.value })}
                        placeholder="Rua..."
                        className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Nº</label>
                      <input 
                        type="text"
                        value={formData.profile_numero}
                        onChange={e => setFormData({ ...formData, profile_numero: e.target.value })}
                        placeholder="123"
                        className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-2 text-center text-white text-xs outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Bairro</label>
                      <input 
                        type="text"
                        value={formData.profile_bairro}
                        onChange={e => setFormData({ ...formData, profile_bairro: e.target.value })}
                        placeholder="Bairro"
                        className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Cidade/UF</label>
                      <div className="flex gap-1.5">
                        <input 
                          type="text"
                          value={formData.profile_cidade}
                          onChange={e => setFormData({ ...formData, profile_cidade: e.target.value })}
                          placeholder="Cidade"
                          className="flex-1 bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-2 text-white text-xs outline-none transition-all"
                        />
                        <input 
                          type="text"
                          value={formData.profile_estado}
                          onChange={e => setFormData({ ...formData, profile_estado: e.target.value })}
                          placeholder="UF"
                          className="w-10 bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl text-center text-white text-xs outline-none transition-all uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Sua marca */}
            {step === 4 && (
              <div className="space-y-4 text-center">
                <div className="space-y-1 text-left">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Sua marca</h2>
                  <p className="text-xs text-zinc-450 font-body">Faça upload do seu avatar ou logo da empresa.</p>
                </div>
                <div className="flex flex-col items-center justify-center pt-4">
                  <div className="relative group">
                    <div className="h-28 w-28 rounded-full border border-zinc-800 bg-[#0b0b0d] flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-[#e13a40]">
                      {uploadingField === 'profile_avatar' ? (
                        <Loader2 className="h-6 w-6 animate-spin text-[#e13a40]" />
                      ) : formData.profile_avatar ? (
                        <img src={formData.profile_avatar} alt="Logo preview" className="h-full w-full object-cover" />
                      ) : (
                        <Upload className="h-6 w-6 text-zinc-650 transition-colors group-hover:text-zinc-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#e13a40] hover:bg-[#c52f34] text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                      <Plus className="h-4 w-4" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleLogoUpload(e, 'profile_avatar')} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <div className="mt-4 text-zinc-600 text-[10px] font-body">
                    <span>PNG ou JPG de até 5MB. Recomendamos fundo transparente.</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Perfil Configurado Celebration */}
            {step === 5 && (
              <div className="space-y-4 text-center py-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-bounce">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Parabéns! <span className="text-emerald-400">✓</span></h2>
                  <h3 className="text-sm font-bold text-zinc-300">Perfil configurado!</h3>
                  <p className="text-xs text-zinc-500 font-body">Você pode alterar isso depois nas configurações.</p>
                </div>
              </div>
            )}

            {/* STEP 6: Qual o seu nicho? */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Qual é o seu nicho?</h2>
                  <p className="text-xs text-zinc-450 font-body">Selecione sua área de atuação para sugerirmos os melhores serviços.</p>
                </div>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 pt-2">
                  {Object.entries(NICHE_PRESETS).map(([key, niche]) => {
                    const isSelected = formData.onboarding_nicho === key;
                    const nicheIcons = {
                      designer: '🎨', social_media: '📱', videomaker: '🎬',
                      gestor_trafego: '📊', dev_web: '💻', fotografo: '📷',
                      copywriter: '✍️', agencia: '🚀', outro: '⚡'
                    };
                    const subtitle = NICHE_PRESETS[key].services[0].title + ' e mais';
                    return (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, onboarding_nicho: key })}
                        className={`w-full p-3 rounded-xl border text-left transition-all duration-150 flex items-center gap-3 bg-[#0b0b0d]/50 hover:bg-[#0e0e11]/80 ${
                          isSelected 
                            ? 'border-[#e13a40] ring-1 ring-[#e13a40]/30 shadow-[0_0_10px_rgba(225,58,64,0.15)]' 
                            : 'border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xl shrink-0">{nicheIcons[key]}</span>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">{niche.name}</span>
                          <span className="text-[9px] text-zinc-650 block leading-tight font-body">{subtitle}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 7: Serviços sugeridos */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Serviços sugeridos</h2>
                  <p className="text-xs text-zinc-450 font-body">Baseado no seu nicho: <strong className="text-[#e13a40]">{NICHE_PRESETS[formData.onboarding_nicho]?.name || 'Outro'}</strong></p>
                </div>

                <div className="bg-[#e13a40]/5 border border-[#e13a40]/10 rounded-xl p-3 flex gap-2.5 text-left">
                  <Sparkles className="h-4 w-4 text-[#e13a40] shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[10px] text-zinc-450 leading-relaxed font-body">
                    <strong className="text-zinc-200">Não se preocupe!</strong> Você poderá alterar valores e pacotes a qualquer momento.
                  </p>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 pt-1">
                  {(NICHE_PRESETS[formData.onboarding_nicho]?.services || []).map((srv) => {
                    const isSelected = selectedPresetIds.includes(srv.id);
                    return (
                      <button
                        key={srv.id}
                        onClick={() => togglePresetService(srv.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between bg-[#0b0b0d]/50 hover:bg-[#0e0e11]/80 ${
                          isSelected 
                            ? 'border-[#e13a40] ring-1 ring-[#e13a40]/30 shadow-[0_0_10px_rgba(225,58,64,0.15)]' 
                            : 'border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block leading-tight">{srv.title}</span>
                          <span className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold font-mono">{srv.category}</span>
                        </div>
                        <span className="text-xs font-black font-mono text-[#e13a40]">
                          R$ {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-center text-[10px] text-zinc-550 font-mono">
                  <span>{selectedPresetIds.length} serviço(s) selecionado(s)</span>
                </div>
              </div>
            )}

            {/* STEP 8: Adicionar serviços personalizados */}
            {step === 8 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Serviços customizados</h2>
                  <p className="text-xs text-zinc-450 font-body">Crie serviços com seus próprios preços (opcional)</p>
                </div>

                <div className="bg-[#e13a40]/5 border border-[#e13a40]/10 rounded-xl p-3 flex gap-2.5 text-left">
                  <Sparkles className="h-4 w-4 text-[#e13a40] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-450 leading-relaxed font-body">
                    <strong className="text-zinc-200">Pode pular!</strong> Você poderá editar e adicionar serviços a qualquer momento.
                  </p>
                </div>

                <div className="bg-[#0b0b0d] border border-zinc-850 rounded-xl p-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Nome do serviço</label>
                    <input 
                      type="text"
                      value={newServiceName}
                      onChange={e => setNewServiceName(e.target.value)}
                      placeholder="Ex: Landing Page VIP"
                      className="w-full bg-[#050505] text-white border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#e13a40] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Preço (R$)</label>
                      <input 
                        type="number"
                        value={newServicePrice}
                        onChange={e => setNewServicePrice(e.target.value)}
                        placeholder="1500.00"
                        className="w-full bg-[#050505] text-white border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#e13a40] transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Categoria</label>
                      <select
                        value={newServiceCategory}
                        onChange={e => setNewServiceCategory(e.target.value)}
                        className="w-full bg-[#050505] text-white border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#e13a40] transition-all font-body"
                      >
                        <option value="Design">Design</option>
                        <option value="Web">Web</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Vídeo">Vídeo</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="w-full bg-[#e13a40] hover:bg-[#c52f34] text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 h-9"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Serviço
                  </button>
                </div>

                {/* Custom list scrollable */}
                {customServices.length > 0 && (
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {customServices.map((srv) => (
                      <div key={srv.id} className="flex items-center justify-between p-2 rounded-lg border border-zinc-850 bg-[#0b0b0d]/30 text-xs">
                        <div className="space-y-0.5 text-left">
                          <span className="font-semibold text-white block leading-tight">{srv.title}</span>
                          <span className="text-[8px] text-zinc-500 uppercase tracking-wider">{srv.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#e13a40] font-bold">R$ {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <button type="button" onClick={() => handleRemoveCustomService(srv.id)} className="text-zinc-650 hover:text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 9: Serviços Cadastrados Celebration */}
            {step === 9 && (
              <div className="space-y-4 text-center py-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-bounce">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Parabéns! <span className="text-emerald-400">✓</span></h2>
                  <h3 className="text-sm font-bold text-zinc-300">Serviços cadastrados!</h3>
                  <p className="text-xs text-zinc-500 font-body">Você pode alterar isso depois nas configurações.</p>
                </div>
              </div>
            )}

            {/* STEP 10: Splash Aumentar Vendas */}
            {step === 10 && (
              <div className="space-y-4 text-center py-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#e13a40] to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(225,58,64,0.25)] animate-pulse">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Agora vamos aumentar suas vendas! 🚀</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed font-body max-w-sm mx-auto">
                    Vamos configurar sua página profissional para captar mais clientes e fechar mais negócios.
                  </p>
                  <p className="text-[10px] text-zinc-600 font-body">
                    Não se preocupe, você poderá alterar tudo isso depois nas configurações.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 11: Escolha o layout */}
            {step === 11 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Escolha o Layout</h2>
                  <p className="text-xs text-zinc-450 font-body">Selecione o modelo para sua página profissional.</p>
                </div>
                <div className="space-y-3 pt-2">
                  {/* Clássico */}
                  <button
                    onClick={() => setFormData({ ...formData, onboarding_layout: 'classico' })}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-150 bg-[#0b0b0d]/50 hover:bg-[#0e0e11]/80 flex items-center justify-between ${
                      formData.onboarding_layout === 'classico'
                        ? 'border-[#e13a40] ring-1 ring-[#e13a40]/30 shadow-[0_0_10px_rgba(225,58,64,0.15)]'
                        : 'border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[280px]">
                      <span className="text-xs font-bold text-white block">Clássico</span>
                      <p className="text-[10px] text-zinc-500 font-body block leading-tight">Layout tradicional com seções empilhadas verticalmente.</p>
                    </div>
                    <LayoutIcon className="h-5 w-5 text-zinc-650" />
                  </button>

                  {/* Hoverton PRO */}
                  <button
                    onClick={() => setFormData({ ...formData, onboarding_layout: 'hoverton_pro' })}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-150 bg-[#0b0b0d]/50 hover:bg-[#0e0e11]/80 flex items-center justify-between relative overflow-hidden ${
                      formData.onboarding_layout === 'hoverton_pro'
                        ? 'border-[#e13a40] ring-1 ring-[#e13a40]/30 shadow-[0_0_10px_rgba(225,58,64,0.15)]'
                        : 'border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <span className="absolute top-2.5 right-3 bg-[#e13a40] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(255,72,61,0.3)]">
                      PRO
                    </span>
                    <div className="space-y-0.5 max-w-[280px]">
                      <span className="text-xs font-bold text-white block">Hoverton PRO</span>
                      <p className="text-[10px] text-zinc-500 font-body block leading-tight">Layout moderno com animações avançadas e efeitos glow.</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-[#e13a40] animate-pulse shrink-0 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 12: Defina as Cores */}
            {step === 12 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Defina as Cores</h2>
                  <p className="text-xs text-zinc-450 font-body">Escolha uma paleta que represente sua marca comercial.</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-2 max-h-[260px] overflow-y-auto pr-1">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = formData.onboarding_cores === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setFormData({ ...formData, onboarding_cores: preset.id })}
                        className={`p-3 rounded-xl border text-left transition-all bg-[#0b0b0d]/50 hover:bg-[#0e0e11]/80 space-y-2 ${
                          isSelected
                            ? 'border-[#e13a40] ring-1 ring-[#e13a40]/30 shadow-[0_0_10px_rgba(225,58,64,0.15)]'
                            : 'border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-white block leading-none">{preset.label}</span>
                        <div className="flex gap-1.5 pt-0.5">
                          <div className="flex-1 space-y-0.5">
                            <div className="h-4 rounded-md" style={{ backgroundColor: preset.primary }} />
                            <span className="text-[7px] uppercase tracking-wider text-zinc-550 font-bold block text-center">Primária</span>
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="h-4 rounded-md" style={{ backgroundColor: preset.secondary }} />
                            <span className="text-[7px] uppercase tracking-wider text-zinc-550 font-bold block text-center">Secundária</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 13: Configure sua URL */}
            {step === 13 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Configure sua URL</h2>
                  <p className="text-xs text-zinc-450 font-body">Escolha um nome único para seu portfólio. Você pode alterar depois.</p>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Slug do Portfólio</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs text-zinc-650 font-mono">nexdash.com.br/p/</span>
                      <input 
                        type="text"
                        value={formData.onboarding_slug}
                        onChange={e => setFormData({ 
                          ...formData, 
                          onboarding_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                        })}
                        placeholder="cartola-cyber"
                        className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl pl-32 pr-4 text-white text-xs outline-none transition-all font-mono"
                      />
                    </div>
                    <span className="text-[9px] text-zinc-650 block leading-tight font-body pl-0.5">Use apenas letras minúsculas, números e hífens.</span>
                  </div>

                  {formData.onboarding_slug && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex gap-2 items-center text-xs">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-zinc-300 font-body">
                        Sua página será acessível em: <strong className="text-emerald-400 font-mono break-all font-bold">nexdash.com.br/p/{formData.onboarding_slug}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 14: Adicione seu Logo */}
            {step === 14 && (
              <div className="space-y-4 text-center">
                <div className="space-y-1 text-left">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Adicione seu Logo</h2>
                  <p className="text-xs text-zinc-450 font-body">Faça upload da sua marca (opcional). Você pode adicionar isso depois.</p>
                </div>
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="relative group">
                    <div className="h-28 w-28 rounded-xl border border-dashed border-zinc-800 bg-[#0b0b0d]/50 flex flex-col items-center justify-center p-2 text-center overflow-hidden transition-all duration-300 group-hover:border-[#e13a40]">
                      {uploadingField === 'onboarding_logo' ? (
                        <Loader2 className="h-6 w-6 animate-spin text-[#e13a40]" />
                      ) : formData.onboarding_logo || formData.profile_avatar ? (
                        <img src={formData.onboarding_logo || formData.profile_avatar} alt="Portfolio logo" className="h-full w-full object-contain" />
                      ) : (
                        <div className="space-y-0.5 flex flex-col items-center justify-center">
                          <Upload className="h-5 w-5 text-zinc-650 transition-colors group-hover:text-zinc-400" />
                          <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-bold font-mono">200x200</span>
                          <span className="text-[8px] text-zinc-650 font-body leading-none pt-0.5">Clique para upload</span>
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-[#e13a40] hover:bg-[#c52f34] text-white flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                      <Plus className="h-3.5 w-3.5" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => handleLogoUpload(e, 'onboarding_logo')} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="mt-4 space-y-2 max-w-xs text-center">
                    <span className="text-[9px] text-zinc-600 block leading-tight">PNG, JPG até 5MB (auto-convertido para WebP)</span>
                    
                    {/* Tip Badge */}
                    <div className="inline-flex items-center gap-1 bg-yellow-500/5 border border-yellow-500/10 rounded-full px-2.5 py-0.5 text-[8.5px] text-yellow-400 font-semibold font-body">
                      <span>💡</span>
                      <span>Dica: Use imagem com fundo transparente (PNG)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 15: Captura de Leads */}
            {step === 15 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Captura de Leads</h2>
                  <p className="text-xs text-zinc-450 font-body">Escolha para onde enviar os contatos da sua página.</p>
                </div>

                <div className="bg-[#0b0b0d] border border-zinc-850 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] uppercase font-black text-[#e13a40] tracking-wider flex items-center gap-1.5 pl-0.5">
                    <Sparkles className="h-4 w-4 text-[#e13a40] shrink-0" />
                    ✨ Formulário configurado automaticamente!
                  </span>
                  <p className="text-[10px] text-zinc-450 leading-relaxed font-body">
                    Sua página já terá um formulário para capturar leads com nome, e-mail, WhatsApp, serviço de interesse e mensagem.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-450 pl-0.5">Pipeline de destino *</label>
                    <select 
                      value={formData.onboarding_lead_pipeline} 
                      onChange={e => setFormData({ ...formData, onboarding_lead_pipeline: e.target.value })}
                      className="w-full bg-[#0b0b0d] border border-zinc-800 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl px-4 text-white text-xs outline-none transition-all font-body font-semibold"
                    >
                      <option value="Pipeline Principal">Pipeline Principal</option>
                    </select>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex gap-2 items-center text-xs">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300 font-body font-medium">
                      Leads capturados irão para: <strong className="text-emerald-400">{formData.onboarding_lead_pipeline}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 16: Final Celebration */}
            {step === 16 && (
              <div className="space-y-4 text-center py-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-bounce">
                    <span className="text-3xl animate-pulse">🎉</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">Parabéns! 🎉</h2>
                  <h3 className="text-sm font-bold text-zinc-300">Você completou a configuração inicial!</h3>
                  <p className="text-xs text-zinc-450 leading-relaxed font-body max-w-sm mx-auto">
                    Sua página está pronta. Agora vamos te mostrar como usar a plataforma.
                  </p>
                  <p className="text-[10px] text-zinc-650 font-body">
                    Lembre-se: você pode alterar todas essas configurações a qualquer momento.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Navigation Controls at Bottom (matching Login/Register button sizing) */}
          <div className="flex flex-col gap-2 pt-4">
            
            {/* Main Action Button */}
            {step === 16 ? (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="w-full h-11 bg-[#e13a40] hover:bg-[#c52f34] text-white text-sm font-semibold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 shadow-[0_4px_12px_rgba(225,58,64,0.25)] hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Configurando painel...</span>
                  </>
                ) : (
                  <>
                    <span>Ir para o Dashboard</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : step === 5 || step === 9 ? (
              <button
                type="button"
                onClick={nextStep}
                className="w-full h-11 bg-[#e13a40] hover:bg-[#c52f34] text-white text-sm font-semibold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-150 shadow-[0_4px_12px_rgba(225,58,64,0.25)] hover:scale-[1.01]"
              >
                <span>Continuar</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : step === 10 ? (
              <button
                type="button"
                onClick={nextStep}
                className="w-full h-11 bg-[#e13a40] hover:bg-[#c52f34] text-white text-sm font-semibold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-150 shadow-[0_4px_12px_rgba(225,58,64,0.25)] hover:scale-[1.01]"
              >
                <span>Vamos lá!</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : step === 8 ? (
              <button
                type="button"
                onClick={nextStep}
                className="w-full h-11 bg-[#e13a40] hover:bg-[#c52f34] text-white text-sm font-semibold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-150 shadow-[0_4px_12px_rgba(225,58,64,0.25)] hover:scale-[1.01]"
              >
                <span>Próxima Etapa</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (step === 2 && (!formData.profile_nome || !formData.profile_empresa)) {
                    alert('Por favor, informe seu nome e o nome da sua empresa.');
                    return;
                  }
                  if (step === 6 && !formData.onboarding_nicho) {
                    alert('Por favor, selecione seu nicho de atuação para prosseguir.');
                    return;
                  }
                  nextStep();
                }}
                className="w-full h-11 bg-[#e13a40] hover:bg-[#c52f34] text-white text-sm font-semibold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-150 shadow-[0_4px_12px_rgba(225,58,64,0.25)] hover:scale-[1.01]"
              >
                <span>Continuar</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Back Button */}
            {step > 1 && step !== 5 && step !== 9 && step !== 10 && step !== 16 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-full text-zinc-500 hover:text-zinc-350 text-xs font-semibold py-2 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar etapa anterior
              </button>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}

// Background path particle renderer (identical visual to login/register columns)
function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(225,58,64,${0.03 + i * 0.008})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-slate-900/40"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.02}
            initial={{ pathLength: 0.2, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.7, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
