import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAccountStatus } from "@/lib/stripe";

// Handle return from Stripe Connect onboarding
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Get user's Connect account and check status
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (user?.stripeConnectAccountId) {
    const status = await checkAccountStatus(user.stripeConnectAccountId);
    
    if (status.detailsSubmitted) {
      // Update onboarding status
      await db.update(users)
        .set({ 
          stripeConnectOnboardingComplete: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return NextResponse.redirect(new URL("/dashboard?connect=success", request.url));
    }
  }

  // Onboarding not complete
  return NextResponse.redirect(new URL("/dashboard?connect=incomplete", request.url));
}
