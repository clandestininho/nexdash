import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Link2, Check, RefreshCw, AlertCircle, FileText, Send, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export default function Briefings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Simulated briefings list
  const [briefings, setBriefings] = useState([
    {
      id: 1,
      title: 'Briefing de Branding & Rebranding',
      leadsCount: 12,
      progress: 65,
      fields: 14,
      link: 'nexdash.studio/briefing/branding-setup',
      status: 'Pendente',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 2,
      title: 'Briefing de Web Design & UX',
      leadsCount: 28,
      progress: 92,
      fields: 22,
      link: 'nexdash.studio/briefing/web-design-ux',
      status: 'Concluído',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 3,
      title: 'Questionário de Alinhamento Comercial',
      leadsCount: 4,
      progress: 15,
      fields: 8,
      link: 'nexdash.studio/briefing/comercial-align',
      status: 'Novo',
      statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    }
  ]);

  const handleCopyLink = (id, link) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredBriefings = briefings.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-zinc-100 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-1 bg-[#e13a40]/10 rounded-lg">
              <ClipboardList className="h-6 w-6 text-[#e13a40]" />
            </div>
            Catálogo de Briefings
          </h1>
          <p className="text-sm text-zinc-400 font-body mt-1">
            Crie links exclusivos de coleta de requisitos para seus clientes e integre as respostas diretamente ao funil.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button className="gap-1.5 text-xs font-semibold h-9">
            <Plus className="h-4 w-4" />
            <span>Novo Template</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="relative bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4 shadow-lg">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          type="text"
          placeholder="Buscar briefings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-950 border-zinc-800 text-zinc-100"
        />
      </div>

      {/* Briefings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBriefings.map((b) => (
          <div
            key={b.id}
            className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-all flex flex-col justify-between space-y-4 shadow-md group"
          >
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-zinc-950 border border-zinc-900 text-zinc-400 rounded-lg">
                  <FileText className="h-5 w-5 group-hover:text-[#e13a40] transition-colors" />
                </span>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${b.statusColor}`}>
                  {b.status}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm group-hover:text-[#e13a40] transition-colors leading-tight pt-1">
                {b.title}
              </h3>
              <p className="text-[10px] text-zinc-500 font-body">
                Formulário estruturado com {b.fields} perguntas estratégicas.
              </p>
            </div>

            {/* Progress of completion */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-400 font-body">Preenchimento Médio</span>
                <span className="text-white font-mono font-bold">{b.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                <div
                  className="h-full bg-gradient-to-r from-[#e13a40] to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${b.progress}%` }}
                />
              </div>
            </div>

            {/* Metrics footer */}
            <div className="flex justify-between items-center text-[10px] border-t border-zinc-900 pt-3">
              <span className="text-zinc-500 font-body">
                Respostas Coletadas: <strong className="text-zinc-300 font-mono">{b.leadsCount}</strong>
              </span>
            </div>

            {/* Actions button row */}
            <div className="flex gap-2 pt-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyLink(b.id, b.link)}
                className="flex-1 text-[10px] h-8 bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-300 hover:text-white"
              >
                {copiedId === b.id ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-3.5 w-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-[10px] px-3 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
