import { getSocket } from './client.js';

export const STAGE_LABELS = {
  'novo-lead': '🟢 Novo Lead',
  'qualificando': '🔵 Qualificando',
  'proposta-enviada': '🟡 Proposta Enviada',
  'negociando': '🟠 Negociando',
  'fechado': '✅ Fechado',
  'em-producao': '🔨 Em Produção',
  'entregue': '🎉 Entregue',
  'perdido': '🔴 Perdido',
};

// Mapping: userId -> Map(label display name → WhatsApp label ID)
const userLabelIdMaps = new Map();

/**
 * Sync labels from a specific user's WhatsApp.
 * Fetches existing labels and builds a tenant-specific name→id mapping.
 * @param {string|number} userId
 */
export async function syncLabels(userId) {
  const uId = String(userId);
  try {
    const sock = getSocket(uId);
    if (!sock) {
      console.warn(`[LabelManager] User ${uId}: No WhatsApp socket available. Skipping label sync.`);
      return;
    }

    if (typeof sock.getLabels !== 'function') {
      console.warn(`[LabelManager] User ${uId}: getLabels not available. Labels may not be supported on this account.`);
      return;
    }

    const labels = await sock.getLabels();

    if (!labels || !Array.isArray(labels)) {
      console.warn(`[LabelManager] User ${uId}: No labels returned from WhatsApp.`);
      return;
    }

    let labelIdMap = userLabelIdMaps.get(uId);
    if (!labelIdMap) {
      labelIdMap = new Map();
      userLabelIdMaps.set(uId, labelIdMap);
    }
    labelIdMap.clear();

    for (const label of labels) {
      if (label.name && label.id) {
        labelIdMap.set(label.name, label.id);
      }
    }

    console.log(
      `[LabelManager] User ${uId}: Synced ${labelIdMap.size} labels from WhatsApp:`,
      [...labelIdMap.keys()].join(', ')
    );
  } catch (error) {
    console.warn(`[LabelManager] User ${uId}: Failed to sync labels (normal for personal accounts):`, error.message);
  }
}

/**
 * Apply a WhatsApp label for a new stage and remove the old stage label.
 * @param {string|number} userId - The system user ID
 * @param {string} jid - The WhatsApp JID of the contact/chat
 * @param {string} newStage - The new CRM stage
 * @param {string|null} oldStage - The previous CRM stage (if any)
 */
export async function applyLabel(userId, jid, newStage, oldStage) {
  const uId = String(userId);
  try {
    const sock = getSocket(uId);
    if (!sock) {
      console.warn(`[LabelManager] User ${uId}: No WhatsApp socket available. Skipping label application.`);
      return;
    }

    const labelIdMap = userLabelIdMaps.get(uId) || new Map();

    // Remove old stage label if it exists
    if (oldStage && STAGE_LABELS[oldStage]) {
      const oldLabelName = STAGE_LABELS[oldStage];
      const oldLabelId = labelIdMap.get(oldLabelName);

      if (oldLabelId && typeof sock.removeChatLabel === 'function') {
        try {
          await sock.removeChatLabel(jid, oldLabelId);
          console.log(`[LabelManager] User ${uId}: Removed label "${oldLabelName}" from ${jid}`);
        } catch (err) {
          console.warn(`[LabelManager] User ${uId}: Failed to remove label "${oldLabelName}" from ${jid}:`, err.message);
        }
      }
    }

    // Add new stage label
    if (newStage && STAGE_LABELS[newStage]) {
      const newLabelName = STAGE_LABELS[newStage];
      const newLabelId = labelIdMap.get(newLabelName);

      if (newLabelId && typeof sock.addChatLabel === 'function') {
        try {
          await sock.addChatLabel(jid, newLabelId);
          console.log(`[LabelManager] User ${uId}: Applied label "${newLabelName}" to ${jid}`);
        } catch (err) {
          console.warn(`[LabelManager] User ${uId}: Failed to apply label "${newLabelName}" to ${jid}:`, err.message);
        }
      } else if (!newLabelId) {
        console.warn(
          `[LabelManager] User ${uId}: Label "${newLabelName}" not found in WhatsApp. Create it manually in WhatsApp Business.`
        );
      }
    }
  } catch (error) {
    console.error(`[LabelManager] User ${uId}: Error applying label:`, error.message);
  }
}

/**
 * Get the WhatsApp label ID for a given stage name and user.
 * @param {string|number} userId
 * @param {string} stageName - The CRM stage name
 * @returns {string|undefined} The WhatsApp label ID, or undefined if not found
 */
export function getLabelId(userId, stageName) {
  const uId = String(userId);
  const labelIdMap = userLabelIdMaps.get(uId);
  if (!labelIdMap) return undefined;

  const displayName = STAGE_LABELS[stageName];
  if (!displayName) return undefined;
  return labelIdMap.get(displayName);
}
