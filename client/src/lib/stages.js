export const STAGES = [
  { id: 'novo-lead', label: 'Novo Lead', color: '#7A8C6E', emoji: '🟢' },
  { id: 'qualificando', label: 'Qualificando', color: '#4A90D9', emoji: '🔵' },
  { id: 'proposta-enviada', label: 'Proposta Enviada', color: '#C9A84C', emoji: '🟡' },
  { id: 'negociando', label: 'Negociando', color: '#D4842A', emoji: '🟠' },
  { id: 'fechado', label: 'Fechado', color: '#4CAF50', emoji: '✅' },
  { id: 'em-producao', label: 'Em Produção', color: '#9C27B0', emoji: '🔨' },
  { id: 'entregue', label: 'Entregue', color: '#607D8B', emoji: '🎉' },
  { id: 'perdido', label: 'Perdido', color: '#B05C3A', emoji: '🔴' },
];

/**
 * Array of stage IDs in pipeline order
 */
export const STAGE_ORDER = STAGES.map((s) => s.id);

/**
 * Get full stage object by ID
 */
export function getStage(id) {
  return STAGES.find((s) => s.id === id) || null;
}

/**
 * Get stage color by ID
 */
export function getStageColor(id) {
  const stage = getStage(id);
  return stage ? stage.color : '#9E9E9E';
}

/**
 * Get stage label by ID
 */
export function getStageLabel(id) {
  const stage = getStage(id);
  return stage ? stage.label : id || 'Desconhecido';
}
