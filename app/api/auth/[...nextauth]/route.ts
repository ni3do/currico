import { NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
} from "@/lib/rateLimit";

export const { GET } = handlers;

// Wrap POST handler with rate limiting for credentials login
export async function POST(request: NextRequest) {
  // Check if this is a credentials login attempt
  const url = new URL(request.url);
  const isSignIn = url.pathname.includes("callback/credentials");

  if (isSignIn) {
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP, "auth:login");

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimitResult),
        }
      );
    }
  }

  // Pass through to NextAuth handler
  return handlers.POST(request);
}
