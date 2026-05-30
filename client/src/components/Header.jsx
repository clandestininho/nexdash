import React, { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, Sun, Moon, Globe, ChevronDown, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { getStageColor, getStageLabel } from '../lib/stages';
import { formatRelativeTime } from '../lib/utils';
import { useTranslation } from '../lib/i18n';

export default function Header() {
  const { lang, t, setLanguage } = useTranslation();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [userName, setUserName] = useState('Gleison');
  const [aiCredits, setAiCredits] = useState(150);
  const [goalAchieved, setGoalAchieved] = useState(0);
  const [goalTarget, setGoalTarget] = useState(10000);
  const [currency, setCurrency] = useState('BRL');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Real-time notifications popover states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

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

  // Fetch initial notifications log on mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiFetch('/api/log');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setNotifications(list);

          // Check if there are any unread notifications since last read timestamp
          const lastReadTime = localStorage.getItem('notifications_last_read_time') || '0';
          const hasNew = list.some(n => new Date(n.created_at || n.timestamp).getTime() > parseInt(lastReadTime));
          setHasUnread(hasNew);
        }
      } catch (err) {
        console.error('[Header:Notifications] Failed to load initial logs:', err);
      }
    };
    fetchLogs();
  }, []);

  // Sync real-time classifications via socket
  useSocket('classification:new', (data) => {
    const entry = data.entry || data;
    if (entry) {
      setNotifications(prev => [entry, ...prev]);
      setHasUnread(true);

      // Play a premium visual-audio chime notification sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
        audio.volume = 0.25;
        audio.play().catch(() => {});
      } catch {}
    }
  });

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.name) {
        setUserName(storedUser.name);
      }
    } catch {}

    const loadSettingsAndKPIs = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            if (data.dashboard_monthly_goal) {
              setGoalTarget(parseFloat(data.dashboard_monthly_goal) || 10000);
            }
            if (data.profile_moeda) {
              setCurrency(data.profile_moeda);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching settings in Header:', err);
      }
      
      try {
        const storedTxs = localStorage.getItem('dgflow_transactions');
        if (storedTxs) {
          const txs = JSON.parse(storedTxs);
          const total = txs
            .filter(tx => tx.type === 'income' && tx.status === 'received')
            .reduce((sum, tx) => sum + tx.amount, 0);
          setGoalAchieved(total);
        }
      } catch (err) {
        console.error('Error loading transactions in Header:', err);
      }
    };

    loadSettingsAndKPIs();
    
    window.addEventListener('dgflow_transactions_updated', loadSettingsAndKPIs);
    window.addEventListener('dashboard_goal_updated', loadSettingsAndKPIs);
    window.addEventListener('onboarding_completed_event', loadSettingsAndKPIs);
    
    return () => {
      window.removeEventListener('dgflow_transactions_updated', loadSettingsAndKPIs);
      window.removeEventListener('dashboard_goal_updated', loadSettingsAndKPIs);
      window.removeEventListener('onboarding_completed_event', loadSettingsAndKPIs);
    };
  }, []);

  const getInitialsColor = (name) => {
    const colors = [
      'bg-red-500/20 text-red-400 border-red-500/30',
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-pink-500/20 text-pink-400 border-pink-500/30',
    ];
    let sum = 0;
    for (let i = 0; i < (name || '').length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const progressPercentage = Math.min(100, Math.max(0, (goalAchieved / goalTarget) * 100));
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'R$';

  return (
    <header className="h-16 border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left: Search Box Widget */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
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
            <span>{t('revenue_goal')}</span>
            <span className="text-zinc-500">{currencySymbol} {goalAchieved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {currencySymbol} {goalTarget.toLocaleString('pt-BR')}</span>
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
          <span className="text-[10px] tracking-wider uppercase font-body">{aiCredits} {t('ai_credits')}</span>
        </div>

        {/* Notification Bell with interactive dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                setHasUnread(false);
                localStorage.setItem('notifications_last_read_time', Date.now().toString());
              }
            }}
            className={`relative p-1.5 rounded-lg transition-all ${
              showNotifications 
                ? 'bg-zinc-900 text-white' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1a1a]'
            }`}
            title="Centro de Notificações"
          >
            <Bell className="h-4.5 w-4.5" />
            {hasUnread && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#e13a40] rounded-full animate-pulse" />
            )}
          </button>

          {/* Premium Glassmorphic Dropdown Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-96 bg-[#0c0c0e]/95 border border-[#1f1f23] rounded-2xl shadow-2xl backdrop-blur-md z-50 overflow-hidden animate-slide-down">
              
              {/* Header */}
              <div className="p-4 border-b border-[#1f1f23] flex items-center justify-between bg-[#08080a]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#e13a40] animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Histórico de Triagem</span>
                </div>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => {
                      setHasUnread(false);
                      localStorage.setItem('notifications_last_read_time', Date.now().toString());
                      setShowNotifications(false);
                    }}
                    className="text-[10px] font-bold text-[#e13a40] hover:text-red-400 flex items-center gap-0.5 hover:underline"
                  >
                    <Check className="h-3 w-3" />
                    <span>{t('read_notifications')}</span>
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#1f1f23] scrollbar-thin">
                {notifications.length > 0 ? (
                  notifications.map((log, idx) => {
                    const fromColor = getStageColor(log.from_stage || log.old_stage) || '#9E9E9E';
                    const toColor = getStageColor(log.to_stage || log.new_stage) || '#e13a40';
                    const initials = (log.contact_name || 'S').slice(0, 2).toUpperCase();
                    
                    return (
                      <div key={log.id || idx} className="p-3.5 hover:bg-zinc-900/30 transition-colors flex gap-3 text-left">
                        {/* Avatar */}
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-[10px] border flex-shrink-0 relative ${getInitialsColor(log.contact_name)}`}>
                          {initials}
                        </div>

                        {/* Content details */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate leading-none">
                              {log.contact_name || 'Lead Anônimo'}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {formatRelativeTime(log.created_at || log.timestamp)}
                            </span>
                          </div>

                          {/* Stage Transition tags */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span 
                              className="text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wider font-mono border"
                              style={{ 
                                color: fromColor, 
                                borderColor: `${fromColor}25`,
                                backgroundColor: `${fromColor}08`
                              }}
                            >
                              {getStageLabel(log.from_stage || log.old_stage) || 'Entrada'}
                            </span>
                            <ChevronRight className="h-2.5 w-2.5 text-zinc-650 shrink-0" />
                            <span 
                              className="text-[8px] px-1 py-0.2 rounded font-bold uppercase tracking-wider font-mono border"
                              style={{ 
                                color: toColor, 
                                borderColor: `${toColor}25`,
                                backgroundColor: `${toColor}08`
                              }}
                            >
                              {getStageLabel(log.to_stage || log.new_stage)}
                            </span>
                          </div>

                          {/* IA justification reason */}
                          {log.reason && (
                            <p className="text-[10px] text-zinc-400 leading-normal font-body italic border-l border-zinc-800 pl-2 bg-black/10 p-1.5 rounded mt-1 line-clamp-2">
                              "{log.reason}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* Empty state */
                  <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 opacity-50">
                    <AlertCircle className="h-6 w-6 text-zinc-650" />
                    <span className="text-[11px] text-zinc-500 font-body">{t('no_recent_notifications')}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 border-t border-[#1f1f23] bg-[#08080a] text-center shrink-0">
                <a 
                  href="/log" 
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] text-zinc-400 hover:text-white font-bold tracking-wide uppercase hover:underline block font-body"
                >
                  {t('view_logs')}
                </a>
              </div>

            </div>
          )}
        </div>

        {/* Language selector */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1.5 p-1 px-2 rounded-lg hover:bg-[#1a1a1a] text-zinc-400 hover:text-zinc-100 text-xs font-medium transition-all cursor-pointer"
          >
            <span className="mr-0.5">{lang === 'EN' ? '🇺🇸' : lang === 'ES' ? '🇪🇸' : lang === 'PT_PT' ? '🇵🇹' : '🇧🇷'}</span>
            <span className="text-[10px] font-bold">{lang === 'PT_BR' ? 'PT-BR' : lang === 'PT_PT' ? 'PT-PT' : lang}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          
          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-[#0c0c0e]/95 border border-[#1f1f23] rounded-xl shadow-2xl backdrop-blur-md z-50 overflow-hidden animate-slide-down">
              <div className="py-1 divide-y divide-[#1f1f23]/30">
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('PT_BR');
                    setShowLangDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-zinc-900 transition-colors cursor-pointer ${lang === 'PT_BR' ? 'text-[#e13a40] font-bold bg-zinc-900/40' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <span>🇧🇷</span>
                  <span>PT-BR (Brasil)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('PT_PT');
                    setShowLangDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-zinc-900 transition-colors cursor-pointer ${lang === 'PT_PT' ? 'text-[#e13a40] font-bold bg-zinc-900/40' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <span>🇵🇹</span>
                  <span>PT-PT (Portugal)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('EN');
                    setShowLangDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-zinc-900 transition-colors cursor-pointer ${lang === 'EN' ? 'text-[#e13a40] font-bold bg-zinc-900/40' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <span>🇺🇸</span>
                  <span>English</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('ES');
                    setShowLangDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-zinc-900 transition-colors cursor-pointer ${lang === 'ES' ? 'text-[#e13a40] font-bold bg-zinc-900/40' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  <span>🇪🇸</span>
                  <span>Español</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1a1a] transition-all"
          title={theme === 'dark' ? t('change_light_theme') : t('change_dark_theme')}
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
