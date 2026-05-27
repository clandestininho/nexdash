import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Percent, 
  CheckSquare, 
  Calendar, 
  Bell, 
  Plus, 
  ArrowUpRight,
  Globe,
  FileText,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { apiFetch } from '../lib/api';

export default function Dashboard() {
  const [userName, setUserName] = useState('Gleison');
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Enviar proposta de Identidade Visual para Estúdio Criativo', done: false },
    { id: 2, text: 'Revisar cronograma de entrega com o designer', done: true },
    { id: 3, text: 'Verificar conexões do WhatsApp no painel de Conexão', done: false },
    { id: 4, text: 'Lançar recebimento no módulo Financeiro', done: false },
  ]);
  const [newReminder, setNewReminder] = useState('');
  const [reminders, setReminders] = useState([
    'Apresentação de projeto na segunda-feira às 14h.',
    'Assinatura trial expira em 7 dias.',
    'Ajustar chaves API do Claude na aba Automações.'
  ]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const stored = localStorage.getItem('dgflow_local_contacts');
        if (stored) {
          setContacts(JSON.parse(stored));
        } else {
          const res = await apiFetch('/api/contacts');
          if (res.ok) {
            const data = await res.json();
            const flat = [];
            Object.keys(data.stages || {}).forEach(k => {
              flat.push(...(data.stages[k] || []));
            });
            setContacts(flat);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar contatos no dashboard:', err);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.name) {
        setUserName(storedUser.name);
      }
    } catch {}
  }, []);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addReminder = () => {
    if (newReminder.trim()) {
      setReminders([...reminders, newReminder.trim()]);
      setNewReminder('');
    }
  };

  const removeReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  // SVG Chart path calculators
  const revenueData = [1000, 3200, 2100, 5400, 4800, 8900, 7500];
  const points = revenueData.map((val, index) => `${50 + index * 100},${220 - (val / 10000) * 180}`).join(' ');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-950 via-[#181010] to-[#0c0c0e] border border-[#e13a40]/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e13a40]/10 text-[#e13a40] text-xs font-semibold border border-[#e13a40]/20">
            <Sparkles className="h-3 w-3" />
            <span>CRM Premium Dark Ativado</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Olá, {userName}. Bem-vindo de volta!
          </h1>
          <p className="text-zinc-400 text-sm font-body max-w-xl">
            Sua pipeline do Estúdio está ativa e sua inteligência artificial está monitorando as conversas do WhatsApp em segundo plano.
          </p>
        </div>
        
        {/* Quick stat summary in banner */}
        <div className="flex items-center gap-4 bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800 shrink-0">
          <div className="text-center px-2">
            <span className="text-xs text-zinc-450 uppercase tracking-wider block font-bold">Meta Mensal</span>
            <span className="text-base font-bold text-white">R$ 10.000,00</span>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="text-center px-2">
            <span className="text-xs text-zinc-450 uppercase tracking-wider block font-bold">Atingido</span>
            <span className="text-base font-bold text-[#e13a40]">R$ 0,00 (0%)</span>
          </div>
        </div>
      </div>

      {/* Target Metas / KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Faturamento */}
        <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white hover:border-zinc-800 transition-all duration-200">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Faturamento</span>
              <h3 className="text-2xl font-bold text-white">R$ 0,00</h3>
              <p className="text-xs text-zinc-300 font-body">Meta: R$ 10.000,00 (0%)</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-[#e13a40]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Taxa de Conversão */}
        <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white hover:border-zinc-800 transition-all duration-200">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Conversão</span>
              <h3 className="text-2xl font-bold text-white">0%</h3>
              <p className="text-xs text-zinc-300 font-body">0 leads fechados</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
              <Percent className="h-5 w-5 text-[#e13a40]" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: CAC */}
        <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white hover:border-zinc-800 transition-all duration-200">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">CAC</span>
              <h3 className="text-2xl font-bold text-white">R$ 0,00</h3>
              <p className="text-xs text-zinc-300 font-body">Custo de Aquisição de Lead</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Users className="h-5 w-5 text-zinc-400" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: LTV */}
        <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white hover:border-zinc-800 transition-all duration-200">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">LTV</span>
              <h3 className="text-2xl font-bold text-white">R$ 0,00</h3>
              <p className="text-xs text-zinc-300 font-body">Lifetime Value por Cliente</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SVG Performance Chart & Sidebar checklist grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Consolidated Chart Card & Page Stats stack */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold">Análise de Faturamento Semanal</CardTitle>
                <CardDescription className="text-zinc-400 text-sm font-body">Desempenho histórico de vendas líquidas geradas</CardDescription>
              </div>
              <span className="text-sm text-[#e13a40] font-bold bg-[#e13a40]/10 px-2.5 py-0.5 rounded border border-[#e13a40]/20 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>+ 14.5%</span>
              </span>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 relative bg-zinc-950/20 rounded-xl border border-zinc-900/50 p-2 overflow-hidden flex items-end">
                
                {/* SVG Graph overlay */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 700 240">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e13a40" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#e13a40" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="50" y1="40" x2="650" y2="40" stroke="#1f1f23" strokeDasharray="3" />
                  <line x1="50" y1="100" x2="650" y2="100" stroke="#1f1f23" strokeDasharray="3" />
                  <line x1="50" y1="160" x2="650" y2="160" stroke="#1f1f23" strokeDasharray="3" />
                  <line x1="50" y1="220" x2="650" y2="220" stroke="#27272a" />
                  
                  {/* Area fill */}
                  <path
                    d={`M 50,220 L ${points} L 650,220 Z`}
                    fill="url(#chartGrad)"
                  />
                  
                  {/* Line Chart */}
                  <polyline
                    fill="none"
                    stroke="#e13a40"
                    strokeWidth="3"
                    points={points}
                    className="drop-shadow-[0_2px_10px_rgba(255,72,61,0.4)]"
                  />
                  
                  {/* Points Dots */}
                  {revenueData.map((val, i) => (
                    <circle
                      key={i}
                      cx={50 + i * 100}
                      cy={220 - (val / 10000) * 180}
                      r="4.5"
                      fill="#e13a40"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ))}
                  
                  {/* X Axis Labels */}
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, i) => (
                    <text
                      key={i}
                      x={50 + i * 100}
                      y="235"
                      fill="#a1a1aa"
                      fontSize="12"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {day}
                    </text>
                  ))}
                </svg>
                
              </div>
            </CardContent>
          </Card>

          {/* PAGE CONVERSION STATS CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Leads */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total de Leads</span>
                  <span className="text-3xl font-black text-white mt-1 block">{contacts.length}</span>
                  <span className="text-[9px] text-zinc-500 leading-normal block mt-1">Sincronizados no CRM</span>
                </div>
                <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* Fontes Ativas */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Canais Ativos</span>
                  <span className="text-3xl font-black text-white mt-1 block">3</span>
                  <span className="text-[9px] text-zinc-500 leading-normal block mt-1">WhatsApp & Links</span>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Globe className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* Conversões de Páginas */}
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Meta de Leads</span>
                  <span className="text-3xl font-black text-white mt-1 block">85%</span>
                  <span className="text-[9px] text-zinc-500 leading-normal block mt-1">Taxa de engajamento</span>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leads por dia chart (Simulated) */}
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardHeader className="pb-3 border-b border-[#1f1f23]/60 bg-zinc-950/20">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-[#e13a40]" />
                Volume de Entrada de Leads por Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 relative">
              <div className="h-40 w-full relative flex flex-col justify-between">
                <div className="absolute inset-0 flex items-end">
                  <div className="h-full w-px bg-zinc-800 absolute left-8 top-0" />
                  <div className="w-full h-px bg-zinc-800 absolute left-8 bottom-6" />
                  
                  {/* Axis values */}
                  <div className="absolute left-0 bottom-6 w-6 text-right font-mono text-[9px] text-zinc-500 flex flex-col justify-between h-28 select-none">
                    <span>10</span>
                    <span>7</span>
                    <span>5</span>
                    <span>2</span>
                    <span>0</span>
                  </div>

                  {/* Horizontal Axis label dates */}
                  <div className="absolute left-10 bottom-0 right-0 flex justify-between text-[9px] text-zinc-500 font-mono select-none px-2">
                    <span>21/05</span>
                    <span>22/05</span>
                    <span>23/05</span>
                    <span>24/05</span>
                    <span>25/05</span>
                    <span>26/05</span>
                    <span>27/05</span>
                  </div>
                </div>

                {/* Simulated Chart Line */}
                <svg className="w-full h-full absolute inset-0 left-8" viewBox="0 0 500 160">
                  <polyline
                    fill="none"
                    stroke="#e13a40"
                    strokeWidth="3"
                    points="30,120 100,90 170,105 240,40 310,75 380,20 450,45"
                    className="drop-shadow-[0_2px_8px_rgba(225,58,64,0.3)]"
                  />
                  {/* Dots */}
                  <circle cx="30" cy="120" r="4" fill="#e13a40" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="100" cy="90" r="4" fill="#e13a40" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="170" cy="105" r="4" fill="#e13a40" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="240" cy="40" r="4" fill="#e13a40" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="310" cy="75" r="4" fill="#e13a40" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="380" cy="20" r="4" fill="#e13a40" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="450" cy="45" r="4" fill="#e13a40" stroke="#ffffff" strokeWidth="1" />
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Active Services Quick Info */}
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#e13a40]" />
                Cronograma de Projetos do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Identidade Visual Completa</span>
                    <span className="text-xs text-zinc-300 mt-0.5">Cliente: Marina Sousa</span>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 font-bold">Em Produção</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-900 bg-zinc-950/40">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Social Media Anual</span>
                    <span className="text-xs text-zinc-300 mt-0.5">Cliente: Construtora Pernambuco</span>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">Aprovado</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Checklist & Reminders Stack */}
        <div className="space-y-6">
          {/* Daily tasks checklist */}
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-[#e13a40]" />
                  Tarefas Diárias
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs">Checklist operacional rápido</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/40 cursor-pointer select-none transition-all"
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                      task.done ? 'bg-[#e13a40] border-[#e13a40]' : 'border-zinc-800'
                    }`}>
                      {task.done && <CheckSquare className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`text-sm font-body truncate ${task.done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Reminders Card Checklist */}
          <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#e13a40]" />
                  Lembretes Rápidos
                </CardTitle>
                <CardDescription className="text-zinc-400 text-xs">Anotações e avisos rápidos</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add reminder input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  placeholder="Digitar novo lembrete..."
                  className="flex-1 bg-[#101014] text-xs px-3 h-9 rounded-lg border border-zinc-800 outline-none text-white focus:border-[#e13a40]"
                  onKeyDown={(e) => e.key === 'Enter' && addReminder()}
                />
                <button 
                  onClick={addReminder}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white transition-all active:scale-95 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Reminders list inside card in checklist format */}
              <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin">
                {reminders.map((reminder, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/40 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="h-4 w-4 rounded-full border border-[#e13a40]/40 bg-[#e13a40]/10 flex items-center justify-center shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#e13a40]" />
                      </div>
                      <span className="text-sm text-zinc-200 font-body truncate">
                        {reminder}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => removeReminder(idx)}
                      className="p-1 text-zinc-500 hover:text-white transition-colors"
                      title="Excluir lembrete"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
