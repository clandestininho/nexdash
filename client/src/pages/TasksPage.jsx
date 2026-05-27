import React, { useState } from 'react';
import { CheckSquare, Calendar, Plus, Grid, List, Sparkles, CheckCircle2, Clock, Play, Instagram, Linkedin, Youtube, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('board');
  
  // Mock internal operational tasks
  const [boardTasks, setBoardTasks] = useState({
    'todo': [
      { id: 1, title: 'Corrigir delay no socket de mensagens', priority: 'Alta', pColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20', desc: 'Sincronização imediata de balões WhatsApp no painel.', user: 'Gleison', done: 0, total: 3 },
      { id: 2, title: 'Redigir termos de privacidade da IA', priority: 'Baixa', pColor: 'text-zinc-400 bg-zinc-800/10 border-zinc-700/20', desc: 'Documentar política de privacidade de dados Baileys.', user: 'Ana', done: 1, total: 1 },
    ],
    'doing': [
      { id: 3, title: 'Ajustar layout AMOLED global', priority: 'Alta', pColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20', desc: 'Overhaul visual dos cartões e tabelas no NEXDASH.', user: 'Vitor', done: 3, total: 5 },
    ],
    'review': [
      { id: 4, title: 'Subir build de homologação v1.2', priority: 'Média', pColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'Validar build em ambiente VPS com banco isolado.', user: 'Gleison', done: 2, total: 2 },
    ],
    'done': [
      { id: 5, title: 'Conexão via QR Code Baileys', priority: 'Alta', pColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20', desc: 'Ajustar escuta de eventos socket.io no server side.', user: 'Vitor', done: 4, total: 4 },
    ]
  });

  // Mock social media contents
  const [contents, setContents] = useState([
    { id: 1, title: 'Reels: Bastidores da refatoração AMOLED', platform: 'Instagram', pIcon: Instagram, pColor: 'text-pink-400', date: '24/05/2026', status: 'Programado', statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 2, title: 'Artigo: Como usamos IA no CRM de Vendas', platform: 'LinkedIn', pIcon: Linkedin, pColor: 'text-blue-400', date: '26/05/2026', status: 'Em Edição', statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 3, title: 'Vídeo: Demo do dgflow com IA integrada', platform: 'YouTube', pIcon: Youtube, pColor: 'text-red-500', date: '30/05/2026', status: 'Roteirizado', statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  ]);

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-1 bg-[#e13a40]/10 rounded-lg">
              <CheckSquare className="h-6 w-6 text-[#e13a40]" />
            </div>
            Gestão Operacional de Tarefas
          </h1>
          <p className="text-sm text-zinc-400 font-body mt-1">
            Quadro operacional da equipe interna de desenvolvimento e cronograma de marketing digital.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Criar novo cartão de tarefa...")}
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
            Criar Cartão
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-900 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'board'
              ? 'border-[#e13a40] text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Grid className="h-4 w-4" />
          Quadro Operacional
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'content'
              ? 'border-[#e13a40] text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Calendário de Conteúdos
        </button>
      </div>

      {/* TAB CONTENT: BOARD */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
          
          {/* Column: To Do */}
          <div className="flex-shrink-0 min-w-[250px] bg-[#0c0c0e] border border-zinc-900/80 rounded-xl p-3 flex flex-col space-y-3">
            <div className="flex justify-between items-center px-1 border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-zinc-600" />
                A Fazer
              </span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded-full">
                {boardTasks.todo.length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-none pr-0.5">
              {boardTasks.todo.map((task) => (
                <div key={task.id} className="bg-zinc-950/80 hover:bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 space-y-2 hover:border-zinc-800 transition-all cursor-grab">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-semibold text-zinc-100 hover:text-[#e13a40] leading-snug">{task.title}</h4>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-body">{task.desc}</p>
                  <div className="flex justify-between items-center pt-1.5 border-t border-zinc-900/50 text-[9px]">
                    <span className={`px-2 py-0.5 rounded border ${task.pColor} font-semibold uppercase`}>{task.priority}</span>
                    <span className="text-zinc-500 font-mono font-medium">{task.done}/{task.total} sub-tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Doing */}
          <div className="flex-shrink-0 min-w-[250px] bg-[#0c0c0e] border border-zinc-900/80 rounded-xl p-3 flex flex-col space-y-3">
            <div className="flex justify-between items-center px-1 border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Desenvolvimento
              </span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded-full">
                {boardTasks.doing.length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-none pr-0.5">
              {boardTasks.doing.map((task) => (
                <div key={task.id} className="bg-zinc-950/80 hover:bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 space-y-2 hover:border-zinc-800 transition-all cursor-grab">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-semibold text-zinc-100 hover:text-[#e13a40] leading-snug">{task.title}</h4>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-body">{task.desc}</p>
                  <div className="flex justify-between items-center pt-1.5 border-t border-zinc-900/50 text-[9px]">
                    <span className={`px-2 py-0.5 rounded border ${task.pColor} font-semibold uppercase`}>{task.priority}</span>
                    <span className="text-zinc-500 font-mono font-medium">{task.done}/{task.total} sub-tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Review */}
          <div className="flex-shrink-0 min-w-[250px] bg-[#0c0c0e] border border-zinc-900/80 rounded-xl p-3 flex flex-col space-y-3">
            <div className="flex justify-between items-center px-1 border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Revisão Interna
              </span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded-full">
                {boardTasks.review.length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-none pr-0.5">
              {boardTasks.review.map((task) => (
                <div key={task.id} className="bg-zinc-950/80 hover:bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 space-y-2 hover:border-zinc-800 transition-all cursor-grab">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-semibold text-zinc-100 hover:text-[#e13a40] leading-snug">{task.title}</h4>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-body">{task.desc}</p>
                  <div className="flex justify-between items-center pt-1.5 border-t border-zinc-900/50 text-[9px]">
                    <span className={`px-2 py-0.5 rounded border ${task.pColor} font-semibold uppercase`}>{task.priority}</span>
                    <span className="text-zinc-500 font-mono font-medium">{task.done}/{task.total} sub-tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column: Done */}
          <div className="flex-shrink-0 min-w-[250px] bg-[#0c0c0e] border border-zinc-900/80 rounded-xl p-3 flex flex-col space-y-3">
            <div className="flex justify-between items-center px-1 border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Concluído
              </span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded-full">
                {boardTasks.done.length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-20rem)] scrollbar-none pr-0.5">
              {boardTasks.done.map((task) => (
                <div key={task.id} className="bg-zinc-950/80 hover:bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 space-y-2 hover:border-zinc-800 transition-all opacity-70">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-semibold text-zinc-400 line-through leading-snug">{task.title}</h4>
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-relaxed font-body line-through">{task.desc}</p>
                  <div className="flex justify-between items-center pt-1.5 border-t border-zinc-900/50 text-[9px]">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 font-semibold uppercase">DONE</span>
                    <span className="text-zinc-500 font-mono font-medium">{task.done}/{task.total} sub-tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CONTENTS */}
      {activeTab === 'content' && (
        <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/50 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Fila de Produção (Conteúdo)</th>
                  <th className="px-6 py-4">Rede Social</th>
                  <th className="px-6 py-4">Data Planejada</th>
                  <th className="px-6 py-4">Status Atual</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-sm">
                {contents.map((c) => {
                  const PlatformIcon = c.pIcon;
                  return (
                    <tr key={c.id} className="hover:bg-zinc-900/20 transition-all">
                      <td className="px-6 py-4 font-semibold text-white">
                        {c.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-zinc-300 font-body">
                          <PlatformIcon className={`h-4 w-4 ${c.pColor}`} />
                          {c.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-400 text-xs">
                        {c.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${c.statusColor}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5 bg-zinc-950">
                          <span>Editar</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
