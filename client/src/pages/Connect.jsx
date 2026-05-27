import React, { useState } from 'react';
import { 
  CheckCircle, 
  Loader2, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Trash2 
} from 'lucide-react';
import { useWhatsAppStatus } from '../hooks/useSocket';
import { Card, CardContent } from '../components/ui/Card';
import { ShinyButton } from '../components/ui/ShinyButton';
import { formatPhone } from '../lib/utils';
import { apiFetch } from '../lib/api';

export default function Connect() {
  const { status, qrCode, phoneNumber, profilePic } = useWhatsAppStatus();
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding Celebration Modal state
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem('dgflow_show_welcome') === 'true');
  const [userName, setUserName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      return u?.name || 'Parceiro';
    } catch {
      return 'Parceiro';
    }
  });

  const handleInitConnection = async () => {
    setIsLoading(true);
    try {
      await apiFetch('/api/whatsapp/status');
    } catch (err) {
      console.error('Erro ao iniciar conexão:', err);
    } finally {
      // Keep loading until we get a socket event
      setTimeout(() => setIsLoading(false), 8000);
    }
  };

  const handleDisconnect = async () => {
    try {
      await apiFetch('/api/whatsapp/disconnect', { method: 'POST' });
    } catch (err) {
      console.error('Erro ao desconectar:', err);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Deseja realmente limpar o histórico de conversas do banco de dados?")) {
      try {
        await apiFetch('/api/contacts/clear-history', { method: 'POST' });
        alert("Histórico de conversas limpo!");
      } catch (err) {
        console.error('Erro ao limpar histórico:', err);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-[#09090b] px-4 py-8 font-body">
      <div className="w-full max-w-[420px] mx-auto">
        
        {/* Main Connection Card matching exactly the user image */}
        <div className="bg-[#0c0c0e] border border-[#1f1f23] rounded-[24px] p-6 shadow-2xl relative overflow-hidden flex flex-col space-y-6">
          
          {/* Top Status Icon Wrapper */}
          <div className="flex justify-center pt-2">
            {status === 'connected' ? (
              profilePic ? (
                <div className="relative inline-flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="relative h-16 w-16 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse-soft">
                  <Wifi className="h-6 w-6" />
                </div>
              )
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                <WifiOff className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {status === 'connected' ? 'WhatsApp Conectado' : 'Conectar WhatsApp'}
            </h1>
          </div>

          {/* Connected View */}
          {status === 'connected' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 text-center space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Número Conectado</span>
                {phoneNumber && (
                  <p className="text-base font-bold text-white font-mono">{formatPhone(phoneNumber)}</p>
                )}
                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed pt-1">
                  Sua conta está sincronizada e ativada. O sistema monitora mensagens recebidas em segundo plano.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl border border-zinc-850 bg-[#121212] hover:bg-[#1a1a1a] text-sm font-bold text-red-500 hover:text-red-450 active:scale-[0.98] transition-all duration-200 outline-none"
                >
                  <WifiOff className="h-4 w-4" />
                  <span>Desconectar</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  className="w-full text-zinc-500 hover:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 pt-2 transition-all outline-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Limpar histórico de conversas</span>
                </button>
              </div>
            </div>
          )}

          {/* Scanning / QR Code View */}
          {(status === 'scanning' || status === 'connecting') && (
            <div className="space-y-5 animate-fade-in flex flex-col text-center">
              {qrCode ? (
                <>
                  {/* QR Container */}
                  <div className="mx-auto p-4 bg-white rounded-2xl w-[250px] h-[250px] flex items-center justify-center shadow-lg">
                    <img
                      src={qrCode}
                      alt="QR Code WhatsApp"
                      className="w-[218px] h-[218px] rounded-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white">Escaneie o QR Code</h3>
                    
                    {/* List */}
                    <div className="text-left text-xs text-zinc-400 space-y-1.5 max-w-[280px] mx-auto font-medium">
                      <p>1. Abra o WhatsApp no seu celular</p>
                      <p>2. Toque em Mais opções ou Configurações</p>
                      <p>3. Toque em Dispositivos conectados</p>
                      <p>4. Toque em Conectar dispositivo</p>
                      <p>5. Escaneie este QR Code</p>
                    </div>
                  </div>

                  {/* Waiting indicator */}
                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-semibold py-1">
                    <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />
                    <span>Aguardando leitura do QR Code...</span>
                  </div>
                </>
              ) : (
                <div className="py-12 space-y-4">
                  <Loader2 className="h-10 w-10 text-[#e13a40] animate-spin mx-auto" />
                  <p className="text-xs text-zinc-400 font-semibold">
                    Gerando nova sessão segura e QR Code...
                  </p>
                </div>
              )}

              {/* Action Buttons Column */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleInitConnection}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-zinc-850 bg-[#121212] hover:bg-[#1a1a1a] text-sm font-bold text-zinc-200 hover:text-white active:scale-[0.98] transition-all duration-200 outline-none"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Gerar novo QR Code</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-zinc-850 bg-[#121212] hover:bg-[#1a1a1a] text-sm font-bold text-red-500 hover:text-red-400 active:scale-[0.98] transition-all duration-200 outline-none"
                >
                  <WifiOff className="h-4 w-4" />
                  <span>Desconectar</span>
                </button>

                <button
                  onClick={handleClearHistory}
                  className="w-full text-zinc-500 hover:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 pt-2 transition-all outline-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Limpar histórico de conversas</span>
                </button>
              </div>
            </div>
          )}

          {/* Disconnected View */}
          {status === 'disconnected' && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-900 text-zinc-400 text-xs font-medium leading-relaxed max-w-sm mx-auto">
                Nenhum número WhatsApp conectado. Conecte um novo número para começar.
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleInitConnection}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-sm font-bold text-white shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all duration-200 outline-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Inicializando Conexão...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Conectar Novo Número</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClearHistory}
                  className="w-full text-zinc-500 hover:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 pt-2 transition-all outline-none"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Limpar histórico de conversas</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Immersive Welcome Onboarding Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4 select-none animate-fade-in">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] rounded-full bg-[#e13a40]/10 blur-[100px] pointer-events-none animate-pulse-soft" />
          
          <div className="relative w-full max-w-xl rounded-3xl border border-zinc-800 bg-[#0c0c0e]/95 p-6 md:p-8 shadow-2xl text-center overflow-hidden animate-scale-in">
            
            {/* Top Celebratory Sparkles */}
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#e13a40] to-orange-500 flex items-center justify-center shadow-lg shadow-[#e13a40]/20 animate-bounce">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Welcome messages */}
            <div className="space-y-2">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none">
                🎉 Conta Criada com Sucesso!
              </h2>
              <p className="text-sm font-bold text-zinc-300">
                Seja muito bem-vindo ao NEXDASH, {userName}!
              </p>
            </div>

            {/* Trial announcement banner */}
            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-left max-w-md mx-auto space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block font-mono">
                ⏳ Seu Teste Grátis de 7 Dias Começou!
              </span>
              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                Você acaba de ganhar <strong>acesso total e irrestrito</strong> a todas as funcionalidades do plano NEXT. 
                Experimente os Agentes de IA Inteligentes, envie orçamentos com assinatura digital e configure automações completas de WhatsApp gratuitamente!
              </p>
            </div>

            {/* Checklist guide */}
            <div className="my-6 space-y-3 max-w-md mx-auto text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-550 block font-mono">
                Seus primeiros passos recomendados:
              </span>
              
              <div className="space-y-2.5">
                {[
                  { step: '1', title: 'Conecte seu WhatsApp', desc: 'Escaneie o QR Code para carregar suas conversas na IA automaticamente.' },
                  { step: '2', title: 'Personalize o CRM', desc: 'Edite o funil de vendas, serviços e mensagens com a cara da sua marca.' },
                  { step: '3', title: 'Automatize Propostas', desc: 'Crie novos orçamentos premium com link de aprovação direta para o cliente.' }
                ].map((item) => (
                  <div key={item.step} className="flex gap-3 items-start">
                    <span className="h-5 w-5 rounded bg-zinc-900 border border-zinc-800 text-[10.5px] font-bold text-zinc-400 flex items-center justify-center shrink-0 font-mono">
                      {item.step}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white leading-none">{item.title}</h4>
                      <p className="text-[10px] text-zinc-550 font-medium leading-normal">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action button */}
            <div className="pt-3 border-t border-zinc-900/60 max-w-md mx-auto">
              <ShinyButton
                onClick={() => {
                  localStorage.removeItem('dgflow_show_welcome');
                  setShowWelcome(false);
                  handleInitConnection(); // Automatically trigger QR code generation!
                }}
                className="w-full h-12 text-xs font-extrabold uppercase tracking-widest"
              >
                <span>Começar Minha Jornada</span>
                <ArrowRight className="h-4 w-4 text-white animate-pulse" />
              </ShinyButton>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
