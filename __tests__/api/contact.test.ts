import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/contact/route";
import { createMockRequest, parseResponse } from "../helpers/api-test-utils";
import { prisma } from "@/lib/db";
import { clearAllRateLimits } from "@/lib/rateLimit";

// Get mocked prisma functions
const mockContactMessageCreate = prisma.contactMessage.create as ReturnType<typeof vi.fn>;

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAllRateLimits();
  });

  it("successfully submits a contact message", async () => {
    mockContactMessageCreate.mockResolvedValue({
      id: "msg-123",
      name: "Test User",
      email: "test@example.com",
      subject: "general",
      message: "This is a test message",
      status: "NEW",
    });

    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        subject: "general",
        message: "This is a test message that is long enough",
        consent: true,
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ success: boolean; message: string; id: string }>(response);

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.id).toBe("msg-123");
  });

  it("accepts all valid subject types", async () => {
    const subjects = ["general", "support", "sales", "partnership", "feedback"];

    for (const subject of subjects) {
      mockContactMessageCreate.mockResolvedValue({
        id: `msg-${subject}`,
        subject,
      });

      const request = createMockRequest("/api/contact", {
        method: "POST",
        body: {
          name: "Test User",
          email: "test@example.com",
          subject,
          message: "This is a test message that is long enough",
          consent: true,
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    }
  });

  it("validates required consent", async () => {
    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        subject: "general",
        message: "This is a test message that is long enough",
        consent: false,
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("Datenschutzrichtlinie");
  });

  it("validates name minimum length", async () => {
    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "A",
        email: "test@example.com",
        subject: "general",
        message: "This is a test message that is long enough",
        consent: true,
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("mindestens 2 Zeichen");
  });

  it("validates email format", async () => {
    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "Test User",
        email: "invalid-email",
        subject: "general",
        message: "This is a test message that is long enough",
        consent: true,
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("E-Mail");
  });

  it("validates message minimum length", async () => {
    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        subject: "general",
        message: "Short",
        consent: true,
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("mindestens 10 Zeichen");
  });

  it("validates subject is a valid option", async () => {
    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        subject: "invalid-subject",
        message: "This is a test message that is long enough",
        consent: true,
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain("gültiges Thema");
  });

  it("handles optional phone field", async () => {
    mockContactMessageCreate.mockResolvedValue({
      id: "msg-123",
      phone: "+41 79 123 45 67",
    });

    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        phone: "+41 79 123 45 67",
        subject: "general",
        message: "This is a test message that is long enough",
        consent: true,
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockContactMessageCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        phone: "+41 79 123 45 67",
      }),
    });
  });

  it("handles empty phone field", async () => {
    mockContactMessageCreate.mockResolvedValue({
      id: "msg-123",
      phone: null,
    });

    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        phone: "",
        subject: "general",
        message: "This is a test message that is long enough",
        consent: true,
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mockContactMessageCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        phone: null,
      }),
    });
  });

  it("returns 500 on database error", async () => {
    mockContactMessageCreate.mockRejectedValue(new Error("Database error"));

    const request = createMockRequest("/api/contact", {
      method: "POST",
      body: {
        name: "Test User",
        email: "test@example.com",
        subject: "general",
        message: "This is a test message that is long enough",
        consent: true,
      },
    });

    const response = await POST(request);
    const data = await parseResponse<{ error: string }>(response);

    expect(response.status).toBe(500);
    expect(data.error).toContain("Fehler aufgetreten");
  });
});
