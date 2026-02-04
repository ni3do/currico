import { NextRequest, NextResponse } from "next/server";
import { prisma, privateUserSelect } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
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
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: privateUserSelect,
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    // Ensure JSON array fields are proper arrays
    return NextResponse.json({
      ...user,
      subjects: toStringArray(user.subjects),
      cycles: toStringArray(user.cycles),
      cantons: toStringArray(user.cantons),
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
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
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
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
    const {
      subjects,
      cycles,
      cantons,
      instagram,
      pinterest,
      is_private,
      website,
      school,
      teaching_experience,
      preferred_language,
      ...restData
    } = data;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...restData,
        ...(subjects !== undefined && { subjects: { set: subjects } }),
        ...(cycles !== undefined && { cycles: { set: cycles } }),
        ...(cantons !== undefined && { cantons: { set: cantons } }),
        instagram: instagram ?? null,
        pinterest: pinterest ?? null,
        website: website || null,
        school: school ?? null,
        teaching_experience: teaching_experience ?? null,
        ...(preferred_language !== undefined && { preferred_language }),
        ...(is_private !== undefined && { is_private }),
      },
      select: privateUserSelect,
    });

    // Ensure JSON array fields are proper arrays
    return NextResponse.json({
      ...updatedUser,
      subjects: toStringArray(updatedUser.subjects),
      cycles: toStringArray(updatedUser.cycles),
      cantons: toStringArray(updatedUser.cantons),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
