import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api";

/**
 * GET /api/user/me
 * Get current authenticated user's basic info including role
 * Used for determining redirect after login
 */
export async function GET() {
  try {
    const userId = await requireAuth();
    if (!userId) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        display_name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
