import React, { useState } from 'react';
import { Bot, Sparkles, Sliders, FileText, Palette, Check, AlertCircle, Play, Cpu, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export default function AIPage() {
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [threshold, setThreshold] = useState(85);
  const [cooldown, setCooldown] = useState(15);
  const [copiedTemplateId, setCopiedTemplateId] = useState(null);

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
          onClick={() => setActiveTab('visao-geral')}
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
          onClick={() => setActiveTab('analista')}
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
          onClick={() => setActiveTab('copywriter')}
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
          onClick={() => setActiveTab('designer')}
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
                    <span className="text-zinc-300">Ação: Mover para 'Proposta Enviada'</span>
                    <span className="text-emerald-400">96% Confiança</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-950/40 rounded border border-zinc-900 font-mono">
                    <span className="text-[#e13a40]">#1893 - Lead "Lucas Silva"</span>
                    <span className="text-zinc-300">Ação: Mover para 'Negociando'</span>
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
                        <span>Copiar Link</span>
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
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-6 shadow-lg space-y-6">
          <div className="space-y-1.5 border-b border-zinc-900 pb-4">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-[#e13a40]" />
              Agente Designer de Branding
            </h3>
            <p className="text-xs text-zinc-400 font-body">Crie variações de identidade visual, logotipos conceituais e mockups automaticamente usando inteligência artificial generativa.</p>
          </div>

          {/* Generated designs mockups grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4.5 space-y-3.5 hover:border-zinc-800 transition-all flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="h-28 rounded-lg bg-gradient-to-tr from-purple-900/60 to-pink-900/40 border border-purple-500/10 flex items-center justify-center text-white relative group overflow-hidden">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono opacity-80 text-purple-200">Creative Glassmorphism</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2">Mockup Conceito #01 - Glassmorphism UI</h4>
                <p className="text-[10px] text-zinc-500 leading-snug font-body">Prompt: Estilo de interface elegante escuro com efeito fosco e botões neomórficos acesos.</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[9px] font-mono text-[#e13a40]">Estilo: Glassmorphism</span>
                <span className="text-[10px] text-zinc-400 hover:text-white cursor-pointer font-bold">Acessar</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4.5 space-y-3.5 hover:border-zinc-800 transition-all flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="h-28 rounded-lg bg-gradient-to-tr from-[#e13a40]/30 to-rose-950/40 border border-[#e13a40]/10 flex items-center justify-center text-white relative group overflow-hidden">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono opacity-80 text-rose-200">Brutalism Minimalist</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2">Branding Concept #02 - Brutalismo</h4>
                <p className="text-[10px] text-zinc-500 leading-snug font-body">Prompt: Cores de alto contraste e fontes sem serifa condensadas com bordas grossas pretas.</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[9px] font-mono text-[#e13a40]">Estilo: Brutalismo</span>
                <span className="text-[10px] text-zinc-400 hover:text-white cursor-pointer font-bold">Acessar</span>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4.5 space-y-3.5 hover:border-zinc-800 transition-all flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="h-28 rounded-lg bg-gradient-to-tr from-cyan-900/60 to-emerald-900/40 border border-cyan-500/10 flex items-center justify-center text-white relative group overflow-hidden">
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider font-mono opacity-80 text-cyan-200">Cyberpunk Dark Tech</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-2">UI Asset Concept #03 - Cyberpunk</h4>
                <p className="text-[10px] text-zinc-500 leading-snug font-body">Prompt: Gradientes de cores ciano/rosa neon, fontes de estilo futurista e padrões geométricos.</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[9px] font-mono text-[#e13a40]">Estilo: Cyberpunk</span>
                <span className="text-[10px] text-zinc-400 hover:text-white cursor-pointer font-bold">Acessar</span>
              </div>
            </div>
          </div>

          {/* Quick AI designer prompt trigger panel */}
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-zinc-300">Nova Geração Generativa de Peça Visual</h4>
            <div className="flex gap-2">
              <Input placeholder="Descreva os elementos criativos da imagem (ex: Logo moderno de tecnologia com gradiente vermelho e preto)..." className="flex-1 bg-[#0c0c0e] border-zinc-900" />
              <Button className="font-semibold gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Gerar Peça</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
