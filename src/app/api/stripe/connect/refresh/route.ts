import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Handle return from Stripe Connect onboarding refresh
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Redirect back to start onboarding again
  return NextResponse.redirect(new URL("/dashboard?connect=refresh", request.url));
}
