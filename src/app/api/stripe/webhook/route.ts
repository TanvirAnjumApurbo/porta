import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe, calculateFees } from "@/lib/stripe";
import { db } from "@/lib/db";
import { deliveryRequests, transactions, travelPosts, notifications, activityLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        // Payment captured successfully (after delivery confirmation)
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment captured:", paymentIntent.id);
        break;
      }

      case "payment_intent.canceled": {
        // Payment was canceled/refunded
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const deliveryRequestId = session.metadata?.deliveryRequestId;
  
  if (!deliveryRequestId) {
    console.error("No delivery request ID in session metadata");
    return;
  }

  // Get the payment intent for this session
  const paymentIntentId = session.payment_intent as string;
  
  // Get delivery request
  const request = await db.query.deliveryRequests.findFirst({
    where: eq(deliveryRequests.id, deliveryRequestId),
    with: {
      travelPost: true,
    },
  });

  if (!request) {
    console.error("Delivery request not found:", deliveryRequestId);
    return;
  }

  // Calculate fees
  const { platformFee, travelerPayout } = calculateFees(request.offeredPrice);

  // Deduct weight from travel post
  const post = request.travelPost;
  if (post) {
    const currentRemaining = post.remainingWeight || 0;
    const newRemaining = Math.max(0, currentRemaining - request.offeredWeight);
    const newStatus = newRemaining <= 0 ? "LOCKED" : post.postStatus;

    await db.update(travelPosts)
      .set({
        remainingWeight: newRemaining,
        postStatus: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(travelPosts.id, post.id));
  }

  // Create transaction record with HELD status (payment authorized but not captured)
  await db.insert(transactions).values({
    deliveryRequestId,
    amount: request.offeredPrice,
    currency: request.currency,
    status: "HELD",
    stripePaymentIntentId: paymentIntentId,
    platformFee,
    travelerPayout,
    paidAt: new Date(),
  });

  // Update request status to PAID
  await db.update(deliveryRequests)
    .set({ status: "PAID", updatedAt: new Date() })
    .where(eq(deliveryRequests.id, deliveryRequestId));

  // Create notification for traveler
  await db.insert(notifications).values({
    userId: request.travellerId,
    type: "PAYMENT_RECEIVED",
    title: "Payment Secured!",
    message: `$${(request.offeredPrice / 100).toFixed(2)} has been secured. You'll receive $${(travelerPayout / 100).toFixed(2)} after delivery confirmation.`,
    relatedRequestId: deliveryRequestId,
  });

  // Log activity
  await db.insert(activityLogs).values({
    deliveryRequestId,
    action: "PAYMENT_MADE",
    performedBy: request.customerId,
    metadata: { 
      amount: request.offeredPrice, 
      currency: request.currency,
      platformFee,
      travelerPayout,
      paymentIntentId,
    },
  });

  console.log("Checkout completed for request:", deliveryRequestId);
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const deliveryRequestId = paymentIntent.metadata?.deliveryRequestId;
  
  if (!deliveryRequestId) {
    console.log("No delivery request ID in payment intent metadata");
    return;
  }

  // Update transaction status to refunded
  const transaction = await db.query.transactions.findFirst({
    where: eq(transactions.stripePaymentIntentId, paymentIntent.id),
  });

  if (transaction) {
    await db.update(transactions)
      .set({ 
        status: "REFUNDED", 
        refundedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transaction.id));
  }

  console.log("Payment canceled for request:", deliveryRequestId);
}
