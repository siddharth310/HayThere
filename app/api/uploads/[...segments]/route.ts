import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { UPLOAD_ROOT } from "@/lib/uploads";

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

  const rel = path.join(...segments);
  const full = path.join(UPLOAD_ROOT, rel);
  const resolved = path.resolve(full);
  const root = path.resolve(UPLOAD_ROOT);
  if (!resolved.startsWith(root)) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  try {
    const buf = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const type =
      ext === ".webm"
        ? "audio/webm"
        : ext === ".mp3"
          ? "audio/mpeg"
          : ext === ".wav"
            ? "audio/wav"
            : ext === ".m4a"
              ? "audio/mp4"
              : "application/octet-stream";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
