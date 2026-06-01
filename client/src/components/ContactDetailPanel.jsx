import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronRight, 
  User, 
  MessageSquare, 
  FileText, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Tag, 
  ShieldAlert,
  Building,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { cn, formatRelativeTime, formatPhone } from '../lib/utils';
import { STAGES, getStage, getStageColor, getStageLabel } from '../lib/stages';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ScrollArea } from './ui/ScrollArea';
import ClassificationBadge from './ClassificationBadge';
import { apiFetch } from '../lib/api';
import { socket } from '../lib/socket';

/**
 * ContactDetailPanel — animated slide-out panel from the right.
 *
 * Props:
 *   contact   — the contact object
 *   history   — array of classification log entries
 *   visible   — boolean to show/hide
 *   onClose   — close handler
 */
export default function ContactDetailPanel({ contact, history = [], visible, onClose }) {
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil', 'chat_historico', 'orcamentos'
  
  const [selectedStage, setSelectedStage] = useState('');
  const [projectValue, setProjectValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const [proposals, setProposals] = useState([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);

  const messagesEndRef = useRef(null);

  // Sync local state when contact changes
  useEffect(() => {
    if (contact) {
      setSelectedStage(contact.current_stage || '');
      setProjectValue(contact.project_value || '');
      setSaveFeedback(null);
      setActiveTab('perfil'); // Default back to perfil
    }
  }, [contact]);

  // Fetch messages from database
  useEffect(() => {
    if (contact && visible && activeTab === 'chat_historico') {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
          const res = await apiFetch(`/api/contacts/${contact.id}/messages`);
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Erro ao buscar mensagens:', err);
        } finally {
          setIsLoadingMessages(false);
        }
      };
      fetchMessages();
    }
  }, [contact, visible, activeTab]);

  // Fetch proposals for this contact
  useEffect(() => {
    if (contact && visible && activeTab === 'orcamentos') {
      const fetchProposals = async () => {
        setIsLoadingProposals(true);
        try {
          const res = await apiFetch('/api/proposals');
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          // Filter proposals that belong to this contact
          const filtered = list.filter(
            p => String(p.contact_id) === String(contact.id) || 
                 (p.clientPhone && String(p.clientPhone).replace(/\D/g, '') === String(contact.phone).replace(/\D/g, ''))
          );
          setProposals(filtered);
        } catch (err) {
          console.error('Erro ao buscar orçamentos do contato:', err);
        } finally {
          setIsLoadingProposals(false);
        }
      };
      fetchProposals();
    }
  }, [contact, visible, activeTab]);

  // Real-time socket message append listener
  useEffect(() => {
    if (!contact || !visible || activeTab !== 'chat_historico') return;

    const handleNewMessage = (msg) => {
      if (String(msg.contact_id) === String(contact.id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [contact, visible, activeTab]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current && activeTab === 'chat_historico') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingMessages, activeTab]);

  const handleOverride = async () => {
    if (!selectedStage || !contact) return;
    setIsSaving(true);
    setSaveFeedback(null);

    try {
      await apiFetch(`/api/contacts/${contact.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: selectedStage, project_value: projectValue }),
      });
      setSaveFeedback('success');
      // Update contact properties locally
      contact.current_stage = selectedStage;
      contact.project_value = projectValue;
    } catch (err) {
      console.error('Erro ao aplicar override:', err);
      setSaveFeedback('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  const handleSaveValue = async () => {
    if (!contact) return;
    try {
      await apiFetch(`/api/contacts/${contact.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_value: projectValue }),
      });
      setSaveFeedback('success');
      contact.project_value = projectValue;
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar valor:', err);
    }
  };

  const handleGenerateProposalRedirect = () => {
    if (!contact) return;
    // Redirect to proposals wizard with populated query parameters
    const params = new URLSearchParams({
      contactId: contact.id,
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      doc: contact.doc || '',
      cep: contact.cep || '',
      address: contact.endereço || '',
      number: contact.numero || '',
      complement: contact.complemento || '',
      neighborhood: contact.bairro || '',
      city: contact.cidade || '',
      state: contact.estado || '',
      pais: contact.pais || 'Brasil',
      value: contact.project_value || ''
    });
    window.location.href = `/orçamentos?${params.toString()}`;
  };

  const stageColor = contact ? getStageColor(contact.current_stage) : '#9E9E9E';

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Panel (w-full sm:w-[500px] lg:w-[600px] to make room for detailed tab systems) */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-screen w-full sm:w-[500px] lg:w-[600px] bg-[#0c0c0e]/98 border-l border-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out text-zinc-100 backdrop-blur-md',
          visible ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {contact && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-900 p-5 bg-[#09090b]/80 shrink-0">
              <div className="min-w-0 flex-1 mr-3">
                <h2 className="font-display text-lg font-bold text-white truncate tracking-tight flex items-center gap-2">
                  <User className="h-5 w-5 text-[#e13a40]" />
                  {contact.name || 'Sem nome'}
                </h2>
                <p className="text-xs text-zinc-400 font-body mt-1">
                  {formatPhone(contact.phone)}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    className="font-semibold text-xs"
                    backgroundColor={`${stageColor}15`}
                    textColor={stageColor}
                  >
                    {getStageLabel(contact.current_stage)}
                  </Badge>
                  {contact.pais && (
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md">
                      {contact.pais === 'Brasil' ? '🇧🇷 Brasil' : contact.pais === 'Portugal' ? '🇵🇹 Portugal' : `🌐 ${contact.pais}`}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-all duration-150 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-900 bg-[#09090b]/60 shrink-0 px-5 gap-4">
              <button
                onClick={() => setActiveTab('perfil')}
                className={cn(
                  "py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-1.5",
                  activeTab === 'perfil'
                    ? "border-[#e13a40] text-[#e13a40]"
                    : "border-transparent text-zinc-500 hover:text-zinc-350"
                )}
              >
                <User className="h-3.5 w-3.5" />
                <span>Perfil</span>
              </button>
              <button
                onClick={() => setActiveTab('chat_historico')}
                className={cn(
                  "py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-1.5",
                  activeTab === 'chat_historico'
                    ? "border-[#e13a40] text-[#e13a40]"
                    : "border-transparent text-zinc-500 hover:text-zinc-350"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Histórico & Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('orcamentos')}
                className={cn(
                  "py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-1.5",
                  activeTab === 'orcamentos'
                    ? "border-[#e13a40] text-[#e13a40]"
                    : "border-transparent text-zinc-500 hover:text-zinc-350"
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Orçamentos</span>
              </button>
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1 bg-[#09090b]/20">
              
              {/* TAB 1: PERFIL */}
              {activeTab === 'perfil' && (
                <div className="p-5 space-y-6">
                  
                  {/* Grid 1: Informações Gerais */}
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#e13a40] flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Informações de Contato
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">E-mail</span>
                        <p className="text-xs text-zinc-200 font-mono truncate">{contact.email || 'Não cadastrado'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">WhatsApp</span>
                        <p className="text-xs text-zinc-200 font-mono">{formatPhone(contact.phone)}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Documento</span>
                        <p className="text-xs text-zinc-200 font-mono">{contact.doc || 'Não informado'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Área de Interesse</span>
                        <p className="text-xs text-zinc-200 font-semibold">{contact.project_interest || 'Geral'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Morada / Endereço */}
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#e13a40] flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Endereço Cadastrado
                    </h3>
                    <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5 col-span-2">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Rua / Logradouro</span>
                          <p className="text-xs text-zinc-200">{contact.endereço || 'Não informado'}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Número</span>
                          <p className="text-xs text-zinc-200">{contact.numero || 'S/N'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Bairro</span>
                          <p className="text-xs text-zinc-200">{contact.bairro || 'Não informado'}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Complemento</span>
                          <p className="text-xs text-zinc-200">{contact.complemento || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">CEP</span>
                          <p className="text-xs text-zinc-200 font-mono">{contact.cep || 'S/CEP'}</p>
                        </div>
                        <div className="space-y-0.5 col-span-2">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Cidade / Estado</span>
                          <p className="text-xs text-zinc-200">
                            {contact.cidade || contact.estado ? `${contact.cidade || ''} / ${contact.estado || ''}` : 'Não informada'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags and Notes */}
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#e13a40] flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" />
                      Tags & Observações
                    </h3>
                    <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Etiquetas</span>
                        {contact.tags && contact.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {contact.tags.map((tag, idx) => (
                              <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-650 italic block">Nenhuma etiqueta cadastrada</span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Notas Internas / Histórico Breve</span>
                        <p className="text-xs text-zinc-300 bg-zinc-950/80 border border-zinc-900 p-2.5 rounded-lg whitespace-pre-wrap leading-relaxed font-body">
                          {contact.last_message || 'Nenhuma nota ou observação interna registrada.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comerciais: Valor do projeto e Stage Override */}
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#e13a40] flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      Gestão Comercial & Pipeline
                    </h3>
                    
                    <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl space-y-4">
                      
                      {/* Project Value */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Valor do Contrato / Projeto</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold font-mono">
                              R$
                            </span>
                            <Input
                              type="text"
                              value={projectValue}
                              onChange={(e) => setProjectValue(e.target.value)}
                              placeholder="0,00"
                              className="pl-9 bg-zinc-950 border-zinc-900 text-zinc-200 text-xs font-mono h-9"
                            />
                          </div>
                          <Button size="sm" onClick={handleSaveValue} className="h-9 text-xs px-3">
                            Salvar
                          </Button>
                        </div>
                      </div>

                      {/* Stage Override */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Mudar Estágio do Funil</label>
                        <div className="flex gap-2">
                          <select
                            value={selectedStage}
                            onChange={(e) => setSelectedStage(e.target.value)}
                            className="flex-1 h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-xs font-semibold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#e13a40]/30 focus:border-[#e13a40] transition-all duration-200"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-100">
                                {s.label}
                              </option>
                            ))}
                          </select>
                          <Button
                            onClick={handleOverride}
                            disabled={isSaving || selectedStage === contact.current_stage}
                            size="sm"
                            className="h-9 text-xs px-3 shrink-0"
                          >
                            {isSaving ? 'Salvando…' : 'Aplicar'}
                          </Button>
                        </div>
                      </div>

                      {saveFeedback === 'success' && (
                        <p className="text-xs text-emerald-400 font-bold animate-fade-in">
                          ✓ Estágio e valores sincronizados com sucesso
                        </p>
                      )}
                      {saveFeedback === 'error' && (
                        <p className="text-xs text-rose-500 font-bold animate-fade-in">
                          ✗ Erro ao atualizar configurações comerciais
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: HISTÓRICO & CHAT */}
              {activeTab === 'chat_historico' && (
                <div className="p-5 space-y-6">
                  
                  {/* WhatsApp Messages */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-widest font-extrabold text-[#e13a40] flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      Histórico do WhatsApp
                    </h4>
                    
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center py-16 bg-zinc-950 border border-zinc-900 rounded-xl">
                        <div className="h-6 w-6 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="flex flex-col gap-3 p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl max-h-[320px] overflow-y-auto shadow-inner scrollbar-thin">
                        {messages.map((msg, index) => {
                          const isMe = msg.from_me === 1;
                          return (
                            <div
                              key={msg.id || index}
                              className={cn(
                                "flex flex-col max-w-[80%] rounded-2xl py-2.5 px-4 text-xs font-semibold leading-relaxed break-words whitespace-pre-wrap transition-all shadow-sm",
                                isMe
                                  ? "bg-[#e13a40]/20 border border-[#e13a40]/30 text-red-100 self-end rounded-tr-none ml-auto"
                                  : "bg-zinc-900 border border-zinc-800 text-zinc-200 self-start rounded-tl-none mr-auto"
                              )}
                            >
                              <p>{msg.content}</p>
                              <span
                                className={cn(
                                  "text-[9px] mt-1 font-mono font-medium block text-right",
                                  isMe ? "text-red-300/60" : "text-zinc-550"
                                )}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/10">
                        <MessageSquare className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500 italic font-body">
                          Nenhuma mensagem registrada. Conecte o WhatsApp para sincronizar em tempo real.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Classification Logs */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs uppercase tracking-widest font-extrabold text-[#e13a40] flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4" />
                      Classificações e Transições AI
                    </h4>
                    
                    {history.length > 0 ? (
                      <div className="space-y-4 bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl">
                        {history.map((entry, idx) => (
                          <div
                            key={entry.id || idx}
                            className="flex items-start gap-3 relative pb-4 last:pb-0"
                          >
                            {/* Timeline connector */}
                            {idx < history.length - 1 && (
                              <div className="absolute left-[7px] top-4 w-px h-full bg-zinc-900" />
                            )}
                            {/* Dot */}
                            <div
                              className="relative z-10 mt-1 h-[14px] w-[14px] rounded-full border-2 border-zinc-950 flex-shrink-0"
                              style={{ backgroundColor: getStageColor(entry.to_stage || entry.new_stage) || '#e13a40' }}
                            />
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge
                                  className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider"
                                  backgroundColor={`${getStageColor(entry.from_stage || entry.old_stage)}15`}
                                  textColor={getStageColor(entry.from_stage || entry.old_stage)}
                                >
                                  {getStageLabel(entry.from_stage || entry.old_stage)}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-zinc-600 flex-shrink-0" />
                                <Badge
                                  className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider"
                                  backgroundColor={`${getStageColor(entry.to_stage || entry.new_stage)}15`}
                                  textColor={getStageColor(entry.to_stage || entry.new_stage)}
                                >
                                  {getStageLabel(entry.to_stage || entry.new_stage)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <ClassificationBadge confidence={entry.confidence} />
                                {entry.manual === 1 && (
                                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-[#e13a40]/15 text-red-300 border border-[#e13a40]/25 rounded">
                                    Manual
                                  </span>
                                )}
                              </div>
                              {entry.reason && (
                                <p className="text-xs text-zinc-300 mt-1 leading-snug font-body">
                                  {entry.reason}
                                </p>
                              )}
                              <p className="text-[10px] text-zinc-500 mt-1 font-body">
                                {formatRelativeTime(entry.created_at || entry.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/10">
                        <ShieldAlert className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500 italic font-body">
                          Nenhuma transição automatizada registrada.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 3: ORÇAMENTOS */}
              {activeTab === 'orcamentos' && (
                <div className="p-5 space-y-6">
                  
                  {/* Top Action Button */}
                  <div className="bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl space-y-3.5 text-center">
                    <div className="flex justify-center">
                      <div className="h-10 w-10 rounded-full bg-[#e13a40]/10 text-[#e13a40] flex items-center justify-center">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Criar Nova Proposta Comercial</h4>
                      <p className="text-[11px] text-zinc-400 font-body mt-1 leading-relaxed">
                        Gere orçamentos e contratos corporativos com faturamento e assinatura digital vinculada automaticamente a este lead!
                      </p>
                    </div>
                    <Button 
                      onClick={handleGenerateProposalRedirect}
                      className="w-full h-9 text-xs font-bold gap-1.5 shadow-glow shadow-[#e13a40]/10 hover:shadow-[#e13a40]/25 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Fazer Orçamento para {contact.name?.split(' ')[0]}</span>
                    </Button>
                  </div>

                  {/* List of Proposals */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-widest font-extrabold text-[#e13a40] flex items-center gap-1.5">
                      <ClipboardList className="h-4 w-4" />
                      Orçamentos Emitidos
                    </h4>

                    {isLoadingProposals ? (
                      <div className="flex items-center justify-center py-12 bg-zinc-950 border border-zinc-900 rounded-xl">
                        <div className="h-5 w-5 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : proposals.length > 0 ? (
                      <div className="space-y-3">
                        {proposals.map((prop) => {
                          const isApproved = prop.status === 'approved';
                          const isDraft = prop.status === 'draft';
                          const isSent = prop.status === 'sent';
                          
                          return (
                            <div 
                              key={prop.id}
                              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl p-4 transition-colors space-y-3 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                                    {prop.id}
                                  </span>
                                  <h5 className="text-xs font-bold text-white leading-snug truncate mt-0.5">
                                    {prop.projectName || 'Proposta Comercial'}
                                  </h5>
                                </div>
                                <span className={cn(
                                  "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0",
                                  isApproved ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                  isSent ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                                  "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                )}>
                                  {isApproved ? 'Assinado' : isSent ? 'Enviado' : 'Rascunho'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-900/60 font-body">
                                <div className="space-y-0.5">
                                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Valor Total</span>
                                  <span className="font-mono text-white font-bold">
                                    R$ {parseFloat(prop.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>

                                <a
                                  href={`/public/proposal/${prop.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-[#e13a40] hover:text-[#ff483d] transition-colors flex items-center gap-1 cursor-pointer bg-zinc-900/60 hover:bg-zinc-900 px-2 py-1 rounded border border-zinc-850"
                                >
                                  <span>Ver Proposta</span>
                                  <ChevronRight className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/10">
                        <FileText className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs text-zinc-500 italic font-body">
                          Nenhum orçamento emitido para este cliente.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}

            </ScrollArea>
          </>
        )}
      </div>
    </>
  );
}
