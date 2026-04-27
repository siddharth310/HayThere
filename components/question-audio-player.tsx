"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { bcp47ForSpeechLocale } from "@/lib/locales";

type Props = {
  /** e.g. `/api/uploads/...` when a published TTS file exists. */
  fileSrc: string | null;
  /** Shown in the UI and read aloud if there is no `fileSrc`. */
  readAloudText: string;
  /** Survey locale (e.g. en, hi) for speech synthesis language. */
  locale: string;
  className?: string;
};

/**
 * Plays the question TTS (MP3) with a large tap target, or reads the prompt with the
 * browser’s speech engine when no audio file is available yet.
 */
export function QuestionAudioPlayer({
  fileSrc,
  readAloudText,
  locale,
  className = "",
}: Props) {
  const clientId = useId();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [filePlaying, setFilePlaying] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setHydrated(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const canSpeak =
    hydrated &&
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    readAloudText.trim().length > 0;

  const stopSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeechActive(false);
  }, []);

  const stopFile = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
    setFilePlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setFilePlaying(true);
    const onPause = () => setFilePlaying(false);
    const onEnded = () => setFilePlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, [fileSrc]);

  const toggleFile = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      stopSpeech();
      void el.play().catch(() => {
        setFilePlaying(false);
      });
    } else {
      el.pause();
    }
  }, [stopSpeech]);

  const toggleSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speechActive) {
      stopSpeech();
      return;
    }
    stopFile();
    const u = new SpeechSynthesisUtterance(readAloudText);
    u.lang = bcp47ForSpeechLocale(locale);
    u.onend = () => {
      setSpeechActive(false);
    };
    u.onerror = () => {
      setSpeechActive(false);
    };
    setSpeechActive(true);
    window.speechSynthesis.speak(u);
  }, [readAloudText, locale, speechActive, stopFile, stopSpeech]);

  if (fileSrc) {
    return (
      <div
        className={`flex flex-col gap-3 rounded-xl border border-sky-200/80 bg-sky-50/90 p-3 sm:flex-row sm:flex-wrap sm:items-center ${className}`}
      >
        <button
          type="button"
          onClick={toggleFile}
          aria-pressed={filePlaying}
          aria-controls={`${clientId}-q-audio`}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-sky-700 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-500"
        >
          <SpeakerIcon className="h-5 w-5" aria-hidden />
          {filePlaying ? "Pause" : "Listen to question"}
        </button>
        <audio
          id={`${clientId}-q-audio`}
          ref={audioRef}
          className="h-9 w-full min-w-0 sm:max-w-md sm:flex-1"
          controls
          playsInline
          preload="metadata"
          src={fileSrc}
        />
      </div>
    );
  }

  if (canSpeak) {
    return (
      <div
        className={`flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 p-3 sm:flex-row sm:items-center sm:gap-3 ${className}`}
      >
        <button
          type="button"
          onClick={toggleSpeech}
          aria-pressed={speechActive}
          className="inline-flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center gap-2 rounded-full border border-amber-300 bg-white px-5 py-3 text-sm font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-amber-500"
        >
          <SpeakerIcon className="h-5 w-5" aria-hidden />
          {speechActive ? "Stop" : "Read question aloud"}
        </button>
      </div>
    );
  }

  return null;
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}
