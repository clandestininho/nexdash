import React, { useState, useEffect } from 'react';
import { Menu, Shield, Sparkles, Smartphone, CheckCircle, AlertTriangle, XCircle, Globe, ChevronDown } from 'lucide-react';
import { socket } from '../lib/socket';
import { apiFetch } from '../lib/api';

export default function AdminHeader() {
  const [userName, setUserName] = useState('Administrador');
  const [waStatus, setWaStatus] = useState('disconnected');
  const [waPhone, setWaPhone] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.name) {
        setUserName(storedUser.name);
      }
    } catch {}

    // Check active WhatsApp session status
    const checkWaStatus = async () => {
      try {
        const res = await apiFetch('/api/whatsapp/status');
        if (res.ok) {
          const data = await res.json();
          setWaStatus(data.status || 'disconnected');
          if (data.phoneNumber) setWaPhone(data.phoneNumber);
        }
      } catch (err) {
        console.error('[AdminHeader] Error fetching WhatsApp status:', err);
      }
    };

    checkWaStatus();

    // Socket.io listeners
    const handleStatus = (data) => {
      setWaStatus(data.status || 'disconnected');
      if (data.phoneNumber) setWaPhone(data.phoneNumber);
    };

    const handleConnected = (data) => {
      setWaStatus('connected');
      if (data?.phoneNumber) setWaPhone(data.phoneNumber);
    };

    const handleDisconnected = () => {
      setWaStatus('disconnected');
      setWaPhone(null);
    };

    socket.on('whatsapp:status', handleStatus);
    socket.on('whatsapp:connected', handleConnected);
    socket.on('whatsapp:disconnected', handleDisconnected);

    return () => {
      socket.off('whatsapp:status', handleStatus);
      socket.off('whatsapp:connected', handleConnected);
      socket.off('whatsapp:disconnected', handleDisconnected);
    };
  }, []);

  return (
    <header className="h-16 border-b border-[#1f1f1f] bg-[#070708]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      
      {/* Left Title, Hamburger, and Shield Tag */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'))}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1a1a] lg:hidden shrink-0 transition-all"
          title="Alternar Menu Lateral"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-sm font-extrabold text-white tracking-wide uppercase font-body hidden sm:block">
          SaaS Control Center
        </h1>
        <div className="flex items-center gap-1.5 bg-[#e13a40]/10 border border-[#e13a40]/30 px-2 py-0.5 rounded text-xs font-extrabold text-[#e13a40] tracking-wider uppercase">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          <span>Master Mode</span>
        </div>
      </div>

      {/* Right Telemetry Controls */}
      <div className="flex items-center gap-6">
        
        {/* WhatsApp Server Socket Connectivity Indicator */}
        <div className="flex items-center">
          {waStatus === 'connected' ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 font-bold text-xs tracking-wider uppercase">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>WhatsApp Ativo: {waPhone || 'Conectado'}</span>
            </div>
          ) : waStatus === 'scanning' || waStatus === 'connecting' ? (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-400 font-bold text-xs tracking-wider uppercase animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Aguardando QR Code</span>
            </div>
          ) : (
            <a 
              href="/connect" 
              className="flex items-center gap-1.5 bg-[#e13a40]/10 hover:bg-[#e13a40]/20 border border-[#e13a40]/20 px-3 py-1.5 rounded-full text-[#e13a40] font-bold text-xs tracking-wider uppercase transition-all"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Lembretes Offline (WhatsApp)</span>
            </a>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-[#1f1f1f]" />

        {/* Info label */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded text-zinc-350 text-xs font-semibold">
          <span>IP local:</span>
          <span className="text-zinc-300">127.0.0.1</span>
        </div>

        {/* Language selector */}
        <button className="flex items-center gap-1 p-1 px-2 rounded hover:bg-[#121214] text-zinc-400 hover:text-zinc-100 text-xs font-semibold transition-all">
          <span className="mr-1">🇧🇷</span>
          <span className="text-xs">PT-BR</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 border-l border-[#1f1f1f] pl-4">
          <div className="h-7 w-7 rounded bg-gradient-to-tr from-[#e13a40] to-orange-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </div>

      </div>

    </header>
  );
}
