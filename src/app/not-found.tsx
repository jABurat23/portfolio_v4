import type { Metadata } from "next";
import Link from "next/link";
import { AsciiFrame } from "@/components/ui/AsciiFrame";
import { OUTLINED_BUTTON_CLASS } from "@/lib/interactive";

export const metadata: Metadata = {
  title: "Page not found | Agustin",
};

export default function NotFound() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-6 py-12 text-ink">
      <div className="w-full max-w-lg">
        <AsciiFrame label="404">
          <div className="flex flex-col items-start gap-4">
            <h1 className="font-mono text-2xl font-bold tracking-[0.18em] text-ink uppercase sm:text-3xl">
              PAGE NOT FOUND
            </h1>
            <p className="font-sans text-sm leading-relaxed text-muted">
              The route you requested does not exist.
            </p>
            <Link href="/" className={OUTLINED_BUTTON_CLASS}>
              BACK TO START
            </Link>
          </div>
        </AsciiFrame>
      </div>
    </main>
  );
}
