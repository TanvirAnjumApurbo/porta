import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deliveryRequests, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createCheckoutSession, PLATFORM_FEE_PERCENT, calculateFees } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deliveryRequestId } = await request.json();

    if (!deliveryRequestId) {
      return NextResponse.json(
        { error: "Delivery request ID is required" },
        { status: 400 }
      );
    }

    // Get the delivery request
    const deliveryRequest = await db.query.deliveryRequests.findFirst({
      where: eq(deliveryRequests.id, deliveryRequestId),
      with: {
        traveller: true,
      },
    });

    if (!deliveryRequest) {
      return NextResponse.json(
        { error: "Delivery request not found" },
        { status: 404 }
      );
    }

    // Verify user is the customer
    if (deliveryRequest.customerId !== userId) {
      return NextResponse.json(
        { error: "Only the customer can initiate payment" },
        { status: 403 }
      );
    }

    // Verify request is in ACCEPTED status
    if (deliveryRequest.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Request must be accepted before payment" },
        { status: 400 }
      );
    }

    // Check if traveler has completed Stripe Connect onboarding
    const traveler = deliveryRequest.traveller;
    if (!traveler?.stripeConnectAccountId || !traveler?.stripeConnectOnboardingComplete) {
      return NextResponse.json(
        { 
          error: "Traveler has not set up payment receiving. Please contact them.",
          code: "TRAVELER_NOT_SETUP"
        },
        { status: 400 }
      );
    }

    // Get customer email
    const customer = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!customer?.email) {
      return NextResponse.json(
        { error: "Customer email not found" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { platformFee, travelerPayout } = calculateFees(deliveryRequest.offeredPrice);

    // Create Stripe Checkout session
    const session = await createCheckoutSession({
      deliveryRequestId,
      amount: deliveryRequest.offeredPrice,
      currency: deliveryRequest.currency,
      customerEmail: customer.email,
      travelerConnectAccountId: traveler.stripeConnectAccountId,
      successUrl: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&request_id=${deliveryRequestId}`,
      cancelUrl: `${appUrl}/payment/cancel?request_id=${deliveryRequestId}`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      breakdown: {
        total: deliveryRequest.offeredPrice,
        platformFee,
        travelerPayout,
        platformFeePercent: PLATFORM_FEE_PERCENT,
      },
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
