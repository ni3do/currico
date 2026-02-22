import { registerOTel } from "@vercel/otel";
import { validateEnv } from "@/lib/env-validation";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    validateEnv();

    registerOTel({
      serviceName: process.env.OTEL_SERVICE_NAME || "currico",
    });
  }
}
