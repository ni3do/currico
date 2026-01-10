import { NextRequest, NextResponse } from "next/server";

// TODO: Add Report model to Prisma schema to enable this functionality
// For now, return empty data

export async function GET(request: NextRequest) {
  // Stub: Report model not yet implemented
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  return NextResponse.json({
    reports: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  });
}

export async function PATCH(request: NextRequest) {
  // Stub: Report model not yet implemented
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Report ID is required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: "Report functionality not yet implemented" },
    { status: 501 }
  );
}
