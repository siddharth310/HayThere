/** Human-readable summary of a stored answer for tables and lists. */

export function summarizeAnswerValue(valueJson: string | null): string {
  if (!valueJson?.trim()) return "—";
  try {
    const v = JSON.parse(valueJson) as Record<string, unknown>;
    const kind = v.kind as string | undefined;

    if (kind === "dropdown" && typeof v.value === "string") {
      return v.value;
    }
    if (kind === "checkbox" && Array.isArray(v.value)) {
      return v.value.join(", ");
    }
    if (kind === "text" && typeof v.value === "string") {
      return v.value || "(empty)";
    }
    if (kind === "audio") {
      const en = typeof v.transcriptEn === "string" ? v.transcriptEn : "";
      const raw = typeof v.transcriptRaw === "string" ? v.transcriptRaw : "";
      return en || raw || JSON.stringify(v.structured ?? {});
    }

    if (typeof v.transcriptEn === "string" && v.transcriptEn) {
      const base =
        kind === "dropdown" && typeof v.value === "string"
          ? v.value
          : kind === "checkbox" && Array.isArray(v.value)
            ? v.value.join(", ")
            : kind === "text" && typeof v.value === "string"
              ? v.value
              : "";
      if (base) return `${base} · ${v.transcriptEn}`;
      return v.transcriptEn;
    }
    if (typeof v.transcriptRaw === "string" && v.transcriptRaw) {
      return v.transcriptRaw;
    }

    return JSON.stringify(v);
  } catch {
    return valueJson.slice(0, 500);
  }
}

export type AnswerValueDisplay =
  | { kind: "empty" }
  | { kind: "number"; display: string }
  | { kind: "text"; display: string };

export type NumericAnswerDisplay =
  | { kind: "empty" }
  | { kind: "number"; display: string };

/** Value column: prefer numeric when the answer is clearly a number, else text. */
export function extractAnswerValueDisplay(
  valueJson: string | null,
): AnswerValueDisplay {
  if (!valueJson?.trim()) return { kind: "empty" };

  try {
    const v = JSON.parse(valueJson) as Record<string, unknown>;
    const kind = v.kind as string | undefined;

    const asNumberOrText = (s: string): AnswerValueDisplay => {
      const n = tryParseNumber(s);
      if (n !== null) {
        return { kind: "number", display: formatNum(n) };
      }
      return { kind: "text", display: s };
    };

    if (kind === "dropdown" && typeof v.value === "string") {
      return asNumberOrText(v.value);
    }

    if (kind === "checkbox" && Array.isArray(v.value)) {
      const parts = v.value.map(String);
      if (parts.length === 1) {
        return asNumberOrText(parts[0]!);
      }
      return { kind: "text", display: parts.join(", ") };
    }

    if (kind === "text" && typeof v.value === "string") {
      const raw = v.value.trim();
      if (raw) {
        return asNumberOrText(raw);
      }
      const t =
        typeof v.transcriptEn === "string"
          ? v.transcriptEn
          : typeof v.transcriptRaw === "string"
            ? v.transcriptRaw
            : "";
      if (t.trim()) {
        return classifyTranscript(t);
      }
      return { kind: "empty" };
    }

    if (kind === "audio") {
      const en = typeof v.transcriptEn === "string" ? v.transcriptEn : "";
      const raw = typeof v.transcriptRaw === "string" ? v.transcriptRaw : "";
      const text = (en || raw).trim();
      if (text) {
        return classifyTranscript(text);
      }
      const st = v.structured;
      if (st && typeof st === "object" && st !== null) {
        const o = st as Record<string, unknown>;
        const t2 =
          typeof o.text === "string"
            ? o.text
            : typeof o.selectedText === "string"
              ? o.selectedText
              : "";
        if (t2.trim()) {
          return classifyTranscript(t2);
        }
      }
      return { kind: "empty" };
    }

    if (typeof v.transcriptEn === "string" && v.transcriptEn) {
      const base =
        kind === "dropdown" && typeof v.value === "string"
          ? v.value
          : kind === "checkbox" && Array.isArray(v.value)
            ? v.value.join(", ")
            : kind === "text" && typeof v.value === "string"
              ? v.value
              : "";
      if (base.trim()) {
        return asNumberOrText(base.trim());
      }
      return classifyTranscript(v.transcriptEn);
    }

    if (typeof v.transcriptRaw === "string" && v.transcriptRaw) {
      return classifyTranscript(v.transcriptRaw);
    }

    return { kind: "text", display: JSON.stringify(v) };
  } catch {
    return { kind: "text", display: valueJson.slice(0, 500) };
  }
}

/** Numeric column: extract any number mentioned in typed values or transcripts. */
export function extractNumericAnswerDisplay(
  valueJson: string | null,
): NumericAnswerDisplay {
  if (!valueJson?.trim()) return { kind: "empty" };

  try {
    const v = JSON.parse(valueJson) as Record<string, unknown>;
    const candidates = collectAnswerTextCandidates(v);
    const values = candidates.flatMap(extractNumbersFromText);
    const unique = [...new Set(values.map(formatNum))];

    return unique.length
      ? { kind: "number", display: unique.join(", ") }
      : { kind: "empty" };
  } catch {
    const values = extractNumbersFromText(valueJson);
    return values.length
      ? { kind: "number", display: [...new Set(values.map(formatNum))].join(", ") }
      : { kind: "empty" };
  }
}

function classifyTranscript(text: string): AnswerValueDisplay {
  const t = text.trim();
  if (!t) return { kind: "empty" };
  const n = tryParseNumber(t);
  if (n !== null) {
    return { kind: "number", display: formatNum(n) };
  }
  return { kind: "text", display: t };
}

function tryParseNumber(s: string): number | null {
  const t = s.trim().replace(/,/g, "");
  if (!t) return null;
  if (/^-?\d+(?:\.\d+)?$/.test(t)) {
    return Number(t);
  }
  return null;
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
}

function collectAnswerTextCandidates(v: Record<string, unknown>): string[] {
  const candidates: string[] = [];
  const kind = v.kind as string | undefined;

  if (
    (kind === "dropdown" || kind === "text") &&
    typeof v.value === "string"
  ) {
    candidates.push(v.value);
  }

  if (kind === "checkbox" && Array.isArray(v.value)) {
    candidates.push(...v.value.map(String));
  }

  if (typeof v.transcriptEn === "string") candidates.push(v.transcriptEn);
  if (typeof v.transcriptRaw === "string") candidates.push(v.transcriptRaw);

  const structured = v.structured;
  if (structured && typeof structured === "object") {
    const o = structured as Record<string, unknown>;
    if (typeof o.text === "string") candidates.push(o.text);
    if (typeof o.selectedText === "string") candidates.push(o.selectedText);
  }

  return candidates.map((s) => s.trim()).filter(Boolean);
}

function extractNumbersFromText(text: string): number[] {
  const values: number[] = [];
  const digitMatches = text.matchAll(/[-+]?\d[\d,]*(?:\.\d+)?/g);

  for (const match of digitMatches) {
    const n = tryParseNumber(match[0]);
    if (n !== null) values.push(n);
  }

  values.push(...extractEnglishWordNumbers(text));
  return values;
}

function extractEnglishWordNumbers(text: string): number[] {
  const words = text
    .toLowerCase()
    .replace(/-/g, " ")
    .match(/[a-z]+/g);

  if (!words) return [];

  const values: number[] = [];
  let current: string[] = [];

  for (const word of words) {
    if (isNumberWord(word)) {
      current.push(word);
      continue;
    }

    if (current.length) {
      const parsed = parseEnglishNumberWords(current);
      if (parsed !== null) values.push(parsed);
      current = [];
    }
  }

  if (current.length) {
    const parsed = parseEnglishNumberWords(current);
    if (parsed !== null) values.push(parsed);
  }

  return values;
}

const SMALL_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const SCALES: Record<string, number> = {
  hundred: 100,
  thousand: 1000,
  million: 1000000,
};

function isNumberWord(word: string): boolean {
  return (
    word === "and" ||
    word in SMALL_NUMBERS ||
    word in TENS ||
    word in SCALES
  );
}

function parseEnglishNumberWords(words: string[]): number | null {
  let total = 0;
  let group = 0;
  let sawValue = false;

  for (const word of words) {
    if (word === "and") continue;

    if (word in SMALL_NUMBERS) {
      group += SMALL_NUMBERS[word]!;
      sawValue = true;
      continue;
    }

    if (word in TENS) {
      group += TENS[word]!;
      sawValue = true;
      continue;
    }

    if (word === "hundred") {
      group = (group || 1) * 100;
      sawValue = true;
      continue;
    }

    if (word === "thousand" || word === "million") {
      total += (group || 1) * SCALES[word]!;
      group = 0;
      sawValue = true;
    }
  }

  if (!sawValue) return null;
  return total + group;
}
