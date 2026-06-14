import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowDown, Share } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isDismissed = localStorage.getItem('pwa_banner_dismissed') === 'true';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && !isStandalone && !isDismissed) {
      setIsVisible(true);
    }

    // Detect iOS
    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));

    // Listen to Android PWA prompt trigger
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('pwa_banner_dismissed', 'true');
    setIsVisible(false);
  };

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa_banner_dismissed', 'true');
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] md:max-w-md md:mx-auto bg-zinc-950/95 border border-zinc-900 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-slide-up flex gap-3 text-zinc-100">
      <div className="h-10 w-10 rounded-xl bg-[#e13a40]/10 border border-[#e13a40]/20 text-[#e13a40] flex items-center justify-center shrink-0">
        <Smartphone className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
          Instale o App NEXDASH
        </h4>
        
        {isIOS ? (
          <p className="text-[11px] text-zinc-400 font-body leading-relaxed">
            Toque no botão <span className="inline-flex items-center align-middle px-1 py-0.2 bg-zinc-900 border border-zinc-800 rounded mx-0.5"><Share className="h-3 w-3 text-blue-400" /> Compartilhar</span> do Safari, role para baixo e escolha <span className="font-bold text-white">"Adicionar à Tela de Início"</span>.
          </p>
        ) : (
          <p className="text-[11px] text-zinc-400 font-body leading-relaxed">
            Adicione o NEXDASH à tela inicial do seu celular para usar como aplicativo e acessar com um toque.
          </p>
        )}

        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="mt-2 w-full py-1.5 px-3 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white text-[11px] font-bold transition-all shadow-md shadow-[#e13a40]/15"
          >
            Instalar Agora
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded-lg hover:bg-zinc-900 shrink-0 self-start transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
