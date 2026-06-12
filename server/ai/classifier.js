import Anthropic from '@anthropic-ai/sdk';
import { getSetting } from '../db/database.js';

export const VALID_STAGES = [
  'novo-lead',
  'qualificando',
  'proposta-enviada',
  'negociando',
  'fechado',
  'em-producao',
  'entregue',
  'perdido',
];

export const STAGE_LABELS = {
  'novo-lead': 'Novo Lead',
  'qualificando': 'Qualificando',
  'proposta-enviada': 'Proposta Enviada',
  'negociando': 'Negociando',
  'fechado': 'Fechado',
  'em-producao': 'Em Produção',
  'entregue': 'Entregue',
  'perdido': 'Perdido',
};

// SYSTEM_PROMPT is dynamically generated inside getDynamicSystemPrompt using user settings

/**
 * Generate a dynamic system prompt with custom stage-specific boost keywords for a user.
 */
function getDynamicSystemPrompt(uId) {
  const companyName = getSetting(uId, 'profile_empresa') || 'NEXDASH';

  let novoLeadLabel = 'Novo Lead';
  let qualificandoLabel = 'Qualificando';
  let propostaEnviadaLabel = 'Proposta Enviada';
  let negociandoLabel = 'Em Negociação';
  let fechadoLabel = 'Fechado';
  let emProducaoLabel = 'Em Produção';
  let entregueLabel = 'Entregue';
  let perdidoLabel = 'Perdido';

  try {
    const pipelinesStr = getSetting(uId, 'dgflow_custom_pipelines');
    if (pipelinesStr) {
      const pipelines = JSON.parse(pipelinesStr);
      const principal = pipelines.find(p => p.id === 'principal');
      if (principal) {
        const getLabel = (id, def) => {
          const s = principal.stages.find(st => st.id === id);
          return s ? s.label : def;
        };
        novoLeadLabel = getLabel('novo-lead', novoLeadLabel);
        qualificandoLabel = getLabel('qualificando', qualificandoLabel);
        propostaEnviadaLabel = getLabel('proposta-enviada', propostaEnviadaLabel);
        negociandoLabel = getLabel('negociando', negociandoLabel);
        fechadoLabel = getLabel('fechado', fechadoLabel);
        emProducaoLabel = getLabel('em-producao', emProducaoLabel);
        entregueLabel = getLabel('entregue', entregueLabel);
        perdidoLabel = getLabel('perdido', perdidoLabel);
      }
    }
  } catch (err) {
    console.error(`[Classifier] Error parsing custom pipelines for prompt:`, err.message);
  }

  let prompt = `You are a CRM classifier for a company in Brazil called "${companyName}".
Analyze this WhatsApp conversation and determine which sales stage this client is in.
Respond with ONLY a JSON object: {"stage": "stage-name", "confidence": 0.95, "reason": "brief explanation in Portuguese"}

Stages:
- novo-lead (${novoLeadLabel}): First contact, asking about services, "vi seu trabalho", "tem disponibilidade"
- qualificando (${qualificandoLabel}): Discussing project details, dates, event type, location
- proposta-enviada (${propostaEnviadaLabel}): Price/budget mentioned, "vou te mandar o orçamento", "segue a proposta"
- negociando (${negociandoLabel}): "tá um pouco caro", "tem desconto", "vou pensar", "posso parcelar?"
- fechado (${fechadoLabel}): "fechado!", "pode confirmar", "vou fazer o pix", contract signing
- em-producao (${emProducaoLabel}): "quando vai ficar pronto", "já editou?", delivery happening
- entregue (${entregueLabel}): "amei!", "ficou incrível", project concluded
- perdido (${perdidoLabel}): "desisti", "vou fazer com outro", prolonged silence`;

  try {
    const novoLead = getSetting(uId, 'keywords_novo-lead');
    const qualificando = getSetting(uId, 'keywords_qualificando');
    const propostaEnviada = getSetting(uId, 'keywords_proposta-enviada');
    const negociando = getSetting(uId, 'keywords_negociando');
    const fechado = getSetting(uId, 'keywords_fechado');
    const emProducao = getSetting(uId, 'keywords_em-producao');
    const entregue = getSetting(uId, 'keywords_entregue');
    const perdido = getSetting(uId, 'keywords_perdido');

    const keywordsPrompt = `

Custom boost keywords for classification (use these keywords/phrases to boost confidence in the respective stage):
- novo-lead (${novoLeadLabel}): ${novoLead || 'None'}
- qualificando (${qualificandoLabel}): ${qualificando || 'None'}
- proposta-enviada (${propostaEnviadaLabel}): ${propostaEnviada || 'None'}
- negociando (${negociandoLabel}): ${negociando || 'None'}
- fechado (${fechadoLabel}): ${fechado || 'None'}
- em-producao (${emProducaoLabel}): ${emProducao || 'None'}
- entregue (${entregueLabel}): ${entregue || 'None'}
- perdido (${perdidoLabel}): ${perdido || 'None'}
`;
    prompt += keywordsPrompt;
  } catch (err) {
    console.error(`[Classifier] Error generating dynamic system prompt for user ${uId}:`, err.message);
  }
  return prompt;
}

/**
 * Classify a WhatsApp conversation based on the user's AI settings.
 * @param {string|number} userId - The system user ID
 * @param {string} conversationText - Formatted conversation text
 * @returns {Promise<{stage: string, confidence: number, reason: string}|null>}
 */
export async function classifyConversation(userId, conversationText) {
  const uId = String(userId);
  
  try {
    const provider = getSetting(uId, 'ai_provider') || 'gemini';

    if (provider === 'gemini') {
      return await classifyWithGemini(uId, conversationText);
    } else {
      return await classifyWithClaude(uId, conversationText);
    }
  } catch (error) {
    console.error(`[Classifier] User ${uId}: Global classification error:`, error.message);
    return null;
  }
}

/**
 * Classify using Google Gemini 1.5 Flash (Free Tier).
 */
async function classifyWithGemini(uId, conversationText) {
  try {
    const apiKey = getSetting(uId, 'gemini_api_key') || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn(`[Classifier] User ${uId}: No Gemini API key configured. Skipping classification.`);
      return null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const dynamicPrompt = getDynamicSystemPrompt(uId);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ 
              text: `${dynamicPrompt}\n\nAnalise esta conversa de WhatsApp e responda estritamente com o objeto JSON correspondente:\n\n${conversationText}` 
            }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error(`[Classifier] User ${uId}: Empty response from Gemini.`);
      return null;
    }

    return parseAndValidateResponse(uId, text);
  } catch (error) {
    console.error(`[Classifier] User ${uId}: Gemini classification error:`, error.message);
    return null;
  }
}

/**
 * Classify using Anthropic Claude 3.5 Sonnet.
 */
async function classifyWithClaude(uId, conversationText) {
  try {
    const apiKey = getSetting(uId, 'anthropic_api_key') || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.warn(`[Classifier] User ${uId}: No Anthropic API key configured. Skipping classification.`);
      return null;
    }

    const client = new Anthropic({ apiKey });
    const dynamicPrompt = getDynamicSystemPrompt(uId);

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Updated to latest 3.5 Sonnet
      max_tokens: 256,
      system: dynamicPrompt,
      messages: [
        {
          role: 'user',
          content: conversationText,
        },
      ],
    });

    const text = response.content[0]?.text;

    if (!text) {
      console.error(`[Classifier] User ${uId}: Empty response from Claude.`);
      return null;
    }

    return parseAndValidateResponse(uId, text);
  } catch (error) {
    console.error(`[Classifier] User ${uId}: Claude classification error:`, error.message);
    return null;
  }
}

/**
 * Helper to clean, parse, and validate JSON output from AI.
 */
function parseAndValidateResponse(uId, rawText) {
  try {
    let jsonStr = rawText.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    if (!parsed.stage || !VALID_STAGES.includes(parsed.stage)) {
      console.error(`[Classifier] User ${uId}: Invalid stage received:`, parsed.stage);
      return null;
    }

    return {
      stage: parsed.stage,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      reason: parsed.reason || '',
    };
  } catch (err) {
    console.error(`[Classifier] User ${uId}: Failed to parse AI JSON response:`, err.message);
    return null;
  }
}
