import fs from "node:fs/promises";
import path from "node:path";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export async function ensureUploadRoot() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
}

/** Relative path under uploads/, e.g. responses/uuid.webm */
export async function saveAudioBuffer(
  buffer: Buffer,
  ext: string,
): Promise<string> {
  await ensureUploadRoot();
  const name = `${crypto.randomUUID()}${ext}`;
  const rel = path.join("responses", name);
  const full = path.join(UPLOAD_ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buffer);
  return rel.replace(/\\/g, "/");
}

/** Relative path under uploads/, e.g. questions/uuid.mp3 */
export async function saveQuestionAudioBuffer(
  buffer: Buffer,
  ext: string,
): Promise<string> {
  await ensureUploadRoot();
  const name = `${crypto.randomUUID()}${ext}`;
  const rel = path.join("questions", name);
  const full = path.join(UPLOAD_ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buffer);
  return rel.replace(/\\/g, "/");
}

export function absoluteUploadPath(relative: string): string {
  return path.join(UPLOAD_ROOT, relative);
}
