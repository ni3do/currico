import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSwissEducationDomain } from "@/lib/config/swiss-school-domains";
import { badRequest, serverError } from "@/lib/api";
import { captureError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return badRequest("MISSING_TOKEN");
  }

  try {
    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!verificationToken) {
      return badRequest("INVALID_TOKEN");
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return badRequest("TOKEN_EXPIRED");
    }

    // Check if user already verified (edge case if they click link twice)
    if (verificationToken.user.emailVerified) {
      // Clean up token since it's no longer needed
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json({
        message: "E-Mail-Adresse ist bereits bestätigt",
        alreadyVerified: true,
      });
    }

    // Check if the user's email qualifies for automatic teacher verification
    const shouldVerifyTeacher = isSwissEducationDomain(verificationToken.user.email);
    const now = new Date();

    // Update user's emailVerified field and delete the token in a transaction
    // Also auto-verify teacher status if email domain qualifies
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.user_id },
        data: {
          emailVerified: now,
          ...(shouldVerifyTeacher && {
            is_teacher_verified: true,
            teacher_verified_at: now,
            teacher_verification_method: "email_domain",
          }),
        },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return NextResponse.json({
      message: "E-Mail-Adresse erfolgreich bestätigt",
      verified: true,
      teacherVerified: shouldVerifyTeacher,
    });
  } catch (error) {
    captureError("Verify email error:", error);
    return serverError();
  }
}
