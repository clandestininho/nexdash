import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, ShieldAlert, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

export default function Equipe() {
  const [billingPeriod, setBillingPeriod] = useState('annual'); // 'monthly' | 'annual'

  // Pricing details matching Screenshot 1 perfectly
  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      description: 'Até 3 membros',
      priceMonthly: 79.00,
      priceAnnualMonthly: 59.25,
      annualTotal: 711.00,
      badge: null,
      features: [
        'Até 3 membros',
        'Permissões por módulo',
        'Suporte prioritário'
      ]
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Até 6 membros',
      priceMonthly: 129.00,
      priceAnnualMonthly: 96.75,
      annualTotal: 1161.00,
      badge: 'Popular',
      features: [
        'Até 6 membros',
        'Permissões por módulo',
        'Suporte prioritário'
      ]
    },
    {
      id: 'scale',
      name: 'team.scalePlan',
      description: 'Até 10 membros',
      priceMonthly: 169.00,
      priceAnnualMonthly: 126.75,
      annualTotal: 1521.00,
      badge: null,
      features: [
        'Até 10 membros',
        'Permissões por módulo',
        'Suporte prioritário'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Até 20 membros',
      priceMonthly: 249.00,
      priceAnnualMonthly: 186.75,
      annualTotal: 2241.00,
      badge: null,
      features: [
        'Até 20 membros',
        'Permissões por módulo',
        'Suporte VIP'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#e13a40]/10 border border-[#e13a40]/20 text-[#e13a40] mb-2 animate-bounce-soft">
          <Star className="h-6 w-6 text-[#e13a40] fill-[#e13a40]/20" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
          Trabalhe em Equipe
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 font-body max-w-xl mx-auto leading-relaxed">
          Convide colaboradores, defina permissões por módulo e gerencie seu negócio de forma colaborativa.
        </p>

        {/* Toggle Switch */}
        <div className="pt-4 flex justify-center">
          <div className="inline-flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-900">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingPeriod === 'annual'
                  ? 'bg-[#e13a40] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>Anual</span>
              <span className="text-[10px] bg-black/35 px-1.5 py-0.5 rounded text-white font-bold">-25%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full px-2">
        {plans.map((plan) => {
          const isPopular = plan.badge === 'Popular';
          const displayedPrice = billingPeriod === 'annual' ? plan.priceAnnualMonthly : plan.priceMonthly;
          const billingLabel = billingPeriod === 'annual' ? 'subscription billed Annually' : 'subscription billed Monthly';
          const totalCost = billingPeriod === 'annual' ? plan.annualTotal : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 transition-all duration-300 border flex flex-col justify-between ${
                isPopular
                  ? 'bg-[#0e0e11] border-[#e13a40]/50 shadow-[0_0_25px_rgba(255,72,61,0.15)] hover:border-[#e13a40]'
                  : 'bg-[#0c0c0e] border-[#1f1f23] hover:border-zinc-800'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e13a40] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-[#e13a40]/20">
                  Popular
                </span>
              )}

              <div>
                {/* Plan Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className={`h-4 w-4 ${isPopular ? 'text-[#e13a40]' : 'text-zinc-400'}`} />
                    <h3 className="text-lg font-bold text-white font-display">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 font-body">{plan.description}</p>
                </div>

                {/* Price block */}
                <div className="my-6 space-y-1">
                  <div className="flex items-baseline text-white">
                    <span className="text-lg font-bold mr-1">R$</span>
                    <span className="text-3xl font-extrabold tracking-tight font-display">
                      {displayedPrice.toFixed(2).split('.')[0]}
                    </span>
                    <span className="text-base font-medium text-zinc-400 ml-0.5">
                      .{displayedPrice.toFixed(2).split('.')[1]}
                    </span>
                    <span className="text-zinc-500 text-xs ml-1 font-body">/mês</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-body font-mono">
                    R$ {totalCost.toFixed(2)} {billingLabel}
                  </p>
                </div>

                <div className="h-px bg-zinc-900 my-4" />

                {/* Features list */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300 font-body">
                      <span className={`h-1.5 w-1.5 rounded-full ${isPopular ? 'bg-[#e13a40]' : 'bg-zinc-500'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-2">
                <button
                  onClick={() => alert(`Iniciando upgrade para o plano ${plan.name}...`)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    isPopular
                      ? 'bg-[#e13a40] text-white hover:bg-[#c52f34] hover:shadow-[0_0_15px_rgba(255,72,61,0.3)]'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <span>Fazer Upgrade</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer active plan */}
      <div className="mt-12 text-center text-xs text-zinc-500 font-body flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-full border border-zinc-900 shadow-sm animate-pulse-soft">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span>Seu plano atual: <strong className="text-zinc-300">Trial Gratuito</strong></span>
      </div>

    </div>
  );
}
