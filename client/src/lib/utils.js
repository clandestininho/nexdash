import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date into Portuguese relative time strings
 * e.g., 'agora', 'há 2m', 'há 1h', 'há 3d'
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 30) return 'agora';
  if (diffSec < 60) return `há ${diffSec}s`;
  if (diffMin < 60) return `há ${diffMin}m`;
  if (diffHour < 24) return `há ${diffHour}h`;
  if (diffDay < 7) return `há ${diffDay}d`;
  if (diffWeek < 5) return `há ${diffWeek}sem`;
  return `há ${diffMonth}mês${diffMonth > 1 ? 'es' : ''}`;
}

/**
 * Format a WhatsApp JID into a readable phone number
 * Removes @s.whatsapp.net and formats as +55 (XX) XXXXX-XXXX
 */
export function formatPhone(jid) {
  if (!jid) return '';

  // Strip @s.whatsapp.net or @c.us
  let phone = jid.replace(/@s\.whatsapp\.net$/, '').replace(/@c\.us$/, '');

  // Remove any non-digit characters
  phone = phone.replace(/\D/g, '');

  // Brazilian format: +55 (XX) XXXXX-XXXX
  if (phone.length === 13 && phone.startsWith('55')) {
    const country = phone.slice(0, 2);
    const area = phone.slice(2, 4);
    const part1 = phone.slice(4, 9);
    const part2 = phone.slice(9, 13);
    return `+${country} (${area}) ${part1}-${part2}`;
  }

  // Brazilian without leading 55
  if (phone.length === 11) {
    const area = phone.slice(0, 2);
    const part1 = phone.slice(2, 7);
    const part2 = phone.slice(7, 11);
    return `+55 (${area}) ${part1}-${part2}`;
  }

  // Fallback: just add + prefix
  return `+${phone}`;
}

/**
 * Truncate text to maxLength characters with ellipsis
 */
export function truncateText(text, maxLength = 60) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Mask an API key, showing only the last 4 characters
 * e.g., 'sk-abc123xyz' → '••••••xyz'
 */
export function maskApiKey(key) {
  if (!key) return '';
  if (key.length <= 4) return key;
  const visible = key.slice(-4);
  const masked = '•'.repeat(Math.min(key.length - 4, 12));
  return `${masked}${visible}`;
}

/**
 * Format date for Kanban card activity (e.g., "Hoje", "Ontem", "24 Mai")
 */
export function formatActivityDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  // Clear time for precise day comparison
  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dNow.getTime() - dDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Ontem';
  } else if (diffDays === -1) {
    return 'Amanhã';
  }
  
  const day = date.getDate();
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

