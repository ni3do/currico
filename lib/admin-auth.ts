import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Verifies that the current user is authenticated and has ADMIN role.
 * Returns the user if authorized, or null if not.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

/**
 * Returns a 403 Forbidden response for admin endpoints.
 * @deprecated Use `forbiddenResponse()` instead — renamed for clarity (returns 403, not 401).
 */
export function unauthorizedResponse() {
  return forbiddenResponse();
}

/**
 * Returns a 403 Forbidden response for admin endpoints.
 */
export function forbiddenResponse() {
  return NextResponse.json({ error: "Zugriff verweigert", code: "FORBIDDEN" }, { status: 403 });
}
