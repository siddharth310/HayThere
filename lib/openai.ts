import OpenAI from "openai";
import { saveQuestionAudioBuffer } from "@/lib/uploads";
import type { LocaleCode } from "./locales";

function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set.");
  }
  return new OpenAI({ apiKey: key });
}

const LOCALE_NAMES: Record<LocaleCode, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  bn: "Bengali",
  or: "Odia",
};

/** Translate question prompt and options from English into target locale. */
export async function translateQuestion(
  prompt: string,
  options: string[] | null,
  targetLocale: LocaleCode,
): Promise<{ prompt: string; options: string[] | null }> {
  if (targetLocale === "en") {
    return { prompt, options };
  }

  const client = getClient();
  const lang = LOCALE_NAMES[targetLocale];

  const payload = {
    prompt,
    options: options ?? [],
  };

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You translate survey content to ${lang}. Preserve meaning and tone. Return JSON only with keys: prompt (string), options (array of strings, same length as input options). If options is empty, return options as [].`,
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
  });

  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("Empty translation response");

  const parsed = JSON.parse(text) as {
    prompt: string;
    options: string[];
  };

  return {
    prompt: parsed.prompt,
    options:
      options && options.length > 0
        ? parsed.options?.slice(0, options.length) ?? options
        : null,
  };
}

/** Translate English transcript to English (pass-through) or to locale name — here we translate to English from any language for display. */
export async function translateToEnglish(
  text: string,
  sourceLocale: string,
): Promise<string> {
  if (!text.trim()) return "";
  if (sourceLocale === "en") return text;

  const client = getClient();
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Translate the user's survey answer into clear English. Return only the translation, no quotes.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? text;
}

/** OpenAI TTS → MP3 file under uploads/questions/. */
export async function synthesizeSpeechToMp3Path(text: string): Promise<string> {
  const trimmed = text.trim().slice(0, 4096);
  if (!trimmed) {
    throw new Error("Empty text for speech synthesis.");
  }
  const client = getClient();
  const mp3 = await client.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: trimmed,
  });
  const buf = Buffer.from(await mp3.arrayBuffer());
  return saveQuestionAudioBuffer(buf, ".mp3");
}

export async function transcribeAudio(
  filePath: string,
  _mimeType: string,
): Promise<string> {
  const client = getClient();
  const fs = await import("node:fs");

  const tr = await client.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
  });

  return tr.text?.trim() ?? "";
}
