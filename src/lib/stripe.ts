import Stripe from "stripe";

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Platform fee percentage (5%)
export const PLATFORM_FEE_PERCENT = 5;

/**
 * Calculate platform fee and traveler payout
 * @param amount Total amount in cents
 * @returns { platformFee, travelerPayout }
 */
export function calculateFees(amount: number) {
  const platformFee = Math.round((amount * PLATFORM_FEE_PERCENT) / 100);
  const travelerPayout = amount - platformFee;
  return { platformFee, travelerPayout };
}

/**
 * Create a Stripe Checkout session for a delivery request payment
 */
export async function createCheckoutSession({
  deliveryRequestId,
  amount,
  currency,
  customerEmail,
  travelerConnectAccountId,
  successUrl,
  cancelUrl,
}: {
  deliveryRequestId: string;
  amount: number; // in cents
  currency: string;
  customerEmail: string;
  travelerConnectAccountId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const { platformFee, travelerPayout } = calculateFees(amount);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: "Delivery Service",
            description: `Package delivery via Porta (Traveler receives $${(travelerPayout / 100).toFixed(2)})`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      // This enables us to transfer funds later
      transfer_data: {
        destination: travelerConnectAccountId,
        amount: travelerPayout, // Traveler gets amount minus platform fee
      },
      // Hold funds until we confirm delivery (manual capture)
      capture_method: "manual",
      metadata: {
        deliveryRequestId,
        platformFee: platformFee.toString(),
        travelerPayout: travelerPayout.toString(),
      },
    },
    metadata: {
      deliveryRequestId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Capture a held payment (called when delivery is confirmed)
 */
export async function capturePayment(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
  return paymentIntent;
}

/**
 * Cancel/refund a held payment
 */
export async function cancelPayment(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
  return paymentIntent;
}

/**
 * Create a Stripe Connect account for a traveler
 */
export async function createConnectAccount({
  email,
  userId,
}: {
  email: string;
  userId: string;
}) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    metadata: {
      userId,
    },
    capabilities: {
      transfers: { requested: true },
    },
  });

  return account;
}

/**
 * Create an account link for Connect onboarding
 */
export async function createAccountLink({
  accountId,
  refreshUrl,
  returnUrl,
}: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return accountLink;
}

/**
 * Check if a Connect account has completed onboarding
 */
export async function checkAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  };
}

/**
 * Create an account session for Embedded Onboarding
 */
export async function createAccountSession(accountId: string) {
  const accountSession = await stripe.accountSessions.create({
    account: accountId,
    components: {
      account_onboarding: { enabled: true },
    },
  });
  return accountSession;
}
