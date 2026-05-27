import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Eye, 
  X,
  Sparkles,
  Layers,
  CheckSquare,
  DollarSign,
  User,
  LayoutGrid,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { apiFetch } from '../lib/api';

const INITIAL_EVENTS = [
  { id: 'holiday-1', title: 'Dia do Trabalho', date: '2026-05-01', type: 'holiday', category: 'holiday' },
  { id: 'holiday-2', title: 'Dia das Mães', date: '2026-05-10', type: 'holiday', category: 'holiday' },
  { id: 'evt-1', title: 'Entrega Identidade Visual Marina', date: '2026-05-20', time: '14:00', duration: '60 min', category: 'Services', client: 'Marina Sousa', project: 'Identidade Visual', kanbanColumn: 'Revisão', tags: ['Urgente', 'Design'] },
  { id: 'evt-2', title: 'Reunião Alinhamento Construtora', date: '2026-05-23', time: '10:00', duration: '30 min', category: 'Personal', client: 'Construtora Pernambuco', project: 'Consultoria', kanbanColumn: 'Em Andamento', tags: ['Melhoria'] },
  { id: 'evt-3', title: 'Lançamento Faturamento Google', date: '2026-05-18', time: '09:00', duration: '15 min', category: 'Finance', client: 'Google Suite', project: 'Software', kanbanColumn: 'Concluído', tags: ['Bug'] },
  { id: 'evt-4', title: 'Apresentação Protótipo Figma', date: '2026-05-27', time: '16:00', duration: '60 min', category: 'Tasks', client: 'Carlos Silva', project: 'Social Media', kanbanColumn: 'A Fazer', tags: ['Design'] },
];

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 23)); // May 23, 2026
  const [events, setEvents] = useState([]);
  const [activeView, setActiveView] = useState('Mês'); // Mês | Semana | Dia
  
  // Filtering Toggles matching DGFlow Exactly
  const [showFeriados, setShowFeriados] = useState(true);
  const [showTarefasQuadro, setShowTarefasQuadro] = useState(true);
  const [showApenasTarefas, setShowApenasTarefas] = useState(false);
  const [showFinanceiro, setShowFinanceiro] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  // New Appointment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form States (14 production fields)
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtDate, setEvtDate] = useState('2026-05-23');
  const [evtTime, setEvtTime] = useState('09:00');
  const [evtDuration, setEvtDuration] = useState('60 min');
  const [evtLocation, setEvtLocation] = useState('');
  const [evtRepeat, setEvtRepeat] = useState(false);
  const [evtClient, setEvtClient] = useState('Nenhum');
  const [evtProject, setEvtProject] = useState('Nenhum');
  const [evtShowKanban, setEvtShowKanban] = useState(true);
  const [evtKanbanCol, setEvtKanbanCol] = useState('A Fazer');
  const [evtKanbanPos, setEvtKanbanPos] = useState('Topo da coluna');
  const [evtTags, setEvtTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [evtAssignee, setEvtAssignee] = useState('Gleison');
  const [evtGoogleSync, setEvtGoogleSync] = useState(false);

  useEffect(() => {
    const loadEvents = () => {
      const stored = localStorage.getItem('dgflow_events');
      if (stored) {
        setEvents(JSON.parse(stored));
      } else {
        setEvents(INITIAL_EVENTS);
        localStorage.setItem('dgflow_events', JSON.stringify(INITIAL_EVENTS));
      }
    };
    loadEvents();
  }, []);

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem('dgflow_events', JSON.stringify(newEvents));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 4, 23));
  };

  const handleAddTag = (tag) => {
    if (tag && !evtTags.includes(tag)) {
      setEvtTags([...evtTags, tag]);
    }
  };

  const handleRemoveTag = (tag) => {
    setEvtTags(evtTags.filter(t => t !== tag));
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!evtTitle || !evtDate) {
      alert('Por favor, informe ao menos o título e data do compromisso.');
      return;
    }

    const newEvt = {
      id: 'evt-' + Date.now(),
      title: evtTitle,
      description: evtDesc,
      date: evtDate,
      time: evtTime,
      duration: evtDuration,
      location: evtLocation,
      repeat: evtRepeat,
      client: evtClient !== 'Nenhum' ? evtClient : null,
      project: evtProject !== 'Nenhum' ? evtProject : null,
      kanbanColumn: evtShowKanban ? evtKanbanCol : null,
      tags: evtTags,
      assignee: evtAssignee,
      category: evtShowKanban ? 'Tasks' : 'Services'
    };

    saveEvents([...events, newEvt]);
    setIsModalOpen(false);

    // Clear state
    setEvtTitle('');
    setEvtDesc('');
    setEvtLocation('');
    setEvtRepeat(false);
    setEvtTags([]);
    setEvtClient('Nenhum');
    setEvtProject('Nenhum');
  };

  // Generate calendar days for May 2026 grid mapping (May has 31 days, starts on Friday)
  const calendarCells = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 4 = May
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const cells = [];
    
    // Adjacent prefix slots (April days slots styled with 50% opacity, no events)
    const prevMonthDaysTotal = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        dayNumber: prevMonthDaysTotal - i,
        dateString: `${year}-${String(month).padStart(2, '0')}-${String(prevMonthDaysTotal - i).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }
    
    // Active month days slots
    for (let i = 1; i <= totalDays; i++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        dayNumber: i,
        dateString: dayStr,
        isCurrentMonth: true,
        isToday: dayStr === '2026-05-23', // Hardcoded today highlight
      });
    }

    // Suffix adjacent month days slots
    const totalSlots = cells.length;
    const remainingSlots = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
    for (let i = 1; i <= remainingSlots; i++) {
      cells.push({
        dayNumber: i,
        dateString: `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentDate]);

  // Filters list mapping checked category switches row
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Hide completed trigger
      if (hideCompleted && evt.kanbanColumn === 'Concluído') return false;

      // Spacing event categories toggles
      if (evt.type === 'holiday' && !showFeriados) return false;
      if (evt.category === 'Finance' && !showFinanceiro) return false;
      if (evt.category === 'Tasks' && !showTarefasQuadro) return false;
      if (evt.category === 'Services' && showApenasTarefas) return false;
      return true;
    });
  }, [events, showFeriados, showFinanceiro, showTarefasQuadro, showApenasTarefas, hideCompleted]);

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in font-body pb-10">
      
      {/* Title & Subtitle sitting ABOVE the main card wrapper */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Timeline de Projetos</h1>
        <p className="text-sm text-zinc-400 mt-1">Visualização completa de todas as etapas e prazos</p>
      </div>

      {/* Main Unified DGFlow Calendar Card Wrapper */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-2xl p-6 shadow-card space-y-6">
        
        {/* Row 1: View Controls & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          
          {/* Mês, Semana, Dia rounded switch tabs with icons */}
          <div className="flex items-center bg-[#0a0a0a] border border-[#1f1f1f] p-1 rounded-xl">
            <button
              onClick={() => setActiveView('Mês')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'Mês'
                  ? 'bg-[#e13a40] text-white shadow-sm'
                  : 'text-zinc-450 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Mês</span>
            </button>
            
            <button
              onClick={() => setActiveView('Semana')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'Semana'
                  ? 'bg-[#e13a40] text-white shadow-sm'
                  : 'text-zinc-450 hover:text-white'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Semana</span>
            </button>

            <button
              onClick={() => setActiveView('Dia')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeView === 'Dia'
                  ? 'bg-[#e13a40] text-white shadow-sm'
                  : 'text-zinc-455 hover:text-white'
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>Dia</span>
            </button>
          </div>

          {/* Right quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleToday}
              className="px-4 py-2 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white text-xs font-bold transition-all font-body"
            >
              Hoje
            </button>

            <button 
              onClick={() => alert("Para integrar, acesse Configurações -> Integrações e conecte com Google Calendar.")}
              className="p-2.5 rounded-xl border border-[#1f1f1f] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white transition-all flex items-center justify-center"
              title="Conectar Google Calendar"
            >
              <Calendar className="h-4 w-4" />
            </button>

            <button 
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                hideCompleted 
                  ? 'border-[#e13a40]/30 bg-[#e13a40]/5 text-[#e13a40]' 
                  : 'border-[#1f1f1f] bg-[#0a0a0a] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ocultar concluídas</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-primary text-white font-semibold shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-300 h-10 px-4 py-2 gap-2"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="lucide lucide-plus w-4 h-4"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Novo
            </button>
          </div>
        </div>

        {/* Row 2: Month Title & Navigators sitting on their own line */}
        <div className="flex items-center gap-2.5 pt-2">
          <h3 className="text-xl font-bold text-white tracking-tight uppercase font-body pl-0.5 first-letter:uppercase">
            {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          
          <button 
            onClick={() => alert("Seletor de data dropdown...")}
            className="p-2 text-zinc-400 hover:text-white rounded-xl border border-[#1f1f1f] bg-[#0a0a0a] hover:bg-[#1a1a1a] transition-all"
          >
            <Calendar className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-0.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-0.5 ml-1">
            <button onClick={handlePrevMonth} className="p-1 hover:text-white text-zinc-500 hover:bg-[#1a1a1a] rounded transition-all">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleNextMonth} className="p-1 hover:text-white text-zinc-500 hover:bg-[#1a1a1a] rounded transition-all">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Row 3: Filtering switches row with icons & red active switches matching DGFlow Exactly */}
        <div className="flex flex-wrap items-center gap-8 pt-1 pb-2">
          
          {/* Mostrar Feriados */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#e13a40]" />
              <span className="text-sm font-semibold text-zinc-200">Mostrar Feriados</span>
            </div>
            <button
              type="button"
              onClick={() => setShowFeriados(!showFeriados)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                showFeriados ? 'bg-[#e13a40]' : 'bg-[#27272a]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showFeriados ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Tarefas do quadro */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#e13a40]" />
              <span className="text-sm font-semibold text-zinc-200">Tarefas do quadro</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTarefasQuadro(!showTarefasQuadro)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                showTarefasQuadro ? 'bg-[#e13a40]' : 'bg-[#27272a]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showTarefasQuadro ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Apenas tarefas */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-200">Apenas tarefas</span>
            </div>
            <button
              type="button"
              onClick={() => setShowApenasTarefas(!showApenasTarefas)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                showApenasTarefas ? 'bg-[#e13a40]' : 'bg-[#27272a]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showApenasTarefas ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Financeiro */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#e13a40]" />
              <span className="text-sm font-semibold text-zinc-200">Financeiro</span>
            </div>
            <button
              type="button"
              onClick={() => setShowFinanceiro(!showFinanceiro)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                showFinanceiro ? 'bg-[#e13a40]' : 'bg-[#27272a]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  showFinanceiro ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* 3. Calendar Day Grid - Spacing, heights and gap-px border divider pattern */}
        <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#1f1f1f] shadow-sm shrink-0">
          
          {/* Weekday abbreviations */}
          <div className="grid grid-cols-7 gap-px bg-[#1f1f1f]">
            {WEEKDAYS.map(day => (
              <div key={day} className="bg-[#121212] py-3 text-center text-xs font-bold text-zinc-500 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days cell slots set to exactly 120px heights */}
          <div className="grid grid-cols-7 gap-px bg-[#1f1f1f]">
            {calendarCells.map((cell, idx) => {
              const cellDateEvents = filteredEvents.filter(evt => evt.date === cell.dateString);
              
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (cell.isCurrentMonth) {
                      setEvtDate(cell.dateString);
                      setIsModalOpen(true);
                    }
                  }}
                  className={`min-h-[120px] p-2 relative flex flex-col justify-between transition-all select-none ${
                    cell.isCurrentMonth
                      ? cell.isToday
                        ? 'bg-[#e13a40]/5 shadow-[inset_0_0_0_1px_rgba(225,58,64,0.35)] cursor-pointer'
                        : 'bg-[#121212] hover:bg-[#1a1a1a]/30 cursor-pointer'
                      : 'bg-[#121212]/50 opacity-40 pointer-events-none'
                  }`}
                >
                  
                  {/* Top Day layout: Number aligned top-left */}
                  <div className="flex items-center justify-between w-full shrink-0">
                    {cell.isCurrentMonth ? (
                      cell.isToday ? (
                        <div className="h-6 w-6 rounded-full bg-[#e13a40] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {cell.dayNumber}
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-zinc-150 pl-0.5">{cell.dayNumber}</span>
                      )
                    ) : (
                      <span className="text-sm font-semibold text-zinc-600 pl-0.5">{cell.dayNumber}</span>
                    )}
                    
                    {cell.isToday && (
                      <span className="text-[9px] bg-[#e13a40]/15 text-[#e13a40] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Day events stack list (rendered as horizontal color banners) */}
                  <div className="space-y-1 overflow-y-hidden max-h-[82px] pt-1.5 w-full flex-grow">
                    {cell.isCurrentMonth && cellDateEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Compromisso: ${evt.title}\nHorário: ${evt.time || 'Dia Todo'}\nLocal: ${evt.location || 'Não informado'}`);
                        }}
                        className={`rounded px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1.5 transition-all truncate leading-relaxed ${
                          evt.type === 'holiday'
                            ? 'bg-[#e13a40]/10 border border-[#e13a40]/20 text-[#e13a40]'
                            : 'bg-[#e13a40]/15 border-l-2 border-[#e13a40] text-[#e13a40]'
                        }`}
                        title={evt.title}
                      >
                        <Sparkles className="h-3 w-3 flex-shrink-0 text-[#e13a40]" />
                        <span className="truncate">{evt.time ? `${evt.time} - ` : ''}{evt.title}</span>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* MODAL: NOVO COMPROMISSO (14 fields matching DGFlow modal blueprint) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[#0a0a0a] border border-[#1f1f1f] text-white p-6 shadow-2xl relative overflow-hidden h-[90vh] max-h-[660px] flex flex-col">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors z-10"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="shrink-0 pb-4 border-b border-[#1f1f1f]">
              <h2 className="text-base font-bold text-white mb-0.5 flex items-center gap-1.5 font-body">
                <Plus className="h-5 w-5 text-[#e13a40]" />
                Novo Compromisso
              </h2>
              <p className="text-zinc-500 text-xs">Configure prazos, reuniões corporativas ou eventos periódicos.</p>
            </div>

            {/* Scrollable form */}
            <form onSubmit={handleCreateAppointment} className="flex-1 overflow-y-auto py-4 pr-1 space-y-4 scrollbar-thin">
              
              {/* 1. Title */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Título do Compromisso *</label>
                <Input
                  required
                  placeholder="Título do compromisso"
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                />
              </div>

              {/* 2. Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Descrição</label>
                <textarea
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  placeholder="Detalhes do compromisso..."
                  rows="2"
                  className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-2 text-xs text-white placeholder-zinc-650 focus:border-[#e13a40] outline-none"
                />
              </div>

              {/* 3 & 4. Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Data *</label>
                  <Input
                    required
                    type="date"
                    value={evtDate}
                    onChange={(e) => setEvtDate(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Hora *</label>
                  <Input
                    required
                    type="time"
                    value={evtTime}
                    onChange={(e) => setEvtTime(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 font-mono"
                  />
                </div>
              </div>

              {/* 5 & 6. Duration & Location */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Duração</label>
                  <select
                    value={evtDuration}
                    onChange={(e) => setEvtDuration(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                  >
                    <option value="15 min">15 min</option>
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                    <option value="1.5 horas">1.5 horas</option>
                    <option value="2 horas">2 horas</option>
                    <option value="Dia todo">Dia todo</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase">Local</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
                    <Input
                      placeholder="Link de reunião, endereço..."
                      value={evtLocation}
                      onChange={(e) => setEvtLocation(e.target.value)}
                      className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 pl-9"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Repeat Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#1f1f1f] bg-[#1a1a1a]/45">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Repetir compromisso</span>
                  <span className="text-[10px] text-zinc-500">Cria várias ocorrências automaticamente.</span>
                </div>
                <input 
                  type="checkbox"
                  checked={evtRepeat}
                  onChange={(e) => setEvtRepeat(e.target.checked)}
                  className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                />
              </div>

              {/* 8. Relations Vincular */}
              <div className="p-3.5 rounded-xl bg-[#1a1a1a]/30 border border-[#1f1f1f] space-y-3.5">
                <span className="text-[9px] text-[#e13a40] font-bold uppercase tracking-wider block">Vincular a (Opcional)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Cliente</label>
                    <select
                      value={evtClient}
                      onChange={(e) => setEvtClient(e.target.value)}
                      className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                    >
                      <option value="Nenhum">Nenhum</option>
                      <option value="Marina Sousa">Marina Sousa</option>
                      <option value="Construtora Pernambuco">Construtora Pernambuco</option>
                      <option value="Carlos Silva">Carlos Silva</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Projeto</label>
                    <select
                      value={evtProject}
                      onChange={(e) => setEvtProject(e.target.value)}
                      className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                    >
                      <option value="Nenhum">Nenhum</option>
                      <option value="Identidade Visual">Identidade Visual</option>
                      <option value="Consultoria">Consultoria</option>
                      <option value="Social Media">Social Media</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 9 & 10. Kanban details */}
              <div className="p-3.5 rounded-xl bg-[#1a1a1a]/30 border border-[#1f1f1f] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Mostrar no quadro Kanban</span>
                    <span className="text-[10px] text-zinc-500">O compromisso aparece na agenda e como card no quadro de tarefas.</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={evtShowKanban}
                    onChange={(e) => setEvtShowKanban(e.target.checked)}
                    className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                  />
                </div>

                {evtShowKanban && (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase">Coluna / etapa</label>
                      <select
                        value={evtKanbanCol}
                        onChange={(e) => setEvtKanbanCol(e.target.value)}
                        className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                      >
                        <option value="A Fazer">A Fazer</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Revisão">Revisão</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase">Posição</label>
                      <select
                        value={evtKanbanPos}
                        onChange={(e) => setEvtKanbanPos(e.target.value)}
                        className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                      >
                        <option value="Topo da coluna">Topo da coluna</option>
                        <option value="Fim da coluna">Fim da coluna</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 11. Tags suggestion */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput.trim());
                        setTagInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddTag(tagInput.trim());
                      setTagInput('');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#1f1f1f] hover:bg-[#25252b] text-xs font-semibold font-body"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 select-none">
                  {['Urgente', 'Bug', 'Melhoria', 'Design'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTag(t)}
                      className="px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 hover:text-white font-semibold transition-all"
                    >
                      + {t}
                    </button>
                  ))}
                </div>

                {evtTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {evtTags.map(tag => (
                      <span 
                        key={tag}
                        className="bg-[#e13a40]/10 border border-[#e13a40]/30 text-[#e13a40] rounded px-2.5 py-0.5 text-[9px] font-bold flex items-center gap-1 select-none animate-fade-in"
                      >
                        <span>{tag}</span>
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-white font-bold font-mono">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 12. Assignee */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Responsáveis da Equipe</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-500" />
                  <select
                    value={evtAssignee}
                    onChange={(e) => setEvtAssignee(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] py-2.5 pl-9 outline-none focus:border-[#e13a40] font-semibold"
                  >
                    <option value="Gleison">G Gleison</option>
                    <option value="Estúdio Criativo">Estúdio Criativo (Parceiro)</option>
                  </select>
                </div>
              </div>

              {/* 13. Google sync switch */}
              <div className="p-3 rounded-xl bg-[#1a1a1a]/30 border border-[#1f1f1f] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Sincronizar com Google Agenda</span>
                    <span className="text-[10px] text-zinc-500">Conecte sua conta Google para enviar este compromisso ao Google Calendar.</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={evtGoogleSync}
                    onChange={(e) => setEvtGoogleSync(e.target.checked)}
                    className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                  />
                </div>
                {evtGoogleSync && (
                  <span className="text-[10px] text-[#e13a40] font-bold block leading-none font-body">
                    Conectar Google Calendar →
                  </span>
                )}
              </div>

            </form>

            {/* Footer */}
            <div className="shrink-0 pt-4 border-t border-[#1f1f1f] flex items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="py-2.5 px-5 rounded-xl border border-[#1f1f1f] text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-semibold font-body"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleCreateAppointment}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-[#e13a40] hover:from-orange-600 hover:to-[#c52f34] text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-all font-body"
              >
                <span>Criar</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
