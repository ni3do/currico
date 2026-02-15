import { NextRequest, NextResponse } from "next/server";
import { prisma, privateUserSelect } from "@/lib/db";
import { toStringArray } from "@/lib/json-array";
import { updateProfileSchema } from "@/lib/validations/user";
import { getCurrentUserId } from "@/lib/auth";
import { unauthorized, notFound, serverError } from "@/lib/api";

/**
 * GET /api/users/me
 * Get the current user's private profile
 * Access: Authenticated user only
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: privateUserSelect,
    });

    if (!user) {
      return notFound();
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
    return serverError();
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
      return unauthorized();
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
        ...(subjects !== undefined && { subjects }),
        ...(cycles !== undefined && { cycles }),
        ...(cantons !== undefined && { cantons }),
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
    return serverError();
  }
}

/**
 * DELETE /api/users/me
 * Delete the current user's account and all associated data
 * Access: Authenticated user only
 */
export async function DELETE() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorized();
    }

    // Check for completed transactions where user is seller (cannot delete)
    const sellerTransactions = await prisma.transaction.count({
      where: {
        resource: { seller_id: userId },
        status: "COMPLETED",
      },
    });

    if (sellerTransactions > 0) {
      return NextResponse.json(
        {
          error:
            "Konto kann nicht gelöscht werden, da Sie verkaufte Materialien haben. Bitte kontaktieren Sie den Support.",
        },
        { status: 400 }
      );
    }

    // Use a transaction to clean up FK dependencies not covered by onDelete: Cascade
    await prisma.$transaction(async (tx) => {
      // Nullify buyer_id on transactions where user is buyer (preserves seller history)
      await tx.transaction.updateMany({
        where: { buyer_id: userId },
        data: { buyer_id: null },
      });

      // Delete transactions referencing user's resources (preserves user but removes orphans)
      await tx.transaction.deleteMany({
        where: { resource: { seller_id: userId } },
      });

      // Delete user's resources (sub-relations cascade via onDelete: Cascade)
      await tx.resource.deleteMany({
        where: { seller_id: userId },
      });

      // Delete user (remaining relations cascade via onDelete: Cascade)
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({ message: "Konto erfolgreich gelöscht" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return serverError();
  }
}
