import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock, Mail, Phone, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ContactCard({ contact, index, onClick }) {
  // Format entry date as 'Entrou em DD/MM/YY às HH:MM'
  const formatEntryDate = (dateString) => {
    if (!dateString) return 'Entrou em data indefinida';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `Entrou em ${day}/${month}/${year} às ${hours}:${minutes}`;
  };

  const handleWhatsAppCall = (e) => {
    e.stopPropagation(); // Prevent opening detail panel
    const cleaned = (contact.phone || '').replace(/\D/g, '');
    if (cleaned) {
      window.open(`https://wa.me/${cleaned}`, '_blank');
    } else {
      alert('Número de telefone não cadastrado ou inválido.');
    }
  };

  return (
    <Draggable draggableId={String(contact.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick?.(contact)}
          className={cn(
            'bg-[#121212] border border-[#1f1f1f] hover:border-[#e13a40]/55 hover:shadow-[0_0_12px_rgba(225,58,64,0.15)] rounded-xl p-4 shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing select-none mb-3 relative overflow-hidden',
            snapshot.isDragging && 'border-[#e13a40]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] rotate-[1deg] scale-[1.02] opacity-95 bg-[#161619]'
          )}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {/* Card Header: Drag Handle + Name + Triple Dots */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Drag Handle Grid */}
              <svg 
                className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 cursor-grab" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM16 6a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 11-4 0 2 2 0 014 0zM16 18a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              
              <span className="text-[13px] font-bold text-white truncate tracking-wide">
                {contact.name || 'Sem nome'}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              {/* AI Decision Indicator Tag (Brains icon 🧠) */}
              {contact.last_reason && (
                <div className="relative group">
                  <span className="cursor-help text-xs animate-pulse-soft">🧠</span>
                  {/* Tooltip Popup */}
                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-300 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 font-body pointer-events-none leading-relaxed select-text">
                    <div className="flex items-center gap-1 mb-1.5 font-bold text-white uppercase tracking-wide text-[8px] text-[#e13a40]">
                      <span>🧠 Copiloto de IA</span>
                      {contact.confidence && (
                        <span className="ml-auto font-mono text-zinc-500 lowercase">confiança: {Math.round(contact.confidence * 100)}%</span>
                      )}
                    </div>
                    <p className="font-medium text-zinc-200 leading-normal">
                      {contact.last_reason}
                    </p>
                    <div className="absolute top-full right-1 border-4 border-transparent border-t-zinc-950" />
                    <div className="absolute top-full right-1 border-4 border-transparent border-t-zinc-800 -z-10 translate-y-[1px]" />
                  </div>
                </div>
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); onClick?.(contact); }}
                className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card Details Body */}
          <div className="mt-3.5 space-y-2 text-xs text-zinc-400 font-body">
            {/* Entry Date */}
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="truncate text-zinc-300 font-semibold">{formatEntryDate(contact.created_at || contact.last_activity)}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="truncate text-zinc-200 font-mono text-xs">{contact.email || 'Não cadastrado'}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
              <span className="truncate text-zinc-200 font-mono text-xs">{contact.phone || 'Não cadastrado'}</span>
            </div>
          </div>

          {/* Action: Chamar no WhatsApp green button matching print */}
          <button
            onClick={handleWhatsAppCall}
            className="w-full mt-4 bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-[0_4px_14px_rgba(37,211,102,0.35)] active:scale-[0.97] transition-all duration-200 border border-[#25D366] hover:border-[#20ba59]"
          >
            <svg 
              className="w-4 h-4 text-white fill-current flex-shrink-0" 
              viewBox="0 0 24 24"
            >
              <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.982L2 22l5.202-1.362a9.96 9.96 0 004.808 1.226h.003c5.502 0 9.99-4.479 9.991-9.986 0-2.67-1.037-5.178-2.923-7.065C17.197 2.927 14.686 2.001 12.012 2zm6.066 14.19c-.27.76-1.348 1.385-1.854 1.488-.372.076-.856.136-2.39-.48-1.96-.786-3.21-2.775-3.308-2.905-.098-.13-.72-.954-.72-1.808 0-.853.447-1.272.605-1.447.16-.174.348-.218.465-.218.117 0 .232.001.333.005.107.004.25-.043.393.297.147.35.502 1.226.547 1.314.044.09.072.193.013.313-.06.12-.09.195-.178.298-.088.103-.186.23-.267.31-.09.09-.183.187-.078.365.105.178.468.77.998 1.246.685.614 1.263.805 1.443.896.18.09.287.076.393-.047.106-.123.456-.53.58-.71.122-.18.245-.15.41-.09.167.06 1.053.497 1.233.587.18.09.3.136.345.213.045.077.045.446-.057.734z" />
            </svg>
            <span>Chamar no WhatsApp</span>
          </button>
        </div>
      )}
    </Draggable>
  );
}

