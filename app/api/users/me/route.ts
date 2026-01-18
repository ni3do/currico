import { NextRequest, NextResponse } from "next/server";
import { prisma, privateUserSelect } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/user";
import { getCurrentUserId } from "@/lib/auth";

/**
 * GET /api/users/me
 * Get the current user's private profile
 * Access: Authenticated user only
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: privateUserSelect,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me
 * Update the current user's profile
 * Access: Authenticated user only
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabe",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Update user - transform arrays for Prisma
    const { subjects, cycles, cantons, ...restData } = data;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...restData,
        ...(subjects && { subjects: { set: subjects } }),
        ...(cycles && { cycles: { set: cycles } }),
        ...(cantons && { cantons: { set: cantons } }),
      },
      select: privateUserSelect,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
