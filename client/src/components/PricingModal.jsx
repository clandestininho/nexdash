import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Rocket, Activity, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { ShinyButton } from './ui/ShinyButton';
import NumberFlow from '@number-flow/react';

// Pricing toggle switch styled with red corporate identity colors
const PricingSwitch = ({ selected, onChange }) => {
  return (
    <div className="flex justify-center my-2 relative z-50">
      <div className="relative flex w-fit rounded-full bg-neutral-900 border border-zinc-800 p-1">
        <button
          onClick={() => onChange('monthly')}
          className={`relative z-10 w-fit h-10 rounded-full sm:px-6 px-4 sm:py-2 py-1 font-body text-xs font-bold transition-colors duration-300 ${
            selected === 'monthly' ? 'text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {selected === 'monthly' && (
            <motion.span
              layoutId="pricing-switch-bg"
              className="absolute top-0 left-0 h-10 w-full rounded-full border-2 border-[#ff483d] shadow-[0_0_15px_rgba(225,58,64,0.3)] bg-gradient-to-t from-[#e13a40] to-[#ff483d]"
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
            />
          )}
          <span className="relative z-10">MENSAL</span>
        </button>

        <button
          onClick={() => onChange('yearly')}
          className={`relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-4 sm:py-2 py-1 font-body text-xs font-bold transition-colors duration-300 ${
            selected === 'yearly' ? 'text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {selected === 'yearly' && (
            <motion.span
              layoutId="pricing-switch-bg"
              className="absolute top-0 left-0 h-10 w-full rounded-full border-2 border-[#ff483d] shadow-[0_0_15px_rgba(225,58,64,0.3)] bg-gradient-to-t from-[#e13a40] to-[#ff483d]"
              transition={{ type: "spring", stiffness: 450, damping: 28 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            ANUAL <span className="text-[9px] bg-white text-[#e13a40] px-1.5 py-0.5 rounded-full font-black animate-pulse">20% OFF</span>
          </span>
        </button>
      </div>
    </div>
  );
};

// GPU-accelerated moving stardust particles background matching SparklesComp animation
function SparklesBackground() {
  const particles = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 0.8,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * -10, // Start animation in mid-air immediately
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            filter: 'drop-shadow(0 0 1.5px rgba(255, 255, 255, 0.7))',
          }}
          animate={{
            y: [0, -400],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export default function PricingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePlan, setActivePlan] = useState('trial');
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'yearly'
  const [isLoading, setIsLoading] = useState(false);
  const [submittingPlan, setSubmittingPlan] = useState(null);
  
  const pricingRef = useRef(null);

  // Listen to global open/close events
  useEffect(() => {
    const handleOpen = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.plan) {
          setActivePlan(storedUser.plan);
        }
      } catch {}
      setIsOpen(true);
    };

    const handleClose = () => setIsOpen(false);

    window.addEventListener('open_pricing_modal', handleOpen);
    window.addEventListener('close_pricing_modal', handleClose);
    
    const syncPlan = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.plan) {
          setActivePlan(storedUser.plan);
        }
      } catch {}
    };
    window.addEventListener('user_plan_updated', syncPlan);

    return () => {
      window.removeEventListener('open_pricing_modal', handleOpen);
      window.removeEventListener('close_pricing_modal', handleClose);
      window.removeEventListener('user_plan_updated', syncPlan);
    };
  }, []);

  if (!isOpen) return null;

  const handleSubscribe = async (plan) => {
    if (plan === activePlan) return;
    setIsLoading(true);
    setSubmittingPlan(plan);

    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan, billingPeriod })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar link de checkout.');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Link de checkout não retornado pelo servidor.');
      }
    } catch (err) {
      alert(`Erro no checkout: ${err.message}`);
    } finally {
      setIsLoading(false);
      setSubmittingPlan(null);
    }
  };

  const getPlanName = (p) => {
    if (p === 'basico') return 'Plano Básico';
    if (p === 'pro') return 'Plano Pro';
    if (p === 'next') return 'Plano NEXT';
    return 'Período de Testes';
  };

  const plans = [
    {
      id: 'basico',
      name: 'Básico',
      price: 49,
      yearlyPrice: 39,
      description: 'Excelente para profissionais autônomos e pequenas empresas iniciarem a organização de leads e orçamentos.',
      icon: Shield,
      color: '#e13a40',
      glowColor: 'rgba(225,58,64,0.12)',
      featuresHeader: 'O plano Básico inclui:',
      features: [
        'Dashboard de Visão Geral',
        'Gestão de Clientes (CRM)',
        'Criação de Orçamentos ilimitados',
        'Quadro de Tarefas (Kanban)',
        'Suporte técnico por e-mail'
      ],
      cta: 'Assinar Básico'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      yearlyPrice: 79,
      description: 'O melhor custo-benefício para empresas em crescimento gerenciarem equipes e fluxos financeiros.',
      icon: Activity,
      color: '#ec4899',
      glowColor: 'rgba(236,72,153,0.15)',
      popular: true,
      featuresHeader: 'Tudo do Básico, mais:',
      features: [
        'Pipelines de Vendas Customizados',
        'Gestão Financeira & Fluxo de Caixa',
        'Calendário de Agenda Avançado',
        'Catálogo de Serviços Integrado',
        'Briefings & Questionários de Captação',
        'Módulo Equipe & Operadores',
        'Histórico e Logs de Transição'
      ],
      cta: 'Assinar Pro'
    },
    {
      id: 'next',
      name: 'NEXT',
      price: 199,
      yearlyPrice: 159,
      description: 'Poder ilimitado de IA e automação WhatsApp para dominar o mercado com escala e velocidade extrema.',
      icon: Rocket,
      color: '#06b6d4',
      glowColor: 'rgba(6,182,212,0.2)',
      featuresHeader: 'Tudo do Pro, mais:',
      features: [
        'Conexão WhatsApp ilimitada (Socket)',
        'Agentes Virtuais de Inteligência Artificial',
        'Especialistas IA (Designer, Copys, Analistas)',
        'Monitor & Disparador de Grupos',
        'Construtor de Landing Pages & Sites',
        'Editor Visual Drag & Drop Integrado',
        'Suporte VIP Prioritário 24/7'
      ],
      cta: 'Assinar NEXT'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4 py-8 overflow-y-auto select-none font-body">
      
      {/* Dynamic massive glowing backdrop header halo in corporate red */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[-200px] w-[1100px] h-[550px] pointer-events-none z-0">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: "180px solid #e13a40",
            filter: "blur(96px)",
            WebkitFilter: "blur(96px)",
            opacity: 0.15
          }}
        />
      </div>

      {/* Grid pattern overlay exactly like user design template */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:70px_80px] pointer-events-none opacity-45 z-0" />

      {/* Radial soft background overlay */}
      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-[600px] z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #e13a40 0%, transparent 70%)`,
          opacity: 0.12,
          mixBlendMode: "screen",
        }}
      />

      {/* Modal Container */}
      <div 
        ref={pricingRef}
        className="relative w-full max-w-5xl rounded-3xl border border-zinc-800 bg-[#070709]/95 p-6 md:p-8 shadow-2xl overflow-y-auto my-auto animate-fade-in max-h-[95vh] z-10"
      >
        
        {/* Particle/Sparkles floating stardust moving background */}
        <SparklesBackground />

        {/* Modal Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-950/60 border border-zinc-855 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all cursor-pointer z-50"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Top Header Section */}
        <article className="text-center mb-8 max-w-3xl mx-auto space-y-3 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
            Planos que se encaixam no seu negócio
          </h2>
          <p className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed max-w-lg mx-auto font-body">
            Conecte sua equipe, crie automações com inteligência artificial e domine suas vendas no WhatsApp. Explore as opções e ative seu acesso.
          </p>
          
          {/* Billing Switch selector */}
          <div className="pt-2">
            <PricingSwitch selected={billingPeriod} onChange={setBillingPeriod} />
          </div>
        </article>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 max-w-5xl mx-auto">
          
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            const isActive = activePlan === plan.id;
            const isSubmitting = submittingPlan === plan.id;
            const currentPrice = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.price;

            return (
              <div 
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border bg-gradient-to-b from-[#0f0f12] via-[#09090b] to-[#0c0c0f] p-6 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-[#e13a40] z-20 md:-translate-y-1' 
                    : 'border-zinc-900 shadow-md hover:border-zinc-850 z-10'
                }`}
                style={{
                  boxShadow: plan.popular 
                    ? `0px -13px 300px 0px rgba(225,58,64,0.18), inset 0 1px 0 rgba(255,255,255,0.03)`
                    : `0 4px 25px rgba(0,0,0,0.5)`
                }}
              >
                {/* Header Information (Name, Price, Subtitle) */}
                <div className="space-y-4 text-left">
                  
                  {/* Name of Plan */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-extrabold text-white tracking-tight">{plan.name}</h3>
                    {isActive && (
                      <span className="px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
                        <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        Ativo
                      </span>
                    )}
                  </div>

                  {/* Price info - exactly like user design template */}
                  <div className="flex flex-col text-left">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                        R$
                        <NumberFlow
                          value={currentPrice}
                          className="text-4xl font-extrabold text-white tracking-tight font-mono"
                        />
                      </span>
                      <span className="text-zinc-450 ml-1 text-sm font-semibold">
                        /{billingPeriod === 'yearly' ? 'ano' : 'mês'}
                      </span>
                    </div>
                    {billingPeriod === 'yearly' && (
                      <span className="text-[9px] font-bold text-[#e13a40] font-mono tracking-wide mt-0.5">
                        Cobrado anualmente (R$ {currentPrice * 12}/ano)
                      </span>
                    )}
                  </div>

                  {/* Description below price */}
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Pricing CTA Button - EXACTLY positioned below description, above features! */}
                  <div className="pt-2 pb-2">
                    {isActive ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-zinc-900/40 border border-zinc-900 text-zinc-650 cursor-not-allowed select-none flex items-center justify-center font-body"
                      >
                        Seu Plano Atual
                      </button>
                    ) : isSubmitting ? (
                      <button
                        disabled
                        className="w-full py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-zinc-850 text-white animate-pulse flex items-center justify-center font-body"
                      >
                        Ativando...
                      </button>
                    ) : (
                      <ShinyButton
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isLoading}
                        className="w-full h-11 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {plan.cta}
                      </ShinyButton>
                    )}
                  </div>

                  {/* Features list below the CTA button */}
                  <div className="space-y-3 pt-4 border-t border-zinc-800">
                    <h4 className="font-semibold text-xs text-zinc-200 uppercase tracking-wide">
                      {plan.featuresHeader}
                    </h4>
                    
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2.5 text-[11px] text-zinc-400 font-medium leading-relaxed"
                        >
                          {/* Circular dots next to features - matches image design */}
                          <span className="h-2 w-2 bg-zinc-700 rounded-full shrink-0" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>
            );
          })}

        </div>

        {/* Info trial compliance notes footer */}
        <p className="text-center text-[9px] text-zinc-600 font-mono mt-8 border-t border-zinc-900 pt-4 leading-normal relative z-10">
          Ao assinar, o seu período de testes é imediatamente concluído e o novo plano é creditado em sua carteira SaaS. Cancelamento gratuito a qualquer momento.
        </p>

      </div>
    </div>
  );
}
