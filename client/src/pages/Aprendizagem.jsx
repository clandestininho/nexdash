import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Check, 
  Video, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { apiFetch } from '../lib/api';

export default function Aprendizagem() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);

  // Módulos and Progress States
  const [learningModules, setLearningModules] = useState([
    {
      id: 'm1',
      title: '1. Introdução ao Estúdio NEXDASH',
      desc: 'Aprenda os conceitos básicos da plataforma, navegação e personalização.',
      videos: [
        { id: 'v1_1', title: 'Boas-vindas e Visão Geral', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', desc: 'Conheça o seu novo dashboard corporativo.', duration: '5 min' },
        { id: 'v1_2', title: 'Configurando seu Perfil e Identidade', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', desc: 'Como ajustar cores, logotipo e localização padrão.', duration: '8 min' }
      ]
    },
    {
      id: 'm2',
      title: '2. CRM e Funil de Vendas',
      desc: 'Como cadastrar clientes, gerenciar contatos e fechar contratos premium.',
      videos: [
        { id: 'v2_1', title: 'Dominando o Quadro Kanban', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', desc: 'Gestão de leads comerciais sem mistérios.', duration: '12 min' },
        { id: 'v2_2', title: 'Integrações de Agendas de Reuniões', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', desc: 'Como conectar o Google Calendar e Apple Calendar para evitar conflitos de horário.', duration: '7 min' }
      ]
    }
  ]);
  const [completedVideos, setCompletedVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [expandedModules, setExpandedModules] = useState({ 'm1': true });

  // Admin CRUD states
  const [newModTitle, setNewModTitle] = useState('');
  const [newModDesc, setNewModDesc] = useState('');
  const [newVidTitle, setNewVidTitle] = useState('');
  const [newVidUrl, setNewVidUrl] = useState('');
  const [newVidDesc, setNewVidDesc] = useState('');
  const [newVidDuration, setNewVidDuration] = '5 min';
  const [selectedModId, setSelectedModId] = useState('');
  const [newVidDurationState, setNewVidDurationState] = useState('5 min');

  // Load user from localStorage
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setCurrentUser(storedUser);
    } catch (e) {}
  }, []);

  // Fetch learning data and modules from settings
  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setUserSettings(data);
          if (data.learning_modules) {
            setLearningModules(JSON.parse(data.learning_modules));
          }
          if (data.learning_completed_videos) {
            setCompletedVideos(JSON.parse(data.learning_completed_videos));
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados de aprendizagem:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLearningData();
  }, []);

  const handleSaveModules = async (updated) => {
    setLearningModules(updated);
    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learning_modules: JSON.stringify(updated)
        })
      });
    } catch (err) {
      console.error('Erro ao salvar módulos:', err);
    }
  };

  const toggleVideoCompleted = async (videoId) => {
    let updated;
    if (completedVideos.includes(videoId)) {
      updated = completedVideos.filter(id => id !== videoId);
    } else {
      updated = [...completedVideos, videoId];
    }
    setCompletedVideos(updated);
    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learning_completed_videos: JSON.stringify(updated)
        })
      });
    } catch (err) {
      console.error('Erro ao salvar progresso:', err);
    }
  };

  const email = currentUser?.email || '';
  const role = currentUser?.role || 'user';
  const nome = currentUser?.name || '';
  const isAdmin = email.includes('gleison') || email.includes('admin') || nome.toLowerCase().includes('gleison') || role === 'admin';

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-zinc-400 font-body">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#e13a40]" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">Carregando Módulos de Aprendizagem...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-body pb-10 text-zinc-100">
      
      {/* Header / Premium Status Card */}
      <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white relative overflow-hidden shadow-card shadow-glow/5">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none select-none">
          <GraduationCap className="h-44 w-44 text-[#e13a40]" />
        </div>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <span className="bg-[#e13a40]/10 border border-[#e13a40]/25 text-[#e13a40] font-black px-2.5 py-1 rounded text-[9px] uppercase tracking-wider inline-block">
                Treinamento de Equipe
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-[#e13a40]" />
                <span>Portal de Aprendizagem & Playbooks</span>
              </h3>
              <p className="text-[11px] text-zinc-450 max-w-xl leading-relaxed">
                Aprenda a operar todas as engrenagens do nosso sistema de CRM, faturamento automatizado e fluxos de design/marketing. Assista aos módulos rápidos abaixo para dominar a plataforma!
              </p>
            </div>

            {/* Dynamic Progress Indicator */}
            {(() => {
              const totalVideos = learningModules.reduce((acc, curr) => acc + (curr.videos?.length || 0), 0);
              const completedCount = completedVideos.filter(vidId => 
                learningModules.some(m => m.videos?.some(v => v.id === vidId))
              ).length;
              const percent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;
              return (
                <div className="flex items-center gap-4 bg-[#121215] border border-zinc-900 rounded-2xl p-4 shrink-0 min-w-[220px]">
                  <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 h-full w-full -rotate-90">
                      <circle cx="24" cy="24" r="20" className="stroke-zinc-800 fill-none" strokeWidth="3" />
                      <circle cx="24" cy="24" r="20" className="stroke-[#e13a40] fill-none" strokeWidth="3" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * percent) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="text-[10px] font-black text-white">{percent}%</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block tracking-wider">Seu Progresso</span>
                    <span className="text-xs font-black text-white block">{completedCount} / {totalVideos} Concluídos</span>
                    <span className="text-[9px] text-zinc-400 font-medium">Aulas de capacitação</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Split Learning Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Modules List Accordion (3/5 width) */}
        <div className="lg:col-span-3 space-y-4">
          {learningModules.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#1f1f23] bg-[#0c0c0e] text-center space-y-3">
              <GraduationCap className="h-10 w-10 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">Nenhum módulo cadastrado</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">Adicione módulos utilizando o painel administrativo de treinamentos no final desta tela.</p>
            </div>
          ) : (
            learningModules.map((module) => {
              const isExpanded = !!expandedModules[module.id];
              return (
                <div key={module.id} className="rounded-2xl border border-[#1f1f23] bg-[#0c0c0e] overflow-hidden transition-all duration-300">
                  {/* Module Accordion Header */}
                  <div 
                    onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/30 transition-colors select-none"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white tracking-tight uppercase flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#e13a40]"></span>
                        {module.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 max-w-md">{module.desc}</p>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Module Videos list */}
                  {isExpanded && (
                    <div className="border-t border-[#1f1f23] divide-y divide-zinc-900 bg-zinc-950/20">
                      {(!module.videos || module.videos.length === 0) ? (
                        <p className="p-4 text-[10px] text-zinc-600 font-medium">Nenhuma aula cadastrada neste módulo ainda.</p>
                      ) : (
                        module.videos.map((vid) => {
                          const isCompleted = completedVideos.includes(vid.id);
                          const isCurrent = activeVideo?.id === vid.id;
                          return (
                            <div 
                              key={vid.id}
                              className={`p-3.5 flex items-start justify-between gap-4 hover:bg-zinc-900/40 transition-colors cursor-pointer group ${
                                isCurrent ? 'bg-[#e13a40]/5' : ''
                              }`}
                              onClick={() => setActiveVideo(vid)}
                            >
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Completion checkbox */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVideoCompleted(vid.id);
                                  }}
                                  className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'
                                  }`}
                                >
                                  {isCompleted && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                </button>

                                <div className="space-y-1 min-w-0">
                                  <span className={`text-[11px] font-bold block truncate transition-colors ${
                                    isCurrent ? 'text-[#e13a40]' : 'text-zinc-250 group-hover:text-white'
                                  }`}>
                                    {vid.title}
                                  </span>
                                  <p className="text-[10px] text-zinc-500 truncate leading-relaxed max-w-sm">{vid.desc}</p>
                                  <span className="inline-flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold bg-[#121215] border border-zinc-900 rounded px-1.5 py-0.5">
                                    <Video className="h-2.5 w-2.5 text-[#e13a40]" />
                                    {vid.duration || '5 min'}
                                  </span>
                                </div>
                              </div>

                              {/* Play button */}
                              <button 
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                                  isCurrent
                                    ? 'bg-[#e13a40] text-white'
                                    : 'bg-zinc-900 text-zinc-450 group-hover:text-white group-hover:bg-zinc-800'
                                }`}
                              >
                                {isCurrent ? 'Tocando' : 'Assistir'}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Player & Active Details (2/5 width) */}
        <div className="lg:col-span-2 space-y-6">
          {activeVideo ? (
            <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white overflow-hidden shadow-2xl">
              <CardHeader className="p-4 border-b border-[#1f1f23] bg-zinc-950/30">
                <CardTitle className="text-xs font-black uppercase text-zinc-450 flex items-center gap-2">
                  <Video className="h-4 w-4 text-[#e13a40]" />
                  <span>Player Corporativo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Video Player Box */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#1f1f23] bg-black shadow-lg">
                  {(() => {
                    const url = activeVideo.url || '';
                    const isYoutube = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('youtube-nocookie.com');
                    if (isYoutube) {
                      let videoId = '';
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = url.match(regExp);
                      if (match && match[2].length === 11) {
                        videoId = match[2];
                      }
                      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                      return (
                        <iframe 
                          className="absolute inset-0 w-full h-full"
                          src={embedUrl}
                          title={activeVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      );
                    } else {
                      return (
                        <video 
                          src={url} 
                          controls 
                          className="absolute inset-0 w-full h-full bg-black object-contain"
                        />
                      );
                    }
                  })()}
                </div>

                {/* Video info & toggle */}
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white leading-normal">{activeVideo.title}</h4>
                    <p className="text-[10px] text-zinc-450 leading-relaxed bg-[#121215] border border-zinc-900 p-3 rounded-xl">{activeVideo.desc}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-xs">
                    <span className="text-[10px] text-zinc-550 font-bold uppercase">Duração: {activeVideo.duration || 'N/A'}</span>
                    <button
                      type="button"
                      onClick={() => toggleVideoCompleted(activeVideo.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        completedVideos.includes(activeVideo.id)
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-[#e13a40] hover:bg-[#c52f34] text-white'
                      }`}
                    >
                      {completedVideos.includes(activeVideo.id) ? (
                        <>
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>Concluído!</span>
                        </>
                      ) : (
                        <span>Marcar Concluído</span>
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-[#0c0c0e]/30 space-y-4">
              <div className="h-12 w-12 rounded-full bg-[#e13a40]/10 border border-[#e13a40]/30 text-[#e13a40] flex items-center justify-center mx-auto shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black text-white block uppercase tracking-wider">Aguardando Player</span>
                <p className="text-[10px] text-zinc-550 max-w-xs mx-auto leading-normal">
                  Selecione qualquer aula na listagem lateral para abrir o player corporativo de vídeo do sistema.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* AREA DO ADMINISTRADOR: GESTÃO DE TREINAMENTOS */}
      {isAdmin && (
        <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white mt-10">
          <CardHeader className="p-5 border-b border-[#1f1f23] bg-zinc-950/30">
            <CardTitle className="text-xs font-black uppercase text-zinc-450 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#e13a40]" />
              <span>Painel Administrativo: Gestão de Aulas</span>
            </CardTitle>
            <CardDescription className="text-[10px] text-zinc-500 font-body">Este painel só é visível para administradores da plataforma e permite criar e gerenciar a grade de playbooks.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-6">
            
            {/* Two Column Form Wizard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Módulo Card */}
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 space-y-3.5">
                <span className="text-[9px] text-[#e13a40] font-black uppercase tracking-wider block">Criar Novo Módulo</span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Título do Módulo *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 3. Dominando o Funil CRM"
                      value={newModTitle}
                      onChange={(e) => setNewModTitle(e.target.value)}
                      className="w-full bg-[#121215] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#e13a40]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Descrição *</label>
                    <textarea 
                      placeholder="Ex: Aprenda sobre kanban, tags e prospecção..."
                      value={newModDesc}
                      onChange={(e) => setNewModDesc(e.target.value)}
                      rows="2"
                      className="w-full bg-[#121215] border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#e13a40]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newModTitle || !newModDesc) {
                      alert('Preencha título e descrição do módulo.');
                      return;
                    }
                    const newMod = {
                      id: 'm-' + Date.now(),
                      title: newModTitle,
                      desc: newModDesc,
                      videos: []
                    };
                    const updated = [...learningModules, newMod];
                    handleSaveModules(updated);
                    setNewModTitle('');
                    setNewModDesc('');
                  }}
                  className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all"
                >
                  Criar Módulo
                </button>
              </div>

              {/* Add Video Card */}
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-4 space-y-3.5">
                <span className="text-[9px] text-[#e13a40] font-black uppercase tracking-wider block">Adicionar Aula ao Módulo</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Módulo de Destino *</label>
                    <select
                      value={selectedModId}
                      onChange={(e) => setSelectedModId(e.target.value)}
                      className="w-full bg-[#121215] text-white text-xs rounded-lg border border-zinc-800 p-2 outline-none focus:border-[#e13a40]"
                    >
                      <option value="">-- Selecione o módulo --</option>
                      {learningModules.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Título da Aula *</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Primeiros Passos"
                      value={newVidTitle}
                      onChange={(e) => setNewVidTitle(e.target.value)}
                      className="w-full bg-[#121215] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#e13a40]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Duração (Ex: 10 min)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 8 min"
                      value={newVidDurationState}
                      onChange={(e) => setNewVidDurationState(e.target.value)}
                      className="w-full bg-[#121215] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#e13a40]"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Link do Vídeo (YouTube, Vimeo ou MP4) *</label>
                    <input 
                      type="text" 
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={newVidUrl}
                      onChange={(e) => setNewVidUrl(e.target.value)}
                      className="w-full bg-[#121215] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#e13a40]"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] text-zinc-500 font-bold uppercase">Descrição da Aula *</label>
                    <input 
                      type="text" 
                      placeholder="Breve resumo da aula de capacitação..."
                      value={newVidDesc}
                      onChange={(e) => setNewVidDesc(e.target.value)}
                      className="w-full bg-[#121215] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-700 outline-none focus:border-[#e13a40]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedModId || !newVidTitle || !newVidUrl || !newVidDesc) {
                      alert('Por favor, preencha todos os campos obrigatórios (*) da aula.');
                      return;
                    }
                    const newVid = {
                      id: 'v-' + Date.now(),
                      title: newVidTitle,
                      url: newVidUrl,
                      desc: newVidDesc,
                      duration: newVidDurationState
                    };
                    const updated = learningModules.map(m => {
                      if (m.id === selectedModId) {
                        return {
                          ...m,
                          videos: [...(m.videos || []), newVid]
                        };
                      }
                      return m;
                    });
                    handleSaveModules(updated);
                    setNewVidTitle('');
                    setNewVidUrl('');
                    setNewVidDesc('');
                    setNewVidDurationState('5 min');
                  }}
                  className="w-full py-2 bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all border-none"
                >
                  Adicionar Aula
                </button>
              </div>
            </div>

            {/* Modules list layout with delete triggers */}
            <div className="pt-4 border-t border-zinc-900 space-y-4">
              <span className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block">Lista Atual e Exclusão de Aulas</span>
              
              <div className="space-y-3">
                {learningModules.map((m) => (
                  <div key={m.id} className="p-3.5 bg-zinc-950/40 border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11px] font-bold text-white uppercase">{m.title}</h5>
                      <button
                        onClick={() => {
                          if (confirm('Deseja excluir este módulo e todas as suas aulas permanentemente?')) {
                            const updated = learningModules.filter(x => x.id !== m.id);
                            handleSaveModules(updated);
                          }
                        }}
                        className="text-[9px] text-rose-500 hover:underline font-bold"
                      >
                        Excluir Módulo
                      </button>
                    </div>

                    <div className="divide-y divide-zinc-900">
                      {(!m.videos || m.videos.length === 0) ? (
                        <p className="text-[9px] text-zinc-600 italic py-1">Nenhuma aula cadastrada neste módulo.</p>
                      ) : (
                        m.videos.map(v => (
                          <div key={v.id} className="py-2 flex items-center justify-between gap-4 text-[10px] text-zinc-400">
                            <div className="truncate">
                              <span className="font-bold text-zinc-350">{v.title}</span> - <span className="text-zinc-500 font-mono truncate">{v.url}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm('Deseja excluir esta aula?')) {
                                  const updated = learningModules.map(x => {
                                    if (x.id === m.id) {
                                      return {
                                        ...x,
                                        videos: x.videos.filter(vi => vi.id !== v.id)
                                      };
                                    }
                                    return x;
                                  });
                                  handleSaveModules(updated);
                                }
                              }}
                              className="text-[9px] text-zinc-500 hover:text-rose-500 font-bold"
                            >
                              Excluir
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
