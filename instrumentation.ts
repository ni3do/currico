import { registerOTel } from "@vercel/otel";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerOTel({
      serviceName: process.env.OTEL_SERVICE_NAME || "currico",
    });
  }
}
