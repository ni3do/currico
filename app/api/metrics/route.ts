import { NextResponse } from "next/server";
import { register } from "@/lib/metrics";
import { requireAdmin, unauthorizedResponse } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return unauthorizedResponse();

  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: { "Content-Type": register.contentType },
  });
}

export const dynamic = "force-dynamic";
