import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
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
  const [selectedStage, setSelectedStage] = useState('');
  const [projectValue, setProjectValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync local state when contact changes
  useEffect(() => {
    if (contact) {
      setSelectedStage(contact.current_stage || '');
      setProjectValue(contact.project_value || '');
      setSaveFeedback(null);
    }
  }, [contact]);

  // Fetch messages from database
  useEffect(() => {
    if (contact && visible) {
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
    } else {
      setMessages([]);
    }
  }, [contact, visible]);

  // Real-time socket message append listener
  useEffect(() => {
    if (!contact || !visible) return;

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
  }, [contact, visible]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingMessages]);

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
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar valor:', err);
    }
  };

  const stageColor = contact ? getStageColor(contact.current_stage) : '#9E9E9E';

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-screen w-96 bg-[#0c0c0e]/95 border-l border-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out text-zinc-100 backdrop-blur-md',
          visible ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {contact && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-900 p-5 bg-[#09090b]/80">
              <div className="min-w-0 flex-1 mr-3">
                <h2 className="font-display text-lg font-bold text-white truncate tracking-tight">
                  {contact.name || 'Sem nome'}
                </h2>
                <p className="text-xs text-zinc-400 font-body mt-1">
                  {formatPhone(contact.phone)}
                </p>
                <Badge
                  className="mt-2 font-semibold"
                  backgroundColor={`${stageColor}15`}
                  textColor={stageColor}
                >
                  {getStageLabel(contact.current_stage)}
                </Badge>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-all duration-150"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-6">
                {/* Section 1: WhatsApp Conversation History */}
                <section>
                  <h4 className="font-display text-sm font-semibold text-zinc-200 mb-2">
                    Histórico de Conversa (WhatsApp)
                  </h4>
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center py-10 bg-zinc-950/80 border border-zinc-900 rounded-xl">
                      <div className="h-4 w-4 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="flex flex-col gap-2.5 p-3.5 bg-zinc-950 border border-zinc-900/60 rounded-xl font-body max-h-64 overflow-y-auto shadow-inner scrollbar-thin">
                      {messages.map((msg, index) => {
                        const isMe = msg.from_me === 1;
                        return (
                          <div
                            key={msg.id || index}
                            className={cn(
                              "flex flex-col max-w-[85%] rounded-2xl py-2 px-3.5 text-xs font-medium shadow-sm leading-relaxed break-words whitespace-pre-wrap transition-all",
                              isMe
                                ? "bg-[#e13a40]/25 border border-[#e13a40]/35 text-red-100 self-end rounded-tr-none ml-auto shadow-[0_0_12px_rgba(255,72,61,0.04)]"
                                : "bg-zinc-900 border border-zinc-800 text-zinc-200 self-start rounded-tl-none mr-auto"
                            )}
                          >
                            <p>{msg.content}</p>
                            <span
                              className={cn(
                                "text-[10px] mt-1 font-body block self-end text-right font-medium",
                                isMe ? "text-red-300/80" : "text-zinc-400"
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
                    <div className="rounded-xl border border-dashed border-zinc-800 p-5 text-center bg-zinc-950/30">
                      <p className="text-xs text-zinc-500 italic font-body">
                        Nenhuma mensagem armazenada. Conecte o WhatsApp para sincronizar em tempo real.
                      </p>
                    </div>
                  )}
                </section>

                <div className="h-px bg-zinc-900" />

                {/* Section 2: Classification History */}
                <section>
                  <h4 className="font-display text-sm font-semibold text-zinc-200 mb-3">
                    Histórico de Classificações
                  </h4>
                  {history.length > 0 ? (
                    <div className="space-y-0">
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
                            className="relative z-10 mt-1 h-[15px] w-[15px] rounded-full border-2 border-zinc-950 flex-shrink-0"
                            style={{ backgroundColor: getStageColor(entry.to_stage || entry.new_stage) || '#e13a40' }}
                          />
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                className="text-xs px-1.5 py-0.5 font-bold"
                                backgroundColor={`${getStageColor(entry.from_stage || entry.old_stage)}15`}
                                textColor={getStageColor(entry.from_stage || entry.old_stage)}
                              >
                                {getStageLabel(entry.from_stage || entry.old_stage)}
                              </Badge>
                              <ChevronRight className="h-3 w-3 text-zinc-500 flex-shrink-0" />
                              <Badge
                                className="text-xs px-1.5 py-0.5 font-bold"
                                backgroundColor={`${getStageColor(entry.to_stage || entry.new_stage)}15`}
                                textColor={getStageColor(entry.to_stage || entry.new_stage)}
                              >
                                {getStageLabel(entry.to_stage || entry.new_stage)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <ClassificationBadge confidence={entry.confidence} />
                              {entry.manual && (
                                <span className="text-xs px-1.5 py-0.5 bg-[#e13a40]/15 text-red-200 border border-[#e13a40]/20 rounded-full font-bold">
                                  Manual
                                </span>
                              )}
                            </div>
                            {entry.reason && (
                              <p className="text-xs text-zinc-300 mt-1 leading-snug font-body">
                                {entry.reason}
                              </p>
                            )}
                            <p className="text-xs text-zinc-400 mt-1 font-body tabular-nums">
                              {formatRelativeTime(entry.created_at || entry.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 italic font-body">
                      Nenhuma classificação registrada
                    </p>
                  )}
                </section>

                <div className="h-px bg-zinc-900" />

                {/* Section 3: Project Value */}
                <section>
                  <h4 className="font-display text-sm font-semibold text-zinc-200 mb-2">
                    Valor do Projeto
                  </h4>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-semibold font-mono">
                        R$
                      </span>
                      <Input
                        type="text"
                        value={projectValue}
                        onChange={(e) => setProjectValue(e.target.value)}
                        placeholder="0,00"
                        className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100"
                      />
                    </div>
                    <Button size="sm" onClick={handleSaveValue} className="self-center">
                      Salvar
                    </Button>
                  </div>
                </section>

                <div className="h-px bg-zinc-900" />

                {/* Section 4: Stage Override */}
                <section>
                  <h4 className="font-display text-sm font-semibold text-zinc-200 mb-2">
                    Alterar Estágio
                  </h4>
                  <div className="flex gap-2">
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="flex-1 h-10 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm font-body text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#e13a40]/30 focus:border-[#e13a40] transition-all duration-200"
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
                      className="self-center"
                    >
                      {isSaving ? 'Salvando…' : 'Aplicar'}
                    </Button>
                  </div>

                  {saveFeedback === 'success' && (
                    <p className="text-xs text-emerald-400 mt-2 font-body animate-fade-in">
                      ✓ Estágio atualizado com sucesso
                    </p>
                  )}
                  {saveFeedback === 'error' && (
                    <p className="text-xs text-rose-500 mt-2 font-body animate-fade-in">
                      ✗ Erro ao atualizar estágio
                    </p>
                  )}
                </section>
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </>
  );
}
