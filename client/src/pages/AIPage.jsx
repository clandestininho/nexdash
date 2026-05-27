import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Sliders, FileText, Palette, Check, AlertCircle, Play, Cpu, ShieldCheck, Plus, Search, Copy, Download, Trash2, Image, X, ChevronUp, ChevronDown, ChevronsUp } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { apiFetch } from '../lib/api';

export default function AIPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('visao-geral');
  const [threshold, setThreshold] = useState(85);
  const [cooldown, setCooldown] = useState(15);
  const [copiedTemplateId, setCopiedTemplateId] = useState(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/analista')) {
      setActiveTab('analista');
    } else if (path.endsWith('/copywriter')) {
      setActiveTab('copywriter');
    } else if (path.endsWith('/designer')) {
      setActiveTab('designer');
    } else {
      setActiveTab('visao-geral');
    }
  }, [location.pathname]);

  // Search & Filters for Instagram Prompts
  const [designerSearch, setDesignerSearch] = useState('');
  const [selectedDesignerCategory, setSelectedDesignerCategory] = useState('Todos');
  
  // Modals and Form States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState('Tecnologia');
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptRefImage, setNewPromptRefImage] = useState('');
  
  // Custom Category States
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  
  // Custom Cropping States (focal vertical alignment Y percentage)
  const [newPromptCropY, setNewPromptCropY] = useState(50);

  // Generation Dynamic States
  const [generatingPromptId, setGeneratingPromptId] = useState(null);
  const [generatedImages, setGeneratedImages] = useState({});
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  // Prompts Database State (Saves to localStorage)
  const [prompts, setPrompts] = useState(() => {
    const stored = localStorage.getItem('dgflow_ai_prompts');
    let loaded = [];
    if (stored) {
      loaded = JSON.parse(stored);
    } else {
      loaded = [
        {
          id: '1',
          title: 'Retrato Corporativo Ultra Profissional',
          category: 'Tecnologia',
          prompt: 'Professional corporate headshot of a dynamic business entrepreneur, confident smile, hyperrealistic, cinematic lighting, 8k, shot on Hasselblad, shallow depth of field, sleek executive suit, minimalist modern design studio background, corporate style.',
          refImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
        },
        {
          id: '2',
          title: 'Equipe Criativa na Mesa de Reunião',
          category: 'Agência',
          prompt: 'Modern creative design agency team brainstorming around a minimalist wooden table, high-tech laptops open showing analytics, bright workspace with large glass windows, green plants, collaborative energetic atmosphere, candid photography, soft daylight.',
          refImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80'
        },
        {
          id: '3',
          title: 'Mockup de App em iPhone Premium',
          category: 'Aplicativos',
          prompt: 'A premium photorealistic mockup of a modern mobile banking application interface on an iPhone resting on a sleek dark slate table next to a warm cup of coffee, clean shadows, cozy morning lighting, professional technology branding visual.',
          refImage: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=300&q=80'
        },
        {
          id: '4',
          title: 'Fotos de Joias de Luxo Conceito',
          category: 'Varejo / Moda',
          prompt: 'An elegant close-up product photo of a minimalist gold ring with a sparkling diamond, resting on a textured raw white marble block, warm golden hour rays casting artistic long shadows, high fashion editorial look, luxury branding.',
          refImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80'
        }
      ];
    }

    // Auto-sanitize spelling variants/typos: 'Produtos', 'Podutos', 'produtos', 'podutos' -> 'Produto'
    let changed = false;
    const sanitized = loaded.map(p => {
      if (p.category === 'Produtos' || p.category === 'Podutos' || p.category === 'produtos' || p.category === 'podutos') {
        changed = true;
        return { ...p, category: 'Produto' };
      }
      return p;
    });

    if (changed) {
      localStorage.setItem('dgflow_ai_prompts', JSON.stringify(sanitized));
    }
    return sanitized;
  });

  const savePrompts = (updatedList) => {
    try {
      setPrompts(updatedList);
      localStorage.setItem('dgflow_ai_prompts', JSON.stringify(updatedList));
    } catch (error) {
      console.error('Failed to save prompts to localStorage:', error);
      alert('Erro: Limite de armazenamento do navegador excedido! Por favor, reduza o tamanho das fotos enviadas ou remova alguns prompts antigos.');
    }
  };

  // Verify Role for "+ Adicionar Prompt" button (defaults to admin)
  const [userRole, setUserRole] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      return stored?.role || 'admin';
    } catch {
      return 'admin';
    }
  });

  // Simulated templates
  const [templates, setTemplates] = useState([
    {
      id: 'apresentacao',
      name: 'Apresentação Comercial & Portfólio',
      category: 'Atração',
      content: 'Olá, {{client_name}}! Sou a assistente virtual do Estúdio NEXDASH. Analisei seu briefing de {{project_type}} e adorei a proposta. \n\nAqui está nosso portfólio completo com projetos similares: nexdash.studio/portfolio\n\nQual o melhor horário para batermos um papo rápido amanhã?',
    },
    {
      id: 'followup',
      name: 'Follow-up de Proposta (Fechamento)',
      category: 'Negociação',
      content: 'Oi, {{client_name}}! Tudo bem?\n\nPassando para saber se conseguiu analisar os termos da nossa proposta para o projeto de {{project_type}} de R$ {{project_value}}.\n\nSe tiver qualquer dúvida técnica ou precisar ajustar o cronograma, estou por aqui! Conseguimos iniciar o setup na próxima segunda.',
    },
    {
      id: 'boas-vindas',
      name: 'Boas-vindas Lead Frio',
      category: 'Início',
      content: 'Olá, {{client_name}}! Vi que você se cadastrou em nosso portal querendo escalar seus canais de aquisição.\n\nPreparamos uma análise competitiva da sua marca 100% gratuita. Me diga, qual o seu foco principal este trimestre?',
    }
  ]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateId(id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  const handleCopyPrompt = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleAddPrompt = () => {
    if (!newPromptTitle || !newPromptText) {
      alert('Por favor, preencha o Título e o Prompt.');
      return;
    }
    let finalCategory = isCustomCategory ? customCategoryName.trim() : newPromptCategory;
    if (!finalCategory) {
      alert('Por favor, informe a categoria/nicho.');
      return;
    }
    // Capitalize first letter of category for visual consistency
    finalCategory = finalCategory.charAt(0).toUpperCase() + finalCategory.slice(1);

    const newP = {
      id: 'pr-' + Date.now(),
      title: newPromptTitle,
      category: finalCategory,
      prompt: newPromptText,
      refImage: newPromptRefImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      refImageCropY: `${newPromptCropY}%`
    };
    const updated = [...prompts, newP];
    savePrompts(updated);
    
    // Reset Form
    setNewPromptTitle('');
    setNewPromptText('');
    setNewPromptRefImage('');
    setNewPromptCategory('Tecnologia');
    setIsCustomCategory(false);
    setCustomCategoryName('');
    setNewPromptCropY(50);
    setIsAdminModalOpen(false);
  };

  const handleDeletePrompt = (id) => {
    if (window.confirm('Excluir este prompt da biblioteca?')) {
      const updated = prompts.filter(p => p.id !== id);
      savePrompts(updated);
    }
  };

  const handleMovePrompt = (id, direction) => {
    const index = prompts.findIndex(p => p.id === id);
    if (index === -1) return;

    const newPrompts = [...prompts];
    if (direction === 'up' && index > 0) {
      const temp = newPrompts[index];
      newPrompts[index] = newPrompts[index - 1];
      newPrompts[index - 1] = temp;
    } else if (direction === 'down' && index < newPrompts.length - 1) {
      const temp = newPrompts[index];
      newPrompts[index] = newPrompts[index + 1];
      newPrompts[index + 1] = temp;
    } else {
      return;
    }

    savePrompts(newPrompts);
  };

  const handleMoveToTop = (id) => {
    const index = prompts.findIndex(p => p.id === id);
    if (index <= 0) return;

    const newPrompts = [...prompts];
    const [movedPrompt] = newPrompts.splice(index, 1);
    newPrompts.unshift(movedPrompt);

    savePrompts(newPrompts);
  };

  // Generative AI Image generation execution flow
  const handleGenerateImage = async (promptObj) => {
    setGeneratingPromptId(promptObj.id);
    try {
      const res = await apiFetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptObj.prompt })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedImages(prev => ({
          ...prev,
          [promptObj.id]: data.imageUrl
        }));
        
        // Deduct credits dynamically
        const currentCredits = parseInt(localStorage.getItem('ai_credits') || '150');
        const nextCredits = Math.max(0, currentCredits - 5);
        localStorage.setItem('ai_credits', String(nextCredits));
        
        // Dispatch custom global sync event
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: nextCredits }));
        
        alert(`Imagem gerada com sucesso! 5 Créditos de IA foram deduzidos do seu painel.`);
      } else {
        alert('Falha na geração com IA. Verifique suas conexões.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro técnico na geração de imagem.');
    } finally {
      setGeneratingPromptId(null);
    }
  };

  // Filter prompts by Category & Search query
  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(designerSearch.toLowerCase()) || p.prompt.toLowerCase().includes(designerSearch.toLowerCase());
    const matchesCategory = selectedDesignerCategory === 'Todos' || p.category === selectedDesignerCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <div className="p-1 bg-[#e13a40]/10 rounded-lg">
            <Bot className="h-6 w-6 text-[#e13a40]" />
          </div>
          Central de Agentes IA
        </h1>
        <p className="text-sm text-zinc-400 font-body mt-1">
          Gerencie modelos classificadores, limites de confiança de mensagens e prompts de vendas em tempo real.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => navigate('/ai')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'visao-geral'
              ? 'border-[#e13a40] text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Visão Geral
        </button>
        <button
          onClick={() => navigate('/ai/analista')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'analista'
              ? 'border-[#e13a40] text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Analista
        </button>
        <button
          onClick={() => navigate('/ai/copywriter')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'copywriter'
              ? 'border-[#e13a40] text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          Copywriter
        </button>
        <button
          onClick={() => navigate('/ai/designer')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'designer'
              ? 'border-[#e13a40] text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Palette className="h-4 w-4" />
          Designer
        </button>
      </div>

      {/* TAB CONTENT: VISÃO GERAL */}
      {activeTab === 'visao-geral' && (
        <div className="space-y-6">
          {/* Top API status card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4 shadow-md relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs text-zinc-500 font-body font-medium">Classificação Automatizada</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
              </div>
              <p className="text-2xl font-bold text-white font-mono mt-1">98.4%</p>
              <p className="text-[10px] text-zinc-400 font-body mt-1">Taxa de Acerto (Últimos 30d)</p>
            </div>

            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4 shadow-md">
              <span className="text-xs text-zinc-500 font-body font-medium">Total de Classificações</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">1,842</p>
              <p className="text-[10px] text-zinc-400 font-body mt-1">Mensagens processadas com IA</p>
            </div>

            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4 shadow-md">
              <span className="text-xs text-zinc-500 font-body font-medium">Consultas Hoje</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">148</p>
              <p className="text-[10px] text-zinc-400 font-body mt-1">Atividades nas últimas 24h</p>
            </div>

            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4 shadow-md">
              <span className="text-xs text-zinc-500 font-body font-medium">Economia Estimada</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">42.5 hrs</p>
              <p className="text-[10px] text-zinc-400 font-body mt-1">Horas economizadas de atendimento</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* API Config details */}
            <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-900 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="font-semibold text-white tracking-tight text-base flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-[#e13a40]" />
                Status do Motor de Classificação
              </h3>
              
              <div className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-300">OpenAI API Engine (GPT-4o-mini)</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Endereço de Conexão: api.openai.com/v1</p>
                </div>
                <div className="text-right">
                  <Badge backgroundColor="rgba(16,185,129,0.1)" textColor="#10B981" className="font-semibold">
                    ATIVO
                  </Badge>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Latência: 240ms</p>
                </div>
              </div>

              {/* simulated logs queue */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Últimas Ações da IA</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-950/40 rounded border border-zinc-900 font-mono">
                    <span className="text-[#e13a40]">#1894 - Lead "Mariana"</span>
                    <span className="text-zinc-300">Ação: Mover para \'Proposta Enviada\'</span>
                    <span className="text-emerald-400">96% Confiança</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-950/40 rounded border border-zinc-900 font-mono">
                    <span className="text-[#e13a40]">#1893 - Lead "Lucas Silva"</span>
                    <span className="text-zinc-300">Ação: Mover para \'Negociando\'</span>
                    <span className="text-emerald-400">92% Confiança</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-950/40 rounded border border-zinc-900 font-mono">
                    <span className="text-[#e13a40]">#1892 - Lead "Roberto"</span>
                    <span className="text-zinc-300">Ação: Nenhuma alteração</span>
                    <span className="text-amber-400">81% Confiança</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance radial preview */}
            <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-white tracking-tight text-base">Alinhamento Operacional</h3>
                <p className="text-xs text-zinc-500 font-body">Comparação de ações manuais vs. automáticas.</p>
              </div>

              <div className="py-8 flex items-center justify-center relative">
                <div className="h-32 w-32 rounded-full border-[10px] border-zinc-900 border-t-[#e13a40] flex items-center justify-center rotate-45">
                  <div className="h-20 w-20 rounded-full bg-zinc-950 flex flex-col items-center justify-center -rotate-45">
                    <span className="text-xl font-bold text-white font-mono">82%</span>
                    <span className="text-[8px] text-zinc-500 font-body uppercase font-bold">Auto</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <span className="h-2.5 w-2.5 rounded bg-[#e13a40]" />
                    Ações Automatizadas
                  </span>
                  <span className="font-semibold text-white">82.3%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <span className="h-2.5 w-2.5 rounded bg-zinc-800" />
                    Intervenções Manuais
                  </span>
                  <span className="font-semibold text-white">17.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ANALISTA */}
      {activeTab === 'analista' && (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-6 shadow-lg space-y-6">
          <div className="space-y-1.5 border-b border-zinc-900 pb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">Configurações do Modelo Analista</h3>
            <p className="text-xs text-zinc-400 font-body">Defina as métricas e limites de confiança para o motor de classificação e triagem de leads.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Threshold Slider */}
            <div className="space-y-3 p-4.5 bg-zinc-950/60 border border-zinc-900 rounded-xl">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-zinc-200">Limite de Confiança Mínima</label>
                <span className="px-2 py-0.5 rounded bg-[#e13a40]/15 text-[#e13a40] text-xs font-mono font-bold">{threshold}%</span>
              </div>
              <p className="text-xs text-zinc-500 font-body">
                Se a classificação do modelo da IA tiver confiança menor que este limite, o lead permanecerá no estágio atual para aprovação manual.
              </p>
              <input
                type="range"
                min="50"
                max="98"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#e13a40] mt-2"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                <span>50% (Agressivo)</span>
                <span>98% (Conservador)</span>
              </div>
            </div>

            {/* Cooldown slider */}
            <div className="space-y-3 p-4.5 bg-zinc-950/60 border border-zinc-900 rounded-xl">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-zinc-200">Silêncio de IA (Cooldown)</label>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 text-xs font-mono font-bold">{cooldown} minutos</span>
              </div>
              <p className="text-xs text-zinc-500 font-body">
                Tempo que a IA ficará em silêncio sem dar palpites nem mudar o estágio do lead caso o atendente realize qualquer alteração manual.
              </p>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={cooldown}
                onChange={(e) => setCooldown(e.target.value)}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>

          {/* Boosting keywords triggers */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-semibold text-zinc-200">Palavras-chave de Impulsão de Classificação</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🟢</span>
                  <span className="text-xs font-semibold text-white">Novo Lead</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug font-body">Detecta interesse ou cadastro inicial na plataforma.</p>
                <Input defaultValue="preciso de ajuda, quero entender, orçamento" className="text-xs h-8 bg-[#0c0c0e] border-zinc-900" />
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🟡</span>
                  <span className="text-xs font-semibold text-white">Proposta Enviada</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug font-body">Detecta recebimento da apresentação técnica/valores.</p>
                <Input defaultValue="proposta, pdf, apresentação, valores, preços" className="text-xs h-8 bg-[#0c0c0e] border-zinc-900" />
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🟠</span>
                  <span className="text-xs font-semibold text-white">Negociando</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug font-body">Detecta tentativas de fechamento e tratativas comerciais.</p>
                <Input defaultValue="desconto, contrato, fechar, pix, prazo, início" className="text-xs h-8 bg-[#0c0c0e] border-zinc-900" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-4 border-t border-zinc-900">
            <Button className="font-semibold">Salvar Configurações</Button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COPYWRITER */}
      {activeTab === 'copywriter' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: templates list */}
          <div className="lg:col-span-1 bg-[#0c0c0e] border border-zinc-900 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white text-base">Templates da IA</h3>
              <Button size="sm" className="h-7 text-[10px] px-2 gap-1 font-semibold">
                <span>Criar Template</span>
              </Button>
            </div>
            
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-lg cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">{t.name}</span>
                    <span className="text-[9px] font-bold text-[#e13a40] bg-[#e13a40]/10 px-1.5 py-0.2 rounded border border-[#e13a40]/20 uppercase">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-body line-clamp-2 leading-snug">
                    {t.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Template Editor and Suggestions */}
          <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-900 rounded-xl p-5 shadow-lg space-y-5">
            <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-semibold text-white text-base">Editor de Sugestões de Respostas</h3>
                <p className="text-xs text-zinc-500 font-body">Este prompt gera as respostas de clique rápido sugeridas no chat do WhatsApp.</p>
              </div>
              <Badge backgroundColor="rgba(255,72,61,0.1)" textColor="#e13a40" className="font-semibold text-[10px]">
                AUTO GENERATOR ACTIVE
              </Badge>
            </div>

            <div className="space-y-4">
              {templates.map((t) => (
                <div key={t.id} className="p-4 bg-zinc-950/80 border border-zinc-900 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#e13a40]">{t.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(t.id, t.content)}
                      className="h-7 text-[10px] px-2.5 font-semibold bg-[#0c0c0e]"
                    >
                      {copiedTemplateId === t.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <span>Copiar Template</span>
                      )}
                    </Button>
                  </div>
                  
                  <textarea
                    rows={4}
                    defaultValue={t.content}
                    className="w-full text-xs bg-[#0c0c0e] border border-zinc-800 rounded-lg p-3 text-zinc-100 font-body leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#e13a40]/50 focus:border-[#e13a40]/60"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Tags disponíveis: {'{{client_name}}'}, {'{{project_type}}'}, {'{{project_value}}'}</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Salvar Template</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DESIGNER */}
      {activeTab === 'designer' && (
        <div className="space-y-6">
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-900">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-[#e13a40]" />
                  Biblioteca de Prompts do Instagram
                </h3>
                <p className="text-xs text-zinc-400 font-body">Selecione prompts profissionais de alta qualidade para fotos corporativas e posts institucionais.</p>
              </div>

              {userRole === 'admin' && (
                <Button 
                  onClick={() => setIsAdminModalOpen(true)}
                  className="bg-[#e13a40] hover:bg-[#c52f34] text-white text-xs font-bold gap-1.5 h-9 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Prompt</span>
                </Button>
              )}
            </div>

            {/* Search & Category Filter Controls */}
            <div className="flex flex-col md:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Pesquisar prompts por título ou palavras-chave..."
                  value={designerSearch}
                  onChange={(e) => setDesignerSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#e13a40] outline-none h-9 font-semibold"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {['Todos', ...new Set(prompts.map(p => p.category))].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDesignerCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                      selectedDesignerCategory === cat
                        ? 'bg-[#e13a40]/10 border-[#e13a40] text-white'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompts Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrompts.map((p) => {
              const generatedUrl = generatedImages[p.id];
              const isGenerating = generatingPromptId === p.id;
              
              return (
                <div key={p.id} className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-5 shadow-lg flex flex-col justify-between gap-4 hover:border-zinc-800 transition-all relative overflow-hidden group">
                  <div className="space-y-3.5">
                    {/* Header: Title and category */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#e13a40] bg-[#e13a40]/10 px-2 py-0.5 rounded border border-[#e13a40]/20 uppercase">
                          {p.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{p.title}</h4>
                      </div>
                      
                      {userRole === 'admin' && (
                        <div className="flex items-center gap-1.5 shrink-0 bg-zinc-950/40 p-1 rounded-lg border border-zinc-900/60">
                          <button
                            onClick={() => handleMoveToTop(p.id)}
                            className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Mover para o Topo"
                          >
                            <ChevronsUp className="h-4 w-4 text-[#e13a40]" />
                          </button>
                          <button
                            onClick={() => handleMovePrompt(p.id, 'up')}
                            className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Mover para Cima"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMovePrompt(p.id, 'down')}
                            className="p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                            title="Mover para Baixo"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(p.id)}
                            className="p-1 text-zinc-600 hover:text-[#e13a40] transition-colors cursor-pointer border-l border-zinc-900 pl-1.5"
                            title="Excluir prompt"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Reference Image Preview - Full Width & 1:1 Aspect Ratio (Square) */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Exemplo de Referência</span>
                      <div className="w-full rounded-xl border border-zinc-900 overflow-hidden relative bg-zinc-950 flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}>
                        <img 
                          src={p.refImage} 
                          alt="Reference" 
                          style={{ objectPosition: `center ${p.refImageCropY || '50%'}` }}
                          className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Prompt Text Box */}
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1.5 relative">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Prompt de Comando</span>
                      <div className="max-h-24 overflow-y-auto scrollbar-thin pr-1">
                        <p className="text-[10px] text-zinc-350 leading-relaxed font-body font-medium select-all">{p.prompt}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-2 border-t border-zinc-900/50">
                    <button
                      onClick={() => handleCopyPrompt(p.id, p.prompt)}
                      className="w-full py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold hover:text-white transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedPromptId === p.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Add Prompt Modal */}
          {isAdminModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-body animate-fade-in text-left">
              <div className="w-full max-w-md rounded-2xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden flex flex-col">
                <button 
                  onClick={() => setIsAdminModalOpen(false)}
                  className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="pb-4 border-b border-[#1f1f1f] space-y-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="h-4 w-4 text-[#e13a40]" />
                    Adicionar Prompt para Instagram
                  </h2>
                  <p className="text-[11px] text-zinc-500">Cadastre um prompt criativo de alta performance para seus usuários copiarem ou gerarem com IA.</p>
                </div>

                <div className="py-4 space-y-3.5 text-xs text-zinc-100">
                  {/* Category Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Categoria / Nicho</label>
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(!isCustomCategory)}
                        className="text-[#e13a40] hover:underline text-[10px] font-bold cursor-pointer"
                      >
                        {isCustomCategory ? 'Selecionar da Lista' : '+ Adicionar Personalizado'}
                      </button>
                    </div>

                    {isCustomCategory ? (
                      <Input
                        required
                        placeholder="Digite a categoria personalizada (ex: Finanças, Saúde)"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                        className="bg-[#1a1a1a] border-[#1f1f1f] text-xs h-9 focus:border-[#e13a40]"
                      />
                    ) : (
                      <select
                        value={newPromptCategory}
                        onChange={(e) => setNewPromptCategory(e.target.value)}
                        className="w-full bg-[#1a1a1a] text-white text-xs rounded-xl border border-[#1f1f1f] focus:border-[#e13a40] h-9 px-3 outline-none font-semibold cursor-pointer"
                      >
                        {Array.from(new Set(['Tecnologia', 'Agência', 'Aplicativos', 'Varejo / Moda', ...prompts.map(p => p.category)])).map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                      </select>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Título do Prompt</label>
                    <Input
                      required
                      placeholder="Ex: Foto de Comida Gourmet Profissional"
                      value={newPromptTitle}
                      onChange={(e) => setNewPromptTitle(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-xs h-9 focus:border-[#e13a40]"
                    />
                  </div>

                  {/* Prompt Text */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Prompt de Comando em Inglês (Melhores Resultados)</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Ex: Professional dynamic corporate office team collaboration shot, clean lighting..."
                      value={newPromptText}
                      onChange={(e) => setNewPromptText(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-xl p-3 text-xs text-white focus:border-[#e13a40] outline-none font-body leading-relaxed"
                    />
                  </div>

                  {/* Reference Image Upload & Interactive Cropper */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Imagem de Exemplo / Referência *</label>
                    
                    {!newPromptRefImage ? (
                      <div 
                        onClick={() => document.getElementById('admin-prompt-ref-image-input').click()}
                        className="border-2 border-dashed border-[#1f1f1f] bg-[#1a1a1a] rounded-xl p-4 text-center cursor-pointer hover:border-zinc-700 hover:bg-[#202020] transition-all flex flex-col items-center justify-center gap-2 min-h-28"
                      >
                        <input
                          type="file"
                          id="admin-prompt-ref-image-input"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new window.Image();
                                img.onload = () => {
                                  // Downscale to max 1200px (Ultra-HD) to perfectly fit localStorage with stunning clarity
                                  const MAX_WIDTH = 1200;
                                  const MAX_HEIGHT = 1200;
                                  let width = img.width;
                                  let height = img.height;

                                  if (width > height) {
                                    if (width > MAX_WIDTH) {
                                      height *= MAX_WIDTH / width;
                                      width = MAX_WIDTH;
                                    }
                                  } else {
                                    if (height > MAX_HEIGHT) {
                                      width *= MAX_HEIGHT / height;
                                      height = MAX_HEIGHT;
                                    }
                                  }

                                  const canvas = document.createElement('canvas');
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  // Enable image smoothing for high quality downscaling
                                  ctx.imageSmoothingEnabled = true;
                                  ctx.imageSmoothingQuality = 'high';
                                  ctx.drawImage(img, 0, 0, width, height);

                                  // Convert to compressed JPEG (quality 0.92) for absolute razor-sharp clarity
                                  const compressedBase64 = canvas.toDataURL('image/jpeg', 0.92);
                                  setNewPromptRefImage(compressedBase64);
                                };
                                img.src = event.target.result;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <svg className="h-6 w-6 text-zinc-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <div>
                          <p className="text-[11px] font-semibold text-white">Clique para selecionar a imagem</p>
                          <p className="text-[9px] text-zinc-500 mt-0.5">PNG, JPG, JPEG ou WEBP</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 p-3 rounded-xl border border-[#1f1f1f] bg-[#1a1a1a]/50">
                        {/* 1:1 Aspect ratio preview frame */}
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex justify-between items-center mb-1">
                          <span>Ajuste o Enquadramento</span>
                          <button 
                            type="button"
                            onClick={() => setNewPromptRefImage('')}
                            className="text-rose-500 hover:underline"
                          >
                            Remover
                          </button>
                        </div>

                        {/* Interactive live crop preview screen */}
                        <div className="h-44 w-full rounded-lg overflow-hidden border border-[#222] bg-zinc-950 relative flex items-center justify-center">
                          <img 
                            src={newPromptRefImage} 
                            alt="Focal Crop Preview" 
                            style={{ objectPosition: `center ${newPromptCropY}%` }}
                            className="w-full h-full object-cover" 
                          />
                        </div>

                        {/* Slider Controller */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                            <span>Foco: Topo</span>
                            <span className="text-[#e13a40]">{newPromptCropY}%</span>
                            <span>Foco: Base</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={newPromptCropY}
                            onChange={(e) => setNewPromptCropY(parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#e13a40]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1f1f1f] flex justify-end gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAdminModalOpen(false)}
                    className="py-2 px-4 rounded-lg bg-zinc-900 border border-[#1f1f1f] text-zinc-400 hover:text-white font-semibold transition-all h-9"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleAddPrompt}
                    className="py-2 px-5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold transition-all shadow-md h-9"
                  >
                    Adicionar Prompt
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
