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
