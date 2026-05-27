import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, LayoutDashboard, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { PLAN_DETAILS } from '../lib/plans';
import { ShinyButton } from './ui/ShinyButton';

export default function PaywallLock({ path = '' }) {
  const [user, setUser] = useState(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
          
          const plan = storedUser.plan || 'trial';
          if (plan === 'trial') {
            const trialEndsAt = storedUser.trial_ends_at 
              ? new Date(storedUser.trial_ends_at.replace(' ', 'T'))
              : new Date(new Date(storedUser.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
            
            const now = new Date();
            if (now > trialEndsAt) {
              setTrialExpired(true);
              setTrialDaysLeft(0);
            } else {
              setTrialExpired(false);
              const diffMs = trialEndsAt.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              setTrialDaysLeft(diffDays);
            }
          } else {
            setTrialExpired(false);
          }
        }
      } catch {}
    };

    loadUser();
    // Listen to plan updates in real-time
    window.addEventListener('user_plan_updated', loadUser);
    return () => window.removeEventListener('user_plan_updated', loadUser);
  }, []);

  const openUpgradeModal = () => {
    window.dispatchEvent(new Event('open_pricing_modal'));
  };

  const getRequiredPlan = (targetPath) => {
    const normalized = targetPath.split('?')[0].split('#')[0];
    
    // WhatsApp/AI is exclusively NEXT
    if (normalized.startsWith('/ai') || normalized.startsWith('/whatsapp') || normalized.startsWith('/connect') || normalized.startsWith('/pages') || normalized.startsWith('/visual-editor')) {
      return 'next';
    }
    
    // Pipelines/Agenda/Finance/Services is Pro
    return 'pro';
  };

  const requiredPlan = getRequiredPlan(path || window.location.pathname);
  const userPlanName = user?.plan ? PLAN_DETAILS[user.plan]?.name : 'Nenhum';

  // Determine bullet lists based on path
  const getSectionFeatures = (targetPath) => {
    const normalized = targetPath.split('?')[0].split('#')[0];
    if (normalized.startsWith('/ai')) {
      return [
        'Acesso completo a Inteligência Artificial integrada ao WhatsApp',
        'Criação de Agentes Personalizados com Prompting cognitivo',
        'Assistente Analista de Conversões e métricas avançadas',
        'Assistente Copywriter com criação de funis de alta conversão',
        'Agente Designer para geração de imagens de portfólio via Prompt'
      ];
    }
    if (normalized.startsWith('/whatsapp') || normalized.startsWith('/connect')) {
      return [
        'Conexão de número WhatsApp via API de alta velocidade (Socket.io)',
        'Painel Inteligente de Conversas em tempo real com Chat Centralizado',
        'Módulo Atendentes Multi-Operadores sem limites de logins',
        'Automações complexas por gatilhos de palavras-chave',
        'Monitoramento de Grupos com disparo de automações inteligentes'
      ];
    }
    if (normalized.startsWith('/finance')) {
      return [
        'Controle completo de Fluxo de Caixa (Entradas & Saídas)',
        'Lançamento rápido de despesas e categorização inteligente',
        'Aba dedicada para parcelamento e faturas a Pagar / Receber',
        'Geração e emissão simplificada de Notas Fiscais eletrônicas',
        'Relatórios gráficos detalhados de faturamento e lucro líquido'
      ];
    }
    if (normalized.startsWith('/pipelines')) {
      return [
        'Quadros Kanban de pipelines de vendas multi-etapas',
        'Mover contatos e leads por arrastar e soltar (Drag and Drop)',
        'Integração e sincronização automática de WhatsApp com CRM stages',
        'Definição de valores de projetos e confiança de fechamento por lead',
        'Classificador cognitivo que avança leads no funil dinamicamente'
      ];
    }
    
    // Default locked CRM lists
    return [
      'Pipelines de vendas integrados com automação WhatsApp',
      'Briefings e formulários inteligentes de captação de leads públicos',
      'Financeiro profissional com fluxo de caixa e emissão de notas',
      'Agenda automatizada para fotógrafos e prestadores de serviços',
      'Gestão de catálogo de serviços e equipe multi-operadores'
    ];
  };

  const features = getSectionFeatures(path || window.location.pathname);

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center py-10 px-4 select-none">
      
      {/* Glow ambient card shadow */}
      <div 
        className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-[#121214]/60 p-8 text-center backdrop-blur-md overflow-hidden"
        style={{
          boxShadow: trialExpired 
            ? '0 20px 40px rgba(225,58,64,0.05), inset 0 1px 0 rgba(255,255,255,0.02)'
            : '0 20px 40px rgba(236,72,153,0.04), inset 0 1px 0 rgba(255,255,255,0.02)'
        }}
      >
        
        {/* Blurry glow overlay */}
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
          style={{ backgroundColor: trialExpired ? '#e13a40' : '#ec4899' }}
        />

        {/* Lock Animation Icon */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div 
            className="h-16 w-16 rounded-2xl flex items-center justify-center border animate-pulse-soft"
            style={{ 
              backgroundColor: trialExpired ? 'rgba(225,58,64,0.08)' : 'rgba(236,72,153,0.08)',
              borderColor: trialExpired ? 'rgba(225,58,64,0.2)' : 'rgba(236,72,153,0.2)',
              color: trialExpired ? '#e13a40' : '#ec4899'
            }}
          >
            <Lock className="h-7 w-7" />
          </div>
          <span 
            className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white shadow-md font-bold"
            style={{
              background: trialExpired ? 'linear-gradient(135deg, #e13a40 0%, #be123c 100%)' : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
            }}
          >
            !
          </span>
        </div>

        {/* Dynamic Titles & Descriptions */}
        {trialExpired ? (
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
              Seu Período de Testes Expirou!
            </h2>
            <p className="text-xs text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">
              O seu teste gratuito de 7 dias do **NEXDASH** terminou. Para continuar utilizando os módulos de CRM,
              financeiro, propostas e automações WhatsApp sem interrupções, assine um plano.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
              Funcionalidade Bloqueada no {userPlanName}
            </h2>
            <p className="text-xs text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">
              Este módulo não está incluído na sua assinatura atual. É necessário fazer o upgrade para o{' '}
              <strong style={{ color: requiredPlan === 'next' ? '#06b6d4' : '#ec4899' }}>
                {requiredPlan === 'next' ? 'Plano NEXT' : 'Plano Pro'}
              </strong>{' '}
              para obter acesso.
            </p>
          </div>
        )}

        {/* Locked features display grid */}
        <div className="my-8 rounded-2xl bg-zinc-950/50 border border-zinc-900 p-5 text-left max-w-lg mx-auto space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-550 block">
            O que você vai liberar nesta seção:
          </span>
          <ul className="space-y-2">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-[11px] text-zinc-350 leading-snug">
                <ShieldCheck className="h-4 w-4 text-[#e13a40] shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
          
          <ShinyButton
            onClick={openUpgradeModal}
            className="w-full h-12 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest"
          >
            <Zap className="h-4 w-4 fill-white text-white animate-pulse" />
            <span>{trialExpired ? 'Escolher meu Plano' : 'Fazer Upgrade'}</span>
          </ShinyButton>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 py-3.5 px-6 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard Principal</span>
          </button>

        </div>

      </div>
    </div>
  );
}
