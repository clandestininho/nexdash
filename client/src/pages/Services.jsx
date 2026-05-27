import React, { useState } from 'react';
import { 
  Briefcase, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  ShoppingBag, 
  Globe, 
  Sparkles,
  Link2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

const SERVICES = [
  {
    id: 'srv-1',
    title: 'Identidade Visual Completa',
    subtitle: 'Marca, paleta de cores, tipografia e manual de marca',
    price: 3500.00,
    time: '20 dias úteis',
    features: [
      'Logotipo principal e secundário',
      'Definição de tipografia e guia HSL',
      'Manual de uso da marca em PDF',
      'Mockups premium para redes sociais',
      '03 rodadas de ajustes inclusas'
    ],
    popular: true,
  },
  {
    id: 'srv-2',
    title: 'Gestão de Social Media',
    subtitle: 'Criação de criativos, copys e cronograma mensal',
    price: 1800.00,
    time: 'Mensal',
    features: [
      '12 posts estáticos/carrossel',
      '04 vídeos no formato Reels/TikTok',
      'Redação das legendas (Copywriting)',
      'Agendamento e monitoramento básico',
      'Relatório mensal de insights'
    ],
    popular: false,
  },
  {
    id: 'srv-3',
    title: 'Planejamento Estratégico',
    subtitle: 'Briefing completo, funil de vendas e análise de público',
    price: 4900.00,
    time: '30 dias úteis',
    features: [
      'Análise aprofundada de concorrentes',
      'Desenho de persona de vendas',
      'Estruturação de funil de automação',
      'Criação de briefing dinâmico',
      '02 sessões de consultoria ao vivo'
    ],
    popular: false,
  },
];

export default function Services() {
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleCopyCheckout = (srvTitle) => {
    navigator.clipboard.writeText(`https://dgflow.app/estudio/checkout/${srvTitle.toLowerCase().replace(/\s+/g, '-')}`);
    alert(`Link de Checkout copiado para "${srvTitle}"!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-[#e13a40]" />
          Catálogo de Serviços
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Gerencie seus pacotes de design e marketing, crie links de checkout rápidos e configure regras de faturamento.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICES.map((srv) => (
          <Card 
            key={srv.id} 
            className={`bg-[#0c0c0e] border-[#1f1f23] text-white flex flex-col justify-between hover:border-zinc-800 transition-all duration-200 relative ${
              srv.popular ? 'ring-1 ring-[#e13a40] bg-gradient-to-b from-[#0c0c0e] to-[#121010]' : ''
            }`}
          >
            {srv.popular && (
              <span className="absolute -top-2.5 right-4 bg-[#e13a40] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,72,61,0.4)]">
                Mais Vendido
              </span>
            )}

            <CardHeader className="pb-3">
              <div>
                <CardTitle className="text-lg font-bold text-white">{srv.title}</CardTitle>
                <CardDescription className="text-zinc-500 text-xs mt-1 font-body leading-relaxed">{srv.subtitle}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-1">
              
              {/* Pricing row */}
              <div className="flex items-baseline gap-1 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900">
                <span className="text-2xl font-black text-white font-mono">R$ {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-[10px] text-zinc-500 font-medium">/ {srv.time}</span>
              </div>

              {/* Scope Bullet points */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Escopo do Serviço</span>
                <div className="space-y-2 text-xs">
                  {srv.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-zinc-300">
                      <Check className="h-4 w-4 text-[#e13a40] shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>

            {/* Card Footer Actions */}
            <div className="p-6 pt-0 space-y-2">
              <button 
                onClick={() => handleCopyCheckout(srv.title)}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900 py-2 px-4 text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-150"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>Link de Checkout</span>
              </button>

              <button 
                onClick={() => alert(`Direcionando para elaboração de Orçamento de "${srv.title}"`)}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] py-2 px-4 text-xs font-semibold text-white transition-all"
              >
                <span>Gerar Proposta</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </Card>
        ))}
      </div>

      {/* Checkout Customization Accordion */}
      <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-1.5">
            <ShoppingBag className="h-5 w-5 text-[#e13a40]" />
            Configuração de Checkout e Pagamento
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">
            Habilite formas de recebimento e regras de parcelamento do Estúdio Milla & Lipe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-body">
          
          {/* Option 1: Pix */}
          <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
            <button 
              onClick={() => toggleAccordion('pix')}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-white hover:bg-zinc-900/40"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Cobrança Automatizada via PIX</span>
              </div>
              {activeAccordion === 'pix' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>
            
            {activeAccordion === 'pix' && (
              <div className="p-4 pt-0 text-xs text-zinc-400 space-y-2 border-t border-zinc-900">
                <p>O Pix é habilitado por padrão em todos os links de checkout. Os contratos exibirão automaticamente o QR code Pix e a chave cadastrada nas configurações do Financeiro.</p>
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 p-2 rounded border border-emerald-500/10 w-fit">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Taxa zero ativada!</span>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: Parcelamento */}
          <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
            <button 
              onClick={() => toggleAccordion('parcelas')}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-white hover:bg-zinc-900/40"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#e13a40]" />
                <span>Regras de Parcelamento (Boleto/Crédito)</span>
              </div>
              {activeAccordion === 'parcelas' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>
            
            {activeAccordion === 'parcelas' && (
              <div className="p-4 pt-0 text-xs text-zinc-400 space-y-3 border-t border-zinc-900">
                <p>Defina o número máximo de parcelas permitidas para contratos e faturamentos:</p>
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-semibold">Máximo de Parcelas</label>
                    <select className="bg-[#101014] text-white border border-zinc-800 text-xs p-1.5 rounded outline-none focus:border-[#e13a40]">
                      <option value="3">Até 3x sem juros</option>
                      <option value="6">Até 6x sem juros</option>
                      <option value="12">Até 12x (com juros do emissor)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
