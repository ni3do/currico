import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";

const registrationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and numbers"
    ),
  canton: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  cycles: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, "auth:register");

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimitResult),
      }
    );
  }

  try {
    const body = await request.json();

    // Validate input with schema
    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Ungültige Eingabe" },
        { status: 400 }
      );
    }

    const { name, email, password, canton, subjects, cycles } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ein Benutzer mit dieser E-Mail existiert bereits" },
        { status: 400 }
      );
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 12);

    // Create the user and link any past guest purchases
    const user = await prisma.$transaction(async (tx) => {
      // Create the user (all new users start as BUYER)
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password_hash,
          display_name: name,
          cantons: canton ? [canton] : [],
          subjects: subjects || [],
          cycles: cycles || [],
          role: "BUYER",
        },
      });

      // Find all completed guest transactions with this email
      const guestTransactions = await tx.transaction.findMany({
        where: {
          guest_email: email,
          buyer_id: null,
          status: "COMPLETED",
        },
        select: {
          id: true,
          resource_id: true,
        },
      });

      if (guestTransactions.length > 0) {
        // Link transactions to the new user
        await tx.transaction.updateMany({
          where: {
            guest_email: email,
            buyer_id: null,
            status: "COMPLETED",
          },
          data: {
            buyer_id: newUser.id,
          },
        });

        // Create Download records for each purchased resource
        // (grants permanent library access)
        const downloadRecords = guestTransactions.map((t) => ({
          user_id: newUser.id,
          resource_id: t.resource_id,
        }));

        // Use createMany with skipDuplicates in case user already has access
        await tx.download.createMany({
          data: downloadRecords,
          skipDuplicates: true,
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        message: "Benutzer erfolgreich erstellt",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}
