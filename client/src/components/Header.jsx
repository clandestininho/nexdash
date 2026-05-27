import React, { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Header() {
  const [userName, setUserName] = useState('Gleison');
  const [aiCredits, setAiCredits] = useState(150);
  const [goalAchieved, setGoalAchieved] = useState(0);
  const [goalTarget, setGoalTarget] = useState(10000);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: nextTheme }));
  };

  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail);
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    const storedCredits = localStorage.getItem('ai_credits');
    if (storedCredits) setAiCredits(parseInt(storedCredits));

    const handleCreditsUpdate = (e) => {
      setAiCredits(e.detail);
    };
    window.addEventListener('credits-updated', handleCreditsUpdate);
    return () => window.removeEventListener('credits-updated', handleCreditsUpdate);
  }, []);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.name) {
        setUserName(storedUser.name);
      }
    } catch {}

    // Optionally fetch dynamic KPIs from finance API
    const fetchKPIs = async () => {
      try {
        const res = await apiFetch('/api/finance/kpis');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.totalEarnings === 'number') {
            setGoalAchieved(data.totalEarnings);
          }
        }
      } catch (err) {
        // Fallback to default mock
      }
    };
    fetchKPIs();
  }, []);

  const progressPercentage = Math.min(100, Math.max(0, (goalAchieved / goalTarget) * 100));

  return (
    <header className="h-16 border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left: Search Box Widget */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar clientes, leads ou propostas..."
            className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg pl-9 pr-12 py-2 text-xs text-zinc-300 placeholder-zinc-500 outline-none focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 transition-all font-body"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-0.5 px-1.5 py-0.2 rounded border border-[#1f1f1f] bg-[#121212] text-[9px] font-semibold text-zinc-500 select-none">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        
        {/* Goal Status Progress Bar */}
        <div className="hidden lg:flex flex-col w-48 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold font-body">
            <span>Meta de Receita</span>
            <span className="text-zinc-500">R$ {goalAchieved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {goalTarget.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-[#1f1f1f]">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-[#e13a40] transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-[#1f1f1f] hidden lg:block" />

        {/* AI Credit Counter */}
        <div className="flex items-center gap-1.5 bg-[#e13a40]/10 border border-[#e13a40]/20 px-2.5 py-1 rounded-full text-xs font-semibold text-[#e13a40] cursor-pointer hover:bg-[#e13a40]/25 transition-all">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[10px] tracking-wider uppercase font-body">{aiCredits} CRÉDITOS IA</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1a1a] transition-all">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#e13a40] rounded-full animate-pulse" />
        </button>

        {/* Language selector */}
        <button className="flex items-center gap-1 p-1 px-2 rounded-lg hover:bg-[#1a1a1a] text-zinc-400 hover:text-zinc-100 text-xs font-medium transition-all">
          <span className="mr-1">🇧🇷</span>
          <span className="text-[10px]">PT</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1a1a] transition-all"
          title={theme === 'dark' ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
        >
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-500" />}
        </button>

        {/* Profile Circle */}
        <div className="flex items-center gap-2 border-l border-[#1f1f1f] pl-4">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#e13a40] to-orange-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            {userName ? userName.slice(0,2).toUpperCase() : 'GL'}
          </div>
        </div>

      </div>

    </header>
  );
}
