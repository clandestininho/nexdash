import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { formatRelativeTime } from '../lib/utils';
import { getStageColor, getStageLabel } from '../lib/stages';
import { useSocket } from '../hooks/useSocket';
import { apiFetch } from '../lib/api';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import ClassificationBadge from '../components/ClassificationBadge';

export default function Log() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiFetch('/api/log');
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : data.logs || data.entries || []);
      } catch (err) {
        console.error('Erro ao carregar log:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Real-time new classifications
  useSocket('classification:new', (data) => {
    const entry = data.entry || data;
    if (entry) {
      setLogs((prev) => [entry, ...prev]);
    }
  });

  // Filter and sort
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (entry) =>
          (entry.contact_name || '').toLowerCase().includes(q) ||
          (entry.phone || '').includes(q)
      );
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.created_at || a.timestamp || 0);
      const dateB = new Date(b.created_at || b.timestamp || 0);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [logs, search, sortAsc]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[#1A1611]">
          Log de Classificações
        </h1>
        <p className="text-sm text-[#1A1611]/45 font-body mt-1">
          Histórico completo de todas as classificações automáticas e manuais
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1A1611]/30" />
          <Input
            placeholder="Buscar por contato…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1.5 h-10 px-3 rounded-lg border border-[#E2DACB] bg-white text-sm text-[#1A1611]/70 hover:bg-[#EDE8DC] transition-colors font-body"
        >
          {sortAsc ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Data
        </button>

        <div className="ml-auto text-xs text-[#1A1611]/35 font-body tabular-nums">
          {filteredLogs.length} registro{filteredLogs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#EDE8DC] overflow-hidden shadow-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#1A1611]/30 font-body text-sm">
              {search ? 'Nenhum resultado encontrado' : 'Nenhuma classificação registrada'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EDE8DC]">
                  <th className="text-left text-xs font-semibold text-[#1A1611]/50 font-body px-4 py-3 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="text-left text-xs font-semibold text-[#1A1611]/50 font-body px-4 py-3 uppercase tracking-wider">
                    De
                  </th>
                  <th className="text-left text-xs font-semibold text-[#1A1611]/50 font-body px-4 py-3 uppercase tracking-wider">
                    Para
                  </th>
                  <th className="text-left text-xs font-semibold text-[#1A1611]/50 font-body px-4 py-3 uppercase tracking-wider">
                    Confiança
                  </th>
                  <th className="text-left text-xs font-semibold text-[#1A1611]/50 font-body px-4 py-3 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="text-left text-xs font-semibold text-[#1A1611]/50 font-body px-4 py-3 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-semibold text-[#1A1611]/50 font-body px-4 py-3 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((entry, idx) => {
                  const fromColor = getStageColor(entry.from_stage || entry.old_stage);
                  const toColor = getStageColor(entry.to_stage || entry.new_stage);
                  const isManual = entry.manual || entry.type === 'manual';

                  return (
                    <tr
                      key={entry.id || idx}
                      className={`border-b border-[#EDE8DC]/50 transition-colors hover:bg-[#F5F0E8]/50 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-[#FDFCF9]'
                      }`}
                    >
                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[#1A1611] truncate max-w-[160px]">
                            {entry.contact_name || 'Desconhecido'}
                          </p>
                          {entry.phone && (
                            <p className="text-[10px] text-[#1A1611]/35 font-body">
                              {entry.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* From Stage */}
                      <td className="px-4 py-3">
                        <Badge
                          backgroundColor={`${fromColor}20`}
                          textColor={fromColor}
                          className="text-[10px] whitespace-nowrap"
                        >
                          {getStageLabel(entry.from_stage || entry.old_stage)}
                        </Badge>
                      </td>

                      {/* To Stage */}
                      <td className="px-4 py-3">
                        <Badge
                          backgroundColor={`${toColor}20`}
                          textColor={toColor}
                          className="text-[10px] whitespace-nowrap"
                        >
                          {getStageLabel(entry.to_stage || entry.new_stage)}
                        </Badge>
                      </td>

                      {/* Confidence */}
                      <td className="px-4 py-3">
                        <ClassificationBadge confidence={entry.confidence} />
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-[#1A1611]/55 font-body max-w-[200px] truncate">
                          {entry.reason || '—'}
                        </p>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        {isManual ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#C9A84C]/15 text-[#96790A]">
                            Manual
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600">
                            Auto
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-[#1A1611]/40 font-body tabular-nums whitespace-nowrap">
                          {formatRelativeTime(entry.created_at || entry.timestamp)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
