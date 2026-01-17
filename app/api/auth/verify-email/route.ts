import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token fehlt", code: "MISSING_TOKEN" },
      { status: 400 }
    );
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
      return NextResponse.json(
        { error: "Ungültiger Token", code: "INVALID_TOKEN" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        {
          error: "Token ist abgelaufen. Bitte fordern Sie einen neuen Bestätigungslink an.",
          code: "TOKEN_EXPIRED",
        },
        { status: 400 }
      );
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

    // Update user's emailVerified field and delete the token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.user_id },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    return NextResponse.json({
      message: "E-Mail-Adresse erfolgreich bestätigt",
      verified: true,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
