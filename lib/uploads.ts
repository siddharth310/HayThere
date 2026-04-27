import fs from "node:fs/promises";
import path from "node:path";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const s3Bucket = process.env.S3_UPLOAD_BUCKET || process.env.AWS_S3_BUCKET;
const s3Region =
  process.env.S3_UPLOAD_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

let s3Client: S3Client | null = null;

function getS3Client() {
  if (!s3Bucket) return null;
  if (!s3Client) {
    s3Client = new S3Client(s3Region ? { region: s3Region } : {});
  }
  return s3Client;
}

export async function ensureUploadRoot() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true });
}

export function isS3UploadStorageEnabled(): boolean {
  return Boolean(s3Bucket);
}

/** Relative path under uploads/, e.g. responses/uuid.webm */
export async function saveAudioBuffer(
  buffer: Buffer,
  ext: string,
): Promise<string> {
  const name = `${crypto.randomUUID()}${ext}`;
  return saveUploadBuffer(buffer, "responses", name, contentTypeForExt(ext));
}

/** Relative path under uploads/, e.g. questions/uuid.mp3 */
export async function saveQuestionAudioBuffer(
  buffer: Buffer,
  ext: string,
): Promise<string> {
  const name = `${crypto.randomUUID()}${ext}`;
  return saveUploadBuffer(buffer, "questions", name, contentTypeForExt(ext));
}

async function saveUploadBuffer(
  buffer: Buffer,
  dir: "questions" | "responses",
  name: string,
  contentType: string,
): Promise<string> {
  const rel = `${dir}/${name}`;
  const s3 = getS3Client();
  if (s3 && s3Bucket) {
    await s3.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: rel,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return rel;
  }

  await ensureUploadRoot();
  const full = path.join(UPLOAD_ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buffer);
  return rel;
}

export function absoluteUploadPath(relative: string): string {
  return path.join(UPLOAD_ROOT, relative);
}

export async function readUploadBuffer(relative: string): Promise<{
  buffer: Buffer;
  contentType: string;
} | null> {
  const clean = normalizeUploadPath(relative);
  if (!clean) return null;

  const s3 = getS3Client();
  if (s3 && s3Bucket) {
    try {
      const obj = await s3.send(
        new GetObjectCommand({
          Bucket: s3Bucket,
          Key: clean,
        }),
      );
      if (!obj.Body) return null;
      const bytes = await obj.Body.transformToByteArray();
      return {
        buffer: Buffer.from(bytes),
        contentType: obj.ContentType || contentTypeForPath(clean),
      };
    } catch {
      return null;
    }
  }

  const full = path.join(UPLOAD_ROOT, clean);
  const resolved = path.resolve(full);
  const root = path.resolve(UPLOAD_ROOT);
  if (!resolved.startsWith(root)) return null;

  try {
    return {
      buffer: await fs.readFile(resolved),
      contentType: contentTypeForPath(resolved),
    };
  } catch {
    return null;
  }
}

function normalizeUploadPath(relative: string): string | null {
  const cleaned = relative.replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (
    parts.length !== 2 ||
    (parts[0] !== "responses" && parts[0] !== "questions") ||
    parts[1].includes("..")
  ) {
    return null;
  }
  return `${parts[0]}/${parts[1]}`;
}

function contentTypeForPath(p: string): string {
  return contentTypeForExt(path.extname(p).toLowerCase());
}

function contentTypeForExt(ext: string): string {
  if (ext === ".webm") return "audio/webm";
  if (ext === ".mp3") return "audio/mpeg";
  if (ext === ".wav") return "audio/wav";
  if (ext === ".m4a" || ext === ".mp4") return "audio/mp4";
  return "application/octet-stream";
}
