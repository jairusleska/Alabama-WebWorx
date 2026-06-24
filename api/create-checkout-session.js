// /api/create-checkout-session.js
// Vercel serverless function — creates a Stripe Embedded Checkout Session.
// Requires the STRIPE_SECRET_KEY environment variable to be set in your Vercel project settings.

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Map plan keys to the Stripe Price IDs for each subscription tier.
// Replace these with your actual Price IDs (find them in Stripe Dashboard -> Product Catalog -> click a product -> copy the Price ID, looks like "price_1AbC...").
const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  growth: process.env.STRIPE_PRICE_GROWTH,
  pro: process.env.STRIPE_PRICE_PRO,
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { plan } = req.body;
    const priceId = PRICE_IDS[plan];

    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${req.headers.origin || 'https://alabamawebworx.com'}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
    });

    res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error('Stripe session creation error:', err);
    res.status(500).json({ error: err.message });
  }
};
