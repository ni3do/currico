import { NextRequest } from "next/server";
import { vi } from "vitest";

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = "GET", body, headers = {}, searchParams = {} } = options;

  // Build URL with search params
  const baseUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  const urlObj = new URL(baseUrl);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  const requestInit: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    requestInit.body = JSON.stringify(body);
  }

  return new NextRequest(urlObj, requestInit);
}

/**
 * Parse JSON response from NextResponse
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

/**
 * Create mock form data for file uploads
 */
export function createMockFormData(data: Record<string, string | Blob>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

/**
 * Create route params object for Next.js 16 (params are a Promise)
 */
export function createRouteParams<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

/**
 * Set getCurrentUserId mock to return the given userId (authenticated)
 */
export async function mockAuthenticated(userId: string) {
  const { getCurrentUserId } = await import("@/lib/auth");
  (getCurrentUserId as ReturnType<typeof vi.fn>).mockResolvedValue(userId);
}

/**
 * Set getCurrentUserId mock to return null (unauthenticated)
 */
export async function mockUnauthenticated() {
  const { getCurrentUserId } = await import("@/lib/auth");
  (getCurrentUserId as ReturnType<typeof vi.fn>).mockResolvedValue(null);
}
