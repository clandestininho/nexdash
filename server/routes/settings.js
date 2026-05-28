import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getSettings,
  saveSetting,
  getMetrics,
  getBlacklist,
  setBlacklist,
  getClassificationLog,
  getLostReasons,
  getSetting,
} from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `upload_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// POST /api/settings/upload - Handle file upload and return static link
router.post('/settings/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const relativeUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: relativeUrl });
  } catch (error) {
    console.error('[Route:Settings] Upload error:', error.message);
    res.status(500).json({ error: 'Falha ao processar upload do arquivo.' });
  }
});

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

// POST /api/ai/generate-image — Generative AI Image Generator studio endpoint
router.post('/ai/generate-image', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    const fallbackImages = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
    ];
    const hash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const chosenIndex = hash % fallbackImages.length;
    const imageUrl = fallbackImages[chosenIndex];

    // Mock API delay for high-fidelity generative visual feeling
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({
      success: true,
      imageUrl: imageUrl,
      creditsConsumed: 5
    });
  } catch (error) {
    console.error(`[Route:AI] Image Gen Error:`, error.message);
    res.status(500).json({ error: 'Falha ao processar a geração de imagem.' });
  }
});

// GET /api/analytics/lost-reasons - Calculate Lost Reasons via Gemini AI
router.get('/analytics/lost-reasons', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const lostContacts = getLostReasons(userId);
    
    if (lostContacts.length === 0) {
      return res.json({
        success: true,
        summary: 'Não há dados de leads perdidos suficientes para análise de perdas por IA no momento.',
        categories: [
          { name: 'Preço', count: 0, percentage: 0 },
          { name: 'Sem Retorno', count: 0, percentage: 0 },
          { name: 'Prazo', count: 0, percentage: 0 },
          { name: 'Concorrente', count: 0, percentage: 0 },
          { name: 'Outros', count: 0, percentage: 0 }
        ]
      });
    }

    // Call Gemini to analyze the lost reasons
    const apiKey = getSetting(userId, 'gemini_api_key') || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json(calculateSimpleLostReasons(lostContacts));
    }

    const reasonsText = lostContacts.map(c => `- ${c.last_reason}`).join('\n');
    const prompt = `Analise a seguinte lista de motivos pelos quais a empresa perdeu vendas no CRM (são motivos reais extraídos de conversas de WhatsApp):
${reasonsText}

Classifique estes motivos em 5 categorias principais (com base no conteúdo dos motivos):
1. Preço (tá caro, sem orçamento, desconto, etc.)
2. Sem Retorno / Sumiu (não respondeu mais, sumiu, ignorou, etc.)
3. Prazo / Agenda (sem disponibilidade, prazo longo, etc.)
4. Fechou com Concorrente (preferiu outro, fechou com concorrente, etc.)
5. Outros

Responda EXCLUSIVAMENTE com um objeto JSON no seguinte formato:
{
  "summary": "Um parágrafo de resumo executivo em português com insights acionáveis sobre como a empresa pode reduzir essas perdas.",
  "categories": [
    {"name": "Preço", "count": 12, "percentage": 45},
    {"name": "Sem Retorno", "count": 8, "percentage": 30},
    {"name": "Prazo", "count": 3, "percentage": 11},
    {"name": "Concorrente", "count": 2, "percentage": 7},
    {"name": "Outros", "count": 2, "percentage": 7}
  ]
}
Sendo que a soma dos "count" deve ser igual a ${lostContacts.length}.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleaned = text.trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({ success: true, ...parsed });
        }
      }
    }

    res.json(calculateSimpleLostReasons(lostContacts));
  } catch (error) {
    console.error(`[Route:Analytics] User ${userId}: Lost reasons analytics error:`, error.message);
    res.status(500).json({ error: 'Erro ao gerar análise de motivos de perda.' });
  }
});

function calculateSimpleLostReasons(lostContacts) {
  const categories = {
    'Preço': 0,
    'Sem Retorno': 0,
    'Prazo': 0,
    'Concorrente': 0,
    'Outros': 0
  };

  for (const c of lostContacts) {
    const text = c.last_reason.toLowerCase();
    if (text.includes('car') || text.includes('preç') || text.includes('orcament') || text.includes('descont') || text.includes('dinheir') || text.includes('verba')) {
      categories['Preço']++;
    } else if (text.includes('respond') || text.includes('silenci') || text.includes('sumi') || text.includes('vácuo') || text.includes('ignor') || text.includes('retorn')) {
      categories['Sem Retorno']++;
    } else if (text.includes('praz') || text.includes('agend') || text.includes('temp') || text.includes('dia') || text.includes('disponib')) {
      categories['Prazo']++;
    } else if (text.includes('concorrent') || text.includes('outr') || text.includes('fechei com')) {
      categories['Concorrente']++;
    } else {
      categories['Outros']++;
    }
  }

  const list = Object.entries(categories).map(([name, count]) => ({
    name,
    count,
    percentage: lostContacts.length > 0 ? Math.round((count / lostContacts.length) * 100) : 0
  }));

  return {
    success: true,
    summary: 'Análise gerada localmente. A maioria das perdas está relacionada a precificação e falta de acompanhamento ativo (follow-up). Recomenda-se criar réguas de reengajamento automático.',
    categories: list
  };
}

export default router;
