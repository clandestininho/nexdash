import { useState, useEffect } from 'react';

const translations = {
  PT: {
    // Header
    search_placeholder: "Buscar clientes, leads ou propostas...",
    revenue_goal: "Meta de Receita",
    ai_credits: "CRÉDITOS IA",
    read_notifications: "Lidas",
    no_recent_notifications: "Nenhuma triagem recente no funil",
    view_logs: "Ver Painel de Logs →",
    change_light_theme: "Mudar para Tema Claro",
    change_dark_theme: "Mudar para Tema Escuro",
    // Sidebar
    new_sale: "Nova Venda",
    dashboard: "Dashboard",
    clients: "Clientes",
    pipelines: "Pipelines",
    tools: "Ferramentas",
    ai_agents: "Agentes IA",
    overview: "Visão geral",
    analyst: "Analista",
    copywriter: "Copywriter",
    designer: "Designer",
    tasks: "Tarefas",
    board: "Quadro",
    content: "Conteúdos",
    management_sales: "Gestão & Vendas",
    agenda: "Agenda",
    finance: "Financeiro",
    services: "Serviços",
    proposals: "Orçamentos",
    briefings: "Briefings",
    pages: "Páginas",
    team: "Equipe",
    whatsapp: "WhatsApp",
    chats: "Conversas",
    attendants: "Atendentes",
    automations: "Automações",
    group_monitor: "Monitor de Grupos",
    number_connection: "Conexão Número",
    system: "Sistema",
    classification_logs: "Log de Classificações",
    learning: "Aprendizagem",
    settings: "Configurações",
    all_access_released: "ACESSO TOTAL LIBERADO",
    subscribe_plan: "Assinar Plano",
    upgrade_plan: "Fazer Upgrade",
    log_out: "Sair da conta"
  },
  EN: {
    search_placeholder: "Search clients, leads or proposals...",
    revenue_goal: "Revenue Goal",
    ai_credits: "AI CREDITS",
    read_notifications: "Read",
    no_recent_notifications: "No recent funnel triage",
    view_logs: "View Logs Panel →",
    change_light_theme: "Switch to Light Theme",
    change_dark_theme: "Switch to Dark Theme",
    new_sale: "New Sale",
    dashboard: "Dashboard",
    clients: "Clients",
    pipelines: "Pipelines",
    tools: "Tools",
    ai_agents: "AI Agents",
    overview: "Overview",
    analyst: "Analyst",
    copywriter: "Copywriter",
    designer: "Designer",
    tasks: "Tasks",
    board: "Board",
    content: "Content",
    management_sales: "Management & Sales",
    agenda: "Schedule",
    finance: "Finance",
    services: "Services",
    proposals: "Proposals",
    briefings: "Briefings",
    pages: "Pages",
    team: "Team",
    whatsapp: "WhatsApp",
    chats: "Chats",
    attendants: "Attendants",
    automations: "Automations",
    group_monitor: "Group Monitor",
    number_connection: "Number Connection",
    system: "System",
    classification_logs: "Classification Logs",
    learning: "Learning",
    settings: "Settings",
    all_access_released: "FULL ACCESS ENABLED",
    subscribe_plan: "Subscribe Plan",
    upgrade_plan: "Upgrade Plan",
    log_out: "Log out"
  },
  ES: {
    search_placeholder: "Buscar clientes, leads o propuestas...",
    revenue_goal: "Meta de Ingresos",
    ai_credits: "CRÉDITOS IA",
    read_notifications: "Leídas",
    no_recent_notifications: "Ningún triaje reciente en el embudo",
    view_logs: "Ver Panel de Logs →",
    change_light_theme: "Cambiar a Tema Claro",
    change_dark_theme: "Cambiar a Tema Oscuro",
    new_sale: "Nueva Venta",
    dashboard: "Tablero",
    clients: "Clientes",
    pipelines: "Embudo",
    tools: "Herramientas",
    ai_agents: "Agentes IA",
    overview: "Visión general",
    analyst: "Analista",
    copywriter: "Copywriter",
    designer: "Diseñador",
    tasks: "Tareas",
    board: "Tablero",
    content: "Contenidos",
    management_sales: "Gestión y Ventas",
    agenda: "Agenda",
    finance: "Financiero",
    services: "Servicios",
    proposals: "Presupuestos",
    briefings: "Briefings",
    pages: "Páginas",
    team: "Equipo",
    whatsapp: "WhatsApp",
    chats: "Chats",
    attendants: "Agentes",
    automations: "Automatizaciones",
    group_monitor: "Monitor de Grupos",
    number_connection: "Conexión Número",
    system: "Sistema",
    classification_logs: "Log de Clasificaciones",
    learning: "Aprendizaje",
    settings: "Configuraciones",
    all_access_released: "ACCESO TOTAL LIBERADO",
    subscribe_plan: "Suscribir Plan",
    upgrade_plan: "Actualizar Plan",
    log_out: "Cerrar sesión"
  }
};

export function getLanguage() {
  return localStorage.getItem('nexdash_lang') || 'PT';
}

export function setLanguage(lang) {
  localStorage.setItem('nexdash_lang', lang);
  window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }));
}

export function t(key) {
  const lang = getLanguage();
  return translations[lang]?.[key] || translations['PT']?.[key] || key;
}

export function useTranslation() {
  const [lang, setLangState] = useState(getLanguage());

  useEffect(() => {
    const handleLanguageChange = (e) => {
      setLangState(e.detail);
    };
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  return {
    lang,
    t: (key) => translations[lang]?.[key] || translations['PT']?.[key] || key,
    setLanguage
  };
}
