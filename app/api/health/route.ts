import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "haythere",
    timestamp: new Date().toISOString(),
  });
}
