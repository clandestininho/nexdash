import { Router } from 'express';
import {
  getSettings,
  saveSetting,
  getMetrics,
  getBlacklist,
  setBlacklist,
  getClassificationLog,
} from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/log — return latest classification log entries
router.get('/log', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const logs = getClassificationLog(userId);
    res.json(logs);
  } catch (error) {
    console.error(`[Route:Settings] User ${userId}: Error getting classification log:`, error.message);
    res.status(500).json({ error: 'Falha ao buscar log de classificações.' });
  }
});

// GET /api/settings — return all settings with masked API keys
router.get('/settings', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const settings = getSettings(userId);

    // Mask the Anthropic API key for security
    if (settings.anthropic_api_key) {
      const key = settings.anthropic_api_key;
      if (key.length > 4) {
        settings.anthropic_api_key = '•'.repeat(key.length - 4) + key.slice(-4);
      }
    }

    // Mask the Gemini API key for security
    if (settings.gemini_api_key) {
      const key = settings.gemini_api_key;
      if (key.length > 4) {
        settings.gemini_api_key = '•'.repeat(key.length - 4) + key.slice(-4);
      }
    }

    res.json(settings);
  } catch (error) {
    console.error(`[Route:Settings] User ${userId}: Error getting settings:`, error.message);
    res.status(500).json({ error: 'Falha ao carregar configurações.' });
  }
});

// POST /api/settings — save one or more settings
router.post('/settings', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const body = req.body;

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Corpo da requisição deve ser um objeto JSON.' });
    }

    for (const [key, value] of Object.entries(body)) {
      // Exclude blacklist array since it has its own endpoint
      if (key === 'blacklist') continue;
      saveSetting(userId, key, String(value));
    }

    res.json({ success: true });
  } catch (error) {
    console.error(`[Route:Settings] User ${userId}: Error saving settings:`, error.message);
    res.status(500).json({ error: 'Falha ao salvar configurações.' });
  }
});

// POST /api/settings/test-api - Test API key validation (Gemini or Claude)
router.post('/settings/test-api', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { api_key } = req.body;
    const settings = getSettings(userId);
    const provider = settings.ai_provider || 'gemini';

    let testKey = api_key;
    if (!testKey) {
      testKey = provider === 'gemini' ? settings.gemini_api_key : settings.anthropic_api_key;
    }

    if (!testKey || testKey.startsWith('•••')) {
      // If key is masked and not provided in body, use original unmasked key from DB
      // Note: for this MVP we fetch unmasked value from active DB settings row
      const freshSettings = getSettings(userId);
      testKey = provider === 'gemini' ? freshSettings.gemini_api_key : freshSettings.anthropic_api_key;
    }

    if (!testKey) {
      return res.status(400).json({ error: 'Chave de API não configurada ou não enviada.' });
    }

    if (provider === 'gemini') {
      // Test Gemini API key with a fast rest generate content call
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${testKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with OK.' }] }]
        })
      });

      if (response.ok) {
        return res.json({ success: true, message: 'Gemini API conectada com sucesso!' });
      } else {
        const errText = await response.text();
        return res.status(400).json({ error: `Falha no teste do Gemini: ${errText}` });
      }
    } else {
      // Test Anthropic key using standard fetch call to save package imports overhead
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': testKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Ping' }]
        })
      });

      if (response.ok) {
        return res.json({ success: true, message: 'Anthropic API conectada com sucesso!' });
      } else {
        const errText = await response.text();
        return res.status(400).json({ error: `Falha no teste do Claude: ${errText}` });
      }
    }
  } catch (error) {
    console.error(`[Route:Settings] User ${userId}: API connection test error:`, error.message);
    res.status(500).json({ error: 'Falha ao testar chave de API.' });
  }
});

// GET /api/metrics — return dashboard metrics
router.get('/metrics', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const metrics = getMetrics(userId);
    res.json(metrics);
  } catch (error) {
    console.error(`[Route:Settings] User ${userId}: Error getting metrics:`, error.message);
    res.status(500).json({ error: 'Falha ao carregar métricas.' });
  }
});

// GET /api/blacklist — return blacklisted contacts
router.get('/blacklist', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const blacklist = getBlacklist(userId);
    res.json(blacklist);
  } catch (error) {
    console.error(`[Route:Settings] User ${userId}: Error getting blacklist:`, error.message);
    res.status(500).json({ error: 'Falha ao carregar lista negra.' });
  }
});

// POST /api/blacklist — add or remove a contact from blacklist
router.post('/blacklist', authenticateToken, (req, res) => {
  const userId = req.user.id;
  try {
    const { contactId, blacklisted } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'contactId é obrigatório.' });
    }

    if (blacklisted === undefined || blacklisted === null) {
      return res.status(400).json({ error: 'Campo blacklisted é obrigatório.' });
    }

    setBlacklist(userId, contactId, blacklisted);
    res.json({ success: true });
  } catch (error) {
    console.error(`[Route:Settings] User ${userId}: Error updating blacklist:`, error.message);
    res.status(500).json({ error: 'Falha ao atualizar lista negra.' });
  }
});

export default router;
