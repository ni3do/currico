import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendContactNotificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIP, rateLimitHeaders } from "@/lib/rateLimit";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen lang sein")
    .max(100, "Name darf maximal 100 Zeichen lang sein"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.enum(["general", "support", "sales", "partnership", "feedback"], {
    message: "Bitte wählen Sie ein gültiges Thema",
  }),
  message: z
    .string()
    .min(10, "Nachricht muss mindestens 10 Zeichen lang sein")
    .max(5000, "Nachricht darf maximal 5000 Zeichen lang sein"),
  consent: z.literal(true, {
    message: "Sie müssen der Datenschutzrichtlinie zustimmen",
  }),
});

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, "contact:submit");

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const body = await request.json();

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json({ error: firstError?.message ?? "Invalid input" }, { status: 400 });
    }

    const { name, email, phone, subject, message } = parsed.data;

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
      },
    });

    // Send email notification to admin (non-blocking)
    sendContactNotificationEmail({ name, email, subject, message }).catch((err: unknown) => {
      console.error("Failed to send contact notification email:", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Ihre Nachricht wurde erfolgreich gesendet",
        id: contactMessage.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Beim Senden Ihrer Nachricht ist ein Fehler aufgetreten" },
      { status: 500 }
    );
  }
}
