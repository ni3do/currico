import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIP,
  rateLimitHeaders,
} from "@/lib/rateLimit";

const registrationSchema = z.object({
  name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen haben")
    .max(50, "Name darf maximal 50 Zeichen haben"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen haben")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Passwort muss Gross-, Kleinbuchstaben und Zahlen enthalten"
    ),
  canton: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  cycles: z.array(z.string()).optional(),
  accountType: z.enum(["buyer", "school"]).optional(),
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

    const { name, email, password, canton, subjects, cycles, accountType } = parsed.data;

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

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        display_name: name,
        cantons: canton ? [canton] : [],
        subjects: subjects || [],
        cycles: cycles || [],
        role: accountType === "school" ? "SCHOOL" : "BUYER",
      },
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
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
