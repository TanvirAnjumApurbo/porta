import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createConnectAccount, createAccountLink, checkAccountStatus } from "@/lib/stripe";

// Create or get Stripe Connect account
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let accountId = user.stripeConnectAccountId;

    // Create Connect account if doesn't exist
    if (!accountId) {
      const account = await createConnectAccount({
        email: user.email,
        userId,
      });
      accountId = account.id;

      // Save account ID to user
      await db.update(users)
        .set({ 
          stripeConnectAccountId: accountId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Create onboarding link
    const accountLink = await createAccountLink({
      accountId,
      refreshUrl: `${appUrl}/api/stripe/connect/refresh`,
      returnUrl: `${appUrl}/api/stripe/connect/return`,
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("Connect account error:", error);
    return NextResponse.json(
      { error: "Failed to create connect account" },
      { status: 500 }
    );
  }
}

// Check Connect account status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeConnectAccountId) {
      return NextResponse.json({
        hasAccount: false,
        onboardingComplete: false,
      });
    }

    const status = await checkAccountStatus(user.stripeConnectAccountId);

    // Update onboarding status if needed
    if (status.detailsSubmitted && !user.stripeConnectOnboardingComplete) {
      await db.update(users)
        .set({ 
          stripeConnectOnboardingComplete: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({
      hasAccount: true,
      onboardingComplete: status.detailsSubmitted,
      chargesEnabled: status.chargesEnabled,
      payoutsEnabled: status.payoutsEnabled,
    });
  } catch (error) {
    console.error("Connect status error:", error);
    return NextResponse.json(
      { error: "Failed to check connect status" },
      { status: 500 }
    );
  }
}
