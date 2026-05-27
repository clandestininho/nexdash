import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { STAGES } from '../lib/stages';
import { ScrollArea } from './ui/ScrollArea';
import ContactCard from './ContactCard';

/**
 * KanbanBoard — full drag-and-drop kanban with 8 stage columns.
 *
 * Props:
 *   contactsByStage — object keyed by stage id, values are arrays of contacts
 *   onCardClick     — called with contact when a card is clicked
 *   onMoveContact   — called with (contactId, newStageId) after drag-and-drop
 *   onAddCardClick  — called with stageId to open the manual card creation modal
 */
export default function KanbanBoard({ 
  contactsByStage = {}, 
  avgTimePerStage = {}, 
  stages = STAGES,
  onCardClick, 
  onMoveContact,
  onAddCardClick 
}) {
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable or same position
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId;
    const contactId = draggableId;

    // Call parent handler for optimistic update
    onMoveContact?.(contactId, newStage);

    // POST override to backend
    try {
      await fetch(`/api/contacts/${contactId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch (err) {
      console.error('Erro ao mover contato:', err);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2" style={{ minHeight: 'calc(100vh - 12rem)' }}>
        {stages.map((stage) => {
          const contacts = contactsByStage[stage.id] || [];
          const avgTime = avgTimePerStage?.[stage.id] || 0;
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              contacts={contacts}
              avgTime={avgTime}
              onCardClick={onCardClick}
              onAddCardClick={onAddCardClick}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}

function KanbanColumn({ stage, contacts, avgTime, onCardClick, onAddCardClick }) {
  const formatAvgTime = (timeHours) => {
    if (!timeHours) return null;
    if (timeHours >= 24) {
      const days = Math.round((timeHours / 24) * 10) / 10;
      return `${days}d méd.`;
    }
    return `${timeHours}h méd.`;
  };

  const formattedTime = formatAvgTime(avgTime);

  return (
    <div className="flex-shrink-0 w-72 rounded-xl bg-[#0b0b0d] border border-[#161619] flex flex-col" style={{ minHeight: 'calc(100vh - 12rem)' }}>
      {/* Column header */}
      <div className="flex flex-col gap-1 px-4 py-3 border-b border-[#121214]">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <h3 
              className="text-[13px] font-bold tracking-tight truncate text-white"
            >
              {stage.label}
            </h3>
          </div>
          
          {/* Low-contrast pill counter */}
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#121214] border border-[#1f1f23] px-1.5 text-[10px] font-bold text-zinc-550 tabular-nums">
            {contacts.length}
          </span>
        </div>
        
        {/* Total Value below the title matching screenshot */}
        <span className="text-[11px] text-zinc-500 font-semibold font-mono tracking-tight leading-none mt-0.5 block">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            contacts.reduce((acc, c) => acc + (c.project_value || 0), 0)
          )}
        </span>

        {formattedTime && (
          <span className="text-[9.5px] text-zinc-600 font-body leading-none mt-1">
            ⏱ Tempo médio: {formattedTime}
          </span>
        )}
      </div>

      {/* Cards list */}
      <ScrollArea className="flex-1">
        <Droppable droppableId={stage.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-3.5 min-h-[160px] transition-all duration-200 rounded-b-xl flex flex-col gap-1 ${
                snapshot.isDraggingOver ? 'bg-zinc-950/20' : 'bg-transparent'
              }`}
            >
              {contacts.map((contact, idx) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  index={idx}
                  onClick={onCardClick}
                />
              ))}
              {provided.placeholder}

              {/* Dotted + Adicionar card button */}
              <button 
                onClick={() => onAddCardClick?.(stage.id)}
                className="w-full flex items-center justify-center py-2.5 px-4 mt-1 border border-dashed border-[#1f1f23] hover:border-zinc-700 bg-transparent hover:bg-[#121214]/40 rounded-xl transition-all duration-200 text-zinc-500 hover:text-zinc-300 text-[11px] font-semibold gap-1 select-none"
              >
                <span>+ Adicionar card</span>
              </button>

              {contacts.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                  <p className="text-[10px] text-zinc-600 font-body uppercase tracking-wider">
                    Sem leads
                  </p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </ScrollArea>
    </div>
  );
}

