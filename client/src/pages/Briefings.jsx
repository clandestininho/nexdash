import React, { useState } from 'react';
import { ClipboardList, Lock, Sparkles, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Briefings() {
  const [easterEggActive, setEasterEggActive] = useState(false);

  const triggerEasterEgg = () => {
    setEasterEggActive(true);
    // Play a retro sci-fi beep sound
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    } catch {}
    setTimeout(() => setEasterEggActive(false), 2500);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-zinc-100 animate-fade-in px-4">
      {/* Premium Glassmorphic Locked Card */}
      <div className="max-w-2xl w-full bg-[#0c0c0e]/80 border border-zinc-800/80 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md relative overflow-hidden text-center flex flex-col items-center space-y-6">
        
        {/* Glow background accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#e13a40]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Animated Icon Lock Box */}
        <div className="relative group cursor-pointer" onClick={triggerEasterEgg}>
          <div className="absolute inset-0 bg-[#e13a40]/25 rounded-2xl blur-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#e13a40]/40" />
          <div className="relative h-20 w-20 rounded-2xl bg-[#0c0c0e] border border-zinc-800 flex items-center justify-center shadow-lg group-hover:border-[#e13a40]/50 transition-all duration-300">
            <Lock className={`h-10 w-10 text-[#e13a40] transition-all duration-500 ${easterEggActive ? 'animate-bounce' : 'group-hover:rotate-12'}`} />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-orange-500 border border-[#0c0c0e] flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Tactical Secret Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest bg-zinc-900 border border-zinc-800 text-[#e13a40] uppercase animate-pulse-soft">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>MÓDULO SOB SIGILO MILITAR</span>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
            Recrutador de Requisitos IA
          </h1>
          <p className="text-zinc-400 font-body text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
            {easterEggActive ? (
              <span className="text-orange-400 font-bold transition-all animate-pulse">
                ATENÇÃO: Scanner biométrico ativado! Nossos agentes secretos acabam de registrar seu interesse estratégico nesta funcionalidade. Código criptografado enviado!
              </span>
            ) : (
              "OPERAÇÃO AGENTE SECRETO NEXDASH: Nossos engenheiros cibernéticos e robôs espiões estão atualmente em campo de treinamento intensivo. Em breve, este módulo será desbloqueado para você criar briefings inteligentes que extraem segredos cruciais dos seus clientes, sincronizando respostas de requisitos diretamente no funil!"
            )}
          </p>
        </div>

        {/* Premium Lock indicators */}
        <div className="w-full grid grid-cols-3 gap-3 border-y border-zinc-900 py-6 my-2 text-left">
          <div className="space-y-1.5 pl-3 border-l-2 border-[#e13a40]/30">
            <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold font-mono">STATUS</span>
            <span className="block text-[11px] text-zinc-300 font-bold">Criptografado</span>
          </div>
          <div className="space-y-1.5 pl-3 border-l-2 border-orange-500/30">
            <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold font-mono">LANÇAMENTO</span>
            <span className="block text-[11px] text-zinc-300 font-bold">Em Breve</span>
          </div>
          <div className="space-y-1.5 pl-3 border-l-2 border-zinc-800">
            <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold font-mono">ACESSO</span>
            <span className="block text-[11px] text-[#e13a40] font-black uppercase tracking-wider flex items-center gap-0.5">
              <Zap className="h-3 w-3 fill-[#e13a40]/10" /> PREMIUM
            </span>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
          <Button 
            onClick={triggerEasterEgg}
            className="text-xs font-bold px-6 h-10 bg-[#e13a40] hover:bg-[#c52f34] text-white shadow-lg shadow-[#e13a40]/10"
          >
            Notifique-me no Lançamento
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="text-xs font-bold px-6 h-10 bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"
          >
            Voltar ao Dashboard
          </Button>
        </div>

      </div>
    </div>
  );
}
