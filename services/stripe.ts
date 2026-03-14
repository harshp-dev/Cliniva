import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  }

  return stripeClient;
}

export async function createPaymentIntent(amountCents: number, currency: string, metadata: Record<string, string>) {
  const stripe = getStripeClient();
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata
  });
}
