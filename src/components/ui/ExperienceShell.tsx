"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { detectWebGLSupport, isFallbackForced } from "@/lib/webgl";
import FallbackView from "./FallbackView";

type ExperienceMode = "checking" | "webgl" | "fallback";

const InteractiveWorld = dynamic(() => import("./InteractiveWorld"), {
  ssr: false,
});

export default function ExperienceShell() {
  const [mode, setMode] = useState<ExperienceMode>("checking");

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      if (isFallbackForced() || !detectWebGLSupport()) {
        setMode("fallback");
      } else {
        setMode("webgl");
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleWebGLUnavailable = useCallback(() => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    setMode("fallback");
  }, []);

  if (mode === "fallback") {
    return <FallbackView />;
  }

  if (mode === "checking") {
    return <div className="min-h-dvh w-full bg-background" />;
  }

  return <InteractiveWorld onWebGLUnavailable={handleWebGLUnavailable} />;
}
