"use client";

import Link from "next/link";
import { AsciiFrame } from "@/components/ui/AsciiFrame";
import { OutlinedButton } from "@/components/ui/OutlinedButton";
import { OUTLINED_BUTTON_CLASS } from "@/lib/interactive";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  void error;

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-6 py-12 text-ink">
      <div className="w-full max-w-lg">
        <AsciiFrame label="ERROR">
          <div className="flex flex-col items-start gap-4">
            <h1 className="font-mono text-2xl font-bold tracking-[0.18em] text-ink uppercase sm:text-3xl">
              SOMETHING WENT WRONG
            </h1>
            <p className="font-sans text-sm leading-relaxed text-muted">
              An unexpected error interrupted rendering.
            </p>
            <div className="flex flex-wrap gap-3">
              <OutlinedButton label="TRY AGAIN" onClick={() => reset()} />
              <Link href="/" className={OUTLINED_BUTTON_CLASS}>
                BACK TO START
              </Link>
            </div>
          </div>
        </AsciiFrame>
      </div>
    </main>
  );
}
