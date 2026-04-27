import { NextResponse } from "next/server";
import { readUploadBuffer } from "@/lib/uploads";

/** Serve stored audio files for playback in the portal (local dev). */
export async function GET(
  _req: Request,
  context: { params: Promise<{ segments: string[] }> },
) {
  const { segments } = await context.params;
  if (
    !segments?.length ||
    (segments[0] !== "responses" && segments[0] !== "questions")
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rel = segments.join("/");
  const upload = await readUploadBuffer(rel);
  if (!upload) return new NextResponse("Not found", { status: 404 });

  const body = new Uint8Array(upload.buffer);
  return new NextResponse(body, {
    headers: {
      "Content-Type": upload.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
