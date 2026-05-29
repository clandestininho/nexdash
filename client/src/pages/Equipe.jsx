import React, { useState, useEffect } from 'react';
import { Sparkles, Check, ArrowRight, Star, Users, Plus, Trash2, CheckCircle2, Shield, UserX, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { apiFetch } from '../lib/api';

export default function Equipe() {
  const [billingPeriod, setBillingPeriod] = useState('annual'); // 'monthly' | 'annual'
  const [members, setMembers] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Atendente');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing collaborators from SQLite settings table on mount
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.team_members) {
            setMembers(JSON.parse(data.team_members));
          } else {
            // Populate defaults
            const defaults = [
              { id: '1', name: 'Gleison (Você)', role: 'Administrador', status: 'Ativo', avatar: 'GL' },
              { id: '2', name: 'Juliana Sócia', role: 'Supervisor', status: 'Ativo', avatar: 'JS' }
            ];
            setMembers(defaults);
            await apiFetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ team_members: JSON.stringify(defaults) })
            });
          }
        }
      } catch (err) {
        console.error('[Equipe] Error fetching team settings:', err);
      }
    };
    loadMembers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setIsSaving(true);

    const newMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      role: newMemberRole,
      status: 'Ativo',
      avatar: newMemberName.trim().slice(0, 2).toUpperCase()
    };

    const updated = [...members, newMember];
    setMembers(updated);
    setNewMemberName('');

    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_members: JSON.stringify(updated) })
      });
      // Emit sync event for other active tabs
      window.dispatchEvent(new CustomEvent('team_members_updated', { detail: updated }));
    } catch (err) {
      console.error('[Equipe] Error saving new collaborator:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (id) => {
    if (id === '1') {
      alert("Você não pode excluir a si mesmo (Proprietário da conta)!");
      return;
    }

    const updated = members.filter(m => m.id !== id);
    setMembers(updated);

    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_members: JSON.stringify(updated) })
      });
      window.dispatchEvent(new CustomEvent('team_members_updated', { detail: updated }));
    } catch (err) {
      console.error('[Equipe] Error removing collaborator:', err);
    }
  };

  const handleToggleStatus = async (id) => {
    if (id === '1') return;

    const updated = members.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'Ativo' ? 'Inativo' : 'Ativo' };
      }
      return m;
    });
    setMembers(updated);

    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_members: JSON.stringify(updated) })
      });
      window.dispatchEvent(new CustomEvent('team_members_updated', { detail: updated }));
    } catch (err) {
      console.error('[Equipe] Error toggling status:', err);
    }
  };

  // Pricing details
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
      name: 'NEXT Scale',
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <div className="p-1 bg-[#e13a40]/10 rounded-lg">
            <Users className="h-6 w-6 text-[#e13a40]" />
          </div>
          Gerenciamento da Equipe
        </h1>
        <p className="text-sm text-zinc-400 font-body mt-1">
          Cadastre operadores corporativos, gerencie cargos, habilite status de atendimento e colabore em tempo real.
        </p>
      </div>

      {/* ACTIVE SEAT MANAGER PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Seating list & operators */}
        <div className="lg:col-span-2 bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Membros Ativos</span>
              <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono font-bold">
                {members.length} / 3 Assentos no Teste
              </span>
            </h2>
            <span className="text-[10px] text-zinc-500 font-body">Plano Trial com limite de 3 assentos</span>
          </div>

          <div className="divide-y divide-zinc-900">
            {members.length > 0 ? (
              members.map((member) => (
                <div key={member.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-850 to-zinc-900 border border-zinc-800 text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                      {member.avatar || member.name.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <Shield className="h-3 w-3 text-zinc-500" />
                        <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{member.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Bubble */}
                    <button
                      onClick={() => handleToggleStatus(member.id)}
                      disabled={member.id === '1'}
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                        member.status === 'Ativo'
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'text-zinc-500 bg-zinc-900/60 border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      {member.status === 'Ativo' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      <span>{member.status}</span>
                    </button>

                    {/* Delete collaborator */}
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={member.id === '1'}
                      className={`p-1.5 rounded-lg border border-zinc-900 text-zinc-500 transition-all ${
                        member.id === '1'
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:text-red-400 hover:bg-zinc-950 hover:border-zinc-800'
                      }`}
                      title="Excluir Colaborador"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 text-xs font-body">Nenhum membro cadastrado na equipe.</div>
            )}
          </div>
        </div>

        {/* Right Side: Fast Register Form */}
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Novo Operador</h3>
            <p className="text-[10px] text-zinc-500 font-body pt-0.5">Adicione assentos adicionais à sua conta.</p>
          </div>

          <form onSubmit={handleAddMember} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Nome Completo</label>
              <Input
                required
                type="text"
                placeholder="Ex: Carlos Silva"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="bg-zinc-950 border-zinc-900 text-zinc-100 text-xs py-2 h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cargo / Nível</label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="w-full bg-zinc-950 text-zinc-300 text-xs rounded-xl border border-zinc-900 focus:border-[#e13a40] h-9 px-3 outline-none font-semibold cursor-pointer"
              >
                <option value="Atendente">Atendente (Conversas WhatsApp)</option>
                <option value="Supervisor">Supervisor (Leads e Triagem)</option>
                <option value="Administrador">Administrador (Total de Acesso)</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isSaving || members.length >= 3}
              className="w-full bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#e13a40]/5 transition-all text-xs h-9"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar Membro</span>
            </Button>

            {members.length >= 3 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] font-body flex items-start gap-2 select-none animate-pulse-soft">
                <span>⚠️ Limite do Teste Atingido! Faça o upgrade para expandir o limite de assentos corporativos da sua equipe abaixo.</span>
              </div>
            )}
          </form>
        </div>

      </div>

      {/* UPSELL / PRICING UPGRADE AREA */}
      <div className="pt-6 border-t border-zinc-900/60">
        
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-[9px] font-black tracking-widest text-[#e13a45] uppercase bg-[#e13a40]/10 px-2 py-0.5 rounded border border-[#e13a40]/15 w-fit mx-auto block">PLANOS DE SEAT ADICIONAIS</span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
            Expanda o Poder da sua Equipe
          </h2>
          <p className="text-xs text-zinc-400 font-body">
            Ficou sem vagas no seu plano de testes? Escolha a escala perfeita para sua operação de atendimento e suporte.
          </p>

          {/* Billing Switch */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-900">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                  billingPeriod === 'annual'
                    ? 'bg-[#e13a40] text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>Anual</span>
                <span className="text-[9px] bg-black/35 px-1 rounded text-white font-black">-25%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid of pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full px-2">
          {plans.map((plan) => {
            const isPopular = plan.badge === 'Popular';
            const displayedPrice = billingPeriod === 'annual' ? plan.priceAnnualMonthly : plan.priceMonthly;
            const billingLabel = billingPeriod === 'annual' ? 'cobrado anualmente' : 'cobrado mensalmente';
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
                      <h3 className="text-sm font-bold text-white font-display">{plan.name}</h3>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-body">{plan.description}</p>
                  </div>

                  {/* Price block */}
                  <div className="my-6 space-y-1">
                    <div className="flex items-baseline text-white">
                      <span className="text-sm font-bold mr-1">R$</span>
                      <span className="text-2xl font-extrabold tracking-tight font-display">
                        {displayedPrice.toFixed(2).split('.')[0]}
                      </span>
                      <span className="text-sm font-medium text-zinc-400 ml-0.5">
                        .{displayedPrice.toFixed(2).split('.')[1]}
                      </span>
                      <span className="text-zinc-500 text-[10px] ml-1 font-body">/mês</span>
                    </div>
                    <p className="text-[9px] text-zinc-500 font-body font-mono">
                      R$ {totalCost.toFixed(2)} {billingLabel}
                    </p>
                  </div>

                  <div className="h-px bg-zinc-900 my-4" />

                  {/* Features list */}
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[10px] text-zinc-300 font-body">
                        <Check className={`h-3 w-3 shrink-0 ${isPopular ? 'text-[#e13a40]' : 'text-zinc-500'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-2">
                  <button
                    onClick={() => alert(`Redirecionando para checkout premium do plano ${plan.name}...`)}
                    className={`w-full py-2 px-4 rounded-xl text-[10px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      isPopular
                        ? 'bg-[#e13a40] text-white hover:bg-[#c52f34] hover:shadow-[0_0_15px_rgba(255,72,61,0.3)]'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>Assinar Vaga</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
