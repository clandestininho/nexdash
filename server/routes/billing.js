import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getUserById, updateUserPlan, updateUserAdminDetails } from '../db/master.js';

const router = Router();

// Pricing catalog
const PLAN_PRICES = {
  basico: { monthly: 49, yearly: 468 },
  pro: { monthly: 99, yearly: 948 },
  next: { monthly: 199, yearly: 1908 }
};

const PLAN_NAMES = {
  basico: 'Plano Básico',
  pro: 'Plano Pro',
  next: 'Plano NEXT'
};

// POST /api/billing/checkout - Generate payment preference link
router.post('/checkout', authenticateToken, async (req, res) => {
  const { plan, billingPeriod } = req.body;
  const userId = req.user.id;

  if (!plan || !PLAN_PRICES[plan]) {
    return res.status(400).json({ error: 'Plano selecionado inválido.' });
  }

  const period = billingPeriod === 'yearly' ? 'yearly' : 'monthly';
  const price = PLAN_PRICES[plan][period];
  const planName = PLAN_NAMES[plan] + (period === 'yearly' ? ' (Anual)' : ' (Mensal)');

  try {
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const mpToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_API_KEY;
    const isMock = !mpToken;

    const externalReference = `saas_sub_${userId}_${plan}_${period}`;

    // Backend domain helper for webhooks
    const hostUrl = req.get('host');
    const protocol = req.protocol;
    const publicUrl = `${protocol}://${hostUrl}`;

    if (isMock) {
      // Return local simulation URL
      const mockCheckoutUrl = `${publicUrl}/api/billing/simulate-checkout?ref=${externalReference}&price=${price}&name=${encodeURIComponent(planName)}`;
      return res.json({ checkoutUrl: mockCheckoutUrl, simulated: true });
    }

    // Call real Mercado Pago API
    const verifyUrl = 'https://api.mercadopago.com/checkout/preferences';
    const preferenceBody = {
      items: [
        {
          id: `${plan}_${period}`,
          title: `NEXDASH - ${planName}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: price
        }
      ],
      payer: {
        name: user.name || 'Assinante',
        email: user.email
      },
      external_reference: externalReference,
      back_urls: {
        success: `${publicUrl}/settings?tab=assinatura&status=success`,
        failure: `${publicUrl}/settings?tab=assinatura&status=failure`,
        pending: `${publicUrl}/settings?tab=assinatura&status=pending`
      },
      auto_return: 'approved',
      notification_url: `${publicUrl}/api/billing/webhook-saas`
    };

    const mpRes = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceBody)
    });

    if (!mpRes.ok) {
      const errBody = await mpRes.text();
      throw new Error(`MP API Error: ${errBody}`);
    }

    const mpData = await mpRes.json();
    res.json({ checkoutUrl: mpData.init_point, simulated: false });

  } catch (err) {
    console.error('[BillingRoute] Checkout failure:', err.message);
    res.status(500).json({ error: `Erro ao gerar checkout: ${err.message}` });
  }
});

// GET /api/billing/simulate-checkout - Renders a sleek mockup portal for offline testing
router.get('/simulate-checkout', (req, res) => {
  const { ref, price, name } = req.query;

  if (!ref || !price || !name) {
    return res.send('<h2>Erro: Parâmetros inválidos para simulação.</h2>');
  }

  // Renders a high-fidelity glassmorphism credit card and PIX mockup aligned with NEXDASH style
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Portal de Faturamento — NEXDASH</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #050505;
          color: #f2f2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .card {
          width: 100%;
          max-width: 440px;
          background-color: #0c0c0e;
          border: 1px solid #1f1f23;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8);
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #e13a40, #ff483d);
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
        }
        .logo {
          font-size: 20px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 2px;
          margin-bottom: 5px;
        }
        .logo span {
          color: #e13a40;
        }
        .subtitle {
          font-size: 11px;
          color: #e13a40;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .summary {
          background-color: #121215;
          border: 1px solid #25252b;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 25px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .summary-row:last-child {
          margin-bottom: 0;
        }
        .label {
          color: #71717a;
          font-weight: 600;
        }
        .val {
          color: #ffffff;
          font-weight: 700;
        }
        .price-val {
          color: #e13a40;
          font-weight: 900;
          font-size: 18px;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
        }
        .btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
        }
        .btn-pix {
          background: linear-gradient(135deg, #e13a40 0%, #ff483d 100%);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(225, 58, 64, 0.3);
        }
        .btn-pix:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-card {
          background-color: #121215;
          border: 1px solid #27272a;
          color: #e4e4e7;
        }
        .btn-card:hover {
          background-color: #1c1c22;
          color: #ffffff;
        }
        .footer-note {
          font-size: 10px;
          color: #52525b;
          text-align: center;
          line-height: 1.4;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">NEX<span>DASH</span></div>
          <div class="subtitle">Simulador de Checkout SaaS</div>
        </div>
        
        <div class="summary">
          <div class="summary-row">
            <span class="label">Item:</span>
            <span class="val">${name}</span>
          </div>
          <div class="summary-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #25252b;">
            <span class="label" style="align-self: center;">Valor a Pagar:</span>
            <span class="price-val">R$ ${price},00</span>
          </div>
        </div>

        <div class="section-title">Escolha a Forma de Pagamento Simulado:</div>
        
        <form action="/api/billing/webhook-saas" method="POST">
          <input type="hidden" name="ref" value="${ref}" />
          <input type="hidden" name="simulated" value="true" />
          
          <button type="submit" name="method" value="PIX" class="btn btn-pix">
            ⚡ Pagar com PIX Simulado
          </button>
          
          <button type="submit" name="method" value="Cartão de Crédito" class="btn btn-card">
            💳 Pagar com Cartão Simulado
          </button>
        </form>

        <div class="footer-note">
          Esta é uma tela de teste de faturamento seguro e isolada.<br>
          Nenhum dinheiro real será cobrado ou transferido.
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// POST /api/billing/webhook-saas - Handle payment processing (Mock and Real)
router.post('/webhook-saas', async (req, res) => {
  try {
    const payload = req.body;
    let externalReference = '';
    let method = 'PIX';

    console.log('[WebhookSaaS] Received payment confirmation webhook:', payload);

    // 1. Check if simulated (local mock form POST)
    if (payload.simulated === 'true' && payload.ref) {
      externalReference = payload.ref;
      method = payload.method || 'PIX';
    } 
    // 2. Real Mercado Pago Webhook Check
    else if (payload.action && payload.data?.id) {
      const action = payload.action;
      if (action === 'payment.created' || action === 'payment.updated') {
        const mpPaymentId = payload.data.id;
        const mpToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_API_KEY;

        if (mpToken) {
          const verifyUrl = `https://api.mercadopago.com/v1/payments/${mpPaymentId}`;
          const mpRes = await fetch(verifyUrl, {
            headers: { 'Authorization': `Bearer ${mpToken}` }
          });
          if (mpRes.ok) {
            const paymentInfo = await mpRes.json();
            if (paymentInfo.status === 'approved') {
              externalReference = paymentInfo.external_reference;
              method = paymentInfo.payment_method_id === 'pix' ? 'PIX' : 'Cartão de Crédito (Mercado Pago)';
            }
          }
        }
      }
    }

    if (externalReference && externalReference.startsWith('saas_sub_')) {
      const parts = externalReference.split('_');
      // format: saas_sub_userId_plan_period
      if (parts.length >= 5) {
        const userId = parseInt(parts[2], 10);
        const plan = parts[3];
        const period = parts[4];

        // Activate plan in SQLite Master Database
        const user = getUserById(userId);
        if (user) {
          // Calculate expiration based on period
          const expDate = new Date();
          if (period === 'yearly') {
            expDate.setFullYear(expDate.getFullYear() + 1);
          } else {
            expDate.setMonth(expDate.getMonth() + 1);
          }
          const trialEndsAt = expDate.toISOString().replace('T', ' ').substring(0, 19);
          const amountPaid = PLAN_PRICES[plan][period];

          updateUserAdminDetails(userId, {
            plan: plan,
            trial_ends_at: trialEndsAt,
            amount_paid: amountPaid,
            billing_cycle: period,
            last_payment_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
          });

          console.log(`[WebhookSaaS] User ${userId} successfully upgraded to plan ${plan.toUpperCase()} (${period})!`);
        }
      }
    }

    // If it was a simulated POST from browser, redirect the user back with success query
    if (payload.simulated === 'true') {
      return res.redirect('http://localhost:5173/settings?tab=assinatura&status=success');
    }

    res.json({ received: true });

  } catch (err) {
    console.error('[WebhookSaaS] Webhook processing failure:', err.message);
    res.status(500).json({ error: `Webhook error: ${err.message}` });
  }
});

export default router;
