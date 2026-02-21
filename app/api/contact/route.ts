import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendContactNotificationEmail } from "@/lib/email";
import { rateLimited, badRequest, serverError, API_ERROR_CODES } from "@/lib/api";
import { captureError } from "@/lib/api-error";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.enum(["general", "support", "sales", "partnership", "feedback", "refund"], {
    message: "Invalid topic",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be at most 5000 characters"),
  consent: z.literal(true, {
    message: "Privacy policy consent required",
  }),
});

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, "contact:submit");

  if (!rateLimitResult.success) {
    return rateLimited();
  }

  try {
    const body = await request.json();

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return badRequest(
        firstError?.message ?? "Invalid input",
        undefined,
        API_ERROR_CODES.INVALID_INPUT
      );
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
      captureError("Failed to send contact notification email:", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent",
        id: contactMessage.id,
      },
      { status: 201 }
    );
  } catch (error) {
    captureError("Contact form error:", error);
    return serverError();
  }
}
