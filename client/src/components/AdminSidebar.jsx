import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logo from '../logo.png';
import {
  LayoutDashboard,
  Users,
  Cpu,
  ArrowLeftRight,
  LogOut,
  Shield,
  Activity
} from 'lucide-react';

export default function AdminSidebar() {
  const [adminName, setAdminName] = useState('Administrador');
  const [adminEmail, setAdminEmail] = useState('admin@nexdash.com');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        if (storedUser.name) setAdminName(storedUser.name);
        if (storedUser.email) setAdminEmail(storedUser.email);
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('onboarding_completed');
    navigate('/login');
  };

  const navItems = [
    { 
      path: '/admin', 
      label: 'Visão Geral', 
      icon: LayoutDashboard,
      exact: true
    },
    { 
      path: '/admin/subscribers', 
      label: 'Assinantes', 
      icon: Users,
      exact: false
    },
    { 
      path: '/admin/automations', 
      label: 'Fila de Alertas', 
      icon: Cpu,
      exact: false
    }
  ];

  return (
    <aside className="w-64 border-r border-[#1f1f1f] bg-[#070708] flex flex-col fixed h-screen left-0 top-0 z-40 select-none">
      
      {/* Sidebar Logo Header */}
      <div className="p-6 border-b border-[#1f1f1f] flex items-center gap-3">
        <div className="relative group">
          <div className="absolute -inset-1 bg-[#e13a40] rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300" />
          <img 
            src={logo} 
            alt="NEXDASH Admin Logo" 
            className="relative h-8 w-8 object-contain drop-shadow-[0_0_8px_rgba(225,58,64,0.3)]"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-md font-black tracking-wider text-white">NEXDASH</span>
          <span className="text-xs font-extrabold tracking-wider text-[#e13a40] uppercase -mt-0.5 flex items-center gap-1">
            <Shield className="h-2.5 w-2.5 fill-[#e13a40]/20" /> SAAS ADMIN
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
          Painel de Controle
        </div>

        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#e13a40]/15 to-[#e13a40]/5 border-l-2 border-[#e13a40] text-white font-bold drop-shadow-[0_0_6px_rgba(225,58,64,0.1)]'
                  : 'text-zinc-450 hover:bg-[#121214] hover:text-zinc-100'
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 shrink-0 transition-transform ${
                isActive ? 'text-[#e13a40] scale-105' : 'text-zinc-500'
              }`} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Separator */}
        <div className="h-px bg-[#1f1f1f] my-6 mx-3" />

        <div className="px-3 mb-2 text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
          Retorno
        </div>

        {/* Back to Client App Portal Route */}
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide text-zinc-400 hover:bg-[#121214] hover:text-zinc-100 transition-all"
        >
          <ArrowLeftRight className="h-4.5 w-4.5 text-zinc-550" />
          <span>Voltar ao CRM</span>
        </NavLink>
      </nav>

      {/* Admin Profile Details at Sidebar Bottom */}
      <div className="p-4 border-t border-[#1f1f1f] bg-[#0a0a0c]/60 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#e13a40] to-orange-600 flex items-center justify-center font-bold text-white text-xs select-none shadow-[0_0_12px_rgba(225,58,64,0.2)]">
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-white truncate leading-none">{adminName}</span>
            <span className="text-xs text-zinc-400 truncate mt-1">{adminEmail}</span>
          </div>
        </div>

        {/* Quick actions row */}
        <div className="grid grid-cols-1 gap-2 pt-1 border-t border-[#1f1f1f]/50">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2 rounded-md bg-[#121214] hover:bg-[#e13a40]/10 border border-zinc-800 hover:border-[#e13a40]/30 text-xs font-bold text-zinc-300 hover:text-[#e13a40] uppercase tracking-wider transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>

    </aside>
  );
}
