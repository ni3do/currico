import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { httpRequestErrors } from "./metrics";

/**
 * Drop-in replacement for console.error that also reports to Sentry.
 * Use in API catch blocks: `captureError("Error doing X:", error)`
 */
export function captureError(message: string, error: unknown) {
  console.error(message, error);
  Sentry.captureException(error instanceof Error ? error : new Error(message));
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown, context: { route: string; method: string }) {
  // Report to Sentry
  Sentry.withScope((scope) => {
    scope.setTag("route", context.route);
    scope.setTag("method", context.method);
    Sentry.captureException(error);
  });

  // Increment error metric
  httpRequestErrors.inc({
    method: context.method,
    route: context.route,
    error_type: error instanceof ApiError ? "api_error" : "unknown_error",
  });

  // Log to console
  console.error(`[${context.method}] ${context.route}:`, error);

  // Return appropriate response
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
